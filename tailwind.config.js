/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        ivory: "#F9FAFB",
        navy: {
          DEFAULT: "#0b192c",
          50: "#F1F5F9",
          100: "#DDE3EC",
          400: "#64748B",
          600: "#334155",
          700: "#13294B",
          900: "#0d1b2a",
        },
        brass: {
          DEFAULT: "#F59E0B",
          50: "#FFFBEB",
          200: "#FCD34D",
          400: "#FBBF24",
          600: "#B45309",
        },
        maroon: { DEFAULT: "#B91C1C", 600: "#991B1B", 700: "#7F1D1D" },
        sage: "#059669",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "rule-lines":
          "repeating-linear-gradient(transparent, transparent 27px, rgba(22,38,74,0.08) 28px)",
      },
      boxShadow: {
        plaque: "inset 0 0 0 1px rgba(184,134,46,0.35)",
      },
    },
  },
  plugins: [],
};
