import OpenAI from "openai";
import { z } from "zod";
import type { SportDay, NutritionDay } from "@/app/actions/plan-actions";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Model configuration - can be overridden via env
const MODEL = process.env.OPENAI_MODEL || "gpt-4o";

// ==========================================
// ZOD SCHEMAS FOR VALIDATION
// ==========================================

const ExerciseSchema = z.object({
  name: z.string(),
  sets: z.number(),
  reps: z.string(),
  note: z.string().optional(),
  restTime: z.string().optional(),
});

const SportDaySchema = z.object({
  dayName: z.string(),
  dayIndex: z.number(),
  isRestDay: z.boolean(),
  focus: z.string().optional(),
  exercises: z.array(ExerciseSchema),
});

const MealSchema = z.object({
  name: z.string(),
  description: z.string(),
  calories: z.number().optional(),
  protein: z.string().optional(),
  items: z.array(z.string()).optional(),
});

const NutritionDaySchema = z.object({
  dayName: z.string(),
  dayIndex: z.number(),
  totalCalories: z.number().optional(),
  meals: z.object({
    breakfast: MealSchema,
    lunch: MealSchema,
    snack: MealSchema,
    dinner: MealSchema,
  }),
});

const WeeklyPlanResponseSchema = z.object({
  sportData: z.array(SportDaySchema),
  nutritionData: z.array(NutritionDaySchema),
});

// ==========================================
// USER PROFILE TYPES
// ==========================================

export interface UserProfileForAI {
  firstName: string;
  age?: number | null;
  weight?: number | null;
  height?: number | null;
  gender?: string | null;
  goals?: string[];
}

export interface UserPreferencesForAI {
  goal?: string | null;
  level?: string | null;
  frequency?: string | null;
  eatsMeat?: boolean | null;
  eatsFish?: boolean | null;
  eatsEggs?: boolean | null;
  veggies?: string[];
  starches?: string[];
  drinks?: string[];
  dietaryRestrictions?: string | null;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getGoalDescription(goal: string | null | undefined): string {
  switch (goal) {
    case "RAFFERMIR":
      return "tonifier et raffermir le corps";
    case "PRISE_MASSE":
      return "prendre de la masse musculaire";
    case "PERTE_POIDS":
      return "perdre du poids et brûler des graisses";
    case "SE_MUSCLER":
      return "développer la musculature";
    default:
      return "améliorer la forme physique générale";
  }
}

function getLevelDescription(level: string | null | undefined): string {
  switch (level) {
    case "DEBUTANT":
      return "débutant (peu ou pas d'expérience)";
    case "INTERMEDIAIRE":
      return "intermédiaire (pratique régulière depuis plusieurs mois)";
    case "CONFIRME":
      return "confirmé (plusieurs années d'expérience)";
    default:
      return "niveau moyen";
  }
}

function getFrequencyDescription(frequency: string | null | undefined): string {
  switch (frequency) {
    case "UNE_DEUX":
      return "1-2 fois par semaine";
    case "TROIS_QUATRE":
      return "3-4 fois par semaine";
    case "CINQ_PLUS":
      return "5 fois ou plus par semaine";
    default:
      return "2-3 fois par semaine";
  }
}

function buildDietaryContext(prefs: UserPreferencesForAI): string {
  const restrictions: string[] = [];

  if (prefs.eatsMeat === false) {
    restrictions.push("ne mange pas de viande");
  }
  if (prefs.eatsFish === false) {
    restrictions.push("ne mange pas de poisson");
  }
  if (prefs.eatsEggs === false) {
    restrictions.push("ne mange pas d'œufs");
  }
  if (prefs.dietaryRestrictions) {
    restrictions.push(prefs.dietaryRestrictions);
  }

  const preferences: string[] = [];
  if (prefs.veggies && prefs.veggies.length > 0) {
    preferences.push(`Légumes préférés: ${prefs.veggies.join(", ")}`);
  }
  if (prefs.starches && prefs.starches.length > 0) {
    preferences.push(`Féculents préférés: ${prefs.starches.join(", ")}`);
  }
  if (prefs.drinks && prefs.drinks.length > 0) {
    preferences.push(`Boissons préférées: ${prefs.drinks.join(", ")}`);
  }

  let context = "";
  if (restrictions.length > 0) {
    context += `Restrictions alimentaires: ${restrictions.join(", ")}. `;
  }
  if (preferences.length > 0) {
    context += preferences.join(". ") + ".";
  }

  return context || "Pas de restrictions alimentaires particulières.";
}

// ==========================================
// MAIN GENERATION FUNCTION
// ==========================================

export async function generateWeeklyPlan(
  profile: UserProfileForAI,
  preferences: UserPreferencesForAI
): Promise<{ sportData: SportDay[]; nutritionData: NutritionDay[] }> {
  const goalDesc = getGoalDescription(preferences.goal);
  const levelDesc = getLevelDescription(preferences.level);
  const frequencyDesc = getFrequencyDescription(preferences.frequency);
  const dietaryContext = buildDietaryContext(preferences);

  // Build user context
  const userContext = `
PROFIL DE L'UTILISATEUR:
- Prénom: ${profile.firstName}
- Âge: ${profile.age || "Non renseigné"}
- Poids: ${profile.weight ? `${profile.weight} kg` : "Non renseigné"}
- Taille: ${profile.height ? `${profile.height} cm` : "Non renseigné"}
- Sexe: ${profile.gender || "Non renseigné"}
- Objectif principal: ${goalDesc}
- Niveau sportif: ${levelDesc}
- Fréquence d'entraînement souhaitée: ${frequencyDesc}

PRÉFÉRENCES ALIMENTAIRES:
${dietaryContext}
`.trim();

  const systemPrompt = `Tu es un coach sportif et nutritionniste d'élite, expert en préparation physique et en nutrition sportive.
Tu dois créer des programmes d'entraînement et des plans alimentaires personnalisés, en français.

RÈGLES IMPORTANTES:
1. Adapte TOUJOURS le programme au niveau et aux objectifs de l'utilisateur
2. Les jours de repos sont essentiels - inclus 1-2 jours de repos ou récupération active par semaine
3. Pour la nutrition, respecte STRICTEMENT les restrictions alimentaires
4. Varie les exercices et les repas pour éviter la monotonie
5. Sois précis sur les quantités (grammes, portions)
6. Les exercices doivent être réalistes et réalisables en salle de sport ou à domicile

Tu dois répondre UNIQUEMENT en JSON valide, sans aucun texte avant ou après.`;

  const userPrompt = `${userContext}

Génère un programme complet pour la semaine (7 jours: Lundi à Dimanche).

Le format JSON attendu est:
{
  "sportData": [
    {
      "dayName": "Lundi",
      "dayIndex": 0,
      "isRestDay": false,
      "focus": "Description du focus du jour",
      "exercises": [
        {
          "name": "Nom de l'exercice",
          "sets": 4,
          "reps": "8-10",
          "note": "Conseil technique optionnel",
          "restTime": "90s"
        }
      ]
    }
  ],
  "nutritionData": [
    {
      "dayName": "Lundi",
      "dayIndex": 0,
      "totalCalories": 2200,
      "meals": {
        "breakfast": {
          "name": "Nom du repas",
          "description": "Description courte",
          "calories": 450,
          "protein": "25g",
          "items": ["Aliment 1 (quantité)", "Aliment 2"]
        },
        "lunch": { ... },
        "snack": { ... },
        "dinner": { ... }
      }
    }
  ]
}

Génère maintenant le programme personnalisé complet en JSON:`;

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 8000,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error("Empty response from OpenAI");
    }

    // Parse and validate JSON
    const parsedResponse = JSON.parse(responseContent);
    const validatedData = WeeklyPlanResponseSchema.parse(parsedResponse);

    return {
      sportData: validatedData.sportData as SportDay[],
      nutritionData: validatedData.nutritionData as NutritionDay[],
    };
  } catch (error) {
    console.error("Error generating weekly plan:", error);

    // If it's a Zod validation error, log details
    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.errors);
    }

    throw error;
  }
}

// ==========================================
// SINGLE PLAN GENERATION (SPORT OR NUTRITION)
// ==========================================

export async function generateSportPlanOnly(
  profile: UserProfileForAI,
  preferences: UserPreferencesForAI
): Promise<SportDay[]> {
  const result = await generateWeeklyPlan(profile, preferences);
  return result.sportData;
}

export async function generateNutritionPlanOnly(
  profile: UserProfileForAI,
  preferences: UserPreferencesForAI
): Promise<NutritionDay[]> {
  const result = await generateWeeklyPlan(profile, preferences);
  return result.nutritionData;
}
