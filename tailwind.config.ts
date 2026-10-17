import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF6B00",
          dark: "#E85D00",
          light: "#FF8A33",
        },
        secondary: "#1A1A1A",
        bgalt: "#F9F9F9",
        success: "#047857",
        textsec: "#6B7280",
        viral: {
          orange: "#FF6B00",
          pink: "#FF007A",
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #FF6B00, #FF007A)",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(0, 0, 0, 0.06)",
        "soft-lg": "0 8px 30px rgba(0, 0, 0, 0.10)",
        glow: "0 0 20px rgba(255, 107, 0, 0.45)",
        "glow-lg": "0 0 35px rgba(255, 107, 0, 0.6)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      fontFamily: {
        heading: ["var(--font-poppins)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      keyframes: {
        "radar-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.03)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "radar-spin": "radar-spin 3s linear infinite",
        "pulse-soft": "pulse-soft 2.5s ease-in-out infinite",
        marquee: "marquee 25s linear infinite",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
