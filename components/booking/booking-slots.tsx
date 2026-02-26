"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAvailableSlots, bookSlot } from "@/app/actions/booking-actions";
import { createDropInCheckout } from "@/app/actions/stripe-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { AvailableSlot } from "@/app/actions/booking-actions";

interface BookingSlotsProps {
  studioId: string;
  date: Date;
  userId: string;
  userPlan: string | null;
}

export function BookingSlots({ studioId, date, userId, userPlan }: BookingSlotsProps) {
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Record<string, boolean>>({});
  const router = useRouter();

  // Load slots on mount and when date/studioId changes
  useEffect(() => {
    loadSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studioId, date.toISOString()]);

  async function loadSlots() {
    setLoading(true);
    try {
      const availableSlots = await getAvailableSlots(studioId, date);
      setSlots(availableSlots);
    } catch (error) {
      console.error("Error loading slots:", error);
      toast.error("Error loading slots");
    } finally {
      setLoading(false);
    }
  }

  async function handleBookSlot(slot: AvailableSlot) {
    if (slot.isFull) {
      toast.error("This slot is full");
      return;
    }

    const slotId = `${slot.startTime.toISOString()}`;
    if (booking[slotId]) {
      return; // Already booking
    }

    setBooking((prev) => ({ ...prev, [slotId]: true }));

    try {
      if (userPlan === "DIGITAL") {
        // Flux Drop-in pour les membres 100% Digital
        const checkoutUrl = await createDropInCheckout(studioId, slot.startTime);
        if (checkoutUrl) {
          toast.success("Redirection vers le paiement sécurisé...");
          window.location.href = checkoutUrl;
        } else {
          toast.error("Impossible de lancer le paiement Drop-in.");
        }
      } else {
        const result = await bookSlot(
          userId,
          studioId,
          slot.startTime,
          "Metabolique"
        );

        if (result.success) {
          toast.success("Booking confirmed!");
          // Refresh the page data
          router.refresh();
          // Reload slots to update counts
          await loadSlots();
        } else {
          toast.error(result.error || "Error booking slot");
        }
      }
    } catch (error) {
      console.error("Error booking slot / drop-in:", error);
      toast.error(
        userPlan === "DIGITAL"
          ? "Erreur lors du démarrage du paiement Drop-in."
          : "Error booking slot"
      );
    } finally {
      setBooking((prev) => {
        const next = { ...prev };
        delete next[slotId];
        return next;
      });
    }
  }

  function getSlotBadge(slot: AvailableSlot): { text: string; className: string } {
    if (slot.isFull) {
      return { text: "Full", className: "bg-slate-200 text-slate-600 border-slate-300" };
    }
    if (slot.bookedCount === 5) {
      return { text: "Last spot!", className: "bg-orange-100 text-orange-700 border-orange-300" };
    }
    return { text: "Available", className: "bg-blue-100 text-blue-700 border-blue-300" };
  }

  function getSlotText(slot: AvailableSlot): string {
    if (slot.isFull) {
      return `${slot.capacity}/${slot.capacity} places`;
    }
    return `${slot.availableSpots}/${slot.capacity} places`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading slots...</p>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No slots available for this date</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {slots.map((slot) => {
        const slotId = `${slot.startTime.toISOString()}`;
        const isBooking = booking[slotId];
        const badge = getSlotBadge(slot);

        return (
          <Card 
            key={slotId} 
            className="transition-all hover:shadow-lg border-slate-200 hover:border-blue-300"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-900">
                  {format(slot.startTime, "HH:mm")} - {format(slot.endTime, "HH:mm")}
                </CardTitle>
                <span className={cn("px-2 py-1 text-xs font-medium rounded border", badge.className)}>
                  {badge.text}
                </span>
              </div>
              <CardDescription className="text-slate-600">{getSlotText(slot)}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleBookSlot(slot)}
                disabled={slot.isFull || isBooking}
                className={cn(
                  "w-full",
                  slot.isFull
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                    : userPlan === "DIGITAL"
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
                variant={slot.isFull ? "outline" : "default"}
              >
                {isBooking
                  ? userPlan === "DIGITAL"
                    ? "Paiement en cours..."
                    : "Booking..."
                  : slot.isFull
                  ? "Full"
                  : userPlan === "DIGITAL"
                  ? "Acheter (15€)"
                  : "Book Now"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
