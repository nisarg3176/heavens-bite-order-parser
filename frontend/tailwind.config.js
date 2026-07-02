/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // luxury pastel bakery system
        ivory: '#FFFDF9',
        cream: {
          50: '#FCF8F1',
          100: '#F8F1E6',
          200: '#F1E7D7',
          300: '#E9DAC6',
        },
        beige: '#EDE2D2',
        sage: {
          soft: '#CBDBC7',
          DEFAULT: '#9BB79B',
          deep: '#6E8C72',
        },
        peach: {
          soft: '#F8DCC8',
          DEFAULT: '#F2C3A4',
          deep: '#E4A47F',
        },
        pink: {
          soft: '#F3CFD6',
          DEFAULT: '#E1A6B2',
          deep: '#C97E8D',
        },
        ink: {
          DEFAULT: '#453B34',
          soft: '#6B6055',
          faint: '#9B9084',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Poppins"', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        300: '300', 400: '400', 500: '500', 600: '600', 700: '700', 800: '800', 900: '900',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '22px',
        '4xl': '28px',
      },
      boxShadow: {
        soft: '0 8px 30px -12px rgba(69, 59, 52, 0.16)',
        card: '0 20px 55px -20px rgba(69, 59, 52, 0.24)',
        lift: '0 30px 70px -24px rgba(201, 126, 141, 0.40)',
        glass: '0 10px 40px -14px rgba(69, 59, 52, 0.18), inset 0 1px 0 rgba(255,255,255,0.65)',
        inset: 'inset 0 2px 6px rgba(69, 59, 52, 0.10)',
      },
      backgroundImage: {
        'gradient-peach': 'linear-gradient(135deg, #F2C3A4 0%, #E1A6B2 100%)',
        'gradient-sage': 'linear-gradient(135deg, #B9D0B6 0%, #8AAE8D 100%)',
        'gradient-dawn': 'linear-gradient(135deg, #F8DCC8 0%, #F3CFD6 45%, #CBDBC7 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(26px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '60%': { opacity: '1', transform: 'scale(1.02)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-26px) translateX(10px)' },
        },
        'float-slow': {
          '0%,100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(22px) translateX(-14px)' },
        },
        blob: {
          '0%,100%': { borderRadius: '42% 58% 63% 37% / 42% 42% 58% 58%' },
          '34%': { borderRadius: '68% 32% 41% 59% / 55% 62% 38% 45%' },
          '67%': { borderRadius: '38% 62% 55% 45% / 63% 38% 62% 37%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-180% 0' },
          '100%': { backgroundPosition: '180% 0' },
        },
        'gradient-move': {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'grow-x': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
        'pulse-soft': {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.8s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fade-in 0.9s ease both',
        'pop-in': 'pop-in 0.55s cubic-bezier(0.22,1,0.36,1) both',
        float: 'float 14s ease-in-out infinite',
        'float-slow': 'float-slow 18s ease-in-out infinite',
        blob: 'blob 18s ease-in-out infinite',
        shimmer: 'shimmer 1.8s linear infinite',
        'gradient-move': 'gradient-move 6s ease infinite',
        'spin-slow': 'spin-slow 3s linear infinite',
        'pulse-soft': 'pulse-soft 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
