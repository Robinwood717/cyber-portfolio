/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        void: "#050505",
        gridline: "#1a1a1a",
        neon: {
          DEFAULT: "#10b981",
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        "glow-sm": "0 0 16px rgba(16, 185, 129, 0.2)",
        glow: "0 0 24px rgba(16, 185, 129, 0.28), 0 0 64px rgba(16, 185, 129, 0.1)",
        terminal:
          "0 24px 80px rgba(0, 0, 0, 0.8), 0 0 48px rgba(16, 185, 129, 0.07)",
      },
      backgroundImage: {
        "grid-lines":
          "linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)",
      },
      keyframes: {
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
      },
      animation: {
        blink: "blink 1.1s step-end infinite",
      },
    },
  },
  plugins: [],
};
