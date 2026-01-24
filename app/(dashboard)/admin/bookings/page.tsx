import { getUserIdOrRedirect } from "@/lib/auth-helpers";
import { getStudioBookings } from "@/app/actions/admin-actions";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { BookingsFilters } from "./bookings-filters";

function getStatusBadgeVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status.toUpperCase()) {
    case "CONFIRMED":
      return "default";
    case "COMPLETED":
      return "secondary";
    case "CANCELLED":
      return "destructive";
    default:
      return "outline";
  }
}

function getStatusLabel(status: string): string {
  switch (status.toUpperCase()) {
    case "CONFIRMED":
      return "Confirmé";
    case "COMPLETED":
      return "Terminé";
    case "CANCELLED":
      return "Annulé";
    default:
      return status;
  }
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; status?: string }>;
}) {
  const adminUserId = await getUserIdOrRedirect();
  const params = await searchParams;

  // Build filter options
  const options: { startDate?: Date; endDate?: Date; status?: string } = {};

  if (params.date) {
    const date = new Date(params.date);
    options.startDate = new Date(date.setHours(0, 0, 0, 0));
    options.endDate = new Date(date.setHours(23, 59, 59, 999));
  } else {
    // Default to today and next 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    options.startDate = today;

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    options.endDate = nextWeek;
  }

  if (params.status) {
    options.status = params.status;
  }

  const bookings = await getStudioBookings(adminUserId, options);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Réservations</h1>
        <p className="text-muted-foreground mt-2">
          Gérez les réservations de votre studio
        </p>
      </div>

      <BookingsFilters />

      <Card>
        <CardHeader>
          <CardTitle>Planning des Réservations</CardTitle>
          <CardDescription>
            {bookings.length} réservation{bookings.length !== 1 ? "s" : ""}{" "}
            trouvée{bookings.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Aucune réservation trouvée pour cette période.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membre</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Horaire</TableHead>
                  <TableHead>Programme</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(
                              booking.user.firstName,
                              booking.user.lastName
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {booking.user.firstName} {booking.user.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {booking.user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {format(new Date(booking.startTime), "EEEE d MMM", {
                          locale: fr,
                        })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {format(new Date(booking.startTime), "HH:mm")} -{" "}
                        {format(new Date(booking.endTime), "HH:mm")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {booking.programUsed || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(booking.status)}>
                        {getStatusLabel(booking.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
