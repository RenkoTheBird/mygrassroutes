/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'display': ['Delius Swash Caps', 'cursive'],
        'heading': ['Squada One', 'cursive'],
      },
    },
  },
  plugins: [],
};