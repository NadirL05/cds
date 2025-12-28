"use client";

import { useState, useEffect } from "react";
import { format, addMinutes, getTime } from "date-fns";
import { getCoachSchedule, checkInUser } from "@/app/actions/coach-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { CoachBooking } from "@/app/actions/coach-actions";

interface CoachDashboardClientProps {
  studioId: string;
  coachName: string;
}

// Slot duration in minutes
const SLOT_DURATION_MINUTES = 20;
const OPENING_HOUR = 8;
const CLOSING_HOUR = 20;

interface TimeSlot {
  startTime: Date;
  endTime: Date;
  bookings: CoachBooking[];
  count: number;
}

export function CoachDashboardClient({
  studioId,
  coachName,
}: CoachDashboardClientProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlotTime, setSelectedSlotTime] = useState<Date | null>(null);
  const [bookings, setBookings] = useState<CoachBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // Load bookings when date changes
  useEffect(() => {
    loadSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studioId, selectedDate.toDateString()]);

  async function loadSchedule() {
    setLoading(true);
    try {
      const schedule = await getCoachSchedule(studioId, selectedDate);
      setBookings(schedule);
      
      // Set first slot as default if available and no slot is selected
      // Use schedule data to generate slots since bookings state might not be updated yet
      if (!selectedSlotTime) {
        const slots = generateTimeSlotsWithBookings(selectedDate, schedule);
        if (slots.length > 0) {
          // Find first slot with bookings, or use first slot
          const slotWithBookings = slots.find((s) => s.count > 0);
          setSelectedSlotTime(new Date(slotWithBookings?.startTime || slots[0].startTime));
        }
      }
    } catch (error) {
      console.error("Error loading schedule:", error);
      toast.error("Error loading schedule");
    } finally {
      setLoading(false);
    }
  }

  // Helper function to generate slots with bookings data
  function generateTimeSlotsWithBookings(date: Date, bookingsData: CoachBooking[]): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const baseDate = new Date(date);
    baseDate.setHours(0, 0, 0, 0);
    let currentTime = new Date(baseDate);
    currentTime.setHours(OPENING_HOUR, 0, 0, 0);

    while (currentTime.getHours() < CLOSING_HOUR) {
      const startTime = new Date(currentTime);
      const endTime = addMinutes(new Date(currentTime), SLOT_DURATION_MINUTES);

      // Filter bookings for this slot
      const slotBookings = bookingsData.filter((booking) => {
        const bookingStart = new Date(booking.startTime);
        return (
          bookingStart >= startTime &&
          bookingStart < endTime &&
          (booking.status === "CONFIRMED" || booking.status === "ATTENDED")
        );
      });

      slots.push({
        startTime,
        endTime,
        bookings: slotBookings,
        count: slotBookings.length,
      });

      currentTime = addMinutes(currentTime, SLOT_DURATION_MINUTES);
    }

    return slots;
  }

  // Generate all time slots for the day
  function generateTimeSlots(date: Date): TimeSlot[] {
    const slots: TimeSlot[] = [];
    let currentTime = new Date(date);
    currentTime.setHours(OPENING_HOUR, 0, 0, 0);

    while (currentTime.getHours() < CLOSING_HOUR) {
      const startTime = new Date(currentTime);
      const endTime = addMinutes(new Date(currentTime), SLOT_DURATION_MINUTES);

      // Filter bookings for this slot
      const slotBookings = bookings.filter((booking) => {
        const bookingStart = new Date(booking.startTime);
        return (
          bookingStart >= startTime &&
          bookingStart < endTime &&
          (booking.status === "CONFIRMED" || booking.status === "ATTENDED")
        );
      });

      slots.push({
        startTime,
        endTime,
        bookings: slotBookings,
        count: slotBookings.length,
      });

      currentTime = addMinutes(currentTime, SLOT_DURATION_MINUTES);
    }

    return slots;
  }

  async function handleCheckIn(bookingId: string) {
    try {
      const result = await checkInUser(bookingId);
      if (result.success) {
        toast.success("Check-in successful");
        await loadSchedule();
      } else {
        toast.error(result.error || "Error checking in");
      }
    } catch (error) {
      console.error("Error checking in:", error);
      toast.error("Error checking in");
    }
  }

  function getProgramColor(program: string | null): string {
    if (!program) return "bg-slate-100 text-slate-700";
    
    const programLower = program.toLowerCase();
    if (programLower.includes("metabolique") || programLower.includes("cardio")) {
      return "bg-blue-100 text-blue-700 border-blue-300";
    }
    if (programLower.includes("force") || programLower.includes("strength")) {
      return "bg-red-100 text-red-700 border-red-300";
    }
    if (programLower.includes("massage") || programLower.includes("recovery")) {
      return "bg-purple-100 text-purple-700 border-purple-300";
    }
    if (programLower.includes("endurance")) {
      return "bg-green-100 text-green-700 border-green-300";
    }
    return "bg-slate-100 text-slate-700 border-slate-300";
  }

  const timeSlots = generateTimeSlots(selectedDate);
  const selectedSlot = selectedSlotTime
    ? timeSlots.find((slot) => getTime(slot.startTime) === getTime(selectedSlotTime))
    : null;

  // Get bookings for selected slot
  const selectedBookings = selectedSlot?.bookings || [];
  
  // Create 6 pod slots (Sportec machines)
  const podSlots = Array.from({ length: 6 }, (_, index) => {
    return selectedBookings[index] || null;
  });

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
      {/* Left Column: Timeline */}
      <aside className="w-64 border-r border-slate-200 overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 pb-2 border-b border-slate-200 mb-2">
          <h2 className="text-lg font-semibold text-slate-900 px-2 py-2">
            Timeline
          </h2>
          <div className="px-2 mb-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                  setSelectedSlotTime(null); // Reset slot selection when date changes
                }
              }}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              className="rounded-md border"
            />
          </div>
        </div>
        <div className="space-y-1">
          {timeSlots.map((slot) => {
            const isSelected =
              selectedSlotTime &&
              getTime(slot.startTime) === getTime(selectedSlotTime);

            return (
              <button
                key={slot.startTime.toISOString()}
                onClick={() => setSelectedSlotTime(new Date(slot.startTime))}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md transition-colors",
                  isSelected
                    ? "bg-blue-100 text-blue-900 border border-blue-300"
                    : "hover:bg-slate-50 text-slate-700"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {format(slot.startTime, "HH:mm")}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      slot.count >= 6
                        ? "bg-red-100 text-red-700 border-red-300"
                        : slot.count > 0
                        ? "bg-blue-100 text-blue-700 border-blue-300"
                        : "bg-slate-100 text-slate-600 border-slate-300"
                    )}
                  >
                    {slot.count}/6 pax
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Right Column: Pods (6 Machines) */}
      <main className="flex-1 overflow-y-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900">
            {selectedSlotTime
              ? `${format(selectedSlotTime, "HH:mm")} Session`
              : "Select a time slot"}
          </h1>
          <p className="text-slate-600 mt-1">
            {coachName} • {selectedBookings.length}/6 machines occupied
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading schedule...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {podSlots.map((booking, index) => (
              <Card
                key={index}
                className={cn(
                  "min-h-[200px]",
                  booking
                    ? "border-slate-200 hover:border-blue-300"
                    : "border-slate-200 bg-slate-50"
                )}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Machine {index + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {booking ? (
                    <div className="space-y-3">
                      {/* User Info */}
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-slate-300">
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                            {booking.user.profile
                              ? `${booking.user.profile.firstName[0]}${booking.user.profile.lastName[0]}`
                              : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            {booking.user.profile
                              ? `${booking.user.profile.firstName} ${booking.user.profile.lastName}`
                              : booking.user.email}
                          </p>
                          {booking.user.profile?.goals && booking.user.profile.goals.length > 0 && (
                            <p className="text-xs text-slate-600 truncate">
                              Goal: {booking.user.profile.goals[0]}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Program Badge */}
                      {booking.programUsed && (
                        <Badge
                          variant="outline"
                          className={cn("w-full justify-center", getProgramColor(booking.programUsed))}
                        >
                          {booking.programUsed}
                        </Badge>
                      )}

                      {/* Check-in Button */}
                      <Button
                        onClick={() => handleCheckIn(booking.id)}
                        disabled={booking.status === "ATTENDED"}
                        className={cn(
                          "w-full",
                          booking.status === "ATTENDED"
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        )}
                        size="sm"
                      >
                        {booking.status === "ATTENDED" ? "✓ Checked In" : "Check-in"}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                      <p className="text-sm font-medium">Empty Machine</p>
                      <p className="text-xs mt-1">Available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
