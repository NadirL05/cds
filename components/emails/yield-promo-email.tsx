import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Preview,
} from "@react-email/components";
import * as React from "react";

interface YieldPromoEmailProps {
  firstName?: string;
  date: string;
  time: string;
  discountPrice: string;
  originalPrice?: string;
  link: string;
}

export function YieldPromoEmail({
  firstName,
  date,
  time,
  discountPrice,
  originalPrice,
  link,
}: YieldPromoEmailProps) {
  const greeting = firstName ? `Bonjour ${firstName},` : "Bonjour,";

  return (
    <Html>
      <Head />
      <Preview>Vente Flash CDS Sport - Créneaux de dernière minute</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={heroSection}>
            <Text style={eyebrow}>Vente Flash / Dernière Minute</Text>
            <Text style={heroTitle}>Remplissons les créneaux de demain 🔥</Text>
            <Text style={heroSubtitle}>
              {greeting} nous avons encore des créneaux disponibles en studio pour
              demain. Profitez d&apos;une offre exceptionnelle pour venir
              vous entraîner sur place.
            </Text>
          </Section>

          <Section style={offerSection}>
            <Text style={offerTitle}>Offre spéciale membre 100% Digital</Text>
            <Text style={offerText}>
              Pour demain ({date}) sur le créneau de <strong>{time}</strong>,
              nous vous proposons un <strong>Drop-in en studio</strong> à:
            </Text>

            <Section style={priceRow}>
              {originalPrice ? (
                <Text style={originalPriceStyle}>{originalPrice}</Text>
              ) : null}
              <Text style={discountPriceStyle}>{discountPrice}</Text>
            </Section>

            <Text style={badgeText}>
              Places limitées • Offre valable uniquement pour demain •
              Réservation obligatoire
            </Text>
          </Section>

          <Section style={ctaSection}>
            <Button href={link} style={ctaButton}>
              Réserver mon Drop-in
            </Button>
            <Text style={ctaHint}>
              En 2 clics, réservez votre place sur ce créneau avant qu&apos;il
              ne soit complet.
            </Text>
          </Section>

          <Section style={detailsSection}>
            <Text style={detailsTitle}>Pourquoi cette offre ?</Text>
            <Text style={detailsText}>
              Certains créneaux de demain ne sont pas encore remplis. Plutôt que de
              laisser ces places vides, nous les mettons à disposition de nos
              membres 100% Digital à un tarif préférentiel.
            </Text>
            <Text style={detailsText}>
              C&apos;est l&apos;occasion idéale de tester l&apos;ambiance du studio
              tout en gardant la flexibilité de votre abonnement actuel.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footerSection}>
            <Text style={footerText}>
              Si le créneau n&apos;est plus disponible, d&apos;autres horaires
              pourront être proposés directement dans votre espace membre.
            </Text>
            <Text style={footerText}>À très vite chez CDS Sport 🧡</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "24px 0 48px",
  marginBottom: "64px",
  borderRadius: "12px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
};

const heroSection = {
  padding: "0 40px 8px",
  textAlign: "center" as const,
};

const eyebrow = {
  fontSize: "12px",
  fontWeight: "700",
  textTransform: "uppercase" as const,
  letterSpacing: "1.2px",
  color: "#ff5500",
  marginBottom: "8px",
};

const heroTitle = {
  fontSize: "26px",
  lineHeight: "1.3",
  fontWeight: "800",
  color: "#1f2933",
  margin: "4px 0 12px",
};

const heroSubtitle = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#4b5563",
  margin: "0 0 12px",
};

const offerSection = {
  padding: "24px 40px 16px",
  background:
    "linear-gradient(135deg, rgba(255,85,0,0.08), rgba(255,85,0,0.02))",
};

const offerTitle = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#111827",
  margin: "0 0 8px",
};

const offerText = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#374151",
  margin: "0 0 16px",
};

const priceRow = {
  display: "flex",
  alignItems: "baseline",
  gap: "12px",
  marginBottom: "8px",
};

const originalPriceStyle = {
  fontSize: "16px",
  color: "#9ca3af",
  textDecoration: "line-through",
};

const discountPriceStyle = {
  fontSize: "28px",
  fontWeight: "800",
  color: "#ff5500",
};

const badgeText = {
  fontSize: "11px",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  color: "#6b7280",
  margin: "8px 0 0",
};

const ctaSection = {
  padding: "16px 40px 8px",
  textAlign: "center" as const,
};

const ctaButton = {
  backgroundColor: "#ff5500",
  borderRadius: "999px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "700",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const ctaHint = {
  fontSize: "12px",
  color: "#6b7280",
  marginTop: "10px",
};

const detailsSection = {
  padding: "8px 40px 16px",
};

const detailsTitle = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#111827",
  margin: "8px 0",
};

const detailsText = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#4b5563",
  margin: "0 0 8px",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "20px 40px",
};

const footerSection = {
  padding: "0 40px",
};

const footerText = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0 0 6px",
};

