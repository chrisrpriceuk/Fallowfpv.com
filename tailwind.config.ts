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
          DEFAULT: "rgb(var(--color-ink) / <alpha-value>)",
          muted: "rgb(var(--color-ink-muted) / <alpha-value>)",
          faint: "rgb(var(--color-ink-faint) / <alpha-value>)",
        },
        canvas: {
          DEFAULT: "rgb(var(--color-canvas) / <alpha-value>)",
          subtle: "rgb(var(--color-canvas-subtle) / <alpha-value>)",
        },
        /** Distinct from Apple’s link blue; still calm and readable */
        link: {
          DEFAULT: "rgb(var(--color-link) / <alpha-value>)",
          hover: "rgb(var(--color-link-hover) / <alpha-value>)",
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
