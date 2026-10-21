export const color = {
  // Core architectural surfaces (60% Warm Alabaster & Midnight Obsidian)
  deepNavy: '#091422',
  obsidianSurface: '#0F1E30',
  mainBackground: '#FAF8F5',
  stoneSurface: '#F2EFE9',
  whiteSurface: '#FFFFFF',

  // High-intent brand accents (10% Meridian Emerald & Burnished Gold)
  primaryIndigo: '#0D6E5B', // Alias preserved for backwards compatibility
  primaryEmerald: '#0D6E5B',
  emeraldLight: '#10B981',
  secondaryViolet: '#D97706', // Alias mapped to warm Burnished Amber
  burnishedGold: '#D97706',
  luminousGold: '#F59E0B',
  accentCyan: '#2DD4BF',
  terracotta: '#C2410C',

  // Typography & Hairline borders (30% structural hierarchy)
  primaryText: '#0D1821',
  secondaryText: '#4B5868',
  mutedText: '#6E7C8C',
  border: '#E3DFD5',

  // Semantic feedback
  success: '#0F766E',
  warning: '#B45309',
  error: '#B91C1C',

  // Sukkur IBA institutional heritage
  ibaNavy: '#091422',
  ibaGold: '#F59E0B',
} as const

export const typography = {
  fontFamily: {
    base: '"Plus Jakarta Sans", "Manrope Variable", Manrope, system-ui, -apple-system, sans-serif',
    heading:
      '"Fraunces", "Plus Jakarta Sans", "Manrope Variable", Manrope, Georgia, serif',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    none: 1,
    tight: 1.12,
    normal: 1.5,
    relaxed: 1.65,
  },
} as const

export const space = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  '2xl': '2rem',
  '3xl': '3rem',
} as const

export const borderRadius = {
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.25rem',
} as const

export const shadows = {
  sm: '0 1px 2px 0 rgba(9, 20, 34, 0.04)',
  md: '0 8px 20px -4px rgba(9, 20, 34, 0.07), 0 2px 6px -1px rgba(9, 20, 34, 0.04)',
  lg: '0 18px 38px -10px rgba(9, 20, 34, 0.12), 0 4px 10px -2px rgba(9, 20, 34, 0.05)',
  none: 'none',
} as const

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  modal: 1030,
  tooltip: 1040,
  popup: 1050,
} as const