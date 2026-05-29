/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        dark: {
          bg: '#090d16',
          card: 'rgba(30, 41, 59, 0.45)',
          border: 'rgba(255, 255, 255, 0.08)',
          input: 'rgba(15, 23, 42, 0.6)',
        },
        brand: {
          green: '#10b981',
          greenHover: '#059669',
          blue: '#3b82f6',
          blueHover: '#1d4ed8',
          amber: '#f59e0b',
          red: '#ef4444',
        }
      }
    },
  },
  plugins: [],
}
