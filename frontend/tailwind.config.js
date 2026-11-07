/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        mello: {
          charcoal: {
            950: "#0B0A0F",
            900: "#121118",
            850: "#181622",
            800: "#211E2E",
            700: "#2E2A3F",
            600: "#443F5B",
          },
          purple: {
            300: "#D8B4FE",
            400: "#C084FC",
            500: "#A855F7",
            600: "#9333EA",
            700: "#7E22CE",
            800: "#6B21A8",
            900: "#581C87",
          },
        },
      },
      fontFamily: {
        sans: ["Geist Sans", "Inter", "system-ui", "sans-serif"],
        chat: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        math: ["STIX Two Math", "serif"],
      },
    },
  },
  plugins: [],
}
