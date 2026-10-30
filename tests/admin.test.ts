import { describe, expect, it } from "vitest";
import { categoryInputSchema, productInputSchema, storeSettingsSchema } from "../src/features/admin/schemas";

const product = {
  slug: "brownie-ninho",
  name: "Brownie de Ninho",
  description: "Brigadeiro cremoso de Ninho",
  priceCents: 500,
  imageUrl: "https://example.com/brownie.jpg",
  categoryId: "category-brownie",
  available: true,
  featured: false,
};

describe("validação do painel administrativo", () => {
  it("aceita produtos com preço em centavos e imagem válida", () => {
    expect(productInputSchema.safeParse(product).success).toBe(true);
  });

  it("rejeita slug e preço inválidos", () => {
    expect(productInputSchema.safeParse({ ...product, slug: "Brownie Ninho", priceCents: 5.5 }).success).toBe(false);
  });

  it("aceita categorias e dados comerciais coerentes", () => {
    expect(categoryInputSchema.safeParse({ slug: "brownies", name: "Brownies", emoji: "🍫", sortOrder: 0 }).success).toBe(true);
    expect(storeSettingsSchema.safeParse({ storeName: "Amareli", whatsappNumber: "5582991140378", monthlyPromotion: "Ação do mês", acceptedPayments: ["Pix", "Dinheiro"] }).success).toBe(true);
  });

  it("não aceita telefone comercial com pontuação", () => {
    expect(storeSettingsSchema.safeParse({ storeName: "Amareli", whatsappNumber: "+55 (82) 99114-0378", monthlyPromotion: "Ação do mês", acceptedPayments: ["Pix"] }).success).toBe(false);
  });
});
