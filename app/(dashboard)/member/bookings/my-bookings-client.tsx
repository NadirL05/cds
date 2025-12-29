"use client";

import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cancelBooking } from "@/app/actions/booking-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { UserBooking } from "@/app/actions/member-actions";

interface MyBookingsClientProps {
  upcomingBookings: UserBooking[];
  historyBookings: UserBooking[];
  userId: string;
}

export function MyBookingsClient({
  upcomingBookings,
  historyBookings,
  userId,
}: MyBookingsClientProps) {
  const router = useRouter();

  async function handleCancel(bookingId: string) {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      const result = await cancelBooking(bookingId);
      if (result.success) {
        toast.success("Booking cancelled successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Error cancelling booking");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Error cancelling booking");
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "ATTENDED":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-300">
            Attended
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-300">
            Cancelled
          </Badge>
        );
      case "CONFIRMED":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-300">
            Confirmed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-700">
            {status}
          </Badge>
        );
    }
  }

  function BookingCard({ booking, showCancel = false }: { booking: UserBooking; showCancel?: boolean }) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">
                {format(new Date(booking.startTime), "EEEE, MMMM d, yyyy")}
              </CardTitle>
              <CardDescription className="mt-1">
                {format(new Date(booking.startTime), "HH:mm")} - {format(new Date(booking.endTime), "HH:mm")}
              </CardDescription>
            </div>
            {getStatusBadge(booking.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-slate-900">Studio</p>
              <p className="text-sm text-slate-600">{booking.studio.name}</p>
            </div>
            {booking.programUsed && (
              <div>
                <p className="text-sm font-medium text-slate-900">Program</p>
                <Badge variant="outline" className="mt-1">
                  {booking.programUsed}
                </Badge>
              </div>
            )}
            {showCancel && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleCancel(booking.id)}
                className="w-full mt-4"
              >
                Cancel Booking
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          My Bookings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your upcoming sessions and view your booking history
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            History ({historyBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No upcoming bookings. Book a session from the dashboard.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} showCancel />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {historyBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No booking history yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {historyBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
