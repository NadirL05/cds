"use server";

import { prisma } from "@/lib/prisma";

export interface StudioMember {
  id: string;
  email: string;
  plan: string | null;
  subscriptionStatus: string | null;
  createdAt: Date;
  firstName: string;
  lastName: string;
}

/**
 * Get all members registered to the admin's studio
 */
export async function getStudioMembers(
  adminUserId: string
): Promise<StudioMember[]> {
  try {
    // 1. Fetch the admin user to get their homeStudioId
    const adminUser = await prisma.user.findUnique({
      where: { id: adminUserId },
      select: { homeStudioId: true },
    });

    if (!adminUser?.homeStudioId) {
      throw new Error("Admin user does not have a home studio assigned");
    }

    // 2. Query all members with matching homeStudioId
    const members = await prisma.user.findMany({
      where: {
        role: "MEMBER",
        homeStudioId: adminUser.homeStudioId,
      },
      include: {
        profile: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 3. Map to return format
    return members.map((member) => ({
      id: member.id,
      email: member.email,
      plan: member.plan,
      subscriptionStatus: member.subscriptionStatus,
      createdAt: member.createdAt,
      firstName: member.profile?.firstName || "N/A",
      lastName: member.profile?.lastName || "N/A",
    }));
  } catch (error) {
    console.error("Error fetching studio members:", error);
    throw error;
  }
}

