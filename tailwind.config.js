/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      colors: {
        ink: {
          DEFAULT: "#15151d",
          50: "#f5f5f6",
          100: "#e7e7ea",
          200: "#c7c7cf",
          300: "#9d9da9",
          400: "#6f6f7e",
          500: "#4c4c5c",
          600: "#34343f",
          700: "#24242c",
          800: "#1c1c23",
          900: "#15151d",
          950: "#0d0d12",
        },
        paper: {
          DEFAULT: "#faf8f3",
          dim: "#f1eee4",
        },
        brass: {
          50: "#fbf3e3",
          100: "#f5e3bd",
          200: "#eccd8b",
          300: "#e0b25a",
          400: "#cf9a3c",
          500: "#b98328",
          600: "#966820",
          700: "#734e19",
        },
        moss: {
          50: "#eef4ee",
          100: "#d3e3d5",
          400: "#5c8a67",
          500: "#3f6b4f",
          600: "#305640",
        },
        clay: {
          50: "#fbece7",
          100: "#f2cec1",
          400: "#c97a5c",
          500: "#b35a3d",
          600: "#8f4530",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(21,21,29,0.04), 0 8px 24px -8px rgba(21,21,29,0.10)",
        lift: "0 20px 60px -20px rgba(21,21,29,0.35)",
      },
      borderRadius: {
        sq: "10px",
      },
    },
  },
  plugins: [],
};
