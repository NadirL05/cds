"use server";

import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { render } from "@react-email/render";
import React from "react";
import { YieldPromoEmail } from "@/components/emails/yield-promo-email";
import { getAvailableSlots } from "@/app/actions/booking-actions";

export interface YieldResult {
  success: boolean;
  emptySlotsFound: number;
  emailsSent: number;
  error?: string;
}

export async function analyzeAndTriggerYield(studioId: string): Promise<YieldResult> {
  try {
    if (!studioId) {
      return {
        success: false,
        emptySlotsFound: 0,
        emailsSent: 0,
        error: "Studio ID manquant",
      };
    }

    const studio = await prisma.studio.findUnique({
      where: { id: studioId },
    });

    if (!studio) {
      return {
        success: false,
        emptySlotsFound: 0,
        emailsSent: 0,
        error: "Studio introuvable",
      };
    }

    // Calcul de demain (date en local)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Récupère tous les créneaux de demain via la logique existante
    const tomorrowSlots = await getAvailableSlots(studioId, tomorrow);

    // Créneaux "sous-performants" : moins de la moitié de la capacité
    const underperformingSlots = tomorrowSlots.filter((slot) => {
      if (!slot.capacity || slot.capacity <= 0) return false;
      return slot.bookedCount < slot.capacity / 2 && !slot.isFull;
    });

    const emptySlotsFound = underperformingSlots.length;

    if (emptySlotsFound === 0) {
      return {
        success: true,
        emptySlotsFound,
        emailsSent: 0,
      };
    }

    // Récupère tous les membres DIGITAL du studio
    const digitalMembers = await prisma.user.findMany({
      where: {
        role: "MEMBER",
        homeStudioId: studioId,
        plan: "DIGITAL",
        email: {
          not: "",
        },
      },
      include: {
        profile: true,
      },
    });

    if (digitalMembers.length === 0) {
      return {
        success: true,
        emptySlotsFound,
        emailsSent: 0,
      };
    }

    // On met en avant le premier créneau sous-performant dans l'email
    const highlightedSlot = underperformingSlots[0];
    const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });
    const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const dateLabel = dateFormatter.format(highlightedSlot.startTime);
    const timeLabel = `${timeFormatter.format(
      highlightedSlot.startTime
    )} - ${timeFormatter.format(highlightedSlot.endTime)}`;

    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const dropInUrl = `${baseUrl}/member/bookings?studioId=${studioId}&date=${highlightedSlot.startTime.toISOString()}`;

    const discountPrice = "15€";
    const originalPrice = "25€";

    const subject = `Vente Flash : Drop-in demain à ${studio.name}`;

    const sendResults = await Promise.all(
      digitalMembers.map(async (member) => {
        try {
          const emailHtml = await render(
            React.createElement(YieldPromoEmail, {
              firstName: member.profile?.firstName || undefined,
              date: dateLabel,
              time: timeLabel,
              discountPrice,
              originalPrice,
              link: dropInUrl,
            }) as React.ReactElement
          );

          const result = await resend.emails.send({
            from: "CDS Sport <no-reply@cds-sport.com>",
            to: member.email,
            subject,
            html: emailHtml,
          });

          if (result.error) {
            console.error("Erreur envoi email yield:", result.error);
            return { ok: false };
          }

          return { ok: true };
        } catch (error) {
          console.error("Erreur envoi email yield:", error);
          return { ok: false };
        }
      })
    );

    const emailsSent = sendResults.filter((r) => r.ok).length;

    return {
      success: true,
      emptySlotsFound,
      emailsSent,
    };
  } catch (error) {
    console.error("Erreur analyzeAndTriggerYield:", error);
    return {
      success: false,
      emptySlotsFound: 0,
      emailsSent: 0,
      error:
        error instanceof Error ? error.message : "Erreur inconnue lors du yield",
    };
  }
}

