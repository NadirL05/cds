"use server";

import { redirect } from "next/navigation";
import { stripe, getOrCreateStripeCustomer } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getUserIdOrRedirect } from "@/lib/auth-helpers";

// Price ID mapping
const PRICE_IDS = {
  DIGITAL: "price_1SdvdGR10ndhFPOHdMv6q2SI",
  ZAPOY: "price_1SdvbIR10ndhFPOH3VV4dDou",
  COACHING: "price_1SjQPwR10ndhFPOHxE9kkWsS",
} as const;

type PlanName = keyof typeof PRICE_IDS;

export async function createCheckoutSession(planName: string) {
  try {
    // Validate plan name
    if (!(planName in PRICE_IDS)) {
      throw new Error(`Invalid plan name: ${planName}`);
    }

    const priceId = PRICE_IDS[planName as PlanName];

    // Get authenticated user (redirects to signin if not logged in)
    const userId = await getUserIdOrRedirect();

    // Get user data including email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, stripeCustomerId: true },
    });

    if (!user?.email) {
      redirect("/auth/signin");
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(userId, user.email);

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/member?success=true`,
      cancel_url: `${baseUrl}/?canceled=true`,
      metadata: {
        userId: userId,
        plan: planName,
      },
    });

    if (!session.url) {
      throw new Error("Failed to create checkout session");
    }

    // Redirect to Stripe Checkout
    redirect(session.url);
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}
