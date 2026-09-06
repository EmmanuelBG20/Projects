import type { Metadata } from "next";
import { Orbitron, Inter } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import "./globals.css";

const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron", weight: ["600", "700", "800", "900"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "BASTI MOTOS — Performance & Care for Riders",
  description:
    "Kits, herramientas y productos de mantenimiento para motocicletas en Colombia. Rendimiento, seguridad y estilo para riders.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${orbitron.variable} ${inter.variable}`}>
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
