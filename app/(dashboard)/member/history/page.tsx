import { getUserIdOrRedirect } from "@/lib/auth-helpers";
import { getBookingHistory } from "@/app/actions/member-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import {
  Activity,
  Calendar,
  TrendingUp,
  Award,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

function getStatusBadge(status: string) {
  switch (status.toUpperCase()) {
    case "CONFIRMED":
      return <Badge variant="default">Confirmé</Badge>;
    case "ATTENDED":
    case "COMPLETED":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Terminé
        </Badge>
      );
    case "CANCELLED":
      return <Badge variant="destructive">Annulé</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default async function HistoryPage() {
  const userId = await getUserIdOrRedirect();
  const historyData = await getBookingHistory(userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Historique des Séances
        </h1>
        <p className="text-muted-foreground mt-2">
          Retrouvez l&apos;historique complet de vos entraînements
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Séances"
          value={historyData.totalSessions}
          icon={Activity}
          description="depuis votre inscription"
        />
        <StatCard
          title="Ce Mois-ci"
          value={historyData.sessionsThisMonth}
          icon={Calendar}
          trend={
            historyData.sessionsLastMonth > 0
              ? {
                  value: Math.round(
                    ((historyData.sessionsThisMonth -
                      historyData.sessionsLastMonth) /
                      historyData.sessionsLastMonth) *
                      100
                  ),
                  isPositive:
                    historyData.sessionsThisMonth >= historyData.sessionsLastMonth,
                }
              : undefined
          }
          description="vs mois dernier"
        />
        <StatCard
          title="Moyenne Hebdo"
          value={historyData.averageSessionsPerWeek}
          icon={TrendingUp}
          description="séances par semaine"
        />
        <StatCard
          title="Programme Favori"
          value={historyData.mostUsedProgram || "—"}
          icon={Award}
          description="le plus utilisé"
        />
      </div>

      {/* Monthly Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Comparaison Mensuelle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-around py-4">
            <div className="text-center">
              <div className="text-3xl font-bold">
                {historyData.sessionsLastMonth}
              </div>
              <div className="text-sm text-muted-foreground">Mois dernier</div>
            </div>
            <div className="text-4xl font-light text-muted-foreground">→</div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {historyData.sessionsThisMonth}
              </div>
              <div className="text-sm text-muted-foreground">Ce mois-ci</div>
            </div>
          </div>
          {historyData.sessionsThisMonth > historyData.sessionsLastMonth && (
            <p className="text-center text-sm text-green-600">
              Bravo ! Vous êtes plus actif que le mois dernier !
            </p>
          )}
          {historyData.sessionsThisMonth < historyData.sessionsLastMonth && (
            <p className="text-center text-sm text-muted-foreground">
              Continuez vos efforts pour atteindre vos objectifs !
            </p>
          )}
        </CardContent>
      </Card>

      {/* Booking History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historique Complet
          </CardTitle>
          <CardDescription>
            {historyData.bookings.length} réservation
            {historyData.bookings.length !== 1 ? "s" : ""} enregistrée
            {historyData.bookings.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historyData.bookings.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Vous n&apos;avez pas encore de séances enregistrées.</p>
              <p className="text-sm mt-2">
                Réservez votre première séance pour commencer !
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Horaire</TableHead>
                    <TableHead>Studio</TableHead>
                    <TableHead>Programme</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyData.bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <span className="font-medium">
                          {format(
                            new Date(booking.startTime),
                            "EEEE d MMM yyyy",
                            { locale: fr }
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        {format(new Date(booking.startTime), "HH:mm")} -{" "}
                        {format(new Date(booking.endTime), "HH:mm")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {booking.studioName}
                      </TableCell>
                      <TableCell>
                        {booking.programUsed || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
