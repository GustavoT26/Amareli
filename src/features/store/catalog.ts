export type Category = {
  slug: string;
  name: string;
  emoji: string;
  sortOrder: number;
};

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  available: boolean;
  featured: boolean;
  category: Category;
};

export const categories: Category[] = [
  { slug: "brownies", name: "Brownies", emoji: "🍫", sortOrder: 0 },
  { slug: "bolos-de-pote", name: "Bolos de pote", emoji: "🍰", sortOrder: 1 },
  { slug: "cones-trufados", name: "Cones trufados", emoji: "🍦", sortOrder: 2 },
  { slug: "fatias-de-bolo", name: "Fatias de bolo", emoji: "🎂", sortOrder: 3 },
  { slug: "copos-felicidade", name: "Copo Felicidade", emoji: "🍓", sortOrder: 4 },
  { slug: "coxinhas", name: "Coxinhas", emoji: "🥟", sortOrder: 5 },
];

const photo = {
  brownie: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=900&auto=format&fit=crop&q=85",
  cake: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&auto=format&fit=crop&q=85",
  cone: "https://images.unsplash.com/photo-1488900128323-21503983a07e?w=900&auto=format&fit=crop&q=85",
  slice: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&auto=format&fit=crop&q=85",
  cup: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=900&auto=format&fit=crop&q=85",
  savory: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=900&auto=format&fit=crop&q=85",
};

type ProductSeed = Omit<CatalogProduct, "category"> & { categorySlug: string };

const seed: ProductSeed[] = [
  { id: "brownie-maracuja", slug: "brownie-maracuja", name: "Maracujá", description: "Brigadeiro cremoso de maracujá da fruta", priceCents: 600, imageUrl: photo.brownie, available: true, featured: true, categorySlug: "brownies" },
  { id: "brownie-maracuja-chocolate", slug: "brownie-maracuja-chocolate", name: "Maracujá com chocolate", description: "Brigadeiro de maracujá com chocolate 50% cacau", priceCents: 600, imageUrl: photo.brownie, available: true, featured: false, categorySlug: "brownies" },
  { id: "brownie-chocolate", slug: "brownie-chocolate", name: "Chocolate", description: "Brigadeiro de chocolate 50% cacau", priceCents: 500, imageUrl: photo.brownie, available: true, featured: false, categorySlug: "brownies" },
  { id: "brownie-ninho", slug: "brownie-ninho", name: "Ninho", description: "Brigadeiro cremoso de Ninho", priceCents: 500, imageUrl: photo.brownie, available: true, featured: true, categorySlug: "brownies" },
  { id: "brownie-choconinho", slug: "brownie-choconinho", name: "Choconinho", description: "Brigadeiro de Ninho com brigadeiro de chocolate 50% cacau", priceCents: 500, imageUrl: photo.brownie, available: true, featured: false, categorySlug: "brownies" },
  { id: "brownie-ninho-nutella", slug: "brownie-ninho-nutella", name: "Ninho com Nutella", description: "Brigadeiro de Ninho com Nutella", priceCents: 600, imageUrl: photo.brownie, available: true, featured: false, categorySlug: "brownies" },
  { id: "brownie-crocante", slug: "brownie-crocante", name: "Crocante", description: "Chocolate 50% cacau com amendoim triturado", priceCents: 600, imageUrl: photo.brownie, available: true, featured: false, categorySlug: "brownies" },
  { id: "brownie-ferrero", slug: "brownie-ferrero", name: "Tipo Ferrero", description: "Brigadeiro de chocolate 50% cacau, amendoim triturado e Nutella", priceCents: 600, imageUrl: photo.brownie, available: true, featured: true, categorySlug: "brownies" },
  { id: "brownie-napolitano", slug: "brownie-napolitano", name: "Napolitano", description: "Brigadeiro de chocolate 50% cacau, brigadeiro de Ninho e brigadeiro de morango", priceCents: 600, imageUrl: photo.brownie, available: true, featured: false, categorySlug: "brownies" },
  { id: "pote-chocomousse", slug: "pote-chocomousse", name: "Chocomousse", description: "Massa de chocolate, mousse de chocolate e brigadeiro 50% cacau", priceCents: 800, imageUrl: photo.cake, available: true, featured: true, categorySlug: "bolos-de-pote" },
  { id: "pote-crocante", slug: "pote-crocante", name: "Crocante", description: "Massa de chocolate, brigadeiro de chocolate 50% cacau e crocante de amendoim", priceCents: 800, imageUrl: photo.cake, available: true, featured: false, categorySlug: "bolos-de-pote" },
  { id: "pote-maracuja-chocolate", slug: "pote-maracuja-chocolate", name: "Maracujá com chocolate", description: "Massa de chocolate, brigadeiro de maracujá da fruta e brigadeiro de chocolate 50% cacau", priceCents: 800, imageUrl: photo.cake, available: true, featured: false, categorySlug: "bolos-de-pote" },
  { id: "pote-choconinho", slug: "pote-choconinho", name: "Choconinho", description: "Massa de chocolate, brigadeiro cremoso de Ninho e brigadeiro 50% cacau", priceCents: 800, imageUrl: photo.cake, available: true, featured: false, categorySlug: "bolos-de-pote" },
  { id: "pote-ninho-nutella", slug: "pote-ninho-nutella", name: "Ninho com Nutella", description: "Massa de chocolate, recheio cremoso de Ninho e Nutella", priceCents: 800, imageUrl: photo.cake, available: true, featured: false, categorySlug: "bolos-de-pote" },
  { id: "pote-ferrero", slug: "pote-ferrero", name: "Tipo Ferrero", description: "Massa de chocolate, recheio cremoso de chocolate 50% cacau, amendoim triturado e Nutella", priceCents: 800, imageUrl: photo.cake, available: true, featured: true, categorySlug: "bolos-de-pote" },
  { id: "pote-cobertura-crocante", slug: "pote-cobertura-crocante", name: "Chocolate com cobertura crocante", description: "Massa de chocolate, recheio cremoso de Ninho e cobertura crocante de chocolate", priceCents: 800, imageUrl: photo.cake, available: true, featured: false, categorySlug: "bolos-de-pote" },
  { id: "cone-oreo", slug: "cone-oreo", name: "Oreo", description: "Brigadeiro cremoso de Oreo", priceCents: 700, imageUrl: photo.cone, available: true, featured: false, categorySlug: "cones-trufados" },
  { id: "cone-maracuja", slug: "cone-maracuja", name: "Maracujá", description: "Brigadeiro cremoso de maracujá da fruta", priceCents: 700, imageUrl: photo.cone, available: true, featured: false, categorySlug: "cones-trufados" },
  { id: "cone-maracuja-chocolate", slug: "cone-maracuja-chocolate", name: "Maracujá com chocolate", description: "Brigadeiro de maracujá da fruta com brigadeiro de chocolate 50% cacau", priceCents: 700, imageUrl: photo.cone, available: true, featured: false, categorySlug: "cones-trufados" },
  { id: "cone-brigadeiro", slug: "cone-brigadeiro", name: "Brigadeiro", description: "Brigadeiro cremoso de chocolate 50% cacau", priceCents: 700, imageUrl: photo.cone, available: true, featured: true, categorySlug: "cones-trufados" },
  { id: "cone-sensacao", slug: "cone-sensacao", name: "Sensação", description: "Brigadeiro de morango com brigadeiro de chocolate 50% cacau", priceCents: 700, imageUrl: photo.cone, available: true, featured: false, categorySlug: "cones-trufados" },
  { id: "cone-crocante", slug: "cone-crocante", name: "Crocante", description: "Brigadeiro cremoso 50% cacau com amendoim caramelizado", priceCents: 700, imageUrl: photo.cone, available: true, featured: false, categorySlug: "cones-trufados" },
  { id: "cone-ninho-nutella", slug: "cone-ninho-nutella", name: "Ninho com Nutella", description: "Brigadeiro cremoso de Ninho com Nutella", priceCents: 700, imageUrl: photo.cone, available: true, featured: true, categorySlug: "cones-trufados" },
  { id: "cone-napolitano", slug: "cone-napolitano", name: "Napolitano", description: "Brigadeiro de chocolate 50% cacau, brigadeiro de Ninho e brigadeiro de morango", priceCents: 700, imageUrl: photo.cone, available: true, featured: false, categorySlug: "cones-trufados" },
  { id: "cone-choconinho", slug: "cone-choconinho", name: "Choconinho", description: "Brigadeiro de chocolate 50% cacau com brigadeiro de Ninho", priceCents: 700, imageUrl: photo.cone, available: true, featured: false, categorySlug: "cones-trufados" },
  { id: "fatia-chocomousse", slug: "fatia-chocomousse", name: "Chocomousse", description: "Massa de chocolate, mousse de chocolate e brigadeiro cremoso 50% cacau", priceCents: 1000, imageUrl: photo.slice, available: true, featured: true, categorySlug: "fatias-de-bolo" },
  { id: "copo-morango", slug: "copo-morango", name: "Bombom aberto de morango", description: "Morango, ganache de chocolate e brigadeiro de Ninho", priceCents: 800, imageUrl: photo.cup, available: true, featured: true, categorySlug: "copos-felicidade" },
  { id: "copo-uva", slug: "copo-uva", name: "Bombom aberto de uva", description: "Uva, ganache de chocolate e brigadeiro de Ninho", priceCents: 800, imageUrl: photo.cup, available: true, featured: false, categorySlug: "copos-felicidade" },
  { id: "copo-mix-frutas", slug: "copo-mix-frutas", name: "Mix de frutas", description: "Morango, uva, brigadeiro de maracujá e ganache de chocolate", priceCents: 800, imageUrl: photo.cup, available: true, featured: false, categorySlug: "copos-felicidade" },
  { id: "coxinha-frango", slug: "coxinha-frango", name: "Coxinha de frango", description: "Massa suculenta com frango desfiado, empanada em farinha panko", priceCents: 700, imageUrl: photo.savory, available: true, featured: false, categorySlug: "coxinhas" },
  { id: "coxinha-frango-requeijao", slug: "coxinha-frango-requeijao", name: "Coxinha de frango com requeijão", description: "Massa suculenta com frango desfiado e requeijão cremoso, empanada em farinha panko", priceCents: 800, imageUrl: photo.savory, available: true, featured: true, categorySlug: "coxinhas" },
];

export const catalog: CatalogProduct[] = seed.map(({ categorySlug, ...item }) => ({
  ...item,
  category: categories.find((category) => category.slug === categorySlug)!,
}));

export const boxFlavors = [
  "Maracujá",
  "Maracujá com chocolate",
  "Ninho",
  "Ninho com Nutella",
  "Brigadeiro de chocolate 50% cacau",
  "Brigadeiro de chocolate 50% cacau com amendoim triturado",
  "Tipo Ferrero",
] as const;

export const bowColors = ["Rosa", "Branco", "Vermelho"] as const;
export const boxPrices: Record<2 | 4, number> = { 2: 2500, 4: 3500 };

export function findProduct(slug: string) {
  return catalog.find((product) => product.slug === slug);
}

const orderCategoryLabels: Record<string, string> = {
  brownies: "Brownie",
  "bolos-de-pote": "Bolo de pote",
  "cones-trufados": "Cone trufado",
  "fatias-de-bolo": "Fatia de bolo",
  "copos-felicidade": "Copo Felicidade",
  coxinhas: "Coxinha",
};

export function productOrderLabel(categorySlug: string, productName: string) {
  if (categorySlug === "coxinhas") return productName;
  if (categorySlug === "copos-felicidade") return `Copo Felicidade — ${productName}`;
  const categoryLabel = orderCategoryLabels[categorySlug] ?? "Doce";
  return `${categoryLabel} ${categorySlug === "brownies" || categorySlug === "cones-trufados" ? "de " : ""}${productName}`;
}

export function filterProducts(products: CatalogProduct[], categorySlug: string) {
  return categorySlug === "todos" ? products : products.filter((product) => product.category.slug === categorySlug);
}
