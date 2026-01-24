"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function BookingsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentDate = searchParams.get("date");
  const currentStatus = searchParams.get("status");

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`/admin/bookings?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/admin/bookings");
  };

  const hasFilters = currentDate || currentStatus;

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Date Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !currentDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {currentDate
              ? format(new Date(currentDate), "d MMMM yyyy", { locale: fr })
              : "Choisir une date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={currentDate ? new Date(currentDate) : undefined}
            onSelect={(date) =>
              updateFilters("date", date ? date.toISOString().split("T")[0] : null)
            }
            locale={fr}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Status Filter */}
      <Select
        value={currentStatus || "all"}
        onValueChange={(value) =>
          updateFilters("status", value === "all" ? null : value)
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Tous les statuts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          <SelectItem value="CONFIRMED">Confirmé</SelectItem>
          <SelectItem value="COMPLETED">Terminé</SelectItem>
          <SelectItem value="CANCELLED">Annulé</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-muted-foreground"
        >
          <X className="mr-1 h-4 w-4" />
          Effacer les filtres
        </Button>
      )}
    </div>
  );
}
