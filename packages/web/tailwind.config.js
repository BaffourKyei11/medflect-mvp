/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0f766e', // teal
          light: '#14b8a6',
          dark: '#115e59'
        }
      }
    },
  },
  plugins: [],
};
