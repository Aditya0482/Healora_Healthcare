/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50:  '#f2fced',
          100: '#e0f8d5',
          200: '#c4f0af',
          300: '#a3e484',
          400: '#90da7a',
          500: '#80d266',
          600: '#69bf50',
          700: '#56a642',
          800: '#428033',
          900: '#2e5a24',
          950: '#1a3512',
        },
      },
    },
  },
  plugins: [],
};