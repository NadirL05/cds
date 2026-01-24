import { getUserIdOrRedirect } from "@/lib/auth-helpers";
import { getSubscriptionDetails } from "@/app/actions/member-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CreditCard,
  Calendar,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

function getPlanDetails(plan: string | null) {
  switch (plan) {
    case "essential":
      return {
        name: "Essential",
        price: "49€/mois",
        sessions: 4,
        features: [
          "4 séances par mois",
          "Accès à tous les équipements",
          "Programme personnalisé",
        ],
      };
    case "premium":
      return {
        name: "Premium",
        price: "89€/mois",
        sessions: 8,
        features: [
          "8 séances par mois",
          "Accès à tous les équipements",
          "Programme personnalisé",
          "Coaching nutritionnel",
          "Suivi de progression",
        ],
      };
    case "unlimited":
      return {
        name: "Unlimited",
        price: "149€/mois",
        sessions: null,
        features: [
          "Séances illimitées",
          "Accès à tous les équipements",
          "Programme personnalisé",
          "Coaching nutritionnel",
          "Suivi de progression",
          "Accès prioritaire",
        ],
      };
    default:
      return {
        name: "Aucun plan",
        price: "-",
        sessions: 0,
        features: [],
      };
  }
}

function getStatusBadge(status: string | null) {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="mr-1 h-3 w-3" />
          Actif
        </Badge>
      );
    case "trialing":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Sparkles className="mr-1 h-3 w-3" />
          Période d&apos;essai
        </Badge>
      );
    case "past_due":
      return (
        <Badge variant="destructive">
          <AlertCircle className="mr-1 h-3 w-3" />
          Paiement en retard
        </Badge>
      );
    case "canceled":
      return (
        <Badge variant="secondary">
          Annulé
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          {status || "Inconnu"}
        </Badge>
      );
  }
}

export default async function SubscriptionPage() {
  const userId = await getUserIdOrRedirect();
  const subscription = await getSubscriptionDetails(userId);
  const planDetails = getPlanDetails(subscription.plan);

  const sessionProgress =
    subscription.maxSessionsPerMonth !== null
      ? (subscription.sessionsUsedThisMonth / subscription.maxSessionsPerMonth) *
        100
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mon Abonnement</h1>
        <p className="text-muted-foreground mt-2">
          Gérez votre abonnement et suivez votre utilisation
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Plan Actuel
              </CardTitle>
              <CardDescription>Détails de votre abonnement</CardDescription>
            </div>
            {getStatusBadge(subscription.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="text-3xl font-bold capitalize">
                {planDetails.name}
              </div>
              <div className="text-xl text-muted-foreground">
                {planDetails.price}
              </div>

              {subscription.currentPeriodEnd && (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Prochain renouvellement :{" "}
                  {format(new Date(subscription.currentPeriodEnd), "d MMMM yyyy", {
                    locale: fr,
                  })}
                </div>
              )}

              {subscription.trialEndsAt && (
                <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                  <Sparkles className="h-4 w-4" />
                  Essai gratuit jusqu&apos;au :{" "}
                  {format(new Date(subscription.trialEndsAt), "d MMMM yyyy", {
                    locale: fr,
                  })}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Inclus dans votre plan :</h4>
              <ul className="space-y-2">
                {planDetails.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisation des Séances</CardTitle>
          <CardDescription>
            Suivez votre consommation ce mois-ci
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscription.maxSessionsPerMonth !== null ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {subscription.sessionsUsedThisMonth}
                </span>
                <span className="text-muted-foreground">
                  sur {subscription.maxSessionsPerMonth} séances
                </span>
              </div>
              <Progress value={sessionProgress} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {subscription.maxSessionsPerMonth -
                  subscription.sessionsUsedThisMonth >
                0
                  ? `Il vous reste ${
                      subscription.maxSessionsPerMonth -
                      subscription.sessionsUsedThisMonth
                    } séance(s) ce mois-ci`
                  : "Vous avez utilisé toutes vos séances ce mois-ci"}
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-primary">
                {subscription.sessionsUsedThisMonth}
              </div>
              <p className="text-muted-foreground">
                séances effectuées ce mois-ci
              </p>
              <p className="text-sm text-green-600 mt-2">
                Accès illimité avec votre plan
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Section */}
      {subscription.plan !== "unlimited" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Passez au niveau supérieur
            </CardTitle>
            <CardDescription>
              Débloquez plus de fonctionnalités et de séances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {subscription.plan === "essential"
                    ? "Passez à Premium pour 8 séances/mois et le coaching nutritionnel"
                    : "Passez à Unlimited pour des séances illimitées et un accès prioritaire"}
                </p>
              </div>
              <Button asChild>
                <Link href="/subscribe">Voir les offres</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manage Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Gérer mon abonnement</CardTitle>
          <CardDescription>
            Modifiez ou annulez votre abonnement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" disabled>
              Modifier le moyen de paiement
            </Button>
            <Button variant="outline" disabled>
              Télécharger les factures
            </Button>
            <Button variant="ghost" className="text-destructive" disabled>
              Annuler l&apos;abonnement
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Pour toute modification, contactez notre support à support@cds-sport.fr
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
