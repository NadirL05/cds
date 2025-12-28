import { prisma } from "@/lib/prisma";
import { CoachDashboardClient } from "./coach-dashboard-client";

export default async function CoachDashboardPage() {
  // Fetch the test coach
  const coachEmail = "coach1.paris@cds.fr";
  const coach = await prisma.user.findUnique({
    where: { email: coachEmail },
    include: {
      profile: true,
      homeStudio: true,
    },
  });

  if (!coach) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900">
            Coach not found
          </p>
          <p className="text-slate-600 mt-2">
            Please ensure the seed script has been run with email: {coachEmail}
          </p>
        </div>
      </div>
    );
  }

  if (!coach.homeStudioId || !coach.homeStudio) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900">
            Studio not assigned
          </p>
          <p className="text-slate-600 mt-2">
            This coach does not have a home studio assigned.
          </p>
        </div>
      </div>
    );
  }

  const coachName = coach.profile
    ? `${coach.profile.firstName} ${coach.profile.lastName}`
    : coach.email;

  return (
    <CoachDashboardClient
      studioId={coach.homeStudioId}
      coachName={coachName}
    />
  );
}
