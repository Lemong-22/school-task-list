/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#607AFB",
        "background-light": "#f5f6f8",
        "background-dark": "#0f1323", 
        "component-dark": "#2D3748",
        "text-primary-dark": "#E2E8F0",
        "text-secondary-dark": "#A0AEC0",
        "border-dark": "#4A5568",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}