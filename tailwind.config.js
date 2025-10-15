/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { bg: "#0b0b10" },
      keyframes: {
        pulseLine: { "0%,100%": { opacity: ".35" }, "50%": { opacity: ".85" } }
      },
      animation: { "pulse-line": "pulseLine 1.1s ease-in-out infinite" }
    }
  },
  plugins: []
};
