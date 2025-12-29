/**
 * Script de test pour envoyer un email de bienvenue
 * Usage: node scripts/test-email.js
 */

const email = process.argv[2] || "test@example.com";
const firstName = process.argv[3] || "Nadir";
const planName = process.argv[4] || "ZAPOY";

const url = "http://localhost:3000/api/test-email";

const payload = {
  email,
  firstName,
  planName,
};

fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
})
  .then((response) => response.json())
  .then((data) => {
    if (data.success) {
      console.log("✅ Email envoyé avec succès !");
      console.log("Message ID:", data.messageId);
    } else {
      console.error("❌ Erreur:", data.error);
      if (data.details) {
        console.error("Détails:", data.details);
      }
    }
  })
  .catch((error) => {
    console.error("❌ Erreur lors de l'envoi:", error.message);
    console.log("\n💡 Assurez-vous que le serveur Next.js est lancé (npm run dev)");
  });

