import { prisma } from "@/lib/prisma";
import { getUserIdOrRedirect } from "@/lib/auth-helpers";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default async function OnboardingPage() {
  const userId = await getUserIdOrRedirect();

  // Get existing profile data if available
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  const initialData = user?.profile
    ? {
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
      }
    : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Bienvenue chez{" "}
            <span className="text-[#ff5500]">CDS Sport</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Complétez votre profil pour recevoir un programme d'entraînement et de nutrition 100% personnalisé.
          </p>
        </div>

        {/* Wizard */}
        <OnboardingWizard userId={userId} initialData={initialData} />
      </div>
    </div>
  );
}
