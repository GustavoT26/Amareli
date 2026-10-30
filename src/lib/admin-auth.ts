import { headers } from "next/headers";
import { auth, isAdminEmail } from "@/lib/auth";

export async function getAdminSession() {
  if (!auth) return null;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !isAdminEmail(session.user.email)) return null;
  return session;
}

export async function getAdminRequestSession(request: Request) {
  if (!auth) return null;
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || !isAdminEmail(session.user.email)) return null;
  return session;
}
