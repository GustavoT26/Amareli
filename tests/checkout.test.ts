import { describe, expect, it } from "vitest";
import { checkoutRequestSchema } from "../src/features/store/checkout-schema";
import { makeWhatsappMessage } from "../src/features/store/order-message";
import { boxPrices, catalog, filterProducts, productOrderLabel } from "../src/features/store/catalog";
import { createCartId } from "../src/features/store/cart-id";

describe("vitrine e identificadores do carrinho", () => {
  it("filtra produtos pela categoria selecionada", () => {
    const cakes = filterProducts(catalog, "bolos-de-pote");
    expect(cakes.length).toBe(7);
    expect(cakes.every((product) => product.category.slug === "bolos-de-pote")).toBe(true);
    expect(filterProducts(catalog, "todos")).toHaveLength(31);
  });

  it("identifica a categoria junto ao sabor do produto", () => {
    expect(productOrderLabel("brownies", "Ninho")).toBe("Brownie de Ninho");
    expect(productOrderLabel("bolos-de-pote", "Chocomousse")).toBe("Bolo de pote Chocomousse");
    expect(productOrderLabel("coxinhas", "Coxinha de frango")).toBe("Coxinha de frango");
  });

  it("cria um identificador compatível quando randomUUID não existe", () => {
    expect(createCartId(null)).toMatch(/^cart-[a-z0-9]+-[a-z0-9]+$/);
    expect(createCartId(() => "browser-uuid")).toBe("browser-uuid");
  });
});

const base = {
  customerName: "Ana Maria",
  customerPhone: "82999990000",
  paymentMethod: "Pix" as const,
  notes: "Sem guardanapo",
  cart: [{ kind: "product" as const, id: "brownie-ninho", slug: "brownie-ninho", quantity: 2 }],
};

describe("validação do checkout", () => {
  it("aceita um pedido válido sem exigir login", () => {
    expect(checkoutRequestSchema.safeParse(base).success).toBe(true);
  });

  it("não aceita opções ou endereço de entrega no checkout", () => {
    const result = checkoutRequestSchema.parse({ ...base, fulfillment: "delivery", address: "Rua das Flores, 123" });
    expect(result).not.toHaveProperty("fulfillment");
    expect(result).not.toHaveProperty("address");
  });

  it("não permite escolher uma quantidade de sabores diferente do tamanho da caixa", () => {
    const result = checkoutRequestSchema.safeParse({
      ...base,
      cart: [{ kind: "box", id: "ac2ea7d4-1463-4aec-a7aa-5fb3d8e1f231", size: 4, flavors: ["Ninho", "Tipo Ferrero"], bowColor: "Rosa" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("mensagem do pedido", () => {
  it("usa os subtotais calculados e inclui os dados da caixinha", () => {
    const message = makeWhatsappMessage({
      ...base,
      cart: [...base.cart, { kind: "box", id: "ac2ea7d4-1463-4aec-a7aa-5fb3d8e1f231", size: 2, flavors: ["Ninho", "Tipo Ferrero"], bowColor: "Rosa" }],
    }, [
      { name: "Brownie de Ninho", quantity: 2, unitPriceCents: 500, subtotalCents: 1000 },
      { name: "Caixinha personalizada (2 brownies)", quantity: 1, unitPriceCents: boxPrices[2], subtotalCents: boxPrices[2], box: { size: 2, flavors: ["Ninho", "Tipo Ferrero"], bowColor: "Rosa" } },
    ]);
    expect(message).toContain("2 × Brownie de Ninho — R$ 10,00");
    expect(message).toContain("laço rosa");
    expect(message).toContain("Tipo Ferrero");
    expect(message).toContain("*Total:* R$ 35,00");
    expect(message).toContain("*Observações:* Sem guardanapo");
    expect(message).toContain("*Forma de pagamento:* Pix");
  });

  it("mantém o recebimento por retirada sem mencionar entrega ou endereço", () => {
    const message = makeWhatsappMessage(base, [
      { name: "Bolo de pote Chocomousse", quantity: 1, unitPriceCents: 800, subtotalCents: 800 },
    ]);
    expect(message).toContain("*Forma de recebimento:* Retirada");
    expect(message).toContain("1 × Bolo de pote Chocomousse — R$ 8,00");
    expect(message).toContain("*Total:* R$ 8,00");
    expect(message).not.toMatch(/entrega|endereço/i);
  });
});
