import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pitchnight: "#0B1210",
        surface: "#121C18",
        surface2: "#182620",
        line: "#24352E",
        pitch: "#1E5631",
        pitchbright: "#2C7A45",
        chalk: "#F2F5F0",
        amber: "#F2B705",
        amberdim: "#B8890A",
        muted: "#7C8F86",
        danger: "#D9483A",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      backgroundImage: {
        "pitch-lines":
          "repeating-linear-gradient(90deg, rgba(242,245,240,0.03) 0px, rgba(242,245,240,0.03) 1px, transparent 1px, transparent 64px)",
        floodlight:
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(242,183,5,0.12), transparent 60%)",
      },
      boxShadow: {
        card: "0 1px 0 rgba(242,245,240,0.06), 0 8px 24px rgba(0,0,0,0.35)",
      },
      letterSpacing: {
        widest2: "0.2em",
      },
    },
  },
  plugins: [],
};
export default config;
