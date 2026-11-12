/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        ivory: "#F6F8FC",
        sky: { DEFAULT: "#7CC4F0", 100: "#E3F2FC" },
        navy: {
          DEFAULT: "#0F1B3D", 50: "#EEF2F9", 100: "#DCE3F0", 400: "#64748B",
          600: "#334155", 700: "#17285A", 900: "#0A1330",
        },
        brass: { DEFAULT: "#FFC53D", 50: "#FFF8E1", 200: "#FFE08A", 400: "#FFCE5C", 600: "#B7791F" },
        maroon: { DEFAULT: "#B91C1C", 600: "#991B1B", 700: "#7F1D1D" },
        sage: "#059669",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        plaque: "inset 0 0 0 1px rgba(255,197,61,0.35)",
        soft: "0 10px 30px -12px rgba(15,27,61,0.25)",
      },
    },
  },
  plugins: [],
};
