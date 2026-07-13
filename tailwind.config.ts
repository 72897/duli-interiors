import type { Config } from "tailwindcss";

/**
 * Tailwind is scoped to the FEATURE UIs (auth, dashboard, project wizard).
 * Preflight is DISABLED so Tailwind's global reset can't disturb the existing
 * hand-written marketing CSS (globals.css / pro-visualizer.css) and GSAP work.
 * Brand tokens mirror the CSS variables in globals.css.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        bg: "#F8F7F4",
        ink: "#1F1F1F",
        muted: "#6B6B66",
        brass: "#B08D57",
        olive: "#66705A",
        stone: "#D8D2C8",
        terracotta: "#8C4A3A",
        blush: "#FFEADC",
        success: "#5B7052",
        surface: "#FFFFFF",
      },
      fontFamily: {
        sans: ['"Inter Tight"', "system-ui", "sans-serif"],
        serif: ['"Playfair Display"', "Georgia", "serif"],
        display: ['"Cinzel"', "serif"],
      },
      borderColor: {
        DEFAULT: "#D8D2C8",
      },
      boxShadow: {
        card: "0 24px 60px -30px rgba(31,31,31,0.22)",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(.16,1,.3,1)",
      },
    },
  },
  plugins: [],
};

export default config;
