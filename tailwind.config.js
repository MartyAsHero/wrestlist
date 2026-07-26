/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#100D0B",
        surface: "#1A1512",
        surface2: "#221C18",
        line: "#35291F",
        ink: "#F3ECE2",
        muted: "#9C8F81",
        gold: "#D8A83D",
        wwe: "#C8203A",
        aew: "#4C7FC9",
        good: "#5C9A6A",
      },
      fontFamily: {
        marquee: ["Anton", "Impact", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
