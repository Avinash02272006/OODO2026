export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#b8594d',
          hover: '#a04e43',
          light: 'rgba(184, 89, 77, 0.1)',
        },
        bg: {
          body: '#f8f6f2',
          surface: '#ffffff',
          sidebar: '#1a1614',
        },
        text: {
          main: '#1a1614',
          secondary: '#6b7280',
          onDark: '#f5f0e8',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
