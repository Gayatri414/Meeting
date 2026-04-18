/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Theme-aware (CSS variable driven)
        background: 'var(--bg-app)',
        foreground: 'var(--text-primary)',
        card: 'var(--bg-card)',
        'card-foreground': 'var(--text-primary)',
        popover: 'var(--bg-card)',
        'popover-foreground': 'var(--text-primary)',
        primary: '#7c3aed',
        'primary-foreground': '#ffffff',
        secondary: { DEFAULT: '#1e1535', foreground: '#c4b5fd' },
        muted: { DEFAULT: '#1a1230', foreground: 'var(--text-muted)' },
        accent: { DEFAULT: '#2d1f5e', foreground: '#c4b5fd' },
        destructive: { DEFAULT: '#dc2626', foreground: '#fafafa' },
        border: 'var(--border-color)',
        input: 'var(--input-bg)',
        ring: '#7c3aed',
        // Static palettes
        purple: {
          50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe',
          400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7c3aed',
          800: '#6d28d9', 900: '#4c1d95', 950: '#2e1065',
        },
        blue: { 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
      },
      fontFamily: {
        sans: ['Geist Variable', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'app-gradient': 'linear-gradient(135deg, #06040f 0%, #0d0520 40%, #0a0d2e 100%)',
        'purple-blue': 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
        'purple-glow': 'radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, transparent 70%)',
        'card-gradient': 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(37,99,235,0.05) 100%)',
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.1) 50%, transparent 100%)',
      },
      animation: {
        'shimmer': 'shimmer 2.5s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-purple': 'pulse-purple 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'border-flow': 'border-flow 3s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-purple': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(124,58,237,0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(124,58,237,0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        glow: {
          from: { boxShadow: '0 0 10px rgba(124,58,237,0.3), 0 0 20px rgba(124,58,237,0.1)' },
          to:   { boxShadow: '0 0 20px rgba(124,58,237,0.6), 0 0 40px rgba(124,58,237,0.2)' },
        },
        'border-flow': {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      boxShadow: {
        'purple-sm':  '0 2px 8px rgba(124,58,237,0.25)',
        'purple-md':  '0 4px 16px rgba(124,58,237,0.35)',
        'purple-lg':  '0 8px 32px rgba(124,58,237,0.4)',
        'purple-xl':  '0 16px 48px rgba(124,58,237,0.45)',
        'blue-sm':    '0 2px 8px rgba(37,99,235,0.25)',
        'blue-md':    '0 4px 16px rgba(37,99,235,0.35)',
        'glass':      '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'glass-lg':   '0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        'inner-glow': 'inset 0 0 20px rgba(124,58,237,0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
