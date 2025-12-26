
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#00696B',
        'primary-container': '#9CF1F3',
        surface: '#F4FBFA',
        'surface-dark': '#0E1414',
        secondary: '#4A6363',
        'on-surface': '#191C1C',
        'on-surface-dark': '#E1E3E3',
      },
      borderRadius: {
        '3xl': '28px',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      },
      transitionTimingFunction: {
        'm3-fluid': 'cubic-bezier(0.2, 0, 0, 1)',
      }
    }
  },
  plugins: [],
}
