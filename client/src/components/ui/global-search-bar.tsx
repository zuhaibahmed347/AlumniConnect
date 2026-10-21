import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  type ReactNode,
} from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import {
  Search,
  X,
  Users,
  Calendar,
  Briefcase,
  MapPin,
  ArrowUpRight,
  ArrowRight,
  GraduationCap,
  Clock,
  Sparkles,
  CornerDownLeft,
} from 'lucide-react'
import { SUKKUR_IBA_JOB_LISTINGS } from '@/components/ui/job-board-filter'

export type GlobalSearchCategory = 'ALL' | 'ALUMNI' | 'JOBS' | 'EVENTS'

export interface SearchableAlumnus {
  id: string
  type: 'ALUMNI'
  name: string
  headline: string
  company: string
  graduationYear: number
  department: string
  cohortBadge: string
  location: string
  country: string
  avatar: string
  skills: string[]
  mentoringTrack: string
  availableForMentorship: boolean
  route: string
}

export interface SearchableEvent {
  id: string
  type: 'EVENTS'
  title: string
  category: string
  description: string
  coverImageUrl: string
  dateDisplay: string
  timeDisplay: string
  location: string
  chapterLabel: string
  isVirtual: boolean
  registeredCount: number
  capacity: number
  status: 'UPCOMING' | 'COMPLETED'
  route: string
}

export interface SearchableJob {
  id: string
  type: 'JOBS'
  title: string
  company: string
  companyLogoUrl: string
  location: string
  workplaceLabel: string
  sectorLabel: string
  experienceLabel: string
  compensationDisplay: string
  referrerName: string
  referrerCohort: string
  referralTurnaroundHours: number
  techStack: string[]
  route: string
}

export type GlobalSearchResultItem =
  | SearchableAlumnus
  | SearchableEvent
  | SearchableJob

export const GLOBAL_ALUMNI_INDEX: SearchableAlumnus[] = [
  {
    id: 'alum-1',
    type: 'ALUMNI',
    name: 'Ayesha Siddiqui',
    headline: 'Principal Systems Architect · CloudScale',
    company: 'CloudScale',
    graduationYear: 2019,
    department: 'Computer Science',
    cohortBadge: 'BS Computer Science · Class of 2019',
    location: 'Karachi, Pakistan (Remote)',
    country: 'Pakistan',
    avatar: '/images/avatars/sana.jpg',
    skills: ['Distributed Systems', 'Go', 'Kubernetes', 'Cloud Architecture'],
    mentoringTrack: 'Distributed Systems & Backend Architecture',
    availableForMentorship: true,
    route: '/alumni?q=Ayesha%20Siddiqui',
  },
  {
    id: 'alum-2',
    type: 'ALUMNI',
    name: 'Ahmed Hassan',
    headline: 'Senior Software Engineer · TechCorp',
    company: 'TechCorp',
    graduationYear: 2020,
    department: 'Computer Science',
    cohortBadge: 'BS Computer Science · Class of 2020',
    location: 'Karachi, Pakistan',
    country: 'Pakistan',
    avatar: '/images/avatars/hassan.jpg',
    skills: ['TypeScript', 'React', 'Node.js', 'System Design'],
    mentoringTrack: 'Full-Stack Engineering & Technical Interviews',
    availableForMentorship: true,
    route: '/alumni?q=Ahmed%20Hassan',
  },
  {
    id: 'alum-3',
    type: 'ALUMNI',
    name: 'Sanaullah Memon',
    headline: 'Director of Payment Rail Product · Careem',
    company: 'Careem',
    graduationYear: 2016,
    department: 'Business Administration',
    cohortBadge: 'BBA Finance · Class of 2016',
    location: 'Dubai, United Arab Emirates',
    country: 'United Arab Emirates',
    avatar: '/images/avatars/sana.jpg',
    skills: ['Product Strategy', 'FinTech', 'MENA Payments', 'Analytics'],
    mentoringTrack: 'Product Management & FinTech Strategy',
    availableForMentorship: true,
    route: '/alumni?q=Sanaullah%20Memon',
  },
  {
    id: 'alum-4',
    type: 'ALUMNI',
    name: 'Dr. Aamir Soomro',
    headline: 'VP of AI Infrastructure · AI Innovations',
    company: 'AI Innovations',
    graduationYear: 2014,
    department: 'Computer Science',
    cohortBadge: 'BS Computer Science · Class of 2014',
    location: 'Munich, Germany',
    country: 'Germany',
    avatar: '/images/avatars/aamir.jpg',
    skills: ['Python', 'Machine Learning', 'Kubernetes', 'DAAD Scholar'],
    mentoringTrack: 'European MS/PhD Fellowships & Applied AI',
    availableForMentorship: true,
    route: '/alumni?q=Aamir%20Soomro',
  },
  {
    id: 'alum-5',
    type: 'ALUMNI',
    name: 'Kamran Mahar',
    headline: 'Managing Director, Cloud Security · HumaneCorp',
    company: 'HumaneCorp',
    graduationYear: 2011,
    department: 'Computer Science',
    cohortBadge: 'BS Computer Science · Class of 2011',
    location: 'Riyadh, Saudi Arabia',
    country: 'Saudi Arabia',
    avatar: '/images/avatars/kamran.jpg',
    skills: ['Cloud Security', 'Zero Trust', 'Executive Leadership'],
    mentoringTrack: 'GCC Enterprise Architecture & Cyber Defense',
    availableForMentorship: true,
    route: '/alumni?q=Kamran%20Mahar',
  },
  {
    id: 'alum-6',
    type: 'ALUMNI',
    name: 'Nadia Talpur',
    headline: 'Head of Design Engineering · Creative Studio',
    company: 'Creative Studio',
    graduationYear: 2018,
    department: 'Computer Science',
    cohortBadge: 'BS Computer Science · Class of 2018',
    location: 'London, United Kingdom',
    country: 'United Kingdom',
    avatar: '/images/avatars/nadia.jpg',
    skills: ['React', 'Design Systems', 'TypeScript', 'Accessibility'],
    mentoringTrack: 'Frontend Architecture & Design Systems',
    availableForMentorship: true,
    route: '/alumni?q=Nadia%20Talpur',
  },
  {
    id: 'alum-7',
    type: 'ALUMNI',
    name: 'Zainab Khuhro',
    headline: 'Staff Applied AI Scientist · AI Innovations',
    company: 'AI Innovations',
    graduationYear: 2017,
    department: 'Computer Science',
    cohortBadge: 'BS Computer Science · Class of 2017',
    location: 'San Francisco, United States',
    country: 'United States',
    avatar: '/images/avatars/zainab.jpg',
    skills: ['Python', 'LLMs', 'PyTorch', 'Fulbright Scholar'],
    mentoringTrack: 'US Graduate Fellowships & LLM Research',
    availableForMentorship: true,
    route: '/alumni?q=Zainab%20Khuhro',
  },
  {
    id: 'alum-8',
    type: 'ALUMNI',
    name: 'Bilal Ahmed Qureshi',
    headline: 'Chief Data Officer · DataInsights',
    company: 'DataInsights',
    graduationYear: 2017,
    department: 'Data Science',
    cohortBadge: 'MS Data Science · Class of 2017',
    location: 'Islamabad, Pakistan',
    country: 'Pakistan',
    avatar: '/images/avatars/bilal.jpg',
    skills: ['Python', 'Machine Learning', 'SQL', 'Data Governance'],
    mentoringTrack: 'Enterprise Data Platforms & Analytics',
    availableForMentorship: false,
    route: '/alumni?q=Bilal%20Ahmed%20Qureshi',
  },
  {
    id: 'alum-9',
    type: 'ALUMNI',
    name: 'Farhan Ali Bhutto',
    headline: 'Partner, Enterprise Data Advisory · DataInsights',
    company: 'DataInsights',
    graduationYear: 2015,
    department: 'Business Administration',
    cohortBadge: 'MBA · Class of 2015',
    location: 'Toronto, Canada',
    country: 'Canada',
    avatar: '/images/avatars/farhan.jpg',
    skills: ['Analytics', 'Product Marketing', 'SQL', 'Enterprise Consulting'],
    mentoringTrack: 'North American Career Mobility & Advisory',
    availableForMentorship: true,
    route: '/alumni?q=Farhan%20Ali%20Bhutto',
  },
  {
    id: 'alum-10',
    type: 'ALUMNI',
    name: 'Hina Soomro',
    headline: 'Staff Power Systems Engineer · Siemens Energy',
    company: 'Siemens Energy',
    graduationYear: 2017,
    department: 'Electrical Engineering',
    cohortBadge: 'BE Electrical Engineering · Class of 2017',
    location: 'Munich, Germany',
    country: 'Germany',
    avatar: '/images/avatars/nadia.jpg',
    skills: ['Smart Grids', 'Power Electronics', 'Embedded C++'],
    mentoringTrack: 'Clean Energy & European Engineering Roles',
    availableForMentorship: true,
    route: '/alumni?q=Hina%20Soomro',
  },
]

export const GLOBAL_EVENTS_INDEX: SearchableEvent[] = [
  {
    id: '1',
    type: 'EVENTS',
    title: 'Annual Sukkur IBA Grand Homecoming & Gala 2026',
    category: 'Campus Reunion',
    description:
      'Three-day flagship gathering of Sukkur IBA alumni, deans, and graduating scholars featuring keynote panels, cohort dinners, and scholarship awards.',
    coverImageUrl: '/images/events/reunion.jpg',
    dateDisplay: 'Dec 15 – Dec 17, 2026',
    timeDisplay: '5:00 PM PKT',
    location: 'Main Auditorium, Sukkur IBA University',
    chapterLabel: 'Sukkur Main Campus',
    isVirtual: false,
    registeredCount: 342,
    capacity: 450,
    status: 'UPCOMING',
    route: '/events/1',
  },
  {
    id: '2',
    type: 'EVENTS',
    title: 'Executive Product & Career Acceleration Colloquium',
    category: 'Leadership Seminar',
    description:
      'Interactive workshop on transitioning from senior engineering and finance roles into VP and C-suite leadership across global markets.',
    coverImageUrl: '/images/events/seminar.jpg',
    dateDisplay: 'Nov 20, 2026',
    timeDisplay: '6:30 PM PKT / GST',
    location: 'Online Live Stream & Dubai DIFC Hub',
    chapterLabel: 'Dubai & Gulf Chapter',
    isVirtual: true,
    registeredCount: 198,
    capacity: 250,
    status: 'UPCOMING',
    route: '/events/2',
  },
  {
    id: '3',
    type: 'EVENTS',
    title: 'Applied Generative AI & Distributed Systems Symposium',
    category: 'AI & Engineering',
    description:
      'Deep-dive technical architecture session led by Sukkur IBA Computer Science alumni leading AI infrastructure teams in Berlin and Singapore.',
    coverImageUrl: '/images/events/guest-lecture-ai.jpg',
    dateDisplay: 'Oct 28, 2026',
    timeDisplay: '4:00 PM PKT',
    location: 'Computer Science Lecture Hall, Sukkur Campus',
    chapterLabel: 'Sukkur Main Campus',
    isVirtual: false,
    registeredCount: 180,
    capacity: 180,
    status: 'COMPLETED',
    route: '/events/3',
  },
  {
    id: '4',
    type: 'EVENTS',
    title: 'Sukkur IBA Autumn Tech & FinTech Hiring Summit',
    category: 'Career Fair',
    description:
      'Direct hiring summit connecting 38 alumni-led partner companies with verified graduates and final-year scholars for fast-track referrals.',
    coverImageUrl: '/images/events/tech-career-fair.jpg',
    dateDisplay: 'Jan 14, 2027',
    timeDisplay: '10:00 AM PKT',
    location: 'Karachi Regional Chapter Convention Center',
    chapterLabel: 'Karachi Chapter',
    isVirtual: false,
    registeredCount: 276,
    capacity: 350,
    status: 'UPCOMING',
    route: '/events/4',
  },
  {
    id: '5',
    type: 'EVENTS',
    title: 'Women in Tech & Executive Fellows Roundtable',
    category: 'Mentorship Forum',
    description:
      'Mentorship pairing and research fellowship showcase led by Sukkur IBA alumnae serving as founders, directors, and principal scientists.',
    coverImageUrl: '/images/events/women-in-tech.jpg',
    dateDisplay: 'Feb 4, 2027',
    timeDisplay: '3:00 PM PKT',
    location: 'Islamabad Chapter Hub & Global Stream',
    chapterLabel: 'Islamabad Hub',
    isVirtual: true,
    registeredCount: 124,
    capacity: 160,
    status: 'UPCOMING',
    route: '/events/5',
  },
]

export const GLOBAL_JOBS_INDEX: SearchableJob[] = SUKKUR_IBA_JOB_LISTINGS.map(
  (job) => ({
    id: job.id,
    type: 'JOBS',
    title: job.title,
    company: job.company,
    companyLogoUrl: job.companyLogoUrl,
    location: job.location,
    workplaceLabel: job.workplaceLabel,
    sectorLabel: job.sectorLabel,
    experienceLabel: job.experienceLabel,
    compensationDisplay: job.compensationDisplay.split('·')[0].trim(),
    referrerName: job.referrerName,
    referrerCohort: job.referrerCohort,
    referralTurnaroundHours: job.referralTurnaroundHours,
    techStack: job.techStack,
    route: `/jobs/${job.id}`,
  })
)

const QUICK_SUGGESTIONS: ReadonlyArray<{
  label: string
  query: string
  category: GlobalSearchCategory
}> = [
  { label: 'AI & Distributed Systems', query: 'AI', category: 'ALL' },
  { label: 'Remote Engineering Roles', query: 'Remote', category: 'JOBS' },
  { label: 'Dubai & Gulf Chapter', query: 'Dubai', category: 'ALL' },
  { label: 'Class of 2019 Alumni', query: '2019', category: 'ALUMNI' },
  { label: 'Grand Homecoming 2026', query: 'Homecoming', category: 'EVENTS' },
  { label: 'FinTech & Banking', query: 'FinTech', category: 'ALL' },
]

interface GlobalSearchContextValue {
  isOpen: boolean
  query: string
  category: GlobalSearchCategory
  openSearch: (options?: {
    initialQuery?: string
    category?: GlobalSearchCategory
  }) => void
  closeSearch: () => void
  setQuery: (q: string) => void
  setCategory: (cat: GlobalSearchCategory) => void
}

const GlobalSearchContext = createContext<GlobalSearchContextValue | null>(null)

export function useGlobalSearch() {
  const ctx = useContext(GlobalSearchContext)
  if (!ctx) {
    throw new Error('useGlobalSearch must be used within a GlobalSearchProvider')
  }
  return ctx
}

const CATEGORY_TABS: ReadonlyArray<{
  id: GlobalSearchCategory
  label: string
}> = [
  { id: 'ALL', label: 'All Platform' },
  { id: 'ALUMNI', label: 'Alumni' },
  { id: 'JOBS', label: 'Job Referrals' },
  { id: 'EVENTS', label: 'Events' },
]

export function GlobalSearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<GlobalSearchCategory>('ALL')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const openSearch = useCallback(
    (options?: { initialQuery?: string; category?: GlobalSearchCategory }) => {
      if (options?.initialQuery !== undefined) {
        setQuery(options.initialQuery)
      }
      if (options?.category !== undefined) {
        setCategory(options.category)
      }
      setActiveIndex(0)
      setIsOpen(true)
    },
    []
  )

  const closeSearch = useCallback(() => {
    setIsOpen(false)
  }, [])

  // Close modal automatically on route change
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname, location.search])

  // Global keyboard shortcut: Cmd/Ctrl + K or "/" outside of inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
        return
      }
      if (
        e.key === '/' &&
        !isOpen &&
        document.activeElement &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(
          document.activeElement.tagName
        ) &&
        !(document.activeElement as HTMLElement).isContentEditable
      ) {
        e.preventDefault()
        setIsOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const id = window.setTimeout(() => {
        inputRef.current?.focus()
      }, 40)
      return () => window.clearTimeout(id)
    }
  }, [isOpen])

  // Compute filtered results across Alumni, Jobs, and Events
  const { alumniMatches, jobMatches, eventMatches, flatResults } =
    useMemo(() => {
      const q = query.trim().toLowerCase()
      const tokens = q.split(/\s+/).filter(Boolean)

      const matchesTokens = (haystack: string) => {
        if (tokens.length === 0) return true
        const lower = haystack.toLowerCase()
        return tokens.every((t) => lower.includes(t))
      }

      const matchedAlumni = GLOBAL_ALUMNI_INDEX.filter((a) =>
        matchesTokens(
          `${a.name} ${a.headline} ${a.company} ${a.graduationYear} ${a.department} ${a.cohortBadge} ${a.location} ${a.country} ${a.skills.join(' ')} ${a.mentoringTrack}`
        )
      )

      const matchedJobs = GLOBAL_JOBS_INDEX.filter((j) =>
        matchesTokens(
          `${j.title} ${j.company} ${j.location} ${j.workplaceLabel} ${j.sectorLabel} ${j.experienceLabel} ${j.referrerName} ${j.referrerCohort} ${j.techStack.join(' ')}`
        )
      )

      const matchedEvents = GLOBAL_EVENTS_INDEX.filter((ev) =>
        matchesTokens(
          `${ev.title} ${ev.category} ${ev.description} ${ev.location} ${ev.chapterLabel} ${ev.dateDisplay} ${ev.isVirtual ? 'virtual online' : 'in-person campus'}`
        )
      )

      let combined: GlobalSearchResultItem[] = []
      if (category === 'ALL') {
        combined = [
          ...matchedAlumni.slice(0, q ? 6 : 3),
          ...matchedJobs.slice(0, q ? 6 : 3),
          ...matchedEvents.slice(0, q ? 5 : 3),
        ]
      } else if (category === 'ALUMNI') {
        combined = matchedAlumni
      } else if (category === 'JOBS') {
        combined = matchedJobs
      } else if (category === 'EVENTS') {
        combined = matchedEvents
      }

      return {
        alumniMatches: matchedAlumni,
        jobMatches: matchedJobs,
        eventMatches: matchedEvents,
        flatResults: combined,
      }
    }, [query, category])

  // Keep activeIndex in bounds
  useEffect(() => {
    setActiveIndex(0)
  }, [query, category])

  const activeItem: GlobalSearchResultItem | undefined =
    flatResults[activeIndex] ?? flatResults[0]

  const handleSelectResult = useCallback(
    (item: GlobalSearchResultItem) => {
      setIsOpen(false)
      navigate(item.route)
    },
    [navigate]
  )

  // Keyboard navigation inside modal
  useEffect(() => {
    if (!isOpen) return

    const handleModalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setIsOpen(false)
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (flatResults.length > 0) {
          setActiveIndex((prev) => (prev + 1) % flatResults.length)
        }
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (flatResults.length > 0) {
          setActiveIndex(
            (prev) => (prev - 1 + flatResults.length) % flatResults.length
          )
        }
        return
      }
      if (e.key === 'Enter' && activeItem) {
        e.preventDefault()
        handleSelectResult(activeItem)
      }
    }

    window.addEventListener('keydown', handleModalKeyDown)
    return () => window.removeEventListener('keydown', handleModalKeyDown)
  }, [isOpen, flatResults.length, activeItem, handleSelectResult])

  const countsByCategory: Record<GlobalSearchCategory, number> = {
    ALL: alumniMatches.length + jobMatches.length + eventMatches.length,
    ALUMNI: alumniMatches.length,
    JOBS: jobMatches.length,
    EVENTS: eventMatches.length,
  }

  return (
    <GlobalSearchContext.Provider
      value={{
        isOpen,
        query,
        category,
        openSearch,
        closeSearch,
        setQuery,
        setCategory,
      }}
    >
      {children}

      {/* Global Search Command Palette Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-start justify-center px-3 sm:px-6 pt-12 sm:pt-20 pb-6"
            role="dialog"
            aria-modal="true"
            aria-label="Global Platform Search"
          >
            {/* Animated Glass Backdrop */}
            <motion.div
              key="global-search-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeSearch}
              className="fixed inset-0 bg-foreground/45 dark:bg-black/75 backdrop-blur-md"
            />

            {/* Animated Search Dialog Container */}
            <motion.div
              key="global-search-dialog"
              initial={{ opacity: 0, y: -18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{
                type: 'spring',
                stiffness: 330,
                damping: 28,
                mass: 0.85,
              }}
              className="relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-card text-foreground shadow-[0_28px_70px_-15px_rgba(9,20,34,0.35)] dark:shadow-[0_32px_80px_-12px_rgba(0,0,0,0.85)] ring-1 ring-white/20 dark:ring-white/10"
            >
              {/* Top Search Input Bar */}
              <div className="relative flex items-center gap-3 border-b border-border/80 bg-background/70 dark:bg-background/50 px-4 sm:px-6 py-3.5 sm:py-4">
                <motion.div
                  animate={{
                    scale: query ? 1.08 : 1,
                    rotate: query ? -6 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 360, damping: 20 }}
                  className="text-primary dark:text-accent shrink-0"
                >
                  <Search className="h-5 w-5" />
                </motion.div>

                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search alumni by name or cohort, job referrals, or chapter events..."
                  aria-label="Search alumni, job listings, or events"
                  className="w-full bg-transparent text-sm sm:text-base font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
                />

                <AnimatePresence>
                  {query && (
                    <motion.button
                      key="clear-query"
                      type="button"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => {
                        setQuery('')
                        inputRef.current?.focus()
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-stone px-2.5 py-1 text-xs font-medium text-secondary hover:text-foreground transition-colors shrink-0"
                    >
                      <X className="h-3.5 w-3.5" />
                      Clear
                    </motion.button>
                  )}
                </AnimatePresence>

                <button
                  type="button"
                  onClick={closeSearch}
                  aria-label="Close global search"
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-mono font-semibold text-secondary hover:text-foreground hover:bg-stone transition-colors shrink-0"
                >
                  ESC
                </button>
              </div>

              {/* Animated Category Filter Tabs + Quick Suggestions */}
              <div className="border-b border-border/70 bg-stone/40 dark:bg-stone/25 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
                <LayoutGroup id="global-search-tabs">
                  <div
                    role="tablist"
                    aria-label="Search result categories"
                    className="flex flex-wrap items-center gap-1.5"
                  >
                    {CATEGORY_TABS.map((tab) => {
                      const isActive = category === tab.id
                      const count = countsByCategory[tab.id]
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          onClick={() => setCategory(tab.id)}
                          className={`relative inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-colors ${
                            isActive
                              ? 'text-white dark:text-primary-foreground'
                              : 'text-secondary hover:text-foreground'
                          }`}
                        >
                          {isActive && (
                            <motion.span
                              layoutId="globalSearchActiveTabPill"
                              transition={{
                                type: 'spring',
                                stiffness: 380,
                                damping: 30,
                              }}
                              className="absolute inset-0 rounded-xl bg-primary shadow-sm"
                            />
                          )}
                          <span className="relative z-10">{tab.label}</span>
                          <span
                            className={`relative z-10 font-mono text-[11px] tabular-nums px-1.5 py-0.5 rounded-md ${
                              isActive
                                ? 'bg-white/20 text-white dark:bg-black/20 dark:text-primary-foreground'
                                : 'bg-card text-secondary border border-border/70'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </LayoutGroup>

                {/* Quick Filter Chips when query is empty */}
                <div className="hidden lg:flex items-center gap-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-secondary mr-1">
                    Try:
                  </span>
                  {QUICK_SUGGESTIONS.slice(0, 3).map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => {
                        setQuery(chip.query)
                        setCategory(chip.category)
                        inputRef.current?.focus()
                      }}
                      className="rounded-lg border border-border/80 bg-card px-2.5 py-1 text-xs font-medium text-secondary hover:text-primary dark:hover:text-accent hover:border-primary/40 transition-colors"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Body: Results List (Left) + Live Dossier Preview (Right on md+) */}
              <div className="grid grid-cols-1 md:grid-cols-12 max-h-[68vh] min-h-[360px] divide-y md:divide-y-0 md:divide-x divide-border/80">
                {/* Left Column: Animated Result Rows */}
                <div className="md:col-span-7 overflow-y-auto p-3 sm:p-4 space-y-1.5">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {flatResults.length > 0 ? (
                      <LayoutGroup id="global-search-results">
                        {flatResults.map((item, idx) => {
                          const isSelected = idx === activeIndex
                          return (
                            <motion.button
                              key={`${item.type}-${item.id}`}
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.98 }}
                              transition={{
                                type: 'spring',
                                stiffness: 320,
                                damping: 28,
                              }}
                              type="button"
                              onMouseEnter={() => setActiveIndex(idx)}
                              onClick={() => handleSelectResult(item)}
                              className="relative w-full text-left rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3.5 transition-colors focus:outline-none"
                            >
                              {isSelected && (
                                <motion.div
                                  layoutId="globalSearchRowHighlight"
                                  transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 32,
                                  }}
                                  className="absolute inset-0 rounded-2xl bg-primary/10 dark:bg-primary/20 border border-primary/30 dark:border-accent/35"
                                />
                              )}

                              <div className="relative z-10 flex items-center gap-3.5 min-w-0">
                                {/* Category Avatar / Thumbnail */}
                                {item.type === 'ALUMNI' && (
                                  <img
                                    src={item.avatar}
                                    alt={item.name}
                                    className="h-11 w-11 rounded-full object-cover ring-1 ring-border shrink-0"
                                  />
                                )}
                                {item.type === 'JOBS' && (
                                  <img
                                    src={item.companyLogoUrl}
                                    alt={item.company}
                                    referrerPolicy="no-referrer"
                                    className="h-11 w-11 rounded-xl object-cover ring-1 ring-border shrink-0"
                                  />
                                )}
                                {item.type === 'EVENTS' && (
                                  <div className="h-11 w-11 rounded-xl bg-primary/12 dark:bg-primary/25 border border-primary/25 flex items-center justify-center text-primary dark:text-accent shrink-0">
                                    <Calendar className="h-5 w-5" />
                                  </div>
                                )}

                                <div className="min-w-0 space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-stone text-primary dark:text-accent border border-border/70 shrink-0">
                                      {item.type === 'ALUMNI'
                                        ? 'Alumni'
                                        : item.type === 'JOBS'
                                          ? 'Referral'
                                          : 'Event'}
                                    </span>
                                    <p className="text-sm sm:text-base font-bold text-foreground truncate">
                                      {item.type === 'ALUMNI'
                                        ? item.name
                                        : item.title}
                                    </p>
                                  </div>

                                  <p className="text-xs text-secondary truncate">
                                    {item.type === 'ALUMNI' &&
                                      `${item.headline} · ${item.location}`}
                                    {item.type === 'JOBS' &&
                                      `${item.company} · ${item.location} · ${item.compensationDisplay}`}
                                    {item.type === 'EVENTS' &&
                                      `${item.dateDisplay} · ${item.chapterLabel}`}
                                  </p>
                                </div>
                              </div>

                              <div className="relative z-10 flex items-center gap-1.5 shrink-0">
                                <span
                                  className={`text-xs font-mono font-semibold transition-colors ${
                                    isSelected
                                      ? 'text-primary dark:text-accent'
                                      : 'text-secondary'
                                  }`}
                                >
                                  Open
                                </span>
                                <ArrowUpRight
                                  className={`h-4 w-4 transition-transform ${
                                    isSelected
                                      ? 'text-primary dark:text-accent translate-x-0.5 -translate-y-0.5'
                                      : 'text-secondary'
                                  }`}
                                />
                              </div>
                            </motion.button>
                          )
                        })}
                      </LayoutGroup>
                    ) : (
                      <motion.div
                        key="no-global-results"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="py-12 px-4 text-center space-y-4"
                      >
                        <div className="mx-auto h-12 w-12 rounded-2xl bg-stone flex items-center justify-center text-secondary">
                          <Search className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-base font-bold text-foreground">
                            No matches found for “{query}”
                          </p>
                          <p className="text-xs sm:text-sm text-secondary max-w-sm mx-auto">
                            Try searching for a graduation year (e.g. 2019), skill
                            (Kubernetes, FinTech), city (Karachi, Dubai, Munich),
                            or event topic.
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                          {QUICK_SUGGESTIONS.map((chip) => (
                            <button
                              key={chip.label}
                              type="button"
                              onClick={() => {
                                setQuery(chip.query)
                                setCategory(chip.category)
                              }}
                              className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary transition-colors"
                            >
                              {chip.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Right Column: Animated Live Dossier Preview (Visible on md+) */}
                <div className="hidden md:flex md:col-span-5 flex-col justify-between bg-background/50 dark:bg-background/35 p-5 sm:p-6 overflow-y-auto">
                  <AnimatePresence mode="wait">
                    {activeItem ? (
                      <motion.div
                        key={`preview-${activeItem.type}-${activeItem.id}`}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-5"
                      >
                        {/* ALUMNI PREVIEW */}
                        {activeItem.type === 'ALUMNI' && (
                          <>
                            <div className="flex items-start gap-4">
                              <img
                                src={activeItem.avatar}
                                alt={activeItem.name}
                                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-primary/30 shrink-0"
                              />
                              <div className="min-w-0 space-y-1">
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider font-semibold text-primary dark:text-accent">
                                  <Users className="h-3.5 w-3.5" />
                                  Verified Alumnus
                                </span>
                                <h3 className="font-display text-xl font-bold text-foreground leading-snug">
                                  {activeItem.name}
                                </h3>
                                <p className="text-xs sm:text-sm font-medium text-secondary">
                                  {activeItem.headline}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2.5 border-y border-border/70 py-4 text-xs sm:text-sm">
                              <div className="flex items-center gap-2 text-foreground">
                                <GraduationCap className="h-4 w-4 text-primary dark:text-accent shrink-0" />
                                <span className="font-medium">
                                  {activeItem.cohortBadge}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-secondary">
                                <MapPin className="h-4 w-4 text-primary dark:text-accent shrink-0" />
                                <span>{activeItem.location}</span>
                              </div>
                              <div className="flex items-center gap-2 text-secondary">
                                <Sparkles className="h-4 w-4 text-primary dark:text-accent shrink-0" />
                                <span>Track: {activeItem.mentoringTrack}</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-[11px] font-mono uppercase tracking-wider text-secondary font-semibold">
                                Domain Expertise
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {activeItem.skills.map((skill) => (
                                  <span
                                    key={skill}
                                    className="rounded-lg bg-stone px-2.5 py-1 text-xs font-medium text-foreground border border-border/60"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="pt-2 flex flex-col gap-2">
                              <button
                                type="button"
                                onClick={() => handleSelectResult(activeItem)}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-primary/90 transition-colors shadow-sm"
                              >
                                View in Alumni Directory
                                <ArrowRight className="h-4 w-4" />
                              </button>
                              {activeItem.availableForMentorship && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsOpen(false)
                                    navigate('/mentorship')
                                  }}
                                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-stone transition-colors"
                                >
                                  Request 1-on-1 Mentorship
                                </button>
                              )}
                            </div>
                          </>
                        )}

                        {/* JOB REFERRAL PREVIEW */}
                        {activeItem.type === 'JOBS' && (
                          <>
                            <div className="flex items-start gap-4">
                              <img
                                src={activeItem.companyLogoUrl}
                                alt={activeItem.company}
                                referrerPolicy="no-referrer"
                                className="h-14 w-14 rounded-2xl object-cover ring-1 ring-border shrink-0"
                              />
                              <div className="min-w-0 space-y-1">
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider font-semibold text-primary dark:text-accent">
                                  <Briefcase className="h-3.5 w-3.5" />
                                  {activeItem.sectorLabel}
                                </span>
                                <h3 className="font-display text-lg font-bold text-foreground leading-snug">
                                  {activeItem.title}
                                </h3>
                                <p className="text-xs sm:text-sm font-medium text-secondary">
                                  {activeItem.company} · {activeItem.workplaceLabel}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2.5 border-y border-border/70 py-4 text-xs sm:text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-secondary">Compensation</span>
                                <span className="font-mono font-bold text-primary dark:text-accent">
                                  {activeItem.compensationDisplay}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-secondary">Location</span>
                                <span className="font-medium text-foreground">
                                  {activeItem.location}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-secondary">Alumni Referrer</span>
                                <span className="font-medium text-foreground">
                                  {activeItem.referrerName} ({activeItem.referrerCohort})
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-secondary">Review SLA</span>
                                <span className="inline-flex items-center gap-1 font-mono text-xs text-primary dark:text-accent">
                                  <Clock className="h-3.5 w-3.5" />
                                  ~{activeItem.referralTurnaroundHours}h turnaround
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-[11px] font-mono uppercase tracking-wider text-secondary font-semibold">
                                Core Tech & Domain Stack
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {activeItem.techStack.map((tech) => (
                                  <span
                                    key={tech}
                                    className="rounded-lg bg-stone px-2.5 py-1 text-xs font-mono text-foreground border border-border/60"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="pt-2">
                              <button
                                type="button"
                                onClick={() => handleSelectResult(activeItem)}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-primary/90 transition-colors shadow-sm"
                              >
                                View Role & Request Referral
                                <ArrowRight className="h-4 w-4" />
                              </button>
                            </div>
                          </>
                        )}

                        {/* EVENT PREVIEW */}
                        {activeItem.type === 'EVENTS' && (
                          <>
                            <div className="space-y-2">
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider font-semibold text-primary dark:text-accent">
                                <Calendar className="h-3.5 w-3.5" />
                                {activeItem.category} · {activeItem.chapterLabel}
                              </span>
                              <h3 className="font-display text-lg font-bold text-foreground leading-snug">
                                {activeItem.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                                {activeItem.description}
                              </p>
                            </div>

                            <div className="space-y-2.5 border-y border-border/70 py-4 text-xs sm:text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-secondary">Date & Time</span>
                                <span className="font-mono font-semibold text-foreground">
                                  {activeItem.dateDisplay} · {activeItem.timeDisplay}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-secondary shrink-0">Venue</span>
                                <span className="font-medium text-foreground text-right truncate">
                                  {activeItem.location}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-secondary">Attendance</span>
                                <span className="font-mono font-semibold text-primary dark:text-accent">
                                  {activeItem.registeredCount} / {activeItem.capacity} RSVP’d
                                </span>
                              </div>
                            </div>

                            <div className="pt-2">
                              <button
                                type="button"
                                onClick={() => handleSelectResult(activeItem)}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-primary/90 transition-colors shadow-sm"
                              >
                                View Event Details & RSVP
                                <ArrowRight className="h-4 w-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </motion.div>
                    ) : (
                      <div className="py-12 text-center text-xs text-secondary">
                        Select a result to inspect its verified Sukkur IBA dossier.
                      </div>
                    )}
                  </AnimatePresence>

                  {/* Quick Directory / Hub Links at bottom of preview */}
                  <div className="pt-4 border-t border-border/70 flex items-center justify-between text-xs text-secondary">
                    <span>Explore full hubs:</span>
                    <div className="flex items-center gap-3 font-semibold text-primary dark:text-accent">
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false)
                          navigate('/alumni')
                        }}
                        className="hover:underline"
                      >
                        Directory
                      </button>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false)
                          navigate('/jobs')
                        }}
                        className="hover:underline"
                      >
                        Jobs
                      </button>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false)
                          navigate('/events')
                        }}
                        className="hover:underline"
                      >
                        Events
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Keyboard Navigation Legend */}
              <div className="border-t border-border/80 bg-stone/60 dark:bg-stone/35 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-secondary">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5">
                    <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
                      ↑↓
                    </kbd>
                    Navigate
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <kbd className="inline-flex items-center rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
                      <CornerDownLeft className="h-2.5 w-2.5 mr-0.5" /> Enter
                    </kbd>
                    Open Dossier
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1.5">
                    <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
                      ESC
                    </kbd>
                    Dismiss
                  </span>
                </div>
                <span>
                  Indexing {GLOBAL_ALUMNI_INDEX.length} featured alumni ·{' '}
                  {GLOBAL_JOBS_INDEX.length} active referrals ·{' '}
                  {GLOBAL_EVENTS_INDEX.length} chapter events
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </GlobalSearchContext.Provider>
  )
}

/**
 * Trigger button / interactive search bar that can be placed in any navigation header
 * (`FloatingHeader`, `MainNav`, `DashboardPage`, `AlumniDirectoryPage`, `EventsHubPage`, `JobsPage`).
 */
export function GlobalSearchTrigger({
  compact = false,
  placeholder = 'Search alumni, jobs, events...',
  className = '',
}: {
  compact?: boolean
  placeholder?: string
  className?: string
}) {
  const { openSearch } = useGlobalSearch()

  return (
    <motion.button
      type="button"
      onClick={() => openSearch()}
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 360, damping: 24 }}
      aria-label="Open global platform search (Command+K)"
      className={`group inline-flex items-center justify-between gap-2.5 rounded-xl border border-border/90 bg-card/85 dark:bg-card/80 hover:bg-stone/80 dark:hover:bg-stone/60 hover:border-primary/40 dark:hover:border-accent/40 text-secondary hover:text-foreground transition-colors shadow-xs ${
        compact
          ? 'px-2.5 sm:px-3 py-1.5 text-xs'
          : 'px-3 sm:px-3.5 py-2 text-xs sm:text-sm min-w-[40px] sm:min-w-[210px] lg:min-w-[250px]'
      } ${className}`}
    >
      <span className="flex items-center gap-2 min-w-0">
        <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary dark:text-accent shrink-0 transition-transform group-hover:scale-110" />
        <span
          className={`truncate font-normal text-secondary group-hover:text-foreground transition-colors ${
            compact ? 'hidden lg:inline' : 'hidden sm:inline'
          }`}
        >
          {placeholder}
        </span>
      </span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-border bg-background/80 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-secondary group-hover:text-primary dark:group-hover:text-accent shrink-0">
        ⌘K
      </kbd>
    </motion.button>
  )
}

/**
 * Full-width inline interactive Global Search Bar with live Framer Motion dropdown
 * results and category tabs for placement on Dashboard or hub headers.
 */
export function InlineGlobalSearchBar({
  className = '',
}: {
  className?: string
}) {
  const navigate = useNavigate()
  const { openSearch } = useGlobalSearch()
  const [inlineQuery, setInlineQuery] = useState('')
  const [inlineCategory, setInlineCategory] =
    useState<GlobalSearchCategory>('ALL')
  const [isFocused, setIsFocused] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const quickResults = useMemo(() => {
    const q = inlineQuery.trim().toLowerCase()
    const tokens = q.split(/\s+/).filter(Boolean)
    const match = (text: string) =>
      tokens.length === 0 ||
      tokens.every((t) => text.toLowerCase().includes(t))

    const alumni = GLOBAL_ALUMNI_INDEX.filter((a) =>
      match(
        `${a.name} ${a.headline} ${a.company} ${a.graduationYear} ${a.department} ${a.location} ${a.skills.join(' ')}`
      )
    )
    const jobs = GLOBAL_JOBS_INDEX.filter((j) =>
      match(
        `${j.title} ${j.company} ${j.location} ${j.sectorLabel} ${j.workplaceLabel} ${j.techStack.join(' ')}`
      )
    )
    const events = GLOBAL_EVENTS_INDEX.filter((ev) =>
      match(
        `${ev.title} ${ev.category} ${ev.location} ${ev.chapterLabel} ${ev.dateDisplay}`
      )
    )

    if (inlineCategory === 'ALUMNI') return alumni.slice(0, 5)
    if (inlineCategory === 'JOBS') return jobs.slice(0, 5)
    if (inlineCategory === 'EVENTS') return events.slice(0, 5)
    return [
      ...alumni.slice(0, 2),
      ...jobs.slice(0, 2),
      ...events.slice(0, 2),
    ]
  }, [inlineQuery, inlineCategory])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <motion.div
        animate={{
          boxShadow: isFocused
            ? '0 18px 42px -12px rgba(13, 110, 91, 0.22)'
            : '0 4px 16px -6px rgba(9, 20, 34, 0.06)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3 transition-colors ${
          isFocused
            ? 'border-primary dark:border-accent ring-2 ring-primary/15 dark:ring-accent/20'
            : 'border-border/90'
        }`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Search className="h-5 w-5 text-primary dark:text-accent shrink-0" />
          <input
            type="text"
            value={inlineQuery}
            onFocus={() => setIsFocused(true)}
            onChange={(e) => {
              setInlineQuery(e.target.value)
              setIsFocused(true)
            }}
            placeholder="Quick search across Sukkur IBA alumni, job referrals, or chapter events..."
            aria-label="Quick global search"
            className="w-full bg-transparent text-sm sm:text-base font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {inlineQuery && (
            <button
              type="button"
              onClick={() => setInlineQuery('')}
              aria-label="Clear search query"
              className="rounded-lg p-1 text-secondary hover:text-foreground hover:bg-stone transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category filter pills + Command Palette button */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-border/60 shrink-0">
          <LayoutGroup id="inline-global-search-tabs">
            <div className="flex items-center gap-1">
              {CATEGORY_TABS.map((tab) => {
                const active = inlineCategory === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setInlineCategory(tab.id)
                      setIsFocused(true)
                    }}
                    className={`relative rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                      active
                        ? 'text-white dark:text-primary-foreground'
                        : 'text-secondary hover:text-foreground'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="inlineGlobalSearchTabPill"
                        transition={{
                          type: 'spring',
                          stiffness: 380,
                          damping: 30,
                        }}
                        className="absolute inset-0 rounded-lg bg-primary"
                      />
                    )}
                    <span className="relative z-10">
                      {tab.id === 'ALL' ? 'All' : tab.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </LayoutGroup>

          <button
            type="button"
            onClick={() =>
              openSearch({
                initialQuery: inlineQuery,
                category: inlineCategory,
              })
            }
            className="hidden md:inline-flex items-center gap-1 rounded-lg border border-border bg-stone/70 px-2.5 py-1 text-[11px] font-mono font-semibold text-foreground hover:border-primary/40 transition-colors ml-1"
          >
            Full View ⌘K
          </button>
        </div>
      </motion.div>

      {/* Animated Instant Dropdown Results */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            key="inline-search-dropdown"
            initial={{ opacity: 0, y: 8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.99 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-[0_24px_54px_-12px_rgba(9,20,34,0.28)] dark:shadow-[0_26px_60px_-12px_rgba(0,0,0,0.85)]"
          >
            <div className="p-3 sm:p-4 space-y-1.5 max-h-[360px] overflow-y-auto">
              {quickResults.length > 0 ? (
                quickResults.map((item) => (
                  <motion.button
                    key={`inline-${item.type}-${item.id}`}
                    layout
                    type="button"
                    onClick={() => {
                      setIsFocused(false)
                      navigate(item.route)
                    }}
                    className="w-full text-left rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-3 hover:bg-stone/80 dark:hover:bg-stone/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-stone text-primary dark:text-accent border border-border/70 shrink-0">
                        {item.type === 'ALUMNI'
                          ? 'Alumni'
                          : item.type === 'JOBS'
                            ? 'Job'
                            : 'Event'}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground group-hover:text-primary dark:group-hover:text-accent transition-colors truncate">
                          {item.type === 'ALUMNI' ? item.name : item.title}
                        </p>
                        <p className="text-xs text-secondary truncate">
                          {item.type === 'ALUMNI' &&
                            `${item.headline} · ${item.cohortBadge}`}
                          {item.type === 'JOBS' &&
                            `${item.company} · ${item.location} · ${item.compensationDisplay}`}
                          {item.type === 'EVENTS' &&
                            `${item.dateDisplay} · ${item.location}`}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-secondary group-hover:text-primary dark:group-hover:text-accent shrink-0" />
                  </motion.button>
                ))
              ) : (
                <div className="py-6 text-center text-xs sm:text-sm text-secondary">
                  No direct matches for “{inlineQuery}”.
                </div>
              )}
            </div>

            <div className="border-t border-border/70 bg-stone/50 dark:bg-stone/30 px-4 py-2.5 flex items-center justify-between text-xs">
              <span className="text-secondary">
                Press <kbd className="font-mono font-semibold text-foreground">⌘K</kbd> for split dossier preview
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsFocused(false)
                  openSearch({
                    initialQuery: inlineQuery,
                    category: inlineCategory,
                  })
                }}
                className="font-mono font-semibold text-primary dark:text-accent hover:underline"
              >
                Open Full Command Search →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

