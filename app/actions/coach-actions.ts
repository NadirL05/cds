"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUserIdOrRedirect } from "@/lib/auth-helpers";

export interface CoachBooking {
  id: string;
  startTime: Date;
  endTime: Date;
  status: string;
  programUsed: string | null;
  user: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      goals: string[];
    } | null;
  };
}

/**
 * Get all bookings for a studio on a specific date
 * Includes user and profile relations for display
 */
export async function getCoachSchedule(
  studioId: string,
  date: Date
): Promise<CoachBooking[]> {
  try {
    // Normalize date to start of day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await prisma.booking.findMany({
      where: {
        studioId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ["CONFIRMED", "ATTENDED"],
        },
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return bookings.map((booking: {
      id: string;
      startTime: Date;
      endTime: Date;
      status: string;
      programUsed: string | null;
      user: {
        id: string;
        email: string;
        profile: {
          firstName: string;
          lastName: string;
          goals: string[];
        } | null;
      };
    }) => ({
      id: booking.id,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      programUsed: booking.programUsed,
      user: {
        id: booking.user.id,
        email: booking.user.email,
        profile: booking.user.profile
          ? {
              firstName: booking.user.profile.firstName,
              lastName: booking.user.profile.lastName,
              goals: booking.user.profile.goals,
            }
          : null,
      },
    }));
  } catch (error) {
    console.error("Error fetching coach schedule:", error);
    throw error;
  }
}

/**
 * Get daily schedule for coaches
 * Security: Only COACH, FRANCHISE_OWNER, or SUPER_ADMIN can access
 */
export async function getDailySchedule(date: Date) {
  try {
    // Get current user ID
    const userId = await getUserIdOrRedirect();

    // Check user role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || (user.role !== "COACH" && user.role !== "FRANCHISE_OWNER" && user.role !== "SUPER_ADMIN")) {
      throw new Error("Unauthorized");
    }

    // Normalize date to start of day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch bookings for the specified date
    const bookings = await prisma.booking.findMany({
      where: {
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    // Map and return bookings with user information
    return bookings.map((booking) => ({
      id: booking.id,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      programUsed: booking.programUsed,
      user: {
        id: booking.user.id,
        email: booking.user.email,
        firstName: booking.user.profile?.firstName || "N/A",
        lastName: booking.user.profile?.lastName || "N/A",
        plan: booking.user.plan,
      },
    }));
  } catch (error) {
    console.error("Error fetching daily schedule:", error);
    throw error;
  }
}

/**
 * Check-in a user (mark booking as ATTENDED)
 */
export async function checkInUser(
  bookingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "ATTENDED" },
    });

    // Revalidate the coach dashboard page
    revalidatePath("/coach");

    return { success: true };
  } catch (error) {
    console.error("Error checking in user:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: errorMessage,
    };
  }
}
