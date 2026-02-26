"use client";

import { Flame, Trophy, Crown } from "lucide-react";
import type { MemberStats } from "@/app/actions/member-actions";

interface GamificationWidgetProps {
  stats: MemberStats | null;
}

export function GamificationWidget({ stats }: GamificationWidgetProps) {
  const currentStreak = stats?.currentStreak ?? 0;
  const longestStreak = stats?.longestStreak ?? 0;
  const totalPoints = stats?.totalPoints ?? 0;

  return (
    <section className="mb-6">
      <div className="grid gap-4 md:grid-cols-3">
        {/* Série actuelle - Flamme */}
        <div
          className={`rounded-xl border border-zinc-700/80 bg-zinc-900/80 p-5 backdrop-blur-sm transition-shadow ${
            currentStreak > 0 ? "shadow-[0_0_20px_rgba(251,146,60,0.25)]" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-lg ${
                currentStreak > 0
                  ? "bg-orange-500/20 text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]"
                  : "bg-zinc-700/50 text-zinc-400"
              }`}
            >
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Série actuelle
              </p>
              <p
                className={`text-2xl font-bold tabular-nums ${
                  currentStreak > 0 ? "text-orange-400" : "text-zinc-300"
                }`}
              >
                {currentStreak}
              </p>
            </div>
          </div>
        </div>

        {/* Points CDS */}
        <div className="rounded-xl border border-zinc-700/80 bg-zinc-900/80 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Points CDS
              </p>
              <p className="text-2xl font-bold tabular-nums text-zinc-100">
                {totalPoints}
              </p>
            </div>
          </div>
        </div>

        {/* Meilleure série */}
        <div className="rounded-xl border border-zinc-700/80 bg-zinc-900/80 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Meilleure série
              </p>
              <p className="text-2xl font-bold tabular-nums text-zinc-100">
                {longestStreak}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
