import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "var(--font-sans)",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        ink: {
          DEFAULT: "#1b1b1d",
          muted: "#5c5c61",
          faint: "#8e8e93",
        },
        canvas: {
          DEFAULT: "#fafafc",
          subtle: "#f2f2f5",
        },
        /** Distinct from Apple’s link blue; still calm and readable */
        link: {
          DEFAULT: "#1b61c8",
          hover: "#154a9a",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.04)",
        card: "0 8px 32px rgba(0, 0, 0, 0.06), 0 1px 0 rgba(0, 0, 0, 0.03)",
        lift: "0 12px 40px rgba(0, 0, 0, 0.08)",
      },
      transitionDuration: {
        180: "180ms",
      },
    },
  },
  plugins: [],
};

export default config;
