# CDS Sport

Application web de gestion pour le club de sport CDS Sport.

## Prérequis

- Node.js 18+ et npm
- PostgreSQL (ou une base de données compatible Prisma)
- Compte Supabase (pour l'authentification Google OAuth)

## Installation

1. **Cloner le projet et installer les dépendances**

```bash
npm install
```

2. **Configuration de l'environnement**

Créer un fichier `.env.local` à la racine du projet avec les variables suivantes :

```bash
# Base de données (Prisma)
DATABASE_URL="postgresql://user:password@localhost:5432/cds_sport?schema=public"

# NextAuth Configuration
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Supabase Configuration (pour Google OAuth)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"

# Application URL
NEXT_PUBLIC_URL="http://localhost:3000"
```

**Générer un secret NextAuth :**
```bash
openssl rand -base64 32
```

**Configuration Supabase :**
1. Créer un compte sur [Supabase](https://supabase.com)
2. Créer un nouveau projet
3. Récupérer l'URL et la clé anonyme dans les paramètres du projet
4. Activer Google OAuth dans Authentication > Providers

3. **Initialiser la base de données**

```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev

# (Optionnel) Peupler la base avec des données de test
npx prisma db seed
```

4. **Lancer le serveur de développement**

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Fonctionnalités

- Authentification (email/mot de passe et Google OAuth)
- Tableau de bord membre avec suivi des performances
- Calcul de l'IMC et suivi du poids
- Réservation de séances
- Gestion des abonnements
- Interface administrateur

## Résolution des problèmes

### Impossible de se connecter ou de créer un compte

1. Vérifier que le fichier `.env.local` existe et contient toutes les variables requises
2. Vérifier que la base de données est accessible avec l'URL fournie
3. Vérifier que les migrations Prisma sont appliquées : `npx prisma migrate dev`
4. Vérifier les logs du serveur pour plus de détails

### Erreur de build "Module not found"

Si vous rencontrez une erreur du type "Module not found", vérifiez que toutes les dépendances sont installées :

```bash
npm install
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
