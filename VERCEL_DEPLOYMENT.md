# Guide de déploiement sur Vercel

## Variables d'environnement à configurer

Dans les **Settings > Environment Variables** de votre projet Vercel, ajoutez :

### Obligatoire

1. **`DATABASE_URL`**
   - **Valeur** : Votre URL de connexion PostgreSQL Supabase
   - **Format** : `postgresql://user:password@host:port/database?sslmode=require`
   - **Où trouver** : Supabase Dashboard > Project Settings > Database > Connection string (URI)
   - **Important** : Utilisez la **Connection Pooling URL** ou la **Direct Connection URL**

### Exemple de valeur :
```
postgresql://postgres.xxxxx:password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

## Configuration du Build

### Build Command
Vercel détectera automatiquement `npm run build`, mais vous pouvez le vérifier :
```
npm run build
```

### Install Command
Par défaut, Vercel utilise `npm install`. Assurez-vous que cela est configuré.

### Output Directory
Laissez vide (par défaut : `.next`)

## Configuration Prisma

Prisma nécessite que le client soit généré avant le build. Vercel le fera automatiquement si vous avez un script `postinstall` dans `package.json`, ou vous pouvez l'ajouter à la commande de build.

### Option 1 : Script postinstall (Recommandé)
Ajoutez ceci dans `package.json` :
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### Option 2 : Modifier le Build Command
Changez le Build Command dans Vercel en :
```
prisma generate && npm run build
```

## Configuration supplémentaire

### Node.js Version
Vercel détectera automatiquement la version depuis `package.json`, mais vous pouvez spécifier :
- **Node.js Version** : `20.x` (recommandé pour Next.js 16)

### Framework Preset
- **Framework** : Next.js (détecté automatiquement)

## Vérifications après déploiement

1. ✅ Vérifiez que le build passe sans erreur
2. ✅ Vérifiez que l'application démarre correctement
3. ✅ Testez une connexion à la base de données (visitez une page qui utilise Prisma)
4. ✅ Vérifiez les logs Vercel pour les erreurs éventuelles

## Dépannage

### Erreur "PrismaClient is not generated"
- Ajoutez `prisma generate` au script postinstall ou au build command

### Erreur "DATABASE_URL is not set"
- Vérifiez que la variable d'environnement est bien configurée dans Vercel
- Assurez-vous de redéployer après avoir ajouté des variables d'environnement

### Erreur de connexion à la base de données
- Vérifiez que l'URL est correcte
- Assurez-vous d'utiliser la bonne URL (pooling vs direct connection)
- Vérifiez que votre base Supabase accepte les connexions depuis l'extérieur

