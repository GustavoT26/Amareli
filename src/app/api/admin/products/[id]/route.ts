import { NextResponse } from "next/server";
import { z } from "zod";
import { productInputSchema } from "@/features/admin/schemas";
import { getAdminRequestSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await getAdminRequestSession(request)) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados não configurado." }, { status: 503 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Dados inválidos." }, { status: 400 }); }
  const parsed = productInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Confira os dados do produto." }, { status: 400 });
  const { id } = await context.params;
  if (!z.string().min(1).max(100).safeParse(id).success) return NextResponse.json({ error: "Identificador de produto inválido." }, { status: 400 });
  try {
    const product = await prisma.product.update({ where: { id }, data: parsed.data, include: { category: true } });
    return NextResponse.json({ product });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return NextResponse.json({ error: "Esse identificador já está em uso por outro produto." }, { status: 409 });
    return NextResponse.json({ error: "Não foi possível atualizar o produto." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await getAdminRequestSession(request)) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados não configurado." }, { status: 503 });
  const { id } = await context.params;
  if (!z.string().min(1).max(100).safeParse(id).success) return NextResponse.json({ error: "Identificador de produto inválido." }, { status: 400 });
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
    return NextResponse.json({ error: "Não foi possível remover o produto." }, { status: 500 });
  }
}
