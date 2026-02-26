import { getUserIdOrRedirect } from "@/lib/auth-helpers";
import { getSportsProgramData } from "@/app/actions/member-actions";
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
  Target,
  TrendingUp,
  Calendar,
  Dumbbell,
  Activity,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { SportPlanDisplay } from "@/components/member/plan-display";

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

function getLevelLabel(level: string | null): string {
  switch (level) {
    case "DEBUTANT":
      return "Débutant";
    case "INTERMEDIAIRE":
      return "Intermédiaire";
    case "CONFIRME":
      return "Confirmé";
    default:
      return level || "Non défini";
  }
}

function getFrequencyLabel(frequency: string | null): string {
  switch (frequency) {
    case "UNE_DEUX":
      return "1-2 fois par semaine";
    case "TROIS_QUATRE":
      return "3-4 fois par semaine";
    case "CINQ_PLUS":
      return "5+ fois par semaine";
    default:
      return frequency || "Non défini";
  }
}

// Example workout programs based on goals
function getWorkoutRecommendations(
  goal: string | null,
  level: string | null
): { name: string; description: string; duration: string }[] {
  if (goal === "PERTE_POIDS") {
    return [
      {
        name: "Cardio HIIT",
        description: "Entraînement par intervalles haute intensité",
        duration: "30 min",
      },
      {
        name: "Full Body Circuit",
        description: "Circuit complet pour brûler des calories",
        duration: "45 min",
      },
      {
        name: "Cardio Endurance",
        description: "Travail d'endurance cardiovasculaire",
        duration: "40 min",
      },
    ];
  } else if (goal === "PRISE_MASSE" || goal === "SE_MUSCLER") {
    return [
      {
        name: "Push Day",
        description: "Pectoraux, épaules, triceps",
        duration: "50 min",
      },
      {
        name: "Pull Day",
        description: "Dos, biceps, trapèzes",
        duration: "50 min",
      },
      {
        name: "Leg Day",
        description: "Quadriceps, ischio-jambiers, mollets",
        duration: "55 min",
      },
    ];
  } else if (goal === "RAFFERMIR") {
    return [
      {
        name: "Tonification Haut du Corps",
        description: "Renforcement bras, épaules, dos",
        duration: "40 min",
      },
      {
        name: "Tonification Bas du Corps",
        description: "Cuisses, fessiers, mollets",
        duration: "40 min",
      },
      {
        name: "Core & Abdos",
        description: "Renforcement de la ceinture abdominale",
        duration: "30 min",
      },
    ];
  }
  return [
    {
      name: "Full Body",
      description: "Entraînement complet du corps",
      duration: "45 min",
    },
    {
      name: "Cardio Mix",
      description: "Mélange cardio et renforcement",
      duration: "40 min",
    },
    {
      name: "Stretching",
      description: "Étirements et mobilité",
      duration: "30 min",
    },
  ];
}

export default async function SportsProgramPage() {
  const userId = await getUserIdOrRedirect();
  const [programData, weeklyPlan] = await Promise.all([
    getSportsProgramData(userId),
    getCurrentWeeklyPlan(userId),
  ]);

  const hasPreferences = programData.goal || programData.level || programData.frequency;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Programme Sportif</h1>
        <p className="text-muted-foreground mt-2">
          Votre programme personnalisé basé sur vos objectifs
        </p>
      </div>

      {!hasPreferences ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Configurez votre programme
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Pour recevoir des recommandations personnalisées, complétez
              d&apos;abord votre profil sportif avec vos objectifs et votre
              niveau.
            </p>
            <Button asChild>
              <Link href="/onboarding">Compléter mon profil</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Profile Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Objectif
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span className="text-lg font-semibold">
                    {getGoalLabel(programData.goal)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Niveau
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-lg font-semibold">
                    {getLevelLabel(programData.level)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Fréquence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="text-lg font-semibold">
                    {getFrequencyLabel(programData.frequency)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI-Generated Weekly Plan */}
          {weeklyPlan?.sportData && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Votre Plan Hebdomadaire</h2>
                {weeklyPlan.status === "DEMO" && (
                  <Badge variant="secondary" className="text-xs">
                    Aperçu démo
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Semaine du {format(new Date(weeklyPlan.weekStartDate), "d MMMM yyyy", { locale: fr })}
              </p>
              <SportPlanDisplay data={weeklyPlan.sportData} userId={userId} />
            </div>
          )}

          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Dernières Séances
              </CardTitle>
              <CardDescription>
                Historique de vos entraînements récents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {programData.recentSessions.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <p>Aucune séance enregistrée pour le moment.</p>
                  <Button asChild className="mt-4" variant="outline">
                    <Link href="/member">Réserver une séance</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {programData.recentSessions.slice(0, 5).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Dumbbell className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {session.programUsed || "Séance libre"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(session.date), "EEEE d MMMM", {
                              locale: fr,
                            })}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips Section */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Conseils pour atteindre votre objectif</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {programData.goal === "PERTE_POIDS" && (
                  <>
                    <div className="p-3 rounded-lg bg-background">
                      <h4 className="font-medium">Cardio régulier</h4>
                      <p className="text-sm text-muted-foreground">
                        Privilégiez les séances de cardio de 30-45 minutes
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-background">
                      <h4 className="font-medium">Déficit calorique</h4>
                      <p className="text-sm text-muted-foreground">
                        Associez l&apos;exercice à une alimentation équilibrée
                      </p>
                    </div>
                  </>
                )}
                {(programData.goal === "PRISE_MASSE" ||
                  programData.goal === "SE_MUSCLER") && (
                  <>
                    <div className="p-3 rounded-lg bg-background">
                      <h4 className="font-medium">Progression</h4>
                      <p className="text-sm text-muted-foreground">
                        Augmentez progressivement les charges
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-background">
                      <h4 className="font-medium">Récupération</h4>
                      <p className="text-sm text-muted-foreground">
                        Respectez les jours de repos entre les séances
                      </p>
                    </div>
                  </>
                )}
                {programData.goal === "RAFFERMIR" && (
                  <>
                    <div className="p-3 rounded-lg bg-background">
                      <h4 className="font-medium">Régularité</h4>
                      <p className="text-sm text-muted-foreground">
                        Maintenez une fréquence régulière d&apos;entraînement
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-background">
                      <h4 className="font-medium">Mix cardio/renfo</h4>
                      <p className="text-sm text-muted-foreground">
                        Alternez entre cardio et renforcement musculaire
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
