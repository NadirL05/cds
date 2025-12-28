import { createCheckoutSession } from "@/app/actions/stripe-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">CDS Sport</span>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Se connecter</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Créer un compte</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          Transformez votre corps avec
          <br />
          <span className="text-primary">l'entraînement EMS</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600 max-w-2xl">
          Choisissez le plan qui correspond à vos objectifs. Accès immédiat à nos programmes
          d'entraînement EMS personnalisés.
        </p>
      </section>

      {/* Pricing Section */}
      <section className="container py-24">
        <div className="grid gap-8 md:grid-cols-3">
          {/* DIGITAL Plan */}
          <Card className="relative">
            <CardHeader>
              <CardTitle>DIGITAL</CardTitle>
              <CardDescription>Accès aux programmes en ligne</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">29€</span>
                <span className="text-muted-foreground">/mois</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Programmes d'entraînement digitaux</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Suivi de progression</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Accès mobile</span>
                </li>
              </ul>
              <form action={createCheckoutSession.bind(null, "DIGITAL")} className="mt-6">
                <Button type="submit" className="w-full">
                  S'abonner
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* ZAPOY Plan */}
          <Card className="relative border-primary">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                Populaire
              </span>
            </div>
            <CardHeader>
              <CardTitle>ZAPOY</CardTitle>
              <CardDescription>Plan complet avec coaching</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">59€</span>
                <span className="text-muted-foreground">/mois</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Tout de DIGITAL</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Coaching personnalisé</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Support prioritaire</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Accès aux événements</span>
                </li>
              </ul>
              <form action={createCheckoutSession.bind(null, "ZAPOY")} className="mt-6">
                <Button type="submit" className="w-full">
                  S'abonner
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* COACHING Plan */}
          <Card className="relative">
            <CardHeader>
              <CardTitle>COACHING</CardTitle>
              <CardDescription>Coaching intensif et premium</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">99€</span>
                <span className="text-muted-foreground">/mois</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Tout de ZAPOY</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Sessions individuelles</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Plan nutritionnel personnalisé</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Support 24/7</span>
                </li>
              </ul>
              <form action={createCheckoutSession.bind(null, "COACHING")} className="mt-6">
                <Button type="submit" className="w-full">
                  S'abonner
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2024 CDS Sport. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
