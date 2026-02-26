import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateWeeklyPlan, UserProfileForAI, UserPreferencesForAI } from "@/lib/openai";
import { startOfWeek, addWeeks } from "date-fns";

export const dynamic = "force-dynamic";

// Configuration
const CRON_SECRET = process.env.CRON_SECRET;
const BATCH_SIZE = 5; // Process users in batches to avoid rate limits
const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds between batches

/**
 * Get the Monday of the next week (for generating plans in advance)
 */
function getNextWeekMonday(): Date {
  const now = new Date();
  const thisMonday = startOfWeek(now, { weekStartsOn: 1 });
  const nextMonday = addWeeks(thisMonday, 1);
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday;
}

/**
 * Delay helper for rate limiting
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Process a single user: fetch their data and generate a plan
 */
async function processUser(
  userId: string,
  weekStartDate: Date
): Promise<{ success: boolean; error?: string }> {
  try {
    // Fetch user with profile and coaching preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        coachingPreferences: true,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (!user.profile) {
      return { success: false, error: "User has no profile" };
    }

    // Build profile for AI
    const profileForAI: UserProfileForAI = {
      firstName: user.profile.firstName,
      age: user.profile.age,
      weight: user.profile.weight,
      height: user.profile.height,
      gender: user.profile.gender,
      goals: user.profile.goals,
    };

    // Build preferences for AI
    const preferencesForAI: UserPreferencesForAI = {
      goal: user.coachingPreferences?.goal ?? null,
      level: user.coachingPreferences?.level ?? null,
      frequency: user.coachingPreferences?.frequency ?? null,
      eatsMeat: user.coachingPreferences?.eatsMeat ?? null,
      eatsFish: user.coachingPreferences?.eatsFish ?? null,
      eatsEggs: user.coachingPreferences?.eatsEggs ?? null,
      veggies: user.coachingPreferences?.veggies ?? [],
      starches: user.coachingPreferences?.starches ?? [],
      drinks: user.coachingPreferences?.drinks ?? [],
      dietaryRestrictions: user.coachingPreferences?.dietaryRestrictions ?? null,
    };

    // Generate the plan using OpenAI
    console.log(`Generating plan for user ${userId}...`);
    const { sportData, nutritionData } = await generateWeeklyPlan(
      profileForAI,
      preferencesForAI
    );

    // Save to database
    await prisma.weeklyPlan.upsert({
      where: {
        userId_weekStartDate: {
          userId,
          weekStartDate,
        },
      },
      update: {
        sportData: sportData as unknown as object,
        nutritionData: nutritionData as unknown as object,
        status: "GENERATED",
      },
      create: {
        userId,
        weekStartDate,
        sportData: sportData as unknown as object,
        nutritionData: nutritionData as unknown as object,
        status: "GENERATED",
      },
    });

    console.log(`Plan generated successfully for user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error(`Error processing user ${userId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Main cron handler
 * This endpoint generates weekly plans for all active members
 * Should be called every Sunday to prepare plans for the coming week
 */
export async function POST(request: NextRequest) {
  // Security check
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!CRON_SECRET || token !== CRON_SECRET) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const weekStartDate = getNextWeekMonday();
    console.log(`Starting weekly plan generation for week of ${weekStartDate.toISOString()}`);

    // Get all users with active subscriptions
    const activeUsers = await prisma.user.findMany({
      where: {
        subscriptionStatus: "active",
      },
      select: {
        id: true,
        email: true,
      },
    });

    console.log(`Found ${activeUsers.length} active users`);

    // Check which users already have a plan for the coming week
    const existingPlans = await prisma.weeklyPlan.findMany({
      where: {
        weekStartDate,
        userId: {
          in: activeUsers.map((u) => u.id),
        },
      },
      select: {
        userId: true,
      },
    });

    const usersWithPlans = new Set(existingPlans.map((p) => p.userId));
    const usersToProcess = activeUsers.filter((u) => !usersWithPlans.has(u.id));

    console.log(`${usersToProcess.length} users need plan generation`);
    console.log(`${usersWithPlans.size} users already have plans`);

    // Process users in batches
    let generated = 0;
    let errors = 0;
    const errorDetails: { userId: string; email: string; error: string }[] = [];

    for (let i = 0; i < usersToProcess.length; i += BATCH_SIZE) {
      const batch = usersToProcess.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(usersToProcess.length / BATCH_SIZE)}`);

      // Process batch in parallel
      const results = await Promise.all(
        batch.map(async (user) => {
          const result = await processUser(user.id, weekStartDate);
          return { user, result };
        })
      );

      // Count results
      for (const { user, result } of results) {
        if (result.success) {
          generated++;
        } else {
          errors++;
          errorDetails.push({
            userId: user.id,
            email: user.email,
            error: result.error || "Unknown error",
          });
        }
      }

      // Delay between batches to avoid rate limits
      if (i + BATCH_SIZE < usersToProcess.length) {
        await delay(DELAY_BETWEEN_BATCHES);
      }
    }

    console.log(`Generation complete: ${generated} generated, ${errors} errors`);

    return NextResponse.json({
      success: true,
      weekStartDate: weekStartDate.toISOString(),
      stats: {
        totalActiveUsers: activeUsers.length,
        alreadyHadPlans: usersWithPlans.size,
        processed: usersToProcess.length,
        generated,
        errors,
      },
      errorDetails: errors > 0 ? errorDetails : undefined,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler for health check
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "weekly-generate",
    description: "Generates weekly sport and nutrition plans for active members",
    usage: "POST with Authorization: Bearer <CRON_SECRET>",
  });
}
