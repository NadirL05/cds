import { NextRequest, NextResponse } from "next/server";
import { stripe, getStripeWebhookSecret } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { WelcomeEmail } from "@/components/emails/welcome-email";
import { render } from "@react-email/render";
import Stripe from "stripe";
import React from "react";

// Disable body parsing, we need the raw body for signature verification
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Get the raw body as text for signature verification
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const webhookSecret = getStripeWebhookSecret();

    let event: Stripe.Event;

    try {
      // Verify the webhook signature
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const type = session.metadata?.type;

      // Flux Drop-in (paiement ponctuel)
      if (type === "DROP_IN") {
        const userId = session.metadata?.userId;
        const studioId = session.metadata?.studioId;
        const startTimeIso = session.metadata?.startTime;

        if (!userId || !studioId || !startTimeIso) {
          console.error("Missing DROP_IN metadata in checkout session:", {
            userId,
            studioId,
            startTimeIso,
          });
          return NextResponse.json(
            { error: "Missing DROP_IN metadata in checkout session" },
            { status: 400 }
          );
        }

        try {
          const startTime = new Date(startTimeIso);
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + 20);

          await prisma.booking.create({
            data: {
              userId,
              studioId,
              startTime,
              endTime,
              status: "CONFIRMED",
              programUsed: "Drop-in",
            },
          });

          console.log(
            `✅ Drop-in booking created for user ${userId} at ${startTime.toISOString()}`
          );
        } catch (dbError) {
          console.error("Error creating Drop-in booking:", dbError);
          return NextResponse.json(
            { error: "Failed to create Drop-in booking" },
            { status: 500 }
          );
        }
      } else {
        // Flux abonnement (subscription) existant
        // Extract metadata
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;

        if (!userId || !plan || !customerId) {
          console.error("Missing required data in checkout session:", {
            userId,
            plan,
            customerId,
          });
          return NextResponse.json(
            { error: "Missing required metadata in checkout session" },
            { status: 400 }
          );
        }

        try {
          // Update user in database
          const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
              stripeCustomerId: customerId,
              plan: plan,
              subscriptionStatus: "active",
            },
            include: {
              profile: true,
            },
          });

          console.log(
            `✅ Subscription activated for user ${userId} with plan ${plan}`
          );

          // Send welcome email
          try {
            const userEmail =
              session.customer_details?.email || updatedUser.email;
            const firstName = updatedUser.profile?.firstName;

            if (userEmail) {
              // Render the React email component to HTML
              const emailHtml = await render(
                React.createElement(WelcomeEmail, {
                  firstName: firstName || undefined,
                  planName: plan,
                })
              );

              await resend.emails.send({
                from: "onboarding@resend.dev",
                to: userEmail,
                subject: "Bienvenue chez CDS Sport !",
                html: emailHtml
              });

              console.log(`✅ Welcome email sent to ${userEmail}`);
            } else {
              console.warn("⚠️ No email found to send welcome email");
            }
          } catch (emailError) {
            // Log error but don't fail the webhook
            console.error("Error sending welcome email:", emailError);
          }
        } catch (dbError) {
          console.error("Error updating user subscription:", dbError);
          return NextResponse.json(
            { error: "Failed to update user subscription" },
            { status: 500 }
          );
        }
      }
    }

    // Return success response
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

