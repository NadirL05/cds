"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getDailySchedule } from "@/app/actions/coach-actions";
import { Card, CardContent } from "@/components/ui/card";
import { PlanBadge } from "@/components/plan-badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduleBooking {
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
    plan: string | null;
  };
}

export function CoachScheduleClient() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState<ScheduleBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSchedule() {
      try {
        setLoading(true);
        const dateToFetch = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
        const data = await getDailySchedule(dateToFetch);
        setBookings(data);
      } catch (error) {
        console.error("Error fetching schedule:", error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSchedule();
  }, [selectedDate]);

  const formatTime = (date: Date): string => {
    return format(date, "HH:mm");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coach Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Consultez vos sessions programmées
          </p>
        </div>
        
        {/* Date Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-[280px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, "PPP", { locale: fr })
              ) : (
                <span>Choisir une date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                }
              }}
              initialFocus
              locale={fr}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Schedule List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg font-semibold text-slate-900">
              Aucune session programmée
            </p>
            <p className="text-muted-foreground mt-2">
              Aucune session n'est prévue pour ce jour.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Left: Time */}
                  <div className="flex-shrink-0">
                    <div className="text-2xl font-bold text-slate-900">
                      {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                    </div>
                  </div>

                  {/* Middle: Client Name & Email */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900">
                      {booking.user.firstName} {booking.user.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {booking.user.email}
                    </div>
                  </div>

                  {/* Right: Plan Badge */}
                  <div className="flex-shrink-0">
                    <PlanBadge plan={booking.user.plan} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

