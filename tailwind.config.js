/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        'background-dark': '#0f1323',
        'component-dark': '#1a1f35',
        'border-dark': '#4A5568',
        'text-primary-dark': '#F7FAFC',
        'text-secondary-dark': '#A0AEC0',
      },
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'cursive'],
        "display": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "full": "9999px"
      },
      keyframes: {
        'slide-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-down': 'slide-down 0.5s ease-out',
      },
    },
  },
  plugins: [],
}