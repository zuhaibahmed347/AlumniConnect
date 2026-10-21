import type { Config } from 'tailwindcss'

/** AlumniConnect design system — Sukkur IBA University.
 *  Palette: Warm Alabaster Ivory, Midnight Obsidian, Meridian Emerald & Burnished Gold.
 *  Typography: Fraunces (Display), Plus Jakarta Sans / Manrope (Body), JetBrains Mono (Tabular Data).
 */

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 60% Dominant neutral canvas & 30% structural surfaces
        background: '#FAF8F5',
        foreground: '#0D1821',
        card: '#FFFFFF',
        'card-foreground': '#0D1821',
        stone: '#F2EFE9',
        obsidian: '#091422',
        'obsidian-light': '#102238',
        // 10% High-intent brand palette
        primary: {
          DEFAULT: '#0D6E5B',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#4B5868',
          foreground: '#FFFFFF',
        },
        violet: '#D97706',
        gold: {
          DEFAULT: '#D97706',
          bright: '#F59E0B',
          soft: '#FEF3C7',
        },
        emerald: {
          DEFAULT: '#0D6E5B',
          bright: '#10B981',
          soft: '#E6F4F1',
        },
        accent: {
          DEFAULT: '#E6F4F1',
          foreground: '#0D6E5B',
        },
        navy: '#091422',
        cyan: '#2DD4BF',
        // Feedback
        success: '#0F766E',
        warning: '#B45309',
        error: '#B91C1C',
        // Utilities
        muted: {
          DEFAULT: '#F2EFE9',
          foreground: '#4B5868',
        },
        sidebar: {
          DEFAULT: '#091422',
          foreground: '#FAF8F5',
        },
        border: '#E3DFD5',
        input: '#E3DFD5',
        ring: '#0D6E5B',
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          'Manrope Variable',
          'Manrope',
          'Inter Variable',
          'Inter',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        heading: [
          'Fraunces',
          'Plus Jakarta Sans',
          'Manrope Variable',
          'Manrope',
          'Georgia',
          'serif',
        ],
        display: [
          'Fraunces',
          'Plus Jakarta Sans',
          'Manrope Variable',
          'Georgia',
          'serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
      boxShadow: {
        card: '0 2px 6px -1px rgb(9 20 34 / 0.05), 0 1px 3px -1px rgb(9 20 34 / 0.04)',
        'card-hover': '0 16px 36px -8px rgb(9 20 34 / 0.11), 0 4px 10px -2px rgb(9 20 34 / 0.05)',
        glow: '0 0 24px rgba(13, 110, 91, 0.28)',
        'gold-glow': '0 0 24px rgba(245, 158, 11, 0.25)',
      },
      zIndex: {
        dropdown: '1000',
        sticky: '1020',
        modal: '1030',
        tooltip: '1040',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
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
        'constellation-drift': {
          '0%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-6px) rotate(1.2deg)' },
          '100%': { transform: 'translateY(0px) rotate(0deg)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'caret-blink': 'caret-blink 1s step-end infinite',
        'constellation-drift': 'constellation-drift 14s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config