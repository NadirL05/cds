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

interface WeeklyRecapEmailProps {
  firstName: string;
  sessionCount: number;
  goal?: number;
}

export function WeeklyRecapEmail({
  firstName,
  sessionCount,
  goal = 3,
}: WeeklyRecapEmailProps) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

  let headline = "";
  let message = "";
  let emoji = "";

  if (sessionCount >= goal) {
    headline = `Bravo ${firstName} ! Objectif explosé 🚀`;
    message = `Incroyable performance cette semaine. Vous avez réalisé ${sessionCount} séances. Votre discipline est inspirante, continuez sur cette lancée !`;
    emoji = "🔥";
  } else if (sessionCount > 0) {
    headline = `Bien joué ${firstName} !`;
    message = `Vous avez maintenu le rythme avec ${sessionCount} séance${sessionCount > 1 ? "s" : ""} cette semaine. Chaque effort compte pour atteindre vos objectifs.`;
    emoji = "💪";
  } else {
    headline = "On a raté une semaine ?";
    message = "Nous n'avons pas vu d'activité cette semaine. Ce n'est pas grave, l'important est de reprendre le rythme. Les créneaux de la semaine prochaine vous attendent !";
    emoji = "📅";
  }

  return (
    <Html>
      <Head />
      <Preview>{headline}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={section}>
            <Text style={title}>{headline}</Text>
            <Text style={text}>
              {emoji} {message}
            </Text>
            
            <Section style={statsContainer}>
              <Text style={statLabel}>BILAN DE LA SEMAINE</Text>
              <Text style={statNumber}>{sessionCount}</Text>
              <Text style={statLabel}>SÉANCES COMPLÉTÉES</Text>
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href={`${baseUrl}/member`}>
                Réserver pour la semaine prochaine
              </Button>
            </Section>
            
            <Hr style={hr} />
            <Text style={footer}>
              L'équipe CDS Sport - Votre coach virtuel
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
};

const section = {
  padding: "0 48px",
};

const title = {
  fontSize: "24px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#1a1a1a",
  margin: "24px 0",
  textAlign: "center" as const,
};

const text = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#333333",
  margin: "0 0 16px",
  textAlign: "center" as const,
};

const statsContainer = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  textAlign: "center" as const,
  border: "1px solid #e5e7eb",
};

const statNumber = {
  fontSize: "36px",
  fontWeight: "800",
  color: "#ff5500", // CDS Orange
  margin: "8px 0",
  lineHeight: "1",
};

const statLabel = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#6b7280",
  letterSpacing: "1px",
  margin: "0",
  textTransform: "uppercase" as const,
};

const buttonContainer = {
  margin: "32px 0",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#ff5500", // CDS Orange
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "32px 0",
};

const footer = {
  color: "#6b7280",
  fontSize: "14px",
  textAlign: "center" as const,
};
