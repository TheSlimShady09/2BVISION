/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        foreground: '#1e293b',
        charcoal: {
          50:  '#f5f5f5',
          100: '#e8e8e8',
          200: '#c8c8c8',
          300: '#a0a0a0',
          400: '#707070',
          500: '#555555',
          600: '#444444',
          700: '#383838',
          800: '#2d2d2d',
          900: '#1e1e1e',
          950: '#141414',
        },
        primary: {
          DEFAULT: '#2d2d2d',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#383838',
          foreground: '#a0a0a0',
        },
        accent: {
          DEFAULT: '#444444',
          foreground: '#ffffff',
        }
      }
    },
  },
  plugins: [],
}
