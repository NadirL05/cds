import { prisma } from "@/lib/prisma";
import { getTestUserId } from "@/lib/constants";
import { ProfileFormClient } from "./profile-form-client";

export default async function ProfilePage() {
  const userId = await getTestUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      homeStudio: true,
    },
  });

  if (!user || !user.profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <ProfileFormClient
      userId={userId}
      initialData={{
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        goals: user.profile.goals,
        medicalNotes: user.profile.medicalNotes || "",
      }}
    />
  );
}
