import type { Config } from 'tailwindcss'

/** AlumniConnect design system — Sukkur IBA University.
 *  Palette: Warm Alabaster Ivory (Light) & Midnight Obsidian (Dark),
 *  paired with Meridian Emerald & Burnished Gold.
 *  All core surfaces and text tokens reference CSS RGB variables so theme
 *  switching and Tailwind alpha modifiers (`bg-background/90`, `border-border/80`)
 *  update seamlessly.
 */

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 60% Dominant neutral canvas & 30% structural surfaces via CSS variables
        background: 'rgb(var(--color-background) / <alpha-value>)',
        foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        card: {
          DEFAULT: 'rgb(var(--color-card) / <alpha-value>)',
          foreground: 'rgb(var(--color-card-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'rgb(var(--color-card) / <alpha-value>)',
          foreground: 'rgb(var(--color-card-foreground) / <alpha-value>)',
        },
        stone: 'rgb(var(--color-stone) / <alpha-value>)',
        obsidian: '#091422',
        'obsidian-light': '#102238',
        // 10% High-intent brand palette
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          foreground: 'rgb(var(--color-primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--color-secondary) / <alpha-value>)',
          foreground: 'rgb(var(--color-secondary-foreground) / <alpha-value>)',
        },
        violet: 'rgb(var(--color-gold) / <alpha-value>)',
        gold: {
          DEFAULT: 'rgb(var(--color-gold) / <alpha-value>)',
          bright: '#F59E0B',
          soft: '#FEF3C7',
        },
        emerald: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          bright: '#10B981',
          soft: '#E6F4F1',
        },
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          foreground: 'rgb(var(--color-accent-foreground) / <alpha-value>)',
        },
        navy: '#091422',
        cyan: '#2DD4BF',
        // Feedback
        success: '#0F766E',
        warning: '#B45309',
        error: '#B91C1C',
        destructive: {
          DEFAULT: 'rgb(var(--color-destructive) / <alpha-value>)',
          foreground: '#FFFFFF',
        },
        // Utilities
        muted: {
          DEFAULT: 'rgb(var(--color-muted) / <alpha-value>)',
          foreground: 'rgb(var(--color-muted-foreground) / <alpha-value>)',
        },
        sidebar: {
          DEFAULT: '#091422',
          foreground: '#FAF8F5',
        },
        border: 'rgb(var(--color-border) / <alpha-value>)',
        input: 'rgb(var(--color-input) / <alpha-value>)',
        ring: 'rgb(var(--color-ring) / <alpha-value>)',
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
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
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