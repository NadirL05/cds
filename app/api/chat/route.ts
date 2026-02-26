import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;

    const { messages } = await req.json();

    // Fetch user profile and coaching preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        coachingPreferences: true,
      },
    });

    if (!user || !user.profile) {
      return NextResponse.json(
        { error: "Profil utilisateur incomplet" },
        { status: 400 }
      );
    }

    const profile = user.profile;
    const prefs = user.coachingPreferences;

    const firstName = profile.firstName;
    const goalLabel = (() => {
      switch (prefs?.goal) {
        case "RAFFERMIR":
          return "raffermir et tonifier la silhouette";
        case "PRISE_MASSE":
          return "prise de masse musculaire";
        case "PERTE_POIDS":
          return "perte de poids / sèche";
        case "SE_MUSCLER":
          return "se muscler et prendre de la force";
        default:
          return "améliorer sa condition physique globale";
      }
    })();

    const weight = profile.weight ? `${profile.weight} kg` : "non précisé";
    const height = profile.height ? `${profile.height} cm` : "non précisée";
    const levelLabel = (() => {
      switch (prefs?.level) {
        case "DEBUTANT":
          return "débutant";
        case "INTERMEDIAIRE":
          return "intermédiaire";
        case "CONFIRME":
          return "confirmé";
        default:
          return "non précisé";
      }
    })();

    const restrictions: string[] = [];
    if (prefs) {
      if (prefs.eatsMeat === false) restrictions.push("ne mange pas de viande");
      if (prefs.eatsFish === false) restrictions.push("ne mange pas de poisson");
      if (prefs.eatsEggs === false) restrictions.push("ne mange pas d'œufs");
      if (prefs.dietaryRestrictions) restrictions.push(prefs.dietaryRestrictions);
    }

    const restrictionsText =
      restrictions.length > 0
        ? restrictions.join(", ")
        : "aucune restriction particulière indiquée";

    const preferredFoodsParts: string[] = [];
    if (prefs?.veggies?.length) {
      preferredFoodsParts.push(`Légumes favoris: ${prefs.veggies.join(", ")}`);
    }
    if (prefs?.starches?.length) {
      preferredFoodsParts.push(
        `Féculents favoris: ${prefs.starches.join(", ")}`
      );
    }
    if (prefs?.drinks?.length) {
      preferredFoodsParts.push(`Boissons favorites: ${prefs.drinks.join(", ")}`);
    }

    const preferredFoodsText =
      preferredFoodsParts.length > 0
        ? preferredFoodsParts.join(". ") + "."
        : "Pas de préférences alimentaires spécifiques renseignées.";

    const systemPrompt = `
Tu es le coach IA premium de CDS Sport.

Tu t'adresses à ${firstName}.

PROFIL UTILISATEUR:
- Objectif principal: ${goalLabel}
- Niveau: ${levelLabel}
- Poids: ${weight}
- Taille: ${height}
- Restrictions alimentaires: ${restrictionsText}
- Préférences: ${preferredFoodsText}

RÔLE:
- Tu es à la fois coach sportif et nutritionniste.
- Tu donnes des conseils ultra personnalisés, concrets et applicables.
- Tu réponds TOUJOURS en français.
- Tu es motivant, bienveillant mais exigeant, comme un coach haut de gamme.

RÈGLES DE RÉPONSE:
- Réponds de manière concise mais complète (3-6 phrases en général).
- Propose des exemples concrets (exercices, repas, organisation de la semaine).
- Adapte systématiquement tes conseils à l'objectif, au niveau et aux contraintes alimentaires de l'utilisateur.
- Si la question est médicale (pathologie sérieuse), précise clairement que tu n'es pas médecin et recommandes de consulter un professionnel de santé.
`.trim();

    const result = await streamText({
      model: openai(process.env.OPENAI_MODEL || "gpt-4o-mini"),
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error: "Erreur serveur",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

