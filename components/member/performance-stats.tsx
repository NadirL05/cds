"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { MemberStats } from "@/app/actions/member-actions";

interface PerformanceStatsProps {
  stats: MemberStats | null;
}

export function PerformanceStats({ stats }: PerformanceStatsProps) {
  const weeklySessionsDone = stats?.sessionsThisWeek ?? 0;
  const weeklySessionsTarget = 3;
  const weeklyProgress =
    weeklySessionsTarget > 0
      ? Math.min(100, (weeklySessionsDone / weeklySessionsTarget) * 100)
      : 0;

  const bmi = stats?.bmi ?? null;
  const bmiLabel = stats?.bmiCategory ?? "Profil incomplet";
  const hasBmi = bmi !== null;

  const weight = stats?.weight ?? null;
  const hasWeight = weight !== null;

  return (
    <section className="mb-6">
      <div className="grid gap-4 md:grid-cols-3">
        {/* IMC */}
        <Card className="glass-card border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-900/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-slate-200">
              IMC
            </CardTitle>
            <Badge
              className={`border-none text-xs ${
                hasBmi ? "bg-emerald-500/90 text-white" : "bg-amber-500/90 text-black"
              }`}
            >
              {bmiLabel}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-4xl text-white">
                {hasBmi ? bmi!.toFixed(1) : "--.-"}
              </span>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Indice de Masse Corporelle
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {hasBmi
                ? "Zone calculée selon vos données de profil."
                : "Complétez votre profil pour obtenir votre IMC personnalisé."}
            </p>
            {!hasBmi && (
              <div className="mt-3">
                <Button
                  asChild
                  size="xs"
                  className="bg-[#ff5500] hover:bg-[#ff6600] text-white button-skew font-heading text-xs"
                >
                  <Link href="/member/profile">
                    <span className="button-skew-inner">Compléter mon profil</span>
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Objectif Hebdo */}
        <Card className="glass-card border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-900/80">
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="text-sm font-medium text-slate-200">
              Objectif hebdo
            </CardTitle>
            <p className="text-xs text-slate-400">
              {weeklySessionsDone} / {weeklySessionsTarget} Séances
            </p>
          </CardHeader>
          <CardContent>
            <Progress
              value={weeklyProgress}
              className="h-2 bg-zinc-900"
            />
            <p className="mt-3 text-xs text-[#ff5500] font-medium">
              Plus qu&apos;une pour l&apos;objectif !
            </p>
          </CardContent>
        </Card>

        {/* Poids */}
        <Card className="glass-card border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-900/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-slate-200">
              Poids actuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-4xl text-white">
                {hasWeight ? `${weight}kg` : "-- kg"}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {hasWeight
                ? "Poids mesuré lors de votre dernier enregistrement."
                : "Ajoutez votre poids dans le profil pour suivre votre évolution."}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

