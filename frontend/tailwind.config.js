/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFDF8',
          100: '#FFF8ED',
          200: '#FFEFD5',
          300: '#FFE4B8',
        },
        bakery: {
          brown: '#5C3D2E',
          gold: '#C8956C',
          rose: '#E8A598',
          sage: '#8BA888',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 24px rgba(92, 61, 46, 0.08)',
        card: '0 8px 32px rgba(92, 61, 46, 0.12)',
      },
    },
  },
  plugins: [],
}
