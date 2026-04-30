import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        mono: ['DM Mono', 'Menlo', 'monospace'],
      },
      colors: {
        ink: '#09090e',
        surface: { DEFAULT: '#111118', 2: '#17171f', 3: '#1e1e28' },
        amber: { DEFAULT: '#d4a847', light: '#f0c060', dim: 'rgba(212,168,71,0.08)', dim2: 'rgba(212,168,71,0.16)' },
        brand: { green: '#3fa06a', red: '#c05050', blue: '#4a8fd4' },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
        fadeUp: 'fadeUp 0.5s ease forwards',
        pulse: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      borderRadius: { brand: '4px' },
    },
  },
  plugins: [],
}

export default config
