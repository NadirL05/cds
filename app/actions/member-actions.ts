"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { endOfWeek, startOfWeek } from "date-fns";

export interface UserBooking {
  id: string;
  startTime: Date;
  endTime: Date;
  status: string;
  programUsed: string | null;
  studio: {
    id: string;
    name: string;
    city: string;
  };
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  goals?: string[];
  medicalNotes?: string | null;
  height?: number | null;
  weight?: number | null;
  gender?: string | null;
  birthDate?: Date | null;
}

export interface MemberStats {
  bmi: number | null;
  bmiCategory: string | null;
  sessionsThisWeek: number;
  weight: number | null;
  height: number | null;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
}

/**
 * Get all bookings for a user
 * Includes studio relation for display
 */
export async function getUserBookings(
  userId: string
): Promise<UserBooking[]> {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId,
      },
      include: {
        studio: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });

    return bookings.map((booking: {
      id: string;
      startTime: Date;
      endTime: Date;
      status: string;
      programUsed: string | null;
      studio: {
        id: string;
        name: string;
        city: string;
      };
    }) => ({
      id: booking.id,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      programUsed: booking.programUsed,
      studio: {
        id: booking.studio.id,
        name: booking.studio.name,
        city: booking.studio.city,
      },
    }));
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    throw error;
  }
}

/**
 * Get health & activity stats for a member
 */
export async function getMemberStats(userId: string): Promise<MemberStats> {
  try {
    // Fetch profile data for BMI and gamification
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: {
        height: true,
        weight: true,
        currentStreak: true,
        longestStreak: true,
        totalPoints: true,
      },
    });

    let bmi: number | null = null;
    let bmiCategory: string | null = null;
    const height = profile?.height ?? null;
    const weight = profile?.weight ?? null;

    if (height && height > 0 && weight) {
      const rawBmi = weight / Math.pow(height / 100, 2);
      bmi = Math.round(rawBmi * 10) / 10;

      if (rawBmi < 18.5) {
        bmiCategory = "Maigreur";
      } else if (rawBmi < 25) {
        bmiCategory = "Normal";
      } else if (rawBmi < 30) {
        bmiCategory = "Surpoids";
      } else {
        bmiCategory = "Obésité";
      }
    }

    // Weekly sessions (Monday -> Sunday)
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const sessionsThisWeek = await prisma.booking.count({
      where: {
        userId,
        status: {
          in: ["CONFIRMED", "ATTENDED"],
        },
        startTime: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    });

    return {
      bmi,
      bmiCategory,
      sessionsThisWeek,
      weight,
      height,
      currentStreak: profile?.currentStreak ?? 0,
      longestStreak: profile?.longestStreak ?? 0,
      totalPoints: profile?.totalPoints ?? 0,
    };
  } catch (error) {
    console.error("Error fetching member stats:", error);
    return {
      bmi: null,
      bmiCategory: null,
      sessionsThisWeek: 0,
      weight: null,
      height: null,
      currentStreak: 0,
      longestStreak: 0,
      totalPoints: 0,
    };
  }
}

/**
 * Cancel a booking by deleting it
 * Security check: ensures booking belongs to user
 */
export async function cancelBooking(
  bookingId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Security check: verify booking belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { userId: true, status: true },
    });

    if (!booking) {
      return {
        success: false,
        error: "Booking not found",
      };
    }

    if (booking.userId !== userId) {
      return {
        success: false,
        error: "Unauthorized: This booking does not belong to you",
      };
    }

    // Don't allow canceling already attended bookings
    if (booking.status === "ATTENDED") {
      return {
        success: false,
        error: "Cannot cancel an attended booking",
      };
    }

    // Delete the booking record
    await prisma.booking.delete({
      where: { id: bookingId },
    });

    // Revalidate relevant paths
    revalidatePath("/member/bookings");
    revalidatePath("/member");

    return { success: true };
  } catch (error) {
    console.error("Error cancelling booking:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  data: UpdateProfileData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if user exists and has a profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    if (!user.profile) {
      return {
        success: false,
        error: "Profile not found",
      };
    }

    // Update profile
    await prisma.profile.update({
      where: { userId },
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.goals !== undefined && { goals: data.goals }),
        ...(data.medicalNotes !== undefined && { medicalNotes: data.medicalNotes }),
        ...(data.height !== undefined && { height: data.height }),
        ...(data.weight !== undefined && { weight: data.weight }),
        ...(data.gender !== undefined && { gender: data.gender }),
        ...(data.birthDate !== undefined && { birthDate: data.birthDate }),
      },
    });

    // Revalidate paths
    revalidatePath("/member/profile");
    revalidatePath("/member");

    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get subscription details for a user
 */
export interface SubscriptionDetails {
  plan: string | null;
  status: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  trialEndsAt: Date | null;
  sessionsUsedThisMonth: number;
  maxSessionsPerMonth: number | null;
}

export async function getSubscriptionDetails(
  userId: string
): Promise<SubscriptionDetails> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        subscriptionStatus: true,
        subscription: {
          select: {
            stripeSubscriptionId: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            trialEndsAt: true,
            status: true,
          },
        },
      },
    });

    // Count sessions used this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const sessionsUsedThisMonth = await prisma.booking.count({
      where: {
        userId,
        status: {
          in: ["CONFIRMED", "ATTENDED", "COMPLETED"],
        },
        startTime: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Determine max sessions based on plan
    let maxSessionsPerMonth: number | null = null;
    if (user?.plan === "essential") {
      maxSessionsPerMonth = 4;
    } else if (user?.plan === "premium") {
      maxSessionsPerMonth = 8;
    } else if (user?.plan === "unlimited") {
      maxSessionsPerMonth = null; // Unlimited
    }

    return {
      plan: user?.plan || null,
      status: user?.subscriptionStatus || user?.subscription?.status || null,
      stripeSubscriptionId: user?.subscription?.stripeSubscriptionId || null,
      currentPeriodStart: user?.subscription?.currentPeriodStart || null,
      currentPeriodEnd: user?.subscription?.currentPeriodEnd || null,
      trialEndsAt: user?.subscription?.trialEndsAt || null,
      sessionsUsedThisMonth,
      maxSessionsPerMonth,
    };
  } catch (error) {
    console.error("Error fetching subscription details:", error);
    return {
      plan: null,
      status: null,
      stripeSubscriptionId: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      trialEndsAt: null,
      sessionsUsedThisMonth: 0,
      maxSessionsPerMonth: null,
    };
  }
}

/**
 * Get coaching preferences for sports program
 */
export interface SportsProgramData {
  goal: string | null;
  level: string | null;
  frequency: string | null;
  profile: {
    firstName: string;
    goals: string[];
    weight: number | null;
    height: number | null;
  } | null;
  recentSessions: {
    id: string;
    date: Date;
    programUsed: string | null;
    intensityLog: unknown;
  }[];
}

export async function getSportsProgramData(
  userId: string
): Promise<SportsProgramData> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        profile: {
          select: {
            firstName: true,
            goals: true,
            weight: true,
            height: true,
          },
        },
        coachingPreferences: {
          select: {
            goal: true,
            level: true,
            frequency: true,
          },
        },
      },
    });

    // Get recent completed sessions
    const recentSessions = await prisma.booking.findMany({
      where: {
        userId,
        status: {
          in: ["ATTENDED", "COMPLETED"],
        },
      },
      select: {
        id: true,
        startTime: true,
        programUsed: true,
        intensityLog: true,
      },
      orderBy: {
        startTime: "desc",
      },
      take: 10,
    });

    return {
      goal: user?.coachingPreferences?.goal || null,
      level: user?.coachingPreferences?.level || null,
      frequency: user?.coachingPreferences?.frequency || null,
      profile: user?.profile || null,
      recentSessions: recentSessions.map((s) => ({
        id: s.id,
        date: s.startTime,
        programUsed: s.programUsed,
        intensityLog: s.intensityLog,
      })),
    };
  } catch (error) {
    console.error("Error fetching sports program data:", error);
    return {
      goal: null,
      level: null,
      frequency: null,
      profile: null,
      recentSessions: [],
    };
  }
}

/**
 * Get nutrition program data
 */
export interface NutritionProgramData {
  eatsMeat: boolean | null;
  eatsFish: boolean | null;
  eatsEggs: boolean | null;
  veggies: string[];
  starches: string[];
  drinks: string[];
  dietaryRestrictions: string | null;
  profile: {
    weight: number | null;
    height: number | null;
    goals: string[];
  } | null;
  goal: string | null;
}

export async function getNutritionProgramData(
  userId: string
): Promise<NutritionProgramData> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        profile: {
          select: {
            weight: true,
            height: true,
            goals: true,
          },
        },
        coachingPreferences: {
          select: {
            goal: true,
            eatsMeat: true,
            eatsFish: true,
            eatsEggs: true,
            veggies: true,
            starches: true,
            drinks: true,
            dietaryRestrictions: true,
          },
        },
      },
    });

    return {
      eatsMeat: user?.coachingPreferences?.eatsMeat ?? null,
      eatsFish: user?.coachingPreferences?.eatsFish ?? null,
      eatsEggs: user?.coachingPreferences?.eatsEggs ?? null,
      veggies: user?.coachingPreferences?.veggies || [],
      starches: user?.coachingPreferences?.starches || [],
      drinks: user?.coachingPreferences?.drinks || [],
      dietaryRestrictions:
        user?.coachingPreferences?.dietaryRestrictions || null,
      profile: user?.profile || null,
      goal: user?.coachingPreferences?.goal || null,
    };
  } catch (error) {
    console.error("Error fetching nutrition program data:", error);
    return {
      eatsMeat: null,
      eatsFish: null,
      eatsEggs: null,
      veggies: [],
      starches: [],
      drinks: [],
      dietaryRestrictions: null,
      profile: null,
      goal: null,
    };
  }
}

/**
 * Get booking history with stats
 */
export interface BookingHistoryData {
  totalSessions: number;
  sessionsThisMonth: number;
  sessionsLastMonth: number;
  averageSessionsPerWeek: number;
  mostUsedProgram: string | null;
  bookings: {
    id: string;
    startTime: Date;
    endTime: Date;
    status: string;
    programUsed: string | null;
    studioName: string;
  }[];
}

export async function getBookingHistory(
  userId: string
): Promise<BookingHistoryData> {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get all bookings
    const bookings = await prisma.booking.findMany({
      where: {
        userId,
      },
      include: {
        studio: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });

    const totalSessions = bookings.filter((b) =>
      ["ATTENDED", "COMPLETED", "CONFIRMED"].includes(b.status)
    ).length;

    const sessionsThisMonth = bookings.filter(
      (b) =>
        ["ATTENDED", "COMPLETED", "CONFIRMED"].includes(b.status) &&
        b.startTime >= startOfThisMonth
    ).length;

    const sessionsLastMonth = bookings.filter(
      (b) =>
        ["ATTENDED", "COMPLETED", "CONFIRMED"].includes(b.status) &&
        b.startTime >= startOfLastMonth &&
        b.startTime <= endOfLastMonth
    ).length;

    // Calculate average sessions per week (based on account age)
    const firstBooking = bookings[bookings.length - 1];
    let averageSessionsPerWeek = 0;
    if (firstBooking) {
      const weeksSinceFirstBooking = Math.max(
        1,
        Math.ceil(
          (now.getTime() - new Date(firstBooking.startTime).getTime()) /
            (7 * 24 * 60 * 60 * 1000)
        )
      );
      averageSessionsPerWeek =
        Math.round((totalSessions / weeksSinceFirstBooking) * 10) / 10;
    }

    // Find most used program
    const programCounts = bookings.reduce((acc, b) => {
      if (b.programUsed) {
        acc[b.programUsed] = (acc[b.programUsed] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const mostUsedProgram =
      Object.entries(programCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    return {
      totalSessions,
      sessionsThisMonth,
      sessionsLastMonth,
      averageSessionsPerWeek,
      mostUsedProgram,
      bookings: bookings.map((b) => ({
        id: b.id,
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status,
        programUsed: b.programUsed,
        studioName: b.studio.name,
      })),
    };
  } catch (error) {
    console.error("Error fetching booking history:", error);
    return {
      totalSessions: 0,
      sessionsThisMonth: 0,
      sessionsLastMonth: 0,
      averageSessionsPerWeek: 0,
      mostUsedProgram: null,
      bookings: [],
    };
  }
}
