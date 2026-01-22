"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Gender = "MALE" | "FEMALE" | "OTHER";

export function BmiCalculator() {
  const [gender, setGender] = useState<Gender | null>(null);
  const [age, setAge] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [height, setHeight] = useState<string>("");

  const { bmi, category, recommendation } = useMemo(() => {
    const w = parseFloat(weight.replace(",", "."));
    const h = parseFloat(height.replace(",", "."));

    if (!w || !h || h <= 0) {
      return { bmi: null as number | null, category: "", recommendation: "" };
    }

    const bmiValue = w / Math.pow(h / 100, 2);

    let cat = "";
    if (bmiValue < 18.5) cat = "Maigreur";
    else if (bmiValue < 25) cat = "Corpulence normale";
    else if (bmiValue < 30) cat = "Surpoids";
    else cat = "Obésité";

    let reco = "";
    if (bmiValue < 18.5 || bmiValue > 30) {
      reco = "Recommandation : COACHING (Suivi Sécurisé)";
    } else if (bmiValue >= 25 && bmiValue <= 30) {
      reco = "Recommandation : ZAPOY (Brûlage Métabolique)";
    } else {
      reco = "Recommandation : ZAPOY (Performance)";
    }

    return { bmi: bmiValue, category: cat, recommendation: reco };
  }, [weight, height]);

  const handleScrollToPricing = () => {
    const section = document.getElementById("pricing");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const genderButtonClasses = (value: Gender) =>
    `button-skew font-heading neon-orange-hover relative inline-flex items-center justify-center px-4 py-2 text-sm sm:text-base transition
    ${gender === value ? "bg-[#ff5500] text-white" : "bg-zinc-900/60 text-slate-200 hover:bg-zinc-800"} `;

  return (
    <section className="w-full py-16 px-4">
      <div className="max-w-5xl mx-auto grid gap-10 md:grid-cols-2 items-stretch">
        {/* Inputs */}
        <Card className="glass-card border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-900/90">
          <CardHeader>
            <CardTitle className="font-heading text-3xl text-white tracking-wide">
              VOTRE PROFIL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Genre
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  className={genderButtonClasses("MALE")}
                  onClick={() => setGender("MALE")}
                >
                  <span className="button-skew-inner">Homme</span>
                </button>
                <button
                  type="button"
                  className={genderButtonClasses("FEMALE")}
                  onClick={() => setGender("FEMALE")}
                >
                  <span className="button-skew-inner">Femme</span>
                </button>
                <button
                  type="button"
                  className={genderButtonClasses("OTHER")}
                  onClick={() => setGender("OTHER")}
                >
                  <span className="button-skew-inner">Autre</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Âge
                </p>
                <Input
                  type="number"
                  min={10}
                  max={99}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="28"
                  className="bg-zinc-900/70 border-zinc-800 text-white focus:border-[#ff5500] focus-visible:ring-[#ff5500]"
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Poids (kg)
                </p>
                <Input
                  type="number"
                  min={30}
                  max={200}
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="72"
                  className="bg-zinc-900/70 border-zinc-800 text-white focus:border-[#ff5500] focus-visible:ring-[#ff5500]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Taille (cm)
              </p>
              <Input
                type="number"
                min={120}
                max={220}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="175"
                className="bg-zinc-900/70 border-zinc-800 text-white focus:border-[#ff5500] focus-visible:ring-[#ff5500]"
              />
            </div>

            <Button
              type="button"
              onClick={handleScrollToPricing}
              className="mt-4 w-full bg-[#ff5500] hover:bg-[#ff6600] text-white button-skew font-heading text-lg py-6 neon-orange-hover"
            >
              <span className="button-skew-inner">DÉCOUVRIR MON PROGRAMME</span>
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="glass-card border-[#ff5500]/40 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#ff5500]/20 blur-3xl" />
          <CardHeader>
            <CardTitle className="font-heading text-2xl text-white">
              Résultat IMC
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-baseline gap-4">
              <span className="font-heading text-6xl md:text-7xl text-[#ff5500] drop-shadow-[0_0_30px_rgba(255,85,0,0.7)]">
                {bmi ? bmi.toFixed(1) : "--.-"}
              </span>
              <div className="space-y-1">
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
                  Indice de Masse Corporelle
                </p>
                <p className="text-sm text-slate-300">
                  {category || "Entrez vos données pour voir votre zone."}
                </p>
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#ff5500] to-transparent opacity-60" />

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                Lecture rapide
              </p>
              <p className="text-sm text-slate-300">
                &lt; 18.5 : Maigreur • 18.5 - 24.9 : Normal • 25 - 29.9 : Surpoids • 30+ : Obésité
              </p>
            </div>

            <div className="mt-4 rounded-lg border border-[#ff5500]/40 bg-zinc-950/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.25em] text-[#ff5500] mb-1">
                Recommandation CDS
              </p>
              <p className="text-sm text-slate-100">
                {bmi ? recommendation : "Votre recommandation personnalisée apparaîtra ici."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

