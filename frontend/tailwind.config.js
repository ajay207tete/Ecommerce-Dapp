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
        border: "#262626",
        input: "#0d0d0d",
        ring: "#fcee0a",
        background: "#000000",
        foreground: "#f2f2f2",
        primary: {
          DEFAULT: "#fcee0a",
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#00f0ff",
          foreground: "#000000",
        },
        destructive: {
          DEFAULT: "#ff003c",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#0d0d0d",
          foreground: "#8a8a8a",
        },
        accent: {
          DEFAULT: "#141414",
          foreground: "#fcee0a",
        },
        popover: {
          DEFAULT: "#0d0d0d",
          foreground: "#f2f2f2",
        },
        card: {
          DEFAULT: "#0d0d0d",
          foreground: "#f2f2f2",
        },
      },
      borderRadius: {
        lg: "0",
        md: "0",
        sm: "0",
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
        // Orbitron is no longer loaded, so both names use Rajdhani
        orbitron: ["'Rajdhani'", "sans-serif"],
        rajdhani: ["'Rajdhani'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};