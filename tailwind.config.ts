import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-raised": "var(--surface-raised)",
        border: "var(--border)",
        accent: "var(--accent)",
        "accent-dim": "var(--accent-dim)",
        text: "var(--text)",
        muted: "var(--text-muted)",
        faint: "var(--text-faint)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(ellipse at center, var(--tw-gradient-stops))",
        "gradient-accent": "linear-gradient(135deg, #c4b5fd 0%, #7c5cfc 50%, #4f35d0 100%)",
      },
      boxShadow: {
        "glow-sm": "0 0 20px rgba(124, 92, 252, 0.12)",
        "glow-md": "0 0 40px rgba(124, 92, 252, 0.18), 0 0 80px rgba(124, 92, 252, 0.06)",
        "card": "0 1px 3px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3)",
        "card-hover": "0 2px 6px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.4)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};
export default config;
