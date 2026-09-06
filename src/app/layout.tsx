import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";
import { AnalyticsScripts } from "@/components/analytics-scripts";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "NOVAWEAR — Ropa esencial, hecha para durar",
    template: "%s | NOVAWEAR",
  },
  description:
    "NOVAWEAR es una marca de ropa esencial: camisetas, hoodies, pantalones, chaquetas y accesorios diseñados con materiales premium y un enfoque minimalista.",
  keywords: ["ropa", "moda", "hoodies", "camisetas", "streetwear", "Colombia", "NOVAWEAR"],
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "NOVAWEAR",
    title: "NOVAWEAR — Ropa esencial, hecha para durar",
    description: "Camisetas, hoodies, pantalones, chaquetas y accesorios con diseño minimalista.",
    url: appUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "NOVAWEAR",
    description: "Ropa esencial, hecha para durar.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "NOVAWEAR",
              url: appUrl,
              logo: `${appUrl}/logo.png`,
              sameAs: [],
            }),
          }}
        />
        <Providers>{children}</Providers>
        <AnalyticsScripts />
      </body>
    </html>
  );
}
