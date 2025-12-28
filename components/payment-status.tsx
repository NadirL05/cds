"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";

export function PaymentStatusHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success === "true") {
      toast.success("Paiement réussi ! Votre abonnement est maintenant actif.", {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        duration: 5000,
      });
      // Nettoyer l'URL
      router.replace("/member");
    }

    if (canceled === "true") {
      toast.info("Paiement annulé. Vous pouvez réessayer à tout moment.", {
        icon: <XCircle className="h-5 w-5 text-orange-500" />,
        duration: 5000,
      });
      // Nettoyer l'URL
      router.replace("/");
    }
  }, [searchParams, router]);

  return null;
}

