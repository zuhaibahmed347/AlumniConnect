import { useState } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { GlobalSearchTrigger } from '@/components/ui/global-search-bar'
import { Menu } from 'lucide-react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
} from 'framer-motion'

const MEMBER_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/alumni', label: 'Directory' },
  { to: '/jobs', label: 'Jobs' },
  { to: '/events', label: 'Events' },
  { to: '/mentorship', label: 'Mentorship' },
] as const

export function MainNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion()
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const nextScrolled = latest > 32
    if (nextScrolled !== isScrolled) {
      setIsScrolled(nextScrolled)
    }
  })

  const backdropFilter = useTransform(
    scrollY,
    [0, 120],
    ['blur(8px) saturate(125%)', 'blur(22px) saturate(190%)'],
  )

  return (
    <header className="sticky top-0 z-50 w-full pointer-events-none px-3 sm:px-6 lg:px-8 pt-2.5 sm:pt-3">
      <motion.div
        initial={false}
        animate={{
          maxWidth: isScrolled ? '1180px' : '1280px',
          height: isScrolled ? 58 : 64,
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
        {/* Top specular glass reflection */}
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
            animate={{ scale: isScrolled ? 0.92 : 1 }}
            whileHover={{ rotate: -4, scale: 1.06 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            src="/images/university-logo.jpg"
            alt="Sukkur IBA University"
            className="h-8 w-8 rounded-lg object-cover ring-1 ring-border shadow-sm shrink-0"
          />
          <motion.span
            animate={{ fontSize: isScrolled ? '1.02rem' : '1.125rem' }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          >
            AlumniConnect
          </motion.span>
        </Link>

        {/* Zone 2: Desktop Nav Links */}
        <nav
          aria-label="Member Navigation"
          className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium text-secondary min-w-0"
        >
          {MEMBER_LINKS.map((link) => {
            const isActive = location.pathname === link.to
            return (
              <motion.div
                key={link.to}
                whileHover={{ y: -1.5 }}
                transition={{ type: 'spring', stiffness: 340, damping: 24 }}
                className="shrink-0"
              >
                <Link
                  to={link.to}
                  className={`relative py-1 transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'text-foreground font-semibold'
                      : 'text-secondary hover:text-foreground'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="memberNavActiveUnderline"
                      transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                      className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-primary"
                    />
                  )}
                </Link>
              </motion.div>
            )
          })}
        </nav>

        {/* Zone 3: Global Search, Theme Switcher, User Menu & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink-0">
          <GlobalSearchTrigger compact={isScrolled} />
          <ThemeSwitcher showLabel={false} />
          <Link to="/profile" aria-label="Your profile" className="shrink-0">
            <Avatar className="h-8 w-8 ring-1 ring-border">
              <AvatarImage src="/images/avatar.jpg" alt="Your profile" />
              <AvatarFallback>UA</AvatarFallback>
            </Avatar>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/login')}
            className="hidden sm:inline-flex shrink-0"
          >
            Sign Out
          </Button>
          <button
            type="button"
            className="md:hidden p-2 rounded-lg hover:bg-stone shrink-0"
            aria-label="Open main menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    </header>
  )
}