"use server";

import { prisma } from "@/lib/prisma";
import { startOfWeek } from "date-fns";
import { generateWeeklyPlan as generateWithAI, UserProfileForAI, UserPreferencesForAI } from "@/lib/openai";

// Types for the weekly plan data structures
export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  note?: string;
  restTime?: string;
}

export interface SportDay {
  dayName: string;
  dayIndex: number;
  isRestDay: boolean;
  focus?: string;
  exercises: Exercise[];
}

export interface Meal {
  name: string;
  description: string;
  calories?: number;
  protein?: string;
  items?: string[];
}

export interface NutritionDay {
  dayName: string;
  dayIndex: number;
  meals: {
    breakfast: Meal;
    lunch: Meal;
    snack: Meal;
    dinner: Meal;
  };
  totalCalories?: number;
}

export interface WeeklyPlanData {
  id: string;
  weekStartDate: Date;
  status: string;
  sportData: SportDay[] | null;
  nutritionData: NutritionDay[] | null;
}

/**
 * Get the Monday of the current week
 */
function getCurrentWeekMonday(): Date {
  const now = new Date();
  const monday = startOfWeek(now, { weekStartsOn: 1 });
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Generate mock sport data for demo mode
 */
function generateMockSportData(): SportDay[] {
  return [
    {
      dayName: "Lundi",
      dayIndex: 0,
      isRestDay: false,
      focus: "Haut du corps - Push",
      exercises: [
        { name: "Développé couché", sets: 4, reps: "8-10", note: "Contrôle la descente" },
        { name: "Développé incliné haltères", sets: 3, reps: "10-12", restTime: "90s" },
        { name: "Élévations latérales", sets: 3, reps: "12-15", note: "Léger et contrôlé" },
        { name: "Dips", sets: 3, reps: "8-12", restTime: "60s" },
        { name: "Extensions triceps poulie", sets: 3, reps: "12-15" },
      ],
    },
    {
      dayName: "Mardi",
      dayIndex: 1,
      isRestDay: false,
      focus: "Bas du corps",
      exercises: [
        { name: "Squats", sets: 4, reps: "8-10", note: "Descendre en dessous du parallèle" },
        { name: "Presse à cuisses", sets: 3, reps: "10-12", restTime: "90s" },
        { name: "Fentes marchées", sets: 3, reps: "12/jambe" },
        { name: "Leg curl", sets: 3, reps: "12-15", restTime: "60s" },
        { name: "Mollets debout", sets: 4, reps: "15-20" },
      ],
    },
    {
      dayName: "Mercredi",
      dayIndex: 2,
      isRestDay: true,
      focus: "Récupération active",
      exercises: [
        { name: "Marche rapide", sets: 1, reps: "30 min", note: "Optionnel" },
        { name: "Étirements", sets: 1, reps: "15 min" },
      ],
    },
    {
      dayName: "Jeudi",
      dayIndex: 3,
      isRestDay: false,
      focus: "Haut du corps - Pull",
      exercises: [
        { name: "Tractions", sets: 4, reps: "6-10", note: "Assistance si nécessaire" },
        { name: "Rowing barre", sets: 4, reps: "8-10", restTime: "90s" },
        { name: "Tirage vertical", sets: 3, reps: "10-12" },
        { name: "Face pull", sets: 3, reps: "15-20", note: "Épaules en arrière" },
        { name: "Curl biceps", sets: 3, reps: "12-15" },
      ],
    },
    {
      dayName: "Vendredi",
      dayIndex: 4,
      isRestDay: false,
      focus: "Full Body HIIT",
      exercises: [
        { name: "Burpees", sets: 4, reps: "10", note: "30s repos entre séries" },
        { name: "Kettlebell swings", sets: 4, reps: "15", restTime: "30s" },
        { name: "Mountain climbers", sets: 3, reps: "20/côté" },
        { name: "Planche", sets: 3, reps: "45s" },
        { name: "Box jumps", sets: 3, reps: "12" },
      ],
    },
    {
      dayName: "Samedi",
      dayIndex: 5,
      isRestDay: false,
      focus: "Cardio & Core",
      exercises: [
        { name: "Course ou vélo", sets: 1, reps: "25 min", note: "Intensité modérée" },
        { name: "Crunchs", sets: 3, reps: "20" },
        { name: "Russian twists", sets: 3, reps: "20/côté" },
        { name: "Leg raises", sets: 3, reps: "15" },
        { name: "Planche latérale", sets: 2, reps: "30s/côté" },
      ],
    },
    {
      dayName: "Dimanche",
      dayIndex: 6,
      isRestDay: true,
      focus: "Repos complet",
      exercises: [
        { name: "Repos", sets: 1, reps: "-", note: "Profitez de votre journée !" },
      ],
    },
  ];
}

/**
 * Generate mock nutrition data for demo mode
 */
function generateMockNutritionData(): NutritionDay[] {
  return [
    {
      dayName: "Lundi",
      dayIndex: 0,
      totalCalories: 2200,
      meals: {
        breakfast: {
          name: "Petit-déjeuner énergétique",
          description: "Parfait pour bien démarrer la semaine",
          calories: 450,
          protein: "25g",
          items: ["Flocons d'avoine (60g)", "Banane", "Beurre de cacahuète (15g)", "Lait d'amande"],
        },
        lunch: {
          name: "Bowl protéiné",
          description: "Équilibré et rassasiant",
          calories: 650,
          protein: "40g",
          items: ["Poulet grillé (150g)", "Riz complet (80g)", "Brocolis vapeur", "Avocat (1/2)"],
        },
        snack: {
          name: "Collation récup",
          description: "Post-entraînement",
          calories: 300,
          protein: "20g",
          items: ["Yaourt grec", "Miel", "Amandes (30g)"],
        },
        dinner: {
          name: "Dîner léger",
          description: "Digestion facile",
          calories: 550,
          protein: "35g",
          items: ["Saumon (130g)", "Quinoa (70g)", "Légumes grillés", "Huile d'olive"],
        },
      },
    },
    {
      dayName: "Mardi",
      dayIndex: 1,
      totalCalories: 2300,
      meals: {
        breakfast: {
          name: "Omelette complète",
          description: "Riche en protéines",
          calories: 500,
          protein: "30g",
          items: ["3 œufs", "Épinards", "Fromage feta", "Pain complet (2 tranches)"],
        },
        lunch: {
          name: "Wrap méditerranéen",
          description: "Saveurs du sud",
          calories: 600,
          protein: "35g",
          items: ["Tortilla complète", "Thon (120g)", "Houmous", "Crudités", "Olives"],
        },
        snack: {
          name: "Smoothie green",
          description: "Boost vitamines",
          calories: 250,
          protein: "15g",
          items: ["Épinards", "Banane", "Whey vanille", "Lait d'amande"],
        },
        dinner: {
          name: "Steak & légumes",
          description: "Récupération musculaire",
          calories: 700,
          protein: "45g",
          items: ["Steak de bœuf (150g)", "Patate douce (150g)", "Haricots verts", "Beurre"],
        },
      },
    },
    {
      dayName: "Mercredi",
      dayIndex: 2,
      totalCalories: 2000,
      meals: {
        breakfast: {
          name: "Pancakes protéinés",
          description: "Jour de repos = plaisir",
          calories: 450,
          protein: "25g",
          items: ["Pancakes (3)", "Fruits rouges", "Sirop d'érable", "Whey"],
        },
        lunch: {
          name: "Salade César",
          description: "Fraîche et légère",
          calories: 550,
          protein: "30g",
          items: ["Poulet grillé (130g)", "Salade romaine", "Parmesan", "Croûtons", "Sauce légère"],
        },
        snack: {
          name: "Fromage blanc",
          description: "Simple et efficace",
          calories: 200,
          protein: "20g",
          items: ["Fromage blanc 0% (200g)", "Miel", "Noix"],
        },
        dinner: {
          name: "Poke bowl",
          description: "Inspiration hawaiienne",
          calories: 600,
          protein: "35g",
          items: ["Thon cru (120g)", "Riz vinaigré", "Edamame", "Mangue", "Sauce soja"],
        },
      },
    },
    {
      dayName: "Jeudi",
      dayIndex: 3,
      totalCalories: 2250,
      meals: {
        breakfast: {
          name: "Toast avocat",
          description: "Tendance et nutritif",
          calories: 480,
          protein: "20g",
          items: ["Pain de seigle (2)", "Avocat", "Œuf poché", "Graines de chia"],
        },
        lunch: {
          name: "Buddha bowl",
          description: "Végétarien équilibré",
          calories: 620,
          protein: "25g",
          items: ["Pois chiches (150g)", "Quinoa", "Légumes rôtis", "Tahini", "Feta"],
        },
        snack: {
          name: "Barre énergétique",
          description: "Pré-entraînement",
          calories: 280,
          protein: "15g",
          items: ["Barre protéinée maison", "Fruits secs", "Chocolat noir"],
        },
        dinner: {
          name: "Poulet curry",
          description: "Saveurs asiatiques",
          calories: 650,
          protein: "40g",
          items: ["Blanc de poulet (150g)", "Lait de coco", "Riz basmati (80g)", "Légumes curry"],
        },
      },
    },
    {
      dayName: "Vendredi",
      dayIndex: 4,
      totalCalories: 2400,
      meals: {
        breakfast: {
          name: "Açaí bowl",
          description: "Antioxydants max",
          calories: 500,
          protein: "15g",
          items: ["Açaí", "Banane", "Granola", "Beurre d'amande", "Fruits frais"],
        },
        lunch: {
          name: "Burger healthy",
          description: "Vendredi plaisir",
          calories: 700,
          protein: "40g",
          items: ["Steak haché 5% (150g)", "Pain brioche", "Cheddar", "Avocat", "Frites patate douce"],
        },
        snack: {
          name: "Shake post-HIIT",
          description: "Récupération rapide",
          calories: 350,
          protein: "30g",
          items: ["Whey chocolat", "Banane", "Beurre de cacahuète", "Lait"],
        },
        dinner: {
          name: "Pâtes carbonara light",
          description: "Réconfort du vendredi",
          calories: 600,
          protein: "35g",
          items: ["Pâtes complètes (100g)", "Lardons de dinde", "Œuf", "Parmesan", "Poivre"],
        },
      },
    },
    {
      dayName: "Samedi",
      dayIndex: 5,
      totalCalories: 2100,
      meals: {
        breakfast: {
          name: "Brunch complet",
          description: "Weekend vibes",
          calories: 600,
          protein: "35g",
          items: ["Œufs brouillés (3)", "Bacon de dinde", "Avocat", "Tomates", "Pain grillé"],
        },
        lunch: {
          name: "Sushi maison",
          description: "Light et frais",
          calories: 500,
          protein: "25g",
          items: ["Riz à sushi", "Saumon (100g)", "Concombre", "Avocat", "Sauce soja"],
        },
        snack: {
          name: "Fruits & noix",
          description: "Naturel",
          calories: 250,
          protein: "8g",
          items: ["Pomme", "Amandes (30g)", "Chocolat noir (20g)"],
        },
        dinner: {
          name: "Pizza maison",
          description: "Cheat meal contrôlé",
          calories: 650,
          protein: "30g",
          items: ["Pâte à pizza fine", "Mozzarella", "Jambon", "Champignons", "Roquette"],
        },
      },
    },
    {
      dayName: "Dimanche",
      dayIndex: 6,
      totalCalories: 2000,
      meals: {
        breakfast: {
          name: "Granola maison",
          description: "Détente dominicale",
          calories: 450,
          protein: "15g",
          items: ["Granola (60g)", "Yaourt grec", "Fruits de saison", "Miel"],
        },
        lunch: {
          name: "Poulet rôti",
          description: "Classique du dimanche",
          calories: 650,
          protein: "45g",
          items: ["Cuisse de poulet", "Pommes de terre rôties", "Carottes", "Jus de cuisson"],
        },
        snack: {
          name: "Cake protéiné",
          description: "Fait maison",
          calories: 300,
          protein: "20g",
          items: ["Cake banane-whey", "Thé vert"],
        },
        dinner: {
          name: "Soupe & tartines",
          description: "Léger avant la semaine",
          calories: 450,
          protein: "20g",
          items: ["Soupe de légumes", "Pain complet", "Fromage frais", "Jambon"],
        },
      },
    },
  ];
}

/**
 * Get the current week's plan for a user
 * Returns mock data if no plan exists in the database (DEMO MODE)
 */
export async function getCurrentWeeklyPlan(
  userId: string
): Promise<WeeklyPlanData | null> {
  try {
    const weekMonday = getCurrentWeekMonday();

    // Try to find an existing plan in the database
    const existingPlan = await prisma.weeklyPlan.findUnique({
      where: {
        userId_weekStartDate: {
          userId,
          weekStartDate: weekMonday,
        },
      },
    });

    if (existingPlan) {
      return {
        id: existingPlan.id,
        weekStartDate: existingPlan.weekStartDate,
        status: existingPlan.status,
        sportData: existingPlan.sportData as SportDay[] | null,
        nutritionData: existingPlan.nutritionData as NutritionDay[] | null,
      };
    }

    // DEMO MODE: Return mock data if no plan exists
    return {
      id: "demo-plan",
      weekStartDate: weekMonday,
      status: "DEMO",
      sportData: generateMockSportData(),
      nutritionData: generateMockNutritionData(),
    };
  } catch (error) {
    console.error("Error fetching weekly plan:", error);
    
    // Return mock data on error (graceful fallback)
    return {
      id: "demo-plan",
      weekStartDate: getCurrentWeekMonday(),
      status: "DEMO",
      sportData: generateMockSportData(),
      nutritionData: generateMockNutritionData(),
    };
  }
}

/**
 * Mark a plan as read
 */
export async function markPlanAsRead(
  planId: string
): Promise<{ success: boolean }> {
  try {
    if (planId === "demo-plan") {
      return { success: true };
    }

    await prisma.weeklyPlan.update({
      where: { id: planId },
      data: { status: "READ" },
    });

    return { success: true };
  } catch (error) {
    console.error("Error marking plan as read:", error);
    return { success: false };
  }
}

/**
 * Create or update a weekly plan (for future AI generation)
 */
export async function upsertWeeklyPlan(
  userId: string,
  sportData: SportDay[],
  nutritionData: NutritionDay[]
): Promise<{ success: boolean; planId?: string }> {
  try {
    const weekMonday = getCurrentWeekMonday();

    const plan = await prisma.weeklyPlan.upsert({
      where: {
        userId_weekStartDate: {
          userId,
          weekStartDate: weekMonday,
        },
      },
      update: {
        sportData: sportData as unknown as object,
        nutritionData: nutritionData as unknown as object,
        status: "GENERATED",
      },
      create: {
        userId,
        weekStartDate: weekMonday,
        sportData: sportData as unknown as object,
        nutritionData: nutritionData as unknown as object,
        status: "GENERATED",
      },
    });

    return { success: true, planId: plan.id };
  } catch (error) {
    console.error("Error upserting weekly plan:", error);
    return { success: false };
  }
}

/**
 * Generate a new weekly plan using AI for a specific user
 * This can be called on-demand by admins or through the cron job
 */
export async function generateAIPlanForUser(
  userId: string
): Promise<{ success: boolean; error?: string; planId?: string }> {
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
      return { success: false, error: "Utilisateur non trouvé" };
    }

    if (!user.profile) {
      return { success: false, error: "L'utilisateur n'a pas de profil configuré" };
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
    console.log(`Generating AI plan for user ${userId}...`);
    const { sportData, nutritionData } = await generateWithAI(
      profileForAI,
      preferencesForAI
    );

    // Save to database for current week
    const weekMonday = getCurrentWeekMonday();

    const plan = await prisma.weeklyPlan.upsert({
      where: {
        userId_weekStartDate: {
          userId,
          weekStartDate: weekMonday,
        },
      },
      update: {
        sportData: sportData as unknown as object,
        nutritionData: nutritionData as unknown as object,
        status: "GENERATED",
      },
      create: {
        userId,
        weekStartDate: weekMonday,
        sportData: sportData as unknown as object,
        nutritionData: nutritionData as unknown as object,
        status: "GENERATED",
      },
    });

    console.log(`AI plan generated successfully for user ${userId}`);
    return { success: true, planId: plan.id };
  } catch (error) {
    console.error(`Error generating AI plan for user ${userId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

/**
 * Check if AI generation is available (API key configured)
 */
export async function isAIGenerationAvailable(): Promise<boolean> {
  return !!process.env.OPENAI_API_KEY;
}
