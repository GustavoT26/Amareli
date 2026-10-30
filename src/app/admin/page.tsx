import { redirect } from "next/navigation";
import { AdminDashboard } from "@/features/admin/admin-dashboard";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Painel administrativo" };

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (!prisma) redirect("/admin/login");
  const [categories, products, settings] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, slug: true, name: true, emoji: true, sortOrder: true } }),
    prisma.product.findMany({ include: { category: { select: { id: true, slug: true, name: true, emoji: true, sortOrder: true } } }, orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }] }),
    prisma.storeSettings.findUnique({ where: { id: "store" }, select: { storeName: true, whatsappNumber: true, monthlyPromotion: true, acceptedPayments: true } }),
  ]);
  return <AdminDashboard user={{ name: session.user.name, email: session.user.email, image: session.user.image }} initialData={{ categories, products, settings }} />;
}
