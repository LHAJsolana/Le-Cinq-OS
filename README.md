# Le Cinq OS

MVP mobile-first de gestion des commandes pour Café Le Cinq 5 à Rabat. Interface française pour le service, le bar/cuisine, la caisse et l’administration.

## Démarrage local

```bash
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Ouvrir `http://localhost:3000`. Les données initiales comprennent 12 tables, les serveurs Mostafa et Hassan, et la carte du café.

## Variables d’environnement

Copier `.env.example` vers `.env`. En local :

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/postgres"
```

## Déploiement Vercel

L’application utilise PostgreSQL (Supabase recommandé). Définir `DATABASE_URL` et `DIRECT_URL` dans Vercel, puis exécuter `prisma migrate deploy` avant le déploiement. Le projet se construit avec `npm run build`.

## Parcours

- Service : sélectionner une table, ajouter et personnaliser un article, envoyer, servir et demander le paiement.
- Bar / Cuisine : accepter, préparer et signaler les commandes prêtes (actualisation toutes les 4 secondes).
- Caisse : choisir le moyen de paiement, encaisser, consulter les chiffres du jour et libérer la table.
- Administration : gérer disponibilité/prix/articles/tables, historique et statistiques.
