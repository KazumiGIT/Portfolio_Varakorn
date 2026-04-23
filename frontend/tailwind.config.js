/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    // Hard-override defaults to enforce pixel aesthetic.
    fontFamily: {
      pixel: ['"Press Start 2P"', "monospace"],
      dialog: ['"VT323"', "monospace"],
    },
    borderRadius: {
      none: "0",
      DEFAULT: "0",
    },
    boxShadow: {
      none: "none",
      pixel: "4px 4px 0 0 #000",
    },
    extend: {
      colors: {
        // Resurrect 32 subset, named by usage.
        bg: {
          deepest: "#0e0e12",
          navy: "#1a1c2c",
          plum: "#29366f",
        },
        torch: {
          ember: "#ef7d57",
          flame: "#ffcd75",
          glow: "#fee761",
        },
        stone: {
          mid: "#566c86",
          cool: "#41a6f6",
          dusk: "#333c57",
        },
        rune: {
          green: "#a7f070",
          crimson: "#b13e53",
          royal: "#b55088",
        },
        parchment: "#f4f0bc",
        iron: "#262b44",
      },
      fontSize: {
        px6: ["6px", "6px"],
        px8: ["8px", "8px"],
        px10: ["10px", "12px"],
        px12: ["12px", "14px"],
        px14: ["14px", "16px"],
      },
      animation: {
        "torch-flicker": "torch-flicker 0.15s steps(3) infinite",
        "idle-bob": "idle-bob 500ms steps(2) infinite",
        "glow-pulse": "glow-pulse 1.2s steps(4) infinite",
      },
      keyframes: {
        "torch-flicker": {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        "idle-bob": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-1px)" },
        },
        "glow-pulse": {
          "0%,100%": { filter: "brightness(1)" },
          "50%": { filter: "brightness(1.35)" },
        },
      },
    },
  },
  plugins: [],
};
