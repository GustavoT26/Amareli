import type { Metadata, Viewport } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Amareli — Doces artesanais", template: "%s | Amareli" },
  description: "Doces feitos de forma artesanal, com carinho, capricho e ingredientes de qualidade.",
};

export const viewport: Viewport = { themeColor: "#fbf6ef", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className={`${fraunces.variable} ${dmSans.variable}`}>{children}</body></html>;
}
