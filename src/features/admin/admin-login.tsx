"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function AdminLogin({ enabled }: { enabled: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function signIn() {
    setLoading(true);
    setError("");
    try {
      const result = await authClient.signIn.social({ provider: "google", callbackURL: "/admin" });
      if (result.error) setError(result.error.message ?? "Não foi possível iniciar o login com Google.");
    } catch {
      setError("Não foi possível conectar ao servidor de autenticação. Confira se o PostgreSQL está ativo e se as credenciais de DATABASE_URL estão corretas; depois reinicie o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return <>
    <button type="button" className="admin-google-button" onClick={signIn} disabled={!enabled || loading}>
      <GoogleMark />{loading ? "Abrindo o Google…" : "Entrar com Google"}
    </button>
    {error && <p className="admin-alert" role="alert">{error}</p>}
  </>;
}

function GoogleMark() {
  return <svg aria-hidden="true" viewBox="0 0 48 48" width="18" height="18"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.65 5.94c4.47-4.14 7.13-10.24 7.13-17.59Z"/><path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.2a23.93 23.93 0 0 0 0 21.57l7.98-6.19Z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.86l-7.65-5.94c-2.12 1.42-4.84 2.26-8.25 2.26-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/></svg>;
}
