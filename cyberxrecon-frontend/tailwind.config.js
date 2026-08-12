/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#03000a',
          900: '#08020f',
          800: '#0f051d',
          700: '#1a0b2e',
        },
        neon: {
          cyan: 'rgb(var(--neon-cyan) / <alpha-value>)',
          purple: 'rgb(var(--neon-purple) / <alpha-value>)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'shimmer': 'textShimmer 4s linear infinite',
      }
    },
  },
  plugins: [],
}
