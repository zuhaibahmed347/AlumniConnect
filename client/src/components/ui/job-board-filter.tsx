import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  ArrowUpDown,
  LayoutGrid,
  List,
  Globe2,
  Building2,
  Laptop,
  Briefcase,
  Layers,
  X,
} from 'lucide-react'
import { Input, SelectField } from '@/components/ui/input'

export type JobSector =
  | 'ALL'
  | 'AI_CLOUD'
  | 'FINTECH'
  | 'DATA_ANALYTICS'
  | 'PRODUCT_DESIGN'
  | 'ENTERPRISE'

export type ExperienceLevel =
  | 'ALL'
  | 'ENTRY'
  | 'MID_SENIOR'
  | 'STAFF_PRINCIPAL'
  | 'EXECUTIVE'

export type WorkplaceMode = 'ALL' | 'REMOTE' | 'HYBRID' | 'ON_SITE'

export type EmploymentType =
  | 'FULL_TIME'
  | 'CONTRACT'
  | 'INTERNSHIP'
  | 'ADVISORY'

export type JobSortOrder =
  | 'RECOMMENDED'
  | 'SALARY_DESC'
  | 'FASTEST_REFERRAL'
  | 'NEWEST'

export interface JobBoardFilterState {
  search: string
  sector: JobSector
  experienceLevel: ExperienceLevel
  workplaceMode: WorkplaceMode
  employmentType: 'ALL' | EmploymentType
  sortBy: JobSortOrder
  viewMode: 'grid' | 'list'
}

export interface AlumniJobListing {
  id: string
  title: string
  company: string
  companyLogoUrl: string
  companyWebsite: string
  sector: Exclude<JobSector, 'ALL'>
  sectorLabel: string
  experienceLevel: Exclude<ExperienceLevel, 'ALL'>
  experienceLabel: string
  workplaceMode: Exclude<WorkplaceMode, 'ALL'>
  workplaceLabel: string
  employmentType: EmploymentType
  employmentLabel: string
  location: string
  isRemote: boolean
  salaryMin: number
  salaryMax: number
  salaryCurrency: string
  compensationDisplay: string
  referralTurnaroundHours: number
  referrerName: string
  referrerCohort: string
  referrerRole: string
  referrerAvatar: string
  description: string
  requirements: string
  benefits: string
  techStack: string[]
  status: 'ACTIVE' | 'EXPIRED'
  postedAt: string
  expiresAt: string
  applications: number
  featuredScore: number
  externalApplyUrl: string
}

export const JOB_SECTORS: ReadonlyArray<{
  id: JobSector
  label: string
  shortLabel: string
}> = [
  { id: 'ALL', label: 'All Sectors', shortLabel: 'All' },
  {
    id: 'AI_CLOUD',
    label: 'AI & Cloud Infrastructure',
    shortLabel: 'AI & Cloud',
  },
  { id: 'FINTECH', label: 'FinTech & Digital Banking', shortLabel: 'FinTech' },
  {
    id: 'DATA_ANALYTICS',
    label: 'Data Science & Analytics',
    shortLabel: 'Data Science',
  },
  {
    id: 'PRODUCT_DESIGN',
    label: 'Product & Experience Design',
    shortLabel: 'Product & Design',
  },
  {
    id: 'ENTERPRISE',
    label: 'Enterprise & Cybersecurity',
    shortLabel: 'Enterprise',
  },
]

export const EXPERIENCE_LEVELS: ReadonlyArray<{
  id: ExperienceLevel
  label: string
  yearsHint: string
}> = [
  { id: 'ALL', label: 'All Levels', yearsHint: 'Any tenure' },
  { id: 'ENTRY', label: 'Entry & Associate', yearsHint: '0–2 yrs' },
  { id: 'MID_SENIOR', label: 'Mid–Senior', yearsHint: '3–6 yrs' },
  { id: 'STAFF_PRINCIPAL', label: 'Staff & Principal', yearsHint: '7–10+ yrs' },
  { id: 'EXECUTIVE', label: 'Executive / VP', yearsHint: 'Leadership' },
]

export const WORKPLACE_MODES: ReadonlyArray<{
  id: WorkplaceMode
  label: string
  subtitle: string
}> = [
  { id: 'ALL', label: 'All Modes', subtitle: 'Every workplace' },
  { id: 'REMOTE', label: 'Remote', subtitle: 'Distributed / Global' },
  { id: 'HYBRID', label: 'Hybrid', subtitle: '2–3 days in office' },
  { id: 'ON_SITE', label: 'On-Site', subtitle: 'Campus / HQ hub' },
]

export const SUKKUR_IBA_JOB_LISTINGS: AlumniJobListing[] = [
  {
    id: '1',
    title: 'Staff Distributed Systems & AI Infrastructure Engineer',
    company: 'AI Innovations',
    companyLogoUrl: '/images/logos/ai-innovations.jpg',
    companyWebsite: 'https://ai-innovations.example.com',
    sector: 'AI_CLOUD',
    sectorLabel: 'AI & Cloud Infrastructure',
    experienceLevel: 'STAFF_PRINCIPAL',
    experienceLabel: 'Staff & Principal (7+ yrs)',
    workplaceMode: 'REMOTE',
    workplaceLabel: 'Remote (Global / EMEA & PK)',
    employmentType: 'FULL_TIME',
    employmentLabel: 'Full-Time',
    location: 'Remote · Munich / Karachi',
    isRemote: true,
    salaryMin: 145000,
    salaryMax: 185000,
    salaryCurrency: 'USD',
    compensationDisplay: '$145k – $185k · Equity',
    referralTurnaroundHours: 18,
    referrerName: 'Dr. Aamir Soomro',
    referrerCohort: 'BSCS ’14',
    referrerRole: 'VP of Infrastructure',
    referrerAvatar: '/images/avatars/aamir.jpg',
    description:
      'Architect low-latency GPU inference clusters, multi-region Kubernetes control planes, and high-throughput vector indexing pipelines alongside a team of Sukkur IBA computer science alumni.',
    requirements:
      '7+ years building production distributed systems in Go, Rust, or TypeScript. Deep operational fluency with Kubernetes, Ray, and cloud networking. Proven track record mentoring senior engineers.',
    benefits:
      'Competitive USD compensation with meaningful equity. Annual hardware and home-office stipend. Sponsored international conference travel and executive coaching.',
    techStack: ['Go', 'Kubernetes', 'PyTorch', 'Terraform', 'gRPC'],
    status: 'ACTIVE',
    postedAt: '2026-04-28T09:00:00.000Z',
    expiresAt: '2026-06-30T23:59:59.000Z',
    applications: 34,
    featuredScore: 99,
    externalApplyUrl: 'https://ai-innovations.example.com/careers/staff-infra',
  },
  {
    id: '2',
    title: 'Senior Full-Stack Product Engineer (Core Payments)',
    company: 'TechCorp',
    companyLogoUrl: '/images/logos/techcorp.jpg',
    companyWebsite: 'https://techcorp.example.com',
    sector: 'FINTECH',
    sectorLabel: 'FinTech & Digital Banking',
    experienceLevel: 'MID_SENIOR',
    experienceLabel: 'Mid–Senior (4–6 yrs)',
    workplaceMode: 'HYBRID',
    workplaceLabel: 'Hybrid · Karachi & Dubai',
    employmentType: 'FULL_TIME',
    employmentLabel: 'Full-Time',
    location: 'Karachi, Pakistan',
    isRemote: false,
    salaryMin: 95000,
    salaryMax: 130000,
    salaryCurrency: 'USD',
    compensationDisplay: '$95k – $130k · Bonus',
    referralTurnaroundHours: 24,
    referrerName: 'Sanaullah Memon',
    referrerCohort: 'BBA ’16',
    referrerRole: 'Director of Payment Rail Product',
    referrerAvatar: '/images/avatars/sana.jpg',
    description:
      'Lead end-to-end engineering for cross-border treasury settlement and instant merchant payouts across MENA and South Asia. Direct referral fast-tracks you to the technical architecture round.',
    requirements:
      '4+ years shipping mission-critical financial services with TypeScript, React, Node.js, and PostgreSQL. Strong grasp of idempotency, ledger reconciliation, and PCI-DSS security standards.',
    benefits:
      'Comprehensive family medical coverage, hybrid commuter allowance, annual performance bonus, and fast-track relocation support to Dubai.',
    techStack: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Kafka'],
    status: 'ACTIVE',
    postedAt: '2026-04-27T14:30:00.000Z',
    expiresAt: '2026-06-25T23:59:59.000Z',
    applications: 47,
    featuredScore: 95,
    externalApplyUrl: 'https://techcorp.example.com/careers/senior-payments',
  },
  {
    id: '3',
    title: 'Principal Applied Data Scientist & Risk Modeler',
    company: 'DataInsights',
    companyLogoUrl: '/images/logos/datainsights.jpg',
    companyWebsite: 'https://datainsights.example.com',
    sector: 'DATA_ANALYTICS',
    sectorLabel: 'Data Science & Analytics',
    experienceLevel: 'STAFF_PRINCIPAL',
    experienceLabel: 'Staff & Principal (7+ yrs)',
    workplaceMode: 'ON_SITE',
    workplaceLabel: 'On-Site · Islamabad HQ',
    employmentType: 'FULL_TIME',
    employmentLabel: 'Full-Time',
    location: 'Islamabad, Pakistan',
    isRemote: false,
    salaryMin: 110000,
    salaryMax: 145000,
    salaryCurrency: 'USD',
    compensationDisplay: '$110k – $145k · Profit Share',
    referralTurnaroundHours: 36,
    referrerName: 'Bilal Ahmed Qureshi',
    referrerCohort: 'MSDS ’17',
    referrerRole: 'Chief Data Officer',
    referrerAvatar: '/images/avatars/bilal.jpg',
    description:
      'Design causal inference frameworks, real-time credit underwriting models, and econometric forecasting engines serving 14M+ retail accounts.',
    requirements:
      'MS or PhD in Data Science, Statistics, or Computer Science. 6+ years deploying gradient boosted trees and deep tabular models into regulated production environments.',
    benefits:
      'Executive health plan, dedicated research publication grant, sabbatical eligibility, and annual profit-sharing pool.',
    techStack: ['Python', 'Spark', 'dbt', 'Snowflake', 'MLflow'],
    status: 'ACTIVE',
    postedAt: '2026-04-26T11:15:00.000Z',
    expiresAt: '2026-06-20T23:59:59.000Z',
    applications: 29,
    featuredScore: 92,
    externalApplyUrl: 'https://datainsights.example.com/careers/principal-ds',
  },
  {
    id: '4',
    title: 'Lead Design Systems & Spatial UI Architect',
    company: 'Creative Studio',
    companyLogoUrl: '/images/logos/creative-studio.jpg',
    companyWebsite: 'https://creativestudio.example.com',
    sector: 'PRODUCT_DESIGN',
    sectorLabel: 'Product & Experience Design',
    experienceLevel: 'MID_SENIOR',
    experienceLabel: 'Mid–Senior (4–6 yrs)',
    workplaceMode: 'REMOTE',
    workplaceLabel: 'Remote (Async-First)',
    employmentType: 'FULL_TIME',
    employmentLabel: 'Full-Time',
    location: 'Remote · London / Lahore',
    isRemote: true,
    salaryMin: 105000,
    salaryMax: 138000,
    salaryCurrency: 'USD',
    compensationDisplay: '$105k – $138k · Remote',
    referralTurnaroundHours: 12,
    referrerName: 'Nadia Talpur',
    referrerCohort: 'BSCS ’18',
    referrerRole: 'Head of Design Engineering',
    referrerAvatar: '/images/avatars/nadia.jpg',
    description:
      'Own the multi-brand design token architecture, accessible React component primitives, and motion choreography across web and desktop workspaces.',
    requirements:
      '4+ years bridging Figma systems and production React + Framer Motion + Tailwind CSS codebases. Obsessive eye for typographic hierarchy, WCAG AA contrast, and micro-interaction physics.',
    benefits:
      '4-day summer workweeks, $3,500 studio hardware budget, unlimited book & course allowance, and global coworking pass.',
    techStack: ['React', 'Framer Motion', 'Figma Tokens', 'TypeScript', 'Radix'],
    status: 'ACTIVE',
    postedAt: '2026-04-29T08:00:00.000Z',
    expiresAt: '2026-07-05T23:59:59.000Z',
    applications: 41,
    featuredScore: 94,
    externalApplyUrl: 'https://creativestudio.example.com/careers/design-systems',
  },
  {
    id: '5',
    title: 'VP of Engineering — Enterprise Cloud Security',
    company: 'HumaneCorp',
    companyLogoUrl: '/images/logos/humane-corp.jpg',
    companyWebsite: 'https://humanecorp.example.com',
    sector: 'ENTERPRISE',
    sectorLabel: 'Enterprise & Cybersecurity',
    experienceLevel: 'EXECUTIVE',
    experienceLabel: 'Executive / VP (10+ yrs)',
    workplaceMode: 'HYBRID',
    workplaceLabel: 'Hybrid · Riyadh & Karachi',
    employmentType: 'FULL_TIME',
    employmentLabel: 'Full-Time',
    location: 'Riyadh, Saudi Arabia',
    isRemote: false,
    salaryMin: 190000,
    salaryMax: 240000,
    salaryCurrency: 'USD',
    compensationDisplay: '$190k – $240k · Executive LTIP',
    referralTurnaroundHours: 24,
    referrerName: 'Kamran Mahar',
    referrerCohort: 'BSCS ’11',
    referrerRole: 'Managing Director, MENA',
    referrerAvatar: '/images/avatars/kamran.jpg',
    description:
      'Scale a 65-person engineering organization delivering zero-trust identity governance and sovereign cloud compliance across GCC financial institutions.',
    requirements:
      '10+ years in software engineering with 4+ years leading multi-team engineering organizations. Deep familiarity with SOC2, ISO-27001, and sovereign cloud deployment models.',
    benefits:
      'Tax-free executive package, family relocation and international schooling allowance, long-term incentive equity plan, and board advisory exposure.',
    techStack: ['Zero-Trust IAM', 'AWS Sovereign', 'Go', 'Kubernetes', 'SOC2'],
    status: 'ACTIVE',
    postedAt: '2026-04-24T16:00:00.000Z',
    expiresAt: '2026-06-15T23:59:59.000Z',
    applications: 18,
    featuredScore: 97,
    externalApplyUrl: 'https://humanecorp.example.com/careers/vp-engineering',
  },
  {
    id: '6',
    title: 'Associate Quantitative FinTech Engineer (Grad Fellowship)',
    company: 'TechCorp',
    companyLogoUrl: '/images/logos/techcorp.jpg',
    companyWebsite: 'https://techcorp.example.com',
    sector: 'FINTECH',
    sectorLabel: 'FinTech & Digital Banking',
    experienceLevel: 'ENTRY',
    experienceLabel: 'Entry & Associate (0–2 yrs)',
    workplaceMode: 'ON_SITE',
    workplaceLabel: 'On-Site · Sukkur & Karachi',
    employmentType: 'FULL_TIME',
    employmentLabel: 'Full-Time',
    location: 'Sukkur / Karachi, Pakistan',
    isRemote: false,
    salaryMin: 48000,
    salaryMax: 68000,
    salaryCurrency: 'USD',
    compensationDisplay: '$48k – $68k · Grad Rotation',
    referralTurnaroundHours: 12,
    referrerName: 'Hassan Raza Shaikh',
    referrerCohort: 'BSCS ’21',
    referrerRole: 'Senior Quant Developer',
    referrerAvatar: '/images/avatars/hassan.jpg',
    description:
      'Dedicated rotational fellowship for recent Sukkur IBA graduates. Build real-time FX pricing microservices, automated reconciliation pipelines, and low-latency risk dashboards.',
    requirements:
      'BS in Computer Science, Software Engineering, or Mathematics (Class of 2024–2026) with strong algorithmic fundamentals in C++, Python, or TypeScript.',
    benefits:
      'Direct 1-on-1 alumni mentorship, CFA / FRM exam sponsorship, relocation stipend, and full health coverage from day one.',
    techStack: ['TypeScript', 'Python', 'C++', 'Redis', 'Docker'],
    status: 'ACTIVE',
    postedAt: '2026-04-30T06:30:00.000Z',
    expiresAt: '2026-07-15T23:59:59.000Z',
    applications: 63,
    featuredScore: 91,
    externalApplyUrl: 'https://techcorp.example.com/careers/grad-quant-fellow',
  },
  {
    id: '7',
    title: 'Senior ML Platform & LLM Evaluation Engineer',
    company: 'AI Innovations',
    companyLogoUrl: '/images/logos/ai-innovations.jpg',
    companyWebsite: 'https://ai-innovations.example.com',
    sector: 'AI_CLOUD',
    sectorLabel: 'AI & Cloud Infrastructure',
    experienceLevel: 'MID_SENIOR',
    experienceLabel: 'Mid–Senior (3–6 yrs)',
    workplaceMode: 'REMOTE',
    workplaceLabel: 'Remote (Global)',
    employmentType: 'FULL_TIME',
    employmentLabel: 'Full-Time',
    location: 'Remote · San Francisco / Islamabad',
    isRemote: true,
    salaryMin: 125000,
    salaryMax: 160000,
    salaryCurrency: 'USD',
    compensationDisplay: '$125k – $160k · Equity',
    referralTurnaroundHours: 16,
    referrerName: 'Zainab Khuhro',
    referrerCohort: 'BSCS ’17',
    referrerRole: 'Staff Applied AI Scientist',
    referrerAvatar: '/images/avatars/zainab.jpg',
    description:
      'Build automated red-teaming harnesses, retrieval-augmented generation (RAG) benchmarks, and telemetry pipelines for enterprise multi-agent workflows.',
    requirements:
      '3+ years shipping Python and TypeScript ML tooling. Hands-on experience with evaluation datasets, vector databases, and distributed tracing.',
    benefits:
      'Remote-first culture, generous compute credits for personal research, annual wellness stipend, and equity refreshers.',
    techStack: ['Python', 'TypeScript', 'OpenTelemetry', 'Qdrant', 'Ray'],
    status: 'ACTIVE',
    postedAt: '2026-04-29T18:20:00.000Z',
    expiresAt: '2026-07-01T23:59:59.000Z',
    applications: 38,
    featuredScore: 96,
    externalApplyUrl: 'https://ai-innovations.example.com/careers/ml-eval',
  },
  {
    id: '8',
    title: 'Enterprise Data Platform & Governance Lead',
    company: 'DataInsights',
    companyLogoUrl: '/images/logos/datainsights.jpg',
    companyWebsite: 'https://datainsights.example.com',
    sector: 'ENTERPRISE',
    sectorLabel: 'Enterprise & Cybersecurity',
    experienceLevel: 'STAFF_PRINCIPAL',
    experienceLabel: 'Staff & Principal (8+ yrs)',
    workplaceMode: 'HYBRID',
    workplaceLabel: 'Hybrid · Lahore & London',
    employmentType: 'CONTRACT',
    employmentLabel: 'Contract / Advisory',
    location: 'Lahore, Pakistan',
    isRemote: false,
    salaryMin: 115000,
    salaryMax: 150000,
    salaryCurrency: 'USD',
    compensationDisplay: '$115k – $150k · Retainer',
    referralTurnaroundHours: 24,
    referrerName: 'Farhan Ali Bhutto',
    referrerCohort: 'MBA ’15',
    referrerRole: 'Partner, Enterprise Data Advisory',
    referrerAvatar: '/images/avatars/farhan.jpg',
    description:
      'Lead data mesh modernization, PII lineage cataloging, and automated compliance auditing for multinational telecom and banking clients.',
    requirements:
      '7+ years in enterprise data architecture, lakehouse governance (Unity Catalog / Iceberg), and stakeholder delivery.',
    benefits:
      'Flexible contract structure, direct partner revenue share, and business-class regional travel.',
    techStack: ['Apache Iceberg', 'Databricks', 'Terraform', 'SQL', 'OPA'],
    status: 'ACTIVE',
    postedAt: '2026-04-22T10:00:00.000Z',
    expiresAt: '2026-06-18T23:59:59.000Z',
    applications: 22,
    featuredScore: 88,
    externalApplyUrl: 'https://datainsights.example.com/careers/data-governance',
  },
  {
    id: '9',
    title: 'Associate Product Designer — Alumni Venture Studio',
    company: 'Creative Studio',
    companyLogoUrl: '/images/logos/creative-studio.jpg',
    companyWebsite: 'https://creativestudio.example.com',
    sector: 'PRODUCT_DESIGN',
    sectorLabel: 'Product & Experience Design',
    experienceLevel: 'ENTRY',
    experienceLabel: 'Entry & Associate (1–2 yrs)',
    workplaceMode: 'HYBRID',
    workplaceLabel: 'Hybrid · Karachi Studio',
    employmentType: 'FULL_TIME',
    employmentLabel: 'Full-Time',
    location: 'Karachi, Pakistan',
    isRemote: false,
    salaryMin: 42000,
    salaryMax: 60000,
    salaryCurrency: 'USD',
    compensationDisplay: '$42k – $60k · Studio Equity',
    referralTurnaroundHours: 14,
    referrerName: 'Nadia Talpur',
    referrerCohort: 'BSCS ’18',
    referrerRole: 'Head of Design Engineering',
    referrerAvatar: '/images/avatars/nadia.jpg',
    description:
      'Partner directly with Sukkur IBA alumni founders to prototype 0-to-1 B2B SaaS workflows, conduct user research, and craft interactive Framer Motion prototypes.',
    requirements:
      '1+ year or strong portfolio demonstrating end-to-end product thinking, interactive prototyping in Figma/React, and crisp visual hierarchy.',
    benefits:
      'Direct mentorship from senior design directors, Apple Studio Display setup, and equity pool participation across studio spinouts.',
    techStack: ['Figma', 'Prototyping', 'Design Systems', 'React', 'User Research'],
    status: 'ACTIVE',
    postedAt: '2026-04-28T15:45:00.000Z',
    expiresAt: '2026-07-10T23:59:59.000Z',
    applications: 52,
    featuredScore: 89,
    externalApplyUrl: 'https://creativestudio.example.com/careers/associate-pd',
  },
]

export function filterAndSortJobs(
  jobs: AlumniJobListing[],
  filters: JobBoardFilterState
): AlumniJobListing[] {
  const query = filters.search.trim().toLowerCase()

  const filtered = jobs.filter((job) => {
    if (filters.sector !== 'ALL' && job.sector !== filters.sector) {
      return false
    }
    if (
      filters.experienceLevel !== 'ALL' &&
      job.experienceLevel !== filters.experienceLevel
    ) {
      return false
    }
    if (
      filters.workplaceMode !== 'ALL' &&
      job.workplaceMode !== filters.workplaceMode
    ) {
      return false
    }
    if (
      filters.employmentType !== 'ALL' &&
      job.employmentType !== filters.employmentType
    ) {
      return false
    }
    if (query.length > 0) {
      const haystack = [
        job.title,
        job.company,
        job.location,
        job.sectorLabel,
        job.experienceLabel,
        job.workplaceLabel,
        job.referrerName,
        job.referrerCohort,
        ...job.techStack,
      ]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(query)) {
        return false
      }
    }
    return true
  })

  return [...filtered].sort((a, b) => {
    switch (filters.sortBy) {
      case 'SALARY_DESC':
        return b.salaryMax - a.salaryMax
      case 'FASTEST_REFERRAL':
        return a.referralTurnaroundHours - b.referralTurnaroundHours
      case 'NEWEST':
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
      case 'RECOMMENDED':
      default:
        return b.featuredScore - a.featuredScore
    }
  })
}

interface JobBoardFilterProps {
  filters: JobBoardFilterState
  onChange: (next: JobBoardFilterState) => void
  totalCount: number
  filteredCount: number
  sectorCounts: Record<JobSector, number>
  workplaceCounts: Record<WorkplaceMode, number>
}

const springIndicator = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 30,
}

export function JobBoardFilter({
  filters,
  onChange,
  totalCount,
  filteredCount,
  sectorCounts,
  workplaceCounts,
}: JobBoardFilterProps) {
  const activeFilterCount =
    (filters.sector !== 'ALL' ? 1 : 0) +
    (filters.experienceLevel !== 'ALL' ? 1 : 0) +
    (filters.workplaceMode !== 'ALL' ? 1 : 0) +
    (filters.employmentType !== 'ALL' ? 1 : 0) +
    (filters.search.trim().length > 0 ? 1 : 0)

  const handleReset = () => {
    onChange({
      ...filters,
      search: '',
      sector: 'ALL',
      experienceLevel: 'ALL',
      workplaceMode: 'ALL',
      employmentType: 'ALL',
      sortBy: 'RECOMMENDED',
    })
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Job board multi-facet filters"
      className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-card space-y-5"
    >
      {/* Top Row: Search Input, Sort Order, Employment Type & View Mode */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 pb-4 border-b border-border/80">
        <div className="relative flex-1 min-w-0">
          <Search className="h-4 w-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type="text"
            value={filters.search}
            onChange={(e) =>
              onChange({ ...filters, search: e.target.value })
            }
            placeholder="Search by role title, partner company, stack (Go, PyTorch, React), city, or alumni referrer..."
            aria-label="Search alumni-referred jobs"
            className="pl-10 pr-9 h-11 bg-background/70"
          />
          {filters.search.length > 0 && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, search: '' })}
              aria-label="Clear search query"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
          <div className="w-full sm:w-52">
            <SelectField
              aria-label="Sort job listings"
              value={filters.sortBy}
              onChange={(e) =>
                onChange({
                  ...filters,
                  sortBy: e.target.value as JobSortOrder,
                })
              }
              className="h-11 bg-background/70"
            >
              <option value="RECOMMENDED">Sort: Featured Referrals</option>
              <option value="SALARY_DESC">Sort: Compensation (High–Low)</option>
              <option value="FASTEST_REFERRAL">
                Sort: Fastest Referral SLA
              </option>
              <option value="NEWEST">Sort: Newest Posted</option>
            </SelectField>
          </div>

          <div className="w-full sm:w-44">
            <SelectField
              aria-label="Filter by employment type"
              value={filters.employmentType}
              onChange={(e) =>
                onChange({
                  ...filters,
                  employmentType: e.target.value as 'ALL' | EmploymentType,
                })
              }
              className="h-11 bg-background/70"
            >
              <option value="ALL">All Commitments</option>
              <option value="FULL_TIME">Full-Time Roles</option>
              <option value="CONTRACT">Contract / Advisory</option>
            </SelectField>
          </div>

          {/* Animated Grid / List View Switcher */}
          <div
            role="group"
            aria-label="Layout view mode"
            className="hidden sm:inline-flex items-center p-1 rounded-xl bg-stone border border-border/70 h-11 shrink-0"
          >
            {(
              [
                { id: 'grid', label: 'Grid', icon: LayoutGrid },
                { id: 'list', label: 'List', icon: List },
              ] as const
            ).map((mode) => {
              const Icon = mode.icon
              const isActive = filters.viewMode === mode.id
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => onChange({ ...filters, viewMode: mode.id })}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'text-foreground'
                      : 'text-secondary hover:text-foreground'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="job-board-view-mode-pill"
                      transition={springIndicator}
                      className="absolute inset-0 rounded-lg bg-card shadow-sm border border-border/60"
                    />
                  )}
                  <Icon className="relative z-10 h-3.5 w-3.5" />
                  <span className="relative z-10">{mode.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Middle Row: Sector Interactive Segmented Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono uppercase tracking-wider text-secondary flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-primary" />
            Industry Sector
          </span>
          <span className="text-secondary font-mono tabular-nums">
            {JOB_SECTORS.find((s) => s.id === filters.sector)?.label}
          </span>
        </div>

        <div
          role="group"
          aria-label="Filter by industry sector"
          className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-stone/90 border border-border/60"
        >
          {JOB_SECTORS.map((sector) => {
            const isActive = filters.sector === sector.id
            const count = sectorCounts[sector.id] ?? 0
            return (
              <motion.button
                key={sector.id}
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onChange({ ...filters, sector: sector.id })}
                className={`relative px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'text-foreground font-semibold'
                    : 'text-secondary hover:text-foreground'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="job-sector-active-indicator"
                    transition={springIndicator}
                    className="absolute inset-0 rounded-lg bg-card shadow-sm border border-primary/25"
                  />
                )}
                <span className="relative z-10">{sector.label}</span>
                <span
                  className={`relative z-10 font-mono text-[11px] tabular-nums ${
                    isActive ? 'text-primary font-bold' : 'text-secondary/75'
                  }`}
                >
                  {count}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Bottom Split Row: Experience Level & Workplace Mode (Remote / Hybrid / On-Site) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">
        {/* Experience Level Filter (7 cols) */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono uppercase tracking-wider text-secondary flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-primary" />
              Experience Level
            </span>
            <span className="text-secondary font-mono tabular-nums">
              {
                EXPERIENCE_LEVELS.find(
                  (l) => l.id === filters.experienceLevel
                )?.yearsHint
              }
            </span>
          </div>

          <div
            role="group"
            aria-label="Filter by experience level"
            className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-stone/90 border border-border/60"
          >
            {EXPERIENCE_LEVELS.map((level) => {
              const isActive = filters.experienceLevel === level.id
              return (
                <motion.button
                  key={level.id}
                  type="button"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() =>
                    onChange({ ...filters, experienceLevel: level.id })
                  }
                  className={`relative flex-1 min-w-[110px] px-3 py-2 rounded-lg text-xs font-medium transition-colors text-center whitespace-nowrap ${
                    isActive
                      ? 'text-foreground font-semibold'
                      : 'text-secondary hover:text-foreground'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="job-level-active-indicator"
                      transition={springIndicator}
                      className="absolute inset-0 rounded-lg bg-card shadow-sm border border-primary/25"
                    />
                  )}
                  <span className="relative z-10 block">{level.label}</span>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Workplace Arrangement Filter: All / Remote / Hybrid / On-Site (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono uppercase tracking-wider text-secondary flex items-center gap-1.5">
              <Globe2 className="h-3.5 w-3.5 text-primary" />
              Workplace Mode
            </span>
            <span className="text-secondary font-mono tabular-nums">
              {
                WORKPLACE_MODES.find((w) => w.id === filters.workplaceMode)
                  ?.subtitle
              }
            </span>
          </div>

          <div
            role="group"
            aria-label="Filter by remote, hybrid, or on-site workplace"
            className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 rounded-xl bg-stone/90 border border-border/60"
          >
            {WORKPLACE_MODES.map((mode) => {
              const isActive = filters.workplaceMode === mode.id
              const count = workplaceCounts[mode.id] ?? 0
              const ModeIcon =
                mode.id === 'REMOTE'
                  ? Laptop
                  : mode.id === 'ON_SITE'
                  ? Building2
                  : Globe2
              return (
                <motion.button
                  key={mode.id}
                  type="button"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() =>
                    onChange({ ...filters, workplaceMode: mode.id })
                  }
                  className={`relative px-2.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'text-foreground font-semibold'
                      : 'text-secondary hover:text-foreground'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="job-workplace-active-indicator"
                      transition={springIndicator}
                      className="absolute inset-0 rounded-lg bg-card shadow-sm border border-primary/25"
                    />
                  )}
                  {mode.id !== 'ALL' && (
                    <ModeIcon className="relative z-10 h-3.5 w-3.5 text-primary shrink-0" />
                  )}
                  <span className="relative z-10">{mode.label}</span>
                  <span
                    className={`relative z-10 font-mono text-[11px] tabular-nums ${
                      isActive ? 'text-primary font-bold' : 'text-secondary/75'
                    }`}
                  >
                    {count}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer Status & Animated Reset Bar */}
      <div className="pt-3 border-t border-border/70 flex flex-wrap items-center justify-between gap-3 text-xs text-secondary">
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
          <span>
            Showing{' '}
            <strong className="font-mono font-semibold text-foreground tabular-nums">
              {filteredCount}
            </strong>{' '}
            of{' '}
            <span className="font-mono tabular-nums">{totalCount}</span>{' '}
            verified alumni-referred roles
          </span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1 text-secondary/85">
            <ArrowUpDown className="h-3 w-3 text-primary" />
            Live spring reordering active
          </span>
        </div>

        <AnimatePresence mode="popLayout">
          {activeFilterCount > 0 && (
            <motion.button
              key="reset-filters-btn"
              type="button"
              initial={{ opacity: 0, scale: 0.92, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 4 }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset active filters ({activeFilterCount})
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}
