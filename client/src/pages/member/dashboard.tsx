import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { CampusNewsTicker } from '@/components/ui/campus-news-ticker'
import { QuickActionsGrid } from '@/components/ui/quick-actions-grid'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { RoleSwitcherStrip } from '@/components/layout/role-shell'
import {
  GlobalSearchTrigger,
  InlineGlobalSearchBar,
} from '@/components/ui/global-search-bar'
import {
  Bell,
  ChevronDown,
  KeyRound,
  LogOut,
  MessageSquare,
  Settings,
  ShieldCheck,
  User,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AnimatePresence, motion, type Variants } from 'framer-motion'

export function DashboardPage() {
  const navigate = useNavigate()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      localStorage.setItem('accessToken', 'demo-session-alumni')
    }
  }, [navigate])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  }

  const statCardVariants: Variants = {
    hidden: { opacity: 0, y: 18, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 240,
        damping: 26,
      },
    },
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <RoleSwitcherStrip />

      {/* Top Sticky Header with Proper Inline Navigation & Click-Toggled Account Menu */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 py-3.5">
          {/* Left: Brand & Page Title + Quick Nav Links */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/"
              className="text-xs font-mono uppercase tracking-wider font-semibold text-primary hover:underline shrink-0"
            >
              AlumniConnect
            </Link>
            <span aria-hidden="true" className="text-border">
              /
            </span>
            <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
              Dashboard
            </h1>

            <nav
              aria-label="Alumni Workspace Navigation"
              className="hidden lg:flex items-center gap-1 ml-4 pl-4 border-l border-border"
            >
              <Link
                to="/alumni"
                className="rounded-lg px-2.5 py-1.5 text-xs font-sans font-semibold text-secondary hover:bg-stone hover:text-foreground transition-colors"
              >
                Directory
              </Link>
              <Link
                to="/mentorship"
                className="rounded-lg px-2.5 py-1.5 text-xs font-sans font-semibold text-secondary hover:bg-stone hover:text-foreground transition-colors"
              >
                Mentorship
              </Link>
              <Link
                to="/jobs"
                className="rounded-lg px-2.5 py-1.5 text-xs font-sans font-semibold text-secondary hover:bg-stone hover:text-foreground transition-colors"
              >
                Jobs
              </Link>
              <Link
                to="/events"
                className="rounded-lg px-2.5 py-1.5 text-xs font-sans font-semibold text-secondary hover:bg-stone hover:text-foreground transition-colors"
              >
                Events
              </Link>
            </nav>
          </div>

          {/* Right: Search, Inline Messages & Notifications Icons, Theme Switcher, and Account Dropdown */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <GlobalSearchTrigger compact />

            {/* Inline Quick Access Buttons for Messages & Notifications */}
            <Link
              to="/messages"
              title="Messages"
              aria-label="Messages"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-card p-2 text-secondary hover:border-primary/50 hover:text-primary transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
            </Link>

            <Link
              to="/notifications"
              title="Notifications"
              aria-label="Notifications"
              className="relative inline-flex items-center justify-center rounded-xl border border-border bg-card p-2 text-secondary hover:border-primary/50 hover:text-primary transition-colors"
            >
              <Bell className="h-4 w-4" />
              <span
                aria-hidden="true"
                className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary"
              />
            </Link>

            <ThemeSwitcher />

            {/* Interactive User Profile Button & Popover Menu (Closed by Default) */}
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                aria-expanded={isUserMenuOpen}
                aria-haspopup="menu"
                aria-label="Account menu"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card pl-1.5 pr-2.5 py-1 text-left hover:border-primary/50 transition-colors cursor-pointer"
              >
                <Avatar className="h-7 w-7 ring-1 ring-border">
                  <AvatarImage src="/images/avatar.jpg" alt="Ahmed Hassan" />
                  <AvatarFallback>AH</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline font-sans text-xs font-semibold text-foreground">
                  Ahmed Hassan
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-secondary transition-transform duration-200 ${
                    isUserMenuOpen ? 'rotate-180 text-primary' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    role="menu"
                    aria-label="User menu"
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-border bg-card p-2 shadow-card-hover z-50"
                  >
                    {/* Signed-in Identity Summary */}
                    <div className="px-3 py-2.5 border-b border-border/80 mb-1">
                      <div className="flex items-center gap-1.5">
                        <p className="font-display text-sm font-bold text-foreground truncate">
                          Ahmed Hassan
                        </p>
                        <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                      </div>
                      <p className="font-sans text-xs text-secondary truncate">
                        ahmed.hassan@iba-suk.edu.pk
                      </p>
                      <span className="mt-1 inline-block rounded-md bg-accent px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
                        BSCS ’20 · Verified Alumni
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <Link
                        to="/profile"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-sans font-semibold text-foreground hover:bg-stone hover:text-primary transition-colors"
                      >
                        <User className="h-4 w-4 text-primary shrink-0" />
                        <span>Profile Dossier</span>
                      </Link>
                      <Link
                        to="/settings"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-sans font-semibold text-foreground hover:bg-stone hover:text-primary transition-colors"
                      >
                        <Settings className="h-4 w-4 text-primary shrink-0" />
                        <span>Account Settings</span>
                      </Link>
                      <Link
                        to="/forgot-password"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-sans font-semibold text-foreground hover:bg-stone hover:text-primary transition-colors"
                      >
                        <KeyRound className="h-4 w-4 text-primary shrink-0" />
                        <span>Reset Password</span>
                      </Link>
                      <Link
                        to="/messages"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-sans font-semibold text-foreground hover:bg-stone hover:text-primary transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <MessageSquare className="h-4 w-4 text-primary shrink-0" />
                          <span>Messages</span>
                        </span>
                        <span className="rounded-full bg-accent px-2 py-0.2 font-mono text-[10px] font-bold text-primary">
                          3
                        </span>
                      </Link>
                      <Link
                        to="/notifications"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-sans font-semibold text-foreground hover:bg-stone hover:text-primary transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <Bell className="h-4 w-4 text-primary shrink-0" />
                          <span>Notifications</span>
                        </span>
                        <span className="rounded-full bg-stone px-2 py-0.2 font-mono text-[10px] font-semibold text-secondary">
                          New
                        </span>
                      </Link>
                    </div>

                    <div className="mt-1.5 pt-1.5 border-t border-border/80">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setIsUserMenuOpen(false)
                          navigate('/login')
                        }}
                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-sans font-semibold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 shrink-0" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <motion.div
        className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Section + Inline Global Search Bar */}
        <motion.section variants={statCardVariants} className="mb-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-primary text-xs font-mono uppercase tracking-wider font-semibold mb-1.5">
                Member Workspace
              </p>
              <h2 className="font-display text-3xl font-bold leading-tight text-foreground">
                Welcome back to your alumni hub
              </h2>
            </div>

            {/* Quick Account & Workspace Shortcuts Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/profile"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-sans font-semibold text-foreground hover:border-primary/50 hover:text-primary transition-colors shadow-2xs"
              >
                <User className="h-3.5 w-3.5 text-primary" />
                My Profile
              </Link>
              <Link
                to="/messages"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-sans font-semibold text-foreground hover:border-primary/50 hover:text-primary transition-colors shadow-2xs"
              >
                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                Messages
              </Link>
              <Link
                to="/settings"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-sans font-semibold text-foreground hover:border-primary/50 hover:text-primary transition-colors shadow-2xs"
              >
                <Settings className="h-3.5 w-3.5 text-primary" />
                Settings
              </Link>
            </div>
          </div>
          <InlineGlobalSearchBar />
        </motion.section>

        {/* Quick Actions Grid */}
        <motion.div variants={statCardVariants} className="mb-7">
          <QuickActionsGrid onNavigate={(route) => navigate(route)} />
        </motion.div>

        {/* Live Google Search Grounded Campus News Ticker */}
        <motion.div variants={statCardVariants} className="mb-8">
          <CampusNewsTicker />
        </motion.div>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { value: 5243, label: 'Active Connections' },
            { value: 1287, label: 'Mentorship Requests' },
            { value: 892, label: 'Events this Month' },
            { value: 23, label: 'Unread Messages' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              className="p-5 rounded-2xl border border-border bg-card shadow-card"
              variants={statCardVariants}
              whileHover={{
                y: -4,
                boxShadow: '0 16px 36px -8px rgb(9 20 34 / 0.11)',
              }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            >
              <p className="font-mono text-3xl font-bold text-foreground tabular-nums">
                <AnimatedCounter value={stat.value} />
              </p>
              <p className="text-xs font-medium text-secondary mt-1">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </section>

        {/* Recent Activity & Suggestions */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Upcoming Events */}
          <motion.div
            className="p-6 rounded-2xl border border-border bg-card shadow-card"
            variants={statCardVariants}
            whileHover={{ y: -3 }}
          >
            <h3 className="font-display text-lg font-bold mb-4">
              Upcoming Events
            </h3>
            <div className="divide-y divide-border">
              {[
                { title: 'Alumni Reunion 2026', date: 'Dec 15, 2026' },
                { title: 'Autumn Career Fair', date: 'Jan 10, 2027' },
              ].map((ev) => (
                <motion.div
                  key={ev.title}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between py-3 cursor-pointer"
                  onClick={() => navigate('/events')}
                >
                  <div>
                    <p className="text-sm font-semibold">{ev.title}</p>
                    <p className="text-xs font-mono text-secondary tabular-nums">
                      {ev.date}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-primary">
                    View →
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Connection Suggestions */}
          <motion.div
            className="p-6 rounded-2xl border border-border bg-card shadow-card"
            variants={statCardVariants}
            whileHover={{ y: -3 }}
          >
            <h3 className="font-display text-lg font-bold mb-1">
              Connection Suggestions
            </h3>
            <p className="text-xs text-secondary mb-4">
              People you may know at Sukkur IBA
            </p>
            <div className="space-y-2 mb-4">
              {[
                { name: 'Ahmed Hassan', cohort: "BBA '20" },
                { name: 'Saba Ahmed', cohort: "MS Computer Science '21" },
              ].map((person) => (
                <motion.div
                  key={person.name}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-stone/60 hover:bg-stone transition-colors cursor-pointer"
                  onClick={() => navigate('/alumni')}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/images/avatar.jpg" alt={person.name} />
                    <AvatarFallback>UA</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{person.name}</p>
                    <p className="text-xs text-secondary font-mono">
                      {person.cohort}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => navigate('/alumni')}
            >
              View All Suggestions
            </Button>
          </motion.div>
        </section>

        {/* Recent Notifications */}
        <motion.section
          className="mt-6 p-6 rounded-2xl border border-border bg-card shadow-card"
          variants={statCardVariants}
          whileHover={{ y: -2 }}
        >
          <h3 className="font-display text-lg font-bold mb-4">
            Recent Notifications
          </h3>
          <div className="space-y-2">
            {[
              {
                title: 'New connection request',
                desc: 'Ahmed Hassan sent you a connection request',
              },
              {
                title: 'Event registration confirmed',
                desc: 'You are registered for the Annual Alumni Reunion',
              },
              {
                title: 'New referral job posting',
                desc: 'Senior Software Engineer role posted at TechCorp',
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                whileHover={{ x: 4 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-stone/50 hover:bg-stone transition-colors cursor-pointer"
                onClick={() => navigate('/notifications')}
              >
                <Bell className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-secondary">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full"
            onClick={() => navigate('/notifications')}
          >
            View All Notifications
          </Button>
        </motion.section>
      </motion.div>
    </main>
  )
}