import { NextResponse } from "next/server";
import { checkoutRequestSchema } from "@/features/store/checkout-schema";
import { findProduct, boxPrices, productOrderLabel } from "@/features/store/catalog";
import { makeWhatsappMessage, type PricedLine } from "@/features/store/order-message";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Não foi possível ler os dados do pedido." }, { status: 400 });
  }
  const parsed = checkoutRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Confira os dados do pedido." }, { status: 400 });
  }
  const input = parsed.data;
  const slugs = [...new Set(input.cart.filter((line) => line.kind === "product").map((line) => line.kind === "product" ? line.slug : ""))];
  let authoritativeProducts = new Map<string, { name: string; priceCents: number; available: boolean; category: { slug: string } }>();
  let whatsappNumber: string | null = null;
  let acceptedPayments = ["Pix", "Dinheiro", "Cartão"];
  let databaseWasAvailable = false;

  if (prisma) {
    try {
      const [products, store] = await Promise.all([
        prisma.product.findMany({ where: { slug: { in: slugs } }, select: { slug: true, name: true, priceCents: true, available: true, category: { select: { slug: true } } } }),
        prisma.storeSettings.findUnique({ where: { id: "store" }, select: { whatsappNumber: true, acceptedPayments: true } }),
      ]);
      authoritativeProducts = new Map(products.map((product) => [product.slug, product]));
      whatsappNumber = store?.whatsappNumber ?? null;
      acceptedPayments = store?.acceptedPayments ?? acceptedPayments;
      databaseWasAvailable = true;
    } catch {
      // A local preview remains usable before PostgreSQL is started.
    }
  }

  if (!acceptedPayments.includes(input.paymentMethod)) {
    return NextResponse.json({ error: "Essa forma de pagamento não está disponível. Atualize a página e escolha outra opção." }, { status: 400 });
  }

  const lines: PricedLine[] = [];
  for (const entry of input.cart) {
    if (entry.kind === "product") {
      const product = databaseWasAvailable ? authoritativeProducts.get(entry.slug) : findProduct(entry.slug);
      if (!product || !product.available) {
        return NextResponse.json({ error: `O produto ${entry.slug} não está disponível. Atualize o catálogo e tente novamente.` }, { status: 409 });
      }
      const categorySlug = databaseWasAvailable ? product.category.slug : findProduct(entry.slug)!.category.slug;
      lines.push({ name: productOrderLabel(categorySlug, product.name), quantity: entry.quantity, unitPriceCents: product.priceCents, subtotalCents: product.priceCents * entry.quantity });
    } else {
      lines.push({
        name: `Caixinha personalizada (${entry.size} brownies)`,
        quantity: 1,
        unitPriceCents: boxPrices[entry.size],
        subtotalCents: boxPrices[entry.size],
        box: { size: entry.size, flavors: entry.flavors, bowColor: entry.bowColor },
      });
    }
  }

  const message = makeWhatsappMessage(input, lines);
  const number = (whatsappNumber ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5582991140378").replace(/\D/g, "");
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  return NextResponse.json({ url });
}
