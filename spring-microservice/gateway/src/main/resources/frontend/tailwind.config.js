/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Couleurs personnalisables pour le thème PITM
        primary: {
          DEFAULT: '#166064',
          50: '#DDF6F8',
          100: '#CDF2F4',
          200: '#ABE9ED',
          300: '#8AE0E5',
          400: '#68D8DE',
          500: '#47CFD6',
          600: '#2CC0C8',
          700: '#25A0A7',
          800: '#1D8085',
          900: '#165764',
        },
        light: {
          bg: '#f8fafc',
          card: '#ffffff',
          border: '#e2e8f0',
          secondary: '#f1f5f9',
        },
      },
      animation: {
        'pulse-once': 'pulse-once 0.6s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-out-right': 'slide-out-right 0.3s ease-in forwards',
        'bounce-in': 'bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        'pulse-once': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%) scale(0.95)', opacity: '0' },
          '100%': { transform: 'translateX(0) scale(1)', opacity: '1' },
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateX(100%) scale(0.95)', opacity: '0' },
        },
        'bounce-in': {
          '0%': { transform: 'translateX(100%) scale(0.8)', opacity: '0' },
          '50%': { transform: 'translateX(-10px) scale(1.02)', opacity: '1' },
          '70%': { transform: 'translateX(5px) scale(0.98)' },
          '100%': { transform: 'translateX(0) scale(1)' },
        },
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        'pitm-light': {
          primary: '#166064',
          secondary: '#64748b',
          accent: '#0ea5e9',
          neutral: '#64748b',
          'base-100': '#ffffff',
          'base-200': '#f8fafc',
          'base-300': '#f1f5f9',
          info: '#0ea5e9',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
    ],
    base: true,
    styled: true,
    utils: true,
  },
};
