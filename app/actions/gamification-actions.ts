"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { startOfDay, subDays } from "date-fns";
import { getUserIdOrRedirect } from "@/lib/auth-helpers";

const POINTS_PER_ACTION = 10;

/**
 * Normalize a date to midnight (start of day) for comparison.
 */
function toMidnight(d: Date): Date {
  return startOfDay(d);
}

/**
 * Validate a daily action (sport or nutrition) and award points + update streak.
 */
export async function validateDailyAction(
  userId: string,
  actionType: "SPORT" | "NUTRITION"
): Promise<
  { success: true; pointsAdded: number; newStreak: number } | { success: false; error: string }
> {
  try {
    const sessionUserId = await getUserIdOrRedirect();
    if (sessionUserId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: {
        id: true,
        currentStreak: true,
        longestStreak: true,
        totalPoints: true,
        lastCheckInDate: true,
      },
    });

    if (!profile) {
      return { success: false, error: "Profil non trouvé" };
    }

    const today = toMidnight(new Date());
    const lastCheckIn = profile.lastCheckInDate
      ? toMidnight(profile.lastCheckInDate)
      : null;
    const yesterday = subDays(today, 1);

    let newCurrentStreak = profile.currentStreak;
    const newTotalPoints = (profile.totalPoints ?? 0) + POINTS_PER_ACTION;
    let newLongestStreak = profile.longestStreak ?? 0;
    let newLastCheckInDate: Date = profile.lastCheckInDate ?? today;

    if (lastCheckIn !== null && lastCheckIn.getTime() === today.getTime()) {
      // Already checked in today: only add points, don't change streak or lastCheckInDate
      newLastCheckInDate = profile.lastCheckInDate!;
    } else {
      // Update streak and lastCheckInDate
      newLastCheckInDate = today;
      if (lastCheckIn === null || lastCheckIn < yesterday) {
        newCurrentStreak = 1;
      } else if (lastCheckIn.getTime() === yesterday.getTime()) {
        newCurrentStreak = profile.currentStreak + 1;
      }
      newLongestStreak =
        newCurrentStreak > newLongestStreak ? newCurrentStreak : newLongestStreak;
    }

    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        totalPoints: newTotalPoints,
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastCheckInDate: newLastCheckInDate,
      },
    });

    revalidatePath("/member");

    return {
      success: true,
      pointsAdded: POINTS_PER_ACTION,
      newStreak: newCurrentStreak,
    };
  } catch (error) {
    console.error("validateDailyAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}
