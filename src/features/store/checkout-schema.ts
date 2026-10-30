import { z } from "zod";
import { bowColors, boxFlavors } from "@/features/store/catalog";

export const cartEntrySchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("product"),
    id: z.string().min(1).max(120),
    slug: z.string().min(1).max(120),
    quantity: z.number().int().min(1).max(50),
  }),
  z.object({
    kind: z.literal("box"),
    id: z.string().min(1).max(120),
    size: z.union([z.literal(2), z.literal(4)]),
    flavors: z.array(z.enum(boxFlavors)).min(2).max(4),
    bowColor: z.enum(bowColors),
  }).superRefine((box, ctx) => {
    if (box.flavors.length !== box.size) {
      ctx.addIssue({ code: "custom", message: "Escolha exatamente a quantidade de brownies da caixinha." });
    }
  }),
]);

export const checkoutRequestSchema = z.object({
  customerName: z.string().trim().min(2, "Informe seu nome.").max(100),
  customerPhone: z.string().trim().max(30).optional().default(""),
  paymentMethod: z.enum(["Pix", "Dinheiro", "Cartão"], { message: "Selecione a forma de pagamento." }),
  notes: z.string().trim().max(500).optional().default(""),
  cart: z.array(cartEntrySchema).min(1, "Seu carrinho está vazio.").max(100),
});

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
