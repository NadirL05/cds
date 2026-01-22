"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Goal, Level, Frequency } from "@prisma/client";

export interface OnboardingData {
  // Profile fields
  firstName: string;
  lastName: string;
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  city?: string | null;
  department?: string | null;
  phoneNumber?: string | null;

  // Coaching preferences - Sport
  goal?: Goal | null;
  level?: Level | null;
  frequency?: Frequency | null;

  // Coaching preferences - Diet
  eatsMeat?: boolean | null;
  eatsFish?: boolean | null;
  eatsEggs?: boolean | null;
  veggies?: string[];
  starches?: string[];
  drinks?: string[];
  dietaryRestrictions?: string | null;
}

export async function submitOnboardingData(
  userId: string,
  data: OnboardingData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update Profile
    await prisma.profile.upsert({
      where: { userId },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        height: data.height,
        weight: data.weight,
        city: data.city,
        department: data.department,
        phoneNumber: data.phoneNumber,
      },
      create: {
        userId,
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        height: data.height,
        weight: data.weight,
        city: data.city,
        department: data.department,
        phoneNumber: data.phoneNumber,
      },
    });

    // Upsert CoachingPreferences
    await prisma.coachingPreferences.upsert({
      where: { userId },
      update: {
        goal: data.goal,
        level: data.level,
        frequency: data.frequency,
        eatsMeat: data.eatsMeat,
        eatsFish: data.eatsFish,
        eatsEggs: data.eatsEggs,
        veggies: data.veggies || [],
        starches: data.starches || [],
        drinks: data.drinks || [],
        dietaryRestrictions: data.dietaryRestrictions,
      },
      create: {
        userId,
        goal: data.goal,
        level: data.level,
        frequency: data.frequency,
        eatsMeat: data.eatsMeat,
        eatsFish: data.eatsFish,
        eatsEggs: data.eatsEggs,
        veggies: data.veggies || [],
        starches: data.starches || [],
        drinks: data.drinks || [],
        dietaryRestrictions: data.dietaryRestrictions,
      },
    });

    // Revalidate dashboard paths
    revalidatePath("/member");
    revalidatePath("/member/profile");

    return { success: true };
  } catch (error) {
    console.error("Error submitting onboarding data:", error);
    const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
    return { success: false, error: errorMessage };
  }
}
