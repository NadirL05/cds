"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked: "Un compte existe déjà avec cette adresse email. Connectez-vous avec votre mot de passe.",
  OAuthSignin: "Erreur lors de la connexion Google. Veuillez réessayer.",
  OAuthCallback: "Erreur de retour OAuth. Veuillez réessayer.",
  Callback: "Erreur de callback. Veuillez réessayer.",
  AccessDenied: "Accès refusé.",
  Verification: "Le lien de vérification est invalide ou expiré.",
  Default: "Une erreur d'authentification est survenue.",
};

function ErrorContent() {
  const params = useSearchParams();
  const error = params.get("error") ?? "Default";
  const message = ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 border border-red-500/30">
          <span className="text-2xl">⚠️</span>
        </div>
        <h1 className="font-heading text-3xl font-bold text-white">Erreur d'authentification</h1>
        <p className="text-slate-400">{message}</p>
        <Link href="/auth/signin">
          <Button className="w-full bg-[#ff5500] hover:bg-[#ff6600] text-white font-heading">
            Retour à la connexion
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={null}>
      <ErrorContent />
    </Suspense>
  );
}
