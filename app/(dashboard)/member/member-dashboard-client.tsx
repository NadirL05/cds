"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { BookingSlots } from "@/components/booking/booking-slots";
import { DateSelector } from "./date-selector";

interface MemberDashboardClientProps {
  userName: string;
  studioId: string;
  studioName: string;
  userId: string;
}

export function MemberDashboardClient({
  userName,
  studioId,
  studioName,
  userId,
}: MemberDashboardClientProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Hello {userName.split(" ")[0]}
        </h1>
        <p className="text-slate-600 mt-2">
          Book your EMS session at {studioName}
        </p>
      </div>

      {/* Date Picker and Slots Grid */}
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* Calendar Card */}
        <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

        {/* Slots Grid */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Available Slots
            </h2>
            <p className="text-slate-600 mt-1">
              {format(selectedDate, "EEEE, MMMM d, yyyy", { locale: fr })}
            </p>
          </div>
          <BookingSlots studioId={studioId} date={selectedDate} userId={userId} />
        </div>
      </div>
    </div>
  );
}
