import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  Bookmark,
  Briefcase,
  Calendar,
  CheckCircle2,
  Compass,
  UserCheck,
  Users,
  Video,
} from 'lucide-react'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { loadMentorshipRequests } from '@/lib/mentorship-data'
import {
  loadConnectedAlumniIds,
  loadJobApplications,
} from '@/lib/role-context'

export interface DashboardStatsProps {
  activeConnectionsCount?: number
  confirmedConnectionsCount?: number
  pendingConnectionsCount?: number
  mentorshipSessionsCount?: number
  activeMentorTracksCount?: number
  savedJobsCount?: number
  submittedApplicationsCount?: number
  registeredEventsCount?: number
}

const cardHoverSpring = {
  type: 'spring' as const,
  stiffness: 360,
  damping: 26,
  mass: 0.8,
}

export function DashboardStats({
  activeConnectionsCount,
  confirmedConnectionsCount,
  pendingConnectionsCount,
  mentorshipSessionsCount,
  activeMentorTracksCount,
  savedJobsCount,
  submittedApplicationsCount,
  registeredEventsCount,
}: DashboardStatsProps) {
  // Pull fallback metrics from persisted student records if not explicitly passed via props
  const fallbackData = useMemo(() => {
    const storedConns = loadConnectedAlumniIds()
    const storedReqs = loadMentorshipRequests()
    const storedApps = loadJobApplications()
    const connValues = Object.values(storedConns)
    const confirmed = connValues.filter((s) => s === 'CONNECTED').length
    const pending = connValues.filter((s) => s === 'PENDING').length
    const activeReqs = storedReqs.filter(
      (r) => r.status === 'ACTIVE' || r.status === 'PENDING',
    )
    const meetings = storedReqs.reduce(
      (sum, r) => sum + (r.meetingCount || 0),
      0,
    )
    return {
      totalConnections: Object.keys(storedConns).length,
      confirmed,
      pending,
      sessions: Math.max(activeReqs.length, meetings + activeReqs.length),
      tracks: activeReqs.length,
      savedJobs: 2,
      applications: storedApps.length,
      events: 2,
    }
  }, [])

  const totalConnections =
    activeConnectionsCount ?? fallbackData.totalConnections
  const confirmedCount = confirmedConnectionsCount ?? fallbackData.confirmed
  const pendingCount = pendingConnectionsCount ?? fallbackData.pending
  const sessionsCount = mentorshipSessionsCount ?? fallbackData.sessions
  const tracksCount = activeMentorTracksCount ?? fallbackData.tracks
  const jobsSavedCount = savedJobsCount ?? fallbackData.savedJobs
  const appsCount = submittedApplicationsCount ?? fallbackData.applications
  const eventsCount = registeredEventsCount ?? fallbackData.events

  const statCards = [
    {
      id: 'stat-active-connections',
      label: 'Active Connections',
      value: totalConnections,
      icon: Users,
      accentTone: 'emerald' as const,
      indicatorLabel:
        confirmedCount > 0 ? `${confirmedCount} Verified` : 'Grow Network',
      indicatorIcon: UserCheck,
      subtext: `${confirmedCount} connected · ${pendingCount} pending`,
      linkTo: '/alumni',
      linkLabel: 'Network',
    },
    {
      id: 'stat-mentorship-sessions',
      label: 'Mentorship Sessions',
      value: sessionsCount,
      icon: Compass,
      accentTone: 'emerald' as const,
      indicatorLabel:
        tracksCount > 0 ? `${tracksCount} Active Track` : 'Book Session',
      indicatorIcon: Video,
      subtext: `${tracksCount} active/pending mentor tracks`,
      linkTo: '/mentorship',
      linkLabel: 'Sessions',
    },
    {
      id: 'stat-saved-jobs',
      label: 'Saved Jobs',
      value: jobsSavedCount,
      icon: Bookmark,
      accentTone: 'gold' as const,
      indicatorLabel:
        appsCount > 0 ? `${appsCount} Applied` : 'Referral Ready',
      indicatorIcon: Briefcase,
      subtext: `${appsCount} applications submitted`,
      linkTo: '/jobs',
      linkLabel: 'Shortlist',
    },
    {
      id: 'stat-registered-events',
      label: 'Registered Events',
      value: eventsCount,
      icon: Calendar,
      accentTone: 'emerald' as const,
      indicatorLabel: eventsCount > 0 ? 'RSVP Confirmed' : 'Open Calendar',
      indicatorIcon: CheckCircle2,
      subtext: 'Next: Nov 18 Career Fair',
      linkTo: '/events',
      linkLabel: 'Calendar',
    },
  ]

  return (
    <section
      aria-label="Student Activity Overview Stats Bar"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {statCards.map((card, index) => {
        const PrimaryIcon = card.icon
        const IndicatorIcon = card.indicatorIcon
        const isGold = card.accentTone === 'gold'

        return (
          <motion.article
            key={card.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              ...cardHoverSpring,
              delay: index * 0.04,
            }}
            whileHover={{
              y: -4,
              transition: cardHoverSpring,
            }}
            whileTap={{ scale: 0.99 }}
            className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-shadow duration-300 flex flex-col justify-between gap-3.5 ${
              isGold
                ? 'hover:border-gold/50'
                : 'hover:border-primary/45'
            }`}
          >
            {/* Subtle Argon 4 Top Accent Highlight Line on Hover */}
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute inset-x-0 top-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                isGold ? 'bg-gold/70' : 'bg-primary/70'
              }`}
            />

            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-mono uppercase tracking-wider font-semibold text-secondary group-hover:text-foreground transition-colors">
                  {card.label}
                </p>
                <div className="flex items-baseline gap-2.5">
                  <p
                    className={`font-mono text-3xl font-bold tabular-nums transition-colors ${
                      card.id === 'stat-mentorship-sessions'
                        ? 'text-primary'
                        : 'text-foreground group-hover:text-primary'
                    }`}
                  >
                    <AnimatedCounter value={card.value} />
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-mono font-semibold border transition-colors ${
                      isGold
                        ? 'bg-gold/15 text-foreground border-gold/30 group-hover:border-gold/50'
                        : 'bg-accent/80 text-primary border-primary/20 group-hover:border-primary/40'
                    }`}
                  >
                    <IndicatorIcon className="h-3 w-3 shrink-0" />
                    {card.indicatorLabel}
                  </span>
                </div>
              </div>

              <span
                className={`h-11 w-11 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-0.5 ${
                  isGold
                    ? 'border-gold/30 bg-stone text-gold group-hover:border-gold/55 group-hover:bg-gold/15'
                    : 'border-primary/25 bg-accent text-primary group-hover:border-primary/50 group-hover:bg-primary group-hover:text-primary-foreground'
                }`}
              >
                <PrimaryIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-105" />
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-border/80 group-hover:border-primary/20 transition-colors text-xs font-mono">
              <span className="text-secondary truncate">{card.subtext}</span>
              <Link
                to={card.linkTo}
                className="font-semibold text-primary hover:underline inline-flex items-center gap-1 shrink-0"
              >
                {card.linkLabel}
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </motion.article>
        )
      })}
    </section>
  )
}
export default DashboardStats
