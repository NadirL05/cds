import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resend } from "@/lib/resend";
import { WelcomeEmail } from "@/components/emails/welcome-email";
import { render } from "@react-email/render";
import React from "react";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRole = (session.user as any).role;
  if (userRole !== "SUPER_ADMIN" && userRole !== "FRANCHISE_OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { email, firstName, planName } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Render the React email component to HTML
    const emailHtml = await render(
      React.createElement(WelcomeEmail, {
        firstName: firstName || undefined,
        planName: planName || "DIGITAL",
      }) as React.ReactElement
    );

    // Send email via Resend
    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Bienvenue chez CDS Sport !",
      html: emailHtml,
    });

    if (result.error) {
      throw new Error(result.error.message || "Failed to send email");
    }

    return NextResponse.json({
      success: true,
      messageId: result.data?.id,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json(
      {
        error: "Failed to send email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

