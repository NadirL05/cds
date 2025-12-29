"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestEmailPage() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [planName, setPlanName] = useState("ZAPOY");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          firstName: firstName || undefined,
          planName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: `Email envoyé avec succès ! (ID: ${data.messageId})`,
        });
      } else {
        setResult({
          success: false,
          error: data.error || "Erreur inconnue",
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Erreur lors de l'envoi",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 max-w-2xl px-4">
        <Card>
        <CardHeader>
          <CardTitle>Test d'envoi d'email de bienvenue</CardTitle>
          <CardDescription>
            Testez l'envoi d'email de bienvenue via Resend
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email destinataire *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom (optionnel)</Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Nadir"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="planName">Plan</Label>
              <select
                id="planName"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="DIGITAL">DIGITAL</option>
                <option value="ZAPOY">ZAPOY</option>
                <option value="COACHING">COACHING</option>
              </select>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Envoi en cours..." : "Envoyer l'email de test"}
            </Button>
          </form>

          {result && (
            <div
              className={`mt-4 p-4 rounded-md ${
                result.success
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {result.success ? (
                <div>
                  <strong>✅ Succès !</strong>
                  <p className="mt-2">{result.message}</p>
                </div>
              ) : (
                <div>
                  <strong>❌ Erreur</strong>
                  <p className="mt-2">{result.error}</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-slate-50 rounded-md text-sm text-slate-600">
            <p className="font-semibold mb-2">📝 Note :</p>
            <ul className="list-disc list-inside space-y-1">
              <li>L'email sera envoyé depuis onboarding@resend.dev (sender de test)</li>
              <li>Vérifiez votre boîte de réception (et les spams)</li>
              <li>Assurez-vous que RESEND_API_KEY est configuré dans .env.local</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

