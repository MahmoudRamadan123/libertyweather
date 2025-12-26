/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['var(--font-inter)'],
        space: ['var(--font-space-grotesk)'],
      },
      colors: {
        'liberty-blue': '#0052FF',
        'freedom-gold': '#FFD700',
        'weather-sunny': '#FFD700',
        'weather-rainy': '#4A90E2',
        'weather-snowy': '#87CEEB',
        'weather-stormy': '#9932CC',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
        'slide-in': 'slideIn 0.6s ease-out',
        'typewriter': 'typewriter 2s steps(40, end)',
        'wind-sway': 'windSway 2s ease-in-out infinite',
        'hot-wobble': 'hotWobble 1s ease-in-out infinite',
        'cold-shiver': 'coldShiver 0.5s ease-in-out infinite',
        'perfect-bounce': 'perfectBounce 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        typewriter: {
          from: { width: '0' },
          to: { width: '100%' },
        },
        windSway: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        hotWobble: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-2px)' },
          '75%': { transform: 'translateX(2px)' },
        },
        coldShiver: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(2px)' },
        },
        perfectBounce: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-sunny': 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
        'gradient-rainy': 'linear-gradient(135deg, #4A90E2 0%, #2C3E50 100%)',
        'gradient-snowy': 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
        'gradient-night': 'linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243E 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}