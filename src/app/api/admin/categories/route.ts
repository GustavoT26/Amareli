import { NextResponse } from "next/server";
import { categoryInputSchema } from "@/features/admin/schemas";
import { getAdminRequestSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!await getAdminRequestSession(request)) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados não configurado." }, { status: 503 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Dados inválidos." }, { status: 400 }); }
  const parsed = categoryInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Confira os dados da categoria." }, { status: 400 });
  try { return NextResponse.json({ category: await prisma.category.create({ data: parsed.data }) }, { status: 201 }); }
  catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return NextResponse.json({ error: "Esse identificador de categoria já está em uso." }, { status: 409 });
    return NextResponse.json({ error: "Não foi possível criar a categoria." }, { status: 500 });
  }
}
