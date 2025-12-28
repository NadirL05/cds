"use server";

import { prisma } from "@/lib/prisma";

// Slot duration in minutes
const SLOT_DURATION_MINUTES = 20;

// Studio opening hours
const OPENING_HOUR = 8;
const CLOSING_HOUR = 20;

export interface AvailableSlot {
  startTime: Date;
  endTime: Date;
  capacity: number;
  bookedCount: number;
  isFull: boolean;
  availableSpots: number;
}

/**
 * Get available time slots for a studio on a specific date
 * Slots are every 20 minutes from 08:00 to 20:00
 */
export async function getAvailableSlots(
  studioId: string,
  date: Date
): Promise<AvailableSlot[]> {
  try {
    // Normalize date to start of day (00:00:00)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    // Get studio to access maxCapacityPerSlot
    const studio = await prisma.studio.findUnique({
      where: { id: studioId },
    });

    if (!studio) {
      throw new Error("Studio not found");
    }

    // Get all bookings for this studio on this date
    const bookings = await prisma.booking.findMany({
      where: {
        studioId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: "CONFIRMED", // Only count confirmed bookings
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // Generate all possible slots for the day (every 20 minutes from 08:00 to 20:00)
    const slots: AvailableSlot[] = [];
    const slotStart = new Date(startOfDay);
    slotStart.setHours(OPENING_HOUR, 0, 0, 0);

    while (slotStart.getHours() < CLOSING_HOUR) {
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + SLOT_DURATION_MINUTES);

      // Count bookings that overlap with this slot
      // A booking overlaps if:
      // - booking.startTime < slotEnd AND booking.endTime > slotStart
      const overlappingBookings = bookings.filter((booking) => {
        const bookingStart = new Date(booking.startTime);
        const bookingEnd = new Date(booking.endTime);
        return bookingStart < slotEnd && bookingEnd > slotStart;
      });

      const bookedCount = overlappingBookings.length;
      const isFull = bookedCount >= studio.maxCapacityPerSlot;
      const availableSpots = Math.max(0, studio.maxCapacityPerSlot - bookedCount);

      slots.push({
        startTime: new Date(slotStart),
        endTime: new Date(slotEnd),
        capacity: studio.maxCapacityPerSlot,
        bookedCount,
        isFull,
        availableSpots,
      });

      // Move to next slot (add 20 minutes)
      slotStart.setMinutes(slotStart.getMinutes() + SLOT_DURATION_MINUTES);
    }

    return slots;
  } catch (error) {
    console.error("Error getting available slots:", error);
    throw error;
  }
}

/**
 * Book a time slot for a user
 * Includes validation and transactional capacity check
 */
export async function bookSlot(
  userId: string,
  studioId: string,
  startTime: Date,
  program: string
): Promise<{ success: boolean; bookingId?: string; error?: string }> {
  try {
    // Validate inputs
    if (!userId || !studioId || !startTime || !program) {
      return {
        success: false,
        error: "Missing required fields",
      };
    }

    // Calculate end time (20 minutes after start)
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + SLOT_DURATION_MINUTES);

    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check if user already has a booking at this time
      const existingUserBooking = await tx.booking.findFirst({
        where: {
          userId,
          startTime: {
            lte: endTime,
          },
          endTime: {
            gte: startTime,
          },
          status: "CONFIRMED",
        },
      });

      if (existingUserBooking) {
        throw new Error("User already has a booking at this time");
      }

      // 2. Get studio to access maxCapacityPerSlot
      const studio = await tx.studio.findUnique({
        where: { id: studioId },
      });

      if (!studio) {
        throw new Error("Studio not found");
      }

      // 3. Count existing bookings for this slot
      const overlappingBookings = await tx.booking.count({
        where: {
          studioId,
          startTime: {
            lte: endTime,
          },
          endTime: {
            gte: startTime,
          },
          status: "CONFIRMED",
        },
      });

      // 4. Check capacity constraint (Sportec: max 6 per slot)
      if (overlappingBookings >= studio.maxCapacityPerSlot) {
        throw new Error("Slot is full");
      }

      // 5. Create the booking
      const booking = await tx.booking.create({
        data: {
          studioId,
          userId,
          startTime,
          endTime,
          status: "CONFIRMED",
          programUsed: program,
        },
      });

      return booking;
    });

    return {
      success: true,
      bookingId: result.id,
    };
  } catch (error) {
    console.error("Error booking slot:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: errorMessage,
    };
  }
}
