"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
