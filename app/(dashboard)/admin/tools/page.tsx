"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, Mail, Loader2, Zap } from "lucide-react";

export default function AdminToolsPage() {
  const [isRecapLoading, setIsRecapLoading] = useState(false);
  const [isCronLoading, setIsCronLoading] = useState(false);
  const [isYieldLoading, setIsYieldLoading] = useState(false);

  const triggerWeeklyRecap = async () => {
    try {
      setIsRecapLoading(true);
      const response = await fetch("/api/admin/cron-trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "recap" }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error("Erreur lors du déclenchement du récap.", {
          description: data.error || "Une erreur est survenue côté serveur.",
        });
        return;
      }

      toast.success("Récap hebdo déclenché !", {
        description: `Emails envoyés : ${data.sent ?? 0}, erreurs : ${data.errors ?? 0}`,
      });
    } catch {
      toast.error("Erreur réseau lors de l'appel API.");
    } finally {
      setIsRecapLoading(false);
    }
  };

  const triggerCronGeneration = async () => {
    try {
      setIsCronLoading(true);
      toast.info("Déclenchement du cron...", {
        description: "Génération des plans pour tous les membres actifs.",
      });

      const response = await fetch("/api/admin/cron-trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "generate" }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error("Erreur lors de l'exécution du cron", {
          description: data.error || data.message || "Une erreur est survenue.",
        });
        return;
      }

      toast.success("Cron exécuté avec succès !", {
        description: `${data.stats?.generated ?? 0} plans générés pour ${data.stats?.totalActiveUsers ?? 0} membres actifs`,
      });
    } catch {
      toast.error("Erreur réseau lors de l'appel API.");
    } finally {
      setIsCronLoading(false);
    }
  };

  const triggerYieldManagement = async () => {
    try {
      setIsYieldLoading(true);
      toast.info("Analyse des créneaux vides...", {
        description: "Déclenchement de l'algorithme de yield management pour demain.",
      });

      const response = await fetch("/api/admin/yield", {
        method: "POST",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        toast.error("Erreur lors du lancement de l'algorithme de remplissage.", {
          description: data.error || "Une erreur est survenue côté serveur.",
        });
        return;
      }

      toast.success("Algorithme de yield terminé", {
        description: `Créneaux détectés : ${data.emptySlotsFound ?? 0}, emails envoyés : ${data.emailsSent ?? 0}`,
      });
    } catch {
      toast.error("Erreur réseau lors de l'appel API.");
    } finally {
      setIsYieldLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Outils Admin & Tests</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Zone réservée pour déclencher manuellement certaines automatisations et effectuer des tests.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Weekly Recap */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Weekly Recap Trigger
            </CardTitle>
            <CardDescription>
              Force l&apos;envoi du récapitulatif hebdomadaire à tous les membres actifs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={triggerWeeklyRecap}
              disabled={isRecapLoading}
              className="w-full"
            >
              {isRecapLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                "Envoyer les emails"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* AI Plan Generation - Cron */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Génération IA (Cron)
              <Badge variant="secondary" className="ml-auto">OpenAI</Badge>
            </CardTitle>
            <CardDescription>
              Déclenche la génération des plans sport & nutrition pour tous les membres actifs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={triggerCronGeneration}
              disabled={isCronLoading}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isCronLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Générer les plans (tous)
                </>
              )}
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Génère les plans pour la semaine prochaine. Nécessite <code className="bg-muted px-1 rounded">OPENAI_API_KEY</code>
            </p>
          </CardContent>
        </Card>

        {/* API Info */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration API</CardTitle>
            <CardDescription>
              Endpoints disponibles pour les automatisations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <p className="font-medium">Proxy admin (ce bouton) :</p>
              <code className="text-xs bg-muted px-2 py-1 rounded block mt-1">
                POST /api/admin/cron-trigger
              </code>
            </div>
            <div className="text-sm">
              <p className="font-medium">Cron Vercel (production) :</p>
              <code className="text-xs bg-muted px-2 py-1 rounded block mt-1">
                POST /api/cron/weekly-recap
              </code>
              <code className="text-xs bg-muted px-2 py-1 rounded block mt-1">
                POST /api/cron/weekly-generate
              </code>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
              <p className="text-xs text-green-600">
                <strong>Sécurisé :</strong> Le proxy vérifie la session admin et lit <code>CRON_SECRET</code> côté serveur.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Yield Management (Ventes Flash) */}
        <Card className="border-orange-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" />
              Yield Management (Ventes Flash)
              <Badge variant="outline" className="ml-auto border-orange-500 text-orange-500">
                Revenue Boost
              </Badge>
            </CardTitle>
            <CardDescription>
              Analyse les créneaux vides de demain et envoie une promotion Flash aux membres 100% Digital pour maximiser les revenus.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={triggerYieldManagement}
              disabled={isYieldLoading}
              className="w-full bg-orange-500 hover:bg-orange-500/90"
            >
              {isYieldLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Algorithme en cours...
                </>
              ) : (
                "Lancer l'algorithme de remplissage"
              )}
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Utilise les données de réservation pour identifier les créneaux sous-performants et proposer des Drop-ins à tarif préférentiel.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
