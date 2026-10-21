import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Pause,
  Play,
  Quote,
} from 'lucide-react'
import { MediaImage } from '@/components/ui/media-image'
import { AnimatedCounter } from '@/components/ui/animated-counter'

export interface AlumniTestimonial {
  id: string
  indexLabel: string
  name: string
  role: string
  company: string
  cohort: string
  location: string
  pathway: string
  quote: string
  beforeRole: string
  afterRole: string
  metricValue: number
  metricPrefix?: string
  metricSuffix: string
  metricDecimals?: number
  metricLabel: string
  metricSubtext: string
  image: string
  imageAlt: string
  companyLogo: string
  ctaLabel: string
  ctaHref: string
}

export const ALUMNI_TESTIMONIALS: readonly AlumniTestimonial[] = [
  {
    id: 'zara-shaikh',
    indexLabel: '01',
    name: 'Zara Shaikh',
    role: 'Principal Systems Architect',
    company: 'CloudScale Berlin',
    cohort: 'BS Computer Science · Class of 2018',
    location: 'Berlin, Germany',
    pathway: '1:1 Mentorship & Architecture Review',
    quote:
      'My mentor from the Class of 2012 reviewed my distributed systems portfolio over three weekend sessions and referred me directly to the Berlin hiring committee. What felt like an impossible international leap became a structured, six-week transition.',
    beforeRole: 'Senior Backend Engineer · Karachi',
    afterRole: 'Principal Systems Architect · Berlin',
    metricValue: 42,
    metricSuffix: ' Days',
    metricLabel: 'From Mentorship Pairing to Signed Berlin Offer',
    metricSubtext: '3 weekly architecture mock sessions · Direct VP referral',
    image: '/images/alumni-gathering.jpg',
    imageAlt: 'Sukkur IBA alumni networking at the annual chapter gathering',
    companyLogo: '/images/logos/techcorp.jpg',
    ctaLabel: 'Browse Engineering Mentors',
    ctaHref: '/mentorship',
  },
  {
    id: 'bilal-qureshi',
    indexLabel: '02',
    name: 'Bilal Qureshi',
    role: 'VP of Product Strategy',
    company: 'FinVantage',
    cohort: 'MBA · Class of 2016',
    location: 'Dubai, UAE',
    pathway: 'Direct Alumni Referral Board',
    quote:
      'Instead of spending three months with external recruiting agencies, I posted our Founding Data Engineer opening on the AlumniConnect referral board. We interviewed six verified Sukkur IBA graduates and hired two within four weeks.',
    beforeRole: '90+ Day External Agency Search',
    afterRole: '2 Founding Engineers Hired in 28 Days',
    metricValue: 28,
    metricSuffix: ' Days',
    metricLabel: 'Time-to-Hire for Two Founding Data Engineers',
    metricSubtext: '6 verified Sukkur IBA finalists · 100% retention at 18 months',
    image: '/images/seminar.jpg',
    imageAlt: 'Sukkur IBA alumni collaborating during an executive product seminar',
    companyLogo: '/images/logos/humane-corp.jpg',
    ctaLabel: 'Explore Referral Job Board',
    ctaHref: '/jobs',
  },
  {
    id: 'hina-memon',
    indexLabel: '03',
    name: 'Dr. Hina Memon',
    role: 'Co-Founder & Chief Data Scientist',
    company: 'DataInsights',
    cohort: 'BS Software Engineering · Class of 2015',
    location: 'London, United Kingdom',
    pathway: 'Founder & Venture Syndicate',
    quote:
      'Reconnecting with two fellow Computer Science alumni at the annual Sukkur campus homecoming sparked the architecture for our enterprise analytics platform. Six months later, three international alumni chapters backed our initial pilot.',
    beforeRole: 'ML Research Fellow · Solo Prototype',
    afterRole: 'Co-Founder · $1.8M Seed-Backed Platform',
    metricValue: 1.8,
    metricPrefix: '$',
    metricSuffix: 'M',
    metricDecimals: 1,
    metricLabel: 'Seed Round Co-Founded by Sukkur IBA Classmates',
    metricSubtext: '3 enterprise pilot contracts sourced via chapter leads',
    image: '/images/events/women-in-tech.jpg',
    imageAlt: 'Dr. Hina Memon speaking at the Sukkur IBA Women in Tech forum',
    companyLogo: '/images/logos/datainsights.jpg',
    ctaLabel: 'Connect in Alumni Directory',
    ctaHref: '/alumni',
  },
  {
    id: 'daniyal-mahar',
    indexLabel: '04',
    name: 'Daniyal Mahar',
    role: 'Staff AI Infrastructure Lead',
    company: 'AI Innovations',
    cohort: 'BS Computer Science · Class of 2017',
    location: 'Singapore',
    pathway: 'Global Chapter Guild & Office Hours',
    quote:
      'Growing up in interior Sindh, Sukkur IBA gave me my foundation. Through bi-weekly group office hours on AlumniConnect, I have helped eighteen final-year scholars and recent graduates land cloud and AI engineering roles across Asia-Pacific.',
    beforeRole: 'Individual Contributor · Regional Team',
    afterRole: 'Staff AI Lead & Mentor to 18 Graduates',
    metricValue: 18,
    metricSuffix: ' Scholars',
    metricLabel: 'Mentees Placed into Global Cloud & AI Engineering Teams',
    metricSubtext: '140+ mentorship hours logged across 4 graduating cohorts',
    image: '/images/events/guest-lecture-ai.jpg',
    imageAlt: 'Guest lecture on AI infrastructure at Sukkur IBA University',
    companyLogo: '/images/logos/ai-innovations.jpg',
    ctaLabel: 'Join a Mentorship Circle',
    ctaHref: '/mentorship',
  },
  {
    id: 'saira-talpur',
    indexLabel: '05',
    name: 'Saira Talpur',
    role: 'Director of Design Systems',
    company: 'Creative Studio',
    cohort: 'BBA Marketing & Strategy · Class of 2019',
    location: 'Toronto, Canada',
    pathway: 'Regional Chapter Leadership',
    quote:
      'When I relocated to Toronto, the North America alumni chapter welcomed me before my luggage even arrived. Within a year, fellow alumni introduced me to my current executive team and co-hosted four cross-border design critiques with Sukkur students.',
    beforeRole: 'Relocating International Professional',
    afterRole: 'Director of Design Systems · North America Hub',
    metricValue: 4,
    metricSuffix: ' Summits',
    metricLabel: 'Cross-Border Design & Strategy Summits Hosted',
    metricSubtext: '320+ alumni & student attendees across Toronto and Sukkur',
    image: '/images/events/reunion.jpg',
    imageAlt: 'Sukkur IBA alumni reunion and chapter leadership summit',
    companyLogo: '/images/logos/creative-studio.jpg',
    ctaLabel: 'View Upcoming Chapter Events',
    ctaHref: '/events',
  },
] as const

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 84 : -84,
    opacity: 0,
    scale: 0.98,
    filter: 'blur(4px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      x: { type: 'spring', stiffness: 290, damping: 30, mass: 0.9 },
      opacity: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
      scale: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
      filter: { duration: 0.28 },
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -84 : 84,
    opacity: 0,
    scale: 0.98,
    filter: 'blur(4px)',
    transition: {
      x: { type: 'spring', stiffness: 310, damping: 32, mass: 0.85 },
      opacity: { duration: 0.22, ease: [0.4, 0, 1, 1] },
      scale: { duration: 0.22 },
      filter: { duration: 0.2 },
    },
  }),
}

const imageSlideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 48 : -48,
    opacity: 0,
    scale: 1.03,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring', stiffness: 260, damping: 28 },
      opacity: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
      scale: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -48 : 48,
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.24,
      ease: [0.4, 0, 1, 1],
    },
  }),
}

const AUTO_ADVANCE_MS = 7500
const SWIPE_CONFIDENCE_THRESHOLD = 6500

function swipePower(offset: number, velocity: number) {
  return Math.abs(offset) * velocity
}

export function TestimonialCarousel() {
  const prefersReducedMotion = useReducedMotion()
  const [[activeIndex, direction], setSlide] = useState<[number, number]>([0, 1])
  const [isPaused, setIsPaused] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  const totalStories = ALUMNI_TESTIMONIALS.length
  const activeStory = ALUMNI_TESTIMONIALS[activeIndex]

  const paginate = useCallback(
    (newDirection: number) => {
      setSlide(([prevIndex]) => {
        const nextIndex = (prevIndex + newDirection + totalStories) % totalStories
        return [nextIndex, newDirection]
      })
    },
    [totalStories],
  )

  const selectStory = useCallback((targetIndex: number) => {
    setSlide(([prevIndex]) => {
      if (targetIndex === prevIndex) return [prevIndex, 0]
      const newDir = targetIndex > prevIndex ? 1 : -1
      return [targetIndex, newDir]
    })
  }, [])

  // Auto-advance timer unless paused, hovered, or reduced-motion enabled
  useEffect(() => {
    if (isPaused || isHovering || prefersReducedMotion) return
    const timer = window.setInterval(() => {
      paginate(1)
    }, AUTO_ADVANCE_MS)
    return () => window.clearInterval(timer)
  }, [isPaused, isHovering, prefersReducedMotion, paginate, activeIndex])

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          paginate(-1)
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          paginate(1)
        }
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Sukkur IBA Alumni Success Stories"
    >
      {/* Top Carousel Header & Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-secondary tabular-nums">
          <span className="font-semibold text-primary">
            Story {activeStory.indexLabel} / 0{totalStories}
          </span>
          <span aria-hidden="true">·</span>
          <span>{activeStory.pathway}</span>
          <span aria-hidden="true">·</span>
          <span>{activeStory.location}</span>
        </div>

        {/* Tactile Carousel Playback & Directional Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <motion.button
            type="button"
            whileHover={{ y: -1.5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsPaused((prev) => !prev)}
            aria-label={isPaused ? 'Resume automatic story rotation' : 'Pause automatic story rotation'}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-medium text-secondary hover:text-foreground hover:border-primary/40 transition-colors whitespace-nowrap shrink-0"
          >
            {isPaused ? (
              <>
                <Play className="h-3.5 w-3.5 text-primary fill-primary" />
                <span>Auto-Play</span>
              </>
            ) : (
              <>
                <Pause className="h-3.5 w-3.5 text-primary" />
                <span>Pause</span>
              </>
            )}
          </motion.button>

          <div className="flex items-center gap-1.5">
            <motion.button
              type="button"
              whileHover={{ x: -2, scale: 1.03 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => paginate(-1)}
              aria-label="Previous alumni story"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-foreground hover:bg-stone hover:border-primary/40 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ x: 2, scale: 1.03 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => paginate(1)}
              aria-label="Next alumni story"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-foreground hover:bg-stone hover:border-primary/40 transition-colors"
            >
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main High-Impact Carousel Stage */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-background shadow-card">
        {/* Top Animated Auto-Advance Progress Line */}
        <div className="h-1 w-full bg-stone overflow-hidden">
          <motion.div
            key={`${activeStory.id}-${isPaused || isHovering ? 'paused' : 'playing'}`}
            initial={{ scaleX: 0 }}
            animate={{
              scaleX: isPaused || isHovering || prefersReducedMotion ? 0.35 : 1,
            }}
            transition={{
              duration:
                isPaused || isHovering || prefersReducedMotion
                  ? 0.3
                  : AUTO_ADVANCE_MS / 1000,
              ease: 'linear',
            }}
            className="h-full w-full origin-left bg-gradient-to-r from-[#0D6E5B] via-[#10B981] to-[#D97706]"
          />
        </div>

        <div className="p-6 sm:p-10 lg:p-12">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left 7 Columns: Sliding Editorial Testimonial & Career Trajectory */}
            <div className="lg:col-span-7 flex flex-col justify-between min-h-[380px] sm:min-h-[400px]">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={activeStory.id}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.18}
                  onDragEnd={(_e, { offset, velocity }) => {
                    const swipe = swipePower(offset.x, velocity.x)
                    if (swipe < -SWIPE_CONFIDENCE_THRESHOLD || offset.x < -75) {
                      paginate(1)
                    } else if (swipe > SWIPE_CONFIDENCE_THRESHOLD || offset.x > 75) {
                      paginate(-1)
                    }
                  }}
                  className="flex flex-col justify-between h-full cursor-grab active:cursor-grabbing"
                >
                  <div>
                    {/* Editorial Quote Header & Unboxed Metadata */}
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-secondary tabular-nums">
                        <span className="text-primary font-semibold">
                          Verified Outcome
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{activeStory.cohort}</span>
                      </div>
                      <Quote
                        aria-hidden="true"
                        className="h-8 w-8 text-[#D97706]/35 shrink-0"
                      />
                    </div>

                    {/* High-Impact Display Blockquote */}
                    <blockquote className="font-display text-xl sm:text-2xl lg:text-[1.65rem] font-normal leading-[1.38] tracking-[-0.015em] text-foreground mb-8">
                      “{activeStory.quote}”
                    </blockquote>

                    {/* Verified Trajectory Comparison Strip */}
                    <div className="rounded-2xl border border-border/90 bg-card p-4 sm:p-5 mb-8">
                      <p className="text-[11px] font-mono uppercase tracking-wider text-secondary mb-2.5">
                        Documented Career Trajectory
                      </p>
                      <div className="grid sm:grid-cols-11 gap-2 sm:gap-3 items-center text-xs sm:text-sm">
                        <div className="sm:col-span-5 text-secondary font-medium truncate">
                          {activeStory.beforeRole}
                        </div>
                        <div
                          aria-hidden="true"
                          className="sm:col-span-1 flex items-center text-primary font-mono font-bold"
                        >
                          →
                        </div>
                        <div className="sm:col-span-5 font-semibold text-foreground truncate">
                          {activeStory.afterRole}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Alumnus Attribution & Action */}
                  <div className="pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={activeStory.companyLogo}
                        alt={activeStory.company}
                        className="h-12 w-12 rounded-xl object-cover border border-border bg-card shrink-0"
                      />
                      <div>
                        <p className="font-display text-base sm:text-lg font-bold text-foreground">
                          {activeStory.name}
                        </p>
                        <p className="text-xs sm:text-sm text-secondary">
                          {activeStory.role} ·{' '}
                          <span className="font-medium text-foreground">
                            {activeStory.company}
                          </span>
                        </p>
                      </div>
                    </div>

                    <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }}>
                      <Link
                        to={activeStory.ctaHref}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:underline whitespace-nowrap shrink-0"
                      >
                        <span>{activeStory.ctaLabel}</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right 5 Columns: Animated Visual Story Frame & Quantified Impact Card */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={`${activeStory.id}-visual`}
                  custom={direction}
                  variants={imageSlideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="relative h-full min-h-[320px] sm:min-h-[380px] rounded-2xl overflow-hidden border border-border bg-[#091422] flex flex-col justify-end"
                >
                  <MediaImage
                    src={activeStory.image}
                    alt={activeStory.imageAlt}
                    className="absolute inset-0 h-full w-full rounded-none"
                    imgClassName="h-full w-full object-cover object-center opacity-85"
                  />
                  {/* Gradient scrim for guaranteed WCAG AA legibility */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#091422] via-[#091422]/65 to-transparent"
                  />

                  {/* Quantified Impact Ledger Overlay */}
                  <div className="relative z-10 p-6 sm:p-7 text-white">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#F59E0B] mb-2 tabular-nums">
                      <span>Quantified Impact</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-white/80">{activeStory.location}</span>
                    </div>

                    <p className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-white tabular-nums mb-1.5">
                      <AnimatedCounter
                        value={activeStory.metricValue}
                        prefix={activeStory.metricPrefix}
                        suffix={activeStory.metricSuffix}
                        decimals={activeStory.metricDecimals ?? 0}
                        duration={1.1}
                      />
                    </p>

                    <p className="font-display text-sm sm:text-base font-semibold text-white/95 mb-2">
                      {activeStory.metricLabel}
                    </p>
                    <p className="text-xs text-white/70 font-mono tabular-nums">
                      {activeStory.metricSubtext}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Bottom Interactive Alumni Story Selector Strip (5 Chapters) */}
        <div
          role="tablist"
          aria-label="Select an alumnus success story"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 border-t border-border bg-card divide-y sm:divide-y-0 sm:divide-x divide-border"
        >
          {ALUMNI_TESTIMONIALS.map((story, idx) => {
            const isSelected = idx === activeIndex
            return (
              <motion.button
                key={story.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => selectStory(idx)}
                className={`relative p-4 sm:p-5 text-left transition-colors flex flex-col justify-between gap-1.5 hover:bg-stone/50 ${
                  isSelected ? 'bg-stone/75' : 'bg-card'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeTestimonialIndicator"
                    transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                    className="absolute inset-x-0 top-0 h-0.5 bg-primary"
                  />
                )}
                <div className="flex items-center justify-between gap-2 w-full">
                  <span
                    className={`font-mono text-xs tabular-nums ${
                      isSelected ? 'font-bold text-primary' : 'text-secondary'
                    }`}
                  >
                    {story.indexLabel} · {story.location.split(',')[0]}
                  </span>
                  <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
                    {story.metricPrefix ?? ''}
                    {story.metricValue}
                    {story.metricSuffix}
                  </span>
                </div>
                <p
                  className={`font-display text-sm truncate ${
                    isSelected ? 'font-bold text-foreground' : 'font-semibold text-foreground/80'
                  }`}
                >
                  {story.name}
                </p>
                <p className="text-xs text-secondary truncate">{story.company}</p>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
