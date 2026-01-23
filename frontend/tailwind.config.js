/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
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
        border: "#2E2E48",
        input: "#16213E",
        ring: "#FF2E63",
        background: "#030014",
        foreground: "#EAEAEA",
        primary: {
          DEFAULT: "#FF2E63",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#08D9D6",
          foreground: "#000000",
        },
        destructive: {
          DEFAULT: "hsl(0 84.2% 60.2%)",
          foreground: "hsl(0 0% 98%)",
        },
        muted: {
          DEFAULT: "#1A1A2E",
          foreground: "#8892B0",
        },
        accent: {
          DEFAULT: "#252A34",
          foreground: "#FF2E63",
        },
        popover: {
          DEFAULT: "#0F0F1C",
          foreground: "#EAEAEA",
        },
        card: {
          DEFAULT: "#0F0F1C",
          foreground: "#EAEAEA",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.125rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        glitch: {
          "0%, 100%": { transform: "translate(0)" },
          "33%": { transform: "translate(-2px, 2px)" },
          "66%": { transform: "translate(2px, -2px)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        glitch: "glitch 0.3s infinite",
        "fade-in": "fade-in 0.7s ease-out",
      },
      fontFamily: {
        orbitron: ["'Orbitron'", "sans-serif"],
        rajdhani: ["'Rajdhani'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};