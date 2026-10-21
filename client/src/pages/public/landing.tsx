import { Constellation3D } from '@/components/3d/Constellation'
import type { ConstellationMode } from '@/components/3d/ConstellationScene'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { SelectField } from '@/components/ui/input'
import { MediaImage } from '@/components/ui/media-image'
import { TestimonialCarousel } from '@/components/ui/testimonial-carousel'
import { AlumniWorldMap } from '@/components/ui/alumni-world-map'
import { FloatingHeader } from '@/components/layout/floating-header'
import {
  SUKKUR_IBA_JOB_LISTINGS,
  type JobSector,
  type ExperienceLevel,
  type WorkplaceMode,
} from '@/components/ui/job-board-filter'
import {
  MotionConfig,
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  type Variants,
} from 'framer-motion'
import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Search, MapPin, Compass, Globe2 } from 'lucide-react'

/**
 * Shared exponential settling curve and spring physics aligned with Apple-style
 * interruptible motion and `lib/motion.ts`.
 */
const EASE = [0.16, 1, 0.3, 1] as const

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 240, damping: 26 },
  },
}

const hoverLift = {
  y: -5,
  boxShadow: '0 18px 38px -10px rgba(9, 20, 34, 0.12)',
  transition: { type: 'spring', stiffness: 280, damping: 22 },
} as const

const tapPress = {
  scale: 0.98,
  transition: { type: 'spring', stiffness: 380, damping: 24 },
} as const

const heroMetrics = [
  {
    value: 5420,
    suffix: '+',
    label: 'Alumni Registered',
    context: 'Verified graduates across 28 cohorts since 1994',
  },
  {
    value: 42,
    suffix: '',
    label: 'Countries Reached',
    context: 'Active regional chapters across 4 continents',
  },
  {
    value: 1280,
    suffix: '+',
    label: 'Mentorship Pairings',
    context: 'Structured 6-month career & technical tracks',
  },
  {
    value: 94,
    suffix: '%',
    label: 'Referral Response Rate',
    context: 'Direct hiring manager review within 14 days',
  },
] as const

type RegionScope = 'global' | 'pakistan' | 'gulf' | 'west'

const regionalImpactStats: Record<
  RegionScope,
  {
    title: string
    subtitle: string
    stats: {
      value: number
      suffix: string
      label: string
      detail: string
      delta: string
    }[]
  }
> = {
  global: {
    title: 'Worldwide Alumni Meridian',
    subtitle: 'Verified cumulative network footprint across all 18 regional chapters',
    stats: [
      {
        value: 5420,
        suffix: '+',
        label: 'Alumni Registered',
        detail: 'Verified degree-holders from Computer Science, Business, and Engineering',
        delta: '+640 in 2026',
      },
      {
        value: 42,
        suffix: '',
        label: 'Countries Reached',
        detail: 'Graduates working and researching across Asia, Middle East, Europe & North America',
        delta: '18 Active Chapters',
      },
      {
        value: 18650,
        suffix: '+',
        label: 'Mentorship Hours Logged',
        detail: '1-on-1 architecture reviews, mock interviews, and graduate school advisory',
        delta: '89% Promotion Rate',
      },
      {
        value: 1940,
        suffix: '+',
        label: 'Direct Job Referrals',
        detail: 'Internal candidate referrals submitted by alumni hiring managers since launch',
        delta: '14-Day Median Reply',
      },
    ],
  },
  pakistan: {
    title: 'Pakistan Domestic Hubs',
    subtitle: 'Sukkur, Karachi, Lahore, and Islamabad metropolitan chapters',
    stats: [
      {
        value: 3680,
        suffix: '+',
        label: 'Alumni Registered',
        detail: 'Leading national banks, software exporters, and public institutions',
        delta: '6 Regional Hubs',
      },
      {
        value: 14,
        suffix: '',
        label: 'Cities Connected',
        detail: 'Regular on-campus and metropolitan executive meetups',
        delta: 'Monthly Summits',
      },
      {
        value: 11400,
        suffix: '+',
        label: 'Mentorship Hours Logged',
        detail: 'Direct final-year capstone coaching and fresh graduate placement',
        delta: '96% Capstone Match',
      },
      {
        value: 1320,
        suffix: '+',
        label: 'Direct Job Referrals',
        detail: 'Placements across Karachi, Islamabad, and Lahore technology parks',
        delta: '35+ Partner Firms',
      },
    ],
  },
  gulf: {
    title: 'Middle East & Gulf Chapter',
    subtitle: 'Dubai, Abu Dhabi, Riyadh, Jeddah, and Doha alumni circles',
    stats: [
      {
        value: 980,
        suffix: '+',
        label: 'Alumni Registered',
        detail: 'Senior enterprise architects, fintech leads, and advisory directors',
        delta: '5 GCC Hubs',
      },
      {
        value: 8,
        suffix: '',
        label: 'Countries Reached',
        detail: 'Cross-border mobility and relocation sponsorship network',
        delta: 'Quarterly Majlis',
      },
      {
        value: 4120,
        suffix: '+',
        label: 'Mentorship Hours Logged',
        detail: 'Cross-border transition coaching for mid-career alumni',
        delta: '140+ Active Mentors',
      },
      {
        value: 390,
        suffix: '+',
        label: 'Direct Job Referrals',
        detail: 'Regional enterprise, cloud infrastructure, and sovereign fund roles',
        delta: 'Fast-Track Visas',
      },
    ],
  },
  west: {
    title: 'Europe, UK & North America',
    subtitle: 'London, Munich, Berlin, Toronto, San Francisco, and New York chapters',
    stats: [
      {
        value: 760,
        suffix: '+',
        label: 'Alumni Registered',
        detail: 'Principal engineers, PhD researchers, and venture-backed founders',
        delta: '7 Western Hubs',
      },
      {
        value: 20,
        suffix: '',
        label: 'Countries Reached',
        detail: 'Fulbright, DAAD, Erasmus, and Commonwealth scholar alumni network',
        delta: '82 PhD Fellows',
      },
      {
        value: 3130,
        suffix: '+',
        label: 'Mentorship Hours Logged',
        detail: 'Graduate fellowship application reviews and global engineering prep',
        delta: '110+ Scholars Guided',
      },
      {
        value: 230,
        suffix: '+',
        label: 'Direct Job Referrals',
        detail: 'Global remote and relocation-sponsored engineering roles',
        delta: 'Global Mobility',
      },
    ],
  },
}

type DisciplineFilter = 'all' | 'cs' | 'business' | 'engineering'

const directorySpotlights = [
  {
    id: 'al-1',
    name: 'Ayesha Siddiqui',
    role: 'Principal Systems Architect · CloudScale',
    cohort: 'BS Computer Science · Class of 2019',
    location: 'Karachi · Remote',
    discipline: 'cs' as const,
    mentoring: 'Distributed Systems & Architecture Reviews',
    avatar: '/images/avatar.jpg',
  },
  {
    id: 'al-2',
    name: 'Bilal Qureshi',
    role: 'VP of Product Strategy · FinVantage',
    cohort: 'MBA · Class of 2016',
    location: 'Dubai · UAE Chapter',
    discipline: 'business' as const,
    mentoring: 'Product Management & Venture Growth',
    avatar: '/images/avatar.jpg',
  },
  {
    id: 'al-3',
    name: 'Dr. Sarmad Mahar',
    role: 'Lead Robotics & Power Systems Engineer · GridCore',
    cohort: 'BE Electrical Engineering · Class of 2017',
    location: 'Munich · Europe Chapter',
    discipline: 'engineering' as const,
    mentoring: 'Embedded Hardware & Graduate Fellowships',
    avatar: '/images/avatar.jpg',
  },
  {
    id: 'al-4',
    name: 'Hina Memon',
    role: 'Co-Founder & Chief Data Scientist · DataInsights',
    cohort: 'BS Software Engineering · Class of 2015',
    location: 'Islamabad · North Chapter',
    discipline: 'cs' as const,
    mentoring: 'Applied Machine Learning & Startup Founding',
    avatar: '/images/avatar.jpg',
  },
] as const

type EventCategory = 'all' | 'reunion' | 'seminar' | 'career'
type EventChapterFilter = 'all' | 'sukkur' | 'karachi' | 'hybrid'

const upcomingEvents = [
  {
    id: '1',
    title: 'Annual Grand Alumni Homecoming & Founders Dinner',
    category: 'reunion' as const,
    categoryLabel: 'Campus Reunion',
    chapterHub: 'sukkur' as const,
    date: 'Dec 15, 2026',
    location: 'Sukkur IBA Main Auditorium',
    attending: '156 Attending',
    image: '/images/events/reunion.jpg',
    description:
      'Reconnect with faculty and graduating classes from 1998 to 2026 over keynote panels, campus tours, and the founders banquet.',
  },
  {
    id: '2',
    title: 'Applied Generative AI & Enterprise Systems Colloquium',
    category: 'seminar' as const,
    categoryLabel: 'Technical Seminar',
    chapterHub: 'hybrid' as const,
    date: 'Nov 22, 2026',
    location: 'Hybrid · Sukkur & Live Stream',
    attending: '112 Attending',
    image: '/images/events/guest-lecture-ai.jpg',
    description:
      'Engineering leaders from alumni-led technology firms walk through production AI deployment, latency budgets, and hiring benchmarks.',
  },
  {
    id: '4',
    title: 'Autumn Tech & Executive Career Fair 2026',
    category: 'career' as const,
    categoryLabel: 'Career Fair',
    chapterHub: 'karachi' as const,
    date: 'Jan 10, 2027',
    location: 'Karachi Expo & Campus Hub',
    attending: '240 Attending',
    image: '/images/events/tech-career-fair.jpg',
    description:
      'Direct interview tracks with 35+ alumni-hiring organizations across software engineering, quantitative finance, and clean energy.',
  },
  {
    id: '5',
    title: 'Women in Engineering & Executive Leadership Forum',
    category: 'seminar' as const,
    categoryLabel: 'Leadership Forum',
    chapterHub: 'sukkur' as const,
    date: 'Feb 04, 2027',
    location: 'Sukkur IBA Executive Center',
    attending: '94 Attending',
    image: '/images/events/women-in-tech.jpg',
    description:
      'Roundtable mentorship and fellowship showcase led by Sukkur IBA alumnae serving as executives and principal researchers globally.',
  },
] as const

export function LandingPage() {
  const [heroMode, setHeroMode] = useState<ConstellationMode>('orbit')
  const [regionScope, setRegionScope] = useState<RegionScope>('global')
  const [disciplineFilter, setDisciplineFilter] = useState<DisciplineFilter>('all')
  const [directoryQuery, setDirectoryQuery] = useState('')
  const [eventCategory, setEventCategory] = useState<EventCategory>('all')
  const [eventChapter, setEventChapter] = useState<EventChapterFilter>('all')
  const [jobSectorFilter, setJobSectorFilter] = useState<JobSector>('ALL')
  const [jobLevelFilter, setJobLevelFilter] = useState<ExperienceLevel>('ALL')
  const [jobWorkplaceFilter, setJobWorkplaceFilter] =
    useState<WorkplaceMode>('ALL')

  const filteredLandingJobs = SUKKUR_IBA_JOB_LISTINGS.filter((job) => {
    const matchesSector =
      jobSectorFilter === 'ALL' || job.sector === jobSectorFilter
    const matchesLevel =
      jobLevelFilter === 'ALL' || job.experienceLevel === jobLevelFilter
    const matchesWorkplace =
      jobWorkplaceFilter === 'ALL' || job.workplaceMode === jobWorkplaceFilter
    return matchesSector && matchesLevel && matchesWorkplace
  }).slice(0, 4)

  const filteredAlumni = directorySpotlights.filter((alum) => {
    const matchesDiscipline =
      disciplineFilter === 'all' || alum.discipline === disciplineFilter
    const q = directoryQuery.trim().toLowerCase()
    const matchesQuery =
      !q ||
      alum.name.toLowerCase().includes(q) ||
      alum.role.toLowerCase().includes(q) ||
      alum.location.toLowerCase().includes(q) ||
      alum.cohort.toLowerCase().includes(q)
    return matchesDiscipline && matchesQuery
  })

  const filteredEvents = upcomingEvents.filter((ev) => {
    const matchesCat = eventCategory === 'all' || ev.category === eventCategory
    const matchesChapter =
      eventChapter === 'all' || ev.chapterHub === eventChapter
    return matchesCat && matchesChapter
  })

  const currentRegionStats = regionalImpactStats[regionScope]
  const prefersReducedMotion = useReducedMotion()

  // Section refs for targeted scroll-linked parallax planes
  const heroRef = useRef<HTMLElement | null>(null)
  const impactRef = useRef<HTMLElement | null>(null)
  const campusCardRef = useRef<HTMLDivElement | null>(null)

  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const smoothHeroScroll = useSpring(heroScroll, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  })

  // Hero multi-plane parallax transforms
  const heroOrbEmeraldY = useTransform(
    smoothHeroScroll,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, -115],
  )
  const heroOrbGoldY = useTransform(
    smoothHeroScroll,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, 130],
  )
  const heroRingRotate = useTransform(
    smoothHeroScroll,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, 32],
  )
  const heroRingY = useTransform(
    smoothHeroScroll,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, 90],
  )
  const heroCopyY = useTransform(
    smoothHeroScroll,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, -28],
  )
  const heroVisualY = useTransform(
    smoothHeroScroll,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, 54],
  )
  const heroVisualScale = useTransform(
    smoothHeroScroll,
    [0, 1],
    prefersReducedMotion ? [1, 1] : [1, 0.965],
  )
  const heroCardParallaxY = useTransform(
    smoothHeroScroll,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, -42],
  )
  const heroOrbitalBadgeY = useTransform(
    smoothHeroScroll,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, -64],
  )

  // Impact telemetry section decorative parallax
  const { scrollYProgress: impactScroll } = useScroll({
    target: impactRef,
    offset: ['start end', 'end start'],
  })
  const smoothImpactScroll = useSpring(impactScroll, {
    stiffness: 110,
    damping: 30,
    restDelta: 0.001,
  })
  const impactGlowEmeraldY = useTransform(
    smoothImpactScroll,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [-70, 90],
  )
  const impactGlowGoldY = useTransform(
    smoothImpactScroll,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [85, -85],
  )
  const impactMeridianRotate = useTransform(
    smoothImpactScroll,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [-18, 24],
  )

  // Campus heritage aerial photograph window-parallax
  const { scrollYProgress: campusScroll } = useScroll({
    target: campusCardRef,
    offset: ['start end', 'end start'],
  })
  const smoothCampusScroll = useSpring(campusScroll, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  })
  const campusImageY = useTransform(
    smoothCampusScroll,
    [0, 1],
    prefersReducedMotion ? ['0%', '0%'] : ['-8%', '8%'],
  )
  const campusImageScale = useTransform(
    smoothCampusScroll,
    [0, 1],
    prefersReducedMotion ? [1, 1] : [1.14, 1.02],
  )

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-background text-foreground selection:bg-primary/15 selection:text-primary">
        {/* Floating Glassmorphic Navigation Bar (shrinks & intensifies blur on scroll) */}
        <FloatingHeader />

        <main>
          {/* 1. HERO SECTION — Split 2-Column with Multi-Plane Parallax, 3D Meridian Globe + Animated Counter Strip */}
          <section
            ref={heroRef}
            className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-border/70"
          >
            {/* Deep Parallax Plane 1: Drifting Emerald & Burnished Gold Ambient Orbs */}
            <motion.div
              aria-hidden="true"
              style={{ y: heroOrbEmeraldY }}
              className="pointer-events-none absolute -top-28 -left-24 h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle,rgba(13,110,91,0.13),transparent_68%)] blur-2xl"
            />
            <motion.div
              aria-hidden="true"
              style={{ y: heroOrbGoldY }}
              className="pointer-events-none absolute -bottom-32 -right-20 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(217,119,6,0.12),transparent_68%)] blur-2xl"
            />

            {/* Deep Parallax Plane 2: Architectural Meridian Compass Rings */}
            <motion.svg
              aria-hidden="true"
              style={{ y: heroRingY, rotate: heroRingRotate }}
              viewBox="0 0 600 600"
              className="pointer-events-none absolute right-[4%] top-[6%] hidden lg:block h-[540px] w-[540px] text-primary/[0.07] dark:text-primary/[0.11]"
            >
              <circle
                cx="300"
                cy="300"
                r="260"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="6 8"
              />
              <circle
                cx="300"
                cy="300"
                r="195"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
              <line
                x1="300"
                y1="15"
                x2="300"
                y2="585"
                stroke="currentColor"
                strokeWidth="0.75"
                strokeDasharray="3 6"
              />
              <line
                x1="15"
                y1="300"
                x2="585"
                y2="300"
                stroke="currentColor"
                strokeWidth="0.75"
                strokeDasharray="3 6"
              />
            </motion.svg>

            <div className="page-container relative">
              <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
                {/* Left Column: Editorial Value Proposition on Upward Parallax Plane */}
                <motion.div
                  style={{ y: heroCopyY }}
                  className="lg:col-span-6 flex flex-col justify-between py-2"
                  initial="hidden"
                  animate="visible"
                  variants={stagger}
                >
                  <div>
                    {/* Quiet unboxed metadata kicker */}
                    <motion.div
                      variants={item}
                      className="flex flex-wrap items-center gap-2 text-xs font-medium text-secondary mb-5"
                    >
                      <span className="text-primary font-semibold">
                        Sukkur IBA University
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Official Global Alumni Network</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums text-gold">
                        Est. 1994
                      </span>
                    </motion.div>

                    {/* Expressive Display Headline */}
                    <motion.h1
                      variants={item}
                      className="font-display text-[clamp(2.35rem,4.2vw,3.9rem)] font-bold leading-[1.06] tracking-[-0.025em] text-foreground text-balance mb-6"
                    >
                      Where Sukkur IBA graduates connect, mentor, and build{' '}
                      <span className="italic font-normal text-primary">
                        lifelong velocity.
                      </span>
                    </motion.h1>

                    {/* Concrete Value Proposition */}
                    <motion.p
                      variants={item}
                      className="text-base sm:text-lg text-secondary leading-relaxed max-w-xl mb-8"
                    >
                      Access a verified global directory of 5,420+ Sukkur IBA scholars,
                      engineers, and founders across 42 countries. Pair with senior
                      mentors, fast-track hiring referrals, and RSVP to regional chapter
                      summits.
                    </motion.p>

                    {/* Primary CTA Decision Block */}
                    <motion.div
                      variants={item}
                      className="flex flex-wrap items-center gap-3.5 mb-8"
                    >
                      <motion.div whileHover={{ y: -2, scale: 1.01 }} whileTap={tapPress}>
                        <Link
                          to="/register"
                          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors whitespace-nowrap shrink-0"
                        >
                          Claim Your Alumni Profile
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </motion.div>
                      <motion.div whileHover={{ y: -2 }} whileTap={tapPress}>
                        <a
                          href="#directory"
                          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3.5 text-sm font-semibold text-foreground hover:bg-stone/70 transition-colors whitespace-nowrap shrink-0"
                        >
                          Explore Live Directory
                        </a>
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Interactive 3D Meridian Formation Selector synced with the 3D viewport */}
                  <motion.div
                    variants={item}
                    whileHover={{ y: -2 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                    className="rounded-xl border border-border bg-card/85 p-4 shadow-card"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                      <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Compass className="h-3.5 w-3.5 text-primary" />
                        Interactive 3D Network Topology
                      </span>
                      <span className="text-xs font-mono text-secondary tabular-nums">
                        Drag or move pointer to orbit
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone rounded-lg">
                      {(
                        [
                          { id: 'orbit', label: '01. Global Orbit' },
                          { id: 'clusters', label: '02. Chapter Hubs' },
                          { id: 'mentorship', label: '03. Mentorship Web' },
                        ] as const
                      ).map((tab) => (
                        <motion.button
                          key={tab.id}
                          type="button"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setHeroMode(tab.id)}
                          className={`py-2 px-3 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 truncate ${
                            heroMode === tab.id
                              ? 'bg-card text-foreground shadow-sm font-semibold'
                              : 'text-secondary hover:text-foreground'
                          }`}
                        >
                          {tab.label}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>

                {/* Right Column: Signature 3D Alumni Meridian & Parallax Campus Heritage Stage */}
                <motion.div
                  style={{ y: heroVisualY, scale: heroVisualScale }}
                  className="lg:col-span-6 relative flex"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.65, ease: EASE, delay: 0.08 }}
                >
                  {/* Decorative Top-Right Parallax Meridian Coordinate Marker */}
                  <motion.div
                    aria-hidden="true"
                    style={{ y: heroOrbitalBadgeY }}
                    className="pointer-events-none absolute -top-3.5 right-4 z-20 hidden sm:flex items-center gap-2 rounded-xl border border-border/90 bg-card/90 backdrop-blur-md px-3.5 py-2 text-[11px] font-mono text-secondary shadow-card tabular-nums"
                  >
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span>27.7244° N, 68.8228° E · Sukkur Meridian</span>
                  </motion.div>

                  <Constellation3D
                    activeMode={heroMode}
                    onModeChange={setHeroMode}
                    className="h-[380px] sm:h-[440px] lg:h-full min-h-[440px] w-full"
                  />

                  {/* Foreground Counter-Parallax Campus Heritage Picture-in-Picture Card */}
                  <motion.div
                    style={{ y: heroCardParallaxY }}
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    className="hidden sm:flex items-center gap-3.5 absolute -bottom-5 left-4 z-20 max-w-[300px] rounded-2xl border border-border/90 bg-card/92 backdrop-blur-md p-2.5 pr-4 shadow-card"
                  >
                    <img
                      src="/images/campus.jpg"
                      alt="Sukkur IBA University Main Campus"
                      className="h-12 w-16 rounded-xl object-cover ring-1 ring-border shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] font-mono text-primary font-semibold truncate">
                        Sukkur Main Campus
                      </p>
                      <p className="text-xs font-display font-bold text-foreground truncate">
                        18 Global Chapter Hubs
                      </p>
                      <p className="text-[11px] font-mono text-secondary tabular-nums truncate">
                        5,420+ Verified Scholars
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Full-Width 4-Column Scroll-Triggered Animated Counter Bar below Hero Split */}
              <motion.div
                className="mt-12 lg:mt-16 pt-10 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                {heroMetrics.map((metric) => (
                  <motion.div
                    key={metric.label}
                    variants={item}
                    whileHover={{ y: -3 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    className="space-y-1 rounded-xl p-3 -m-3 hover:bg-stone/50 transition-colors"
                  >
                    <p className="font-mono text-3xl sm:text-4xl font-semibold tracking-tight text-foreground tabular-nums">
                      <AnimatedCounter value={metric.value} suffix={metric.suffix} />
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {metric.label}
                    </p>
                    <p className="text-xs text-secondary leading-relaxed">
                      {metric.context}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* 2. DEDICATED SCROLL-TRIGGERED ANIMATED COUNTERS SECTION — GLOBAL REACH & TELEMETRY */}
          <section
            id="impact-stats"
            ref={impactRef}
            className="py-20 lg:py-24 bg-[#091422] text-white border-b border-white/10 relative overflow-hidden"
          >
            {/* Parallax Decorative Radial Layers & Meridian Ring */}
            <motion.div
              aria-hidden="true"
              style={{ y: impactGlowEmeraldY }}
              className="pointer-events-none absolute -top-24 left-[8%] h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(13,110,91,0.42),transparent_68%)] blur-2xl"
            />
            <motion.div
              aria-hidden="true"
              style={{ y: impactGlowGoldY }}
              className="pointer-events-none absolute -bottom-24 right-[10%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.22),transparent_68%)] blur-2xl"
            />
            <motion.div
              aria-hidden="true"
              style={{ rotate: impactMeridianRotate }}
              className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full border border-dashed border-white/[0.07]"
            />

            <div className="page-container relative">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                <motion.div
                  className="max-w-2xl"
                  variants={stagger}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.35 }}
                >
                  <motion.p
                    variants={item}
                    className="text-xs font-mono uppercase tracking-wider text-[#F59E0B] mb-3 flex items-center gap-2"
                  >
                    <Globe2 className="h-3.5 w-3.5 text-[#2DD4BF]" />
                    <span>Institutional Reach · Live Network Counters</span>
                  </motion.p>
                  <motion.h2
                    variants={item}
                    className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white text-balance mb-3"
                  >
                    Three decades of Sukkur IBA excellence, quantified globally.
                  </motion.h2>
                  <motion.p
                    variants={item}
                    className="text-sm sm:text-base text-white/75 leading-relaxed"
                  >
                    {currentRegionStats.subtitle}
                  </motion.p>
                </motion.div>

                {/* Interactive Regional Scope Filter (smoothly re-animates the counters!) */}
                <div
                  role="group"
                  aria-label="Filter impact statistics by region"
                  className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-white/5 border border-white/15 self-start lg:self-auto"
                >
                  {(
                    [
                      { id: 'global', label: 'Global Total' },
                      { id: 'pakistan', label: 'Pakistan Hubs' },
                      { id: 'gulf', label: 'Middle East & Gulf' },
                      { id: 'west', label: 'Europe & North America' },
                    ] as const
                  ).map((tab) => {
                    const active = regionScope === tab.id
                    return (
                      <motion.button
                        key={tab.id}
                        type="button"
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setRegionScope(tab.id)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                          active
                            ? 'bg-[#0D6E5B] text-white font-semibold shadow-sm'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {tab.label}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* 4 Scroll-Triggered Animated Counter Cards */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
              >
                {currentRegionStats.stats.map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    variants={item}
                    whileHover={{
                      y: -5,
                      borderColor: 'rgba(45, 212, 191, 0.45)',
                    }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                    className="rounded-2xl border border-white/12 bg-white/[0.04] p-6 sm:p-7 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs font-mono text-white/60 mb-4">
                        <span>0{idx + 1}</span>
                        <span className="text-[#F59E0B] tabular-nums">
                          {stat.delta}
                        </span>
                      </div>

                      <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                        <AnimatedCounter
                          value={stat.value}
                          suffix={stat.suffix}
                          duration={1.5}
                          className="text-white"
                        />
                      </div>

                      <h3 className="font-display text-lg font-bold text-[#2DD4BF] mb-2">
                        {stat.label}
                      </h3>
                    </div>

                    <p className="text-xs text-white/70 leading-relaxed pt-3 border-t border-white/10">
                      {stat.detail}
                    </p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Interactive D3.js 42-Country Alumni Distribution World Map */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="mt-10"
              >
                <AlumniWorldMap
                  activeRegion={regionScope}
                  onRegionSelect={setRegionScope}
                  variant="dark"
                />
              </motion.div>
            </div>
          </section>

          {/* 3. CORE CAPABILITIES & LIVE DIRECTORY SHOWCASE — RELAXED EDITORIAL ARCHITECTURE */}
          <section
            id="capabilities"
            className="py-28 lg:py-36 bg-card border-b border-border/70"
          >
            <div className="page-container">
              {/* Spacious Section Header + Pillar Index Strip */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end mb-16 lg:mb-20">
                <motion.div
                  className="lg:col-span-7"
                  variants={stagger}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                >
                  <motion.p
                    variants={item}
                    className="text-xs sm:text-sm font-mono uppercase tracking-wider text-primary dark:text-accent font-semibold mb-4"
                  >
                    Platform Architecture · Four Core Pillars
                  </motion.p>
                  <motion.h2
                    variants={item}
                    className="font-display text-3xl sm:text-4xl lg:text-[2.85rem] font-bold leading-[1.12] tracking-tight text-foreground text-balance mb-5"
                  >
                    Engineered for lifelong institutional connection and career acceleration.
                  </motion.h2>
                  <motion.p
                    variants={item}
                    className="text-base sm:text-lg text-secondary leading-relaxed max-w-2xl"
                  >
                    Every capability is built around verified academic credentials, direct
                    peer-to-peer introductions, and measurable professional outcomes across
                    our global alumni network.
                  </motion.p>
                </motion.div>

                {/* Quiet Editorial Pillar Index for effortless scanning & jump navigation */}
                <div className="lg:col-span-5 lg:pl-6 lg:border-l border-border">
                  <p className="text-xs font-mono uppercase tracking-wider text-secondary mb-3">
                    Explore Core Pillars
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
                    <a
                      href="#directory"
                      className="group flex items-center justify-between py-1.5 border-b border-border/60 text-foreground hover:text-primary dark:hover:text-accent transition-colors"
                    >
                      <span className="font-medium">01. Verified Directory</span>
                      <span className="font-mono text-xs text-secondary group-hover:translate-x-0.5 transition-transform">
                        5,420+ →
                      </span>
                    </a>
                    <a
                      href="#mentorship"
                      className="group flex items-center justify-between py-1.5 border-b border-border/60 text-foreground hover:text-primary dark:hover:text-accent transition-colors"
                    >
                      <span className="font-medium">02. Mentorship Tracks</span>
                      <span className="font-mono text-xs text-secondary group-hover:translate-x-0.5 transition-transform">
                        340 Open →
                      </span>
                    </a>
                    <a
                      href="#jobs"
                      className="group flex items-center justify-between py-1.5 border-b border-border/60 text-foreground hover:text-primary dark:hover:text-accent transition-colors"
                    >
                      <span className="font-medium">03. Direct Referrals</span>
                      <span className="font-mono text-xs text-secondary group-hover:translate-x-0.5 transition-transform">
                        {SUKKUR_IBA_JOB_LISTINGS.length} Live →
                      </span>
                    </a>
                    <a
                      href="#university-events"
                      className="group flex items-center justify-between py-1.5 border-b border-border/60 text-foreground hover:text-primary dark:hover:text-accent transition-colors"
                    >
                      <span className="font-medium">04. Global Chapters</span>
                      <span className="font-mono text-xs text-secondary group-hover:translate-x-0.5 transition-transform">
                        18 Hubs →
                      </span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Relaxed Capability Stack with Generous Vertical & Horizontal Rhythm */}
              <div className="space-y-10 lg:space-y-12">
                {/* PILLAR 01: Full-Width Spacious Global Alumni Directory & Cohort Graph */}
                <motion.div
                  id="directory"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="rounded-3xl border border-border bg-background p-7 sm:p-10 lg:p-12 shadow-card"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    {/* Left Column (Span 5): Editorial Overview & Outcomes */}
                    <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-mono text-primary dark:text-accent font-semibold mb-3">
                          <span>01 · Verified Directory</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-secondary tabular-nums">
                            28 Cohorts (1994–2026)
                          </span>
                        </div>

                        <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-4 text-balance">
                          01. Global Alumni Directory & Cohort Graph
                        </h3>

                        <p className="text-base text-secondary leading-relaxed mb-6">
                          Search verified Sukkur IBA graduates by graduating class,
                          academic department, metropolitan chapter, and active
                          mentoring availability. Every profile is authenticated
                          against institutional registrar records.
                        </p>

                        {/* Clean Unboxed Key Directory Metrics */}
                        <div className="grid grid-cols-2 gap-6 py-5 border-t border-b border-border">
                          <div>
                            <p className="font-mono text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
                              5,420+
                            </p>
                            <p className="text-xs sm:text-sm text-secondary mt-1">
                              Verified degree-holders across 4 faculties
                            </p>
                          </div>
                          <div>
                            <p className="font-mono text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
                              42 Countries
                            </p>
                            <p className="text-xs sm:text-sm text-secondary mt-1">
                              Direct peer introductions & chapter leads
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                        <span className="text-xs sm:text-sm text-secondary font-mono tabular-nums">
                          Showing {filteredAlumni.length} of {directorySpotlights.length} spotlight scholars
                        </span>
                        <motion.div whileHover={{ x: 3 }}>
                          <Link
                            to="/alumni"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-primary dark:text-accent hover:underline whitespace-nowrap shrink-0"
                          >
                            <span>Open Full Directory</span>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </motion.div>
                      </div>
                    </div>

                    {/* Right Column (Span 7): Spacious Interactive Directory Explorer */}
                    <div className="lg:col-span-7 lg:pl-8 lg:border-l border-border">
                      {/* Search & Faculty Filter Controls with Comfortable Sizing */}
                      <div className="space-y-4 mb-6">
                        <div className="relative">
                          <Search className="h-4 w-4 text-secondary absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={directoryQuery}
                            onChange={(e) => setDirectoryQuery(e.target.value)}
                            placeholder="Search spotlight alumni by name, title, city, or graduating class..."
                            aria-label="Filter spotlight alumni"
                            className="w-full rounded-xl border border-border bg-card pl-11 pr-4 py-3 text-sm sm:text-base text-foreground placeholder:text-secondary/75 focus:border-primary focus:outline-none transition-colors"
                          />
                        </div>

                        <div
                          role="group"
                          aria-label="Filter spotlight alumni by faculty"
                          className="flex flex-wrap items-center gap-2 p-1.5 bg-stone rounded-xl"
                        >
                          {(
                            [
                              { id: 'all', label: 'All Faculties' },
                              { id: 'cs', label: 'Computer Science & AI' },
                              { id: 'business', label: 'Business & Finance' },
                              { id: 'engineering', label: 'Electrical & Robotics' },
                            ] as const
                          ).map((tab) => (
                            <motion.button
                              key={tab.id}
                              type="button"
                              whileHover={{ y: -1 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setDisciplineFilter(tab.id)}
                              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                                disciplineFilter === tab.id
                                  ? 'bg-card text-foreground shadow-sm font-semibold'
                                  : 'text-secondary hover:text-foreground'
                              }`}
                            >
                              {tab.label}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Spacious Alumni Rows with Avatars & Clear Typography */}
                      <div className="divide-y divide-border border-t border-b border-border">
                        <AnimatePresence mode="popLayout">
                          {filteredAlumni.length > 0 ? (
                            filteredAlumni.map((alum) => (
                              <motion.div
                                key={alum.id}
                                layout
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                whileHover={{ x: 4 }}
                                transition={{ duration: 0.18 }}
                                className="py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                              >
                                <div className="flex items-start sm:items-center gap-4 min-w-0">
                                  <img
                                    src={alum.avatar}
                                    alt={alum.name}
                                    referrerPolicy="no-referrer"
                                    className="h-12 w-12 rounded-full object-cover ring-1 ring-border shrink-0"
                                  />
                                  <div className="min-w-0 space-y-1">
                                    <p className="text-base font-bold text-foreground truncate">
                                      {alum.name}
                                    </p>
                                    <p className="text-sm text-foreground/90 font-medium truncate">
                                      {alum.role}
                                    </p>
                                    <p className="text-xs sm:text-sm text-secondary flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                      <span>{alum.cohort}</span>
                                      <span aria-hidden="true">·</span>
                                      <span>{alum.location}</span>
                                      <span aria-hidden="true">·</span>
                                      <span className="text-primary dark:text-accent font-medium">
                                        Mentoring: {alum.mentoring}
                                      </span>
                                    </p>
                                  </div>
                                </div>

                                <Link
                                  to="/alumni"
                                  className="text-xs sm:text-sm font-semibold text-primary dark:text-accent hover:underline whitespace-nowrap shrink-0 self-start sm:self-center"
                                >
                                  View Profile →
                                </Link>
                              </motion.div>
                            ))
                          ) : (
                            <div className="py-10 text-center text-sm text-secondary">
                              No spotlight alumni match “{directoryQuery}”.{' '}
                              <button
                                type="button"
                                onClick={() => {
                                  setDirectoryQuery('')
                                  setDisciplineFilter('all')
                                }}
                                className="text-primary dark:text-accent underline font-semibold ml-1.5"
                              >
                                Reset filter
                              </button>
                            </div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* MIDDLE ROW: PILLAR 02 (Mentorship) & PILLAR 04 (Global Chapters & Campus Heritage) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
                  {/* PILLAR 02 (Span 6): 1-on-1 Executive & Technical Mentorship */}
                  <motion.div
                    id="mentorship"
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={hoverLift}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className="lg:col-span-6 rounded-3xl border border-border bg-[#091422] text-white p-7 sm:p-10 lg:p-11 flex flex-col justify-between relative overflow-hidden shadow-card"
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(245,158,11,0.16),transparent_55%),radial-gradient(circle_at_15%_85%,rgba(13,110,91,0.32),transparent_55%)]"
                    />

                    <div className="relative">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <span className="text-xs sm:text-sm font-mono text-[#F59E0B] font-semibold">
                          02 · Mentorship Tracks
                        </span>
                        <span className="text-xs sm:text-sm font-mono text-white/75 tabular-nums">
                          Bi-Weekly 1:1 Advisory
                        </span>
                      </div>

                      <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
                        02. Structured Alumni Mentorship
                      </h3>
                      <p className="text-base text-white/80 leading-relaxed mb-8">
                        Pair with senior engineers, VPs, and founders who graduated from
                        Sukkur IBA for architecture reviews, mock interviews, graduate
                        fellowship prep, and executive career planning.
                      </p>

                      <div className="divide-y divide-white/12 border-t border-b border-white/12">
                        <motion.div whileHover={{ x: 4 }} className="py-5">
                          <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-[#2DD4BF] mb-1.5">
                            <span>Track A · Early Career & Grad School</span>
                            <span className="tabular-nums font-semibold">6-Month Track</span>
                          </div>
                          <p className="text-base font-semibold text-white mb-1">
                            Production Code Reviews & Fulbright / MS Advisory
                          </p>
                          <p className="text-xs sm:text-sm text-white/70">
                            Guided portfolio architecture, system design drills, and scholarship essays.
                          </p>
                        </motion.div>

                        <motion.div whileHover={{ x: 4 }} className="py-5">
                          <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-[#F59E0B] mb-1.5">
                            <span>Track B · Executive & Founder Circle</span>
                            <span className="tabular-nums font-semibold">Quarterly Cohort</span>
                          </div>
                          <p className="text-base font-semibold text-white mb-1">
                            Staff+ Engineering Leadership & Venture Fundraising
                          </p>
                          <p className="text-xs sm:text-sm text-white/70">
                            1-on-1 advisory with alumni VPs, CTOs, and venture-backed founders.
                          </p>
                        </motion.div>

                        <motion.div whileHover={{ x: 4 }} className="py-5">
                          <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-white/75 mb-1.5">
                            <span>Active Cohort Capacity</span>
                            <span className="tabular-nums text-[#2DD4BF] font-semibold">
                              340 Mentors Open
                            </span>
                          </div>
                          <p className="text-base font-semibold text-white">
                            Direct matching by technical stack, domain, and target geography
                          </p>
                        </motion.div>
                      </div>
                    </div>

                    <div className="relative mt-8 pt-2 flex flex-wrap items-center justify-between gap-4">
                      <span className="text-xs sm:text-sm text-white/75 font-mono tabular-nums">
                        1,280+ Pairings Completed · 89% Promotion Rate
                      </span>
                      <motion.div whileHover={{ y: -1.5 }} whileTap={tapPress}>
                        <Link
                          to="/mentorship"
                          className="inline-flex items-center gap-2 rounded-xl bg-[#0D6E5B] px-5 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-[#10B981] transition-colors whitespace-nowrap shrink-0"
                        >
                          <span>Explore Mentorship</span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* PILLAR 04 (Span 6): Campus Heritage & Global Chapters Showcase with Scroll Parallax */}
                  <motion.div
                    id="university-events"
                    ref={campusCardRef}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={hoverLift}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.45, ease: EASE, delay: 0.06 }}
                    className="lg:col-span-6 rounded-3xl border border-border overflow-hidden relative min-h-[480px] flex flex-col justify-between p-7 sm:p-10 lg:p-11 shadow-card"
                  >
                    <motion.div
                      style={{ y: campusImageY, scale: campusImageScale }}
                      className="absolute inset-0 h-full w-full"
                    >
                      <MediaImage
                        src="/images/campus.jpg"
                        alt="Aerial view of the Sukkur IBA University campus"
                        className="h-full w-full rounded-none"
                        imgClassName="object-cover object-center"
                      />
                    </motion.div>
                    {/* Measured contrast scrim ensuring >= 4.5:1 legibility */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#091422]/95 via-[#091422]/70 to-[#091422]/30"
                    />

                    {/* Top Chapter Coordinate Header */}
                    <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-mono text-[#F59E0B]">
                      <span className="font-semibold">
                        04 · Regional Chapters & Campus Heritage
                      </span>
                      <span className="text-white/85 tabular-nums">
                        18 Global Cities · 4 Continents
                      </span>
                    </div>

                    {/* Bottom Editorial Content & Regional Hub Matrix */}
                    <div className="relative z-10 mt-auto pt-16">
                      <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight text-balance">
                        04. From Sukkur Campus to Global Tech Capitals
                      </h3>
                      <p className="text-base text-white/85 leading-relaxed mb-6">
                        Regional chapters in Sukkur, Karachi, Lahore, Islamabad, Dubai,
                        Riyadh, Munich, London, and San Francisco host quarterly executive
                        dinners, technical colloquiums, and scholarship drives.
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 pt-5 border-t border-white/15 text-xs sm:text-sm font-mono text-white/90">
                        <div>
                          <p className="font-semibold text-white">Sukkur Campus</p>
                          <p className="text-xs text-white/65 tabular-nums">1,420+ Alumni</p>
                        </div>
                        <div>
                          <p className="font-semibold text-white">Karachi & South</p>
                          <p className="text-xs text-white/65 tabular-nums">1,280+ Alumni</p>
                        </div>
                        <div>
                          <p className="font-semibold text-white">Islamabad & North</p>
                          <p className="text-xs text-white/65 tabular-nums">980+ Alumni</p>
                        </div>
                        <div>
                          <p className="font-semibold text-white">UAE & Gulf</p>
                          <p className="text-xs text-white/65 tabular-nums">980+ Alumni</p>
                        </div>
                        <div>
                          <p className="font-semibold text-white">Europe & UK</p>
                          <p className="text-xs text-white/65 tabular-nums">450+ Alumni</p>
                        </div>
                        <div>
                          <p className="font-semibold text-white">North America</p>
                          <p className="text-xs text-white/65 tabular-nums">310+ Alumni</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* PILLAR 03: Full-Width Relaxed Interactive Direct Alumni Job Referrals */}
                <motion.div
                  id="jobs"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="rounded-3xl border border-border bg-background p-7 sm:p-10 lg:p-12 shadow-card"
                >
                  {/* Top Editorial Row */}
                  <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
                    <div className="max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-mono text-primary dark:text-accent font-semibold mb-3">
                        <span>03 · Career Referrals</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-secondary tabular-nums">
                          {SUKKUR_IBA_JOB_LISTINGS.length} Live Referral Roles · 94% Response Rate
                        </span>
                      </div>

                      <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
                        03. Direct Alumni Job Referrals
                      </h3>
                      <p className="text-base text-secondary leading-relaxed">
                        Bypass standard application queues. Filter open engineering,
                        fintech, and product roles posted directly by Sukkur IBA hiring
                        managers and request an internal referral in one click.
                      </p>
                    </div>

                    <motion.div whileHover={{ x: 3 }} className="self-start lg:self-auto">
                      <Link
                        to="/jobs"
                        className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:border-primary/50 hover:bg-stone/60 transition-colors whitespace-nowrap shrink-0 shadow-sm"
                      >
                        <span>Open Full Job Board</span>
                        <ArrowRight className="h-4 w-4 text-primary dark:text-accent" />
                      </Link>
                    </motion.div>
                  </div>

                  {/* Spacious, Comfortable Multi-Facet Filter Toolbar */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pb-8 border-b border-border items-center">
                    {/* Sector Filter Group (Span 5) */}
                    <div className="lg:col-span-5">
                      <p className="text-xs font-mono uppercase tracking-wider text-secondary mb-2">
                        Industry Sector
                      </p>
                      <div
                        role="group"
                        aria-label="Filter spotlight jobs by sector"
                        className="flex flex-wrap items-center gap-1.5 p-1.5 bg-stone rounded-xl"
                      >
                        {(
                          [
                            { id: 'ALL', label: 'All Sectors' },
                            { id: 'AI_CLOUD', label: 'AI & Cloud' },
                            { id: 'FINTECH', label: 'FinTech' },
                            { id: 'DATA_ANALYTICS', label: 'Data' },
                            { id: 'PRODUCT_DESIGN', label: 'Product' },
                          ] as const
                        ).map((sec) => {
                          const active = jobSectorFilter === sec.id
                          return (
                            <button
                              key={sec.id}
                              type="button"
                              onClick={() => setJobSectorFilter(sec.id)}
                              className={`relative px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                                active
                                  ? 'text-foreground font-semibold'
                                  : 'text-secondary hover:text-foreground'
                              }`}
                            >
                              {active && (
                                <motion.span
                                  layoutId="landing-job-sector-pill"
                                  transition={{
                                    type: 'spring',
                                    stiffness: 360,
                                    damping: 28,
                                  }}
                                  className="absolute inset-0 rounded-lg bg-card shadow-sm border border-primary/20"
                                />
                              )}
                              <span className="relative z-10">{sec.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Experience Level Group (Span 4) */}
                    <div className="lg:col-span-4">
                      <p className="text-xs font-mono uppercase tracking-wider text-secondary mb-2">
                        Seniority Level
                      </p>
                      <div
                        role="group"
                        aria-label="Filter spotlight jobs by experience level"
                        className="flex flex-wrap items-center gap-1.5 p-1.5 bg-stone rounded-xl"
                      >
                        {(
                          [
                            { id: 'ALL', label: 'All Levels' },
                            { id: 'ENTRY', label: 'Entry' },
                            { id: 'MID_SENIOR', label: 'Senior' },
                            { id: 'STAFF_PRINCIPAL', label: 'Staff+' },
                          ] as const
                        ).map((lvl) => {
                          const active = jobLevelFilter === lvl.id
                          return (
                            <button
                              key={lvl.id}
                              type="button"
                              onClick={() => setJobLevelFilter(lvl.id)}
                              className={`relative flex-1 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors text-center whitespace-nowrap shrink-0 ${
                                active
                                  ? 'text-foreground font-semibold'
                                  : 'text-secondary hover:text-foreground'
                              }`}
                            >
                              {active && (
                                <motion.span
                                  layoutId="landing-job-level-pill"
                                  transition={{
                                    type: 'spring',
                                    stiffness: 360,
                                    damping: 28,
                                  }}
                                  className="absolute inset-0 rounded-lg bg-card shadow-sm border border-primary/20"
                                />
                              )}
                              <span className="relative z-10">{lvl.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Workplace Mode Group (Span 3) */}
                    <div className="lg:col-span-3">
                      <p className="text-xs font-mono uppercase tracking-wider text-secondary mb-2">
                        Workplace Mode
                      </p>
                      <div
                        role="group"
                        aria-label="Filter spotlight jobs by remote or on-site mode"
                        className="flex flex-wrap items-center gap-1.5 p-1.5 bg-stone rounded-xl"
                      >
                        {(
                          [
                            { id: 'ALL', label: 'All' },
                            { id: 'REMOTE', label: 'Remote' },
                            { id: 'HYBRID', label: 'Hybrid' },
                            { id: 'ON_SITE', label: 'On-Site' },
                          ] as const
                        ).map((wp) => {
                          const active = jobWorkplaceFilter === wp.id
                          return (
                            <button
                              key={wp.id}
                              type="button"
                              onClick={() => setJobWorkplaceFilter(wp.id)}
                              className={`relative flex-1 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors text-center whitespace-nowrap shrink-0 ${
                                active
                                  ? 'text-foreground font-semibold'
                                  : 'text-secondary hover:text-foreground'
                              }`}
                            >
                              {active && (
                                <motion.span
                                  layoutId="landing-job-workplace-pill"
                                  transition={{
                                    type: 'spring',
                                    stiffness: 360,
                                    damping: 28,
                                  }}
                                  className="absolute inset-0 rounded-lg bg-card shadow-sm border border-primary/20"
                                />
                              )}
                              <span className="relative z-10">{wp.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Relaxed 2-Column Job Referral List with Clear Typography & Generous Spacing */}
                  <div className="pt-6">
                    <AnimatePresence mode="popLayout">
                      {filteredLandingJobs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 divide-y md:divide-y-0 divide-border">
                          {filteredLandingJobs.map((job) => (
                            <motion.div
                              key={job.id}
                              layout
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              whileHover={{ x: 4 }}
                              transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 26,
                              }}
                              className="py-5 border-b border-border/70 flex items-start sm:items-center justify-between gap-4"
                            >
                              <div className="flex items-start sm:items-center gap-4 min-w-0">
                                <img
                                  src={job.companyLogoUrl}
                                  alt={job.company}
                                  referrerPolicy="no-referrer"
                                  className="h-12 w-12 rounded-xl object-cover ring-1 ring-border shrink-0"
                                />
                                <div className="min-w-0 space-y-1">
                                  <Link
                                    to={`/jobs/${job.id}`}
                                    className="text-base sm:text-lg font-bold text-foreground hover:text-primary dark:hover:text-accent transition-colors block truncate"
                                  >
                                    {job.title}
                                  </Link>
                                  <p className="text-xs sm:text-sm text-secondary flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                    <span className="font-medium text-foreground/90">
                                      {job.company}
                                    </span>
                                    <span aria-hidden="true">·</span>
                                    <span>{job.location}</span>
                                    <span aria-hidden="true">·</span>
                                    <span>{job.workplaceLabel}</span>
                                  </p>
                                  <p className="text-xs sm:text-sm font-mono tabular-nums text-primary dark:text-accent font-semibold">
                                    {job.compensationDisplay.split('·')[0]}
                                    <span className="text-secondary font-sans font-normal">
                                      {' '}
                                      · Referrer: {job.referrerName} ({job.referrerCohort})
                                    </span>
                                  </p>
                                </div>
                              </div>

                              <Link
                                to={`/jobs/${job.id}`}
                                className="text-xs sm:text-sm font-mono font-semibold text-primary dark:text-accent hover:underline whitespace-nowrap shrink-0 self-start sm:self-center"
                              >
                                Request Referral →
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <motion.div
                          key="no-landing-jobs"
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="py-10 text-center text-sm text-secondary"
                        >
                          No spotlight roles match this filter combination.{' '}
                          <button
                            type="button"
                            onClick={() => {
                              setJobSectorFilter('ALL')
                              setJobLevelFilter('ALL')
                              setJobWorkplaceFilter('ALL')
                            }}
                            className="text-primary dark:text-accent underline font-semibold ml-1.5"
                          >
                            Reset all job filters
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* 4. INTERACTIVE UNIVERSITY EVENTS & CHAPTER GATHERINGS */}
          <section id="events" className="py-24 lg:py-32 bg-background border-b border-border/70">
            <div className="page-container">
              {/* Section Heading & Full Calendar Link */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                <div className="max-w-2xl">
                  <p className="text-xs font-mono uppercase tracking-wider text-primary mb-3">
                    Campus & Chapter Calendar · 2026–2027 Season
                  </p>
                  <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] font-bold leading-[1.12] tracking-tight text-foreground text-balance mb-3">
                    Reunions, technical seminars, and hiring summits.
                  </h2>
                  <p className="text-sm sm:text-base text-secondary leading-relaxed">
                    Browse upcoming campus homecoming events, hybrid engineering
                    colloquiums, and regional chapter hiring summits across Pakistan and
                    global hubs.
                  </p>
                </div>

                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:border-primary/50 hover:bg-stone/60 transition-colors whitespace-nowrap shrink-0 self-start lg:self-auto shadow-sm"
                >
                  <span>Open Full Events Hub</span>
                  <ArrowRight className="h-4 w-4 text-primary" />
                </Link>
              </div>

              {/* Modern Filter & High-Visibility Dropdown Bar */}
              <div className="mb-12 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
                {/* Category Segmented Tabs with Proper Relative Sizing */}
                <div
                  role="tablist"
                  aria-label="Filter gatherings by category"
                  className="flex flex-wrap items-center gap-1.5 p-1.5 bg-stone rounded-xl"
                >
                  {(
                    [
                      { id: 'all', label: 'All Gatherings' },
                      { id: 'reunion', label: 'Campus Reunions' },
                      { id: 'seminar', label: 'AI & Leadership' },
                      { id: 'career', label: 'Career Fairs' },
                    ] as const
                  ).map((tab) => (
                    <motion.button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={eventCategory === tab.id}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setEventCategory(tab.id)}
                      className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                        eventCategory === tab.id
                          ? 'bg-card text-foreground shadow-sm font-semibold'
                          : 'text-secondary hover:text-foreground'
                      }`}
                    >
                      {tab.label}
                    </motion.button>
                  ))}
                </div>

                {/* High-Visibility Chapter & Venue Dropdown Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
                  <span className="text-xs font-mono uppercase tracking-wider text-secondary whitespace-nowrap shrink-0">
                    Chapter Venue:
                  </span>
                  <SelectField
                    aria-label="Filter events by chapter venue"
                    icon={<MapPin className="h-4 w-4" />}
                    wrapperClassName="w-full sm:w-64"
                    value={eventChapter}
                    onChange={(e) =>
                      setEventChapter(e.target.value as EventChapterFilter)
                    }
                  >
                    <option value="all">All Chapter Locations (4)</option>
                    <option value="sukkur">Sukkur Main Campus</option>
                    <option value="karachi">Karachi Regional Chapter</option>
                    <option value="hybrid">Hybrid & Global Live Stream</option>
                  </SelectField>
                </div>
              </div>

              {/* Events Grid with Generous Margins & Card Spacing */}
              {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                  <AnimatePresence mode="popLayout">
                    {filteredEvents.map((ev) => (
                      <motion.article
                        key={ev.id}
                        layout
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        whileHover={hoverLift}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="group rounded-2xl border border-border bg-card overflow-hidden flex flex-col justify-between shadow-card transition-shadow"
                      >
                        <div>
                          <MediaImage
                            src={ev.image}
                            alt={ev.title}
                            className="aspect-[16/9] w-full rounded-none"
                            imgClassName="object-cover object-center group-hover:scale-[1.03] transition-transform duration-500 ease-out-expo"
                          />
                          <div className="p-7 sm:p-8">
                            {/* Unboxed metadata with typographic separators */}
                            <div className="flex flex-wrap items-center gap-2 text-xs text-secondary mb-3 font-mono tabular-nums">
                              <span className="text-primary font-semibold">
                                {ev.categoryLabel}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{ev.date}</span>
                              <span aria-hidden="true">·</span>
                              <span>{ev.attending}</span>
                            </div>

                            <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-3 leading-snug group-hover:text-primary transition-colors">
                              {ev.title}
                            </h3>
                            <p className="text-sm sm:text-[15px] text-secondary leading-relaxed">
                              {ev.description}
                            </p>
                          </div>
                        </div>

                        <div className="px-7 sm:px-8 py-4 border-t border-border bg-stone/35 flex items-center justify-between gap-4 text-xs sm:text-sm">
                          <span className="text-secondary flex items-center gap-2 truncate font-medium">
                            <MapPin className="h-4 w-4 text-primary shrink-0" />
                            <span className="truncate">{ev.location}</span>
                          </span>
                          <motion.div whileHover={{ x: 3 }}>
                            <Link
                              to={`/events/${ev.id}`}
                              className="font-semibold text-primary hover:underline whitespace-nowrap shrink-0 ml-4"
                            >
                              Reserve Seat →
                            </Link>
                          </motion.div>
                        </div>
                      </motion.article>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-card p-10 text-center">
                  <p className="text-sm font-medium text-secondary mb-3">
                    No gatherings match the selected category and chapter venue.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEventCategory('all')
                      setEventChapter('all')
                    }}
                    className="text-xs font-semibold text-primary underline"
                  >
                    Reset event filters
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* 5. PROOF OF IMPACT & INTERACTIVE ALUMNI TESTIMONIAL CAROUSEL */}
          <section id="outcomes" className="py-20 lg:py-28 bg-card border-b border-border/70">
            <div className="page-container">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                <div className="max-w-2xl">
                  <p className="text-xs font-mono uppercase tracking-wider text-primary mb-3">
                    Verified Alumni Impact · Success Stories
                  </p>
                  <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance mb-4">
                    Real career outcomes backed by cohort solidarity.
                  </h2>
                  <p className="text-sm sm:text-base text-secondary leading-relaxed">
                    Whether transitioning into principal engineering roles in Europe,
                    hiring verified graduates in Dubai, or raising venture capital with
                    former classmates, the Sukkur IBA network compounds every member’s
                    trajectory.
                  </p>
                </div>

                {/* High-contrast outcome summary metrics */}
                <div className="flex items-center gap-6 sm:gap-8 pt-4 lg:pt-0 border-t lg:border-t-0 border-border text-xs text-secondary font-mono tabular-nums shrink-0">
                  <div>
                    <span className="block text-2xl sm:text-3xl font-bold text-foreground mb-1">
                      <AnimatedCounter value={89} suffix="%" />
                    </span>
                    Mentee Promotion Rate
                  </div>
                  <div aria-hidden="true" className="h-10 w-px bg-border" />
                  <div>
                    <span className="block text-2xl sm:text-3xl font-bold text-foreground mb-1">
                      <AnimatedCounter value={14} suffix=" Days" />
                    </span>
                    Median Referral Turnaround
                  </div>
                </div>
              </div>

              {/* Framer Motion Sliding Testimonial Carousel */}
              <TestimonialCarousel />
            </div>
          </section>

          {/* 6. CONVERSION / JOIN SECTION */}
          <section
            id="join"
            className="py-20 lg:py-24 bg-[#091422] text-white relative overflow-hidden"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(13,110,91,0.42),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(245,158,11,0.18),transparent_50%)]"
            />
            <div className="page-container relative">
              <div className="max-w-3xl mx-auto text-center">
                <p className="text-xs font-mono uppercase tracking-wider text-[#F59E0B] mb-3">
                  Sukkur IBA University · Verified Membership
                </p>
                <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white text-balance mb-4">
                  Take your seat in the{' '}
                  <AnimatedCounter value={5420} suffix="+" className="text-[#2DD4BF]" />{' '}
                  alumni meridian.
                </h2>
                <p className="text-base text-white/75 leading-relaxed max-w-xl mx-auto mb-8">
                  Registration is free for all verified Sukkur IBA graduates, faculty, and
                  final-year scholars. Activate your profile in under two minutes.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={tapPress}>
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#0D6E5B] px-7 py-3.5 text-sm font-semibold text-white hover:bg-[#10B981] transition-colors whitespace-nowrap shrink-0"
                    >
                      Create Verified Profile
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ y: -2 }} whileTap={tapPress}>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
                    >
                      Sign In to Member Portal
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* 7. QUIET INSTITUTIONAL FOOTER */}
        <footer className="bg-[#091422] border-t border-white/10 py-12 text-white/70 text-xs">
          <div className="page-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img
                src="/images/university-logo.jpg"
                alt="Sukkur IBA University"
                className="h-7 w-7 rounded-md object-cover"
              />
              <div>
                <p className="font-display font-semibold text-white text-sm">
                  AlumniConnect · Sukkur IBA University
                </p>
                <p className="text-white/55">
                  Nisar Ahmed Siddiqui Road, Sukkur, Sindh, Pakistan
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <Link to="/alumni" className="hover:text-white transition-colors">
                Directory
              </Link>
              <Link to="/mentorship" className="hover:text-white transition-colors">
                Mentorship
              </Link>
              <Link to="/jobs" className="hover:text-white transition-colors">
                Jobs
              </Link>
              <Link to="/events" className="hover:text-white transition-colors">
                Events
              </Link>
              <Link to="/login" className="hover:text-white transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="hover:text-white transition-colors">
                Register
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </MotionConfig>
  )
}
