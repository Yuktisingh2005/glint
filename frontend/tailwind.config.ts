import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        glintPurple: "#6B21A8",
        glintPink: "#EC4899",
      },
      animation: {
        pulseCustom: 'pulse 2s infinite',
      },
    },
  },
  plugins: [],
};

export default config;
