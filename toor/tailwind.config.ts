import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        accent: "var(--accent)",
        bg: "var(--bg)",
        text: "var(--text)",
      },
      fontFamily: {
        heading: ["var(--heading-font)"],
        body: ["var(--body-font)"],
      },
    },
  },
  plugins: [],
};
export default config;
