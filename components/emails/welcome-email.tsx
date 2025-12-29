import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from "@react-email/components";

interface WelcomeEmailProps {
  firstName?: string;
  planName: string;
}

export function WelcomeEmail({ firstName, planName }: WelcomeEmailProps) {
  const greeting = firstName ? `Bonjour ${firstName},` : "Bonjour,";
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={section}>
            <Text style={title}>Bienvenue chez CDS Sport !</Text>
            <Text style={text}>{greeting}</Text>
            <Text style={text}>
              Nous sommes ravis de vous accueillir dans notre communauté.
            </Text>
            <Text style={text}>
              Votre abonnement <strong>{planName}</strong> est maintenant actif. 
              Vous avez accès à tous les avantages de votre plan.
            </Text>
            <Section style={buttonContainer}>
              <Button style={button} href={`${baseUrl}/member`}>
                Accéder à mon espace
              </Button>
            </Section>
            <Hr style={hr} />
            <Text style={footer}>
              Si vous avez des questions, n'hésitez pas à nous contacter.
            </Text>
            <Text style={footer}>
              L'équipe CDS Sport
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
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const section = {
  padding: "0 48px",
};

const title = {
  fontSize: "24px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#1a1a1a",
  margin: "0 0 24px",
};

const text = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#333333",
  margin: "0 0 16px",
};

const buttonContainer = {
  margin: "32px 0",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#2563eb",
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
  lineHeight: "20px",
  margin: "0 0 8px",
};

