import { Input, SelectField } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { GlobalSearchTrigger } from '@/components/ui/global-search-bar'
import { MediaImage } from '@/components/ui/media-image'
import {
  TiltEventCard,
  EventRsvpToggleBar,
  useEventRsvpState,
  type EventEngagementStatus,
} from '@/components/ui/interactive-event-card'
import {
  Loader2,
  UserPlus,
  MapPin,
  Search,
  Calendar,
  Globe2,
  Building2,
  ArrowRight,
  RotateCcw,
  Star,
  CheckCircle2,
} from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, LayoutGroup, type Variants } from 'framer-motion'
import { toast } from '@/lib/toast'

interface AlumniEventItem {
  id: string
  title: string
  slug: string
  category: string
  description: string
  coverImageUrl: string
  startDate: Date
  endDate: Date
  timezone: string
  location: string
  chapter: 'sukkur' | 'karachi' | 'islamabad' | 'dubai'
  chapterLabel: string
  isVirtual: boolean
  virtualUrl?: string
  capacity: number
  status: 'PUBLISHED' | 'COMPLETED'
  organizer: { name: string }
  registrationCount: number
}

const gridVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
}

export function EventsHubPage() {
  const navigate = useNavigate()
  const [events, setEvents] = useState<AlumniEventItem[]>([])
  const [loading, setLoading] = useState(true)
  const { rsvpMap, toggleEventStatus, counts } = useEventRsvpState()
  const [rsvpFilter, setRsvpFilter] = useState<'ALL' | 'ATTENDING' | 'INTERESTED'>('ALL')
  const [prioritizeRsvps, setPrioritizeRsvps] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL' as 'ALL' | 'PUBLISHED' | 'COMPLETED',
    format: 'ALL' as 'ALL' | 'IN_PERSON' | 'VIRTUAL',
    chapter: 'ALL' as 'ALL' | 'sukkur' | 'karachi' | 'islamabad' | 'dubai',
    sortBy: 'DATE_ASC' as 'DATE_ASC' | 'POPULAR' | 'CAPACITY',
  })

  useEffect(() => {
    const mockEvents: AlumniEventItem[] = [
      {
        id: '1',
        title: 'Annual Sukkur IBA Grand Homecoming & Gala 2026',
        slug: 'alumni-reunion-2026',
        category: 'Campus Reunion',
        description:
          'Three-day flagship gathering of Sukkur IBA alumni, deans, and graduating scholars featuring keynote panels, cohort dinners, and scholarship awards.',
        coverImageUrl: '/images/events/reunion.jpg',
        startDate: new Date('2026-12-15T17:00:00'),
        endDate: new Date('2026-12-17T22:00:00'),
        timezone: 'PKT',
        location: 'Main Auditorium, Sukkur IBA University',
        chapter: 'sukkur',
        chapterLabel: 'Sukkur Main Campus',
        isVirtual: false,
        capacity: 450,
        status: 'PUBLISHED',
        organizer: { name: 'Alumni Association Executive Board' },
        registrationCount: 342,
      },
      {
        id: '2',
        title: 'Executive Product & Career Acceleration Colloquium',
        slug: 'career-development-seminar',
        category: 'Leadership Seminar',
        description:
          'Interactive workshop on transitioning from senior engineering and finance roles into VP and C-suite leadership across global markets.',
        coverImageUrl: '/images/events/seminar.jpg',
        startDate: new Date('2026-11-20T18:30:00'),
        endDate: new Date('2026-11-20T21:00:00'),
        timezone: 'PKT / GST',
        location: 'Online Live Stream & Dubai DIFC Hub',
        chapter: 'dubai',
        chapterLabel: 'Dubai & Gulf Chapter',
        isVirtual: true,
        virtualUrl: 'https://zoom.us/j/1234567890',
        capacity: 250,
        status: 'PUBLISHED',
        organizer: { name: 'Career Development Center (CDC)' },
        registrationCount: 198,
      },
      {
        id: '3',
        title: 'Applied Generative AI & Distributed Systems Symposium',
        slug: 'guest-lecture-ai-in-business',
        category: 'AI & Engineering',
        description:
          'Deep-dive technical architecture session led by Sukkur IBA Computer Science alumni leading AI infrastructure teams in Berlin and Singapore.',
        coverImageUrl: '/images/events/guest-lecture-ai.jpg',
        startDate: new Date('2026-10-28T16:00:00'),
        endDate: new Date('2026-10-28T19:00:00'),
        timezone: 'PKT',
        location: 'Computer Science Lecture Hall, Sukkur Campus',
        chapter: 'sukkur',
        chapterLabel: 'Sukkur Main Campus',
        isVirtual: false,
        capacity: 180,
        status: 'COMPLETED',
        organizer: { name: 'Department of Computer Science' },
        registrationCount: 180,
      },
      {
        id: '4',
        title: 'Sukkur IBA Autumn Tech & FinTech Hiring Summit',
        slug: 'tech-career-fair-2026',
        category: 'Career Fair',
        description:
          'Direct hiring summit connecting 38 alumni-led partner companies with verified graduates and final-year scholars for fast-track referrals.',
        coverImageUrl: '/images/events/tech-career-fair.jpg',
        startDate: new Date('2027-01-14T10:00:00'),
        endDate: new Date('2027-01-14T17:00:00'),
        timezone: 'PKT',
        location: 'Karachi Regional Chapter Convention Center',
        chapter: 'karachi',
        chapterLabel: 'Karachi Chapter',
        isVirtual: false,
        capacity: 350,
        status: 'PUBLISHED',
        organizer: { name: 'Corporate Linkages & Placement Office' },
        registrationCount: 276,
      },
      {
        id: '5',
        title: 'Women in Tech & Executive Fellows Roundtable',
        slug: 'women-in-tech-fellowship',
        category: 'Mentorship Forum',
        description:
          'Mentorship pairing and research fellowship showcase led by Sukkur IBA alumnae serving as founders, directors, and principal scientists.',
        coverImageUrl: '/images/events/women-in-tech.jpg',
        startDate: new Date('2027-02-04T15:00:00'),
        endDate: new Date('2027-02-04T18:30:00'),
        timezone: 'PKT',
        location: 'Islamabad Chapter Hub & Global Stream',
        chapter: 'islamabad',
        chapterLabel: 'Islamabad Hub',
        isVirtual: true,
        capacity: 160,
        status: 'PUBLISHED',
        organizer: { name: 'Global Alumnae Leadership Council' },
        registrationCount: 124,
      },
    ]

    setEvents(mockEvents)
    setLoading(false)
  }, [])

  const filteredEvents = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    const matches = events.filter((ev) => {
      const matchesSearch =
        !q ||
        ev.title.toLowerCase().includes(q) ||
        ev.description.toLowerCase().includes(q) ||
        ev.location.toLowerCase().includes(q) ||
        ev.category.toLowerCase().includes(q) ||
        ev.chapterLabel.toLowerCase().includes(q)

      const matchesStatus =
        filters.status === 'ALL' || ev.status === filters.status

      const matchesFormat =
        filters.format === 'ALL' ||
        (filters.format === 'VIRTUAL' && ev.isVirtual) ||
        (filters.format === 'IN_PERSON' && !ev.isVirtual)

      const matchesChapter =
        filters.chapter === 'ALL' || ev.chapter === filters.chapter

      const userRsvp = rsvpMap[ev.id] || 'NONE'
      const matchesRsvp =
        rsvpFilter === 'ALL' ||
        (rsvpFilter === 'ATTENDING' && userRsvp === 'ATTENDING') ||
        (rsvpFilter === 'INTERESTED' && userRsvp === 'INTERESTED')

      return (
        matchesSearch &&
        matchesStatus &&
        matchesFormat &&
        matchesChapter &&
        matchesRsvp
      )
    })

    const rsvpWeight = (status: EventEngagementStatus) => {
      if (status === 'ATTENDING') return 2
      if (status === 'INTERESTED') return 1
      return 0
    }

    return [...matches].sort((a, b) => {
      if (prioritizeRsvps) {
        const weightDiff =
          rsvpWeight(rsvpMap[b.id] || 'NONE') -
          rsvpWeight(rsvpMap[a.id] || 'NONE')
        if (weightDiff !== 0) return weightDiff
      }
      if (filters.sortBy === 'POPULAR') {
        return b.registrationCount - a.registrationCount
      }
      if (filters.sortBy === 'CAPACITY') {
        return b.capacity - a.capacity
      }
      return a.startDate.getTime() - b.startDate.getTime()
    })
  }, [events, filters, rsvpMap, rsvpFilter, prioritizeRsvps])

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.status !== 'ALL' ||
    filters.format !== 'ALL' ||
    filters.chapter !== 'ALL' ||
    filters.sortBy !== 'DATE_ASC' ||
    rsvpFilter !== 'ALL'

  const resetFilters = () => {
    setFilters({
      search: '',
      status: 'ALL',
      format: 'ALL',
      chapter: 'ALL',
      sortBy: 'DATE_ASC',
    })
    setRsvpFilter('ALL')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="min-h-[240px] flex flex-col items-center justify-center py-12">
          <Loader2 className="h-7 w-7 mx-auto mb-3 animate-spin text-primary" />
          <p className="text-sm font-medium text-secondary">
            Loading university & chapter events...
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
        <div className="page-container h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/"
              className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-primary font-semibold hover:underline shrink-0"
            >
              <img
                src="/images/university-logo.jpg"
                alt="Sukkur IBA University"
                className="h-7 w-7 rounded-md object-cover ring-1 ring-border"
              />
              <span>AlumniConnect</span>
            </Link>
            <span aria-hidden="true" className="text-border">
              /
            </span>
            <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
              Events & Chapter Gatherings
            </h1>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <GlobalSearchTrigger compact />
            <ThemeSwitcher />
            <Button
              variant="default"
              size="lg"
              onClick={() =>
                toast.success(
                  'Chapter event proposal form opened. Our Alumni Office reviews submissions within 24 hours.',
                )
              }
            >
              <UserPlus className="h-4 w-4 mr-1.5" />
              Host Chapter Event
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Container with Generous Modern Margins */}
      <div className="page-container py-10 sm:py-14 space-y-10">
        {/* Editorial Intro Banner */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-mono uppercase tracking-wider text-primary mb-2.5">
              Sukkur IBA University · Global Calendar 2026–2027
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance mb-3">
              Campus reunions, technical colloquiums, and regional chapter summits.
            </h2>
            <p className="text-sm sm:text-base text-secondary leading-relaxed">
              Filter upcoming gatherings by chapter city, attendance format, or event status
              to reserve your seat and connect with fellow graduates.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono text-secondary tabular-nums shrink-0 pt-2 lg:pt-0">
            <div>
              <span className="block text-2xl font-bold text-foreground">
                {events.length}
              </span>
              Scheduled Gatherings
            </div>
            <div aria-hidden="true" className="h-9 w-px bg-border" />
            <div>
              <span className="block text-2xl font-bold text-primary">
                1,120+
              </span>
              Total RSVPs This Season
            </div>
          </div>
        </div>

        {/* High-Visibility Filter & Dropdown Control Bar */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-card space-y-5"
          aria-label="Event filters"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5 items-end">
            {/* Search Input (4 cols on desktop) */}
            <div className="lg:col-span-4 flex flex-col gap-1.5">
              <label
                htmlFor="events-search-input"
                className="text-xs font-semibold tracking-wide text-secondary select-none"
              >
                Search Gatherings
              </label>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary"
                />
                <Input
                  id="events-search-input"
                  placeholder="Title, topic, speaker, or city..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>

            {/* Chapter Dropdown (3 cols on desktop) */}
            <SelectField
              label="Chapter Hub"
              icon={<Building2 className="h-4 w-4" />}
              wrapperClassName="lg:col-span-3"
              value={filters.chapter}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  chapter: e.target.value as typeof filters.chapter,
                })
              }
            >
              <option value="ALL">All Chapter Hubs (Global)</option>
              <option value="sukkur">Sukkur Main Campus</option>
              <option value="karachi">Karachi Regional Chapter</option>
              <option value="islamabad">Islamabad Capital Hub</option>
              <option value="dubai">Dubai & Gulf Chapter</option>
            </SelectField>

            {/* Format Dropdown (2 cols on desktop) */}
            <SelectField
              label="Attendance Format"
              icon={<Globe2 className="h-4 w-4" />}
              wrapperClassName="lg:col-span-2"
              value={filters.format}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  format: e.target.value as typeof filters.format,
                })
              }
            >
              <option value="ALL">All Formats</option>
              <option value="IN_PERSON">In-Person Venue</option>
              <option value="VIRTUAL">Online / Hybrid</option>
            </SelectField>

            {/* Status Dropdown (3 cols on desktop) */}
            <SelectField
              label="Event Status & Sort"
              icon={<Calendar className="h-4 w-4" />}
              wrapperClassName="lg:col-span-3"
              value={`${filters.status}:${filters.sortBy}`}
              onChange={(e) => {
                const [nextStatus, nextSort] = e.target.value.split(':') as [
                  typeof filters.status,
                  typeof filters.sortBy,
                ]
                setFilters({
                  ...filters,
                  status: nextStatus,
                  sortBy: nextSort,
                })
              }}
            >
              <option value="ALL:DATE_ASC">All Statuses · Chronological</option>
              <option value="PUBLISHED:DATE_ASC">Upcoming Only · Soonest First</option>
              <option value="PUBLISHED:POPULAR">Upcoming Only · Most RSVPs</option>
              <option value="COMPLETED:DATE_ASC">Completed Archive</option>
            </SelectField>
          </div>

          {/* Interactive RSVP Status Filter & Layout Reordering Controls */}
          <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-secondary mr-1">
                My Engagement:
              </span>
              <div
                role="group"
                aria-label="Filter events by your Interested or Attending status"
                className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-stone border border-border/80"
              >
                {(
                  [
                    { id: 'ALL', label: `All Gatherings (${events.length})` },
                    {
                      id: 'ATTENDING',
                      label: `Attending (${counts.attending})`,
                      icon: CheckCircle2,
                    },
                    {
                      id: 'INTERESTED',
                      label: `Interested (${counts.interested})`,
                      icon: Star,
                    },
                  ] as const
                ).map((tab) => {
                  const active = rsvpFilter === tab.id
                  const Icon = 'icon' in tab ? tab.icon : null
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setRsvpFilter(tab.id)}
                      className={`relative px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
                        active
                          ? 'text-foreground font-semibold'
                          : 'text-secondary hover:text-foreground'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="events-hub-rsvp-filter-pill"
                          transition={{
                            type: 'spring',
                            stiffness: 360,
                            damping: 28,
                          }}
                          className="absolute inset-0 rounded-lg bg-card shadow-sm border border-primary/25"
                        />
                      )}
                      {Icon && (
                        <Icon className="relative z-10 h-3.5 w-3.5 text-primary dark:text-[#2DD4BF]" />
                      )}
                      <span className="relative z-10">{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-secondary">
              <button
                type="button"
                onClick={() => setPrioritizeRsvps((v) => !v)}
                aria-pressed={prioritizeRsvps}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-colors ${
                  prioritizeRsvps
                    ? 'border-primary/40 bg-primary/10 text-primary dark:text-[#2DD4BF] font-semibold'
                    : 'border-border bg-stone/60 text-secondary hover:text-foreground'
                }`}
              >
                {prioritizeRsvps
                  ? '✓ Auto-Pinning Attending & Interested First'
                  : 'Sort Strictly by Calendar / Filter'}
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset All Filters
                </button>
              )}
            </div>
          </div>
        </motion.section>

        {/* Events Grid with Framer Motion Layout Animations & 3D Tilt Cards */}
        {filteredEvents.length > 0 ? (
          <LayoutGroup id="member-events-hub-grid">
            <motion.section
              layout
              variants={gridVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filteredEvents.map((event) => {
                  const start = event.startDate
                  const end = event.endDate
                  const rsvpStatus = rsvpMap[event.id] || 'NONE'
                  const effectiveRegCount =
                    event.registrationCount + (rsvpStatus === 'ATTENDING' ? 1 : 0)
                  const capacityPct = Math.min(
                    100,
                    Math.round((effectiveRegCount / event.capacity) * 100),
                  )

                  return (
                    <TiltEventCard
                      key={event.id}
                      engagementStatus={rsvpStatus}
                      onClick={() => navigate(`/events/${event.id}`)}
                      className="cursor-pointer"
                    >
                      <motion.div layout="position">
                        <div className="relative">
                          <MediaImage
                            src={event.coverImageUrl}
                            alt={event.title}
                            className="aspect-[16/10] w-full rounded-none"
                            imgClassName="object-cover object-center group-hover:scale-[1.03] transition-transform duration-500 ease-out-expo"
                          />
                          {rsvpStatus !== 'NONE' && (
                            <motion.div
                              layout
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold shadow-md backdrop-blur-md ${
                                rsvpStatus === 'ATTENDING'
                                  ? 'bg-[#0D6E5B]/95 text-white border border-[#2DD4BF]/40'
                                  : 'bg-[#091422]/90 text-[#F59E0B] border border-[#F59E0B]/40'
                              }`}
                            >
                              {rsvpStatus === 'ATTENDING'
                                ? '✓ Attending'
                                : '★ Interested'}
                            </motion.div>
                          )}
                        </div>

                        <motion.div layout className="p-6 sm:p-7">
                          {/* Clean unboxed metadata with typographic separators */}
                          <motion.div
                            layout="position"
                            className="flex flex-wrap items-center gap-2 text-xs font-mono text-secondary mb-3 tabular-nums"
                          >
                            <span
                              className={
                                event.status === 'PUBLISHED'
                                  ? 'text-primary dark:text-[#2DD4BF] font-semibold'
                                  : 'text-secondary font-semibold'
                              }
                            >
                              {event.status === 'PUBLISHED'
                                ? 'Upcoming'
                                : 'Completed'}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{event.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>
                              {start.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                            {end &&
                              start.toDateString() !== end.toDateString() && (
                                <span>
                                  –{' '}
                                  {end.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              )}
                          </motion.div>

                          <motion.h3
                            layout="position"
                            className="font-display text-xl font-bold text-foreground mb-2.5 leading-snug group-hover:text-primary dark:group-hover:text-[#2DD4BF] transition-colors"
                          >
                            {event.title}
                          </motion.h3>

                          <motion.p
                            layout="position"
                            className="text-sm text-secondary leading-relaxed mb-4"
                          >
                            {event.description}
                          </motion.p>

                          {/* Interactive Interested / Attending Toggle with Framer Motion layout animations */}
                          <div className="mb-4">
                            <EventRsvpToggleBar
                              eventId={event.id}
                              eventTitle={event.title}
                              status={rsvpStatus}
                              onToggle={toggleEventStatus}
                              compact
                            />
                          </div>

                          {/* Attendance progress bar */}
                          <motion.div layout className="space-y-1.5 pt-2">
                            <div className="flex items-center justify-between text-xs font-mono text-secondary tabular-nums">
                              <span>
                                {effectiveRegCount} / {event.capacity} Registered
                              </span>
                              <span className="font-semibold text-foreground">
                                {capacityPct}% Full
                              </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-stone overflow-hidden">
                              <motion.div
                                layout
                                style={{ width: `${capacityPct}%` }}
                                className="h-full rounded-full bg-primary transition-all duration-500"
                              />
                            </div>
                          </motion.div>
                        </motion.div>
                      </motion.div>

                      <motion.div
                        layout
                        className="px-6 sm:px-7 py-4 border-t border-border bg-stone/35 flex items-center justify-between gap-3 text-xs"
                      >
                        <span className="flex items-center gap-1.5 text-secondary truncate">
                          <MapPin className="h-3.5 w-3.5 text-primary dark:text-[#2DD4BF] shrink-0" />
                          <span className="truncate font-medium">
                            {event.location}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-primary dark:text-[#2DD4BF] group-hover:translate-x-0.5 transition-transform shrink-0">
                          <span>Details</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </motion.div>
                    </TiltEventCard>
                  )
                })}
              </AnimatePresence>
            </motion.section>
          </LayoutGroup>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <Calendar className="h-10 w-10 text-secondary/50 mx-auto mb-3" />
            <h3 className="font-display text-lg font-bold text-foreground mb-1">
              No gatherings match your current filter selection
            </h3>
            <p className="text-sm text-secondary mb-5 max-w-md mx-auto">
              Try clearing your search query or switching the chapter hub and attendance
              format dropdowns.
            </p>
            <Button variant="outline" size="lg" onClick={resetFilters}>
              Reset All Event Filters
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}