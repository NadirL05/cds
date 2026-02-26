import { NextRequest, NextResponse } from "next/server";
import { analyzeAndTriggerYield } from "@/app/actions/yield-actions";
import { prisma } from "@/lib/prisma";
import { getUserIdOrRedirect } from "@/lib/auth-helpers";

export async function POST(_req: NextRequest) {
  try {
    const adminUserId = await getUserIdOrRedirect();

    const adminUser = await prisma.user.findUnique({
      where: { id: adminUserId },
      select: { homeStudioId: true },
    });

    if (!adminUser?.homeStudioId) {
      return NextResponse.json(
        { error: "Aucun studio rattaché à cet administrateur." },
        { status: 400 }
      );
    }

    const result = await analyzeAndTriggerYield(adminUser.homeStudioId);

    if (!result.success && result.error) {
      return NextResponse.json(
        result,
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur API yield admin:", error);
    return NextResponse.json(
      {
        success: false,
        emptySlotsFound: 0,
        emailsSent: 0,
        error: "Erreur serveur lors du déclenchement du yield",
      },
      { status: 500 }
    );
  }
}

