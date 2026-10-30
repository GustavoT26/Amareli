import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export const GET = async (request: Request) => {
  if (!auth) return Response.json({ error: "Autenticação indisponível sem banco configurado." }, { status: 503 });
  return toNextJsHandler(auth).GET(request);
};

export const POST = async (request: Request) => {
  if (!auth) return Response.json({ error: "Autenticação indisponível sem banco configurado." }, { status: 503 });
  return toNextJsHandler(auth).POST(request);
};
