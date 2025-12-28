# Configuration du Webhook Stripe

## URL du Webhook

Votre endpoint de webhook est disponible à :
```
https://votre-domaine.com/api/webhooks/stripe
```

Pour le développement local, utilisez Stripe CLI pour forwarder les webhooks :
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Variables d'environnement

Assurez-vous d'avoir `STRIPE_WEBHOOK_SECRET` configuré :

### Local (avec Stripe CLI)
Après avoir lancé `stripe listen`, copiez le secret webhook affiché et ajoutez-le à `.env.local` :
```env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Production (Vercel)
1. Allez dans Stripe Dashboard > Developers > Webhooks
2. Créez un endpoint pointant vers `https://votre-domaine.com/api/webhooks/stripe`
3. Sélectionnez l'événement : `checkout.session.completed`
4. Copiez le "Signing secret" (commence par `whsec_`)
5. Ajoutez-le dans Vercel : Settings > Environment Variables > `STRIPE_WEBHOOK_SECRET`

## Événements gérés

Le webhook écoute actuellement :
- `checkout.session.completed` : Met à jour le statut d'abonnement de l'utilisateur

## Actions effectuées

Lorsqu'un paiement est complété avec succès :
1. ✅ Vérification de la signature du webhook (sécurité)
2. ✅ Extraction de `userId` et `plan` depuis les metadata
3. ✅ Extraction de `customerId` depuis la session
4. ✅ Mise à jour de la base de données :
   - `stripeCustomerId` = customerId
   - `plan` = plan (DIGITAL, ZAPOY, ou COACHING)
   - `subscriptionStatus` = "active"

## Tests

### Tester avec Stripe CLI
```bash
# 1. Démarrer le serveur de développement
npm run dev

# 2. Dans un autre terminal, forwarder les webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 3. Tester un checkout
stripe trigger checkout.session.completed
```

### Vérifier dans la base de données
Après un paiement réussi, vérifiez que l'utilisateur a été mis à jour :
```sql
SELECT id, email, "stripeCustomerId", plan, "subscriptionStatus" 
FROM "User" 
WHERE "subscriptionStatus" = 'active';
```

## Prochaines étapes

Pour une gestion complète des abonnements, vous pouvez ajouter :
- `customer.subscription.updated` : Pour gérer les changements de plan
- `customer.subscription.deleted` : Pour gérer les annulations
- `invoice.payment_failed` : Pour gérer les échecs de paiement

