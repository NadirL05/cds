import { createCheckoutSession } from "@/app/actions/stripe-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";
import { PaymentStatusHandler } from "@/components/payment-status";
import { Suspense } from "react";
import { BmiCalculator } from "@/components/bmi-calculator";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <PaymentStatusHandler />
      </Suspense>
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">CDS Sport</span>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/auth/signin">
              <Button variant="ghost" className="text-white hover:text-[#ff5500]">Se connecter</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-[#ff5500] hover:bg-[#ff6600] text-white button-skew font-heading neon-orange-hover">
                <span className="button-skew-inner">Créer un compte</span>
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto w-full flex flex-col items-center justify-center py-24 text-center px-4">
        <h1 className="font-heading text-6xl sm:text-7xl md:text-8xl font-bold text-white leading-none" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.7)' }}>
          TRANSFORMEZ
          <br />
          <span className="neon-orange neon-orange-hover">VOTRE CORPS</span>
          <br />
          AVEC L'<span className="font-marker neon-orange">EMS</span>
        </h1>
        <p className="mt-8 text-lg sm:text-xl leading-8 text-slate-300 max-w-2xl">
          Choisissez le plan qui correspond à vos objectifs. Accès immédiat à nos programmes
          d'entraînement EMS personnalisés.
        </p>
      </section>

      {/* BMI / Profil Section */}
      <BmiCalculator />

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto w-full py-24 px-4">
        <div className="grid gap-8 md:grid-cols-3">
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
      </section>

      {/* LE LABO CDS Section */}
      <section className="max-w-7xl mx-auto w-full py-24 px-4">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-4xl md:text-5xl text-white mb-4">LE LABO CDS</h2>
          <p className="text-slate-400 text-lg">Découvrez nos actualités et conseils</p>
        </div>
        
        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="glass-card border-zinc-800 hover:border-zinc-700 transition-colors p-8 rounded-lg">
            <div className="mb-4">
              <h3 className="font-heading text-2xl text-white mb-3">Nutrition EMS</h3>
              <p className="text-slate-400 text-sm">
                Optimisez votre alimentation pour maximiser les résultats de vos séances EMS.
              </p>
            </div>
            <div className="mt-6">
              <span className="text-xs text-[#ff5500] font-semibold">Lire plus →</span>
            </div>
          </article>

          <article className="glass-card border-zinc-800 hover:border-zinc-700 transition-colors p-8 rounded-lg">
            <div className="mb-4">
              <h3 className="font-heading text-2xl text-white mb-3">Récupération</h3>
              <p className="text-slate-400 text-sm">
                Les meilleures techniques de récupération après vos entraînements intensifs.
              </p>
            </div>
            <div className="mt-6">
              <span className="text-xs text-[#ff5500] font-semibold">Lire plus →</span>
            </div>
          </article>

          <article className="glass-card border-zinc-800 hover:border-zinc-700 transition-colors p-8 rounded-lg">
            <div className="mb-4">
              <h3 className="font-heading text-2xl text-white mb-3">Technique EMS</h3>
              <p className="text-slate-400 text-sm">
                Maîtrisez les fondamentaux de l'entraînement par stimulation électrique.
              </p>
            </div>
            <div className="mt-6">
              <span className="text-xs text-[#ff5500] font-semibold">Lire plus →</span>
            </div>
          </article>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12">
        <div className="max-w-7xl mx-auto text-center text-sm text-slate-400 px-4">
          <p>© 2024 CDS Sport. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
