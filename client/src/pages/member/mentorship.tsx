import { RoleSwitcherStrip } from '@/components/layout/role-shell'
import { Input, SelectField } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { GlobalSearchTrigger } from '@/components/ui/global-search-bar'
import { MentorFilterSystem } from '@/components/ui/mentor-filter-system'
import {
  MENTORS_CATALOG,
  MENTORSHIP_GOALS,
  MENTORSHIP_TRACKS,
  MENTOR_EXPERTISE_TOPICS,
  MENTOR_INDUSTRIES,
  computeMentorMatchScore,
  loadEnrolledTrackIds,
  loadMentorshipRequests,
  loadShortlistedMentorIds,
  saveEnrolledTrackIds,
  saveMentorshipRequests,
  saveShortlistedMentorIds,
  type MentorAvailabilityFilter,
  type MentorRecord,
  type MentorshipGoalId,
  type StoredMentorshipRequest,
} from '@/lib/mentorship-data'
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Bookmark,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Code2,
  Compass,
  Globe2,
  GraduationCap,
  Layers,
  MapPin,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  UserCheck,
  Users,
  Video,
  X,
} from 'lucide-react'
import { useState, useMemo, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  type Variants,
} from 'framer-motion'
import { toast } from '@/lib/toast'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.03 },
  },
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 240, damping: 26 },
  },
}

const MENTOR_PORTRAITS: Record<string, string> = {
  '1': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=480&q=80',
  '2': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=480&q=80',
  '3': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=480&q=80',
  '4': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=480&q=80',
  '5': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=480&q=80',
  '6': 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=480&q=80',
  'm-1': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=480&q=80',
  'm-2': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=480&q=80',
  'm-3': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=480&q=80',
  'm-4': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=480&q=80',
  'm-5': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=480&q=80',
  'm-6': 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=480&q=80',
}

type MentorSortMode = 'AFFINITY' | 'RATING' | 'SESSIONS' | 'OPEN_SLOTS'

interface MyMentorProfileState {
  headline: string
  bio: string
  expertise: string[]
  industries: string[]
  maxMentees: number
  currentMentees: number
  isAvailable: boolean
  meetingFrequency: string
  preferredFormat: string
}

export function MentorshipProgramPage() {
  const navigate = useNavigate()

  // Goal matcher & interactive multi-facet filter state
  const [selectedGoal, setSelectedGoal] = useState<MentorshipGoalId>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [availabilityFilter, setAvailabilityFilter] =
    useState<MentorAvailabilityFilter>('ALL')
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([])
  const [selectedChapter, setSelectedChapter] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<MentorSortMode>('AFFINITY')
  const [expandedMentorId, setExpandedMentorId] = useState<string | null>(
    MENTORS_CATALOG[0]?.id ?? '1',
  )

  // Persisted state
  const [shortlistedIds, setShortlistedIds] = useState<string[]>(() =>
    loadShortlistedMentorIds(),
  )
  const [enrolledTrackIds, setEnrolledTrackIds] = useState<string[]>(() =>
    loadEnrolledTrackIds(),
  )
  const [requests, setRequests] = useState<StoredMentorshipRequest[]>(() =>
    loadMentorshipRequests(),
  )

  // Active curriculum track tab
  const [activeTrackId, setActiveTrackId] = useState<string>(
    MENTORSHIP_TRACKS[0].id,
  )

  // Booking Modal state
  const [bookingMentor, setBookingMentor] = useState<MentorRecord | null>(null)
  const [bookingMode, setBookingMode] = useState<'OFFICE_HOURS' | 'LONG_TERM'>(
    'OFFICE_HOURS',
  )
  const [selectedSlotId, setSelectedSlotId] = useState<string>('')
  const [bookingGoalText, setBookingGoalText] = useState<string>('')
  const [bookingFocusArea, setBookingFocusArea] = useState<string>(
    'System Design & Architecture Review',
  )

  // Member's own mentor profile studio state
  const [isEditingMyProfile, setIsEditingMyProfile] = useState(false)
  const [myProfile, setMyProfile] = useState<MyMentorProfileState>({
    headline: 'Senior Software Engineer · Systems Architecture Mentor',
    bio: 'Helping Sukkur IBA computer science graduates navigate distributed backend engineering, technical interviews, and early-career promotions.',
    expertise: [
      'Distributed Systems',
      'TypeScript & Node.js',
      'Career Rubric Calibration',
    ],
    industries: ['Enterprise SaaS', 'FinTech'],
    maxMentees: 3,
    currentMentees: 1,
    isAvailable: true,
    meetingFrequency: 'Bi-weekly · 45 min',
    preferredFormat: 'Video Call & Async RFC Review',
  })

  const chapters = useMemo(() => {
    const unique = Array.from(new Set(MENTORS_CATALOG.map((m) => m.chapter)))
    return ['ALL', ...unique]
  }, [])

  const industryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const industry of MENTOR_INDUSTRIES) {
      counts[industry] = MENTORS_CATALOG.filter((m) =>
        m.industries.includes(industry),
      ).length
    }
    return counts
  }, [])

  const expertiseCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const topic of MENTOR_EXPERTISE_TOPICS) {
      counts[topic] = MENTORS_CATALOG.filter((m) =>
        m.expertise.includes(topic),
      ).length
    }
    return counts
  }, [])

  const availabilityCounts = useMemo<
    Record<MentorAvailabilityFilter, number>
  >(() => {
    return {
      ALL: MENTORS_CATALOG.length,
      AVAILABLE: MENTORS_CATALOG.filter((m) => m.isAvailable).length,
      WAITLIST: MENTORS_CATALOG.filter((m) => !m.isAvailable).length,
      SHORTLISTED: MENTORS_CATALOG.filter((m) =>
        shortlistedIds.includes(m.id),
      ).length,
    }
  }, [shortlistedIds])

  const filteredMentors = useMemo(() => {
    return MENTORS_CATALOG.map((mentor) => ({
      mentor,
      matchScore: computeMentorMatchScore(
        mentor,
        selectedGoal,
        searchQuery,
        selectedIndustries,
        selectedExpertise,
      ),
    }))
      .filter(({ mentor }) => {
        if (availabilityFilter === 'AVAILABLE' && !mentor.isAvailable)
          return false
        if (availabilityFilter === 'WAITLIST' && mentor.isAvailable)
          return false
        if (
          availabilityFilter === 'SHORTLISTED' &&
          !shortlistedIds.includes(mentor.id)
        )
          return false
        if (selectedChapter !== 'ALL' && mentor.chapter !== selectedChapter)
          return false
        if (selectedGoal !== 'ALL') {
          if (!mentor.goalAffinities.includes(selectedGoal)) return false
        }
        if (selectedIndustries.length > 0) {
          const matchesIndustry = selectedIndustries.some((ind) =>
            mentor.industries.includes(ind),
          )
          if (!matchesIndustry) return false
        }
        if (selectedExpertise.length > 0) {
          const matchesExp = selectedExpertise.some((exp) =>
            mentor.expertise.includes(exp),
          )
          if (!matchesExp) return false
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const haystack = [
            mentor.name,
            mentor.headline,
            mentor.company,
            mentor.location,
            mentor.chapter,
            mentor.featuredTopic,
            ...mentor.expertise,
            ...mentor.industries,
          ]
            .join(' ')
            .toLowerCase()
          if (!haystack.includes(q)) return false
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'RATING') {
          return b.mentor.avgRating - a.mentor.avgRating
        }
        if (sortBy === 'SESSIONS') {
          return b.mentor.sessionsCompleted - a.mentor.sessionsCompleted
        }
        if (sortBy === 'OPEN_SLOTS') {
          const slotsA = a.mentor.isAvailable
            ? Math.max(0, a.mentor.maxMentees - a.mentor.currentMentees)
            : 0
          const slotsB = b.mentor.isAvailable
            ? Math.max(0, b.mentor.maxMentees - b.mentor.currentMentees)
            : 0
          return slotsB - slotsA
        }
        if (a.mentor.isAvailable !== b.mentor.isAvailable) {
          return a.mentor.isAvailable ? -1 : 1
        }
        return b.matchScore - a.matchScore
      })
  }, [
    selectedGoal,
    searchQuery,
    availabilityFilter,
    selectedIndustries,
    selectedExpertise,
    selectedChapter,
    shortlistedIds,
    sortBy,
  ])

  const openSlotsTotal = useMemo(() => {
    return filteredMentors.reduce((acc, { mentor }) => {
      if (!mentor.isAvailable) return acc
      return acc + Math.max(0, mentor.maxMentees - mentor.currentMentees)
    }, 0)
  }, [filteredMentors])

  const handleToggleIndustry = (industry: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry)
        ? prev.filter((item) => item !== industry)
        : [...prev, industry],
    )
  }

  const handleToggleExpertise = (topic: string) => {
    setSelectedExpertise((prev) =>
      prev.includes(topic)
        ? prev.filter((item) => item !== topic)
        : [...prev, topic],
    )
  }

  const activeGoalMeta = useMemo(
    () =>
      MENTORSHIP_GOALS.find((g) => g.id === selectedGoal) ??
      MENTORSHIP_GOALS[0],
    [selectedGoal],
  )

  const activeTrack = useMemo(
    () =>
      MENTORSHIP_TRACKS.find((t) => t.id === activeTrackId) ??
      MENTORSHIP_TRACKS[0],
    [activeTrackId],
  )

  const handleToggleShortlist = (mentor: MentorRecord) => {
    const exists = shortlistedIds.includes(mentor.id)
    const updated = exists
      ? shortlistedIds.filter((id) => id !== mentor.id)
      : [...shortlistedIds, mentor.id]
    setShortlistedIds(updated)
    saveShortlistedMentorIds(updated)
    toast({
      title: exists ? 'Removed from Shortlist' : 'Saved to Mentor Shortlist',
      description: exists
        ? `${mentor.name} was removed from your saved mentors.`
        : `${mentor.name} added to your shortlist for comparison.`,
    })
  }

  const handleOpenBookingModal = (
    mentor: MentorRecord,
    defaultMode: 'OFFICE_HOURS' | 'LONG_TERM' = 'OFFICE_HOURS',
  ) => {
    setBookingMentor(mentor)
    setBookingMode(defaultMode)
    setSelectedSlotId(mentor.officeHoursSlots[0]?.id ?? '')
    setBookingFocusArea(mentor.expertise[0] ?? 'Career & Architecture Review')
    setBookingGoalText('')
  }

  const handleSubmitBooking = (e: FormEvent) => {
    e.preventDefault()
    if (!bookingMentor) return

    const trimmedGoal = bookingGoalText.trim()
    if (!trimmedGoal) {
      toast.error('Please share a brief note on what you want to cover.')
      return
    }

    const chosenSlot = bookingMentor.officeHoursSlots.find(
      (s) => s.id === selectedSlotId,
    )

    const newRequest: StoredMentorshipRequest = {
      id: `req-${Date.now()}`,
      mentorId: bookingMentor.id,
      mentorName: bookingMentor.name,
      mentorHeadline: bookingMentor.headline,
      menteeName: 'Zainab Magsi (BSCS ’26)',
      mode: bookingMode,
      status: 'PENDING',
      goal: `${bookingFocusArea}: ${trimmedGoal}`,
      slotLabel:
        bookingMode === 'OFFICE_HOURS' && chosenSlot
          ? `${chosenSlot.dayLabel} · ${chosenSlot.timeLabel} (${chosenSlot.format})`
          : undefined,
      requestedAt: new Date().toISOString().slice(0, 10),
      startedAt: null,
      meetingCount: 0,
      lastMeeting: null,
      duration:
        bookingMode === 'OFFICE_HOURS'
          ? '45-min 1-on-1 Office Hours'
          : `6-Month Mentorship (${bookingMentor.meetingFrequency})`,
      notes: [
        `Requested ${bookingMode === 'OFFICE_HOURS' ? '1-on-1 Office Hours' : '6-Month Mentorship'} focusing on ${bookingFocusArea}.`,
      ],
    }

    const updated = [newRequest, ...requests]
    setRequests(updated)
    saveMentorshipRequests(updated)
    setBookingMentor(null)
    setBookingGoalText('')

    toast({
      title:
        bookingMode === 'OFFICE_HOURS'
          ? '1-on-1 Session Requested'
          : 'Mentorship Application Sent',
      description: `${bookingMentor.name} will confirm within ${bookingMentor.responseWindow.toLowerCase()}. View status in My Relationships.`,
      variant: 'success',
    })
  }

  const handleToggleTrackEnrollment = (trackId: string, trackTitle: string) => {
    const isEnrolled = enrolledTrackIds.includes(trackId)
    const updated = isEnrolled
      ? enrolledTrackIds.filter((id) => id !== trackId)
      : [...enrolledTrackIds, trackId]
    setEnrolledTrackIds(updated)
    saveEnrolledTrackIds(updated)
    toast({
      title: isEnrolled
        ? 'Cohort Application Withdrawn'
        : 'Enrolled in Cohort Track',
      description: isEnrolled
        ? `Your spot reservation for ${trackTitle} was released.`
        : `Your application for ${trackTitle} is registered for the upcoming cohort.`,
      variant: isEnrolled ? 'default' : 'success',
    })
  }

  const resetAllFilters = () => {
    setSelectedGoal('ALL')
    setSearchQuery('')
    setAvailabilityFilter('ALL')
    setSelectedIndustries([])
    setSelectedExpertise([])
    setSelectedChapter('ALL')
  }

  const activeRelationshipsCount = requests.filter(
    (r) => r.status === 'ACTIVE' || r.status === 'PENDING',
  ).length

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <RoleSwitcherStrip />

      {/* Top Sticky Editorial Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md shadow-2xs">
        <div className="page-container py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-sm">
            <Link
              to="/"
              className="font-mono text-xs uppercase tracking-wider font-bold text-primary hover:underline"
            >
              AlumniConnect
            </Link>
            <span aria-hidden="true" className="text-border">
              /
            </span>
            <Link
              to="/student"
              className="text-xs font-mono text-secondary hover:text-foreground transition-colors"
            >
              Student & Alumni Hub
            </Link>
            <span aria-hidden="true" className="text-border">
              /
            </span>
            <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Compass className="h-4 w-4 text-primary" />
              Mentorship Guild
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <GlobalSearchTrigger />
            <Link
              to="/mentorship/relationships"
              className="inline-flex items-center gap-2 rounded-xl border border-primary/35 bg-accent px-3.5 py-1.5 text-xs font-mono font-bold text-accent-foreground hover:border-primary transition-colors"
            >
              <Users className="h-3.5 w-3.5 text-primary" />
              <span>My Relationships</span>
              <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground tabular-nums">
                {activeRelationshipsCount}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setMyProfile((prev) => {
                  const next = !prev.isAvailable
                  toast({
                    title: next
                      ? 'Mentor Status: Accepting Mentees'
                      : 'Mentor Status: Paused',
                    description: next
                      ? 'Your profile is visible to scholars seeking 1-on-1 guidance.'
                      : 'New incoming mentorship requests are temporarily paused.',
                  })
                  return { ...prev, isAvailable: next }
                })
              }}
              className="hidden md:inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-mono font-semibold text-foreground hover:border-primary/40 transition-colors cursor-pointer"
              title="Toggle your mentor availability status"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  myProfile.isAvailable ? 'bg-primary' : 'bg-gold'
                }`}
              />
              <span>
                {myProfile.isAvailable
                  ? 'Mentor Status: Open'
                  : 'Mentor Status: Paused'}
              </span>
            </button>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <motion.main
        className="page-container py-8 sm:py-10 space-y-12 flex-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* SECTION 01: ARCHITECTURAL HERO & INSTITUTIONAL TELEMETRY */}
        <motion.section
          variants={sectionVariants}
          className="rounded-2xl border border-border bg-card shadow-card overflow-hidden"
        >
          {/* Top Accent Banner Strip */}
          <div className="border-b border-border bg-stone/80 px-6 py-3 sm:px-10 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest font-bold text-primary">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>01 · SUKKUR IBA UNIVERSITY · GLOBAL MENTORSHIP GUILD</span>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-accent px-2.5 py-0.5 text-[11px] font-mono font-bold text-accent-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              Zero Platform Fees · Alumni Give-Back Charter
            </span>
          </div>

          <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.6rem] font-bold tracking-tight text-foreground leading-[1.12] text-balance">
                Direct 1-on-1 apprenticeship with Sukkur IBA leaders across{' '}
                <span className="text-primary">four continents.</span>
              </h2>
              <p className="text-sm sm:text-base text-secondary max-w-2xl leading-relaxed">
                Whether you are calibrating a final-year BSCS capstone, preparing for a Staff Engineering loop, pitching a FinTech venture in Dubai, or applying for a DAAD research fellowship in Munich—book structured office hours with verified alumni practitioners.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button
                  variant="default"
                  onClick={() => {
                    const el = document.getElementById('mentor-directory-anchor')
                    el?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  Explore Verified Mentors
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const el = document.getElementById('cohort-tracks-anchor')
                    el?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  Browse 24-Week Cohort Tracks
                </Button>
                <Link
                  to="/mentorship/relationships"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-mono font-bold text-primary hover:border-primary transition-colors"
                >
                  Manage Active Sessions ({activeRelationshipsCount})
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Column: Partitioned 2x2 Institutional Telemetry Grid */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
              <div className="rounded-xl border border-border bg-background p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-primary">
                    Active Pairs
                  </span>
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <p className="font-display text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
                  650+
                </p>
                <p className="text-xs text-secondary">
                  Scholar & Alumni 1-on-1s
                </p>
              </div>

              <div className="rounded-xl border border-primary/30 bg-accent/50 p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-primary">
                    Guild Rating
                  </span>
                  <Star className="h-4 w-4 text-gold fill-gold" />
                </div>
                <p className="font-display text-2xl sm:text-3xl font-bold text-primary tabular-nums">
                  4.92/5
                </p>
                <p className="text-xs text-secondary">
                  Verified mentee feedback
                </p>
              </div>

              <div className="rounded-xl border border-border bg-background p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-primary">
                    Response SLA
                  </span>
                  <Clock className="h-4 w-4 text-gold" />
                </div>
                <p className="font-display text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
                  &lt; 24 hrs
                </p>
                <p className="text-xs text-secondary">
                  Median slot confirmation
                </p>
              </div>

              <div className="rounded-xl border border-border bg-background p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-primary">
                    Global Chapters
                  </span>
                  <Globe2 className="h-4 w-4 text-primary" />
                </div>
                <p className="font-display text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
                  14 Hubs
                </p>
                <p className="text-xs text-secondary">
                  Karachi · Dubai · Munich · UK
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* SECTION 02: INTERACTIVE CAREER GOAL & AFFINITY MATCHER */}
        <motion.section
          id="mentor-directory-anchor"
          variants={sectionVariants}
          className="space-y-6"
        >
          {/* Distinct Section Title Partition */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-card space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
              <div className="flex items-start gap-3">
                <span className="h-10 w-1.5 rounded-full bg-primary shrink-0 mt-1" />
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider font-bold text-primary">
                    02 · Interactive Career Objective Matcher
                  </p>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                    Select Your Target Career Milestone
                  </h2>
                  <p className="text-xs sm:text-sm text-secondary mt-0.5">
                    Click a career objective below to dynamically compute mentor affinity scores and prioritize matching faculty.
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-accent px-3.5 py-2 text-xs font-mono font-bold text-accent-foreground shrink-0">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>
                  {filteredMentors.length} of {MENTORS_CATALOG.length} Faculty
                  Matched
                </span>
              </div>
            </div>

            {/* Interactive Goal Selector Cards */}
            <div
              role="tablist"
              aria-label="Career Objective Matcher"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3"
            >
              {MENTORSHIP_GOALS.map((goal, idx) => {
                const isSelected = selectedGoal === goal.id
                return (
                  <button
                    key={goal.id}
                    role="tab"
                    aria-selected={isSelected}
                    type="button"
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`relative text-left rounded-xl border p-3.5 transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'border-primary bg-accent text-foreground shadow-card ring-1 ring-primary/30'
                        : 'border-border bg-background text-secondary hover:border-primary/50 hover:bg-stone/50 hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-primary">
                        0{idx + 1} · Track
                      </span>
                      {isSelected ? (
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-border" />
                      )}
                    </div>
                    <div>
                      <p className="font-display text-sm font-bold text-foreground">
                        {goal.shortLabel}
                      </p>
                      <p className="text-xs text-secondary line-clamp-2 leading-relaxed mt-1">
                        {goal.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Interactive Multi-Facet Mentor Filter System */}
          <MentorFilterSystem
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            availabilityFilter={availabilityFilter}
            onAvailabilityChange={setAvailabilityFilter}
            selectedIndustries={selectedIndustries}
            onToggleIndustry={handleToggleIndustry}
            onClearIndustries={() => setSelectedIndustries([])}
            selectedExpertise={selectedExpertise}
            onToggleExpertise={handleToggleExpertise}
            onClearExpertise={() => setSelectedExpertise([])}
            selectedChapter={selectedChapter}
            onChapterChange={setSelectedChapter}
            selectedGoal={selectedGoal}
            onGoalChange={setSelectedGoal}
            onResetAll={resetAllFilters}
            industries={MENTOR_INDUSTRIES}
            expertiseTopics={MENTOR_EXPERTISE_TOPICS}
            chapters={chapters}
            industryCounts={industryCounts}
            expertiseCounts={expertiseCounts}
            availabilityCounts={availabilityCounts}
            totalMentors={MENTORS_CATALOG.length}
            filteredCount={filteredMentors.length}
            openSlotsTotal={openSlotsTotal}
          />

          {/* SECTION 03: MENTOR DIRECTORY HEADER + SORT DROPDOWN BAR */}
          <div className="rounded-2xl border border-border bg-card px-5 py-4 sm:px-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="h-8 w-1.5 rounded-full bg-primary shrink-0" />
              <div>
                <p className="text-xs font-mono uppercase tracking-wider font-bold text-primary">
                  03 · Verified Alumni Mentor Directory
                </p>
                <h3 className="font-display text-xl font-bold text-foreground">
                  {selectedGoal === 'ALL'
                    ? 'All Sukkur IBA Faculty & Industry Mentors'
                    : `Recommended Mentors for ${activeGoalMeta.label}`}
                </h3>
              </div>
            </div>

            <div className="w-full sm:w-64">
              <SelectField
                label="Sort Mentor Directory"
                aria-label="Sort Mentor Directory"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as MentorSortMode)}
              >
                <option value="AFFINITY">Sort: Highest Affinity Match</option>
                <option value="RATING">Sort: Highest Mentee Rating</option>
                <option value="SESSIONS">Sort: Most Sessions Completed</option>
                <option value="OPEN_SLOTS">Sort: Most Open Slots</option>
              </SelectField>
            </div>
          </div>

          {/* Mentor Cards Grid */}
          {filteredMentors.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center space-y-3 shadow-card">
              <SlidersHorizontal className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-display text-lg font-bold text-foreground">
                No mentors match your exact filter combination
              </h3>
              <p className="text-sm text-secondary max-w-md mx-auto">
                Try clearing the chapter or availability filter to view additional alumni mentors across global chapters.
              </p>
              <Button variant="outline" size="sm" onClick={resetAllFilters}>
                Reset All Filters
              </Button>
            </div>
          ) : (
            <LayoutGroup>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredMentors.map(({ mentor, matchScore }) => {
                    const isShortlisted = shortlistedIds.includes(mentor.id)
                    const isExpanded = expandedMentorId === mentor.id
                    const existingRequest = requests.find(
                      (r) =>
                        r.mentorId === mentor.id &&
                        (r.status === 'PENDING' || r.status === 'ACTIVE'),
                    )
                    const openSlots = Math.max(
                      0,
                      mentor.maxMentees - mentor.currentMentees,
                    )
                    const portraitUrl =
                      MENTOR_PORTRAITS[mentor.id] ?? MENTOR_PORTRAITS['1']

                    return (
                      <motion.article
                        layout
                        key={mentor.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{
                          type: 'spring',
                          stiffness: 250,
                          damping: 26,
                        }}
                        className="rounded-2xl border border-border bg-card shadow-card hover:shadow-card-hover hover:border-primary/50 transition-all flex flex-col justify-between overflow-hidden"
                      >
                        <div>
                          {/* Top Colored Header Band of Mentor Card */}
                          <div className="border-b border-border bg-stone/75 px-6 py-4 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/35 bg-accent px-2.5 py-1 font-mono text-xs font-bold text-primary tabular-nums">
                                <Sparkles className="h-3.5 w-3.5 text-primary" />
                                {matchScore}% Affinity Match
                              </span>
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-xs font-bold ${
                                  mentor.isAvailable && openSlots > 0
                                    ? 'border-primary/35 bg-card text-primary'
                                    : 'border-gold/40 bg-card text-gold'
                                }`}
                              >
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    mentor.isAvailable && openSlots > 0
                                      ? 'bg-primary'
                                      : 'bg-gold'
                                  }`}
                                />
                                {mentor.isAvailable && openSlots > 0
                                  ? `${openSlots} ${openSlots === 1 ? 'Slot' : 'Slots'} Open`
                                  : 'Cohort Waitlist'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-foreground inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1">
                                <Star className="h-3.5 w-3.5 text-gold fill-gold" />
                                {mentor.avgRating.toFixed(1)}
                                <span className="text-secondary font-normal">
                                  ({mentor.sessionsCompleted})
                                </span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggleShortlist(mentor)}
                                aria-label={
                                  isShortlisted
                                    ? `Remove ${mentor.name} from shortlist`
                                    : `Add ${mentor.name} to shortlist`
                                }
                                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                                  isShortlisted
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border bg-card text-secondary hover:text-foreground hover:border-primary/40'
                                }`}
                              >
                                <Bookmark
                                  className={`h-4 w-4 ${
                                    isShortlisted ? 'fill-current' : ''
                                  }`}
                                />
                              </button>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-6 space-y-5">
                            {/* Mentor Identity Block with Portrait + Cohort Badge */}
                            <div className="flex items-start gap-4">
                              <Link
                                to={`/mentorship/mentors/${mentor.id}`}
                                className="relative shrink-0 group"
                              >
                                <img
                                  src={portraitUrl}
                                  alt={mentor.name}
                                  referrerPolicy="no-referrer"
                                  className="h-16 w-16 rounded-2xl object-cover ring-2 ring-primary/25 group-hover:ring-primary transition-all"
                                />
                                <span className="absolute -bottom-1.5 -right-1.5 rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary shadow-2xs">
                                  ’{String(mentor.classYear).slice(-2)}
                                </span>
                              </Link>

                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Link
                                    to={`/mentorship/mentors/${mentor.id}`}
                                    className="font-display text-xl font-bold text-foreground hover:text-primary transition-colors truncate"
                                  >
                                    {mentor.name}
                                  </Link>
                                  <span className="rounded-md bg-stone px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
                                    {mentor.department}
                                  </span>
                                </div>
                                <p className="text-sm font-bold text-foreground/95">
                                  {mentor.headline}
                                </p>
                                <p className="text-xs font-mono text-secondary flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                                  <span className="inline-flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5 text-primary" />
                                    {mentor.location} · {mentor.chapter}
                                  </span>
                                  <span>·</span>
                                  <span className="inline-flex items-center gap-1 text-primary font-semibold">
                                    <UserCheck className="h-3.5 w-3.5" />
                                    {mentor.totalMenteesServed} Scholars Mentored
                                  </span>
                                </p>
                              </div>
                            </div>

                            {/* Partition 1: Executive Bio with Left Emerald Accent Bar */}
                            <div className="rounded-r-xl border border-border border-l-4 border-l-primary bg-background p-3.5 space-y-1">
                              <p className="text-[10px] font-mono uppercase tracking-wider font-bold text-primary">
                                Mentor Overview & Background
                              </p>
                              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                                {mentor.bio}
                              </p>
                            </div>

                            {/* Partition 2: Featured 1-on-1 Focus Topic Box */}
                            <div className="rounded-xl border border-primary/30 bg-accent/45 p-4 space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider font-bold text-primary">
                                  <Award className="h-3.5 w-3.5 text-primary" />
                                  Featured 1-on-1 Mentorship Focus
                                </span>
                                <span className="font-mono text-[11px] text-secondary">
                                  Replies {mentor.responseWindow}
                                </span>
                              </div>
                              <p className="font-display text-base font-bold text-foreground leading-snug">
                                {mentor.featuredTopic}
                              </p>
                            </div>

                            {/* Partition 3: Differentiated Industry & Technical Expertise Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* Industries Box */}
                              <div className="rounded-xl border border-border bg-background p-3.5 space-y-2">
                                <p className="text-[11px] font-mono uppercase tracking-wider font-bold text-primary flex items-center gap-1.5">
                                  <Briefcase className="h-3.5 w-3.5" />
                                  Industry Sectors
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {mentor.industries.map((ind) => {
                                    const isIndSelected =
                                      selectedIndustries.includes(ind)
                                    return (
                                      <button
                                        key={ind}
                                        type="button"
                                        onClick={() => handleToggleIndustry(ind)}
                                        aria-pressed={isIndSelected}
                                        className={`rounded-lg border px-2.5 py-1 text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                                          isIndSelected
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border bg-card text-foreground hover:border-primary'
                                        }`}
                                      >
                                        {ind}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>

                              {/* Technical Expertise Box */}
                              <div className="rounded-xl border border-border bg-background p-3.5 space-y-2">
                                <p className="text-[11px] font-mono uppercase tracking-wider font-bold text-primary flex items-center gap-1.5">
                                  <Code2 className="h-3.5 w-3.5" />
                                  Domain Expertise
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {mentor.expertise.map((exp) => {
                                    const isExpSelected =
                                      selectedExpertise.includes(exp)
                                    return (
                                      <button
                                        key={exp}
                                        type="button"
                                        onClick={() => handleToggleExpertise(exp)}
                                        aria-pressed={isExpSelected}
                                        className={`rounded-lg border px-2.5 py-1 text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                                          isExpSelected
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border bg-stone text-foreground hover:border-primary'
                                        }`}
                                      >
                                        {exp}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Partition 4: Expandable Syllabus & Office Hours Drawer */}
                            <div className="rounded-xl border border-border bg-stone/40 overflow-hidden">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedMentorId(
                                    isExpanded ? null : mentor.id,
                                  )
                                }
                                className="w-full px-4 py-3 flex items-center justify-between text-xs font-mono font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
                              >
                                <span className="flex items-center gap-2">
                                  <Calendar className="h-3.5 w-3.5 text-primary" />
                                  {isExpanded
                                    ? 'Hide 6-Month Apprenticeship Roadmap & Office Hours'
                                    : 'Inspect 6-Month Apprenticeship Roadmap & Next Office Hours'}
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4 text-primary" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-primary" />
                                )}
                              </button>

                              <AnimatePresence initial={false}>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.24 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="px-4 pb-4 pt-2 border-t border-border space-y-3.5 bg-background/70">
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                        {mentor.roadmap.map((step, idx) => (
                                          <div
                                            key={step.phase}
                                            className="rounded-xl border border-border bg-card p-3 space-y-1"
                                          >
                                            <div className="flex items-center justify-between">
                                              <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-mono font-bold text-primary">
                                                0{idx + 1} · {step.phase}
                                              </span>
                                            </div>
                                            <p className="text-xs font-bold text-foreground pt-0.5">
                                              {step.title}
                                            </p>
                                            <p className="text-[11px] text-secondary leading-relaxed">
                                              {step.outcome}
                                            </p>
                                          </div>
                                        ))}
                                      </div>

                                      {/* Upcoming Office Hours Slots */}
                                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/25 bg-card px-3.5 py-2.5">
                                        <div className="text-xs flex flex-wrap items-center gap-1.5">
                                          <Video className="h-3.5 w-3.5 text-primary shrink-0" />
                                          <span className="font-mono font-bold text-primary">
                                            Next Office Hours:
                                          </span>
                                          <span className="font-mono font-medium text-foreground">
                                            {mentor.officeHoursSlots
                                              .map(
                                                (s) =>
                                                  `${s.dayLabel} (${s.timeLabel})`,
                                              )
                                              .join(' · ')}
                                          </span>
                                        </div>
                                        <Link
                                          to={`/mentorship/mentors/${mentor.id}`}
                                          className="text-xs font-mono font-bold text-primary hover:underline inline-flex items-center gap-1"
                                        >
                                          Full Mentor Dossier
                                          <ArrowUpRight className="h-3.5 w-3.5" />
                                        </Link>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>

                        {/* Distinct Card Footer Bar */}
                        <div className="border-t border-border bg-stone/65 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                          <div className="text-xs font-mono">
                            <p className="font-bold text-foreground">
                              {mentor.meetingFrequency}
                            </p>
                            <p className="text-secondary text-[11px]">
                              {mentor.preferredFormat}
                            </p>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate(`/mentorship/mentors/${mentor.id}`)
                              }
                            >
                              View Mentor Profile
                            </Button>

                            {existingRequest ? (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                  navigate('/mentorship/relationships')
                                }
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-primary" />
                                {existingRequest.status === 'ACTIVE'
                                  ? 'Active Mentor'
                                  : 'Request Pending'}
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() =>
                                  handleOpenBookingModal(
                                    mentor,
                                    mentor.isAvailable
                                      ? 'OFFICE_HOURS'
                                      : 'LONG_TERM',
                                  )
                                }
                              >
                                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                {mentor.isAvailable
                                  ? 'Book 1-on-1 / Apply'
                                  : 'Join Waitlist'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.article>
                    )
                  })}
                </AnimatePresence>
              </div>
            </LayoutGroup>
          )}
        </motion.section>

        {/* SECTION 04: STRUCTURED 6-MONTH COHORT TRACKS & CURRICULUM EXPLORER */}
        <motion.section
          id="cohort-tracks-anchor"
          variants={sectionVariants}
          className="rounded-2xl border border-border bg-card shadow-card overflow-hidden"
        >
          {/* Distinct Section Header Band */}
          <div className="border-b border-border bg-stone/75 px-6 py-5 sm:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="h-10 w-1.5 rounded-full bg-gold shrink-0 mt-1" />
              <div>
                <p className="text-xs font-mono uppercase tracking-wider font-bold text-primary">
                  04 · Guided Multi-Month Fellowships
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Structured Cohort Mentorship Tracks
                </h2>
                <p className="text-xs sm:text-sm text-secondary mt-0.5 max-w-2xl">
                  Enroll in a 20–24 week milestone-driven cohort led by a Principal Alumni Chair with graded capstone reviews.
                </p>
              </div>
            </div>

            {/* Track Switcher Tabs */}
            <div className="flex flex-wrap gap-2">
              {MENTORSHIP_TRACKS.map((track) => {
                const isSelected = track.id === activeTrack.id
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => setActiveTrackId(track.id)}
                    className={`rounded-xl border px-3.5 py-2 text-xs font-mono font-bold transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-border bg-card text-foreground hover:border-primary/50'
                    }`}
                  >
                    {track.code} · {track.title.split(' ')[0]}{' '}
                    {track.title.split(' ')[1]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Active Track Detailed Blueprint */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-4 rounded-2xl border border-border bg-background p-5">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="rounded-md bg-accent px-2.5 py-0.5 font-bold text-primary">
                  {activeTrack.code}
                </span>
                <span className="rounded-md border border-gold/40 bg-stone px-2.5 py-0.5 font-bold text-gold">
                  {activeTrack.status}
                </span>
                <span className="text-secondary font-semibold">
                  · {activeTrack.duration}
                </span>
              </div>

              <h3 className="font-display text-2xl font-bold text-foreground">
                {activeTrack.title}
              </h3>
              <p className="text-sm font-semibold text-primary">
                {activeTrack.subtitle}
              </p>
              <p className="text-sm text-secondary leading-relaxed">
                {activeTrack.description}
              </p>

              <div className="pt-3 space-y-2 text-xs font-mono text-secondary border-t border-border">
                <p>
                  <strong className="text-foreground">Faculty Chair:</strong>{' '}
                  <Link
                    to={`/mentorship/mentors/${activeTrack.leadMentorId}`}
                    className="text-primary font-bold hover:underline"
                  >
                    {activeTrack.leadMentorName}
                  </Link>
                </p>
                <p>
                  <strong className="text-foreground">Eligibility:</strong>{' '}
                  {activeTrack.eligibility}
                </p>
                <p>
                  <strong className="text-foreground">Cadence:</strong>{' '}
                  {activeTrack.commitment} · Closes{' '}
                  {new Date(activeTrack.applicationDeadline).toLocaleDateString(
                    'en-US',
                    { month: 'short', day: 'numeric', year: 'numeric' },
                  )}
                </p>
              </div>

              {/* Seat Capacity Progress Bar */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-primary font-bold">
                    Cohort Seat Allocation
                  </span>
                  <span className="text-foreground font-bold tabular-nums">
                    {activeTrack.currentMentees} / {activeTrack.maxMentees}{' '}
                    Fellows Enrolled
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-stone overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(
                          (activeTrack.currentMentees /
                            activeTrack.maxMentees) *
                            100,
                        ),
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button
                  variant={
                    enrolledTrackIds.includes(activeTrack.id)
                      ? 'outline'
                      : 'default'
                  }
                  onClick={() =>
                    handleToggleTrackEnrollment(
                      activeTrack.id,
                      activeTrack.title,
                    )
                  }
                >
                  {enrolledTrackIds.includes(activeTrack.id) ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
                      Application Registered · Withdraw
                    </>
                  ) : (
                    <>
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Apply for {activeTrack.code} Cohort
                    </>
                  )}
                </Button>
                <Link
                  to={`/mentorship/mentors/${activeTrack.leadMentorId}`}
                  className="text-xs font-mono font-bold text-primary hover:underline inline-flex items-center gap-1"
                >
                  Inspect Chair Dossier
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Right 7 Cols: 3-Phase Curriculum Timeline */}
            <div className="lg:col-span-7 space-y-3.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-mono uppercase tracking-wider font-bold text-primary">
                  24-Week Execution Milestones & Graded Deliverables
                </p>
                <span className="text-xs font-mono text-secondary">
                  3 Structured Phases
                </span>
              </div>
              <div className="space-y-3.5">
                {activeTrack.phases.map((phase, index) => (
                  <div
                    key={phase.weeks}
                    className="rounded-xl border border-border bg-background p-5 flex items-start gap-4 hover:border-primary/40 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-xl border border-primary/30 bg-accent text-primary font-mono text-xs font-bold flex items-center justify-center shrink-0 tabular-nums">
                      0{index + 1}
                    </div>
                    <div className="space-y-1.5">
                      <span className="inline-block rounded bg-stone px-2 py-0.5 text-[11px] font-mono font-bold text-primary">
                        {phase.weeks}
                      </span>
                      <h4 className="font-display text-base font-bold text-foreground">
                        {phase.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                        <strong className="text-foreground font-semibold">
                          Milestone Deliverable:
                        </strong>{' '}
                        {phase.deliverable}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* SECTION 05: MY MENTOR FACULTY STUDIO */}
        <motion.section
          variants={sectionVariants}
          className="rounded-2xl border border-border bg-card shadow-card overflow-hidden"
        >
          <div className="border-b border-border bg-stone/75 px-6 py-4 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="h-9 w-1.5 rounded-full bg-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-mono uppercase tracking-wider font-bold text-primary">
                  05 · Alumni Give-Back Studio
                </p>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                  My Mentor Profile & Availability Settings
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Button
                variant={isEditingMyProfile ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setIsEditingMyProfile((prev) => !prev)}
              >
                {isEditingMyProfile ? 'Close Editor' : 'Customize Mentor Profile'}
              </Button>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 rounded-xl border border-border bg-background p-5 space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span
                    className={`rounded-md px-2.5 py-0.5 font-bold ${
                      myProfile.isAvailable
                        ? 'bg-accent text-primary'
                        : 'bg-stone text-secondary'
                    }`}
                  >
                    {myProfile.isAvailable
                      ? 'ACTIVE · ACCEPTING MENTEES'
                      : 'PAUSED · NOT ACCEPTING NEW REQUESTS'}
                  </span>
                  <span className="text-border">·</span>
                  <span className="text-foreground font-semibold">
                    {myProfile.currentMentees}/{myProfile.maxMentees} Mentee
                    Slots Filled
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  {myProfile.headline}
                </h3>
                <p className="text-sm text-secondary leading-relaxed">
                  {myProfile.bio}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[...myProfile.expertise, ...myProfile.industries].map(
                    (tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-border bg-card px-2.5 py-0.5 font-mono text-[11px] font-semibold text-foreground"
                      >
                        {tag}
                      </span>
                    ),
                  )}
                </div>
              </div>

              <div className="lg:col-span-4 rounded-xl border border-border bg-background p-5 space-y-3 text-xs font-mono">
                <p className="text-[11px] uppercase tracking-wider font-bold text-primary border-b border-border pb-2">
                  Session Cadence & Capacity
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-secondary flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    Cadence
                  </span>
                  <span className="text-foreground font-bold">
                    {myProfile.meetingFrequency}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary flex items-center gap-1.5">
                    <Video className="h-3.5 w-3.5 text-primary" />
                    Format
                  </span>
                  <span className="text-foreground font-bold">
                    {myProfile.preferredFormat}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    Max Capacity
                  </span>
                  <span className="text-foreground font-bold tabular-nums">
                    {myProfile.maxMentees} Mentees
                  </span>
                </div>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {isEditingMyProfile && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={(e) => {
                    e.preventDefault()
                    setIsEditingMyProfile(false)
                    toast.success(
                      'Your mentor profile and availability settings have been updated.',
                    )
                  }}
                  className="overflow-visible"
                >
                  <div className="mt-6 pt-6 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider font-bold text-foreground mb-1.5">
                        Mentor Headline
                      </label>
                      <Input
                        value={myProfile.headline}
                        onChange={(e) =>
                          setMyProfile((prev) => ({
                            ...prev,
                            headline: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <SelectField
                        label="Meeting Cadence"
                        value={myProfile.meetingFrequency}
                        onChange={(e) =>
                          setMyProfile((prev) => ({
                            ...prev,
                            meetingFrequency: e.target.value,
                          }))
                        }
                      >
                        <option value="Weekly · 30 min">Weekly · 30 min</option>
                        <option value="Bi-weekly · 45 min">
                          Bi-weekly · 45 min
                        </option>
                        <option value="Monthly · 60 min">
                          Monthly · 60 min
                        </option>
                      </SelectField>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-mono uppercase tracking-wider font-bold text-foreground mb-1.5">
                        Mentorship Bio & Focus Statement
                      </label>
                      <Input
                        value={myProfile.bio}
                        onChange={(e) =>
                          setMyProfile((prev) => ({
                            ...prev,
                            bio: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center gap-3 md:col-span-2 justify-end pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingMyProfile(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" variant="default" size="sm">
                        Save Mentor Preferences
                      </Button>
                    </div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.section>
      </motion.main>

      {/* Interactive 1-on-1 Session & Mentorship Booking Modal */}
      <AnimatePresence>
        {bookingMentor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/70 backdrop-blur-xs p-4"
            onClick={() => setBookingMentor(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl rounded-2xl border border-border bg-card text-foreground shadow-card-hover overflow-visible"
            >
              <div className="rounded-t-2xl border-b border-border bg-stone/80 px-6 py-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider font-bold text-primary">
                    Mentorship Dispatch
                  </p>
                  <h3 className="font-display text-xl font-bold text-foreground mt-0.5">
                    Connect with {bookingMentor.name}
                  </h3>
                  <p className="text-xs font-mono text-secondary mt-0.5">
                    {bookingMentor.headline} · {bookingMentor.location}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setBookingMentor(null)}
                  aria-label="Close booking modal"
                  className="rounded-lg border border-border bg-card p-1.5 text-secondary hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Mode Selector */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setBookingMode('OFFICE_HOURS')}
                    className={`rounded-xl border p-3.5 text-left transition-colors cursor-pointer ${
                      bookingMode === 'OFFICE_HOURS'
                        ? 'border-primary bg-accent text-foreground'
                        : 'border-border bg-background text-secondary hover:text-foreground'
                    }`}
                  >
                    <p className="font-display text-sm font-bold text-primary">
                      1-on-1 Office Hours
                    </p>
                    <p className="text-xs text-secondary mt-0.5">
                      Single 45-min tactical session or architecture/resume review
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingMode('LONG_TERM')}
                    className={`rounded-xl border p-3.5 text-left transition-colors cursor-pointer ${
                      bookingMode === 'LONG_TERM'
                        ? 'border-primary bg-accent text-foreground'
                        : 'border-border bg-background text-secondary hover:text-foreground'
                    }`}
                  >
                    <p className="font-display text-sm font-bold text-primary">
                      6-Month Mentorship
                    </p>
                    <p className="text-xs text-secondary mt-0.5">
                      Recurring {bookingMentor.meetingFrequency} milestone track
                    </p>
                  </button>
                </div>

                <form onSubmit={handleSubmitBooking} className="space-y-4">
                  {bookingMode === 'OFFICE_HOURS' && (
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider font-bold text-foreground mb-2">
                        Select Available Time Slot
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {bookingMentor.officeHoursSlots.map((slot) => {
                          const isChosen = selectedSlotId === slot.id
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => setSelectedSlotId(slot.id)}
                              className={`rounded-xl border p-3 text-left transition-colors cursor-pointer ${
                                isChosen
                                  ? 'border-primary bg-accent text-foreground'
                                  : 'border-border bg-background text-secondary hover:text-foreground'
                              }`}
                            >
                              <p className="text-xs font-mono font-bold text-primary">
                                {slot.dayLabel} · {slot.timeLabel}
                              </p>
                              <p className="text-[11px] font-mono text-secondary mt-0.5">
                                {slot.format} ({slot.timezone})
                              </p>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <SelectField
                      label="Primary Focus Topic"
                      value={bookingFocusArea}
                      onChange={(e) => setBookingFocusArea(e.target.value)}
                    >
                      {bookingMentor.expertise.map((topic) => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
                      <option value="Mock Interview & Portfolio Calibration">
                        Mock Interview & Portfolio Calibration
                      </option>
                      <option value="Global Relocation & Role Referral">
                        Global Relocation & Role Referral
                      </option>
                    </SelectField>
                  </div>

                  <div>
                    <label
                      htmlFor="booking-goal-note"
                      className="block text-xs font-mono uppercase tracking-wider font-bold text-foreground mb-1.5"
                    >
                      Your Context & Specific Question
                    </label>
                    <textarea
                      id="booking-goal-note"
                      rows={3}
                      value={bookingGoalText}
                      onChange={(e) => setBookingGoalText(e.target.value)}
                      placeholder={`Share your current role/graduation year and what outcome you'd like to achieve with ${bookingMentor.name}...`}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-secondary/70 focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div className="rounded-xl border border-border bg-background p-3 text-xs font-mono text-secondary flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-primary font-bold">
                      <Globe2 className="h-3.5 w-3.5 text-primary" />
                      Response SLA: {bookingMentor.responseWindow}
                    </span>
                    <span>Zero platform fees · Alumni Guild</span>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setBookingMentor(null)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="default">
                      {bookingMode === 'OFFICE_HOURS'
                        ? 'Confirm 1-on-1 Slot Request'
                        : 'Submit 6-Month Application'}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}