import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://portfolio-gules-xi-54.vercel.app"),
  title: "Emmanuel Bermúdez Gutiérrez — Desarrollador Full Stack",
  description:
    "Construyo productos de e-commerce reales: pagos, inventario e integraciones que funcionan en producción, no solo en la demo.",
  openGraph: {
    title: "Emmanuel Bermúdez Gutiérrez — Desarrollador Full Stack",
    description:
      "Construyo productos de e-commerce reales: pagos, inventario e integraciones que funcionan en producción, no solo en la demo.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="noise">{children}</body>
    </html>
  );
}
