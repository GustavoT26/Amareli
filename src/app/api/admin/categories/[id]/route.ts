import { NextResponse } from "next/server";
import { z } from "zod";
import { categoryInputSchema } from "@/features/admin/schemas";
import { getAdminRequestSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await getAdminRequestSession(request)) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados não configurado." }, { status: 503 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Dados inválidos." }, { status: 400 }); }
  const parsed = categoryInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Confira os dados da categoria." }, { status: 400 });
  const { id } = await context.params;
  if (!z.string().min(1).max(100).safeParse(id).success) return NextResponse.json({ error: "Identificador de categoria inválido." }, { status: 400 });
  try { return NextResponse.json({ category: await prisma.category.update({ where: { id }, data: parsed.data }) }); }
  catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return NextResponse.json({ error: "Esse identificador de categoria já está em uso." }, { status: 409 });
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") return NextResponse.json({ error: "Categoria não encontrada." }, { status: 404 });
    return NextResponse.json({ error: "Não foi possível atualizar a categoria." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await getAdminRequestSession(request)) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados não configurado." }, { status: 503 });
  const { id } = await context.params;
  if (!z.string().min(1).max(100).safeParse(id).success) return NextResponse.json({ error: "Identificador de categoria inválido." }, { status: 400 });
  try { await prisma.category.delete({ where: { id } }); return NextResponse.json({ ok: true }); }
  catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") return NextResponse.json({ error: "Categoria não encontrada." }, { status: 404 });
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2003") return NextResponse.json({ error: "Esta categoria ainda possui produtos. Transfira ou remova os produtos antes." }, { status: 409 });
    return NextResponse.json({ error: "Não foi possível remover a categoria." }, { status: 500 });
  }
}
