import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cyber: {
          dark: "#07111F",
          sidebar: "#0B1628",
          card: "#101E32",
          elevated: "#14243A",
          border: "#23364F",
          cyan: "#22D3EE",
          blue: "#3B82F6",
          text: "#F8FAFC",
          muted: "#94A3B8",
        },
        risk: {
          low: {
            DEFAULT: "#10B981",
            bg: "rgba(16, 185, 129, 0.12)",
            border: "rgba(16, 185, 129, 0.3)",
            text: "#34D399",
          },
          medium: {
            DEFAULT: "#F59E0B",
            bg: "rgba(245, 158, 11, 0.12)",
            border: "rgba(245, 158, 11, 0.3)",
            text: "#FBBF24",
          },
          high: {
            DEFAULT: "#F97316",
            bg: "rgba(249, 115, 22, 0.12)",
            border: "rgba(249, 115, 22, 0.3)",
            text: "#FB923C",
          },
          critical: {
            DEFAULT: "#EF4444",
            bg: "rgba(239, 68, 68, 0.12)",
            border: "rgba(239, 68, 68, 0.3)",
            text: "#F87171",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        "pulse-cyan": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.02)" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
      animation: {
        "pulse-cyan": "pulse-cyan 3s ease-in-out infinite",
        "scan-line": "scan-line 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
