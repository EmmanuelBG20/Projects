import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        carbon: {
          950: "#08090b",
          900: "#0d0f12",
          800: "#131519",
          700: "#1a1d22",
          600: "#22262c",
        },
        graphite: {
          500: "#3a3f47",
          400: "#565c66",
        },
        racing: {
          orange: "#ff6a1a",
          "orange-light": "#ff8a4c",
          red: "#e8384f",
        },
        neon: {
          green: "#39ff8a",
        },
      },
      fontFamily: {
        display: ["var(--font-orbitron)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(255, 106, 26, 0.25)",
        card: "0 4px 24px rgba(0, 0, 0, 0.35)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
