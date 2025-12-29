import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { WelcomeEmail } from "@/components/emails/welcome-email";
import { render } from "@react-email/render";
import React from "react";

export async function POST(request: NextRequest) {
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

