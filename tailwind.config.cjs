/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'IBM Plex Sans'", "sans-serif"]
      },
      colors: {
        ink: "#0b0b12",
        haze: "#f5f1ea",
        coral: "#ff6b4a",
        ocean: "#2f6cff",
        moss: "#1f6f52"
      }
    }
  },
  plugins: []
};
