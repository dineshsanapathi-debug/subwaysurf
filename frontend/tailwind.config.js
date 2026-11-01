/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Fredoka', 'Outfit', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

