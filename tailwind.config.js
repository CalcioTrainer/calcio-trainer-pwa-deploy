/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0033cc", // blu
          red: "#e10600",     // rosso
          black: "#000000",
          white: "#ffffff"
        }
      }
    },
  },
  plugins: [],
}
