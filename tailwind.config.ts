import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F172A",
        cloud: "#F8FAFC",
        brand: "#2563EB",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15,23,42,.04), 0 4px 14px rgba(15,23,42,.04)",
        float: "0 12px 40px rgba(15,23,42,.14)",
      },
    },
  },
  plugins: [],
};

export default config;
