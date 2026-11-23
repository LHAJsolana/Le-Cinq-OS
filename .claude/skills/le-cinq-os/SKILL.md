---
name: le-cinq-os
description: Travailler sur Le Cinq OS, l'application de prise de commandes du Café Le Cinq 5 (Rabat) en Next.js 15 + Prisma + PostgreSQL. À utiliser pour modifier la carte (articles, prix, catégories, disponibilité), les tables ou les serveurs, toucher au flux des commandes (service → bar/cuisine → caisse), lancer l'app en local, ou la déployer sur Vercel/Supabase. Déclencheurs : "Le Cinq", "Le-Cinq-OS", "carte du café", "prix du menu", "ajouter un article", "tables", "caisse", "bar", "serveur Mostafa/Hassan".
---

# Le Cinq OS

Dépôt : https://github.com/LHAJsolana/Le-Cinq-OS (branche `main`). L'interface est entièrement en **français** : tout texte affiché doit rester en français.

## Architecture

| Chemin | Rôle |
|---|---|
| `prisma/schema.prisma` | Modèles : `CafeTable`, `MenuCategory`, `MenuItem`, `Waiter`, `Order`, `OrderItem` |
| `prisma/seed.ts` | Données initiales : 12 tables, serveurs Mostafa et Hassan, toute la carte |
| `app/actions.ts` | Toutes les Server Actions (`"use server"`), une par ligne |
| `app/service/` | Serveur : choix de table, `tables/[id]` pour composer la commande |
| `app/bar/` | Bar / cuisine : accepter, préparer, marquer prêt (auto-refresh 4 s) |
| `app/caisse/` | Encaissement, chiffres du jour, libération de table |
| `app/admin/` | Gestion carte, prix, tables, historique, stats |
| `components/` | `order-builder`, `order-actions`, `payment-button`, `waiter-select`, `auto-refresh`, `ui` |
| `lib/status.ts` | Libellés FR des statuts, classes Tailwind, `money()` → `"13 MAD"` |
| `lib/prisma.ts` | Client Prisma singleton |

## Règles métier à respecter

- **Prix = entiers en dirhams (MAD)**, pas de centimes. `price Int`, `unitPrice Int`, `total Int`. Afficher via `money()`.
- **Suppression douce** : on ne supprime pas un `MenuItem`, on passe `isActive: false` (`deleteMenuItem`). Les `OrderItem` gardent `nameSnapshot` et `unitPrice` : changer un prix n'altère pas l'historique.
- `isAvailable` = rupture temporaire (masqué côté service) ; `isActive` = retiré de la carte.
- `OrderItem.options` est une chaîne JSON (`"[]"` par défaut), `notes` une chaîne libre.
- Cycle d'une commande : `DRAFT → SENT → ACCEPTED → PREPARING → READY → SERVED → PAYMENT_REQUESTED → PAID` (ou `CANCELLED`). `setOrderStatus` met à jour le statut de la table en même temps via une table de correspondance `map` dans `actions.ts` ; tout nouveau statut doit y être ajouté, ainsi que dans `statusLabels`/`statusStyles` de `lib/status.ts`.
- Une commande vide ne peut pas passer à `SENT`.
- Après `PAID`, la table reste `PAID` jusqu'à `resetTable` (caisse) qui la remet `FREE`.
- Paiement : `CASH`, `CARD`, `OTHER` uniquement.
- Chaque Server Action qui modifie des données doit appeler `revalidatePath` pour **toutes** les pages concernées (`/service`, `/service/tables/<id>`, `/bar`, `/caisse`, `/admin`).

## Modifier la carte

Deux cas, à distinguer avant d'agir :

1. **Base déjà en production (données réelles)** → NE PAS relancer le seed. `prisma/seed.ts` commence par `deleteMany()` sur toutes les tables : il **efface toutes les commandes et l'historique**. Faire la modif via la page `/admin`, ou un petit script Prisma ciblé (`update`/`upsert` par nom + catégorie), ou une requête SQL. Demander confirmation avant toute écriture en production.
2. **Nouvelle installation / base de dev** → modifier l'objet `menu` dans `prisma/seed.ts` puis `npx prisma db seed`.

Format du seed : `"Catégorie": [["Nom", prix, "description optionnelle"], ...]`. L'ordre des catégories dans l'objet donne `sortOrder`. Utiliser l'apostrophe typographique `’` comme le reste de la carte (`Jus d’orange`).

Exemple de mise à jour ciblée sans perte de données :

```ts
// scripts/update-prices.ts — lancer avec: npx tsx scripts/update-prices.ts
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const changes: [string, number][] = [["Café Noir", 14], ["Cappuccino", 22]];
for (const [name, price] of changes) {
  const r = await db.menuItem.updateMany({ where: { name, isActive: true }, data: { price } });
  console.log(name, r.count ? `→ ${price} MAD` : "INTROUVABLE");
}
await db.$disconnect();
```

## Modifier le schéma

1. Éditer `prisma/schema.prisma`.
2. `npx prisma migrate dev --name <nom_explicite>` (crée un dossier dans `prisma/migrations/`).
3. Adapter `seed.ts`, `actions.ts` et les pages concernées.
4. En prod : `npx prisma migrate deploy` (jamais `migrate dev` ni `migrate reset` sur la prod).

## Lancer en local

```bash
cp .env.example .env   # renseigner DATABASE_URL (pooler :6543 ?pgbouncer=true) et DIRECT_URL (:5432)
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev            # http://localhost:3000
```

Sans Supabase, un Postgres local suffit (mettre la même URL dans les deux variables, sans `pgbouncer=true`) :

```bash
docker run -d --name lecinq-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16
```

## Vérifier avant de livrer

- `npm run build` (inclut `prisma generate` + vérification TypeScript).
- Parcourir le flux complet : `/service` → choisir une table → ajouter un article → envoyer → `/bar` accepter/préparer/prêt → servir → demander paiement → `/caisse` encaisser → libérer la table.
- L'app est **mobile-first** : vérifier en largeur téléphone (≈ 390 px).

## Déploiement

Vercel + Supabase. Variables `DATABASE_URL` et `DIRECT_URL` dans Vercel, `prisma migrate deploy` avant le déploiement, build par `npm run build`. Ne jamais committer `.env`.
