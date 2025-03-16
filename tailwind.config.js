/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gray: {
          750: '#2d3748', // A shade between gray-700 and gray-800
        },
        beige: {
          50: '#fdf8f6',
          100: '#f2e8df',
          200: '#eaddd0',
          300: '#e0cbb7',
          400: '#d3b79e',
          500: '#c4a389',
          600: '#b08e73',
          700: '#97775e',
          800: '#7c614d',
          900: '#654e3c',
          950: '#413225',
        },
        sand: {
          50: '#faf7f2',
          100: '#f6efe3',
          200: '#efe0c8',
          300: '#e4cba7',
          400: '#d8b282',
          500: '#cb9b65',
          600: '#bd8755',
          700: '#a06e46',
          800: '#82593d',
          900: '#6b4b35',
        },
        coffee: {
          50: '#fcf9f7',
          100: '#f5ede4',
          200: '#ead8c5',
          300: '#ddbea0',
          400: '#cfa078',
          500: '#c38455',
          600: '#b06f45',
          700: '#92583a',
          800: '#764834',
          900: '#613c2d',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noise-pattern': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'warm': '0 4px 14px 0 rgba(101, 78, 60, 0.1)',
        'warm-lg': '0 10px 25px -5px rgba(101, 78, 60, 0.1), 0 8px 10px -6px rgba(101, 78, 60, 0.1)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-reverse': 'float-reverse 7s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};