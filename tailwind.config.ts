import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          900: "#0b1329",
          800: "#101d3f",
          700: "#182c5b",
          600: "#223d7c",
        },
        slate: {
          850: "#172033",
        },
      },
    },
  },
  plugins: [],
};
export default config;
