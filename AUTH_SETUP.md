# Configuration NextAuth & Stripe

## Variables d'environnement requises

Ajoutez ces variables dans votre fichier `.env.local` (ou `.env` pour le développement) :

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-tres-long-et-aleatoire-ici"

# Stripe
STRIPE_SECRET_KEY="sk_test_..." # Clé secrète Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_..." # Clé publique Stripe (optionnel, pour le frontend)
STRIPE_WEBHOOK_SECRET="whsec_..." # Secret pour les webhooks Stripe (optionnel)
```

## Générer NEXTAUTH_SECRET

Pour générer un secret sécurisé pour NextAuth, exécutez :

```bash
openssl rand -base64 32
```

Ou en ligne de commande Node.js :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Configuration NextAuth

NextAuth est configuré dans `lib/auth.ts` avec :

- **Adapter** : PrismaAdapter pour stocker les sessions dans PostgreSQL
- **Strategy** : JWT (pour une meilleure compatibilité avec les Server Components)
- **Provider** : Credentials (email/password)
- **Callbacks** : Configuration pour inclure le `role` et l'`id` dans la session

## Utilisation dans les composants

### Server Component

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function MyComponent() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return <div>Non connecté</div>;
  }
  
  return <div>Connecté en tant que {session.user.email} ({session.user.role})</div>;
}
```

### Client Component

```typescript
"use client";
import { useSession } from "next-auth/react";

export default function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === "loading") return <div>Chargement...</div>;
  if (status === "unauthenticated") return <div>Non connecté</div>;
  
  return <div>Connecté en tant que {session?.user?.email}</div>;
}
```

### Protéger une route

Créez un fichier `middleware.ts` à la racine :

```typescript
export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/member/:path*", "/coach/:path*"],
};
```

## Stripe

Stripe est configuré dans `lib/stripe.ts` avec une fonction helper `getOrCreateStripeCustomer()` qui :
- Vérifie si l'utilisateur a déjà un customer Stripe
- Crée un nouveau customer si nécessaire
- Sauvegarde le `stripeCustomerId` dans la base de données

### Exemple d'utilisation

```typescript
import { getOrCreateStripeCustomer } from "@/lib/stripe";
import { stripe } from "@/lib/stripe";

// Créer ou récupérer un customer
const customerId = await getOrCreateStripeCustomer(userId, email);

// Créer une session de checkout
const session = await stripe.checkout.sessions.create({
  customer: customerId,
  // ... autres options
});
```

## Pages d'authentification personnalisées

Les pages d'authentification peuvent être créées dans :
- `/auth/signin` - Page de connexion
- `/auth/signout` - Page de déconnexion
- `/auth/error` - Page d'erreur
- `/auth/verify-request` - Vérification email (si vous ajoutez l'email provider)
- `/auth/new-user` - Page de bienvenue pour nouveaux utilisateurs

## Prochaines étapes

1. Créer les pages d'authentification (`/auth/signin`, etc.)
2. Créer un système d'inscription (hashage du mot de passe avec bcrypt)
3. Implémenter les webhooks Stripe pour gérer les abonnements
4. Ajouter d'autres providers OAuth (Google, Facebook, etc.) si nécessaire

