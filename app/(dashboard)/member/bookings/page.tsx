import { prisma } from "@/lib/prisma";
import { getTestUserId } from "@/lib/constants";
import { getUserBookings } from "@/app/actions/member-actions";
import { MyBookingsClient } from "./my-bookings-client";

export default async function MyBookingsPage() {
  const userId = await getTestUserId();
  const bookings = await getUserBookings(userId);

  // Split bookings into upcoming and history
  const now = new Date();
  const upcoming = bookings.filter(
    (booking) =>
      new Date(booking.startTime) >= now &&
      booking.status === "CONFIRMED"
  );
  const history = bookings.filter(
    (booking) =>
      new Date(booking.startTime) < now ||
      booking.status !== "CONFIRMED"
  );

  return (
    <MyBookingsClient
      upcomingBookings={upcoming}
      historyBookings={history}
      userId={userId}
    />
  );
}
