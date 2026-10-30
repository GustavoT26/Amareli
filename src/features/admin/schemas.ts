import { z } from "zod";

export const productInputSchema = z.object({
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use um identificador simples, sem espaços."),
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(3).max(1000),
  priceCents: z.number().int().min(1).max(10000000),
  imageUrl: z.string().trim().url("Informe uma URL de imagem válida.").max(1000),
  categoryId: z.string().min(1).max(100),
  available: z.boolean(),
  featured: z.boolean(),
});

export const categoryInputSchema = z.object({
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use um identificador simples, sem espaços."),
  name: z.string().trim().min(2).max(80),
  emoji: z.string().trim().min(1).max(12),
  sortOrder: z.number().int().min(0).max(1000),
});

export const storeSettingsSchema = z.object({
  storeName: z.string().trim().min(2).max(100),
  whatsappNumber: z.string().trim().regex(/^\d{10,15}$/, "Use o telefone internacional apenas com números."),
  monthlyPromotion: z.string().trim().min(1).max(500),
  acceptedPayments: z.array(z.enum(["Pix", "Dinheiro", "Cartão"])).min(1).max(3),
});
