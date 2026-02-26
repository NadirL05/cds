import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;

  if (!sessionId) {
    redirect("/");
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const type = session.metadata?.type;

      if (type === "DROP_IN") {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } else {
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;

        if (userId && plan) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionStatus: "active",
              plan: plan,
              ...(customerId ? { stripeCustomerId: customerId } : {}),
            },
          });
        }
      }
    }
  } catch (error) {
    console.error("Payment verification error:", error);
  }

  redirect("/member?success=true");
}
