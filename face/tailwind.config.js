// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This line tells Tailwind to scan all JS, TS, JSX, TSX files in the src folder and its subfolders.
  ],
  theme: {
    extend: {}, // You can extend Tailwind's default theme here (e.g., add custom colors, fonts, spacing)
  },
  plugins: [], // You can add official or community Tailwind plugins here
}