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
