export type MentorshipGoalId =
  | 'ALL'
  | 'SYSTEMS_ENG'
  | 'PRODUCT_VENTURE'
  | 'AI_RESEARCH'
  | 'GLOBAL_CAREER'
  | 'FINTECH_STRATEGY'

export type MentorAvailabilityFilter =
  | 'ALL'
  | 'AVAILABLE'
  | 'WAITLIST'
  | 'SHORTLISTED'

export interface MentorshipGoalOption {
  id: MentorshipGoalId
  label: string
  shortLabel: string
  description: string
  keywords: string[]
}

export interface MentorSessionSlot {
  id: string
  dayLabel: string
  timeLabel: string
  timezone: string
  format: 'Video Call' | 'In-Person Hub' | 'Async Code/Doc Review'
}

export interface MentorRoadmapPhase {
  phase: string
  title: string
  outcome: string
}

export interface MentorTestimonial {
  menteeName: string
  menteeRole: string
  classYear: number
  quote: string
}

export interface MentorRecord {
  id: string
  name: string
  initials: string
  headline: string
  role: string
  company: string
  classYear: number
  department: string
  location: string
  chapter: string
  bio: string
  mentorshipStyle: string
  expertise: string[]
  industries: string[]
  goalAffinities: MentorshipGoalId[]
  maxMentees: number
  currentMentees: number
  isAvailable: boolean
  meetingFrequency: string
  preferredFormat: string
  responseWindow: string
  totalMenteesServed: number
  sessionsCompleted: number
  avgRating: number
  featuredTopic: string
  officeHoursSlots: MentorSessionSlot[]
  roadmap: MentorRoadmapPhase[]
  testimonials: MentorTestimonial[]
}

export interface MentorshipTrackPhase {
  weeks: string
  title: string
  deliverable: string
}

export interface MentorshipTrackProgram {
  id: string
  code: string
  title: string
  subtitle: string
  description: string
  status: 'OPEN' | 'FILLING FAST'
  duration: string
  commitment: string
  maxMentees: number
  currentMentees: number
  isAvailable: boolean
  categories: string[]
  skills: string[]
  eligibility: string
  leadMentorId: string
  leadMentorName: string
  applicationDeadline: string
  phases: MentorshipTrackPhase[]
}

export interface StoredMentorshipRequest {
  id: string
  mentorId: string
  mentorName: string
  mentorHeadline: string
  menteeName: string
  mode: 'LONG_TERM' | 'OFFICE_HOURS'
  status: 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'CANCELLED'
  goal: string
  slotLabel?: string
  requestedAt: string
  startedAt: string | null
  meetingCount: number
  lastMeeting: string | null
  duration: string
  notes: string[]
}

export const MENTORSHIP_GOALS: MentorshipGoalOption[] = [
  {
    id: 'ALL',
    label: 'All Career Objectives',
    shortLabel: 'All Goals',
    description: 'Browse the complete Sukkur IBA alumni mentor faculty across every discipline.',
    keywords: [],
  },
  {
    id: 'SYSTEMS_ENG',
    label: 'Staff & Distributed Systems Engineering',
    shortLabel: 'Systems & Staff Eng',
    description: 'Architecture reviews, high-scale backend systems, and IC-to-Staff engineering transitions.',
    keywords: ['Software Architecture', 'Distributed Systems', 'Cloud Security', 'System Design'],
  },
  {
    id: 'PRODUCT_VENTURE',
    label: 'Product Leadership & Venture Building',
    shortLabel: 'Product & Venture',
    description: '0-to-1 product strategy, founder fundraising readiness, and executive P&L ownership.',
    keywords: ['Product Strategy', 'Venture Scaling', 'Executive Leadership', 'Go-To-Market'],
  },
  {
    id: 'AI_RESEARCH',
    label: 'Applied AI, ML Infrastructure & Research',
    shortLabel: 'AI & Research',
    description: 'LLM productionization, ML cluster orchestration, and publishing or PhD fellowships.',
    keywords: ['Machine Learning', 'AI Infrastructure', 'Research Fellowships', 'Data Platforms'],
  },
  {
    id: 'GLOBAL_CAREER',
    label: 'Global Mobility & International Relocation',
    shortLabel: 'Global Mobility',
    description: 'Landing roles in Europe, GCC, UK, and North America, plus global interview calibration.',
    keywords: ['Global Relocation', 'Executive Interviewing', 'Cross-Border Teams', 'Career Transition'],
  },
  {
    id: 'FINTECH_STRATEGY',
    label: 'FinTech, Payment Rails & Digital Banking',
    shortLabel: 'FinTech & Banking',
    description: 'Payment architecture, regulatory compliance, and quantitative product management in MENA & South Asia.',
    keywords: ['Payment Rails', 'FinTech', 'Risk & Compliance', 'Digital Banking'],
  },
]

export const MENTORS_CATALOG: MentorRecord[] = [
  {
    id: '1',
    name: 'Dr. Sarah Khan',
    initials: 'SK',
    headline: 'Director of Core Platform Engineering · TechCorp',
    role: 'Director of Platform Engineering',
    company: 'TechCorp',
    classYear: 2012,
    department: 'Computer Science',
    location: 'Karachi, Pakistan',
    chapter: 'Karachi Chapter',
    bio: 'Leads 45+ engineers building fault-tolerant cloud platforms across South Asia and MENA. Sukkur IBA CS Gold Medalist (2012) with a doctorate in distributed systems. Focused on helping mid-level engineers break into Principal, Staff, and Engineering Director roles.',
    mentorshipStyle: 'Structured architecture critiques paired with bi-weekly career rubric calibration.',
    expertise: [
      'Software Architecture',
      'System Design',
      'Engineering Management',
      'Staff Readiness',
    ],
    industries: ['Enterprise SaaS', 'Cloud Infrastructure', 'FinTech'],
    goalAffinities: ['SYSTEMS_ENG', 'GLOBAL_CAREER'],
    maxMentees: 4,
    currentMentees: 2,
    isAvailable: true,
    meetingFrequency: 'Bi-weekly · 45 min',
    preferredFormat: 'Video Call & RFC Docs',
    responseWindow: 'Within 48 hours',
    totalMenteesServed: 24,
    sessionsCompleted: 142,
    avgRating: 4.9,
    featuredTopic: 'Transitioning from Senior IC to Staff Architect & Engineering Director',
    officeHoursSlots: [
      {
        id: 'sk-1',
        dayLabel: 'Thu, Nov 12',
        timeLabel: '19:30 PKT',
        timezone: 'UTC+5',
        format: 'Video Call',
      },
      {
        id: 'sk-2',
        dayLabel: 'Sat, Nov 14',
        timeLabel: '11:00 PKT',
        timezone: 'UTC+5',
        format: 'Async Code/Doc Review',
      },
    ],
    roadmap: [
      {
        phase: 'Month 1–2',
        title: 'Technical Leverage & Gap Audit',
        outcome: 'Map current engineering scope against Staff/Director promotion rubrics.',
      },
      {
        phase: 'Month 3–4',
        title: 'Cross-Org System Design & RFC Ownership',
        outcome: 'Author and defend a production-grade architecture RFC with executive buy-in.',
      },
      {
        phase: 'Month 5–6',
        title: 'Executive Presence & Mock Panel Calibration',
        outcome: 'Complete 3 full-loop system design & leadership simulations.',
      },
    ],
    testimonials: [
      {
        menteeName: 'Ahmed Hassan',
        menteeRole: 'Senior Software Engineer at Systems Ltd',
        classYear: 2020,
        quote:
          'Sarah completely restructured how I write technical RFCs and negotiate cross-team scope. Promoted to Lead Engineer within five months.',
      },
      {
        menteeName: 'Hina Bhutto',
        menteeRole: 'Platform Engineer at Careem',
        classYear: 2019,
        quote:
          'Her mock system design critiques are tougher and clearer than actual Big Tech loops.',
      },
    ],
  },
  {
    id: '2',
    name: 'Sanaullah Memon',
    initials: 'SM',
    headline: 'VP of Payment Rail Product · Careem FinTech',
    role: 'VP of Product',
    company: 'Careem FinTech',
    classYear: 2016,
    department: 'Business Administration',
    location: 'Dubai, United Arab Emirates',
    chapter: 'Dubai & GCC Chapter',
    bio: 'Scaled consumer and merchant payment rails processing $4B+ in annual volume across the Gulf and Pakistan. Passionate about guiding Sukkur IBA graduates into product leadership, FinTech strategy, and GCC cross-border roles.',
    mentorshipStyle: 'Case-driven product teardown sessions with direct introductions to MENA hiring leaders.',
    expertise: [
      'Product Strategy',
      'Payment Rails',
      'Venture Scaling',
      'Global Relocation',
    ],
    industries: ['FinTech', 'Digital Banking', 'Venture Capital'],
    goalAffinities: ['PRODUCT_VENTURE', 'FINTECH_STRATEGY', 'GLOBAL_CAREER'],
    maxMentees: 3,
    currentMentees: 1,
    isAvailable: true,
    meetingFrequency: 'Bi-weekly · 40 min',
    preferredFormat: 'Video Call',
    responseWindow: 'Within 24 hours',
    totalMenteesServed: 19,
    sessionsCompleted: 98,
    avgRating: 4.95,
    featuredTopic: 'Breaking into MENA FinTech Product Management & Seed-Stage Venture Strategy',
    officeHoursSlots: [
      {
        id: 'sm-1',
        dayLabel: 'Wed, Nov 11',
        timeLabel: '20:00 GST',
        timezone: 'UTC+4',
        format: 'Video Call',
      },
      {
        id: 'sm-2',
        dayLabel: 'Sun, Nov 15',
        timeLabel: '16:00 GST',
        timezone: 'UTC+4',
        format: 'Video Call',
      },
    ],
    roadmap: [
      {
        phase: 'Month 1–2',
        title: 'Product Portfolio & Narrative Repositioning',
        outcome: 'Reframe engineering or business experience into measurable product P&L impact.',
      },
      {
        phase: 'Month 3–4',
        title: 'FinTech Unit Economics & PRD Mastery',
        outcome: 'Build a live payment rail teardown and board-ready product strategy deck.',
      },
      {
        phase: 'Month 5–6',
        title: 'GCC Hiring Loop & Referral Warm-Intros',
        outcome: 'Direct mock product sense loops and warm introductions across Dubai & Riyadh.',
      },
    ],
    testimonials: [
      {
        menteeName: 'Zainab Qureshi',
        menteeRole: 'Senior Product Manager at SadaPay',
        classYear: 2018,
        quote:
          'Sanaullah helped me transition from business analysis into core payment product management with clarity and confidence.',
      },
    ],
  },
  {
    id: '3',
    name: 'Dr. Aamir Soomro',
    initials: 'AS',
    headline: 'VP of AI Infrastructure · DeepScale Munich',
    role: 'VP of AI Infrastructure',
    company: 'DeepScale Munich',
    classYear: 2014,
    department: 'Computer Science',
    location: 'Munich, Germany',
    chapter: 'European Chapter',
    bio: 'Architects multi-node GPU training clusters and low-latency inference engines in Munich. Completed DAAD doctoral fellowship at TU Munich after graduating from Sukkur IBA. Mentors alumni aiming for European tech relocation, ML engineering, or funded graduate research.',
    mentorshipStyle: 'Hands-on paper implementation reviews, research proposal editing, and EU visa/relocation strategy.',
    expertise: [
      'AI Infrastructure',
      'Machine Learning',
      'System Design',
      'Research Fellowships',
      'Global Relocation',
    ],
    industries: ['Artificial Intelligence', 'Cloud Infrastructure', 'DeepTech'],
    goalAffinities: ['AI_RESEARCH', 'SYSTEMS_ENG', 'GLOBAL_CAREER'],
    maxMentees: 3,
    currentMentees: 2,
    isAvailable: true,
    meetingFrequency: 'Weekly · 30 min',
    preferredFormat: 'Video Call & GitHub Review',
    responseWindow: 'Within 48 hours',
    totalMenteesServed: 31,
    sessionsCompleted: 186,
    avgRating: 5.0,
    featuredTopic: 'Production LLM Infrastructure & Funded European Research Fellowships',
    officeHoursSlots: [
      {
        id: 'as-1',
        dayLabel: 'Fri, Nov 13',
        timeLabel: '18:00 CET',
        timezone: 'UTC+1',
        format: 'Video Call',
      },
      {
        id: 'as-2',
        dayLabel: 'Sat, Nov 14',
        timeLabel: '14:00 CET',
        timezone: 'UTC+1',
        format: 'Async Code/Doc Review',
      },
    ],
    roadmap: [
      {
        phase: 'Month 1–2',
        title: 'Systems & ML Foundations Benchmark',
        outcome: 'Select high-impact open-source ML systems project or thesis topic.',
      },
      {
        phase: 'Month 3–4',
        title: 'Benchmarking & Publication / Portfolio Artifact',
        outcome: 'Publish reproducible inference benchmark or DAAD/Erasmus research statement.',
      },
      {
        phase: 'Month 5–6',
        title: 'European Tech & Lab Placement',
        outcome: 'Target interviews with Munich, Berlin, Zurich, and Amsterdam AI labs.',
      },
    ],
    testimonials: [
      {
        menteeName: 'Bilal Shaikh',
        menteeRole: 'ML Systems Engineer in Berlin',
        classYear: 2021,
        quote:
          'Dr. Aamir guided both my CUDA systems portfolio and my German EU Blue Card interview loop step by step.',
      },
    ],
  },
  {
    id: '4',
    name: 'Nadia Talpur',
    initials: 'NT',
    headline: 'Head of Design Engineering · LinearCraft Studio',
    role: 'Head of Design Engineering',
    company: 'LinearCraft Studio',
    classYear: 2018,
    department: 'Computer Science',
    location: 'London, United Kingdom',
    chapter: 'UK & Europe Chapter',
    bio: 'Bridges interaction design, design systems architecture, and high-craft frontend engineering for developer tools in London. Helps frontend engineers and product designers build world-class portfolios that stand out globally.',
    mentorshipStyle: 'Live Figma + TypeScript code critiques focused on micro-interactions, accessibility, and system tokens.',
    expertise: [
      'Design Systems',
      'Frontend Architecture',
      'Product Strategy',
      'Global Relocation',
      'Software Architecture',
    ],
    industries: ['Enterprise SaaS', 'Developer Tools', 'Design Engineering'],
    goalAffinities: ['PRODUCT_VENTURE', 'GLOBAL_CAREER', 'SYSTEMS_ENG'],
    maxMentees: 3,
    currentMentees: 1,
    isAvailable: true,
    meetingFrequency: 'Bi-weekly · 45 min',
    preferredFormat: 'Video Call & Live Critique',
    responseWindow: 'Within 24 hours',
    totalMenteesServed: 16,
    sessionsCompleted: 84,
    avgRating: 4.9,
    featuredTopic: 'Design Engineering Craft, Multi-Brand Token Systems & UK Tech Visas',
    officeHoursSlots: [
      {
        id: 'nt-1',
        dayLabel: 'Tue, Nov 10',
        timeLabel: '18:30 GMT',
        timezone: 'UTC+0',
        format: 'Video Call',
      },
      {
        id: 'nt-2',
        dayLabel: 'Sat, Nov 14',
        timeLabel: '15:00 GMT',
        timezone: 'UTC+0',
        format: 'Video Call',
      },
    ],
    roadmap: [
      {
        phase: 'Month 1–2',
        title: 'Component Architecture & Token Audit',
        outcome: 'Rebuild flagship portfolio piece with strict accessibility and spring physics.',
      },
      {
        phase: 'Month 3–4',
        title: 'Design-to-Code Systems Publication',
        outcome: 'Ship an interactive case study demonstrating systems thinking.',
      },
      {
        phase: 'Month 5–6',
        title: 'London & Remote Design-Eng Loops',
        outcome: 'Live portfolio walkthrough rehearsals and UK hiring manager referrals.',
      },
    ],
    testimonials: [
      {
        menteeName: 'Ayesha Solangi',
        menteeRole: 'Senior UI Engineer',
        classYear: 2022,
        quote:
          'Nadia’s eye for typography, motion physics, and clean component APIs transformed my work in weeks.',
      },
    ],
  },
  {
    id: '5',
    name: 'Kamran Mahar',
    initials: 'KM',
    headline: 'Managing Director, Cloud Security · SovereignCloud',
    role: 'Managing Director',
    company: 'SovereignCloud',
    classYear: 2011,
    department: 'Computer Science',
    location: 'Riyadh, Saudi Arabia',
    chapter: 'Riyadh & GCC Chapter',
    bio: 'Oversees sovereign cloud security and zero-trust banking infrastructure across Saudi Arabia and the GCC. Advises mid-career engineering leaders and cybersecurity specialists on executive career tracks.',
    mentorshipStyle: 'High-accountability executive coaching with real enterprise security architecture scenarios.',
    expertise: [
      'Cloud Security',
      'Zero-Trust Architecture',
      'Engineering Management',
      'Risk & Compliance',
      'System Design',
    ],
    industries: ['Cybersecurity', 'Cloud Infrastructure', 'Digital Banking'],
    goalAffinities: ['SYSTEMS_ENG', 'FINTECH_STRATEGY', 'GLOBAL_CAREER'],
    maxMentees: 2,
    currentMentees: 2,
    isAvailable: false,
    meetingFrequency: 'Monthly · 60 min',
    preferredFormat: 'Video Call',
    responseWindow: 'Waitlist open for Q1',
    totalMenteesServed: 28,
    sessionsCompleted: 164,
    avgRating: 4.85,
    featuredTopic: 'Enterprise Cloud Security Leadership & CISO Readiness in GCC Banking',
    officeHoursSlots: [
      {
        id: 'km-1',
        dayLabel: 'Thu, Nov 19',
        timeLabel: '21:00 AST',
        timezone: 'UTC+3',
        format: 'Video Call',
      },
    ],
    roadmap: [
      {
        phase: 'Month 1–2',
        title: 'Security Architecture & Governance Baseline',
        outcome: 'Master enterprise threat modeling and regulatory frameworks (SAMA / PCI-DSS).',
      },
      {
        phase: 'Month 3–4',
        title: 'Boardroom Risk Communication',
        outcome: 'Translate technical security posture into executive investment memos.',
      },
      {
        phase: 'Month 5–6',
        title: 'Principal Security & Director Placement',
        outcome: 'Executive interview preparation for GCC sovereign cloud and banking initiatives.',
      },
    ],
    testimonials: [
      {
        menteeName: 'Farhan Jokhio',
        menteeRole: 'Lead Cloud Security Architect in Riyadh',
        classYear: 2015,
        quote:
          'Kamran’s mentorship bridged the gap between hands-on DevSecOps and executive security leadership.',
      },
    ],
  },
  {
    id: '6',
    name: 'Rabia Khuhro',
    initials: 'RK',
    headline: 'Head of Quantitative Risk & Treasury · Habib Metro',
    role: 'Head of Quantitative Risk',
    company: 'Habib Metro Financial',
    classYear: 2013,
    department: 'Mathematics & Finance',
    location: 'Islamabad, Pakistan',
    chapter: 'Islamabad Chapter',
    bio: 'Leads quantitative risk modeling, algorithmic treasury products, and regulatory capital strategy. Mentors alumni pursuing quantitative finance, CFA/FRM progression, and FinTech data science.',
    mentorshipStyle: 'Analytical problem-solving workshops combining stochastic modeling with commercial banking strategy.',
    expertise: [
      'Quantitative Finance',
      'Risk & Compliance',
      'Payment Rails',
      'Machine Learning',
    ],
    industries: ['FinTech', 'Digital Banking', 'Capital Markets'],
    goalAffinities: ['FINTECH_STRATEGY', 'AI_RESEARCH'],
    maxMentees: 3,
    currentMentees: 1,
    isAvailable: true,
    meetingFrequency: 'Bi-weekly · 45 min',
    preferredFormat: 'Video Call',
    responseWindow: 'Within 48 hours',
    totalMenteesServed: 14,
    sessionsCompleted: 76,
    avgRating: 4.9,
    featuredTopic: 'Quantitative Risk Modeling, Treasury Analytics & FinTech Credit Scoring',
    officeHoursSlots: [
      {
        id: 'rk-1',
        dayLabel: 'Wed, Nov 11',
        timeLabel: '18:00 PKT',
        timezone: 'UTC+5',
        format: 'Video Call',
      },
      {
        id: 'rk-2',
        dayLabel: 'Sat, Nov 14',
        timeLabel: '12:30 PKT',
        timezone: 'UTC+5',
        format: 'Video Call',
      },
    ],
    roadmap: [
      {
        phase: 'Month 1–2',
        title: 'Quantitative Credit & Treasury Foundations',
        outcome: 'Build production credit-risk and liquidity stress-testing models in Python.',
      },
      {
        phase: 'Month 3–4',
        title: 'Regulatory & Algorithmic Product Strategy',
        outcome: 'Design an end-to-end digital lending or embedded finance risk scorecard.',
      },
      {
        phase: 'Month 5–6',
        title: 'Institutional Finance & FinTech Interviews',
        outcome: 'Technical quant case prep for commercial banks and high-growth FinTechs.',
      },
    ],
    testimonials: [
      {
        menteeName: 'Saad Abro',
        menteeRole: 'Quantitative Analyst',
        classYear: 2021,
        quote:
          'Rabia’s structured guidance helped me pass both my FRM Part II and land a quant risk role.',
      },
    ],
  },
]

export const MENTORSHIP_TRACKS: MentorshipTrackProgram[] = [
  {
    id: 'track-systems',
    code: 'TRK-01',
    title: 'Early Career & Systems Engineering Fellowship',
    subtitle: 'For 0–4 YoE engineers targeting Senior/Staff foundations & high-scale architecture',
    description:
      'A structured 6-month technical fellowship pairing Sukkur IBA computer science graduates with Principal and Director-level alumni engineers for architecture critiques, production code reviews, and promotion calibration.',
    status: 'OPEN',
    duration: '24 Weeks · Cohort IX',
    commitment: '2 hrs / bi-weekly',
    maxMentees: 18,
    currentMentees: 13,
    isAvailable: true,
    categories: ['Systems Architecture', 'Distributed Backend', 'Career Acceleration'],
    skills: ['System Design', 'RFC Writing', 'Production Debugging'],
    eligibility: 'Alumni & final-year scholars with 1+ yr production coding',
    leadMentorId: '1',
    leadMentorName: 'Dr. Sarah Khan',
    applicationDeadline: '2026-11-30',
    phases: [
      {
        weeks: 'Weeks 1–8',
        title: 'Distributed Systems & Code Craft Audit',
        deliverable: 'Baseline architecture review + personal technical growth charter',
      },
      {
        weeks: 'Weeks 9–16',
        title: 'High-Throughput RFC & Reliability Engineering',
        deliverable: 'Design and load-test a fault-tolerant microservice or data pipeline',
      },
      {
        weeks: 'Weeks 17–24',
        title: 'Mock Loop Calibration & Direct Referral',
        deliverable: '3 graded system design loops + alumni hiring network referrals',
      },
    ],
  },
  {
    id: 'track-venture',
    code: 'TRK-02',
    title: 'Executive Product & Venture Leadership Track',
    subtitle: 'For mid-career alumni transitioning into VP Product, GM, or Founder tracks',
    description:
      'Intensive executive mentorship led by alumni VPs and founders across Dubai, Riyadh, and London. Focuses on unit economics, product portfolio strategy, fundraising narratives, and organizational leadership.',
    status: 'FILLING FAST',
    duration: '24 Weeks · Cohort VI',
    commitment: '90 mins / bi-weekly',
    maxMentees: 10,
    currentMentees: 8,
    isAvailable: true,
    categories: ['Executive Leadership', 'Product Strategy', 'Venture Building'],
    skills: ['P&L Ownership', 'Go-To-Market', 'Fundraising Readiness'],
    eligibility: 'Open to alumni with 4+ years of industry experience',
    leadMentorId: '2',
    leadMentorName: 'Sanaullah Memon',
    applicationDeadline: '2026-12-10',
    phases: [
      {
        weeks: 'Weeks 1–8',
        title: 'Strategic Narrative & Commercial Leverage',
        deliverable: 'Audit current product/business scope and define 12-month thesis',
      },
      {
        weeks: 'Weeks 9–16',
        title: 'Board-Ready Product Strategy & Unit Economics',
        deliverable: 'Complete a commercial teardown or seed-stage pitch memo',
      },
      {
        weeks: 'Weeks 17–24',
        title: 'Executive Placement & Founder Advisory Circle',
        deliverable: 'Mock executive panel + warm intros to GCC/global venture operators',
      },
    ],
  },
  {
    id: 'track-research',
    code: 'TRK-03',
    title: 'Global AI Research & Doctoral Mobility Track',
    subtitle: 'For alumni pursuing European/US graduate fellowships or AI research engineering',
    description:
      'Guided by Sukkur IBA alumni holding PhDs and research leadership roles in Germany, the UK, and North America. Covers research statement refinement, benchmark publication, and scholarship applications (DAAD, Fulbright, Erasmus).',
    status: 'OPEN',
    duration: '20 Weeks · Cohort IV',
    commitment: '1 hr / weekly',
    maxMentees: 12,
    currentMentees: 7,
    isAvailable: true,
    categories: ['Applied AI', 'Doctoral Fellowships', 'Global Mobility'],
    skills: ['Research Proposals', 'ML Benchmarking', 'Academic Publishing'],
    eligibility: 'Open to CS, Math, and Engineering alumni',
    leadMentorId: '3',
    leadMentorName: 'Dr. Aamir Soomro',
    applicationDeadline: '2026-12-18',
    phases: [
      {
        weeks: 'Weeks 1–6',
        title: 'Research Problem Formulation & Lab Targeting',
        deliverable: 'Shortlist 8 global labs and draft a 2-page research synopsis',
      },
      {
        weeks: 'Weeks 7–14',
        title: 'Reproducible Experiment & Paper Critique',
        deliverable: 'Publish open-source benchmark repository + refine Statement of Purpose',
      },
      {
        weeks: 'Weeks 15–20',
        title: 'PI Outreach & Scholarship Interview Prep',
        deliverable: 'Simulated faculty defense and scholarship committee interviews',
      },
    ],
  },
]

const REQUESTS_STORAGE_KEY = 'siba_mentorship_requests_v1'
const SHORTLIST_STORAGE_KEY = 'siba_mentorship_shortlist_v1'
const TRACKS_STORAGE_KEY = 'siba_mentorship_tracks_enrolled_v1'

const DEFAULT_RELATIONSHIPS: StoredMentorshipRequest[] = [
  {
    id: 'rel-1',
    mentorId: '1',
    mentorName: 'Dr. Sarah Khan',
    mentorHeadline: 'Director of Core Platform Engineering · TechCorp',
    menteeName: 'Ahmed Hassan',
    mode: 'LONG_TERM',
    status: 'ACTIVE',
    goal: 'Staff Engineering Architecture & Cross-Team RFC Ownership',
    requestedAt: '2026-08-01',
    startedAt: '2026-08-14',
    meetingCount: 8,
    lastMeeting: '2026-10-15',
    duration: '6 months · Phase 2 of 3',
    notes: [
      'Reviewed distributed payment ledger RFC draft; refined idempotency guarantees.',
      'Completed mock Staff system design loop on multi-region cache invalidation.',
    ],
  },
  {
    id: 'rel-2',
    mentorId: '2',
    mentorName: 'Sanaullah Memon',
    mentorHeadline: 'VP of Payment Rail Product · Careem FinTech',
    menteeName: 'Fatima Shah',
    mode: 'OFFICE_HOURS',
    status: 'PENDING',
    goal: 'Transitioning into MENA FinTech Product Management & PRD teardown',
    slotLabel: 'Wed, Nov 11 · 20:00 GST',
    requestedAt: '2026-10-18',
    startedAt: null,
    meetingCount: 0,
    lastMeeting: null,
    duration: '40-min Office Hours Session',
    notes: [
      'Submitted product teardown deck ahead of the introductory session.',
    ],
  },
  {
    id: 'rel-3',
    mentorId: '3',
    mentorName: 'Dr. Aamir Soomro',
    mentorHeadline: 'VP of AI Infrastructure · DeepScale Munich',
    menteeName: 'Saba Ahmed',
    mode: 'LONG_TERM',
    status: 'COMPLETED',
    goal: 'DAAD Doctoral Fellowship Application & Multi-GPU Inference Benchmark',
    requestedAt: '2026-03-10',
    startedAt: '2026-03-22',
    meetingCount: 12,
    lastMeeting: '2026-09-20',
    duration: '6 months · Graduated Cohort',
    notes: [
      'Finalized TU Munich research proposal and benchmarked vLLM tensor parallelism.',
      'Received fellowship offer for Winter semester in Munich.',
    ],
  },
]

export function loadMentorshipRequests(): StoredMentorshipRequest[] {
  if (typeof window === 'undefined') return DEFAULT_RELATIONSHIPS
  try {
    const raw = window.localStorage.getItem(REQUESTS_STORAGE_KEY)
    if (!raw) {
      window.localStorage.setItem(
        REQUESTS_STORAGE_KEY,
        JSON.stringify(DEFAULT_RELATIONSHIPS),
      )
      return DEFAULT_RELATIONSHIPS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : DEFAULT_RELATIONSHIPS
  } catch {
    return DEFAULT_RELATIONSHIPS
  }
}

export function saveMentorshipRequests(requests: StoredMentorshipRequest[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests))
  } catch {
    // Ignore storage quota errors
  }
}

export function loadShortlistedMentorIds(): string[] {
  if (typeof window === 'undefined') return ['1', '3']
  try {
    const raw = window.localStorage.getItem(SHORTLIST_STORAGE_KEY)
    if (!raw) return ['1', '3']
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : ['1', '3']
  } catch {
    return ['1', '3']
  }
}

export function saveShortlistedMentorIds(ids: string[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // Ignore storage quota errors
  }
}

export function loadEnrolledTrackIds(): string[] {
  if (typeof window === 'undefined') return ['track-systems']
  try {
    const raw = window.localStorage.getItem(TRACKS_STORAGE_KEY)
    if (!raw) return ['track-systems']
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : ['track-systems']
  } catch {
    return ['track-systems']
  }
}

export function saveEnrolledTrackIds(ids: string[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(TRACKS_STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // Ignore storage quota errors
  }
}

export const MENTOR_INDUSTRIES: string[] = Array.from(
  new Set(MENTORS_CATALOG.flatMap((mentor) => mentor.industries)),
)

export const MENTOR_EXPERTISE_TOPICS: string[] = Array.from(
  new Set(MENTORS_CATALOG.flatMap((mentor) => mentor.expertise)),
)

export function computeMentorMatchScore(
  mentor: MentorRecord,
  selectedGoal: MentorshipGoalId,
  searchQuery: string,
  selectedIndustries: string[] = [],
  selectedExpertise: string[] = [],
): number {
  let score = 84
  if (selectedGoal !== 'ALL') {
    const primaryIndex = mentor.goalAffinities.indexOf(selectedGoal)
    if (primaryIndex === 0) score += 12
    else if (primaryIndex > 0) score += 8
    else score -= 6
  } else {
    score += mentor.isAvailable ? 7 : 2
  }

  if (selectedIndustries.length > 0) {
    const matchedIndCount = selectedIndustries.filter((ind) =>
      mentor.industries.includes(ind),
    ).length
    score += matchedIndCount * 4
  }

  if (selectedExpertise.length > 0) {
    const matchedExpCount = selectedExpertise.filter((exp) =>
      mentor.expertise.includes(exp),
    ).length
    score += matchedExpCount * 5
  }

  if (mentor.avgRating >= 4.95) score += 2
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase()
    const matchesSkill = mentor.expertise.some((e) => e.toLowerCase().includes(q))
    const matchesIndustry = mentor.industries.some((ind) =>
      ind.toLowerCase().includes(q),
    )
    const matchesRole =
      mentor.headline.toLowerCase().includes(q) ||
      mentor.featuredTopic.toLowerCase().includes(q)
    if (matchesSkill || matchesIndustry || matchesRole) {
      score = Math.min(99, score + 4)
    }
  }

  return Math.min(99, Math.max(72, score))
}
