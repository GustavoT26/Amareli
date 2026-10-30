import { catalog, categories, type CatalogProduct } from "@/features/store/catalog";
import { prisma } from "@/lib/prisma";

export async function loadStorefront() {
  if (prisma) {
    try {
      const [databaseCategories, settings] = await Promise.all([
        prisma.category.findMany({ orderBy: { sortOrder: "asc" }, include: { products: { where: { available: true }, orderBy: { name: "asc" } } } }),
        prisma.storeSettings.findUnique({ where: { id: "store" } }),
      ]);
      if (databaseCategories.length > 0) {
        const products: CatalogProduct[] = databaseCategories.flatMap((category) =>
          category.products.map((product) => ({
            id: product.id,
            slug: product.slug,
            name: product.name,
            description: product.description,
            priceCents: product.priceCents,
            imageUrl: product.imageUrl,
            available: product.available,
            featured: product.featured,
            category: { slug: category.slug, name: category.name, emoji: category.emoji, sortOrder: category.sortOrder },
          })),
        );
        return {
          categories: databaseCategories.map(({ slug, name, emoji, sortOrder }) => ({ slug, name, emoji, sortOrder })),
          products,
          promotion: settings?.monthlyPromotion ?? process.env.NEXT_PUBLIC_MONTHLY_PROMOTION ?? "Quem mais comprar este mês ganha um prêmio especial!",
          storeName: settings?.storeName ?? process.env.NEXT_PUBLIC_STORE_NAME ?? "Amareli",
          acceptedPayments: settings?.acceptedPayments ?? ["Pix", "Dinheiro", "Cartão"],
        };
      }
    } catch (error) {
      console.warn("Banco indisponível: usando o catálogo de reserva.", error instanceof Error ? error.message : "erro desconhecido");
    }
  }
  return {
    categories,
    products: catalog,
    promotion: process.env.NEXT_PUBLIC_MONTHLY_PROMOTION ?? "Quem mais comprar este mês ganha um prêmio especial!",
    storeName: process.env.NEXT_PUBLIC_STORE_NAME ?? "Amareli",
    acceptedPayments: ["Pix", "Dinheiro", "Cartão"],
  };
}
