import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/member";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if user exists in our database
      const existingUser = await prisma.user.findUnique({
        where: { email: data.user.email! },
      });

      if (!existingUser) {
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
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return to sign-in page if error
  return NextResponse.redirect(`${origin}/auth/signin?error=oauth_error`);
}
