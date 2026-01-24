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

export interface AdminDashboardStats {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  totalBookingsToday: number;
  totalBookingsThisWeek: number;
  totalCoaches: number;
  revenueThisMonth: number;
  memberGrowthPercentage: number;
}

export interface StudioBooking {
  id: string;
  startTime: Date;
  endTime: Date;
  status: string;
  programUsed: string | null;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface Coach {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  bookingsCount: number;
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

/**
 * Get admin dashboard statistics
 */
export async function getAdminDashboardStats(
  adminUserId: string
): Promise<AdminDashboardStats> {
  try {
    const adminUser = await prisma.user.findUnique({
      where: { id: adminUserId },
      select: { homeStudioId: true },
    });

    if (!adminUser?.homeStudioId) {
      throw new Error("Admin user does not have a home studio assigned");
    }

    const studioId = adminUser.homeStudioId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Get total members
    const totalMembers = await prisma.user.count({
      where: {
        role: "MEMBER",
        homeStudioId: studioId,
      },
    });

    // Get active members (with active subscription)
    const activeMembers = await prisma.user.count({
      where: {
        role: "MEMBER",
        homeStudioId: studioId,
        subscriptionStatus: "active",
      },
    });

    // Get new members this month
    const newMembersThisMonth = await prisma.user.count({
      where: {
        role: "MEMBER",
        homeStudioId: studioId,
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Get new members last month (for growth calculation)
    const newMembersLastMonth = await prisma.user.count({
      where: {
        role: "MEMBER",
        homeStudioId: studioId,
        createdAt: {
          gte: startOfLastMonth,
          lt: startOfMonth,
        },
      },
    });

    // Get bookings today
    const totalBookingsToday = await prisma.booking.count({
      where: {
        studioId: studioId,
        startTime: {
          gte: startOfDay,
        },
      },
    });

    // Get bookings this week
    const totalBookingsThisWeek = await prisma.booking.count({
      where: {
        studioId: studioId,
        startTime: {
          gte: startOfWeek,
        },
      },
    });

    // Get total coaches
    const totalCoaches = await prisma.user.count({
      where: {
        role: "COACH",
        homeStudioId: studioId,
      },
    });

    // Calculate member growth percentage
    const memberGrowthPercentage =
      newMembersLastMonth > 0
        ? Math.round(
            ((newMembersThisMonth - newMembersLastMonth) / newMembersLastMonth) *
              100
          )
        : newMembersThisMonth > 0
        ? 100
        : 0;

    return {
      totalMembers,
      activeMembers,
      newMembersThisMonth,
      totalBookingsToday,
      totalBookingsThisWeek,
      totalCoaches,
      revenueThisMonth: 0, // Would need Stripe integration
      memberGrowthPercentage,
    };
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    throw error;
  }
}

/**
 * Get all bookings for the admin's studio
 */
export async function getStudioBookings(
  adminUserId: string,
  options?: {
    startDate?: Date;
    endDate?: Date;
    status?: string;
  }
): Promise<StudioBooking[]> {
  try {
    const adminUser = await prisma.user.findUnique({
      where: { id: adminUserId },
      select: { homeStudioId: true },
    });

    if (!adminUser?.homeStudioId) {
      throw new Error("Admin user does not have a home studio assigned");
    }

    const whereClause: {
      studioId: string;
      startTime?: { gte?: Date; lte?: Date };
      status?: string;
    } = {
      studioId: adminUser.homeStudioId,
    };

    if (options?.startDate || options?.endDate) {
      whereClause.startTime = {};
      if (options.startDate) {
        whereClause.startTime.gte = options.startDate;
      }
      if (options.endDate) {
        whereClause.startTime.lte = options.endDate;
      }
    }

    if (options?.status) {
      whereClause.status = options.status;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
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
      },
    }));
  } catch (error) {
    console.error("Error fetching studio bookings:", error);
    throw error;
  }
}

/**
 * Get all coaches for the admin's studio
 */
export async function getStudioCoaches(adminUserId: string): Promise<Coach[]> {
  try {
    const adminUser = await prisma.user.findUnique({
      where: { id: adminUserId },
      select: { homeStudioId: true },
    });

    if (!adminUser?.homeStudioId) {
      throw new Error("Admin user does not have a home studio assigned");
    }

    const coaches = await prisma.user.findMany({
      where: {
        role: "COACH",
        homeStudioId: adminUser.homeStudioId,
      },
      include: {
        profile: true,
        bookings: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return coaches.map((coach) => ({
      id: coach.id,
      email: coach.email,
      firstName: coach.profile?.firstName || "N/A",
      lastName: coach.profile?.lastName || "N/A",
      createdAt: coach.createdAt,
      bookingsCount: coach.bookings.length,
    }));
  } catch (error) {
    console.error("Error fetching studio coaches:", error);
    throw error;
  }
}

/**
 * Update a member's role
 */
export async function updateMemberRole(
  adminUserId: string,
  memberId: string,
  newRole: "MEMBER" | "COACH"
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminUser = await prisma.user.findUnique({
      where: { id: adminUserId },
      select: { homeStudioId: true, role: true },
    });

    if (!adminUser?.homeStudioId) {
      return { success: false, error: "Admin user does not have a home studio" };
    }

    // Verify the member belongs to the same studio
    const member = await prisma.user.findUnique({
      where: { id: memberId },
      select: { homeStudioId: true },
    });

    if (member?.homeStudioId !== adminUser.homeStudioId) {
      return { success: false, error: "Member does not belong to your studio" };
    }

    await prisma.user.update({
      where: { id: memberId },
      data: { role: newRole },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating member role:", error);
    return { success: false, error: "An error occurred" };
  }
}

/**
 * Cancel a booking
 */
export async function cancelBookingAdmin(
  adminUserId: string,
  bookingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminUser = await prisma.user.findUnique({
      where: { id: adminUserId },
      select: { homeStudioId: true },
    });

    if (!adminUser?.homeStudioId) {
      return { success: false, error: "Admin user does not have a home studio" };
    }

    // Verify the booking belongs to the admin's studio
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { studioId: true },
    });

    if (booking?.studioId !== adminUser.homeStudioId) {
      return { success: false, error: "Booking does not belong to your studio" };
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    return { success: true };
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return { success: false, error: "An error occurred" };
  }
}

/**
 * Get studio statistics for charts
 */
export async function getStudioStatistics(adminUserId: string) {
  try {
    const adminUser = await prisma.user.findUnique({
      where: { id: adminUserId },
      select: { homeStudioId: true },
    });

    if (!adminUser?.homeStudioId) {
      throw new Error("Admin user does not have a home studio assigned");
    }

    const studioId = adminUser.homeStudioId;
    const now = new Date();

    // Get bookings per day for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      return date;
    }).reverse();

    const bookingsPerDay = await Promise.all(
      last7Days.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const count = await prisma.booking.count({
          where: {
            studioId,
            startTime: {
              gte: date,
              lt: nextDay,
            },
          },
        });

        return {
          date: date.toISOString().split("T")[0],
          bookings: count,
        };
      })
    );

    // Get members per plan
    const membersPerPlan = await prisma.user.groupBy({
      by: ["plan"],
      where: {
        role: "MEMBER",
        homeStudioId: studioId,
      },
      _count: {
        id: true,
      },
    });

    return {
      bookingsPerDay,
      membersPerPlan: membersPerPlan.map((item) => ({
        plan: item.plan || "Aucun",
        count: item._count.id,
      })),
    };
  } catch (error) {
    console.error("Error fetching studio statistics:", error);
    throw error;
  }
}

