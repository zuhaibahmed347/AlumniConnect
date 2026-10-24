import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  Briefcase,
  Calendar,
  Compass,
  MessageSquare,
  Users,
} from 'lucide-react'

export interface QuickActionItem {
  id: string
  label: 'Request Mentorship' | 'Find Alumni' | 'View Events' | 'Job Board'
  description: string
  badge: string
  shortcut: string
  route: string
  icon: typeof Compass
  accentTone: 'emerald' | 'gold'
}

export const QUICK_ACTIONS_ITEMS: QuickActionItem[] = [
  {
    id: 'qa-mentorship',
    label: 'Request Mentorship',
    description:
      'Book 1-on-1 office hours or semester tracks with alumni mentors',
    badge: '42 Open Mentors',
    shortcut: 'Alt+M',
    route: '/mentorship',
    icon: Compass,
    accentTone: 'emerald',
  },
  {
    id: 'qa-alumni',
    label: 'Find Alumni',
    description:
      'Search Sukkur IBA graduates by cohort, department & company',
    badge: '12,400+ Verified',
    shortcut: 'Alt+A',
    route: '/alumni',
    icon: Users,
    accentTone: 'emerald',
  },
  {
    id: 'qa-events',
    label: 'View Events',
    description:
      'RSVP for campus career fairs, workshops & alumni seminars',
    badge: '3 Upcoming',
    shortcut: 'Alt+E',
    route: '/events',
    icon: Calendar,
    accentTone: 'gold',
  },
  {
    id: 'qa-jobs',
    label: 'Job Board',
    description:
      'Apply to alumni-referred internships, fellowships & grad roles',
    badge: 'Referral Priority',
    shortcut: 'Alt+J',
    route: '/jobs',
    icon: Briefcase,
    accentTone: 'emerald',
  },
]

export interface QuickActionsGridProps {
  onNavigate?: (route: string) => void
}

const quickActionSpring = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 26,
  mass: 0.78,
}

export function QuickActionsGrid({ onNavigate }: QuickActionsGridProps) {
  const navigate = useNavigate()

  const handleAction = (route: string) => {
    if (onNavigate) {
      onNavigate(route)
    } else {
      navigate(route)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey) return
      const key = e.key.toLowerCase()
      if (key === 'm') {
        e.preventDefault()
        handleAction('/mentorship')
      } else if (key === 'a') {
        e.preventDefault()
        handleAction('/alumni')
      } else if (key === 'e') {
        e.preventDefault()
        handleAction('/events')
      } else if (key === 'j') {
        e.preventDefault()
        handleAction('/jobs')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  return (
    <section
      aria-label="Quick Actions"
      className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300 space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
          <h2 className="font-mono text-xs uppercase tracking-wider font-bold text-primary">
            Quick Actions
          </h2>
          <span className="text-xs text-secondary hidden sm:inline">
            · Direct navigation across core scholar & alumni workflows
          </span>
        </div>
        <Link
          to="/messages"
          className="group/msg inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-primary hover:underline"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Open Messages
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/msg:translate-x-0.5 group-hover/msg:-translate-y-0.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {QUICK_ACTIONS_ITEMS.map((action, index) => {
          const Icon = action.icon
          const isGold = action.accentTone === 'gold'
          return (
            <motion.button
              key={action.id}
              type="button"
              onClick={() => handleAction(action.route)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                ...quickActionSpring,
                delay: index * 0.04,
              }}
              whileHover={{
                y: -4,
                transition: quickActionSpring,
              }}
              whileTap={{ scale: 0.985 }}
              className={`group relative overflow-hidden rounded-xl border border-border bg-background p-4 text-left shadow-card hover:shadow-card-hover hover:bg-card transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex flex-col justify-between gap-3 cursor-pointer ${
                isGold
                  ? 'hover:border-gold/55'
                  : 'hover:border-primary/55'
              }`}
            >
              {/* Subtle Argon 4 Top Specular Accent Bar on Hover */}
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute inset-x-0 top-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  isGold ? 'bg-gold/75' : 'bg-primary/75'
                }`}
              />

              <div className="flex items-start justify-between gap-3 w-full">
                <span
                  className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-0.5 ${
                    isGold
                      ? 'border-gold/30 bg-stone text-gold group-hover:border-gold/60 group-hover:bg-gold/15'
                      : 'border-primary/25 bg-accent text-primary group-hover:border-primary/50 group-hover:bg-primary group-hover:text-primary-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-105" />
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="hidden xl:inline-flex items-center rounded border border-border bg-stone/70 px-1.5 py-0.5 font-mono text-[10px] text-secondary group-hover:border-primary/30 transition-colors">
                    {action.shortcut}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-0.5 font-mono text-[10px] font-semibold text-secondary transition-colors ${
                      isGold
                        ? 'group-hover:border-gold/45 group-hover:text-foreground'
                        : 'group-hover:border-primary/40 group-hover:text-primary'
                    }`}
                  >
                    {action.badge}
                    <ArrowUpRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  {action.label}
                </p>
                <p className="text-xs text-secondary leading-snug group-hover:text-foreground/85 transition-colors">
                  {action.description}
                </p>
              </div>
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}

export { QuickActionsGrid as QuickActions }
export default QuickActionsGrid
