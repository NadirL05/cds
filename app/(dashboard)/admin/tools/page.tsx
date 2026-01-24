"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, Mail, Loader2 } from "lucide-react";

export default function AdminToolsPage() {
  const [isRecapLoading, setIsRecapLoading] = useState(false);
  const [isCronLoading, setIsCronLoading] = useState(false);

  const triggerWeeklyRecap = async () => {
    try {
      setIsRecapLoading(true);
      const response = await fetch("/api/cron/weekly-recap", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-secret-123",
        },
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

  // Note: In production, this endpoint should only be triggered by Vercel Cron
  // This manual trigger uses a hardcoded test secret for development purposes only
  const triggerCronGeneration = async () => {
    try {
      setIsCronLoading(true);
      toast.info("Déclenchement du cron...", {
        description: "Génération des plans pour tous les membres actifs.",
      });

      const response = await fetch("/api/cron/weekly-generate", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-secret-123",
        },
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
            <p className="mt-3 text-xs text-muted-foreground">
              Token: <code className="bg-muted px-1 rounded">test-secret-123</code>
            </p>
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
              <p className="font-medium">Weekly Recap:</p>
              <code className="text-xs bg-muted px-2 py-1 rounded block mt-1">
                POST /api/cron/weekly-recap
              </code>
            </div>
            <div className="text-sm">
              <p className="font-medium">AI Generation:</p>
              <code className="text-xs bg-muted px-2 py-1 rounded block mt-1">
                POST /api/cron/weekly-generate
              </code>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
              <p className="text-xs text-yellow-600">
                <strong>Sécurité:</strong> En production, utilisez <code>CRON_SECRET</code> 
                comme token Bearer pour authentifier les appels.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
