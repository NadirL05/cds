import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Cpu, LineChart, Smartphone } from "lucide-react";

export default function FranchisePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-black/40 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-sm bg-[#ff5500] shadow-[0_0_20px_rgba(255,85,0,0.6)]" />
            <span className="font-heading text-lg font-semibold tracking-tight text-white">
              CDS Sport <span className="text-slate-400">for Business</span>
            </span>
          </div>
          <nav className="hidden items-center gap-4 text-sm text-slate-300 md:flex">
            <Link
              href="/"
              className="transition-colors hover:text-[#ff5500]"
            >
              Accueil B2C
            </Link>
            <Link
              href="#features"
              className="transition-colors hover:text-[#ff5500]"
            >
              Fonctionnalités
            </Link>
            <Link
              href="#pricing"
              className="transition-colors hover:text-[#ff5500]"
            >
              Tarifs
            </Link>
            <Button
              asChild
              className="bg-[#ff5500] text-white hover:bg-[#ff6611] shadow-[0_0_30px_rgba(255,85,0,0.7)]"
              size="sm"
            >
              <a href="mailto:contact@cds-sport.com?subject=Demande%20de%20d%C3%A9mo%20CDS%20Sport%20for%20Business">
                Demander une démo
              </a>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-slate-800/80">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,85,0,0.25),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.9),_transparent_60%)]" />
          <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-4 py-16 md:flex-row md:items-center md:py-24">
            <div className="max-w-xl space-y-6">
              <p className="inline-flex items-center gap-2 rounded-full border border-[#ff5500]/40 bg-black/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#ffedd5]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff5500]" />
                SaaS EMS pour studios ambitieux
              </p>
              <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                Remplissez vos créneaux vides
                <br />
                <span className="bg-gradient-to-r from-[#ff5500] via-amber-400 to-[#ff5500] bg-clip-text text-transparent">
                  et automatisez votre studio EMS.
                </span>
              </h1>
              <p className="text-base text-slate-300 sm:text-lg">
                CDS Sport est le premier logiciel de gestion propulsé par l&apos;IA
                qui génère du chiffre d&apos;affaires supplémentaire sans ajouter
                de charge mentale à votre équipe. Vous pilotez, l&apos;IA remplit.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button
                  className="bg-[#ff5500] text-white hover:bg-[#ff6611] button-skew font-heading text-base shadow-[0_0_40px_rgba(255,85,0,0.7)]"
                  size="lg"
                  asChild
                >
                  <a href="mailto:contact@cds-sport.com?subject=Demande%20de%20d%C3%A9mo%20CDS%20Sport%20for%20Business">
                    <span className="button-skew-inner flex items-center gap-2">
                      Demander une démo
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </a>
                </Button>
                <p className="text-xs text-slate-400">
                  ⏱️ 30 minutes pour voir comment transformer vos créneaux vides
                  en revenu récurrent.
                </p>
              </div>
              <div className="mt-4 grid gap-4 text-xs text-slate-400 sm:grid-cols-3 sm:text-sm">
                <div>
                  <p className="font-semibold text-slate-200">
                    +25% de CA par studio*
                  </p>
                  <p>Grâce aux ventes flash automatisées sur les créneaux vides.</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-200">
                    Zéro Excel, zéro prise de tête
                  </p>
                  <p>Planning, paiements et relances gérés par la plateforme.</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-200">
                    Expérience premium pour vos membres
                  </p>
                  <p>Coach IA + App installable sur leur téléphone.</p>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="relative mx-auto max-w-md rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-black/90 p-6 shadow-[0_0_45px_rgba(15,23,42,0.9)]">
                <div className="mb-4 flex items-center justify-between text-xs text-slate-400">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Algorithme de remplissage actif
                  </span>
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                    Live Studio
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-[1fr_auto] gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Demain — 18:00
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-100">
                        Créneau EMS sous-rempli détecté
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-center text-right">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">
                        Taux de remplissage
                      </p>
                      <p className="text-lg font-semibold text-amber-300">
                        3 / 6
                      </p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-transparent p-4 text-sm">
                    <p className="text-emerald-300">
                      ✅ Vente flash envoyée à 42 membres DIGITAL
                    </p>
                    <p className="mt-1 text-slate-200">
                      Projection de revenu supplémentaire :{" "}
                      <span className="font-semibold text-emerald-300">
                        +630€ / mois
                      </span>
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs text-slate-300">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">
                        Réservations
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        +18%
                      </p>
                      <p className="mt-0.5 text-[11px] text-emerald-400">
                        vs. mois dernier
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">
                        No-shows
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        -22%
                      </p>
                      <p className="mt-0.5 text-[11px] text-emerald-400">
                        rappels IA automatiques
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">
                        Temps d&apos;admin
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        -8h
                      </p>
                      <p className="mt-0.5 text-[11px] text-emerald-400">
                        par mois / studio
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    *Données issues des premiers studios pilotes CDS Sport.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features / Bento */}
        <section
          id="features"
          className="mx-auto max-w-7xl space-y-8 px-4 py-16 md:py-20"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-heading text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Pensé pour les{" "}
                <span className="text-[#ff5500]">propriétaires de studios</span>,
                pas pour les geeks.
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-slate-400 sm:text-base">
                Vous gérez les coachs, le matériel et l&apos;expérience client.
                CDS Sport s&apos;occupe du reste : planning, IA, paiements et
                remplissage automatique des créneaux.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-[2fr,3fr]">
            <Card className="border-slate-800 bg-slate-950/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-white">
                  <Cpu className="h-5 w-5 text-[#ff5500]" />
                  Le Coach IA intégré
                </CardTitle>
                <CardDescription>
                  Programmes & nutrition générés automatiquement pour chaque
                  membre.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <p>
                  Offrez à vos membres un accompagnement premium sans multiplier
                  les heures de coaching individuel. L&apos;IA génère plans
                  sportifs, séances EMS et recommandations nutritionnelles en
                  fonction du profil et de l&apos;historique.
                </p>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>
                      Augmentez la <strong>rétention</strong> en offrant un suivi
                      perçu comme &quot;sur-mesure&quot;.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>
                      Standardisez la qualité des programmes sur{" "}
                      <strong>tous vos coachs</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>
                      Gagnez du temps sur les tâches répétitives : fiches
                      d&apos;exercices, mails de suivi, rappels.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-slate-800 bg-slate-950/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <LineChart className="h-5 w-5 text-[#ff5500]" />
                    Yield Management
                  </CardTitle>
                  <CardDescription>
                    Vos créneaux vides deviennent des ventes flash automatiques.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-300">
                  <p>
                    CDS Sport scanne vos plannings, identifie les créneaux sous
                    remplis et déclenche des campagnes email / push ciblées sur
                    vos membres DIGITAL.
                  </p>
                  <ul className="space-y-1.5 text-slate-300">
                    <li>• Règles de remplissage configurables par studio.</li>
                    <li>• Prix drop-in dynamiques (happy hours, heures creuses).</li>
                    <li>• Reporting CA généré par l&apos;algorithme.</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-950/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Smartphone className="h-5 w-5 text-[#ff5500]" />
                    Application marque blanche (PWA)
                  </CardTitle>
                  <CardDescription>
                    Votre studio dans la poche de vos membres.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-300">
                  <p>
                    Les membres installent l&apos;application directement sur leur
                    écran d&apos;accueil (PWA). Votre logo, vos couleurs, vos
                    studios.
                  </p>
                  <ul className="space-y-1.5 text-slate-300">
                    <li>• Réservations en 2 clics.</li>
                    <li>• Notifications push & rappels de séance.</li>
                    <li>• Mise à jour instantanée, sans passer par les stores.</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section
          id="pricing"
          className="mx-auto max-w-7xl px-4 py-16 md:py-24 border-t border-slate-800/80"
        >
          <div className="mb-10 text-center">
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Tarifs simples, alignés sur{" "}
              <span className="text-[#ff5500]">votre croissance</span>.
            </h2>
            <p className="mt-3 text-sm text-slate-400 sm:text-base">
              Tous les plans incluent l&apos;accès multi-coachs, la gestion des
              membres et les mises à jour continues du logiciel.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Starter */}
            <Card className="border-slate-800 bg-slate-950/70">
              <CardHeader>
                <CardTitle className="font-heading text-xl text-white">
                  Starter
                </CardTitle>
                <CardDescription>
                  Pour lancer un premier studio EMS avec une base solide.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <span className="font-heading text-4xl font-bold text-white">
                    199€
                  </span>
                  <span className="ml-1 text-sm text-slate-400">/mois</span>
                </div>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• Planning de réservations en ligne</li>
                  <li>• Fiches clients et historique de séances</li>
                  <li>• Paiements en ligne & gestion des abonnements</li>
                  <li>• Support email</li>
                </ul>
                <Button
                  asChild
                  className="w-full bg-slate-800 text-slate-100 hover:bg-slate-700"
                >
                  <a href="mailto:contact@cds-sport.com?subject=CDS%20Sport%20Starter">
                    Parler au sales
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Growth */}
            <Card className="relative border-[#ff5500]/60 bg-gradient-to-b from-slate-950/60 to-slate-950/90 shadow-[0_0_40px_rgba(255,85,0,0.4)]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#ff5500] px-3 py-1 text-xs font-semibold text-white shadow-[0_0_20px_rgba(255,85,0,0.8)]">
                Recommandé
              </div>
              <CardHeader>
                <CardTitle className="font-heading text-xl text-white">
                  Growth
                </CardTitle>
                <CardDescription>
                  Pour les studios qui veulent maximiser leur taux de remplissage.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <span className="font-heading text-4xl font-bold text-white">
                    349€
                  </span>
                  <span className="ml-1 text-sm text-slate-300">/mois</span>
                </div>
                <ul className="space-y-2 text-sm text-slate-100">
                  <li>• Tout le plan Starter</li>
                  <li>• Yield Management automatisé</li>
                  <li>• Campagnes emails & promos flash</li>
                  <li>• Dashboard CA généré par l&apos;IA</li>
                </ul>
                <Button
                  asChild
                  className="w-full bg-[#ff5500] text-white hover:bg-[#ff6611]"
                >
                  <a href="mailto:contact@cds-sport.com?subject=CDS%20Sport%20Growth">
                    Demander une démo Growth
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Elite */}
            <Card className="border-slate-800 bg-slate-950/70">
              <CardHeader>
                <CardTitle className="font-heading text-xl text-white">
                  Elite
                </CardTitle>
                <CardDescription>
                  Pour les réseaux de studios et les franchises EMS.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <span className="font-heading text-4xl font-bold text-white">
                    499€
                  </span>
                  <span className="ml-1 text-sm text-slate-400">/mois</span>
                </div>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• Tout le plan Growth</li>
                  <li>• Coach IA avancé (multi-studios)</li>
                  <li>• Application PWA marque blanche custom</li>
                  <li>• Onboarding & support prioritaire</li>
                </ul>
                <Button
                  asChild
                  className="w-full bg-slate-800 text-slate-100 hover:bg-slate-700"
                >
                  <a href="mailto:contact@cds-sport.com?subject=CDS%20Sport%20Elite">
                    Discuter avec un expert
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} CDS Sport. Tous droits réservés.</p>
          <div className="flex gap-4">
            <Link
              href="/mentions-legales"
              className="transition-colors hover:text-slate-300"
            >
              Mentions légales
            </Link>
            <Link
              href="/cgv"
              className="transition-colors hover:text-slate-300"
            >
              CGV
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

