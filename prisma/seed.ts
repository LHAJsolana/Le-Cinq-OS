import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const menu: Record<string,[string,number,string?][]> = {
  "Boisson chaude":[["Café Noir",13],["Café Nespresso",13],["Café au Lait",15],["Café Allongé",13],["Café Séparé",16],["Café Double Expresso",16],["Lait Chaud",10],["Verveine au Lait",15],["Lipton au Lait",15],["Thé à la Menthe",14],["Thé Chamali",14],["Verveine",14],["Lipton",13],["Lait au Chocolat",18],["Chocolat à l’ancienne",20],["Cappuccino",20]],
  "Boisson froide":[["Eau Minérale 33cl",6],["Eau Minérale 50cl",8],["Oulmes",10],["Soda",13],["Mojito",30]],
  "Jus de fruits":[["Jus d’orange",18],["Jus de citron",20],["Jus de banane au lait",16],["Jus de pomme au lait",16],["Jus d’avocat au lait",20],["Jus de fraise au lait",20],["Jus de banane orange",20],["Jus de pomme orange",20],["Jus d’avocat orange",30],["Jus de fraise orange",20],["Jus de mangue",20],["Jus d’ananas",20],["Jus de pêche",20],["Panaché au lait",25],["Panaché à l’orange",25]],
  "Petit déjeuner":[["Classique",22,"Thé ou café crème, jus d’orange, beurre, confiture, pain grillé"],["Simple",24,"Thé ou café crème, jus d’orange, viennoiserie"],["Gourmand",30,"Thé ou café crème, jus d’orange, omelette, jben, huile d’olive, olives noires"],["Marocain",26,"Thé ou café crème, jus d’orange, mloui ou harcha, miel, jben, huile d’olive"],["Fassi",32,"Thé ou café crème, jus d’orange, khlie, huile d’olives, olives noires"],["Maison",30,"Thé ou café crème, jus d’orange, amlou, huile d’olives, jben, miel"]],
  "À la carte":[["Crêpe au Nutella",20],["Crêpe Nutella banane",25],["Toast dinde fumée fromage",18]],
  "Omelettes":[["Nature",10],["Aux herbes",12],["Fromage",15],["Khlie",25]],
  "Supplément":[["Rghaif",5],["Viennoiserie",8],["Hercha",4]],
  "Dessert / Viennoiserie":[]
};
async function main(){
 await db.orderItem.deleteMany(); await db.order.deleteMany(); await db.menuItem.deleteMany(); await db.menuCategory.deleteMany(); await db.cafeTable.deleteMany(); await db.waiter.deleteMany();
 for(let i=1;i<=12;i++) await db.cafeTable.create({data:{number:i}});
 for(const name of ["Mostafa","Hassan"]) await db.waiter.create({data:{name}});
 let sort=0; for(const [name,items] of Object.entries(menu)){const category=await db.menuCategory.create({data:{name,sortOrder:sort++}}); for(const [itemName,price,description] of items) await db.menuItem.create({data:{name:itemName,price,description,categoryId:category.id}})}
}
main().finally(()=>db.$disconnect());
