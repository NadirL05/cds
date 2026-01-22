import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { WeeklyRecapEmail } from "@/components/emails/weekly-recap-email";
import { startOfWeek, endOfWeek } from "date-fns";

// Force dynamic pour éviter le caching statique de la route API
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 1. Sécurité : Vérification du Bearer Token
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Définir la plage de dates (les 7 derniers jours)
    // On regarde la semaine qui vient de s'écouler (ex: du Lundi au Dimanche soir)
    const today = new Date();
    // Si le cron tourne dimanche soir, on regarde du début de semaine à maintenant
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Lundi
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });     // Dimanche

    // 3. Récupérer les membres actifs
    const activeMembers = await prisma.user.findMany({
      where: {
        role: "MEMBER",
        subscriptionStatus: "active",
      },
      include: {
        profile: true,
        // On récupère les réservations confirmées/effectuées de la semaine
        bookings: {
          where: {
            startTime: {
              gte: weekStart,
              lte: weekEnd,
            },
            status: {
              in: ["CONFIRMED", "ATTENDED"],
            },
          },
        },
      },
    });

    console.log(`Processing weekly recap for ${activeMembers.length} members...`);

    const results = {
      total: activeMembers.length,
      sent: 0,
      errors: 0,
    };

    // 4. Traitement et Envoi (En parallèle pour la performance)
    const emailPromises = activeMembers.map(async (member) => {
      // Ignorer si pas d'email ou pas de prénom
      if (!member.email || !member.profile?.firstName) return;

      const sessionCount = member.bookings.length;
      const firstName = member.profile.firstName;

      try {
        await resend.emails.send({
          from: "CDS Sport <onboarding@resend.dev>", // À changer pour votre domaine vérifié en prod
          to: member.email,
          subject: `Bilan de votre semaine sportive - ${firstName}`,
          react: WeeklyRecapEmail({
            firstName,
            sessionCount,
            goal: 3, // Objectif par défaut
          }),
        });
        results.sent++;
      } catch (error) {
        console.error(`Failed to send email to ${member.email}:`, error);
        results.errors++;
      }
    });

    await Promise.all(emailPromises);

    return NextResponse.json({
      success: true,
      ...results,
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString()
    });

  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
