import { getUserIdOrRedirect } from "@/lib/auth-helpers";
import {
  getAdminDashboardStats,
  getStudioStatistics,
  getStudioMembers,
} from "@/app/actions/admin-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import {
  Users,
  UserCheck,
  UserPlus,
  TrendingUp,
  Calendar,
  Target,
} from "lucide-react";

export default async function AdminStatsPage() {
  const adminUserId = await getUserIdOrRedirect();
  const stats = await getAdminDashboardStats(adminUserId);
  const chartData = await getStudioStatistics(adminUserId);
  const members = await getStudioMembers(adminUserId);

  // Calculate additional stats
  const activeRate =
    stats.totalMembers > 0
      ? Math.round((stats.activeMembers / stats.totalMembers) * 100)
      : 0;

  const avgBookingsPerMember =
    stats.activeMembers > 0
      ? (stats.totalBookingsThisWeek / stats.activeMembers).toFixed(1)
      : "0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Statistiques</h1>
        <p className="text-muted-foreground mt-2">
          Analyses détaillées de votre studio
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Taux de Membres Actifs"
          value={`${activeRate}%`}
          icon={Target}
          description={`${stats.activeMembers} sur ${stats.totalMembers}`}
        />
        <StatCard
          title="Moy. Réservations/Membre"
          value={avgBookingsPerMember}
          icon={Calendar}
          description="cette semaine"
        />
        <StatCard
          title="Croissance Mensuelle"
          value={`${stats.memberGrowthPercentage > 0 ? "+" : ""}${stats.memberGrowthPercentage}%`}
          icon={TrendingUp}
          trend={
            stats.memberGrowthPercentage !== 0
              ? {
                  value: Math.abs(stats.memberGrowthPercentage),
                  isPositive: stats.memberGrowthPercentage > 0,
                }
              : undefined
          }
        />
        <StatCard
          title="Nouveaux Membres"
          value={stats.newMembersThisMonth}
          icon={UserPlus}
          description="ce mois-ci"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Bookings Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Évolution des Réservations
            </CardTitle>
            <CardDescription>7 derniers jours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartData.bookingsPerDay.map((day, index) => {
                const maxBookings = Math.max(
                  ...chartData.bookingsPerDay.map((d) => d.bookings),
                  1
                );
                const percentage = (day.bookings / maxBookings) * 100;

                return (
                  <div key={day.date} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {new Date(day.date).toLocaleDateString("fr-FR", {
                          weekday: "long",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <span className="font-medium">
                        {day.bookings} réservation{day.bookings !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Members by Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Répartition par Abonnement
            </CardTitle>
            <CardDescription>
              Distribution des membres par type de plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.membersPerPlan.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            ) : (
              <div className="space-y-4">
                {chartData.membersPerPlan.map((item) => {
                  const total = chartData.membersPerPlan.reduce(
                    (acc, curr) => acc + curr.count,
                    0
                  );
                  const percentage =
                    total > 0 ? Math.round((item.count / total) * 100) : 0;

                  return (
                    <div key={item.plan} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize">
                          {item.plan}
                        </span>
                        <span className="text-muted-foreground">
                          {item.count} membre{item.count !== 1 ? "s" : ""} (
                          {percentage}%)
                        </span>
                      </div>
                      <div className="h-3 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Member Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Résumé de l&apos;Activité
          </CardTitle>
          <CardDescription>
            Vue d&apos;ensemble de l&apos;engagement des membres
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
              <div className="text-2xl font-bold text-green-600">
                {stats.activeMembers}
              </div>
              <div className="text-sm text-green-600/80">Abonnements actifs</div>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalBookingsThisWeek}
              </div>
              <div className="text-sm text-blue-600/80">
                Réservations cette semaine
              </div>
            </div>
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20">
              <div className="text-2xl font-bold text-purple-600">
                {stats.totalCoaches}
              </div>
              <div className="text-sm text-purple-600/80">Coachs disponibles</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
