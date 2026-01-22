"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function AdminToolsPage() {
  const [isLoading, setIsLoading] = useState(false);

  const triggerWeeklyRecap = async () => {
    try {
      setIsLoading(true);
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
    } catch (error) {
      toast.error("Erreur réseau lors de l'appel API.");
    } finally {
      setIsLoading(false);
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
        <Card className="glass-card border-zinc-800">
          <CardHeader>
            <CardTitle>Weekly Recap Trigger</CardTitle>
            <CardDescription>
              Force l&apos;envoi du récapitulatif hebdomadaire à tous les membres actifs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={triggerWeeklyRecap}
              disabled={isLoading}
              className="bg-[#ff5500] hover:bg-[#ff6600] text-white"
            >
              {isLoading ? "Envoi en cours..." : "Envoyer les emails maintenant"}
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Utilise le token de test <code>test-secret-123</code>. À sécuriser différemment en production.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

