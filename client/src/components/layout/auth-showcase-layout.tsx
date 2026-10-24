import { useState, useEffect, useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import {
  ArrowLeft,
  Building2,
  Camera,
  ChevronLeft,
  ChevronRight,
  Compass,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { type PlatformPersona } from '@/lib/role-context'

export interface AuthPersonaSlide {
  persona: PlatformPersona
  shortLabel: string
  roleBadge: string
  headline: string
  description: string
  coverImage: string
  sceneTitle: string
  sceneLocation: string
  accentGradient: string
  accentBorder: string
  accentText: string
  accentButtonBg: string
  stats: ReadonlyArray<{ value: string; label: string }>
  spotlight: {
    quote: string
    author: string
    role: string
    cohort: string
    avatar: string
  }
}

export const AUTH_PERSONA_SLIDES: Record<PlatformPersona, AuthPersonaSlide> = {
  STUDENT: {
    persona: 'STUDENT',
    shortLabel: 'Student',
    roleBadge: 'Final-Year & Undergraduate Scholars',
    headline: 'Bridge Campus Excellence to Global Tech & Finance Careers',
    description:
      'Connect directly with verified Sukkur IBA alumni for 1-on-1 mentorship, fast-track internship referrals, and thesis or fellowship guidance.',
    coverImage: '/images/campus.jpg',
    sceneTitle: 'Main Academic Block · Sukkur IBA University',
    sceneLocation: 'Nisar Ahmed Siddiqui Road, Sukkur',
    accentGradient: 'from-emerald-950/95 via-teal-950/80 to-slate-950/90',
    accentBorder: 'border-emerald-500/40',
    accentText: 'text-emerald-400',
    accentButtonBg: 'bg-emerald-600 hover:bg-emerald-500',
    stats: [
      { value: '410+', label: 'Active Alumni Mentors' },
      { value: '94%', label: 'Referral Response SLA' },
      { value: '180+', label: 'Partner Internships' },
    ],
    spotlight: {
      quote:
        'Through AlumniConnect, I booked two mock system-design sessions with a Class of 2019 architect and landed my final-year cloud engineering offer before graduation.',
      author: 'Zainab Magsi',
      role: 'Final-Year BSCS Scholar · Cloud & AI Track',
      cohort: 'Class of 2026',
      avatar: '/images/avatar.jpg',
    },
  },
  ALUMNI: {
    persona: 'ALUMNI',
    shortLabel: 'Alumni',
    roleBadge: 'Verified Graduate Registry · 42 Countries',
    headline: 'Your Lifelong Sukkur IBA Global Network & Chapter Hub',
    description:
      'Reconnect with your graduating cohort, discover executive leadership roles, RSVP to regional chapter reunions in Karachi, Dubai, and Munich, and refer rising talent.',
    coverImage: '/images/alumni-gathering.jpg',
    sceneTitle: 'Annual Grand Homecoming & Cohort Reunion',
    sceneLocation: 'Main Auditorium & Global Chapters',
    accentGradient: 'from-sky-950/95 via-indigo-950/80 to-slate-950/90',
    accentBorder: 'border-sky-400/40',
    accentText: 'text-sky-300',
    accentButtonBg: 'bg-sky-600 hover:bg-sky-500',
    stats: [
      { value: '5,420+', label: 'Verified Graduates' },
      { value: '42', label: 'Countries Represented' },
      { value: '18', label: 'Global Regional Chapters' },
    ],
    spotlight: {
      quote:
        'Our Dubai and Karachi chapter directories made it effortless to hire three Sukkur IBA engineers and co-host the regional fintech leadership summit.',
      author: 'Sanaullah Memon',
      role: 'Director of Payment Rail Product · Careem',
      cohort: 'BBA Finance · Class of 2016',
      avatar: '/images/avatar.jpg',
    },
  },
  MENTOR: {
    persona: 'MENTOR',
    shortLabel: 'Mentor',
    roleBadge: 'Sukkur IBA Mentorship Guild & Fellows',
    headline: 'Shape the Next Generation of Engineers, Founders & Scholars',
    description:
      'Publish your office-hour calendar, guide graduating students through Fulbright/DAAD fellowships and technical interviews, and track mentee milestones.',
    coverImage: '/images/events/women-in-tech.jpg',
    sceneTitle: 'Women in Tech & Executive Fellows Roundtable',
    sceneLocation: 'Mentorship Guild · Hybrid Global Sessions',
    accentGradient: 'from-violet-950/95 via-purple-950/80 to-slate-950/90',
    accentBorder: 'border-violet-400/40',
    accentText: 'text-violet-300',
    accentButtonBg: 'bg-violet-600 hover:bg-violet-500',
    stats: [
      { value: '1,280+', label: '1-on-1 Sessions Completed' },
      { value: '4.94/5', label: 'Mentee Satisfaction' },
      { value: '68', label: 'Global Fellowship Placements' },
    ],
    spotlight: {
      quote:
        'Publishing my bi-weekly availability calendar takes two minutes, and watching Sukkur IBA scholars secure DAAD and European R&D fellowships is deeply rewarding.',
      author: 'Dr. Aamir Soomro',
      role: 'VP of AI Infrastructure · Munich, Germany',
      cohort: 'BSCS · Class of 2014',
      avatar: '/images/avatar.jpg',
    },
  },
  EMPLOYER: {
    persona: 'EMPLOYER',
    shortLabel: 'Employer',
    roleBadge: 'Corporate Talent & Referral Partners',
    headline: 'Recruit Pre-Vetted Sukkur IBA Graduates & Alumni Leaders',
    description:
      'Post high-impact engineering, fintech, and management roles with direct alumni referral backing, verified academic transcripts, and campus hiring summit access.',
    coverImage: '/images/events/tech-career-fair.jpg',
    sceneTitle: 'Sukkur IBA Autumn Tech & FinTech Hiring Summit',
    sceneLocation: 'Corporate Partner Pavilion',
    accentGradient: 'from-amber-950/95 via-stone-950/85 to-slate-950/90',
    accentBorder: 'border-amber-400/40',
    accentText: 'text-amber-300',
    accentButtonBg: 'bg-amber-600 hover:bg-amber-500',
    stats: [
      { value: '85+', label: 'Hiring Partner Companies' },
      { value: '~36h', label: 'Avg Referral Turnaround' },
      { value: '3.2x', label: 'Higher Interview-to-Offer' },
    ],
    spotlight: {
      quote:
        'Alumni-endorsed candidates from Sukkur IBA consistently outperform in our distributed systems and enterprise architecture hiring loops.',
      author: 'Hira Qureshi',
      role: 'Head of Technical Recruiting · Systems Limited',
      cohort: 'Verified Employer Partner',
      avatar: '/images/avatar.jpg',
    },
  },
  ADMIN: {
    persona: 'ADMIN',
    shortLabel: 'Admin',
    roleBadge: 'Institutional Governance & Advancement',
    headline: 'Unified Registry Verification, Chapter Moderation & Analytics',
    description:
      'Oversee graduate degree verification, moderate employer job postings and regional chapter events, and track institutional placement outcomes.',
    coverImage: '/images/events/guest-lecture-ai.jpg',
    sceneTitle: 'Institutional Advancement & Governance Console',
    sceneLocation: 'Sukkur IBA University Secretariat',
    accentGradient: 'from-rose-950/95 via-slate-950/85 to-slate-950/95',
    accentBorder: 'border-rose-400/40',
    accentText: 'text-rose-300',
    accentButtonBg: 'bg-rose-600 hover:bg-rose-500',
    stats: [
      { value: '99.4%', label: 'Registry Verification Accuracy' },
      { value: 'PKR 48M+', label: 'Endowment & Scholarship Impact' },
      { value: '24/7', label: 'Role-Based Access Audit' },
    ],
    spotlight: {
      quote:
        'Real-time HEC/CMS transcript cross-verification ensures every member, mentor, and corporate partner inside AlumniConnect is authentic.',
      author: 'Registrar & Advancement Office',
      role: 'Sukkur IBA University Directorate',
      cohort: 'Institutional Governance',
      avatar: '/images/university-logo.jpg',
    },
  },
}

const PERSONA_ORDER: PlatformPersona[] = [
  'STUDENT',
  'ALUMNI',
  'MENTOR',
  'EMPLOYER',
  'ADMIN',
]

export const PERSONA_ICONS: Record<PlatformPersona, typeof GraduationCap> = {
  STUDENT: GraduationCap,
  ALUMNI: Users,
  MENTOR: Compass,
  EMPLOYER: Building2,
  ADMIN: ShieldCheck,
}

const CROSSFADE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

interface AuthShowcaseLayoutProps {
  activePersona: PlatformPersona
  onPersonaChange: (persona: PlatformPersona) => void
  children: ReactNode
  modeLabel?: string
}

export interface AuthPersonaSlideProps {
  activePersona: PlatformPersona
  slideDirection: 1 | -1
  onSelectPersona: (persona: PlatformPersona) => void
  onStepPersona: (dir: -1 | 1) => void
  panelRef?: React.RefObject<HTMLDivElement>
  tabButtonRefs?: React.MutableRefObject<
    Partial<Record<PlatformPersona, HTMLButtonElement | null>>
  >
}

export function AuthPersonaSlide({
  activePersona,
  slideDirection,
  onSelectPersona,
  onStepPersona,
  panelRef,
  tabButtonRefs,
}: AuthPersonaSlideProps) {
  const slide = AUTH_PERSONA_SLIDES[activePersona]

  return (
    <motion.div
      ref={panelRef}
      layout
      transition={{
        layout: { duration: 0.45, ease: CROSSFADE_EASE },
      }}
      className="lg:col-span-7 relative w-full min-w-0 rounded-2xl sm:rounded-3xl overflow-hidden border border-white/15 dark:border-border/90 shadow-[0_24px_60px_-15px_rgba(9,20,34,0.35)] min-h-[380px] min-[375px]:min-h-[430px] lg:min-h-[680px] flex flex-col justify-between p-3.5 min-[375px]:p-5 sm:p-8 lg:p-10 text-white"
    >
      {/* Stacked High-Res Photography Layers for Seamless Simultaneous Cross-Fade */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        {PERSONA_ORDER.map((roleKey) => {
          const item = AUTH_PERSONA_SLIDES[roleKey]
          const isCurrent = roleKey === activePersona
          return (
            <motion.div
              key={`showcase-photo-layer-${roleKey}`}
              initial={false}
              animate={{
                opacity: isCurrent ? 1 : 0,
                scale: isCurrent ? 1 : 1.05,
              }}
              transition={{ duration: 0.75, ease: CROSSFADE_EASE }}
              className="absolute inset-0 will-change-[opacity,transform]"
            >
              <img
                src={item.coverImage}
                alt={item.sceneTitle}
                onError={(e) => {
                  e.currentTarget.src = '/images/campus.jpg'
                }}
                className="h-full w-full object-cover object-center"
              />
              {/* Multi-layered Measured Contrast Scrim for Guaranteed WCAG AA Legibility */}
              <div
                className={`absolute inset-0 bg-gradient-to-t ${item.accentGradient}`}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/45 to-transparent" />
            </motion.div>
          )
        })}
      </div>

      {/* Top Bar Inside Visual Showcase: Role Switcher Pills + Scene Controls */}
      <motion.div
        layout="position"
        className="relative z-10 space-y-2.5 min-[375px]:space-y-3.5 sm:space-y-4 min-w-0"
      >
        <div className="flex items-center justify-between gap-2 min-w-0">
          <motion.div
            layout
            transition={{
              layout: { duration: 0.35, ease: CROSSFADE_EASE },
            }}
            className="inline-flex items-center gap-1.5 min-[375px]:gap-2 rounded-lg sm:rounded-xl bg-black/45 backdrop-blur-md border border-white/15 px-2.5 min-[375px]:px-3 py-1 min-[375px]:py-1.5 text-[10px] min-[375px]:text-xs font-mono text-white/90 min-w-0 flex-1 sm:flex-initial overflow-hidden"
          >
            <Sparkles
              className={`h-3 w-3 min-[375px]:h-3.5 min-[375px]:w-3.5 shrink-0 transition-colors duration-500 ${slide.accentText}`}
            />
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={`badge-${slide.persona}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.28, ease: CROSSFADE_EASE }}
                className="block truncate"
              >
                {slide.roleBadge}
              </motion.span>
            </AnimatePresence>
          </motion.div>

          {/* Prev / Next Scene Controls */}
          <div className="flex items-center gap-1 min-[375px]:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onStepPersona(-1)}
              aria-label="Previous user role showcase"
              className="h-7 w-7 min-[375px]:h-8 min-[375px]:w-8 rounded-lg bg-black/40 hover:bg-black/65 border border-white/15 flex items-center justify-center text-white/85 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5 min-[375px]:h-4 min-[375px]:w-4" />
            </button>
            <button
              type="button"
              onClick={() => onStepPersona(1)}
              aria-label="Next user role showcase"
              className="h-7 w-7 min-[375px]:h-8 min-[375px]:w-8 rounded-lg bg-black/40 hover:bg-black/65 border border-white/15 flex items-center justify-center text-white/85 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="h-3.5 w-3.5 min-[375px]:h-4 min-[375px]:w-4" />
            </button>
          </div>
        </div>

        {/* Interactive 5-Role Showcase Selector Bar — Full 5-Column Usable Grid on <375px & Mobile, Inline Pill Bar on sm+ */}
        <div
          role="tablist"
          aria-label="Explore platform experience by user role"
          className="grid grid-cols-5 gap-1 p-1 w-full sm:w-fit sm:flex sm:items-center sm:gap-1.5 sm:p-1.5 rounded-xl sm:rounded-2xl bg-black/50 backdrop-blur-md border border-white/15 max-w-full"
        >
          {PERSONA_ORDER.map((roleKey) => {
            const item = AUTH_PERSONA_SLIDES[roleKey]
            const Icon = PERSONA_ICONS[roleKey]
            const isSelected = activePersona === roleKey
            return (
              <button
                key={roleKey}
                ref={(el) => {
                  if (tabButtonRefs) {
                    tabButtonRefs.current[roleKey] = el
                  }
                }}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelectPersona(roleKey)}
                className={`relative flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 rounded-lg sm:rounded-xl px-1 sm:px-3 py-1.5 min-h-[44px] sm:min-h-0 text-[10px] min-[375px]:text-[11px] sm:text-xs font-semibold leading-tight transition-colors cursor-pointer min-w-0 sm:whitespace-nowrap sm:shrink-0 ${
                  isSelected
                    ? 'text-white shadow-sm'
                    : 'text-white/75 hover:text-white'
                }`}
              >
                {isSelected && (
                  <motion.span
                    layoutId="authShowcaseRolePill"
                    transition={{
                      type: 'spring',
                      stiffness: 360,
                      damping: 30,
                    }}
                    className="absolute inset-0 rounded-lg sm:rounded-xl bg-white/20 border border-white/30 backdrop-blur-sm"
                  />
                )}
                <Icon className="relative z-10 h-3.5 w-3.5 shrink-0" />
                <span className="relative z-10 max-w-full truncate tracking-tight sm:tracking-normal">
                  {item.shortLabel}
                </span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Middle & Bottom Content: Overlapping Cross-Fade + Smooth Layout Morph */}
      <div className="relative z-10 my-auto pt-4 min-[375px]:pt-6 sm:pt-8 min-w-0">
        <AnimatePresence
          mode="popLayout"
          initial={false}
          custom={slideDirection}
        >
          <motion.div
            key={`showcase-copy-${slide.persona}`}
            layout="position"
            custom={slideDirection}
            initial={{
              opacity: 0,
              y: 12,
              x: slideDirection * 14,
            }}
            animate={{
              opacity: 1,
              y: 0,
              x: 0,
            }}
            exit={{
              opacity: 0,
              y: -8,
              x: slideDirection * -14,
            }}
            transition={{
              opacity: { duration: 0.38, ease: CROSSFADE_EASE },
              y: { duration: 0.42, ease: CROSSFADE_EASE },
              x: { duration: 0.42, ease: CROSSFADE_EASE },
              layout: { duration: 0.4, ease: CROSSFADE_EASE },
            }}
            className="space-y-4 min-[375px]:space-y-5 sm:space-y-6 will-change-[opacity,transform] min-w-0"
          >
            <div className="space-y-2 min-[375px]:space-y-3 max-w-xl min-w-0">
              <div className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] min-[375px]:text-xs font-mono text-white/80">
                <MapPin className={`h-3.5 w-3.5 shrink-0 ${slide.accentText}`} />
                <span className="truncate max-w-full">{slide.sceneTitle}</span>
                <span aria-hidden="true">·</span>
                <span className="text-white/65 truncate max-w-full">
                  {slide.sceneLocation}
                </span>
              </div>
              <h2 className="font-display text-lg min-[375px]:text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-[1.18] sm:leading-[1.15] text-balance">
                {slide.headline}
              </h2>
              <p className="text-xs min-[375px]:text-sm sm:text-base text-white/85 leading-[1.6] sm:leading-[1.7] max-w-lg">
                {slide.description}
              </p>
            </div>

            {/* 3 Quantified Metrics Row — Responsive Sizing for Sub-375px Viewports */}
            <div className="grid grid-cols-3 gap-1.5 min-[375px]:gap-2.5 sm:gap-4 pt-2.5 min-[375px]:pt-3 border-t border-white/15 max-w-xl">
              {slide.stats.map((st, idx) => (
                <motion.div
                  key={st.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.32,
                    delay: 0.05 * idx,
                    ease: CROSSFADE_EASE,
                  }}
                  className="space-y-0.5 min-w-0"
                >
                  <p
                    className={`font-display text-sm min-[375px]:text-base sm:text-2xl font-bold font-mono tabular-nums truncate ${slide.accentText}`}
                  >
                    {st.value}
                  </p>
                  <p className="text-[10px] min-[375px]:text-[11px] sm:text-xs text-white/75 leading-tight sm:leading-snug line-clamp-2">
                    {st.label}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Attributable Member Testimonial Card */}
            <motion.div
              layout
              className="rounded-xl sm:rounded-2xl bg-black/45 backdrop-blur-md border border-white/15 p-3 min-[375px]:p-4 sm:p-5 space-y-2.5 min-[375px]:space-y-3 max-w-xl min-w-0"
            >
              <p className="text-[11px] min-[375px]:text-xs sm:text-sm text-white/90 leading-[1.55] sm:leading-[1.65] italic">
                “{slide.spotlight.quote}”
              </p>
              <div className="flex items-center justify-between gap-2 min-[375px]:gap-3 pt-0.5 min-w-0">
                <div className="flex items-center gap-2 min-[375px]:gap-3 min-w-0">
                  <img
                    src={slide.spotlight.avatar}
                    alt={slide.spotlight.author}
                    onError={(e) => {
                      e.currentTarget.src = '/images/avatar.jpg'
                    }}
                    className="h-8 w-8 min-[375px]:h-9 min-[375px]:w-9 rounded-full object-cover ring-1 ring-white/30 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[11px] min-[375px]:text-xs font-bold text-white truncate">
                      {slide.spotlight.author}
                    </p>
                    <p className="text-[10px] min-[375px]:text-[11px] text-white/75 truncate">
                      {slide.spotlight.role} · {slide.spotlight.cohort}
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-block text-[11px] font-mono text-white/70 shrink-0">
                  Verified Member
                </span>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Slide Progress Dots & Scene Indicator */}
      <motion.div
        layout="position"
        className="relative z-10 pt-3.5 min-[375px]:pt-5 flex items-center justify-between gap-2 border-t border-white/10 mt-4 min-[375px]:mt-6 min-w-0"
      >
        <div
          role="group"
          aria-label="Persona showcase slide indicators"
          className="flex items-center gap-1.5 min-[375px]:gap-2 shrink-0"
        >
          {PERSONA_ORDER.map((roleKey, idx) => {
            const isCurrent = roleKey === activePersona
            const label = AUTH_PERSONA_SLIDES[roleKey].shortLabel
            return (
              <button
                key={`dot-${roleKey}`}
                type="button"
                onClick={() => onSelectPersona(roleKey)}
                aria-label={`Switch to ${label} showcase slide (${idx + 1} of ${PERSONA_ORDER.length})`}
                aria-current={isCurrent ? 'step' : undefined}
                className="group relative py-1.5 px-0.5 cursor-pointer flex items-center"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-500 ${
                    isCurrent
                      ? 'w-6 min-[375px]:w-7 bg-white'
                      : 'w-2 bg-white/35 group-hover:bg-white/60'
                  }`}
                />
              </button>
            )
          })}
        </div>

        <span className="text-[10px] min-[375px]:text-[11px] font-mono text-white/65 tabular-nums truncate">
          0{PERSONA_ORDER.indexOf(activePersona) + 1} / 0{PERSONA_ORDER.length}{' '}
          · {slide.shortLabel} View
        </span>
      </motion.div>
    </motion.div>
  )
}

export function AuthShowcaseLayout({
  activePersona,
  onPersonaChange,
  children,
  modeLabel = 'Unified Identity Portal',
}: AuthShowcaseLayoutProps) {
  const [autoCycle, setAutoCycle] = useState(false)
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1)

  const prevPersonaRef = useRef<PlatformPersona>(activePersona)
  const isFirstRenderRef = useRef(true)
  const layoutMainRef = useRef<HTMLElement | null>(null)
  const showcasePanelRef = useRef<HTMLDivElement>(null)
  const tabButtonRefs = useRef<
    Partial<Record<PlatformPersona, HTMLButtonElement | null>>
  >({})

  // Track slide direction and trigger smooth-scroll alignment when switching persona slides
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      prevPersonaRef.current = activePersona
      return
    }

    const prevIdx = PERSONA_ORDER.indexOf(prevPersonaRef.current)
    const nextIdx = PERSONA_ORDER.indexOf(activePersona)
    if (prevIdx !== nextIdx) {
      setSlideDirection(nextIdx > prevIdx ? 1 : -1)
      prevPersonaRef.current = activePersona
    }

    // Smooth-scroll the active role tab button into center view inside the tab bar
    const activeTabButton = tabButtonRefs.current[activePersona]
    if (activeTabButton) {
      activeTabButton.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }

    // Smooth-scroll layout alignment if user has scrolled partially away on compact viewports
    if (
      typeof window !== 'undefined' &&
      window.scrollY > 120 &&
      showcasePanelRef.current
    ) {
      const rect = showcasePanelRef.current.getBoundingClientRect()
      if (rect.top < -40 || rect.top > window.innerHeight * 0.65) {
        showcasePanelRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      }
    }
  }, [activePersona])

  useEffect(() => {
    if (!autoCycle) return
    const timer = window.setInterval(() => {
      const idx = PERSONA_ORDER.indexOf(activePersona)
      const next = PERSONA_ORDER[(idx + 1) % PERSONA_ORDER.length]
      setSlideDirection(1)
      onPersonaChange(next)
    }, 6500)
    return () => window.clearInterval(timer)
  }, [autoCycle, activePersona, onPersonaChange])

  const handleSelectPersonaSlide = (targetPersona: PlatformPersona) => {
    setAutoCycle(false)
    if (targetPersona === activePersona) return
    const currentIdx = PERSONA_ORDER.indexOf(activePersona)
    const nextIdx = PERSONA_ORDER.indexOf(targetPersona)
    setSlideDirection(nextIdx >= currentIdx ? 1 : -1)
    onPersonaChange(targetPersona)
  }

  const handleStepPersona = (dir: -1 | 1) => {
    setAutoCycle(false)
    setSlideDirection(dir)
    const idx = PERSONA_ORDER.indexOf(activePersona)
    const next =
      PERSONA_ORDER[(idx + dir + PERSONA_ORDER.length) % PERSONA_ORDER.length]
    onPersonaChange(next)
  }

  return (
    <main
      ref={layoutMainRef}
      className="relative min-h-screen w-full bg-background text-foreground flex flex-col justify-between overflow-x-hidden scroll-smooth selection:bg-primary selection:text-white"
    >
      {/* Full-Viewport Ambient Photographic Backdrop with True Overlapping Cross-Fade */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        {PERSONA_ORDER.map((roleKey) => {
          const item = AUTH_PERSONA_SLIDES[roleKey]
          const isCurrent = roleKey === activePersona
          return (
            <motion.img
              key={`ambient-layer-${roleKey}`}
              src={item.coverImage}
              alt=""
              initial={false}
              animate={{
                opacity: isCurrent ? 0.18 : 0,
                scale: isCurrent ? 1.02 : 1.08,
              }}
              transition={{ duration: 0.9, ease: CROSSFADE_EASE }}
              onError={(e) => {
                e.currentTarget.src = '/images/campus.jpg'
              }}
              className="absolute inset-0 h-full w-full object-cover blur-2xl saturate-150 will-change-[opacity,transform]"
            />
          )
        })}
        <div className="absolute inset-0 bg-gradient-to-br from-background/92 via-background/85 to-background/95 dark:from-background/95 dark:via-background/88 dark:to-background/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(13,110,91,0.14),transparent_45%),radial-gradient(circle_at_85%_80%,rgba(217,119,6,0.12),transparent_45%)]" />
      </div>

      {/* Top Glass Navigation Bar — Compact & Collision-Free on Sub-375px Devices */}
      <header className="relative z-20 w-full max-w-[1400px] mx-auto px-2.5 min-[375px]:px-4 sm:px-6 lg:px-8 pt-3 min-[375px]:pt-4 sm:pt-5 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 min-[375px]:gap-2 rounded-xl border border-border/80 bg-card/80 backdrop-blur-md px-2.5 min-[375px]:px-3.5 py-1.5 min-[375px]:py-2 text-[11px] min-[375px]:text-xs font-semibold text-foreground hover:border-primary/50 hover:text-primary transition-colors shadow-xs shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden min-[360px]:inline">Back to Home</span>
            <span className="min-[360px]:hidden">Home</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2.5 pl-1 min-w-0">
            <img
              src="/images/university-logo.jpg"
              alt="Sukkur IBA University"
              className="h-8 w-8 rounded-lg object-cover ring-1 ring-border shadow-xs shrink-0"
            />
            <span className="font-display font-bold text-sm tracking-tight text-foreground truncate">
              Sukkur IBA AlumniConnect
            </span>
            <span aria-hidden="true" className="text-border">
              ·
            </span>
            <span className="text-xs font-mono text-secondary truncate">
              {modeLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 min-[375px]:gap-2.5 shrink-0">
          <span className="sm:hidden text-[10px] min-[375px]:text-[11px] font-mono text-secondary truncate max-w-[130px] min-[375px]:max-w-[170px]">
            {modeLabel}
          </span>
          {/* Interactive Scene Auto-Tour Toggle */}
          <button
            type="button"
            onClick={() => setAutoCycle((prev) => !prev)}
            className={`hidden md:inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-mono font-medium transition-colors cursor-pointer ${
              autoCycle
                ? 'border-primary bg-primary/10 text-primary dark:text-accent'
                : 'border-border/80 bg-card/80 text-secondary hover:text-foreground'
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            <span>{autoCycle ? 'Scene Tour: On' : 'Auto-Tour Scenes'}</span>
          </button>
          <ThemeSwitcher showLabel={false} />
        </div>
      </header>

      {/* Main Split-Column Container (1400px Desktop Presence with Sub-375px Mobile Optimization) */}
      <LayoutGroup id="auth-showcase-fluid-layout">
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-2.5 min-[375px]:px-4 sm:px-6 lg:px-8 py-3.5 min-[375px]:py-6 sm:py-8 flex-1 flex items-center">
          <motion.div
            layout
            transition={{
              layout: { duration: 0.45, ease: CROSSFADE_EASE },
            }}
            className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 min-[375px]:gap-6 lg:gap-8 items-stretch"
          >
            {/* Left Column (7 cols on lg): Interactive Role-Adaptive Campus & Community Showcase */}
            <AuthPersonaSlide
              activePersona={activePersona}
              slideDirection={slideDirection}
              onSelectPersona={handleSelectPersonaSlide}
              onStepPersona={handleStepPersona}
              panelRef={showcasePanelRef}
              tabButtonRefs={tabButtonRefs}
            />

            {/* Right Column (5 cols on lg): Interactive Authentication Form Card with Fluid Layout Transition */}
            <motion.div
              layout
              transition={{
                layout: { duration: 0.42, ease: CROSSFADE_EASE },
              }}
              className="lg:col-span-5 flex flex-col justify-center min-w-0"
            >
              {children}
            </motion.div>
          </motion.div>
        </div>
      </LayoutGroup>

      {/* Quiet Institutional Footer */}
      <footer className="relative z-10 w-full max-w-[1400px] mx-auto px-2.5 min-[375px]:px-4 sm:px-6 lg:px-8 pb-4 pt-2 flex flex-col min-[480px]:flex-row items-center justify-between gap-2 sm:gap-3 text-[11px] sm:text-xs text-secondary text-center min-[480px]:text-left">
        <span>
          © {new Date().getFullYear()} Sukkur IBA University · AlumniConnect
          Registry
        </span>
        <div className="flex items-center gap-3 min-[375px]:gap-4">
          <Link to="/" className="hover:text-foreground transition-colors">
            Platform Overview
          </Link>
          <span>·</span>
          <Link to="/login" className="hover:text-foreground transition-colors">
            Sign In
          </Link>
          <span>·</span>
          <Link
            to="/register"
            className="hover:text-foreground transition-colors"
          >
            Claim Profile
          </Link>
        </div>
      </footer>
    </main>
  )
}

