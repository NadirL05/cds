"use server";

import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { getTestUserId } from "@/lib/constants";

// ⚠️ IMPORTANT : Si tu as Auth.js, remplace getTestUserId par la vraie session !
// import { auth } from "@/auth";

export async function createCheckoutSession(planName: string) {
  console.log("🛒 Starting checkout for plan:", planName);

  // 1. Récupération de l'utilisateur
  // Si tu utilises NextAuth, décommente les lignes suivantes :
  // const session = await auth();
  // const userId = session?.user?.id;

  // SINON (Mode Test avec Seed) :
  const userId = await getTestUserId();

  if (!userId) {
    console.error("❌ No user ID found! Cannot create checkout session.");
    throw new Error("You must be logged in to subscribe.");
  }

  console.log("👤 User ID identified:", userId);

  // 2. Sélection du Prix Stripe
  let priceId;
  switch (planName) {
    case "DIGITAL":
      priceId = "price_1SdvdGR10ndhFPOHdMv6q2SI";
      break;
    case "ZAPOY":
      priceId = "price_1SdvbIR10ndhFPOH3VV4dDou";
      break;
    case "COACHING":
      priceId = "price_1SjQPwR10ndhFPOHxE9kkWsS";
      break;
    default:
      console.error("❌ Invalid plan name:", planName);
      throw new Error("Invalid plan selected");
  }

  // 3. Création de la Session Stripe avec METADATA
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_URL}/member?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/?canceled=true`,
      // 👇 C'EST ICI QUE TOUT SE JOUE 👇
      metadata: {
        userId: userId, // Indispensable pour le Webhook
        plan: planName, // Indispensable pour le Webhook
      },
    });

    console.log("✅ Stripe Session created:", session.id);

    if (session.url) {
      redirect(session.url);
    }
  } catch (error) {
    console.error("❌ Stripe Error:", error);
    // On ne re-throw pas l'erreur pour éviter de crasher toute la page,
    // mais idéalement on devrait gérer l'erreur UI ici.
  }
}
