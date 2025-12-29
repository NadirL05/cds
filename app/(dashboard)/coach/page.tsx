import { prisma } from "@/lib/prisma";
import { getUserIdOrRedirect } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { CoachScheduleClient } from "./coach-schedule-client";

export default async function CoachDashboardPage() {
  // Get authenticated user
  const userId = await getUserIdOrRedirect();

  // Check user role and security
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  // Security check: Only COACH, FRANCHISE_OWNER, or SUPER_ADMIN can access
  if (!user || (user.role !== "COACH" && user.role !== "FRANCHISE_OWNER" && user.role !== "SUPER_ADMIN")) {
    redirect("/member");
  }

  return <CoachScheduleClient />;
}
