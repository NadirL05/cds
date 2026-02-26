import { getUserIdOrRedirect } from "@/lib/auth-helpers";
import { getNutritionProgramData } from "@/app/actions/member-actions";
import { getCurrentWeeklyPlan } from "@/app/actions/plan-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Utensils,
  Apple,
  Beef,
  Fish,
  Egg,
  Coffee,
  AlertTriangle,
  Target,
  CheckCircle,
  XCircle,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { NutritionPlanDisplay } from "@/components/member/plan-display";

function getGoalLabel(goal: string | null): string {
  switch (goal) {
    case "RAFFERMIR":
      return "Raffermir";
    case "PRISE_MASSE":
      return "Prise de masse";
    case "PERTE_POIDS":
      return "Perte de poids";
    case "SE_MUSCLER":
      return "Se muscler";
    default:
      return goal || "Non défini";
  }
}

// Nutrition recommendations based on goal
function getNutritionTips(goal: string | null) {
  switch (goal) {
    case "PERTE_POIDS":
      return {
        calories: "Déficit de 300-500 kcal/jour",
        protein: "1.6-2g de protéines/kg de poids",
        carbs: "Privilégiez les glucides complexes",
        fats: "30% des calories en graisses saines",
        tips: [
          "Mangez des légumes à chaque repas",
          "Évitez les sucres ajoutés",
          "Hydratez-vous suffisamment (2L/jour)",
          "Préférez les protéines maigres",
        ],
      };
    case "PRISE_MASSE":
    case "SE_MUSCLER":
      return {
        calories: "Surplus de 300-500 kcal/jour",
        protein: "1.8-2.2g de protéines/kg de poids",
        carbs: "Glucides autour des entraînements",
        fats: "0.8-1g de graisses/kg de poids",
        tips: [
          "Mangez toutes les 3-4 heures",
          "Protéines à chaque repas",
          "Collation post-entraînement",
          "Ne négligez pas les glucides",
        ],
      };
    case "RAFFERMIR":
      return {
        calories: "Maintenance ou léger déficit",
        protein: "1.6-2g de protéines/kg de poids",
        carbs: "Glucides adaptés à l'activité",
        fats: "Équilibre oméga 3/6",
        tips: [
          "Équilibrez vos macros",
          "Variez les sources de protéines",
          "Fruits et légumes de saison",
          "Limitez les aliments transformés",
        ],
      };
    default:
      return {
        calories: "Adaptées à vos besoins",
        protein: "1.5-2g de protéines/kg de poids",
        carbs: "Glucides de qualité",
        fats: "Graisses essentielles",
        tips: [
          "Alimentation variée et équilibrée",
          "Hydratation régulière",
          "Évitez les excès de sucre",
          "Écoutez votre corps",
        ],
      };
  }
}

// Sample meal plan
function getMealPlan(goal: string | null) {
  const baseMeals = {
    breakfast: {
      title: "Petit-déjeuner",
      items:
        goal === "PERTE_POIDS"
          ? ["Oeufs brouillés", "Pain complet", "Fruits frais"]
          : goal === "PRISE_MASSE"
          ? ["Porridge aux flocons d'avoine", "Banane", "Beurre de cacahuète"]
          : ["Yaourt grec", "Granola maison", "Fruits rouges"],
    },
    lunch: {
      title: "Déjeuner",
      items:
        goal === "PERTE_POIDS"
          ? ["Salade de poulet grillé", "Légumes variés", "Vinaigrette légère"]
          : goal === "PRISE_MASSE"
          ? ["Riz complet", "Poulet grillé", "Légumes sautés"]
          : ["Quinoa", "Saumon", "Légumes vapeur"],
    },
    dinner: {
      title: "Dîner",
      items:
        goal === "PERTE_POIDS"
          ? ["Poisson blanc", "Légumes verts", "Patate douce"]
          : goal === "PRISE_MASSE"
          ? ["Pâtes complètes", "Boeuf haché", "Sauce tomate maison"]
          : ["Tofu grillé", "Riz basmati", "Wok de légumes"],
    },
    snacks: {
      title: "Collations",
      items:
        goal === "PERTE_POIDS"
          ? ["Fruits frais", "Amandes (30g)", "Yaourt nature"]
          : goal === "PRISE_MASSE"
          ? ["Shake protéiné", "Banane + beurre d'amande", "Fromage blanc"]
          : ["Fruits secs", "Houmous + crudités", "Smoothie"],
    },
  };
  return baseMeals;
}

export default async function NutritionPage() {
  const userId = await getUserIdOrRedirect();
  const [nutritionData, weeklyPlan] = await Promise.all([
    getNutritionProgramData(userId),
    getCurrentWeeklyPlan(userId),
  ]);
  const nutritionTips = getNutritionTips(nutritionData.goal);

  const hasPreferences =
    nutritionData.eatsMeat !== null ||
    nutritionData.eatsFish !== null ||
    nutritionData.veggies.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Programme Nutrition</h1>
        <p className="text-muted-foreground mt-2">
          Conseils nutritionnels adaptés à vos objectifs
        </p>
      </div>

      {!hasPreferences ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Utensils className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Configurez vos préférences alimentaires
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Pour recevoir des recommandations personnalisées, complétez
              d&apos;abord vos préférences alimentaires.
            </p>
            <Button asChild>
              <Link href="/onboarding">Compléter mon profil</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Goal & Preferences Overview */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Objectif Actuel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getGoalLabel(nutritionData.goal)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Vos recommandations sont adaptées à cet objectif
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Préférences Alimentaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {nutritionData.eatsMeat !== null && (
                    <Badge
                      variant={nutritionData.eatsMeat ? "default" : "secondary"}
                      className="flex items-center gap-1"
                    >
                      {nutritionData.eatsMeat ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      <Beef className="h-3 w-3 ml-1" />
                      Viande
                    </Badge>
                  )}
                  {nutritionData.eatsFish !== null && (
                    <Badge
                      variant={nutritionData.eatsFish ? "default" : "secondary"}
                      className="flex items-center gap-1"
                    >
                      {nutritionData.eatsFish ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      <Fish className="h-3 w-3 ml-1" />
                      Poisson
                    </Badge>
                  )}
                  {nutritionData.eatsEggs !== null && (
                    <Badge
                      variant={nutritionData.eatsEggs ? "default" : "secondary"}
                      className="flex items-center gap-1"
                    >
                      {nutritionData.eatsEggs ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      <Egg className="h-3 w-3 ml-1" />
                      Oeufs
                    </Badge>
                  )}
                </div>

                {nutritionData.dietaryRestrictions && (
                  <div className="mt-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                    <div className="flex items-center gap-2 text-yellow-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Restrictions</span>
                    </div>
                    <p className="text-sm mt-1 text-yellow-600/80">
                      {nutritionData.dietaryRestrictions}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Macro Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Apple className="h-5 w-5" />
                Recommandations Macros
              </CardTitle>
              <CardDescription>
                Objectifs nutritionnels pour {getGoalLabel(nutritionData.goal)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
                  <h4 className="font-medium text-red-600">Calories</h4>
                  <p className="text-sm text-red-600/80 mt-1">
                    {nutritionTips.calories}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <h4 className="font-medium text-blue-600">Protéines</h4>
                  <p className="text-sm text-blue-600/80 mt-1">
                    {nutritionTips.protein}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                  <h4 className="font-medium text-yellow-600">Glucides</h4>
                  <p className="text-sm text-yellow-600/80 mt-1">
                    {nutritionTips.carbs}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <h4 className="font-medium text-green-600">Lipides</h4>
                  <p className="text-sm text-green-600/80 mt-1">
                    {nutritionTips.fats}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI-Generated Weekly Nutrition Plan */}
          {weeklyPlan?.nutritionData && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-500" />
                <h2 className="text-lg font-semibold">Votre Plan Alimentaire Hebdomadaire</h2>
                {weeklyPlan.status === "DEMO" && (
                  <Badge variant="secondary" className="text-xs">
                    Aperçu démo
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Semaine du {format(new Date(weeklyPlan.weekStartDate), "d MMMM yyyy", { locale: fr })}
              </p>
              <NutritionPlanDisplay data={weeklyPlan.nutritionData} userId={userId} />
            </div>
          )}

          {/* Tips Section */}
          <Card className="border-green-500/20 bg-green-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coffee className="h-5 w-5" />
                Conseils Pratiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {nutritionTips.tips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-background"
                  >
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{tip}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Foods Preferences */}
          {(nutritionData.veggies.length > 0 ||
            nutritionData.starches.length > 0 ||
            nutritionData.drinks.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Vos Préférences</CardTitle>
                <CardDescription>
                  Aliments que vous avez sélectionnés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {nutritionData.veggies.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Légumes préférés
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {nutritionData.veggies.map((veggie, i) => (
                          <Badge key={i} variant="outline">
                            {veggie}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {nutritionData.starches.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Féculents préférés
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {nutritionData.starches.map((starch, i) => (
                          <Badge key={i} variant="outline">
                            {starch}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {nutritionData.drinks.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Boissons préférées
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {nutritionData.drinks.map((drink, i) => (
                          <Badge key={i} variant="outline">
                            {drink}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
