import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const menu: Record<string, [string, number, string?][]> = {
  "Boisson chaude": [
    ["Café noir", 13], ["Café Nespresso", 18], ["Café au lait", 16],
    ["Café allongé", 18], ["Café séparé", 16], ["Café double expresso", 18],
    ["Cappuccino", 20], ["Chocolat à l’ancienne", 22], ["Lipton", 14],
    ["Lipton au lait", 16], ["Thé à la menthe", 15], ["Thé Chamali", 15],
    ["Verveine", 15], ["Verveine au lait", 16], ["Lait chaud", 10],
    ["Lait au chocolat", 18],
  ],
  "Boisson froide": [
    ["Eau minérale 33cl", 4], ["Eau minérale 50cl", 8], ["Soda", 15],
    ["Lipton Ice Tea", 15], ["Iced coffee", 17],
    ["Mojito classique", 22], ["Mojito orange", 22], ["Mojito blueberry", 22],
    ["Mojito fruits de la passion", 22],
  ],
  "Jus de fruits": [
    ["Jus d’orange", 18], ["Jus de citron", 20], ["Jus de banane au lait", 17],
    ["Jus de pomme au lait", 17], ["Jus d’avocat au lait", 20],
    ["Jus de fraise au lait", 20], ["Jus de banane orange", 20],
    ["Jus de pomme orange", 20], ["Jus d’avocat orange", 23],
    ["Jus de fraise", 23], ["Jus de mangue", 22], ["Jus d’ananas", 22],
    ["Jus de pêche", 20], ["Panaché au lait", 23], ["Panaché à l’orange", 25],
  ],
  "Petit déjeuner": [
    ["Express", 25, "Jus d’orange, boisson chaude (thé ou café), eau 33cl, 1 grande viennoiserie ou 2 petites, soupe belboula ou smida"],
    ["Continental", 28, "Jus d’orange, boisson chaude (thé ou café), eau 33cl, toast garni au choix, œufs durs ou fromage et confiture, soupe belboula ou smida"],
    ["Marocain", 32, "Jus d’orange, boisson chaude (thé ou café), eau 33cl, harcha, rghaif ou meloui, amlou, miel, fromage, olives noires, huile d’olive, soupe belboula ou smida"],
    ["Fassi", 34, "Jus d’orange, boisson chaude (thé ou café), eau 33cl, œufs au khlie, olives noires, soupe belboula ou smida"],
    ["Chamali", 36, "Jus d’orange, boisson chaude au chamali, eau 33cl, 2 œufs au choix, charcuterie, fromage rouge, jben, huile d’olive, olives noires, soupe belboula ou smida"],
    ["Le Cinq", 40, "Jus d’orange, boisson chaude (thé ou café), eau 33cl, toast aux œufs avec charcuterie et fromage rouge, yaourt, olives noires, soupe belboula ou smida"],
  ],
  "À la carte": [["Crêpe au Nutella", 20], ["Crêpe Nutella banane", 25], ["Toast dinde fumée fromage", 18]],
  "Omelettes": [["Nature", 10], ["Aux herbes", 12], ["Fromage", 15], ["Khlie", 25]],
  "Supplément": [["Jben ou confiture", 2], ["Rghaif ou meloui", 5], ["Harcha", 4], ["Viennoiserie", 8]],
  "Dessert / Viennoiserie": [],
};

async function main() {
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.menuItem.deleteMany();
  await db.menuCategory.deleteMany();
  await db.cafeTable.deleteMany();
  await db.waiter.deleteMany();
  for (let i = 1; i <= 12; i++) await db.cafeTable.create({ data: { number: i } });
  for (const name of ["Mostafa", "Hassan"]) await db.waiter.create({ data: { name } });
  let sortOrder = 0;
  for (const [name, items] of Object.entries(menu)) {
    const category = await db.menuCategory.create({ data: { name, sortOrder: sortOrder++ } });
    for (const [itemName, price, description] of items) {
      await db.menuItem.create({ data: { name: itemName, price, description, categoryId: category.id } });
    }
  }
}

main().finally(() => db.$disconnect());
