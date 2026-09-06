import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#08080b",
          900: "#0c0c10",
          800: "#131318",
          700: "#1c1c23",
          600: "#2a2a33",
        },
        paper: {
          50: "#fafafa",
          200: "#e4e4e9",
          400: "#9a9aa5",
        },
        accent: {
          DEFAULT: "#7c5cff",
          light: "#a78bfa",
          dim: "#5b3fd9",
        },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      backgroundImage: {
        "radial-fade": "radial-gradient(circle at 50% 0%, rgba(124,92,255,0.18), transparent 60%)",
      },
    },
  },
  plugins: [],
};

export default config;
