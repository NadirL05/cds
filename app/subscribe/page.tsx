import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function SubscribePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <AlertCircle className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-2xl">Abonnement requis</CardTitle>
          <CardDescription className="mt-2">
            Un abonnement actif est nécessaire pour accéder à cette section.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Pour accéder au dashboard membre et réserver vos sessions, veuillez vous abonner à l'un de nos plans.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/" className="w-full">
              <Button className="w-full">Voir les offres</Button>
            </Link>
            <Link href="/member/profile">
              <Button variant="outline" className="w-full">
                Retour au profil
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

