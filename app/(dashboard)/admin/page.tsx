import { getUserIdOrRedirect } from "@/lib/auth-helpers";
import { getAdminDashboardStats, getStudioStatistics } from "@/app/actions/admin-actions";
import { StatCard } from "@/components/ui/stat-card";
import {
  Users,
  UserCheck,
  UserPlus,
  Calendar,
  CalendarDays,
  UserCog,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AdminPage() {
  const adminUserId = await getUserIdOrRedirect();
  const stats = await getAdminDashboardStats(adminUserId);
  const chartData = await getStudioStatistics(adminUserId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord</h1>
        <p className="text-muted-foreground mt-2">
          Vue d&apos;ensemble de votre studio
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Membres"
          value={stats.totalMembers}
          icon={Users}
          description="membres inscrits"
        />
        <StatCard
          title="Membres Actifs"
          value={stats.activeMembers}
          icon={UserCheck}
          description="abonnements actifs"
        />
        <StatCard
          title="Nouveaux ce mois"
          value={stats.newMembersThisMonth}
          icon={UserPlus}
          trend={
            stats.memberGrowthPercentage !== 0
              ? {
                  value: stats.memberGrowthPercentage,
                  isPositive: stats.memberGrowthPercentage > 0,
                }
              : undefined
          }
          description="vs mois dernier"
        />
        <StatCard
          title="Coachs"
          value={stats.totalCoaches}
          icon={UserCog}
          description="coachs actifs"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Réservations Aujourd'hui"
          value={stats.totalBookingsToday}
          icon={Calendar}
          description="séances programmées"
        />
        <StatCard
          title="Réservations Cette Semaine"
          value={stats.totalBookingsThisWeek}
          icon={CalendarDays}
          description="séances cette semaine"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Réservations (7 derniers jours)
            </CardTitle>
            <CardDescription>
              Évolution des réservations quotidiennes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {chartData.bookingsPerDay.map((day) => (
                <div key={day.date} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {new Date(day.date).toLocaleDateString("fr-FR", {
                      weekday: "short",
                      day: "numeric",
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 bg-primary rounded-full"
                      style={{
                        width: `${Math.max(day.bookings * 20, 4)}px`,
                      }}
                    />
                    <span className="text-sm font-medium w-8 text-right">
                      {day.bookings}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Répartition par Plan
            </CardTitle>
            <CardDescription>
              Distribution des membres par type d&apos;abonnement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {chartData.membersPerPlan.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucune donnée disponible
                </p>
              ) : (
                chartData.membersPerPlan.map((item) => {
                  const total = chartData.membersPerPlan.reduce(
                    (acc, curr) => acc + curr.count,
                    0
                  );
                  const percentage =
                    total > 0 ? Math.round((item.count / total) * 100) : 0;

                  return (
                    <div key={item.plan} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize">
                          {item.plan}
                        </span>
                        <span className="text-muted-foreground">
                          {item.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

