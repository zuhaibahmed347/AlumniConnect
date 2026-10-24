import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
} from 'framer-motion'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { GlobalSearchTrigger } from '@/components/ui/global-search-bar'

const NAV_LINKS = [
  { href: '#impact-stats', id: 'impact-stats', label: 'Impact' },
  { href: '#capabilities', id: 'capabilities', label: 'Capabilities' },
  { href: '#events', id: 'events', label: 'Events' },
  { href: '#outcomes', id: 'outcomes', label: 'Outcomes' },
] as const

export function FloatingHeader() {
  const prefersReducedMotion = useReducedMotion()
  const { scrollY, scrollYProgress } = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('')

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const nextScrolled = latest > 36
    if (nextScrolled !== isScrolled) {
      setIsScrolled(nextScrolled)
    }
  })

  // Track active section while scrolling down the landing page
  useEffect(() => {
    const handleScrollSpy = () => {
      const scrollPosition = window.scrollY + 180
      let current = ''
      for (const link of NAV_LINKS) {
        const el = document.getElementById(link.id)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPosition >= top && scrollPosition < top + height) {
            current = link.id
            break
          }
        }
      }
      setActiveSection(current)
    }

    window.addEventListener('scroll', handleScrollSpy, { passive: true })
    handleScrollSpy()
    return () => window.removeEventListener('scroll', handleScrollSpy)
  }, [])

  // Smooth spring-driven scroll progress for the subtle bottom hairline
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    restDelta: 0.001,
  })

  // Dynamic backdrop blur and saturation that intensifies as the user scrolls
  const backdropFilter = useTransform(
    scrollY,
    [0, 120],
    [
      'blur(8px) saturate(125%)',
      'blur(22px) saturate(190%)',
    ],
  )

  return (
    <header className="sticky top-0 z-50 w-full pointer-events-none px-3 sm:px-6 lg:px-8 pt-2.5 sm:pt-3.5">
      <motion.div
        initial={false}
        animate={{
          maxWidth: isScrolled ? '1180px' : '1280px',
          height: isScrolled ? 58 : 66,
          y: isScrolled ? 2 : 0,
          borderRadius: isScrolled ? 18 : 16,
        }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : {
                type: 'spring',
                stiffness: 290,
                damping: 30,
                mass: 0.85,
              }
        }
        style={{
          backdropFilter,
          WebkitBackdropFilter: backdropFilter,
        }}
        className={`pointer-events-auto relative mx-auto flex w-full items-center justify-between gap-3 lg:gap-6 px-3.5 sm:px-5 overflow-hidden transition-colors duration-300 ${
          isScrolled
            ? 'bg-card/85 dark:bg-card/80 border border-border/90 ring-1 ring-white/25 dark:ring-white/10 shadow-[0_16px_40px_-12px_rgba(9,20,34,0.16)] dark:shadow-[0_20px_48px_-12px_rgba(0,0,0,0.65)]'
            : 'bg-background/70 dark:bg-background/60 border border-border/60 ring-1 ring-white/15 dark:ring-white/5 shadow-sm'
        }`}
      >
        {/* Subtle top specular glass reflection */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/50 dark:via-white/20 to-transparent"
        />

        {/* Zone 1: Brand Lockup */}
        <Link
          to="/"
          className="flex items-center gap-2.5 font-display font-bold tracking-tight text-foreground whitespace-nowrap shrink-0"
        >
          <motion.img
            animate={{
              scale: isScrolled ? 0.92 : 1,
            }}
            whileHover={{ rotate: -4, scale: 1.06 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            src="/images/university-logo.jpg"
            alt="Sukkur IBA University"
            className="h-8 w-8 rounded-lg object-cover ring-1 ring-border shadow-sm shrink-0"
          />
          <motion.span
            animate={{
              fontSize: isScrolled ? '1.02rem' : '1.125rem',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          >
            AlumniConnect
          </motion.span>
        </Link>

        {/* Zone 2: 4 concise single-line navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium text-secondary min-w-0"
        >
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.id
            return (
              <motion.a
                key={link.href}
                href={link.href}
                whileHover={{ y: -1.5 }}
                transition={{ type: 'spring', stiffness: 340, damping: 24 }}
                className={`relative py-1 transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-foreground font-semibold'
                    : 'text-secondary hover:text-foreground'
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="floatingNavActiveUnderline"
                    transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                    className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-primary"
                  />
                )}
              </motion.a>
            )
          })}
        </nav>

        {/* Zone 3: Global Search, Theme Toggle & Primary Action (safely contained inside header border) */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink-0">
          <GlobalSearchTrigger compact={isScrolled} />
          <ThemeSwitcher showLabel={false} />
          <Link
            to="/login"
            className="hidden sm:inline-flex items-center px-2 py-1.5 text-xs sm:text-sm font-semibold text-secondary hover:text-foreground transition-colors whitespace-nowrap shrink-0"
          >
            Sign In
          </Link>
          <motion.div
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 360, damping: 24 }}
            className="shrink-0"
          >
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors whitespace-nowrap shrink-0"
            >
              Join Network
            </Link>
          </motion.div>
        </div>

        {/* Scroll-Driven Emerald-to-Gold Progress Hairline at bottom edge */}
        <motion.div
          aria-hidden="true"
          style={{
            scaleX: smoothProgress,
            opacity: isScrolled ? 1 : 0,
          }}
          className="pointer-events-none absolute inset-x-3 bottom-0 h-[2px] origin-left rounded-full bg-gradient-to-r from-[#0D6E5B] via-[#10B981] to-[#F59E0B] transition-opacity duration-300"
        />
      </motion.div>
    </header>
  )
}
