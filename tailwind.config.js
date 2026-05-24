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
        foreground: '#1e293b', // slate-800
        primary: {
          DEFAULT: '#1e293b',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#f8fafc', // slate-50
          foreground: '#64748b', // slate-500
        },
        accent: {
          DEFAULT: '#f1f5f9', // slate-100
          foreground: '#0f172a', // slate-900
        }
      }
    },
  },
  plugins: [],
}
