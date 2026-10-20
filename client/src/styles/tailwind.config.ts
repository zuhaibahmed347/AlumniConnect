import type { Config } from 'tailwindcss'

/** AlumniConnect design system — Sukkur IBA University. */

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Core surfaces
        background: '#F7F8FC',
        foreground: '#171B2E',
        card: '#FFFFFF',
        'card-foreground': '#171B2E',
        // Brand palette from tokens
        primary: {
          DEFAULT: '#4338CA',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#667085',
          foreground: '#FFFFFF',
        },
        violet: '#7C3AED',
        accent: {
          DEFAULT: '#EEF2FF',
          foreground: '#4338CA',
        },
        navy: '#10152F',
        cyan: '#22D3EE',
        // Feedback
        success: '#15803D',
        warning: '#D97706',
        error: '#DC2626',
        // Utilities
        muted: {
          DEFAULT: '#F3F4F6',
          foreground: '#667085',
        },
        border: '#E5E7EB',
        input: '#E5E7EB',
        ring: '#4338CA',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        heading: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(16 21 47 / 0.06), 0 1px 2px -1px rgb(16 21 47 / 0.08)',
        'card-hover': '0 10px 24px -6px rgb(16 21 47 / 0.12)',
        // Subtle shadow for 3D nodes
        glow: '0 0 10px rgba(67, 56, 202, 0.3)',
      },
      zIndex: {
        dropdown: '1000',
        sticky: '1020',
        modal: '1030',
        tooltip: '1040',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'caret-blink': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'caret-blink': 'caret-blink 1s step-end infinite',
      },
    },
  },
  plugins: [],
} satisfies Config