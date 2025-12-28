"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DateSelectorProps {
  onDateChange: (date: Date) => void;
  selectedDate: Date;
}

export function DateSelector({ onDateChange, selectedDate }: DateSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sélectionner une date</CardTitle>
        <CardDescription>
          Choisissez le jour pour voir les créneaux disponibles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (date) {
              onDateChange(date);
            }
          }}
          className="rounded-md border"
          locale={fr}
          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
        />
      </CardContent>
    </Card>
  );
}
