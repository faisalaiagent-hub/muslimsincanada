import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class", ".dark"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f1720",
        muted: "#5b6672",
        line: "#e6e9ec",
        accent: "#0f6e5c",
        "accent-soft": "#e7f3f0",
        bg: "#fbfaf8",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
