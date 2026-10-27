import { bootstrapPlatformState, syncPlatformStateKey } from '@/services/api'
import {
  authPersonaSchema,
  parseAuthPersona,
  type AuthPersona,
} from '@alumni-connect/shared/schemas/auth'

export type PlatformPersona = AuthPersona

export interface PersonaMeta {
  id: PlatformPersona
  label: string
  shortLabel: string
  badge: string
  defaultRoute: string
  userName: string
  userSubtitle: string
  userEmail: string
  initials: string
}

export const PLATFORM_PERSONAS: Record<PlatformPersona, PersonaMeta> = {
  STUDENT: {
    id: 'STUDENT',
    label: 'Student Scholar',
    shortLabel: 'Student',
    badge: 'BSCS ’26 · Final Year',
    defaultRoute: '/student',
    userName: 'Zainab Magsi',
    userSubtitle: 'BS Computer Science · Class of 2026',
    userEmail: 'zainab.magsi.bscs22@iba-suk.edu.pk',
    initials: 'ZM',
  },
  ALUMNI: {
    id: 'ALUMNI',
    label: 'Alumni Member',
    shortLabel: 'Alumni',
    badge: 'Class of ’20 · Verified',
    defaultRoute: '/dashboard',
    userName: 'Ahmed Hassan',
    userSubtitle: 'Senior Software Engineer · TechCorp',
    userEmail: 'ahmed.hassan@iba-suk.edu.pk',
    initials: 'AH',
  },
  MENTOR: {
    id: 'MENTOR',
    label: 'Alumni Mentor',
    shortLabel: 'Mentor',
    badge: 'Faculty Chair · 4.9★',
    defaultRoute: '/mentor',
    userName: 'Dr. Sarah Khan',
    userSubtitle: 'Director of Platform Engineering · TechCorp',
    userEmail: 'sarah.khan@iba-suk.edu.pk',
    initials: 'SK',
  },
  EMPLOYER: {
    id: 'EMPLOYER',
    label: 'Employer / Recruiter',
    shortLabel: 'Employer',
    badge: 'Verified Partner',
    defaultRoute: '/employer',
    userName: 'Tariq Mahmood',
    userSubtitle: 'VP Engineering & University Talent · TechCorp',
    userEmail: 'careers@techcorp.pk',
    initials: 'TM',
  },
  ADMIN: {
    id: 'ADMIN',
    label: 'Platform Administrator',
    shortLabel: 'Admin',
    badge: 'Institutional Ops',
    defaultRoute: '/admin',
    userName: 'Usman Khan',
    userSubtitle: 'Director of Alumni Relations · Sukkur IBA',
    userEmail: 'admin.alumni@iba-suk.edu.pk',
    initials: 'UK',
  },
}

const PERSONA_STORAGE_KEY = 'siba_active_persona_v1'
const CONNECTIONS_STORAGE_KEY = 'siba_connected_alumni_ids_v1'
const APPLICATIONS_STORAGE_KEY = 'siba_job_applications_v1'
const EMPLOYER_JOBS_STORAGE_KEY = 'siba_employer_jobs_v1'
const EMPLOYER_ORG_STORAGE_KEY = 'siba_employer_org_v1'

export function getActivePersona(): PlatformPersona {
  if (typeof window === 'undefined') return 'ALUMNI'
  const raw = window.localStorage.getItem(PERSONA_STORAGE_KEY)
  return parseAuthPersona(raw, 'ALUMNI')
}

export function setActivePersona(persona: PlatformPersona): void {
  if (typeof window === 'undefined') return
  try {
    const validatedPersona = authPersonaSchema.parse(persona)
    window.localStorage.setItem(PERSONA_STORAGE_KEY, validatedPersona)
    const existingToken = window.localStorage.getItem('accessToken')
    if (!existingToken || existingToken.startsWith('demo-session-')) {
      window.localStorage.setItem(
        'accessToken',
        `demo-session-${validatedPersona.toLowerCase()}`,
      )
    }
    window.dispatchEvent(
      new CustomEvent('persona-changed', { detail: validatedPersona }),
    )
    bootstrapPlatformState()
  } catch {
    // Ignore storage errors
  }
}

if (typeof window !== 'undefined') {
  bootstrapPlatformState()
}

export interface AlumniDetailedRecord {
  id: string
  name: string
  initials: string
  headline: string
  currentRole: string
  company: string
  industry: string
  graduationYear: number
  degree: string
  department: string
  location: string
  country: string
  chapter: string
  avatar: string
  coverBannerUrl?: string
  coverTheme?: string
  bio: string
  skills: string[]
  interests: string[]
  achievements: string[]
  isMentor: boolean
  mentorId?: string
  mutualConnections: number
  isPublic: boolean
  showEmail: boolean
  email: string
  linkedinUrl: string
  allowMessaging: 'ALL_VERIFIED' | 'CONNECTIONS_ONLY'
  careerJourney: {
    period: string
    role: string
    company: string
    location: string
    highlight: string
  }[]
}

export const ALUMNI_DETAILED_CATALOG: AlumniDetailedRecord[] = [
  {
    id: '1',
    name: 'Ahmed Hassan',
    initials: 'AH',
    headline: 'Senior Software Engineer · TechCorp',
    currentRole: 'Senior Software Engineer',
    company: 'TechCorp',
    industry: 'Enterprise SaaS',
    graduationYear: 2020,
    degree: 'BS Computer Science',
    department: 'Computer Science',
    location: 'Karachi, Pakistan',
    country: 'Pakistan',
    chapter: 'Karachi Chapter',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=480&q=80',
    coverBannerUrl: '/images/campus.jpg',
    coverTheme: 'emerald-gold',
    bio: 'Full-stack systems engineer building high-throughput B2B SaaS platforms in Karachi. Graduated with Distinction from Sukkur IBA University in 2020. Actively mentors final-year CS students on TypeScript, React architecture, and graduate software engineering interviews.',
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'System Design'],
    interests: ['Open-Source Tooling', 'Graduate Hiring', 'Distributed Systems'],
    achievements: [
      'Dean’s Honor List (2018–2020) · Sukkur IBA University',
      'Led migration of core billing engine serving 1.2M monthly active users',
      'Reviewed 60+ student resumes for Sukkur IBA Career Fair',
    ],
    isMentor: true,
    mentorId: '1',
    mutualConnections: 14,
    isPublic: true,
    showEmail: true,
    email: 'ahmed.hassan@iba-suk.edu.pk',
    linkedinUrl: 'https://linkedin.com/in/ahmedhassan-siba',
    allowMessaging: 'ALL_VERIFIED',
    careerJourney: [
      {
        period: '2022 – Present',
        role: 'Senior Software Engineer',
        company: 'TechCorp',
        location: 'Karachi, Pakistan',
        highlight: 'Architected multi-tenant API gateway and mentored 6 junior engineers.',
      },
      {
        period: '2020 – 2022',
        role: 'Software Engineer',
        company: 'Systems Ltd',
        location: 'Karachi, Pakistan',
        highlight: 'Delivered enterprise React & Node.js microservices for banking clients.',
      },
      {
        period: '2016 – 2020',
        role: 'BS Computer Science Scholar',
        company: 'Sukkur IBA University',
        location: 'Sukkur, Pakistan',
        highlight: 'President of ACM Student Chapter & National Programming Contest finalist.',
      },
    ],
  },
  {
    id: '2',
    name: 'Sanaullah Memon',
    initials: 'SM',
    headline: 'VP of Payment Rail Product · Careem FinTech',
    currentRole: 'VP of Product',
    company: 'Careem FinTech',
    industry: 'FinTech & Digital Banking',
    graduationYear: 2016,
    degree: 'BBA (Hons) Finance & Strategy',
    department: 'Business Administration',
    location: 'Dubai, United Arab Emirates',
    country: 'United Arab Emirates',
    chapter: 'Dubai & GCC Chapter',
    avatar:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=480&q=80',
    coverBannerUrl: '/images/alumni-gathering.jpg',
    coverTheme: 'sapphire-indigo',
    bio: 'Leads consumer and merchant payment rails across the Gulf and Pakistan. Passionate about helping Sukkur IBA business and CS graduates transition into product management, FinTech strategy, and GCC cross-border roles.',
    skills: ['Product Strategy', 'Payment Rails', 'FinTech', 'Venture Scaling', 'Analytics'],
    interests: ['MENA FinTech Regulation', 'Seed Investing', 'Product Teardowns'],
    achievements: [
      'Scaled merchant checkout volume past $4B+ annually across MENA',
      'Chair of Sukkur IBA Dubai & GCC Alumni Chapter (2024–Present)',
      'Sponsored 8 summer product internships for Sukkur IBA undergraduates',
    ],
    isMentor: true,
    mentorId: '2',
    mutualConnections: 22,
    isPublic: true,
    showEmail: false,
    email: 'sanaullah.memon@iba-suk.edu.pk',
    linkedinUrl: 'https://linkedin.com/in/sanaullahmemon-siba',
    allowMessaging: 'ALL_VERIFIED',
    careerJourney: [
      {
        period: '2023 – Present',
        role: 'VP of Payment Rail Product',
        company: 'Careem FinTech',
        location: 'Dubai, UAE',
        highlight: 'Directs regional wallet, remittance, and merchant settlement products.',
      },
      {
        period: '2019 – 2023',
        role: 'Principal Product Manager',
        company: 'Checkout.com',
        location: 'Dubai, UAE',
        highlight: 'Launched real-time payout rails across UAE, Saudi Arabia, and Pakistan.',
      },
      {
        period: '2016 – 2019',
        role: 'Product Analyst → Senior PM',
        company: 'HBL Digital',
        location: 'Karachi, Pakistan',
        highlight: 'Built mobile onboarding flows for 3M+ retail banking customers.',
      },
    ],
  },
  {
    id: '3',
    name: 'Dr. Aamir Soomro',
    initials: 'AS',
    headline: 'VP of AI Infrastructure · DeepScale Munich',
    currentRole: 'VP of AI Infrastructure',
    company: 'DeepScale Munich',
    industry: 'Artificial Intelligence',
    graduationYear: 2014,
    degree: 'BS Computer Science',
    department: 'Computer Science',
    location: 'Munich, Germany',
    country: 'Germany',
    chapter: 'European Chapter',
    avatar:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=480&q=80',
    coverBannerUrl: '/images/seminar.jpg',
    coverTheme: 'violet-aurora',
    bio: 'Architects multi-node GPU training clusters and low-latency inference engines in Munich. Completed DAAD doctoral fellowship at TU Munich after graduating from Sukkur IBA. Guides students and alumni aiming for European graduate fellowships and ML systems roles.',
    skills: ['AI Infrastructure', 'Machine Learning', 'Python', 'Kubernetes', 'CUDA'],
    interests: ['DAAD & Erasmus Scholarships', 'LLM Inference', 'High-Performance Computing'],
    achievements: [
      'DAAD Doctoral Fellow · Technical University of Munich (TUM)',
      'Published 9 peer-reviewed papers in distributed ML systems',
      'Mentored 31 Sukkur IBA scholars into European MSc/PhD and engineering tracks',
    ],
    isMentor: true,
    mentorId: '3',
    mutualConnections: 19,
    isPublic: true,
    showEmail: true,
    email: 'aamir.soomro@iba-suk.edu.pk',
    linkedinUrl: 'https://linkedin.com/in/aamirsoomro-siba',
    allowMessaging: 'ALL_VERIFIED',
    careerJourney: [
      {
        period: '2022 – Present',
        role: 'VP of AI Infrastructure',
        company: 'DeepScale Munich',
        location: 'Munich, Germany',
        highlight: 'Leads 30+ ML systems engineers operating sovereign GPU clusters.',
      },
      {
        period: '2017 – 2021',
        role: 'Doctoral Researcher (PhD CS)',
        company: 'TU Munich',
        location: 'Munich, Germany',
        highlight: 'Researched distributed tensor parallelism under DAAD scholarship.',
      },
    ],
  },
  {
    id: '4',
    name: 'Kamran Mahar',
    initials: 'KM',
    headline: 'Managing Director, Cloud Security · SovereignCloud',
    currentRole: 'Managing Director',
    company: 'SovereignCloud',
    industry: 'Cybersecurity & Cloud',
    graduationYear: 2011,
    degree: 'BS Computer Science',
    department: 'Computer Science',
    location: 'Riyadh, Saudi Arabia',
    country: 'Saudi Arabia',
    chapter: 'Riyadh & GCC Chapter',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=480&q=80',
    coverBannerUrl: '/images/campus.jpg',
    coverTheme: 'amber-terracotta',
    bio: 'Oversees sovereign cloud security and zero-trust banking infrastructure across Saudi Arabia and the GCC. Advises engineering leaders and cybersecurity graduates on enterprise security certifications and GCC career tracks.',
    skills: ['Cloud Security', 'Zero-Trust Architecture', 'Risk & Compliance', 'System Design'],
    interests: ['Sovereign Cloud', 'CISO Advisory', 'GCC Tech Talent Mobility'],
    achievements: [
      'Spearheaded zero-trust cloud migration for 4 tier-1 GCC financial institutions',
      'Founding Patron of Sukkur IBA Cybersecurity Lab Endowment',
    ],
    isMentor: true,
    mentorId: '5',
    mutualConnections: 11,
    isPublic: true,
    showEmail: false,
    email: 'kamran.mahar@iba-suk.edu.pk',
    linkedinUrl: 'https://linkedin.com/in/kamranmahar-siba',
    allowMessaging: 'CONNECTIONS_ONLY',
    careerJourney: [
      {
        period: '2021 – Present',
        role: 'Managing Director, Cloud Security',
        company: 'SovereignCloud',
        location: 'Riyadh, Saudi Arabia',
        highlight: 'Directs enterprise cybersecurity architecture across KSA & UAE.',
      },
      {
        period: '2015 – 2021',
        role: 'Principal Security Architect',
        company: 'STC Cloud',
        location: 'Riyadh, Saudi Arabia',
        highlight: 'Built regulatory compliance and threat-detection operations.',
      },
    ],
  },
  {
    id: '5',
    name: 'Nadia Talpur',
    initials: 'NT',
    headline: 'Head of Design Engineering · LinearCraft Studio',
    currentRole: 'Head of Design Engineering',
    company: 'LinearCraft Studio',
    industry: 'Developer Tools & Design',
    graduationYear: 2018,
    degree: 'BS Computer Science',
    department: 'Computer Science',
    location: 'London, United Kingdom',
    country: 'United Kingdom',
    chapter: 'UK & Europe Chapter',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=480&q=80',
    coverBannerUrl: '/images/alumni-gathering.jpg',
    coverTheme: 'violet-aurora',
    bio: 'Bridges interaction design, accessibility architecture, and high-craft frontend engineering in London. Helps Sukkur IBA students build world-class UI engineering portfolios.',
    skills: ['Design Systems', 'Frontend Architecture', 'React', 'TypeScript', 'Accessibility'],
    interests: ['Design Tokens', 'Motion Engineering', 'UK Global Talent Visas'],
    achievements: [
      'Speaker at React Advanced London on Accessible Motion Systems',
      'Created open-source design system adopted by 4,000+ developers',
    ],
    isMentor: true,
    mentorId: '4',
    mutualConnections: 17,
    isPublic: true,
    showEmail: true,
    email: 'nadia.talpur@iba-suk.edu.pk',
    linkedinUrl: 'https://linkedin.com/in/nadiatalpur-siba',
    allowMessaging: 'ALL_VERIFIED',
    careerJourney: [
      {
        period: '2022 – Present',
        role: 'Head of Design Engineering',
        company: 'LinearCraft Studio',
        location: 'London, UK',
        highlight: 'Leads design systems and frontend platform architecture.',
      },
      {
        period: '2018 – 2022',
        role: 'Senior UI Engineer',
        company: 'Monzo Bank',
        location: 'London, UK',
        highlight: 'Built accessible web & mobile design primitives.',
      },
    ],
  },
  {
    id: '6',
    name: 'Rabia Khuhro',
    initials: 'RK',
    headline: 'Head of Quantitative Risk & Treasury · Habib Metro',
    currentRole: 'Head of Quantitative Risk',
    company: 'Habib Metro Financial',
    industry: 'Capital Markets & Banking',
    graduationYear: 2013,
    degree: 'BS Mathematics & Finance',
    department: 'Mathematics & Finance',
    location: 'Islamabad, Pakistan',
    country: 'Pakistan',
    chapter: 'Islamabad Chapter',
    avatar:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=480&q=80',
    coverBannerUrl: '/images/seminar.jpg',
    coverTheme: 'emerald-gold',
    bio: 'Leads quantitative risk modeling, algorithmic treasury products, and regulatory capital strategy. Mentors students and alumni pursuing quantitative finance, FRM/CFA credentials, and FinTech data science.',
    skills: ['Quantitative Finance', 'Risk & Compliance', 'Python', 'Financial Modeling'],
    interests: ['Stochastic Modeling', 'Women in Quantitative Finance', 'Credit Scoring'],
    achievements: [
      'Gold Medalist · BS Mathematics & Finance (Sukkur IBA 2013)',
      'Certified Financial Risk Manager (FRM) & CFA Charterholder',
    ],
    isMentor: true,
    mentorId: '6',
    mutualConnections: 9,
    isPublic: true,
    showEmail: false,
    email: 'rabia.khuhro@iba-suk.edu.pk',
    linkedinUrl: 'https://linkedin.com/in/rabiakhuhro-siba',
    allowMessaging: 'ALL_VERIFIED',
    careerJourney: [
      {
        period: '2020 – Present',
        role: 'Head of Quantitative Risk & Treasury',
        company: 'Habib Metro Financial',
        location: 'Islamabad, Pakistan',
        highlight: 'Oversees credit risk scorecards and liquidity stress testing.',
      },
      {
        period: '2014 – 2020',
        role: 'Senior Quantitative Analyst',
        company: 'JS Bank',
        location: 'Karachi, Pakistan',
        highlight: 'Developed automated SME credit risk models.',
      },
    ],
  },
]

const ALUMNI_OVERRIDES_STORAGE_KEY = 'siba_alumni_profile_overrides_v1'

export function loadAlumniCatalogWithOverrides(): AlumniDetailedRecord[] {
  if (typeof window === 'undefined') return ALUMNI_DETAILED_CATALOG
  try {
    const raw = window.localStorage.getItem(ALUMNI_OVERRIDES_STORAGE_KEY)
    if (!raw) return ALUMNI_DETAILED_CATALOG
    const overrides = JSON.parse(raw) as Record<
      string,
      Partial<AlumniDetailedRecord>
    >
    return ALUMNI_DETAILED_CATALOG.map((item) =>
      overrides[item.id] ? { ...item, ...overrides[item.id] } : item,
    )
  } catch {
    return ALUMNI_DETAILED_CATALOG
  }
}

export function saveAlumniProfileOverride(
  alumniId: string,
  patch: Partial<AlumniDetailedRecord>,
): void {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(ALUMNI_OVERRIDES_STORAGE_KEY)
    const overrides: Record<string, Partial<AlumniDetailedRecord>> = raw
      ? JSON.parse(raw)
      : {}
    overrides[alumniId] = { ...(overrides[alumniId] ?? {}), ...patch }
    window.localStorage.setItem(
      ALUMNI_OVERRIDES_STORAGE_KEY,
      JSON.stringify(overrides),
    )
    syncPlatformStateKey('alumniOverrides', overrides)
  } catch {
    // Ignore storage quota errors
  }
}

export function loadConnectedAlumniIds(): Record<string, 'CONNECTED' | 'PENDING'> {
  if (typeof window === 'undefined') return { '2': 'CONNECTED', '4': 'CONNECTED' }
  try {
    const raw = window.localStorage.getItem(CONNECTIONS_STORAGE_KEY)
    if (!raw) return { '2': 'CONNECTED', '4': 'CONNECTED' }
    return JSON.parse(raw)
  } catch {
    return { '2': 'CONNECTED', '4': 'CONNECTED' }
  }
}

export function saveConnectedAlumniIds(
  map: Record<string, 'CONNECTED' | 'PENDING'>,
): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CONNECTIONS_STORAGE_KEY, JSON.stringify(map))
    syncPlatformStateKey('connectedAlumniIds', map)
  } catch {
    // Ignore
  }
}

export interface StudentJobApplication {
  id: string
  jobId: string
  jobTitle: string
  company: string
  location: string
  employmentType: string
  appliedAt: string
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'INTERVIEW' | 'OFFERED' | 'REJECTED'
  applicantName: string
  applicantEmail: string
  applicantMajor: string
  applicantGradYear: number
  applicantGpa: string
  resumeUrl: string
  coverNote: string
  skills: string[]
}

const DEFAULT_APPLICATIONS: StudentJobApplication[] = [
  {
    id: 'app-101',
    jobId: '1',
    jobTitle: 'Staff Distributed Systems Engineer',
    company: 'Careem FinTech',
    location: 'Dubai / Remote',
    employmentType: 'FULL_TIME',
    appliedAt: '2026-10-14',
    status: 'SHORTLISTED',
    applicantName: 'Ahmed Hassan',
    applicantEmail: 'ahmed.hassan@iba-suk.edu.pk',
    applicantMajor: 'BS Computer Science',
    applicantGradYear: 2020,
    applicantGpa: '3.82 / 4.00',
    resumeUrl: 'https://iba-suk.edu.pk/portfolios/ahmed-hassan-cv.pdf',
    coverNote:
      '4+ years building distributed payment ledgers and high-throughput Node.js/Go microservices. Referred by Sanaullah Memon.',
    skills: ['TypeScript', 'Go', 'Kubernetes', 'PostgreSQL', 'System Design'],
  },
  {
    id: 'app-102',
    jobId: '4',
    jobTitle: 'Product Strategy & Venture Fellow (Summer / Grad)',
    company: 'Menapay Ventures',
    location: 'Karachi / Hybrid',
    employmentType: 'INTERNSHIP',
    appliedAt: '2026-10-18',
    status: 'INTERVIEW',
    applicantName: 'Zainab Magsi',
    applicantEmail: 'zainab.magsi.bscs22@iba-suk.edu.pk',
    applicantMajor: 'BS Computer Science',
    applicantGradYear: 2026,
    applicantGpa: '3.76 / 4.00',
    resumeUrl: 'https://iba-suk.edu.pk/portfolios/zainab-magsi-cv.pdf',
    coverNote:
      'Final-year Sukkur IBA CS scholar with fintech capstone on merchant QR settlement analytics.',
    skills: ['Product Analytics', 'SQL', 'TypeScript', 'Figma', 'Financial Modeling'],
  },
  {
    id: 'app-103',
    jobId: '2',
    jobTitle: 'Applied ML Infrastructure Engineer',
    company: 'DeepScale Munich',
    location: 'Munich / Relocation Sponsored',
    employmentType: 'FULL_TIME',
    appliedAt: '2026-10-19',
    status: 'SUBMITTED',
    applicantName: 'Bilal Shaikh',
    applicantEmail: 'bilal.shaikh@iba-suk.edu.pk',
    applicantMajor: 'BS Computer Science',
    applicantGradYear: 2024,
    applicantGpa: '3.91 / 4.00',
    resumeUrl: 'https://iba-suk.edu.pk/portfolios/bilal-shaikh-cv.pdf',
    coverNote:
      'Implemented quantized vLLM inference benchmarks for Sindhi/Urdu NLP models during senior thesis.',
    skills: ['Python', 'PyTorch', 'CUDA', 'Docker', 'Kubernetes'],
  },
]

export function loadJobApplications(): StudentJobApplication[] {
  if (typeof window === 'undefined') return DEFAULT_APPLICATIONS
  try {
    const raw = window.localStorage.getItem(APPLICATIONS_STORAGE_KEY)
    if (!raw) {
      window.localStorage.setItem(
        APPLICATIONS_STORAGE_KEY,
        JSON.stringify(DEFAULT_APPLICATIONS),
      )
      return DEFAULT_APPLICATIONS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : DEFAULT_APPLICATIONS
  } catch {
    return DEFAULT_APPLICATIONS
  }
}

export function saveJobApplications(apps: StudentJobApplication[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(apps))
    syncPlatformStateKey('jobApplications', apps)
  } catch {
    // Ignore
  }
}

export interface EmployerJobPosting {
  id: string
  title: string
  company: string
  department: string
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT' | 'REMOTE'
  location: string
  isRemote: boolean
  experienceLevel: 'ENTRY_GRADUATE' | 'MID_SENIOR' | 'STAFF_LEAD'
  salaryRange: string
  applicationDeadline: string
  applicationMethod: 'PLATFORM_ONE_CLICK' | 'EXTERNAL_ATS'
  externalApplyUrl?: string
  status: 'PUBLISHED' | 'DRAFT' | 'CLOSED' | 'ARCHIVED'
  description: string
  requirements: string[]
  skills: string[]
  createdAt: string
}

export interface EmployerOrganizationProfile {
  name: string
  tagline: string
  industry: string
  website: string
  headquarters: string
  companySize: string
  foundedYear: string
  verificationStatus: 'VERIFIED_PARTNER' | 'PENDING_REVIEW'
  alumniEmployeesCount: number
  description: string
  recruiterContactName: string
  recruiterContactEmail: string
}

const DEFAULT_EMPLOYER_ORG: EmployerOrganizationProfile = {
  name: 'TechCorp Global & Careem Alumni Recruiting Guild',
  tagline: 'Enterprise Cloud, FinTech & AI Engineering Partner of Sukkur IBA University',
  industry: 'Enterprise SaaS & FinTech',
  website: 'https://careers.techcorp.example.com',
  headquarters: 'Karachi, Pakistan & Dubai, UAE',
  companySize: '500–1,000 Employees',
  foundedYear: '2014',
  verificationStatus: 'VERIFIED_PARTNER',
  alumniEmployeesCount: 48,
  description:
    'TechCorp builds mission-critical cloud and payment infrastructure across South Asia and MENA. As a verified Sukkur IBA University recruiting partner, we hire graduating scholars for summer internships, graduate fellowships, and senior engineering tracks.',
  recruiterContactName: 'Engr. Tariq Mahmood (BSCS ’15)',
  recruiterContactEmail: 'university-talent@techcorp.pk',
}

const DEFAULT_EMPLOYER_JOBS: EmployerJobPosting[] = [
  {
    id: '1',
    title: 'Staff Distributed Systems Engineer',
    company: 'Careem FinTech',
    department: 'Core Payment Platform',
    employmentType: 'FULL_TIME',
    location: 'Dubai / Remote',
    isRemote: true,
    experienceLevel: 'STAFF_LEAD',
    salaryRange: '$110,000 – $145,000 / yr',
    applicationDeadline: '2026-11-30',
    applicationMethod: 'PLATFORM_ONE_CLICK',
    status: 'PUBLISHED',
    description:
      'Lead high-availability ledger and merchant settlement services processing millions of daily transactions across MENA and Pakistan.',
    requirements: [
      '5+ years production backend engineering in Go, TypeScript, or Java',
      'Deep familiarity with PostgreSQL, Kafka, and multi-region Kubernetes',
      'Track record of mentoring junior engineers and authoring RFCs',
    ],
    skills: ['TypeScript', 'Go', 'Kubernetes', 'PostgreSQL', 'System Design'],
    createdAt: '2026-10-02',
  },
  {
    id: '4',
    title: 'Product Strategy & Venture Fellow (Summer / Grad)',
    company: 'Menapay Ventures',
    department: 'Product & Growth',
    employmentType: 'INTERNSHIP',
    location: 'Karachi / Hybrid',
    isRemote: false,
    experienceLevel: 'ENTRY_GRADUATE',
    salaryRange: 'PKR 120,000 / mo Stipend',
    applicationDeadline: '2026-12-15',
    applicationMethod: 'PLATFORM_ONE_CLICK',
    status: 'PUBLISHED',
    description:
      'A 12-week paid fellowship for final-year Sukkur IBA students and recent graduates working directly with alumni VPs on FinTech product teardowns, SQL cohort analytics, and merchant onboarding.',
    requirements: [
      'Final-year undergraduate or recent graduate from Sukkur IBA (CS, BBA, or Math)',
      'Strong analytical foundation in SQL, product metrics, and user research',
    ],
    skills: ['Product Analytics', 'SQL', 'Figma', 'Financial Modeling'],
    createdAt: '2026-10-10',
  },
  {
    id: '2',
    title: 'Applied ML Infrastructure Engineer',
    company: 'DeepScale Munich',
    department: 'AI Compute Cluster',
    employmentType: 'FULL_TIME',
    location: 'Munich / Relocation Sponsored',
    isRemote: false,
    experienceLevel: 'MID_SENIOR',
    salaryRange: '€95,000 – €125,000 / yr',
    applicationDeadline: '2026-12-05',
    applicationMethod: 'EXTERNAL_ATS',
    externalApplyUrl: 'https://deepscale.example.com/careers/ml-infra',
    status: 'PUBLISHED',
    description:
      'Optimize multi-GPU LLM inference pipelines, tensor parallelism, and Kubernetes scheduling in Munich with full EU Blue Card visa sponsorship.',
    requirements: [
      'BS/MS in Computer Science with strong Python and C++/CUDA fundamentals',
      'Experience serving PyTorch/vLLM models in production',
    ],
    skills: ['Python', 'PyTorch', 'CUDA', 'Kubernetes'],
    createdAt: '2026-10-12',
  },
  {
    id: 'emp-draft-1',
    title: 'Graduate Software Engineer — Core Platform (Batch 2026)',
    company: 'TechCorp',
    department: 'Cloud Engineering',
    employmentType: 'FULL_TIME',
    location: 'Karachi / Sukkur Hub',
    isRemote: true,
    experienceLevel: 'ENTRY_GRADUATE',
    salaryRange: 'PKR 240,000 – 320,000 / mo',
    applicationDeadline: '2026-12-20',
    applicationMethod: 'PLATFORM_ONE_CLICK',
    status: 'DRAFT',
    description:
      'Dedicated graduate engineering intake for Sukkur IBA Class of 2026 scholars. Includes a 6-month rotational bootcamp across frontend, backend, and cloud security teams.',
    requirements: [
      'Graduating BSCS / BSSE scholar (Class of 2026) with strong data structures foundation',
      'Portfolio of at least 1 full-stack TypeScript or Python capstone project',
    ],
    skills: ['TypeScript', 'React', 'Node.js', 'SQL'],
    createdAt: '2026-10-20',
  },
]

export function loadEmployerOrg(): EmployerOrganizationProfile {
  if (typeof window === 'undefined') return DEFAULT_EMPLOYER_ORG
  try {
    const raw = window.localStorage.getItem(EMPLOYER_ORG_STORAGE_KEY)
    if (!raw) return DEFAULT_EMPLOYER_ORG
    return JSON.parse(raw)
  } catch {
    return DEFAULT_EMPLOYER_ORG
  }
}

export function saveEmployerOrg(org: EmployerOrganizationProfile): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(EMPLOYER_ORG_STORAGE_KEY, JSON.stringify(org))
    syncPlatformStateKey('employerOrg', org)
  } catch {
    // Ignore
  }
}

export function loadEmployerJobs(): EmployerJobPosting[] {
  if (typeof window === 'undefined') return DEFAULT_EMPLOYER_JOBS
  try {
    const raw = window.localStorage.getItem(EMPLOYER_JOBS_STORAGE_KEY)
    if (!raw) {
      window.localStorage.setItem(
        EMPLOYER_JOBS_STORAGE_KEY,
        JSON.stringify(DEFAULT_EMPLOYER_JOBS),
      )
      return DEFAULT_EMPLOYER_JOBS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : DEFAULT_EMPLOYER_JOBS
  } catch {
    return DEFAULT_EMPLOYER_JOBS
  }
}

export function saveEmployerJobs(jobs: EmployerJobPosting[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(EMPLOYER_JOBS_STORAGE_KEY, JSON.stringify(jobs))
    syncPlatformStateKey('employerJobs', jobs)
  } catch {
    // Ignore
  }
}
