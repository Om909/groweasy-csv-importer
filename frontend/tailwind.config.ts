import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F9F8",
        ink: "#151B24",
        grow: {
          50: "#EEFBF8",
          100: "#D7F5EE",
          400: "#14B39C",
          500: "#0E9488",
          600: "#0B7A70",
          700: "#086158",
        },
        cta: {
          100: "#FBDCCB",
          300: "#F5AB8B",
          500: "#F2622E",
          600: "#D94F1E",
        },
        status: {
          saleBg: "#DBEAFE",
          saleText: "#2563EB",
          goodBg: "#DCFCE7",
          goodText: "#16A34A",
          badBg: "#FEE2E2",
          badText: "#DC2626",
          neutralBg: "#F1F5F9",
          neutralText: "#64748B",
        },
        amber: {
          400: "#E8A33D",
          500: "#D0891F",
        },
        panel: {
          DEFAULT: "#FFFFFF",
          dark: "#0F1524",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
