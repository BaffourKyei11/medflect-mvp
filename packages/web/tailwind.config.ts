import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e7f6f6',
          100: '#c2e8e8',
          200: '#9bdada',
          300: '#72cbcb',
          400: '#4fbebe',
          500: '#2ab0b0',
          600: '#1f8e8e',
          700: '#176a6a',
          800: '#0e4747',
          900: '#072b2b',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
