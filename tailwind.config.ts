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
        // Preserving your original custom fonts
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        mono: ['DM Mono', 'Menlo', 'monospace'],
      },
      colors: {
        // Preserving your original dark mode / legacy colors
        ink: '#09090e',
        surface: { DEFAULT: '#111118', 2: '#17171f', 3: '#1e1e28' },
        amber: { DEFAULT: '#d4a847', light: '#f0c060', dim: 'rgba(212,168,71,0.08)', dim2: 'rgba(212,168,71,0.16)' },
        
        // --- NEW: Modern Social Vibe Colors ---
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          500: '#8b5cf6',
          600: '#7c3aed', 
          900: '#4c1d95',
        },
        accent: {
          500: '#f43f5e',
          600: '#e11d48',
        },
        background: '#fafafa', // Warmer, softer white
      },
      boxShadow: {
        // --- NEW: Softer, floating shadows ---
        'soft': '0 20px 40px -15px rgba(0,0,0,0.05)',
        'float': '0 30px 60px -15px rgba(124,58,237,0.15)',
      },
      borderRadius: {
        // Preserving your original brand radius
        brand: '4px',
        // --- NEW: Extra rounded corners for the UI ---
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2.5rem',
      },
      animation: {
        // Preserving your original custom animations
        shimmer: 'shimmer 1.6s infinite',
        fadeUp: 'fadeUp 0.5s ease forwards',
        pulse: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
        
        // --- NEW: Blob animation for the Codex effect ---
        blob: "blob 20s infinite alternate",
      },
      keyframes: {
        // Preserving your original keyframes
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        
        // --- NEW: Blob movement keyframes ---
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(50px, -50px) scale(1.2)" },
          "66%": { transform: "translate(-40px, 40px) scale(0.8)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
      },
    },
  },
  plugins: [],
}

export default config