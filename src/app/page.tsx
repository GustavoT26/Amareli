import type { Metadata } from "next";
import { Storefront } from "@/features/store/storefront";
import { loadStorefront } from "@/features/store/server-catalog";

export const metadata: Metadata = {
  title: "Amareli — Doces artesanais feitos com carinho",
  description: "Brownies, bolos de pote, cones trufados e caixinhas personalizadas para adoçar seus dias. Escolha seus favoritos e peça pelo WhatsApp.",
};

export default async function Home() {
  const storefront = await loadStorefront();
  return <Storefront {...storefront} />;
}
