/** Page transition variants - gentle fade and vertical movement */
export const pageTransition = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
} as const

/** Section entrance variants - subtle opacity and vertical transitions Stagger for small numbers of related cards */
export const sectionEntrance = {
  hidden: { opacity: 0, y: 16 },
  visible: (staggerChildren: number, delayChildren: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: staggerChildren || 0.1,
      delayChildren: delayChildren || 0,
    },
  }),
} as const

/** Card entrance variant - subtle lift and fade */
export const cardEntrance = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
      delay,
    },
  }),
} as const

/** Card hover variant - slight lift and shadow enhancement */
export const cardHover = {
  whileHover: {
    y: -4,
    boxShadow: '0 10px 24px -6px rgb(16 21 47 / 0.12)',
  },
  whileTap: {
    y: 2,
    scale: 0.97,
  },
  transition: {
    duration: 0.2,
    type: 'spring',
    stiffness: 200,
    damping: 20,
  },
} as const

/** Button hover variant - subtle color transition */
export const buttonHover = {
  whileHover: {
    opacity: 0.9,
  },
  whileTap: {
    scale: 0.96,
  },
  transition: {
    duration: 0.15,
  },
} as const

/** Fade-in variant for elements that appear on mount */
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
} as const

/** Staggered fade-in for lists */
export const staggeredFadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: (staggerChildren: number = 0.1, delayChildren: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: staggerChildren,
      delayChildren: delayChildren,
    },
  }),
} as const

/** Reduced motion variants - disable animation for prefers-reduced-motion */
export const reducedMotion = {
  transition: {
    duration: 0,
    type: 'tween',
  },
} as const

/** Dialog entrance variant - short fade-and-scale */
export const dialogEntrance = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.15,
      ease: [0.16, 1, 0.3, 1],
    },
  },
} as const

/** Input focus variant - smooth focus indicator */
export const inputFocus = {
  whileFocus: {
    borderColor: '#4338CA',
    boxShadow: '0 0 0 3px rgba(67, 56, 202, 0.15)',
  },
  transition: {
    duration: 0.2,
  },
} as const

/** Form error/shake - gentle, not aggressive Use only for critical validation errors */
export const formError = {
  shake: {
    x: [0, 8, -8, 8, -4, 4, 0],
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 120,
      duration: 0.4,
    },
  },
} as const

/** Staggered card grid entrance for dashboard/member screens */
export const staggeredGridEntrance = {
  hidden: { opacity: 0, y: 20 },
  visible: (staggerChildren: number = 0.15) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: staggerChildren,
    },
  }),
} as const

/** Alert/success checkmark check animation - restrained */
export const checkmark = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 150,
      duration: 0.35,
    },
  },
} as const

/** Navigation link hover variant */
export const navLinkHover = {
  whileHover: {
    color: '#4338CA',
  },
  transition: {
    duration: 0.2,
  },
} as const