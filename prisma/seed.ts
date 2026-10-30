import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { catalog, categories } from "../src/features/store/catalog";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("Defina DATABASE_URL antes de popular o banco.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  for (const category of categories) {
    const savedCategory = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, emoji: category.emoji, sortOrder: category.sortOrder },
      create: category,
    });
    for (const product of catalog.filter((item) => item.category.slug === category.slug)) {
      await prisma.product.upsert({
        where: { slug: product.slug },
        update: {
          name: product.name,
          description: product.description,
          priceCents: product.priceCents,
          imageUrl: product.imageUrl,
          available: product.available,
          featured: product.featured,
          categoryId: savedCategory.id,
        },
        create: {
          slug: product.slug,
          name: product.name,
          description: product.description,
          priceCents: product.priceCents,
          imageUrl: product.imageUrl,
          available: product.available,
          featured: product.featured,
          categoryId: savedCategory.id,
        },
      });
    }
  }

  await prisma.storeSettings.upsert({
    where: { id: "store" },
    update: {},
    create: {
      id: "store",
      storeName: process.env.NEXT_PUBLIC_STORE_NAME ?? "Amareli",
      whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5582991140378",
      monthlyPromotion: process.env.NEXT_PUBLIC_MONTHLY_PROMOTION ?? "Quem mais comprar este mês ganha um prêmio especial!",
    },
  });
  console.log(`Catálogo populado: ${catalog.length} produtos em ${categories.length} categorias.`);
}

main().finally(async () => prisma.$disconnect());
