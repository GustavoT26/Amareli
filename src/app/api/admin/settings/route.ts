import { NextResponse } from "next/server";
import { storeSettingsSchema } from "@/features/admin/schemas";
import { getAdminRequestSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!await getAdminRequestSession(request)) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados não configurado." }, { status: 503 });
  try {
    const [categories, products, settings] = await Promise.all([
      prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.product.findMany({ include: { category: true }, orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }] }),
      prisma.storeSettings.findUnique({ where: { id: "store" } }),
    ]);
    return NextResponse.json({ categories, products, settings });
  } catch {
    return NextResponse.json({ error: "Não foi possível carregar os dados do painel." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!await getAdminRequestSession(request)) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados não configurado." }, { status: 503 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Dados inválidos." }, { status: 400 }); }
  const parsed = storeSettingsSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Confira as configurações." }, { status: 400 });
  try {
    const settings = await prisma.storeSettings.upsert({ where: { id: "store" }, create: { id: "store", ...parsed.data }, update: parsed.data });
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: "Não foi possível salvar as configurações." }, { status: 500 });
  }
}
