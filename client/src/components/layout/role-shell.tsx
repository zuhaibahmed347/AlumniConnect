import { Button } from '@/components/ui/button'
import { GlobalSearchTrigger } from '@/components/ui/global-search-bar'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import {
  PLATFORM_PERSONAS,
  getActivePersona,
  setActivePersona,
  type PlatformPersona,
} from '@/lib/role-context'
import { toast } from '@/lib/toast'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  Briefcase,
  Building2,
  Calendar,
  Compass,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Settings,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export interface RoleNavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  badge?: string | number
}

const NAV_BY_ROLE: Record<PlatformPersona, RoleNavItem[]> = {
  STUDENT: [
    { to: '/student', label: 'Student Hub', icon: GraduationCap },
    { to: '/alumni', label: 'Find Alumni', icon: Users },
    { to: '/mentorship', label: 'Mentors', icon: Compass },
    { to: '/jobs', label: 'Internships & Jobs', icon: Briefcase },
    { to: '/events', label: 'Campus Events', icon: Calendar },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
  ],
  ALUMNI: [
    { to: '/dashboard', label: 'Alumni Hub', icon: LayoutDashboard },
    { to: '/alumni', label: 'Directory', icon: Users },
    { to: '/mentorship', label: 'Mentorship Guild', icon: Compass },
    { to: '/jobs', label: 'Career Board', icon: Briefcase },
    { to: '/events', label: 'Reunions & Events', icon: Calendar },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
  ],
  MENTOR: [
    { to: '/mentor', label: 'Mentor Console', icon: UserCheck },
    { to: '/mentorship/relationships', label: 'Active Mentees', icon: Users },
    { to: '/mentorship', label: 'Guild Directory', icon: Compass },
    { to: '/messages', label: 'Mentee Messages', icon: MessageSquare },
    { to: '/events', label: 'Speaker Events', icon: Calendar },
  ],
  EMPLOYER: [
    { to: '/employer', label: 'Employer Portal', icon: Building2 },
    { to: '/jobs', label: 'Public Job Board', icon: Briefcase },
    { to: '/alumni', label: 'Talent Directory', icon: Users },
    { to: '/events', label: 'Career Fairs', icon: Calendar },
  ],
  ADMIN: [
    { to: '/admin', label: 'Admin Overview', icon: ShieldCheck },
    { to: '/admin/users', label: 'Users & Verification', icon: Users },
    { to: '/admin/roles', label: 'Roles Matrix', icon: Sparkles },
    { to: '/admin/events', label: 'Event Moderation', icon: Calendar },
    { to: '/admin/jobs', label: 'Job & Employer Mod', icon: Briefcase },
    { to: '/admin/mentorship', label: 'Mentorship Oversight', icon: Compass },
    { to: '/admin/analytics', label: 'Analytics', icon: LayoutDashboard },
    { to: '/admin/settings', label: 'Platform Settings', icon: Settings },
  ],
}

export function RoleSwitcherStrip() {
  const navigate = useNavigate()
  const [activePersona, setPersonaState] = useState<PlatformPersona>(() =>
    getActivePersona(),
  )

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<PlatformPersona>).detail
      if (detail) setPersonaState(detail)
    }
    window.addEventListener('persona-changed', handler)
    return () => window.removeEventListener('persona-changed', handler)
  }, [])

  const currentPortalRole: PlatformPersona = activePersona

  const handleSelectPersona = (persona: PlatformPersona) => {
    setActivePersona(persona)
    setPersonaState(persona)
    const meta = PLATFORM_PERSONAS[persona]
    toast({
      title: `Switched to ${meta.label} View`,
      description: `Signed in as ${meta.userName} (${meta.userSubtitle}).`,
    })
    navigate(meta.defaultRoute)
  }

  return (
    <div className="border-b border-border bg-stone/70 text-foreground">
      <div className="page-container py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-primary">
            Role Workspace Switcher:
          </span>
          <div
            role="group"
            aria-label="Switch active user role"
            className="flex flex-wrap items-center gap-1"
          >
            {(Object.keys(PLATFORM_PERSONAS) as PlatformPersona[]).map(
              (roleKey) => {
                const meta = PLATFORM_PERSONAS[roleKey]
                const isSelected = currentPortalRole === roleKey
                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => handleSelectPersona(roleKey)}
                    aria-pressed={isSelected}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-mono font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-primary text-white dark:text-slate-950 shadow-sm'
                        : 'bg-card/80 text-foreground hover:border-primary/50 border border-border'
                    }`}
                  >
                    {meta.shortLabel}
                  </button>
                )
              },
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 font-mono text-[11px] text-foreground/85">
          <span>Active Persona:</span>
          <strong className="text-foreground">
            {PLATFORM_PERSONAS[currentPortalRole].userName}
          </strong>
          <span aria-hidden="true" className="text-border">
            ·
          </span>
          <span className="text-primary font-semibold">
            {PLATFORM_PERSONAS[currentPortalRole].badge}
          </span>
        </div>
      </div>
    </div>
  )
}

export interface RoleShellProps {
  role: PlatformPersona
  title: string
  subtitle?: string
  badge?: string
  headerActions?: ReactNode
  children: ReactNode
}

export function RoleShell({
  role,
  title,
  subtitle,
  badge,
  headerActions,
  children,
}: RoleShellProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const personaMeta = PLATFORM_PERSONAS[role]
  const navItems = NAV_BY_ROLE[role]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Interactive Role Workspace Switcher Strip */}
      <RoleSwitcherStrip />

      {/* Top Sticky Role Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="page-container h-16 flex items-center justify-between gap-4">
          {/* Left: Brand Lockup */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/"
              className="flex items-center gap-2.5 font-display font-bold text-foreground shrink-0 group"
            >
              <img
                src="/images/university-logo.jpg"
                alt="Sukkur IBA University"
                referrerPolicy="no-referrer"
                className="h-8 w-8 rounded-lg object-cover ring-1 ring-border transition-transform group-hover:scale-105"
              />
              <span className="text-base tracking-tight whitespace-nowrap">
                AlumniConnect
              </span>
            </Link>
            <span
              aria-hidden="true"
              className="hidden sm:inline text-border select-none"
            >
              /
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider font-semibold text-primary whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {personaMeta.shortLabel} Portal
            </span>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav
            aria-label={`${personaMeta.label} Navigation`}
            className="hidden xl:flex items-center gap-1"
          >
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-primary text-white dark:text-slate-950 shadow-sm'
                      : 'text-foreground/85 hover:text-foreground hover:bg-stone/80'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right: Compact Global Utilities */}
          <div className="flex items-center gap-2 shrink-0">
            <GlobalSearchTrigger compact />
            <Link
              to="/settings"
              aria-label="Password Reset & Security Settings"
              title="Password Reset & Security Settings"
              className="rounded-lg border border-border bg-card p-2 text-foreground hover:border-primary/50 transition-colors"
            >
              <KeyRound className="h-4 w-4 text-primary" />
            </Link>
            <Link
              to="/notifications"
              aria-label="Notifications"
              className="rounded-lg border border-border bg-card p-2 text-foreground hover:border-primary/50 transition-colors"
            >
              <Bell className="h-4 w-4 text-primary" />
            </Link>
            <ThemeSwitcher showLabel={false} />
            <Link
              to={role === 'ADMIN' ? '/admin/profile' : '/profile'}
              className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground hover:border-primary/50 transition-colors whitespace-nowrap"
              title={`${personaMeta.userName} · ${personaMeta.label}`}
            >
              <span className="h-6 w-6 rounded-md bg-primary/15 text-primary font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                {personaMeta.initials}
              </span>
              <span className="hidden md:inline truncate max-w-[120px]">
                {personaMeta.userName}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation drawer"
              className="xl:hidden rounded-lg border border-border bg-card p-2 text-foreground hover:bg-stone cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Navigation Bar */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="xl:hidden border-t border-border bg-card overflow-hidden"
              aria-label="Mobile Role Navigation"
            >
              <div className="page-container py-3 flex flex-wrap gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.to
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                        isActive
                          ? 'border-primary bg-primary text-white dark:text-slate-950'
                          : 'border-border bg-background text-foreground'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    navigate('/settings')
                  }}
                >
                  Password & Security
                </Button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Dedicated Spacious Page Context Header Bar (Never Congested) */}
      <div className="border-b border-border/70 bg-gradient-to-r from-stone/55 via-card/80 to-accent/35">
        <div className="page-container py-4 sm:py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
              {badge && (
                <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-primary">
                  <span aria-hidden="true" className="text-border">
                    ·
                  </span>
                  <span>{badge}</span>
                </span>
              )}
            </div>
            {subtitle && (
              <p className="font-sans text-xs sm:text-sm text-secondary leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {headerActions && (
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {headerActions}
            </div>
          )}
        </div>
      </div>

      <main className="flex-1 page-container py-7 sm:py-8 space-y-8">
        {children}
      </main>
    </div>
  )
}
