/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundColor: {
        primary: "rgb(var(--background))",
        secondary: "rgb(var(--background-secondary))",
      },
      textColor: {
        primary: "rgb(var(--foreground))",
        brand: "rgb(var(--primary))",
      },
      borderColor: {
        primary: "rgb(var(--border))",
      },
    },
  },
  plugins: [],
};
