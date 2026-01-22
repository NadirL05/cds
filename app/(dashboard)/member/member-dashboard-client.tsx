"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { BookingSlots } from "@/components/booking/booking-slots";
import { DateSelector } from "./date-selector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlanBadge } from "@/components/plan-badge";
import { Smartphone } from "lucide-react";
import { PerformanceStats } from "@/components/member/performance-stats";
import type { MemberStats } from "@/app/actions/member-actions";

interface MemberDashboardClientProps {
  userName: string;
  studioId: string;
  studioName: string;
  userId: string;
  userPlan: string | null;
  stats: MemberStats | null;
}

export function MemberDashboardClient({
  userName,
  studioId,
  studioName,
  userId,
  userPlan,
  stats,
}: MemberDashboardClientProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // CASE 1: DIGITAL plan - Show app download interface
  if (userPlan === "DIGITAL") {
    return (
      <div className="space-y-6">
        {/* Welcome Message */}
        <div className="border-b border-slate-200 pb-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Hello {userName.split(" ")[0]}
              </h1>
              <p className="text-slate-600 mt-2">
                Welcome to your digital space
              </p>
            </div>
            {userPlan && <PlanBadge plan={userPlan} />}
          </div>
        </div>

        {/* Digital Space Card */}
        <Card className="max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Smartphone className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>My Digital Space</CardTitle>
                <CardDescription className="mt-1">
                  Access your full video library on our mobile app
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600">
              You have access to the full video library on our mobile app.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                className="flex-1" 
                size="lg"
                onClick={() => window.open("#", "_blank")}
              >
                Download on App Store
              </Button>
              <Button 
                variant="outline" 
                className="flex-1" 
                size="lg"
                onClick={() => window.open("#", "_blank")}
              >
                Get it on Google Play
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // CASE 2: ZAPOY or COACHING plan (or null) - Show booking interface
  const planDisplayName = userPlan === "ZAPOY" ? "ZAPOY" : userPlan === "COACHING" ? "COACHING" : null;

  return (
  <div className="space-y-6">
      {/* Welcome Message */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Hello {userName.split(" ")[0]}
            </h1>
            <p className="text-slate-600 mt-2">
              Book your EMS session at {studioName}
            </p>
          </div>
          {userPlan && <PlanBadge plan={userPlan} />}
        </div>
      </div>

      {/* Performance Summary */}
      <PerformanceStats stats={stats} />

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
