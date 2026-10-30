import Image from "next/image";
import Link from "next/link";
import { AdminLogin } from "@/features/admin/admin-login";
import { configuredAdminEmails, googleAuthConfigured } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Acesso administrativo" };

export default function AdminLoginPage() {
  return <main className="admin-login-page">
    <section className="admin-login-card">
      <Link href="/" className="admin-login-brand"><Image src="/amareli-logo.jpeg" alt="Amareli Doces Artesanais" width={78} height={78} /><span><strong>Amareli</strong><small>PAINEL ADMINISTRATIVO</small></span></Link>
      <h1>Bem-vinda de volta</h1>
      <p>Entre com a conta Google autorizada para administrar a loja.</p>
      <AdminLogin enabled={Boolean(prisma && googleAuthConfigured && configuredAdminEmails().length)} />
      {!prisma && <p className="admin-alert">Configure o banco PostgreSQL e rode as migrations para ativar o painel.</p>}
      {prisma && !googleAuthConfigured && <p className="admin-alert">Configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env para liberar o login Google.</p>}
      {prisma && googleAuthConfigured && !configuredAdminEmails().length && <p className="admin-alert">Defina ADMIN_EMAILS no .env com o e-mail Google autorizado a administrar a loja.</p>}
      <Link href="/" className="admin-back-link">Voltar para a loja</Link>
    </section>
  </main>;
}
