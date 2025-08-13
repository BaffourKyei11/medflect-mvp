/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ebf8ff',
          100: '#d1efff',
          200: '#a5ddff',
          300: '#75c9ff',
          400: '#3bb0ff',
          500: '#0ea5e9',
          600: '#0783c1',
          700: '#06679a',
          800: '#084f78',
          900: '#0b3c5c'
        }
      }
    }
  },
  plugins: []
};
