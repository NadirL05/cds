import { getUserIdOrRedirect } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Users, Settings2 } from "lucide-react";

export default async function AdminSettingsPage() {
  const adminUserId = await getUserIdOrRedirect();

  // Get admin user with studio info
  const adminUser = await prisma.user.findUnique({
    where: { id: adminUserId },
    select: {
      role: true,
      homeStudio: true,
    },
  });

  const studio = adminUser?.homeStudio;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground mt-2">
          Configurez les paramètres de votre studio
        </p>
      </div>

      {/* Studio Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informations du Studio
          </CardTitle>
          <CardDescription>
            Détails de votre établissement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {studio ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Nom du Studio
                  </label>
                  <p className="text-lg font-medium">{studio.name}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Ville
                  </label>
                  <p className="text-lg font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {studio.city}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Capacité par Créneau
                  </label>
                  <p className="text-lg font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {studio.maxCapacityPerSlot} personnes
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    ID du Studio
                  </label>
                  <p className="text-sm font-mono text-muted-foreground">
                    {studio.id}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Aucun studio associé à votre compte.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Role */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Votre Rôle
          </CardTitle>
          <CardDescription>
            Niveau d&apos;accès et permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge
              variant="default"
              className={
                adminUser?.role === "SUPER_ADMIN"
                  ? "bg-purple-100 text-purple-800 hover:bg-purple-100"
                  : "bg-blue-100 text-blue-800 hover:bg-blue-100"
              }
            >
              {adminUser?.role === "SUPER_ADMIN"
                ? "Super Administrateur"
                : adminUser?.role === "FRANCHISE_OWNER"
                ? "Propriétaire Franchise"
                : adminUser?.role}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {adminUser?.role === "SUPER_ADMIN"
                ? "Accès complet à tous les studios et fonctionnalités"
                : "Accès complet à votre studio"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Options */}
      <Card>
        <CardHeader>
          <CardTitle>Options de Configuration</CardTitle>
          <CardDescription>
            Personnalisez le fonctionnement de votre studio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <h4 className="font-medium">Notifications par Email</h4>
                <p className="text-sm text-muted-foreground">
                  Recevez des alertes pour les nouvelles inscriptions et
                  réservations
                </p>
              </div>
              <Badge variant="outline">Bientôt disponible</Badge>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <h4 className="font-medium">Rappels Automatiques</h4>
                <p className="text-sm text-muted-foreground">
                  Envoyez des rappels aux membres avant leurs séances
                </p>
              </div>
              <Badge variant="outline">Bientôt disponible</Badge>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <h4 className="font-medium">Export des Données</h4>
                <p className="text-sm text-muted-foreground">
                  Exportez les données de vos membres au format CSV
                </p>
              </div>
              <Badge variant="outline">Bientôt disponible</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
