import { prisma } from "@/lib/prisma";
import { getUserIdOrRedirect } from "@/lib/auth-helpers";
import { MemberDashboardClient } from "./member-dashboard-client";
import { PaymentStatusHandler } from "@/components/payment-status";
import { Suspense } from "react";

export default async function MemberDashboardPage() {
  // Get authenticated user
  const userId = await getUserIdOrRedirect();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  // Get the first studio (or user's home studio)
  const studio = await prisma.studio.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!user || !user.profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Utilisateur non trouvé</p>
      </div>
    );
  }

  if (!studio) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Aucun studio trouvé</p>
      </div>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <PaymentStatusHandler />
      </Suspense>
      <MemberDashboardClient
        userName={`${user.profile.firstName} ${user.profile.lastName}`}
        studioId={studio.id}
        studioName={studio.name}
        userId={userId}
        userPlan={user.plan}
      />
    </>
  );
}