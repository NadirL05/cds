import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const next = searchParams.get("next") ?? "/member";

  console.log("=== OAuth Callback Debug ===");
  console.log("Origin:", origin);
  console.log("Code present:", !!code);
  console.log("Error:", error);
  console.log("SUPABASE_URL set:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("SUPABASE_ANON_KEY set:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  console.log("SUPABASE_ANON_KEY length:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length);

  // Handle OAuth errors from provider
  if (error) {
    console.error("OAuth error from provider:", error, errorDescription);
    return NextResponse.redirect(
      `${origin}/auth/signin?error=${encodeURIComponent(error)}&message=${encodeURIComponent(errorDescription || "")}`
    );
  }

  if (code) {
    try {
      const supabase = await createClient();
      
      console.log("Attempting code exchange...");
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("Code exchange error:", exchangeError.message);
        console.error("Full error:", JSON.stringify(exchangeError));
        return NextResponse.redirect(
          `${origin}/auth/signin?error=exchange_error&message=${encodeURIComponent(exchangeError.message)}`
        );
      }

      console.log("Code exchange successful, user:", data.user?.email);

      if (data.user) {
        // Check if user exists in our database
        const existingUser = await prisma.user.findUnique({
          where: { email: data.user.email! },
        });

        if (!existingUser) {
          console.log("Creating new user in database...");
          // Create user in our database for OAuth users
          const nameParts = data.user.user_metadata?.full_name?.split(" ") || [];
          const firstName = nameParts[0] || data.user.email?.split("@")[0] || "User";
          const lastName = nameParts.slice(1).join(" ") || "";

          await prisma.user.create({
            data: {
              id: data.user.id,
              email: data.user.email!,
              role: "MEMBER",
              profile: {
                create: {
                  firstName,
                  lastName,
                  goals: [],
                },
              },
            },
          });
          console.log("User created successfully");
        } else {
          console.log("User already exists in database");
        }

        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch (err) {
      console.error("Callback error:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.redirect(
        `${origin}/auth/signin?error=callback_error&message=${encodeURIComponent(message)}`
      );
    }
  }

  // No code provided
  return NextResponse.redirect(`${origin}/auth/signin?error=no_code`);
}
