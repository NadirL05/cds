import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeAndTriggerYield } from "@/app/actions/yield-actions";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // 1. Verify authentication without using redirect()
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUserId = session.user.id;

    // 2. Fetch admin user data
    const adminUser = await prisma.user.findUnique({
      where: { id: adminUserId },
      select: { homeStudioId: true, role: true },
    });

    // 3. Verify authorization and studio assignment
    if (
      !adminUser?.homeStudioId ||
      (adminUser.role !== "FRANCHISE_OWNER" &&
        adminUser.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json(
        {
          error: "Forbidden: No studio assigned or insufficient rights",
        },
        { status: 403 }
      );
    }

    // 4. Trigger the yield management algorithm
    const result = await analyzeAndTriggerYield(adminUser.homeStudioId);

    // 5. Return the result safely
    return NextResponse.json(result);
  } catch (error) {
    console.error("Yield API Error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 }
    );
  }
}
