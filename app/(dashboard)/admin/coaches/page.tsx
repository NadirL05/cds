import { getUserIdOrRedirect } from "@/lib/auth-helpers";
import { getStudioCoaches } from "@/app/actions/admin-actions";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default async function AdminCoachesPage() {
  const adminUserId = await getUserIdOrRedirect();
  const coaches = await getStudioCoaches(adminUserId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Coachs</h1>
        <p className="text-muted-foreground mt-2">
          Visualisez et gérez les coachs de votre studio
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Équipe de Coachs</CardTitle>
          <CardDescription>
            {coaches.length} coach{coaches.length !== 1 ? "s" : ""} actif
            {coaches.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {coaches.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>Aucun coach enregistré dans votre studio.</p>
              <p className="text-sm mt-2">
                Pour ajouter un coach, promouvez un membre existant depuis la
                page Membres.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Coach</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Séances encadrées</TableHead>
                  <TableHead>Membre depuis</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coaches.map((coach) => (
                  <TableRow key={coach.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(coach.firstName, coach.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {coach.firstName} {coach.lastName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {coach.email}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{coach.bookingsCount}</span>
                      <span className="text-muted-foreground text-sm ml-1">
                        séances
                      </span>
                    </TableCell>
                    <TableCell>
                      {format(new Date(coach.createdAt), "d MMM yyyy", {
                        locale: fr,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                        Actif
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
