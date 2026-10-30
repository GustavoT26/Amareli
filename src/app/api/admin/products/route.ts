import { NextResponse } from "next/server";
import { productInputSchema } from "@/features/admin/schemas";
import { getAdminRequestSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!await getAdminRequestSession(request)) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados não configurado." }, { status: 503 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Dados inválidos." }, { status: 400 }); }
  const parsed = productInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Confira os dados do produto." }, { status: 400 });
  try {
    const product = await prisma.product.create({ data: parsed.data, include: { category: true } });
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (isUniqueError(error)) return NextResponse.json({ error: "Esse identificador já está em uso por outro produto." }, { status: 409 });
    if (isForeignKeyError(error)) return NextResponse.json({ error: "Selecione uma categoria existente." }, { status: 400 });
    return NextResponse.json({ error: "Não foi possível criar o produto." }, { status: 500 });
  }
}

function isUniqueError(error: unknown) { return typeof error === "object" && error !== null && "code" in error && error.code === "P2002"; }
function isForeignKeyError(error: unknown) { return typeof error === "object" && error !== null && "code" in error && error.code === "P2003"; }
