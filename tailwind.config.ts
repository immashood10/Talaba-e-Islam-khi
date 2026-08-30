import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00A814",
        "primary-dark": "#008310",
        "primary-light": "#00CA18",
        secondary: "#1D4ED8",
        background: "#F8FAFC",
        card: "#FFFFFF",
        "text-dark": "#0F172A",
        "text-light": "#64748B",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(29, 78, 216, 0.12), 0 10px 20px -2px rgba(0, 168, 20, 0.08)",
        "soft-lg": "0 10px 40px -10px rgba(29, 78, 216, 0.18)",
        glowing: "0 0 20px rgba(0, 168, 20, 0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.3s ease-out forwards",
        "pulse-glow": "pulseGlow 2s infinite",
        float: "float 3s ease-in-out infinite",
        "slide-in-right": "slideInRight 0.25s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 168, 20, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(0, 168, 20, 0.5)" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
