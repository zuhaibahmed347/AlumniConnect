import { Constellation3D } from '@/components/3d/Constellation'
import type { ConstellationMode } from '@/components/3d/ConstellationScene'
import { MediaImage } from '@/components/ui/media-image'
import { MotionConfig, motion, AnimatePresence, type Variants } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Search, MapPin, Compass } from 'lucide-react'

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

const metrics = [
  {
    value: '5,420+',
    label: 'Verified Alumni Profiles',
    context: 'Across 28 graduating cohorts since 1994',
  },
  {
    value: '42',
    label: 'Countries Represented',
    context: 'Active regional chapters on 4 continents',
  },
  {
    value: '1,280+',
    label: 'Mentorship Pairings',
    context: 'Structured 6-month career & technical tracks',
  },
  {
    value: '94%',
    label: 'Referral Response Rate',
    context: 'Direct hiring manager review within 14 days',
  },
] as const

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

const partnerCompanies = [
  { name: 'TechCorp', logo: '/images/logos/techcorp.jpg', openRoles: '14 Open Roles' },
  { name: 'DataInsights', logo: '/images/logos/datainsights.jpg', openRoles: '9 Open Roles' },
  { name: 'AI Innovations', logo: '/images/logos/ai-innovations.jpg', openRoles: '11 Open Roles' },
  { name: 'Creative Studio', logo: '/images/logos/creative-studio.jpg', openRoles: '6 Open Roles' },
  { name: 'HumaneCorp', logo: '/images/logos/humane-corp.jpg', openRoles: '8 Open Roles' },
] as const

type EventCategory = 'all' | 'reunion' | 'seminar' | 'career'

const upcomingEvents = [
  {
    id: 'ev-1',
    title: 'Annual Grand Alumni Homecoming & Founders Dinner',
    category: 'reunion' as const,
    categoryLabel: 'Campus Reunion',
    date: 'Dec 15, 2026',
    location: 'Sukkur IBA Main Auditorium',
    attending: '156 Attending',
    image: '/images/events/reunion.jpg',
    description:
      'Reconnect with faculty and graduating classes from 1998 to 2026 over keynote panels, campus tours, and the founders banquet.',
  },
  {
    id: 'ev-2',
    title: 'Applied Generative AI & Enterprise Systems Colloquium',
    category: 'seminar' as const,
    categoryLabel: 'Technical Seminar',
    date: 'Nov 22, 2026',
    location: 'Hybrid · Sukkur & Live Stream',
    attending: '112 Attending',
    image: '/images/events/guest-lecture-ai.jpg',
    description:
      'Engineering leaders from alumni-led technology firms walk through production AI deployment, latency budgets, and hiring benchmarks.',
  },
  {
    id: 'ev-3',
    title: 'Autumn Tech & Executive Career Fair 2026',
    category: 'career' as const,
    categoryLabel: 'Career Fair',
    date: 'Jan 10, 2027',
    location: 'Karachi Expo & Campus Hub',
    attending: '240 Attending',
    image: '/images/events/tech-career-fair.jpg',
    description:
      'Direct interview tracks with 35+ alumni-hiring organizations across software engineering, quantitative finance, and clean energy.',
  },
  {
    id: 'ev-4',
    title: 'Women in Engineering & Executive Leadership Forum',
    category: 'seminar' as const,
    categoryLabel: 'Leadership Forum',
    date: 'Feb 04, 2027',
    location: 'Sukkur IBA Executive Center',
    attending: '94 Attending',
    image: '/images/events/women-in-tech.jpg',
    description:
      'Roundtable mentorship and fellowship showcase led by Sukkur IBA alumnae serving as executives and principal researchers globally.',
  },
] as const

const stories = [
  {
    metric: '3 Production Offers in 5 Weeks',
    quote:
      'Before joining the mentorship track, I was sending cold applications with zero feedback. My mentor—a Class of 2014 Principal Engineer—restructured my system design portfolio and referred me directly into his cloud infrastructure group.',
    name: 'Ayesha Siddiqui',
    role: 'Principal Systems Architect · CloudScale',
    cohort: 'BS Computer Science · Class of 2019',
  },
  {
    metric: '2 Senior Engineers Hired in 28 Days',
    quote:
      'Instead of spending three months with external recruiters, I posted our Founding Data Engineer opening on the AlumniConnect referral board. We interviewed six verified Sukkur IBA graduates and hired two within four weeks.',
    name: 'Bilal Qureshi',
    role: 'VP of Product Strategy · FinVantage',
    cohort: 'MBA · Class of 2016',
  },
  {
    metric: '$1.8M Seed Round Co-Founded by Alumni',
    quote:
      'Reconnecting with two fellow Computer Science alumni at the annual Sukkur campus meetup sparked the architecture for our enterprise analytics platform. Six months later, three alumni chapters backed our initial pilot.',
    name: 'Hina Memon',
    role: 'Co-Founder & Chief Data Scientist · DataInsights',
    cohort: 'BS Software Engineering · Class of 2015',
  },
] as const

export function LandingPage() {
  const [heroMode, setHeroMode] = useState<ConstellationMode>('orbit')
  const [disciplineFilter, setDisciplineFilter] = useState<DisciplineFilter>('all')
  const [directoryQuery, setDirectoryQuery] = useState('')
  const [eventCategory, setEventCategory] = useState<EventCategory>('all')

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

  const filteredEvents = upcomingEvents.filter(
    (ev) => eventCategory === 'all' || ev.category === eventCategory,
  )

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-background text-foreground selection:bg-primary/15 selection:text-primary">
        {/* Top Bar Contract: 3 zones (Brand wordmark | 4 single-line nav links | 1 primary CTA) */}
        <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md">
          <div className="page-container flex h-16 items-center justify-between gap-8">
            {/* Zone 1: Brand Lockup (keeps /images/university-logo.jpg for route verification) */}
            <Link
              to="/"
              className="flex items-center gap-2.5 text-lg font-display font-bold tracking-tight text-foreground whitespace-nowrap shrink-0"
            >
              <img
                src="/images/university-logo.jpg"
                alt="Sukkur IBA University"
                className="h-8 w-8 rounded-lg object-cover ring-1 ring-border"
              />
              <span>AlumniConnect</span>
            </Link>

            {/* Zone 2: 4 concise single-line navigation links */}
            <nav
              aria-label="Primary Navigation"
              className="hidden md:flex items-center gap-7 text-sm font-medium text-secondary"
            >
              <a
                href="#capabilities"
                className="hover:text-foreground hover:underline underline-offset-8 decoration-primary/60 transition-colors whitespace-nowrap shrink-0"
              >
                Capabilities
              </a>
              <a
                href="#directory"
                className="hover:text-foreground hover:underline underline-offset-8 decoration-primary/60 transition-colors whitespace-nowrap shrink-0"
              >
                Directory
              </a>
              <a
                href="#events"
                className="hover:text-foreground hover:underline underline-offset-8 decoration-primary/60 transition-colors whitespace-nowrap shrink-0"
              >
                Events
              </a>
              <a
                href="#outcomes"
                className="hover:text-foreground hover:underline underline-offset-8 decoration-primary/60 transition-colors whitespace-nowrap shrink-0"
              >
                Outcomes
              </a>
            </nav>

            {/* Zone 3: Primary Action */}
            <div className="flex items-center gap-4 shrink-0">
              <Link
                to="/login"
                className="text-sm font-medium text-secondary hover:text-foreground transition-colors whitespace-nowrap shrink-0"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
              >
                Join Network
              </Link>
            </div>
          </div>
        </header>

        <main>
          {/* 1. HERO SECTION — Split 2-Column with Interactive 3D Meridian Globe + Full-Width Proof Strip */}
          <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-border/70">
            {/* Subtle warm architectural radial ambience */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(13,110,91,0.08),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(217,119,6,0.07),transparent_55%)]"
            />

            <div className="page-container relative">
              <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
                {/* Left Column: Editorial Value Proposition */}
                <motion.div
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
                      <Link
                        to="/register"
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
                      >
                        Claim Your Alumni Profile
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <a
                        href="#directory"
                        className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-3.5 text-sm font-semibold text-foreground hover:bg-stone/70 active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
                      >
                        Explore Live Directory
                      </a>
                    </motion.div>
                  </div>

                  {/* Interactive 3D Meridian Formation Selector synced with the 3D viewport */}
                  <motion.div
                    variants={item}
                    className="rounded-xl border border-border bg-white/80 p-4"
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
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setHeroMode(tab.id)}
                          className={`py-2 px-3 rounded-md text-xs font-medium transition-all whitespace-nowrap shrink-0 truncate ${
                            heroMode === tab.id
                              ? 'bg-white text-foreground shadow-sm font-semibold'
                              : 'text-secondary hover:text-foreground'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>

                {/* Right Column: Signature 3D Alumni Meridian & Constellation */}
                <motion.div
                  className="lg:col-span-6 flex"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.65, ease: EASE, delay: 0.08 }}
                >
                  <Constellation3D
                    activeMode={heroMode}
                    onModeChange={setHeroMode}
                    className="h-[380px] sm:h-[440px] lg:h-full min-h-[440px] w-full"
                  />
                </motion.div>
              </div>

              {/* Full-Width 4-Column Quantitative Proof Bar below the Hero Split */}
              <motion.div
                className="mt-12 lg:mt-16 pt-10 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                {metrics.map((metric) => (
                  <motion.div key={metric.label} variants={item} className="space-y-1">
                    <p className="font-mono text-3xl sm:text-4xl font-semibold tracking-tight text-foreground tabular-nums">
                      {metric.value}
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

          {/* 2. CORE CAPABILITIES & LIVE DIRECTORY BENTO GRID */}
          <section id="capabilities" className="py-20 lg:py-28 bg-white border-b border-border/70">
            <div className="page-container">
              <motion.div
                className="max-w-3xl mb-14"
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                <motion.p
                  variants={item}
                  className="text-xs font-mono uppercase tracking-wider text-primary mb-3"
                >
                  Platform Architecture · Four Core Pillars
                </motion.p>
                <motion.h2
                  variants={item}
                  className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] font-bold leading-[1.12] tracking-tight text-foreground text-balance mb-4"
                >
                  Engineered for lifelong institutional connection and career acceleration.
                </motion.h2>
                <motion.p
                  variants={item}
                  className="text-base text-secondary leading-relaxed"
                >
                  Every capability is built around verified academic credentials, direct
                  peer-to-peer introductions, and measurable professional outcomes.
                </motion.p>
              </motion.div>

              {/* Asymmetric Bento Grid (12-column desktop architecture) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Bento 01 (Span 7): Interactive Alumni Directory Explorer */}
                <motion.div
                  id="directory"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="lg:col-span-7 rounded-2xl border border-border bg-background p-6 sm:p-8 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-mono text-primary font-semibold">
                        01 · Verified Directory
                      </span>
                      <span className="text-xs text-secondary font-mono tabular-nums">
                        28 Cohorts · 1994–2026
                      </span>
                    </div>
                    <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                      01. Global Alumni Directory & Cohort Graph
                    </h3>
                    <p className="text-sm text-secondary leading-relaxed mb-6">
                      Search verified Sukkur IBA graduates by graduating class, engineering
                      or business faculty, city chapter, and mentoring availability.
                    </p>

                    {/* Live Interactive Filter & Search Controls */}
                    <div className="space-y-3 mb-5">
                      <div className="relative">
                        <Search className="h-4 w-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={directoryQuery}
                          onChange={(e) => setDirectoryQuery(e.target.value)}
                          placeholder="Filter spotlight alumni by name, role, city, or class year..."
                          aria-label="Filter spotlight alumni"
                          className="w-full rounded-xl border border-border bg-white pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-secondary/60 focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone rounded-xl">
                        {(
                          [
                            { id: 'all', label: 'All Faculties' },
                            { id: 'cs', label: 'Computer Science & AI' },
                            { id: 'business', label: 'Business & Finance' },
                            { id: 'engineering', label: 'Electrical & Robotics' },
                          ] as const
                        ).map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setDisciplineFilter(tab.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                              disciplineFilter === tab.id
                                ? 'bg-white text-foreground shadow-sm font-semibold'
                                : 'text-secondary hover:text-foreground'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Filtered Alumni Rows (Whitespace & Hairline Dividers, Zero Nested Card Clutter) */}
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
                              transition={{ duration: 0.18 }}
                              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">
                                  {alum.name}
                                </p>
                                <p className="text-xs text-secondary truncate">
                                  {alum.role}
                                </p>
                                <p className="text-xs text-secondary/80 mt-0.5">
                                  <span>{alum.cohort}</span>
                                  <span aria-hidden="true"> · </span>
                                  <span>{alum.location}</span>
                                </p>
                              </div>
                              <Link
                                to="/alumni"
                                className="text-xs font-semibold text-primary hover:underline whitespace-nowrap shrink-0 self-start sm:self-center"
                              >
                                View Profile →
                              </Link>
                            </motion.div>
                          ))
                        ) : (
                          <div className="py-6 text-center text-xs text-secondary">
                            No spotlight alumni match “{directoryQuery}”.{' '}
                            <button
                              type="button"
                              onClick={() => {
                                setDirectoryQuery('')
                                setDisciplineFilter('all')
                              }}
                              className="text-primary underline font-medium ml-1"
                            >
                              Reset filter
                            </button>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between pt-2">
                    <span className="text-xs text-secondary">
                      Showing {filteredAlumni.length} featured scholars of 5,420+ members
                    </span>
                    <Link
                      to="/alumni"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 whitespace-nowrap shrink-0"
                    >
                      Open Full Directory
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </motion.div>

                {/* Bento 02 (Span 5): 1-on-1 Executive & Technical Mentorship */}
                <motion.div
                  id="mentorship"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.45, ease: EASE, delay: 0.06 }}
                  className="lg:col-span-5 rounded-2xl border border-border bg-[#091422] text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden"
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(245,158,11,0.18),transparent_55%),radial-gradient(circle_at_15%_85%,rgba(13,110,91,0.35),transparent_55%)]"
                  />

                  <div className="relative">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-mono text-[#F59E0B] font-semibold">
                        02 · Mentorship Tracks
                      </span>
                      <span className="text-xs font-mono text-white/70 tabular-nums">
                        Bi-Weekly 1:1 Sessions
                      </span>
                    </div>

                    <h3 className="font-display text-2xl font-bold text-white mb-2">
                      02. Structured Alumni Mentorship
                    </h3>
                    <p className="text-sm text-white/75 leading-relaxed mb-6">
                      Pair with senior engineers, VPs, and founders who graduated from
                      Sukkur IBA for architecture reviews, mock interviews, and executive
                      career planning.
                    </p>

                    <div className="divide-y divide-white/10 border-t border-b border-white/10 my-4">
                      <div className="py-3.5">
                        <div className="flex items-center justify-between text-xs font-mono text-[#2DD4BF] mb-1">
                          <span>Track A · Early Career & Grad School</span>
                          <span className="tabular-nums">6 Months</span>
                        </div>
                        <p className="text-sm font-medium text-white">
                          Production Code Reviews & Fulbright / MS Advisory
                        </p>
                      </div>
                      <div className="py-3.5">
                        <div className="flex items-center justify-between text-xs font-mono text-[#F59E0B] mb-1">
                          <span>Track B · Executive & Founder Circle</span>
                          <span className="tabular-nums">Quarterly</span>
                        </div>
                        <p className="text-sm font-medium text-white">
                          Staff+ Engineering Leadership & Venture Fundraising
                        </p>
                      </div>
                      <div className="py-3.5">
                        <div className="flex items-center justify-between text-xs font-mono text-white/60 mb-1">
                          <span>Active Cohort Capacity</span>
                          <span className="tabular-nums text-white">340 Mentors Open</span>
                        </div>
                        <p className="text-sm font-medium text-white">
                          Direct matching by technical stack and target geography
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative mt-6 pt-2 flex items-center justify-between">
                    <span className="text-xs text-white/65 font-mono tabular-nums">
                      1,280+ Pairings Completed
                    </span>
                    <Link
                      to="/mentorship"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#0D6E5B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#10B981] transition-colors whitespace-nowrap shrink-0"
                    >
                      Explore Mentorship
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </motion.div>

                {/* Bento 03 (Span 5): Direct Referral Job Board & Partner Logos */}
                <motion.div
                  id="jobs"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="lg:col-span-5 rounded-2xl border border-border bg-background p-6 sm:p-8 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-mono text-primary font-semibold">
                        03 · Career Referrals
                      </span>
                      <span className="text-xs font-mono text-secondary tabular-nums">
                        48 Live Roles This Week
                      </span>
                    </div>

                    <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                      03. Direct Alumni Job Referrals
                    </h3>
                    <p className="text-sm text-secondary leading-relaxed mb-6">
                      Skip cold applicant queues. Apply with internal referrals from Sukkur
                      IBA alumni leading engineering and business teams.
                    </p>

                    <div className="divide-y divide-border border-t border-b border-border">
                      {partnerCompanies.map((partner) => (
                        <div
                          key={partner.name}
                          className="py-3 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={partner.logo}
                              alt={partner.name}
                              className="h-8 w-8 rounded-md object-cover ring-1 ring-border shrink-0"
                            />
                            <span className="text-sm font-semibold text-foreground truncate">
                              {partner.name}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-secondary tabular-nums whitespace-nowrap shrink-0">
                            {partner.openRoles}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-2 flex items-center justify-between">
                    <span className="text-xs text-secondary">
                      Verified internal referrers attached to every role
                    </span>
                    <Link
                      to="/jobs"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 whitespace-nowrap shrink-0"
                    >
                      Browse Jobs
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </motion.div>

                {/* Bento 04 (Span 7): Campus Heritage & Global Chapters Showcase */}
                <motion.div
                  id="university-events"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.45, ease: EASE, delay: 0.06 }}
                  className="lg:col-span-7 rounded-2xl border border-border overflow-hidden relative min-h-[380px] flex flex-col justify-end p-6 sm:p-8"
                >
                  <MediaImage
                    src="/images/campus.jpg"
                    alt="Aerial view of the Sukkur IBA University campus"
                    className="absolute inset-0 h-full w-full rounded-none"
                    imgClassName="object-cover object-center"
                  />
                  {/* Measured contrast scrim ensuring >= 4.5:1 legibility */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#091422]/95 via-[#091422]/60 to-[#091422]/20"
                  />

                  <div className="relative z-10 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#F59E0B] mb-2">
                      <span>04 · Regional Chapters & Campus Heritage</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-white/80">18 Global Cities</span>
                    </div>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2.5">
                      04. From Sukkur Campus to Global Tech Capitals
                    </h3>
                    <p className="text-sm text-white/85 leading-relaxed mb-5">
                      Regional chapters in Sukkur, Karachi, Lahore, Islamabad, Dubai,
                      Riyadh, Munich, London, and San Francisco host quarterly executive
                      dinners, technical colloquiums, and scholarship drives.
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono text-white/80">
                      <span>Sukkur Main Campus</span>
                      <span aria-hidden="true">·</span>
                      <span>Karachi Chapter</span>
                      <span aria-hidden="true">·</span>
                      <span>Islamabad Hub</span>
                      <span aria-hidden="true">·</span>
                      <span>UAE & Gulf</span>
                      <span aria-hidden="true">·</span>
                      <span>Europe & UK</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* 3. INTERACTIVE UNIVERSITY EVENTS & CHAPTER GATHERINGS */}
          <section id="events" className="py-20 lg:py-28 bg-background border-b border-border/70">
            <div className="page-container">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-primary mb-3">
                    Campus & Chapter Calendar · 2026–2027 Season
                  </p>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance">
                    Reunions, technical seminars, and hiring summits.
                  </h2>
                </div>

                {/* Interactive Filter Controls */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone rounded-xl self-start lg:self-auto">
                  {(
                    [
                      { id: 'all', label: 'All Gatherings' },
                      { id: 'reunion', label: 'Campus Reunions' },
                      { id: 'seminar', label: 'AI & Leadership' },
                      { id: 'career', label: 'Career Fairs' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setEventCategory(tab.id)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                        eventCategory === tab.id
                          ? 'bg-white text-foreground shadow-sm font-semibold'
                          : 'text-secondary hover:text-foreground'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredEvents.map((ev) => (
                    <motion.article
                      key={ev.id}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="group rounded-2xl border border-border bg-white overflow-hidden flex flex-col justify-between hover:shadow-card-hover transition-shadow"
                    >
                      <div>
                        <MediaImage
                          src={ev.image}
                          alt={ev.title}
                          className="aspect-[16/9] w-full rounded-none"
                          imgClassName="object-cover object-center group-hover:scale-[1.02] transition-transform duration-500 ease-out-expo"
                        />
                        <div className="p-6 sm:p-7">
                          {/* Unboxed metadata with typographic separators */}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-secondary mb-2.5 font-mono tabular-nums">
                            <span className="text-primary font-semibold">
                              {ev.categoryLabel}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{ev.date}</span>
                            <span aria-hidden="true">·</span>
                            <span>{ev.attending}</span>
                          </div>

                          <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2.5 leading-snug">
                            {ev.title}
                          </h3>
                          <p className="text-sm text-secondary leading-relaxed">
                            {ev.description}
                          </p>
                        </div>
                      </div>

                      <div className="px-6 sm:px-7 py-4 border-t border-border flex items-center justify-between text-xs">
                        <span className="text-secondary flex items-center gap-1.5 truncate">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{ev.location}</span>
                        </span>
                        <Link
                          to="/events"
                          className="font-semibold text-primary hover:underline whitespace-nowrap shrink-0 ml-4"
                        >
                          Reserve Seat →
                        </Link>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* 4. PROOF OF IMPACT & ATTRIBUTABLE OUTCOMES */}
          <section id="outcomes" className="py-20 lg:py-28 bg-white border-b border-border/70">
            <div className="page-container">
              <div className="grid lg:grid-cols-12 gap-10 items-center mb-16">
                <div className="lg:col-span-5">
                  <p className="text-xs font-mono uppercase tracking-wider text-primary mb-3">
                    Verified Alumni Impact
                  </p>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance mb-4">
                    Real career outcomes backed by cohort solidarity.
                  </h2>
                  <p className="text-sm sm:text-base text-secondary leading-relaxed mb-6">
                    Whether transitioning into principal engineering roles, hiring verified
                    graduates, or raising venture capital with former classmates, the
                    Sukkur IBA network compounds every member’s trajectory.
                  </p>
                  <div className="flex items-center gap-6 pt-2 border-t border-border text-xs text-secondary font-mono tabular-nums">
                    <div>
                      <span className="block text-lg font-bold text-foreground">
                        89%
                      </span>
                      Mentee Promotion Rate
                    </div>
                    <div aria-hidden="true" className="h-8 w-px bg-border" />
                    <div>
                      <span className="block text-lg font-bold text-foreground">
                        14 Days
                      </span>
                      Median Referral Turnaround
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
                  <MediaImage
                    src="/images/alumni-gathering.jpg"
                    alt="Sukkur IBA alumni gathered together at the annual reunion"
                    className="aspect-[4/3] rounded-2xl border border-border"
                    imgClassName="object-cover object-center"
                  />
                  <MediaImage
                    src="/images/seminar.jpg"
                    alt="Alumni and students collaborating during a campus seminar"
                    className="aspect-[4/3] rounded-2xl border border-border"
                    imgClassName="object-cover object-center"
                  />
                </div>
              </div>

              {/* 3 Attributable Testimonials with Concrete Quantified Outcomes */}
              <div className="grid md:grid-cols-3 gap-6">
                {stories.map((story) => (
                  <motion.figure
                    key={story.name}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="rounded-2xl border border-border bg-background p-6 sm:p-7 flex flex-col justify-between"
                  >
                    <div>
                      <p className="text-xs font-mono font-semibold text-primary mb-4 tabular-nums">
                        Outcome · {story.metric}
                      </p>
                      <blockquote className="text-sm text-foreground/90 leading-relaxed mb-6">
                        “{story.quote}”
                      </blockquote>
                    </div>

                    <figcaption className="pt-4 border-t border-border">
                      <p className="font-display font-bold text-sm text-foreground">
                        {story.name}
                      </p>
                      <p className="text-xs text-secondary mt-0.5">{story.role}</p>
                      <p className="text-xs font-mono text-secondary/75 mt-0.5 tabular-nums">
                        {story.cohort}
                      </p>
                    </figcaption>
                  </motion.figure>
                ))}
              </div>
            </div>
          </section>

          {/* 5. CONVERSION / JOIN SECTION */}
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
                  Take your seat in the 5,420+ alumni meridian.
                </h2>
                <p className="text-base text-white/75 leading-relaxed max-w-xl mx-auto mb-8">
                  Registration is free for all verified Sukkur IBA graduates, faculty, and
                  final-year scholars. Activate your profile in under two minutes.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0D6E5B] px-7 py-3.5 text-sm font-semibold text-white hover:bg-[#10B981] transition-colors whitespace-nowrap shrink-0"
                  >
                    Create Verified Profile
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
                  >
                    Sign In to Member Portal
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* 6. QUIET INSTITUTIONAL FOOTER */}
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
