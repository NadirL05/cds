import { createCheckoutSession } from "@/app/actions/stripe-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

export default function SubscribePage() {
  return (
    <div className="flex min-h-screen flex-col items-center py-16 px-4">
      {/* Header */}
      <div className="text-center mb-14">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#ff5500]/10 border border-[#ff5500]/30">
          <span className="text-2xl">⚡</span>
        </div>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-3">
          Abonnement requis
        </h1>
        <p className="text-slate-400 text-lg max-w-md mx-auto">
          Choisissez votre plan pour accéder au dashboard et réserver vos sessions EMS.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="w-full max-w-5xl grid gap-8 md:grid-cols-3">
        {/* DIGITAL Plan */}
        <Card className="relative glass-card border-zinc-800 hover:border-zinc-700 transition-colors p-8">
          <CardHeader className="pb-6">
            <CardTitle className="font-heading text-white text-3xl">DIGITAL</CardTitle>
            <CardDescription className="text-slate-400 mt-2">Accès Application + Vidéos</CardDescription>
            <div className="mt-6">
              <span className="font-heading text-5xl font-bold text-white">4.99€</span>
              <span className="text-slate-400 ml-2">/mois</span>
            </div>
          </CardHeader>
          <CardContent className="text-slate-300 pb-8">
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[#ff5500]" />
                <span>Programmes d'entraînement digitaux</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[#ff5500]" />
                <span>Suivi de progression</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[#ff5500]" />
                <span>Accès mobile</span>
              </li>
            </ul>
            <form action={createCheckoutSession.bind(null, "DIGITAL")} className="mt-6">
              <Button type="submit" className="w-full bg-[#ff5500] hover:bg-[#ff6600] text-white button-skew font-heading text-lg py-6 neon-orange-hover">
                <span className="button-skew-inner">S'ABONNER</span>
              </Button>
            </form>
          </CardContent>
          <div className="glass-footer p-6 border-t border-zinc-800">
            <p className="text-xs text-slate-500 text-center">Accès illimité</p>
          </div>
        </Card>

        {/* ZAPOY Plan */}
        <Card className="relative glass-card border-2 border-[#ff5500]/50 hover:border-[#ff5500] transition-colors p-8">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="font-marker rounded-full bg-[#ff5500] px-4 py-1 text-sm text-white neon-orange-hover">
              Populaire
            </span>
          </div>
          <CardHeader className="pb-6">
            <CardTitle className="font-heading text-white text-3xl">ZAPOY</CardTitle>
            <CardDescription className="text-slate-400 mt-2">L'expérience EMS complète</CardDescription>
            <div className="mt-6">
              <span className="font-heading text-5xl font-bold text-white">32.50€</span>
              <span className="text-slate-400 ml-2">/session</span>
            </div>
          </CardHeader>
          <CardContent className="text-slate-300 pb-8">
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[#ff5500]" />
                <span>Tout de DIGITAL</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[#ff5500]" />
                <span>Accès illimité au studio</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[#ff5500]" />
                <span>Réservation de créneaux</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[#ff5500]" />
                <span>Équipement Sportec EMS</span>
              </li>
            </ul>
            <form action={createCheckoutSession.bind(null, "ZAPOY")} className="mt-6">
              <Button type="submit" className="w-full bg-[#ff5500] hover:bg-[#ff6600] text-white button-skew font-heading text-lg py-6 neon-orange-hover">
                <span className="button-skew-inner">S'ABONNER</span>
              </Button>
            </form>
          </CardContent>
          <div className="glass-footer p-6 border-t border-zinc-800">
            <p className="text-xs text-slate-500 text-center">Plan le plus populaire</p>
          </div>
        </Card>

        {/* COACHING Plan */}
        <Card className="relative glass-card border-zinc-800 hover:border-zinc-700 transition-colors p-8">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="font-marker rounded-full bg-[#ff5500] px-4 py-1 text-sm text-white neon-orange-hover">
              Premium
            </span>
          </div>
          <CardHeader className="pb-6">
            <CardTitle className="font-heading text-white text-3xl">COACHING</CardTitle>
            <CardDescription className="text-slate-400 mt-2">Suivi Elite & Nutrition</CardDescription>
            <div className="mt-6">
              <span className="font-heading text-5xl font-bold text-white">89€</span>
              <span className="text-slate-400 ml-2">/mois</span>
            </div>
          </CardHeader>
          <CardContent className="text-slate-300 pb-8">
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[#ff5500]" />
                <span>Tout de ZAPOY</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[#ff5500]" />
                <span>Accompagnement personnalisé</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[#ff5500]" />
                <span>Plan d'entraînement sur mesure</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[#ff5500]" />
                <span>Suivi nutritionnel</span>
              </li>
            </ul>
            <form action={createCheckoutSession.bind(null, "COACHING")} className="mt-6">
              <Button type="submit" className="w-full bg-[#ff5500] hover:bg-[#ff6600] text-white button-skew font-heading text-lg py-6 neon-orange-hover">
                <span className="button-skew-inner">S'ABONNER</span>
              </Button>
            </form>
          </CardContent>
          <div className="glass-footer p-6 border-t border-zinc-800">
            <p className="text-xs text-slate-500 text-center">Premium exclusif</p>
          </div>
        </Card>
      </div>

      {/* Back link */}
      <div className="mt-12">
        <Link href="/member/profile" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
          ← Retour au profil
        </Link>
      </div>
    </div>
  );
}
