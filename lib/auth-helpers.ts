import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Get the current session and redirect to signin if not authenticated
 */
export async function getSessionOrRedirect() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }
  
  return session;
}

/**
 * Get the current user ID or redirect to signin
 */
export async function getUserIdOrRedirect(): Promise<string> {
  const session = await getSessionOrRedirect();
  return session.user.id;
}

