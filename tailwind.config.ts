import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        safari: {
          50:  '#f0faf4',
          100: '#dcf1e6',
          200: '#bbe3ce',
          300: '#8acead',
          400: '#56b383',
          500: '#339762',
          600: '#237a4d',
          700: '#1B4332',
          800: '#163627',
          900: '#0d2b1e',
        },
        golden: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#F4C842',
          500: '#D4A017',
          600: '#b7870e',
          700: '#926b09',
          800: '#785508',
          900: '#5c4005',
        },
        ocean: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#185FA5',
          700: '#1e40af',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'safari-gradient': 'linear-gradient(135deg, #0d2b1e 0%, #1B4332 40%, #2D6A4F 100%)',
        'golden-gradient': 'linear-gradient(135deg, #D4A017 0%, #F4C842 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
export default config
