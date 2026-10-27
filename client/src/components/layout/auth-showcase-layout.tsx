import { useState, useEffect, useRef, useMemo, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, LayoutGroup, type Variants } from 'framer-motion'
import {
  ArrowLeft,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  FileCheck2,
  GraduationCap,
  HelpCircle,
  MailCheck,
  MapPin,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { type PlatformPersona } from '@/lib/role-context'
import { toast } from '@/lib/toast'

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

export const FAQ_LIST_CONTAINER_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.14,
      ease: CROSSFADE_EASE,
    },
  },
}

export const FAQ_LIST_ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.99 },
  visible: (index: number = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 310,
      damping: 28,
      mass: 0.75,
      delay: index * 0.04,
    },
  }),
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.985,
    transition: {
      duration: 0.16,
      ease: CROSSFADE_EASE,
    },
  },
}

interface AuthShowcaseLayoutProps {
  activePersona: PlatformPersona
  onPersonaChange: (persona: PlatformPersona) => void
  children: ReactNode
  modeLabel?: string
  showVerificationFaq?: boolean
}

export type VerificationFaqCategory =
  | 'ALL'
  | 'CMS_TRANSCRIPT'
  | 'EMAIL_DOMAIN'
  | 'PARTNER_MENTOR'
  | 'SLA_SUPPORT'

export interface VerificationFaqItem {
  id: string
  question: string
  answer: string
  category: Exclude<VerificationFaqCategory, 'ALL'>
  categoryLabel: string
  slaTag: string
  relevantPersonas: ReadonlyArray<PlatformPersona>
  verificationSteps: ReadonlyArray<string>
}

export const ACCOUNT_VERIFICATION_FAQS: ReadonlyArray<VerificationFaqItem> = [
  {
    id: 'cms-hec-matching',
    question:
      'How does Sukkur IBA AlumniConnect verify my graduate or student identity?',
    answer:
      'When you register or sign in, the platform cross-references your full name, degree department, and graduation/enrollment cohort against the Sukkur IBA University Campus Management System (CMS) and the Office of Examinations & Registrar ledger. If an exact match is found with your institutional record, your Verified Member status is granted automatically.',
    category: 'CMS_TRANSCRIPT',
    categoryLabel: 'CMS & Transcripts',
    slaTag: 'Automated Registry Sync',
    relevantPersonas: ['STUDENT', 'ALUMNI', 'MENTOR'],
    verificationSteps: [
      'Matches Full Name + Degree Department + Cohort Year against Sukkur IBA CMS records',
      'Cross-checks HEC-attested graduation serials for Alumni (Classes of 1998–2025)',
      'Unlocks verified badge for directory search, referral requests, and chapter RSVPs',
    ],
  },
  {
    id: 'institutional-vs-external-email',
    question:
      'Can I register or sign in if I no longer have access to my @iba-suk.edu.pk email?',
    answer:
      'Yes. While active students and recent graduates who use an @iba-suk.edu.pk or @alumni.iba-suk.edu.pk address receive instant automated verification, alumni from earlier cohorts can register using a personal or work email. Our Advancement Desk matches your cohort year, department, and CMS enrollment record so you can sign in seamlessly with your preferred email.',
    category: 'EMAIL_DOMAIN',
    categoryLabel: 'Email & Domains',
    slaTag: 'Supports Institutional & External Email',
    relevantPersonas: ['ALUMNI', 'MENTOR', 'STUDENT'],
    verificationSteps: [
      'Instant auto-verification for active @iba-suk.edu.pk and @alumni.iba-suk.edu.pk addresses',
      'Personal or corporate email allowed for graduated alumni cohorts',
      'Optional secondary match via CMS Enrollment ID or degree transcript reference',
    ],
  },
  {
    id: 'verification-turnaround-sla',
    question:
      'How long does account verification take after submitting my registration?',
    answer:
      'Verification turnaround depends on your account type and email domain. Institutional @iba-suk.edu.pk accounts verify in under 2 minutes via live CMS lookup. Alumni registering with external emails are verified within 12–24 business hours by the Alumni Advancement Directorate, while Corporate Employer Partners complete vetting within 24–36 business hours.',
    category: 'SLA_SUPPORT',
    categoryLabel: 'SLA & Support',
    slaTag: '< 2 Min (CMS) · 12–24h (Manual)',
    relevantPersonas: ['STUDENT', 'ALUMNI', 'MENTOR', 'EMPLOYER', 'ADMIN'],
    verificationSteps: [
      'Under 2 minutes: Student & Alumni accounts using @iba-suk.edu.pk credentials',
      '12–24 business hours: Alumni profiles registered with external or corporate emails',
      '24–36 business hours: Corporate Employer Partner domain and recruiter verification',
    ],
  },
  {
    id: 'employer-partner-vetting',
    question:
      'How are Corporate Hiring Partners (Employer accounts) verified before posting employment roles?',
    answer:
      'To protect students and alumni from unverified employment listings, Corporate Hiring Partners must register with an official company domain email (e.g., @systems-ltd.com, not generic webmail). The Sukkur IBA Career Services & Corporate Linkages Office validates the company registry and links your portal to verified Sukkur IBA alumni champions inside your organization for referral-backed employment and hiring.',
    category: 'PARTNER_MENTOR',
    categoryLabel: 'Employer & Mentor Vetting',
    slaTag: 'Corporate Domain Required',
    relevantPersonas: ['EMPLOYER', 'ADMIN'],
    verificationSteps: [
      'Requires official corporate domain email matching registered employment organization',
      'Reviewed by Sukkur IBA Career Services & Corporate Linkages Directorate',
      'Enables campus drive scheduling, verified transcript badges, and alumni referral routing',
    ],
  },
  {
    id: 'mentor-guild-eligibility',
    question:
      'What is required to unlock Verified Alumni Mentor (Mentorship Guild) status?',
    answer:
      'Verified Sukkur IBA graduates with at least 2 years of industry engineering, finance, management, or international postgraduate fellowship experience (such as Fulbright, DAAD, Erasmus Mundus, or Commonwealth) can enroll directly in the Mentorship Guild. Once verified, you can publish 1-on-1 office hours, host mock technical interviews, and review student fellowship applications.',
    category: 'PARTNER_MENTOR',
    categoryLabel: 'Employer & Mentor Vetting',
    slaTag: '2+ Years Industry or Fellowship Track',
    relevantPersonas: ['MENTOR', 'ALUMNI', 'STUDENT'],
    verificationSteps: [
      'Base Alumni degree verification completed via Sukkur IBA Registrar records',
      'Validation of current industry role, research track, or global scholarship placement',
      'Activates Mentor Workspace (/mentor) with calendar slot publishing and mentee tracking',
    ],
  },
  {
    id: 'provisional-access-and-appeals',
    question:
      'What can I access while verification is pending, and how do I resolve a cohort mismatch?',
    answer:
      'During provisional review, you can sign in, complete your academic and career profile, and browse public campus events. To safeguard member privacy, direct alumni messaging, mentor session booking, and internal job referral requests unlock immediately upon verification. If your graduation year or name spelling changed since convocation, contact advancement@iba-suk.edu.pk for priority manual reconciliation.',
    category: 'SLA_SUPPORT',
    categoryLabel: 'SLA & Support',
    slaTag: 'Priority Desk: advancement@iba-suk.edu.pk',
    relevantPersonas: ['STUDENT', 'ALUMNI', 'MENTOR', 'EMPLOYER', 'ADMIN'],
    verificationSteps: [
      'Immediate sign-in access to configure profile, resume, and notification preferences',
      'Full directory messaging, referral backing, and chapter voting unlock post-verification',
      'Fast-track name or cohort reconciliation via Sukkur IBA Advancement Secretariat',
    ],
  },
]

const PERSONA_VERIFICATION_PROTOCOLS: Record<
  PlatformPersona,
  {
    protocolTitle: string
    authority: string
    turnaround: string
    requirementSummary: string
    defaultFaqId: string
  }
> = {
  STUDENT: {
    protocolTitle: 'Student Scholar CMS Verification Protocol',
    authority: 'Office of the Registrar & CMS Directory',
    turnaround: 'Instant (< 2 mins with @iba-suk.edu.pk)',
    requirementSummary:
      'Requires active @iba-suk.edu.pk student email and expected graduation cohort.',
    defaultFaqId: 'cms-hec-matching',
  },
  ALUMNI: {
    protocolTitle: 'Graduate Convocation & Cohort Verification',
    authority: 'Alumni Advancement & Examination Registry',
    turnaround: 'Instant (@iba-suk.edu.pk) · 12–24h (External Email)',
    requirementSummary:
      'Matches degree department and graduating class against Sukkur IBA convocation rolls.',
    defaultFaqId: 'institutional-vs-external-email',
  },
  MENTOR: {
    protocolTitle: 'Mentorship Guild & Fellow Credential Vetting',
    authority: 'Alumni Mentorship Guild & Career Services',
    turnaround: 'Instant for Verified Alumni · < 24h Guild Review',
    requirementSummary:
      'Verified graduate status + industry leadership or global fellowship track.',
    defaultFaqId: 'mentor-guild-eligibility',
  },
  EMPLOYER: {
    protocolTitle: 'Corporate Hiring Partner & Domain Vetting',
    authority: 'Career Services & Corporate Linkages Office',
    turnaround: '24–36 Business Hours Partner Approval',
    requirementSummary:
      'Official corporate email domain and company representative verification.',
    defaultFaqId: 'employer-partner-vetting',
  },
  ADMIN: {
    protocolTitle: 'Institutional Directorate & RBAC Governance',
    authority: 'Sukkur IBA University Secretariat & IT Security',
    turnaround: 'Role-Assigned Staff Credentials Only',
    requirementSummary:
      'Restricted to authorized Advancement, Registry, and Career Services officers.',
    defaultFaqId: 'provisional-access-and-appeals',
  },
}

const FAQ_CATEGORIES: ReadonlyArray<{
  id: VerificationFaqCategory
  label: string
}> = [
  { id: 'ALL', label: 'All Verification Topics' },
  { id: 'CMS_TRANSCRIPT', label: 'CMS & Transcripts' },
  { id: 'EMAIL_DOMAIN', label: 'Email & Domains' },
  { id: 'PARTNER_MENTOR', label: 'Employer & Mentor Vetting' },
  { id: 'SLA_SUPPORT', label: 'Turnaround & Support' },
]

export const FAQ_QUICK_FILTER_TERMS = [
  'Verification',
  'Mentorship',
  'Employment',
  'Transcript',
  'Email',
] as const

export interface AuthVerificationFaqSectionProps {
  activePersona: PlatformPersona
  isRegisterScreen: boolean
  onSelectPersona?: (persona: PlatformPersona) => void
}

export function AuthVerificationFaqSection({
  activePersona,
  isRegisterScreen,
  onSelectPersona,
}: AuthVerificationFaqSectionProps) {
  const personaProtocol = PERSONA_VERIFICATION_PROTOCOLS[activePersona]
  const personaSlide = AUTH_PERSONA_SLIDES[activePersona]

  const [selectedCategory, setSelectedCategory] =
    useState<VerificationFaqCategory>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [openIds, setOpenIds] = useState<string[]>(() => [
    PERSONA_VERIFICATION_PROTOCOLS[activePersona].defaultFaqId,
    isRegisterScreen
      ? 'verification-turnaround-sla'
      : 'institutional-vs-external-email',
  ])

  // Keep the recommended FAQ for the active persona expanded when switching roles
  useEffect(() => {
    const recommendedId =
      PERSONA_VERIFICATION_PROTOCOLS[activePersona].defaultFaqId
    setOpenIds((prev) =>
      prev.includes(recommendedId) ? prev : [recommendedId, ...prev.slice(0, 1)],
    )
  }, [activePersona])

  const filteredFaqs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    const matching = ACCOUNT_VERIFICATION_FAQS.filter((item) => {
      const matchesCategory =
        selectedCategory === 'ALL' || item.category === selectedCategory
      if (!matchesCategory) return false
      if (!normalizedQuery) return true
      return (
        item.question.toLowerCase().includes(normalizedQuery) ||
        item.answer.toLowerCase().includes(normalizedQuery) ||
        item.categoryLabel.toLowerCase().includes(normalizedQuery) ||
        item.verificationSteps.some((step) =>
          step.toLowerCase().includes(normalizedQuery),
        )
      )
    })

    // Sort FAQs relevant to the currently selected persona first when viewing ALL
    return [...matching].sort((a, b) => {
      const aRecommended = a.id === personaProtocol.defaultFaqId ? 2 : 0
      const bRecommended = b.id === personaProtocol.defaultFaqId ? 2 : 0
      const aRelevant = a.relevantPersonas.includes(activePersona) ? 1 : 0
      const bRelevant = b.relevantPersonas.includes(activePersona) ? 1 : 0
      return bRecommended + bRelevant - (aRecommended + aRelevant)
    })
  }, [selectedCategory, searchQuery, activePersona, personaProtocol.defaultFaqId])

  const allFilteredOpen =
    filteredFaqs.length > 0 &&
    filteredFaqs.every((item) => openIds.includes(item.id))

  const handleToggleItem = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handleToggleExpandAll = () => {
    if (allFilteredOpen) {
      setOpenIds([])
    } else {
      setOpenIds(filteredFaqs.map((item) => item.id))
    }
  }

  return (
    <section
      id="account-verification-faq"
      aria-labelledby="account-verification-faq-heading"
      className="relative z-10 w-full max-w-[1400px] mx-auto px-2.5 min-[375px]:px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 pt-2"
    >
      <div className="rounded-2xl sm:rounded-3xl border border-border/90 bg-card/90 dark:bg-card/85 backdrop-blur-xl p-4 min-[375px]:p-6 sm:p-8 lg:p-10 shadow-[0_20px_50px_-18px_rgba(9,20,34,0.14)] space-y-6 sm:space-y-8">
        {/* Top Section Header + Role-Specific Verification Protocol Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start pb-6 border-b border-border/80">
          <div className="lg:col-span-7 space-y-2.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono text-primary dark:text-accent">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span className="font-semibold uppercase tracking-wider">
                Account Verification & Registry FAQ
              </span>
              <span aria-hidden="true" className="text-border">
                ·
              </span>
              <span className="text-secondary">
                {isRegisterScreen
                  ? 'New Profile & Partner Onboarding'
                  : 'Sign-In & Credential Verification'}
              </span>
            </div>

            <h2
              id="account-verification-faq-heading"
              className="font-display text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground"
            >
              Common Questions About Sukkur IBA Account Verification
            </h2>

            <p className="text-xs sm:text-sm text-secondary leading-relaxed max-w-2xl">
              Every Student, Alumni, Mentor, and Corporate Partner account on
              AlumniConnect is verified against official Sukkur IBA University
              CMS and Registrar records to maintain a trusted, spam-free global
              network.
            </p>
          </div>

          {/* Active Persona Verification Protocol Callout */}
          <div className="lg:col-span-5 rounded-2xl border border-primary/25 bg-primary/5 dark:bg-primary/10 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <FileCheck2 className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs font-mono font-semibold text-primary dark:text-accent truncate">
                  {personaSlide.shortLabel} Verification Standard
                </span>
              </div>
              <span className="text-[11px] font-mono text-secondary shrink-0">
                Active Role View
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">
                {personaProtocol.protocolTitle}
              </p>
              <p className="text-xs text-secondary leading-relaxed">
                {personaProtocol.requirementSummary}
              </p>
            </div>

            <div className="pt-2 border-t border-border/70 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-mono text-secondary">
              <span className="inline-flex items-center gap-1 text-foreground font-semibold">
                <Clock className="h-3 w-3 text-primary" />
                {personaProtocol.turnaround}
              </span>
              <span aria-hidden="true">·</span>
              <span>{personaProtocol.authority}</span>
            </div>
          </div>
        </div>

        {/* Interactive Controls Bar: Category Filter Tabs + Search Input + Expand/Collapse All */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          {/* Category Filter Buttons */}
          <div
            role="tablist"
            aria-label="Filter account verification questions by topic"
            className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar"
          >
            {FAQ_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                    isSelected
                      ? 'bg-primary text-white dark:text-slate-950 border-primary shadow-xs'
                      : 'bg-background/80 text-secondary hover:text-foreground border-border/80 hover:border-primary/40'
                  }`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>

          {/* Search Input & Expand/Collapse Toggle */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-secondary" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search CMS, email, SLA..."
                aria-label="Search account verification FAQs"
                className="w-full h-9 pl-8 pr-8 rounded-xl border border-border/80 bg-background/90 text-xs text-foreground placeholder:text-secondary focus:outline-none focus:border-primary transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear FAQ search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary hover:text-foreground cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleToggleExpandAll}
              className="h-9 px-3 rounded-xl border border-border/80 bg-background/80 hover:border-primary/40 text-xs font-mono font-semibold text-secondary hover:text-foreground transition-colors whitespace-nowrap cursor-pointer shrink-0"
            >
              {allFilteredOpen ? 'Collapse All' : 'Expand All'}
            </button>
          </div>
        </div>

        {/* Quick-Filter Buttons Row to Dynamically Update the Search Filter State */}
        <div
          role="group"
          aria-label="Quick-filter FAQ search terms"
          className="flex flex-wrap items-center gap-2 pt-1"
        >
          <span className="text-[11px] font-mono uppercase tracking-wider text-secondary mr-1">
            Quick Filters:
          </span>
          <button
            type="button"
            aria-pressed={searchQuery.trim() === ''}
            onClick={() => setSearchQuery('')}
            className={`rounded-lg px-2.5 py-1 text-xs font-mono font-semibold transition-colors cursor-pointer border ${
              searchQuery.trim() === ''
                ? 'bg-primary text-white dark:text-slate-950 border-primary'
                : 'bg-background/75 text-secondary hover:text-foreground border-border/80 hover:border-primary/40'
            }`}
          >
            All
          </button>
          {FAQ_QUICK_FILTER_TERMS.map((term) => {
            const isTermActive =
              searchQuery.trim().toLowerCase() === term.toLowerCase()
            return (
              <button
                key={term}
                type="button"
                aria-pressed={isTermActive}
                onClick={() =>
                  setSearchQuery((prev) =>
                    prev.trim().toLowerCase() === term.toLowerCase() ? '' : term,
                  )
                }
                className={`rounded-lg px-2.5 py-1 text-xs font-mono font-semibold transition-colors cursor-pointer border ${
                  isTermActive
                    ? 'bg-primary text-white dark:text-slate-950 border-primary'
                    : 'bg-background/75 text-secondary hover:text-foreground border-border/80 hover:border-primary/40'
                }`}
              >
                {term}
              </button>
            )
          })}
        </div>

        {/* Accordion FAQ List with Staggered Framer Motion Filter Animation */}
        <LayoutGroup id="verification-faq-accordion">
          <AnimatePresence mode="wait" initial={false}>
            {filteredFaqs.length === 0 ? (
              <motion.div
                key={`faq-empty-${selectedCategory}-${searchQuery.trim().toLowerCase()}`}
                initial={{ opacity: 0, y: 10, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.99 }}
                transition={{ duration: 0.22, ease: CROSSFADE_EASE }}
                className="rounded-2xl border border-border/80 bg-background/60 p-8 text-center space-y-3"
              >
                <HelpCircle className="h-7 w-7 text-secondary mx-auto" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    No verification questions matched “{searchQuery}”
                  </p>
                  <p className="text-xs text-secondary">
                    Try clearing your search filter or switching to All Verification
                    Topics.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('ALL')
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/15 transition-colors cursor-pointer"
                >
                  Reset FAQ Filters
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={`faq-list-${selectedCategory}-${activePersona}-${searchQuery.trim().toLowerCase()}`}
                variants={FAQ_LIST_CONTAINER_VARIANTS}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4 items-start"
              >
                {filteredFaqs.map((item, index) => {
                  const isOpen = openIds.includes(item.id)
                  const isRecommendedForRole =
                    item.id === personaProtocol.defaultFaqId
                  const isRelevantToRole =
                    item.relevantPersonas.includes(activePersona)
                  const panelId = `faq-panel-${item.id}`
                  const triggerId = `faq-trigger-${item.id}`

                  return (
                    <motion.div
                      key={item.id}
                      layout="position"
                      custom={index}
                      variants={FAQ_LIST_ITEM_VARIANTS}
                      className={`rounded-2xl border transition-colors ${
                        isOpen
                          ? 'border-primary/45 bg-background/95 shadow-xs'
                          : 'border-border/80 bg-background/65 hover:border-border'
                      }`}
                    >
                      <h3>
                        <button
                          id={triggerId}
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          onClick={() => handleToggleItem(item.id)}
                          className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-3.5 cursor-pointer"
                        >
                          <div className="space-y-1.5 min-w-0">
                            {/* Unboxed Typographic Metadata Line (Zero-Pill Discipline) */}
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-mono text-secondary">
                              <span className="text-primary dark:text-accent font-semibold">
                                {item.categoryLabel}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{item.slaTag}</span>
                              {isRecommendedForRole && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                    Key for {personaSlide.shortLabel}s
                                  </span>
                                </>
                              )}
                            </div>

                            <p className="font-display text-sm sm:text-base font-bold text-foreground leading-snug">
                              {item.question}
                            </p>
                          </div>

                          <span
                            aria-hidden="true"
                            className={`mt-0.5 h-7 w-7 rounded-lg border flex items-center justify-center shrink-0 transition-transform duration-200 ${
                              isOpen
                                ? 'rotate-180 border-primary/40 bg-primary/10 text-primary'
                                : 'border-border/80 bg-card text-secondary'
                            }`}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </span>
                        </button>
                      </h3>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            id={panelId}
                            role="region"
                            aria-labelledby={triggerId}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.24, ease: CROSSFADE_EASE }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 border-t border-border/60 space-y-3.5">
                              <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                                {item.answer}
                              </p>

                              {/* Verification Checklist Steps */}
                              <div className="rounded-xl bg-stone/45 dark:bg-stone/30 border border-border/70 p-3 space-y-1.5">
                                <p className="text-[11px] font-mono uppercase tracking-wider font-semibold text-foreground">
                                  Verification Checklist & Criteria
                                </p>
                                <ul className="space-y-1.5">
                                  {item.verificationSteps.map((step) => (
                                    <li
                                      key={step}
                                      className="flex items-start gap-2 text-xs text-secondary leading-snug"
                                    >
                                      <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                                      <span>{step}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Applicable Personas Row with Interactive Role Switch */}
                              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-[11px] font-mono text-secondary">
                                <span>
                                  Applies to:{' '}
                                  {item.relevantPersonas
                                    .map((p) => AUTH_PERSONA_SLIDES[p].shortLabel)
                                    .join(' · ')}
                                </span>
                                {!isRelevantToRole && onSelectPersona && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onSelectPersona(item.relevantPersonas[0])
                                    }
                                    className="text-primary hover:underline font-semibold cursor-pointer"
                                  >
                                    Switch to{' '}
                                    {
                                      AUTH_PERSONA_SLIDES[item.relevantPersonas[0]]
                                        .shortLabel
                                    }{' '}
                                    View →
                                  </button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </LayoutGroup>

        {/* Bottom Institutional Verification Support Strip */}
        <div className="rounded-2xl border border-border/80 bg-stone/40 dark:bg-stone/25 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0 mt-0.5">
              <MailCheck className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs sm:text-sm font-bold text-foreground">
                Need manual transcript or employer domain verification assistance?
              </p>
              <p className="text-xs text-secondary leading-relaxed">
                 Sukkur IBA Alumni Advancement & Registrar Helpdesk ·{' '}
                <span className="font-mono text-foreground">
                  advancement@iba-suk.edu.pk
                </span>{' '}
                · Nisar Ahmed Siddiqui Road, Sukkur
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            {isRegisterScreen ? (
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:border-primary/45 hover:text-primary transition-colors w-full sm:w-auto"
              >
                Already Verified? Sign In
              </Link>
            ) : (
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-xl border border-primary/35 bg-primary/10 px-3.5 py-2 text-xs font-semibold text-primary hover:bg-primary/15 transition-colors w-full sm:w-auto"
              >
                New Member? Claim Verified Profile
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

const AUTO_TOUR_INTERVAL_MS = 6500

export interface PersonaSlideSharePayload {
  title: string
  text: string
  url: string
  clipboardText: string
}

/**
 * Formats the current persona slide's details for the Web Share API and clipboard invitation copy.
 */
export function formatPersonaSlideShareDetails(
  slide: AuthPersonaSlide,
  currentHref?: string,
): PersonaSlideSharePayload {
  const shareUrl = (() => {
    const rawHref =
      currentHref ??
      (typeof window !== 'undefined'
        ? window.location.href
        : 'https://alumniconnect.iba-suk.edu.pk/login')
    try {
      const url = new URL(rawHref)
      url.searchParams.set('role', slide.persona.toLowerCase())
      return url.toString()
    } catch {
      return rawHref
    }
  })()

  const statsSummary = slide.stats
    .map((st) => `${st.value} ${st.label}`)
    .join(' · ')

  const title = `Sukkur IBA AlumniConnect · ${slide.shortLabel} Portal (${slide.roleBadge})`
  const text = `${slide.headline} — ${slide.description} (${statsSummary})`

  const clipboardText = [
    title,
    `Location: ${slide.sceneTitle} · ${slide.sceneLocation}`,
    '',
    slide.headline,
    slide.description,
    `Key Highlights: ${statsSummary}`,
    `“${slide.spotlight.quote}” — ${slide.spotlight.author} (${slide.spotlight.role}, ${slide.spotlight.cohort})`,
    '',
    `Join or explore the ${slide.shortLabel} portal: ${shareUrl}`,
  ].join('\n')

  return {
    title,
    text,
    url: shareUrl,
    clipboardText,
  }
}

export interface AuthPersonaSlideProps {
  activePersona: PlatformPersona
  slideDirection: 1 | -1
  onSelectPersona: (persona: PlatformPersona) => void
  onStepPersona: (dir: -1 | 1) => void
  autoCycle?: boolean
  autoCycleDurationMs?: number
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
  autoCycle = false,
  autoCycleDurationMs = AUTO_TOUR_INTERVAL_MS,
  panelRef,
  tabButtonRefs,
}: AuthPersonaSlideProps) {
  const slide = AUTH_PERSONA_SLIDES[activePersona]
  const activeStepIndex = PERSONA_ORDER.indexOf(activePersona)
  const stepDurationSec = autoCycleDurationMs / 1000
  const [shareStatus, setShareStatus] = useState<'idle' | 'shared' | 'copied'>(
    'idle',
  )
  const shareResetTimerRef = useRef<number | null>(null)

  useEffect(() => {
    setShareStatus('idle')
  }, [activePersona])

  useEffect(() => {
    return () => {
      if (shareResetTimerRef.current !== null) {
        window.clearTimeout(shareResetTimerRef.current)
      }
    }
  }, [])

  const triggerShareFeedback = (nextStatus: 'shared' | 'copied') => {
    setShareStatus(nextStatus)
    if (shareResetTimerRef.current !== null) {
      window.clearTimeout(shareResetTimerRef.current)
    }
    shareResetTimerRef.current = window.setTimeout(() => {
      setShareStatus('idle')
    }, 2800)
  }

  const copyTextToClipboard = async (text: string): Promise<boolean> => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text)
        return true
      } catch {
        // Fallback to hidden textarea copy below if clipboard API is restricted
      }
    }

    if (typeof document !== 'undefined') {
      try {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.setAttribute('readonly', '')
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        textArea.style.pointerEvents = 'none'
        document.body.appendChild(textArea)
        textArea.select()
        const copied = document.execCommand('copy')
        document.body.removeChild(textArea)
        return copied
      } catch {
        return false
      }
    }
    return false
  }

  const handleSharePersonaSlide = async () => {
    const payload = formatPersonaSlideShareDetails(slide)

    // Always copy the full persona slide details to the clipboard so alumni can immediately paste the invite
    const copiedToClipboard = await copyTextToClipboard(payload.clipboardText)

    // Invoke the native Web Share API when supported by the browser/device
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function'
    ) {
      const shareData: ShareData = {
        title: payload.title,
        text: payload.clipboardText,
        url: payload.url,
      }

      const canUseWebShare =
        typeof navigator.canShare !== 'function' ||
        navigator.canShare(shareData)

      if (canUseWebShare) {
        try {
          await navigator.share(shareData)
          triggerShareFeedback('shared')
          toast({
            title: `${slide.shortLabel} Slide Shared`,
            description: `Shared ${slide.shortLabel} invite via Web Share API and copied details to clipboard.`,
            variant: 'success',
          })
          return
        } catch (err) {
          // If the user dismissed the native share sheet or iframe blocked Web Share,
          // surface the clipboard copy confirmation instead.
          if (err instanceof Error && err.name === 'AbortError') {
            if (copiedToClipboard) {
              triggerShareFeedback('copied')
              toast({
                title: `${slide.shortLabel} Slide Details Copied`,
                description: `Copied ${slide.shortLabel} headline, metrics, and invite link to your clipboard.`,
              })
            }
            return
          }
        }
      }
    }

    triggerShareFeedback('copied')
    toast({
      title: `${slide.shortLabel} Slide Details Copied`,
      description: `Copied ${slide.shortLabel} headline, metrics, and invite link to your clipboard.`,
      variant: 'success',
    })
  }

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

      {/* Subtle Top Linear Progress Bar for Auto-Tour Scenes */}
      <AnimatePresence initial={false}>
        {autoCycle && (
          <motion.div
            key="auth-persona-auto-tour-progress"
            role="progressbar"
            aria-label={`Auto-tour scene progress: step ${activeStepIndex + 1} of ${PERSONA_ORDER.length} (${slide.shortLabel})`}
            aria-valuemin={1}
            aria-valuemax={PERSONA_ORDER.length}
            aria-valuenow={activeStepIndex + 1}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.28, ease: CROSSFADE_EASE }}
            className="pointer-events-none absolute top-0 inset-x-0 z-20"
          >
            {/* Flush top-edge segmented linear progress track */}
            <div className="grid grid-cols-5 gap-1 px-3.5 min-[375px]:px-5 sm:px-8 lg:px-10 pt-2 sm:pt-2.5">
              {PERSONA_ORDER.map((roleKey, idx) => {
                const isPast = idx < activeStepIndex
                const isActive = idx === activeStepIndex
                return (
                  <div
                    key={`auto-tour-segment-${roleKey}`}
                    className="relative h-1 rounded-full bg-white/18 overflow-hidden backdrop-blur-xs"
                  >
                    {isPast && (
                      <div className="absolute inset-0 rounded-full bg-white/80" />
                    )}
                    {isActive && (
                      <motion.div
                        key={`auto-tour-active-fill-${activePersona}`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{
                          duration: stepDurationSec,
                          ease: 'linear',
                        }}
                        className="
                          absolute inset-0 origin-left rounded-full
                          bg-gradient-to-r from-emerald-300 via-white to-amber-300
                          shadow-[0_0_10px_rgba(255,255,255,0.55)]
                        "
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

          {/* Share & Prev / Next Scene Controls */}
          <div className="flex items-center gap-1 min-[375px]:gap-1.5 shrink-0">
            <button
              type="button"
              data-testid="share-persona-slide-btn"
              onClick={handleSharePersonaSlide}
              aria-label={`Share ${slide.shortLabel} showcase details`}
              title={`Share or copy ${slide.shortLabel} slide details`}
              className={`h-7 min-[375px]:h-8 px-2.5 min-[375px]:px-3 rounded-lg border flex items-center justify-center gap-1.5 text-[10px] min-[375px]:text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                shareStatus !== 'idle'
                  ? 'bg-emerald-500/30 border-emerald-400/50 text-emerald-200'
                  : 'bg-black/40 hover:bg-black/65 border-white/15 text-white/90 hover:text-white'
              }`}
            >
              {shareStatus !== 'idle' ? (
                <>
                  <Check className="h-3 w-3 min-[375px]:h-3.5 min-[375px]:w-3.5 text-emerald-300 shrink-0" />
                  <span>
                    {shareStatus === 'shared' ? 'Shared' : 'Copied'}
                  </span>
                </>
              ) : (
                <>
                  <Share2 className="h-3 w-3 min-[375px]:h-3.5 min-[375px]:w-3.5 shrink-0" />
                  <span>Share</span>
                </>
              )}
            </button>
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
        <LayoutGroup id="auth-persona-slide-selector-pills">
          <motion.div
            layout
            role="tablist"
            aria-label="Explore platform experience by user role"
            className="grid grid-cols-5 gap-1 p-1 w-full sm:w-fit sm:flex sm:items-center sm:gap-1.5 sm:p-1.5 rounded-xl sm:rounded-2xl bg-black/50 backdrop-blur-md border border-white/15 max-w-full"
          >
            {PERSONA_ORDER.map((roleKey) => {
              const item = AUTH_PERSONA_SLIDES[roleKey]
              const Icon = PERSONA_ICONS[roleKey]
              const isSelected = activePersona === roleKey
              return (
                <motion.button
                  key={roleKey}
                  layout
                  ref={(el) => {
                    if (tabButtonRefs) {
                      tabButtonRefs.current[roleKey] = el
                    }
                  }}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => onSelectPersona(roleKey)}
                  transition={{
                    layout: {
                      type: 'spring',
                      stiffness: 340,
                      damping: 30,
                      mass: 0.65,
                    },
                  }}
                  className={`relative flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 rounded-lg sm:rounded-xl px-1 sm:px-3.5 py-1.5 min-h-[44px] sm:min-h-0 text-[10px] min-[375px]:text-[11px] sm:text-xs font-semibold leading-tight transition-colors duration-200 cursor-pointer min-w-0 sm:whitespace-nowrap sm:shrink-0 ${
                    isSelected
                      ? 'text-white'
                      : 'text-white/70 hover:text-white/95'
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layout
                      layoutId="authShowcaseRolePill"
                      initial={false}
                      transition={{
                        type: 'spring',
                        stiffness: 340,
                        damping: 30,
                        mass: 0.65,
                      }}
                      className={`absolute inset-0 rounded-lg sm:rounded-xl bg-white/20 border ${slide.accentBorder} shadow-[0_4px_16px_-2px_rgba(0,0,0,0.35)] backdrop-blur-md`}
                    />
                  )}
                  <motion.span
                    layout="position"
                    animate={{
                      scale: isSelected ? 1.05 : 1,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 360,
                      damping: 28,
                    }}
                    className="relative z-10 flex items-center justify-center shrink-0"
                  >
                    <Icon
                      className={`h-3.5 w-3.5 shrink-0 transition-colors duration-300 ${
                        isSelected ? slide.accentText : 'text-current'
                      }`}
                    />
                  </motion.span>
                  <motion.span
                    layout="position"
                    className="relative z-10 max-w-full truncate tracking-tight sm:tracking-normal"
                  >
                    {item.shortLabel}
                  </motion.span>
                </motion.button>
              )
            })}
          </motion.div>
        </LayoutGroup>
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
                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden md:inline-block text-[11px] font-mono text-white/65">
                    Verified Member
                  </span>
                  <button
                    type="button"
                    onClick={handleSharePersonaSlide}
                    aria-label={`Invite peers by sharing ${slide.shortLabel} slide details`}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] min-[375px]:text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                      shareStatus !== 'idle'
                        ? 'bg-emerald-500/25 border-emerald-400/50 text-emerald-200'
                        : `bg-white/10 hover:bg-white/20 ${slide.accentBorder} text-white/90 hover:text-white`
                    }`}
                  >
                    {shareStatus !== 'idle' ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-300 shrink-0" />
                        <span>
                          {shareStatus === 'shared'
                            ? 'Invite Shared'
                            : 'Details Copied'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Share2
                          className={`h-3 w-3 shrink-0 ${slide.accentText}`}
                        />
                        <span>Share {slide.shortLabel} Invite</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <span className="sr-only" role="status" aria-live="polite">
                {shareStatus === 'shared'
                  ? `${slide.shortLabel} showcase invite shared and copied to clipboard.`
                  : shareStatus === 'copied'
                    ? `${slide.shortLabel} showcase slide details copied to clipboard.`
                    : ''}
              </span>
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
  showVerificationFaq,
}: AuthShowcaseLayoutProps) {
  const location = useLocation()
  const [autoCycle, setAutoCycle] = useState(false)
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1)

  const isLoginOrRegisterRoute =
    location.pathname === '/login' ||
    location.pathname === '/signin' ||
    location.pathname === '/register' ||
    location.pathname === '/signup'

  const isRegisterRoute =
    location.pathname === '/register' || location.pathname === '/signup'

  const shouldRenderVerificationFaq =
    showVerificationFaq ?? isLoginOrRegisterRoute

  const prevPersonaRef = useRef<PlatformPersona>(activePersona)
  const isFirstRenderRef = useRef(true)
  const layoutMainRef = useRef<HTMLElement | null>(null)
  const showcasePanelRef = useRef<HTMLDivElement>(null)
  const tabButtonRefs = useRef<
    Partial<Record<PlatformPersona, HTMLButtonElement | null>>
  >({})

  // Sync persona slide when opening a shared invite link with ?role=<persona>
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const roleParam = params.get('role')?.toUpperCase() as
      | PlatformPersona
      | undefined
    if (roleParam && PERSONA_ORDER.includes(roleParam) && roleParam !== activePersona) {
      onPersonaChange(roleParam)
    }
    // Only run when URL search query changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])

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
    }, AUTO_TOUR_INTERVAL_MS)
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

  const handleScrollToFaq = () => {
    const faqEl = document.getElementById('account-verification-faq')
    if (faqEl) {
      faqEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
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
          {shouldRenderVerificationFaq && (
            <button
              type="button"
              onClick={handleScrollToFaq}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card/80 hover:border-primary/45 px-3 py-1.5 text-xs font-mono font-medium text-secondary hover:text-foreground transition-colors cursor-pointer"
            >
              <HelpCircle className="h-3.5 w-3.5 text-primary" />
              <span>Verification FAQ</span>
            </button>
          )}
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
              autoCycle={autoCycle}
              autoCycleDurationMs={AUTO_TOUR_INTERVAL_MS}
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

      {/* Account Verification FAQ Section — Displayed when on the Login or Register screen */}
      {shouldRenderVerificationFaq && (
        <AuthVerificationFaqSection
          activePersona={activePersona}
          isRegisterScreen={isRegisterRoute}
          onSelectPersona={handleSelectPersonaSlide}
        />
      )}

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


