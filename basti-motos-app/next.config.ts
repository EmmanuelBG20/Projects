import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Evita que Next.js confunda la raíz del workspace cuando hay otro
  // package-lock.json más arriba en el árbol de carpetas del usuario.
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
