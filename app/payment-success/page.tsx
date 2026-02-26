import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Plan name lookup by Stripe price ID
const PRICE_TO_PLAN: Record<string, string> = {
  price_1SdvdGR10ndhFPOHdMv6q2SI: "DIGITAL",
  price_1SdvbIR10ndhFPOH3VV4dDou: "ZAPOY",
  price_1SjQPwR10ndhFPOHxE9kkWsS: "COACHING",
};

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect("/subscribe");
  }

  // Verify the session with Stripe
  const checkoutSession = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ["subscription", "line_items.data.price"],
  });

  if (checkoutSession.payment_status !== "paid" && checkoutSession.status !== "complete") {
    redirect("/subscribe?error=payment_failed");
  }

  // Get the user ID — from metadata (most reliable) or from current session
  let userId = checkoutSession.metadata?.userId;

  if (!userId) {
    const session = await getServerSession(authOptions);
    userId = (session?.user as any)?.id;
  }

  if (!userId) {
    redirect("/auth/signin");
  }

  // Determine the plan from the price ID
  const priceId =
    (checkoutSession.line_items as any)?.data?.[0]?.price?.id ?? "";
  const plan = PRICE_TO_PLAN[priceId] ?? checkoutSession.metadata?.plan ?? null;

  // Sync subscription status to DB (idempotent — safe to run multiple times)
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: "active",
      ...(plan ? { plan } : {}),
    },
  });

  // Also upsert the Subscription record if a Stripe subscription was created
  const stripeSubscription = checkoutSession.subscription as any;
  if (stripeSubscription?.id) {
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: priceId || null,
        status: stripeSubscription.status ?? "active",
        currentPeriodStart: stripeSubscription.current_period_start
          ? new Date(stripeSubscription.current_period_start * 1000)
          : null,
        currentPeriodEnd: stripeSubscription.current_period_end
          ? new Date(stripeSubscription.current_period_end * 1000)
          : null,
      },
      update: {
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: priceId || null,
        status: stripeSubscription.status ?? "active",
        currentPeriodStart: stripeSubscription.current_period_start
          ? new Date(stripeSubscription.current_period_start * 1000)
          : null,
        currentPeriodEnd: stripeSubscription.current_period_end
          ? new Date(stripeSubscription.current_period_end * 1000)
          : null,
      },
    });
  }

  redirect("/member?success=true");
}
