import { RoleShell } from '@/components/layout/role-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ProfileCompletionCard,
  type ProfileChecklistItem,
} from '@/components/ui/profile-completion-card'
import { getActivePersona, setActivePersona } from '@/lib/role-context'
import { toast } from '@/lib/toast'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Camera,
  CheckCircle2,
  Code2,
  Edit3,
  ExternalLink,
  FileText,
  Globe2,
  GraduationCap,
  Image as ImageIcon,
  Mail,
  MapPin,
  Palette,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react'
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type ProfileViewMode = 'STUDENT' | 'ALUMNI'

export type CoverThemeId =
  | 'emerald-gold'
  | 'sapphire-indigo'
  | 'violet-aurora'
  | 'amber-terracotta'
  | 'rose-crimson'

export const COVER_THEMES: Record<
  CoverThemeId,
  {
    id: CoverThemeId
    label: string
    gradient: string
    accentBadge: string
    swatchClass: string
  }
> = {
  'emerald-gold': {
    id: 'emerald-gold',
    label: 'Emerald & Gold',
    gradient:
      'from-[#071A17] via-[#0B3B32] to-[#0D6E5B]',
    accentBadge: 'border-emerald-300/35 bg-emerald-950/60 text-emerald-100',
    swatchClass: 'bg-gradient-to-r from-[#0B3B32] to-[#D97706]',
  },
  'sapphire-indigo': {
    id: 'sapphire-indigo',
    label: 'Sapphire & Indigo',
    gradient:
      'from-[#09152B] via-[#1E3A8A] to-[#2563EB]',
    accentBadge: 'border-blue-300/35 bg-blue-950/60 text-blue-100',
    swatchClass: 'bg-gradient-to-r from-[#1E3A8A] to-[#38BDF8]',
  },
  'violet-aurora': {
    id: 'violet-aurora',
    label: 'Violet & Teal Aurora',
    gradient:
      'from-[#1A103C] via-[#4C1D95] to-[#0D9488]',
    accentBadge: 'border-purple-300/35 bg-purple-950/60 text-purple-100',
    swatchClass: 'bg-gradient-to-r from-[#4C1D95] to-[#0D9488]',
  },
  'amber-terracotta': {
    id: 'amber-terracotta',
    label: 'Amber & Terracotta',
    gradient:
      'from-[#271306] via-[#78350F] to-[#D97706]',
    accentBadge: 'border-amber-300/35 bg-amber-950/60 text-amber-100',
    swatchClass: 'bg-gradient-to-r from-[#78350F] to-[#F59E0B]',
  },
  'rose-crimson': {
    id: 'rose-crimson',
    label: 'Crimson & Rose',
    gradient:
      'from-[#280916] via-[#881337] to-[#E11D48]',
    accentBadge: 'border-rose-300/35 bg-rose-950/60 text-rose-100',
    swatchClass: 'bg-gradient-to-r from-[#881337] to-[#FB7185]',
  },
}

export const PRESET_AVATARS = [
  {
    label: 'Scholar Portrait 1',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=480&q=80',
  },
  {
    label: 'Executive Portrait 2',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=480&q=80',
  },
  {
    label: 'Graduate Portrait 3',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=480&q=80',
  },
  {
    label: 'Founder Portrait 4',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=480&q=80',
  },
  {
    label: 'Researcher Portrait 5',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=480&q=80',
  },
  {
    label: 'Campus Portrait 6',
    url: '/images/avatar.jpg',
  },
]

export const PRESET_COVER_IMAGES = [
  { label: 'Pure Color Theme Gradient', url: '' },
  { label: 'Sukkur IBA Campus Architecture', url: '/images/campus.jpg' },
  { label: 'Annual Alumni Gathering', url: '/images/alumni-gathering.jpg' },
  { label: 'Executive Symposium Hall', url: '/images/seminar.jpg' },
]

export interface EditableProfileRecord {
  name: string
  initials: string
  avatar: string
  coverImageUrl: string
  coverTheme: CoverThemeId
  badge: string
  cohortLabel: string
  department: string
  degree: string
  graduationYear: number
  gpaOrHonors: string
  headline: string
  bio: string
  location: string
  email: string
  portfolioUrl: string
  linkedinUrl: string
  githubUrl: string
  capstoneOrFocusTitle: string
  capstoneOrFocusSummary: string
  skills: string[]
  careerInterests: string[]
  isPublic: boolean
  openToReferralsOrMentoring: boolean
  experiences: Array<{
    id: string
    role: string
    organization: string
    period: string
    location: string
    type: string
    summary: string
  }>
  achievements: string[]
}

const STUDENT_PROFILE_STORAGE_KEY = 'siba_student_profile_record_v2'
const ALUMNI_PROFILE_STORAGE_KEY = 'siba_alumni_profile_record_v2'

const INITIAL_STUDENT_PROFILE: EditableProfileRecord = {
  name: 'Zainab Magsi',
  initials: 'ZM',
  avatar:
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=480&q=80',
  coverImageUrl: '/images/campus.jpg',
  coverTheme: 'emerald-gold',
  badge: 'Final-Year Merit Scholar · Class of 2026',
  cohortLabel: 'BS Computer Science · Cohort ’26',
  department: 'Department of Computer Science',
  degree: 'BS Computer Science',
  graduationYear: 2026,
  gpaOrHonors: '3.76 / 4.00 CGPA (Dean’s Honor Roll)',
  headline:
    'Final-Year BSCS Scholar at Sukkur IBA University · Full-Stack TypeScript & FinTech Analytics',
  bio: 'Final-year undergraduate scholar at Sukkur IBA University specializing in distributed web systems, financial technology infrastructure, and applied machine learning. Currently leading a senior capstone on real-time merchant QR settlement analytics and seeking 2026 graduate software engineering or product fellowship roles.',
  location: 'Sukkur / Karachi, Pakistan',
  email: 'zainab.magsi.bscs22@iba-suk.edu.pk',
  portfolioUrl: 'https://iba-suk.edu.pk/portfolios/zainab-magsi',
  linkedinUrl: 'https://linkedin.com/in/zainab-magsi-siba',
  githubUrl: 'https://github.com/zainab-magsi',
  capstoneOrFocusTitle:
    'Senior Capstone: Real-Time Merchant QR Settlement & Fraud Scoring Engine',
  capstoneOrFocusSummary:
    'Designed an event-driven payment telemetry pipeline processing 5,000+ simulated merchant transactions per second using TypeScript, Node.js, PostgreSQL, and Redis streams, supervised by Sukkur IBA faculty and Careem alumni mentors.',
  skills: [
    'TypeScript',
    'React',
    'Node.js',
    'PostgreSQL',
    'Python',
    'SQL & Product Analytics',
    'System Design',
    'Figma',
  ],
  careerInterests: [
    'Graduate Software Engineering',
    'FinTech Payment Systems',
    'Product Strategy Fellowships',
    'Applied AI Infrastructure',
  ],
  isPublic: true,
  openToReferralsOrMentoring: true,
  experiences: [
    {
      id: 'stu-exp-1',
      role: 'Undergraduate Software Engineering Intern',
      organization: 'Systems Limited · Karachi Chapter Partner',
      period: 'Jun 2025 – Aug 2025',
      location: 'Karachi / Hybrid',
      type: 'Summer Internship',
      summary:
        'Built reusable React and TypeScript analytics modules for enterprise digital banking dashboards, reducing report rendering latency by 34%.',
    },
    {
      id: 'stu-exp-2',
      role: 'Teaching Assistant — Data Structures & Algorithms',
      organization: 'Sukkur IBA University · Dept. of Computer Science',
      period: 'Sep 2024 – Present',
      location: 'Sukkur Main Campus',
      type: 'Academic Leadership',
      summary:
        'Conduct weekly problem-solving labs and code reviews for 65+ sophomore computer science students.',
    },
  ],
  achievements: [
    'Dean’s Honor List (6 consecutive semesters at Sukkur IBA University)',
    '1st Runner-Up — All-Pakistan Inter-University FinTech Hackathon 2025',
    'Merit Talent Scholarship Recipient — Sindh Higher Education Endowment',
  ],
}

const INITIAL_ALUMNI_PROFILE: EditableProfileRecord = {
  name: 'Ahmed Hassan',
  initials: 'AH',
  avatar:
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=480&q=80',
  coverImageUrl: '/images/alumni-gathering.jpg',
  coverTheme: 'sapphire-indigo',
  badge: 'Verified Alumni · Class of 2020',
  cohortLabel: 'BS Computer Science · Cohort ’20',
  department: 'Department of Computer Science',
  degree: 'BS Computer Science',
  graduationYear: 2020,
  gpaOrHonors: '3.82 / 4.00 CGPA (Cum Laude)',
  headline:
    'Senior Software Engineer at TechCorp · Distributed Systems & Alumni Mentor',
  bio: 'Sukkur IBA University Class of 2020 Computer Science graduate with 5+ years of experience architecting high-throughput distributed services, cloud-native microservices, and payment ledgers across MENA and South Asia. Passionate about mentoring graduating Sukkur IBA scholars and providing direct engineering referrals.',
  location: 'Karachi, Pakistan & Dubai, UAE',
  email: 'ahmed.hassan@iba-suk.edu.pk',
  portfolioUrl: 'https://ahmedhassan.tech',
  linkedinUrl: 'https://linkedin.com/in/ahmedhassan',
  githubUrl: 'https://github.com/ahmedhassan',
  capstoneOrFocusTitle:
    'Alumni Mentorship & Direct Referral Track: Distributed Backend & Cloud Engineering',
  capstoneOrFocusSummary:
    'Conducts bi-weekly system design mock interviews, resume calibration reviews, and direct engineering referrals for final-year Sukkur IBA computer science and software engineering students.',
  skills: [
    'Distributed Systems',
    'Go',
    'TypeScript',
    'Kubernetes',
    'PostgreSQL',
    'Cloud Architecture',
    'Microservices',
    'Technical Mentorship',
  ],
  careerInterests: [
    'Staff Engineering Track',
    'Campus Capstone Advisory',
    'Alumni Angel Syndicate',
    'Open-Source Infrastructure',
  ],
  isPublic: true,
  openToReferralsOrMentoring: true,
  experiences: [
    {
      id: 'alum-exp-1',
      role: 'Senior Software Engineer — Core Platform',
      organization: 'TechCorp Global',
      period: '2022 – Present',
      location: 'Karachi / Dubai Hybrid',
      type: 'Full-Time',
      summary:
        'Lead engineer for multi-region API gateway and merchant settlement microservices handling 12M+ daily requests with 99.98% uptime.',
    },
    {
      id: 'alum-exp-2',
      role: 'Software Engineer',
      organization: 'FinVantage Digital',
      period: '2020 – 2022',
      location: 'Karachi, Pakistan',
      type: 'Full-Time',
      summary:
        'Developed core wallet onboarding and KYC verification pipelines after graduating from Sukkur IBA University.',
    },
  ],
  achievements: [
    'Mentored 14 Sukkur IBA graduating scholars into full-time software engineering roles',
    'Keynote Speaker — Sukkur IBA Annual Computing & Career Symposium 2025',
    'TechCorp Engineering Excellence Award (Q4 2024)',
  ],
}

function loadStoredProfile(
  key: string,
  fallback: EditableProfileRecord,
): EditableProfileRecord {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<EditableProfileRecord>
    return {
      ...fallback,
      ...parsed,
      // Ensure non-existent legacy avatar paths are replaced with working ones
      avatar:
        parsed.avatar && !parsed.avatar.startsWith('/images/avatars/')
          ? parsed.avatar
          : fallback.avatar,
    }
  } catch {
    return fallback
  }
}

function saveStoredProfile(key: string, record: EditableProfileRecord): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(record))
  } catch {
    // Ignore storage quota errors
  }
}

export function ProfilePage() {
  const navigate = useNavigate()
  const activePersona = getActivePersona()

  const avatarFileInputRef = useRef<HTMLInputElement | null>(null)
  const coverFileInputRef = useRef<HTMLInputElement | null>(null)

  const [viewMode, setViewMode] = useState<ProfileViewMode>(
    activePersona === 'STUDENT' ? 'STUDENT' : 'ALUMNI',
  )
  const [studentProfile, setStudentProfile] = useState<EditableProfileRecord>(
    () => loadStoredProfile(STUDENT_PROFILE_STORAGE_KEY, INITIAL_STUDENT_PROFILE),
  )
  const [alumniProfile, setAlumniProfile] = useState<EditableProfileRecord>(
    () => loadStoredProfile(ALUMNI_PROFILE_STORAGE_KEY, INITIAL_ALUMNI_PROFILE),
  )

  const [studentChecklist, setStudentChecklist] = useState<
    ProfileChecklistItem[]
  >([
    {
      id: 'chk-academic',
      label: 'Verify Sukkur IBA transcript & CGPA record',
      description: 'Academic Credential · Verified with Registrar',
      weight: 25,
      completed: true,
      actionHref: '/profile',
      actionLabel: 'Verified',
    },
    {
      id: 'chk-skills',
      label: 'Add 5+ technical skills & capstone summary',
      description: 'Competency Matrix · Used for skill-match scoring',
      weight: 25,
      completed: true,
      actionHref: '/profile',
      actionLabel: 'Edit Skills',
    },
    {
      id: 'chk-cv',
      label: 'Link portfolio & downloadable CV packet',
      description: 'Career Dossier · Visible to alumni referrers',
      weight: 25,
      completed: true,
      actionHref: '/profile',
      actionLabel: 'Update Link',
    },
    {
      id: 'chk-mentor-goal',
      label: 'Specify 2026 mentorship & internship goals',
      description: 'Mentorship Readiness · Boosts mentor response rate',
      weight: 25,
      completed: false,
      actionHref: '/mentorship',
      actionLabel: 'Set Goal',
    },
  ])

  const [isEditing, setIsEditing] = useState(false)
  const [editorTab, setEditorTab] = useState<
    'IDENTITY' | 'MEDIA' | 'EXPERIENCE'
  >('IDENTITY')
  const [newSkillInput, setNewSkillInput] = useState('')
  const [newInterestInput, setNewInterestInput] = useState('')
  const [newAchievementInput, setNewAchievementInput] = useState('')

  // New experience form draft
  const [newExpRole, setNewExpRole] = useState('')
  const [newExpOrg, setNewExpOrg] = useState('')
  const [newExpPeriod, setNewExpPeriod] = useState('')
  const [newExpLocation, setNewExpLocation] = useState('Karachi / Hybrid')
  const [newExpType, setNewExpType] = useState('Full-Time')
  const [newExpSummary, setNewExpSummary] = useState('')

  const currentProfile =
    viewMode === 'STUDENT' ? studentProfile : alumniProfile

  const updateCurrentProfile = (
    updater: (prev: EditableProfileRecord) => EditableProfileRecord,
  ) => {
    if (viewMode === 'STUDENT') {
      setStudentProfile((prev) => {
        const next = updater(prev)
        saveStoredProfile(STUDENT_PROFILE_STORAGE_KEY, next)
        return next
      })
    } else {
      setAlumniProfile((prev) => {
        const next = updater(prev)
        saveStoredProfile(ALUMNI_PROFILE_STORAGE_KEY, next)
        return next
      })
    }
  }

  const completionPercentage = studentChecklist.reduce(
    (sum, item) => sum + (item.completed ? item.weight : 0),
    0,
  )

  const handleToggleChecklistItem = (id: string) => {
    setStudentChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    )
    toast.success('Profile readiness milestone updated.')
  }

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault()
    if (viewMode === 'STUDENT') {
      saveStoredProfile(STUDENT_PROFILE_STORAGE_KEY, studentProfile)
    } else {
      saveStoredProfile(ALUMNI_PROFILE_STORAGE_KEY, alumniProfile)
    }
    setIsEditing(false)
    toast.success(
      `${currentProfile.name}’s ${
        viewMode === 'STUDENT' ? 'Student Scholar' : 'Alumni Member'
      } profile saved!`,
    )
  }

  const handleAvatarFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateCurrentProfile((prev) => ({
          ...prev,
          avatar: reader.result as string,
        }))
        toast.success('Profile photo updated from uploaded image.')
      }
    }
    reader.readAsDataURL(file)
  }

  const handleCoverFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateCurrentProfile((prev) => ({
          ...prev,
          coverImageUrl: reader.result as string,
        }))
        toast.success('Cover background banner updated from uploaded image.')
      }
    }
    reader.readAsDataURL(file)
  }

  const handleResetProfile = () => {
    if (viewMode === 'STUDENT') {
      setStudentProfile(INITIAL_STUDENT_PROFILE)
      saveStoredProfile(STUDENT_PROFILE_STORAGE_KEY, INITIAL_STUDENT_PROFILE)
    } else {
      setAlumniProfile(INITIAL_ALUMNI_PROFILE)
      saveStoredProfile(ALUMNI_PROFILE_STORAGE_KEY, INITIAL_ALUMNI_PROFILE)
    }
    toast.success('Restored default profile fields and imagery.')
  }

  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim()
    if (!trimmed) return
    if (currentProfile.skills.includes(trimmed)) {
      toast.error('Skill is already listed on your profile.')
      return
    }
    updateCurrentProfile((prev) => ({
      ...prev,
      skills: [...prev.skills, trimmed],
    }))
    setNewSkillInput('')
    toast.success(`Added "${trimmed}" to verified skills.`)
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    updateCurrentProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }))
  }

  const handleAddInterest = () => {
    const trimmed = newInterestInput.trim()
    if (!trimmed) return
    updateCurrentProfile((prev) => ({
      ...prev,
      careerInterests: [...prev.careerInterests, trimmed],
    }))
    setNewInterestInput('')
    toast.success(`Added "${trimmed}".`)
  }

  const handleRemoveInterest = (interestToRemove: string) => {
    updateCurrentProfile((prev) => ({
      ...prev,
      careerInterests: prev.careerInterests.filter(
        (i) => i !== interestToRemove,
      ),
    }))
  }

  const handleAddAchievement = () => {
    const trimmed = newAchievementInput.trim()
    if (!trimmed) return
    updateCurrentProfile((prev) => ({
      ...prev,
      achievements: [...prev.achievements, trimmed],
    }))
    setNewAchievementInput('')
    toast.success('Added new honor / achievement.')
  }

  const handleRemoveAchievement = (achToRemove: string) => {
    updateCurrentProfile((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((a) => a !== achToRemove),
    }))
  }

  const handleAddExperience = () => {
    if (!newExpRole.trim() || !newExpOrg.trim()) {
      toast.error('Please enter both role title and organization.')
      return
    }
    const created = {
      id: `exp-${Date.now()}`,
      role: newExpRole.trim(),
      organization: newExpOrg.trim(),
      period: newExpPeriod.trim() || '2025 – Present',
      location: newExpLocation.trim() || 'Karachi, Pakistan',
      type: newExpType.trim() || 'Full-Time',
      summary:
        newExpSummary.trim() ||
        'Contributed to core engineering and product initiatives.',
    }
    updateCurrentProfile((prev) => ({
      ...prev,
      experiences: [created, ...prev.experiences],
    }))
    setNewExpRole('')
    setNewExpOrg('')
    setNewExpPeriod('')
    setNewExpSummary('')
    toast.success(`Added "${created.role}" at ${created.organization}.`)
  }

  const handleRemoveExperience = (expId: string) => {
    updateCurrentProfile((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((e) => e.id !== expId),
    }))
    toast.success('Experience entry removed.')
  }

  const handleSwitchProfileMode = (mode: ProfileViewMode) => {
    setViewMode(mode)
    setActivePersona(mode)
  }

  const activeCoverTheme =
    COVER_THEMES[currentProfile.coverTheme] ?? COVER_THEMES['emerald-gold']

  return (
    <RoleShell
      role={viewMode}
      title={
        viewMode === 'STUDENT'
          ? 'Student Scholar Profile & Career Dossier'
          : 'Verified Alumni Executive Profile'
      }
      subtitle={`${currentProfile.degree} · Class of ${currentProfile.graduationYear} · Sukkur IBA University`}
      badge={currentProfile.badge}
      headerActions={
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Interactive Switcher between Student Profile & Alumni Profile */}
          <div
            className="inline-flex items-center rounded-xl border border-border bg-card p-1 shadow-2xs"
            role="tablist"
            aria-label="Switch between Student and Alumni profile views"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'STUDENT'}
              onClick={() => handleSwitchProfileMode('STUDENT')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-mono font-semibold transition-all cursor-pointer ${
                viewMode === 'STUDENT'
                  ? 'bg-primary text-white dark:text-slate-950 shadow-xs'
                  : 'text-secondary hover:text-foreground'
              }`}
            >
              Student Profile
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'ALUMNI'}
              onClick={() => handleSwitchProfileMode('ALUMNI')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-mono font-semibold transition-all cursor-pointer ${
                viewMode === 'ALUMNI'
                  ? 'bg-primary text-white dark:text-slate-950 shadow-xs'
                  : 'text-secondary hover:text-foreground'
              }`}
            >
              Alumni Profile
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditorTab('MEDIA')
              setIsEditing(true)
            }}
          >
            <Camera className="h-3.5 w-3.5 mr-1.5 text-primary" />
            Photo & Cover
          </Button>

          <Button
            size="sm"
            variant={isEditing ? 'outline' : 'default'}
            onClick={() => {
              setEditorTab('IDENTITY')
              setIsEditing((prev) => !prev)
            }}
          >
            {isEditing ? (
              <>
                <X className="h-3.5 w-3.5 mr-1.5" />
                Close Editor
              </>
            ) : (
              <>
                <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                Edit Profile
              </>
            )}
          </Button>
        </div>
      }
    >
      {/* Hidden File Inputs for Direct Device Photo & Cover Uploads */}
      <input
        ref={avatarFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarFileUpload}
        className="hidden"
      />
      <input
        ref={coverFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleCoverFileUpload}
        className="hidden"
      />

      {/* 1. EXECUTIVE HERO IDENTITY CARD */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 24 }}
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
      >
        {/* Top Multi-Color & Image Cover Banner */}
        <div
          className={`relative h-36 sm:h-44 bg-gradient-to-r ${activeCoverTheme.gradient} px-6 sm:px-8 py-4 flex flex-col justify-between overflow-hidden`}
        >
          {/* Optional Custom Background Image with Rich Tint Overlay */}
          {currentProfile.coverImageUrl && (
            <img
              src={currentProfile.coverImageUrl}
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-luminosity"
            />
          )}

          {/* Ambient Decorative Radial Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(255,255,255,0.18),transparent_45%)]"
          />

          {/* Top Row inside Cover Banner */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/35 backdrop-blur-md px-3 py-1 text-xs font-mono font-semibold text-white">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                {viewMode === 'STUDENT'
                  ? 'Verified Sukkur IBA Scholar'
                  : 'Verified Sukkur IBA Graduate'}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/30 backdrop-blur-md px-3 py-1 text-xs font-mono text-white/95">
                <GraduationCap className="h-3.5 w-3.5 text-amber-300" />
                {currentProfile.cohortLabel}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Quick Cover Theme Swatches right on the banner */}
              <div className="hidden md:flex items-center gap-1 rounded-lg border border-white/20 bg-black/35 backdrop-blur-md px-2 py-1">
                {(Object.keys(COVER_THEMES) as CoverThemeId[]).map((tKey) => {
                  const theme = COVER_THEMES[tKey]
                  const active = currentProfile.coverTheme === tKey
                  return (
                    <button
                      key={tKey}
                      type="button"
                      onClick={() =>
                        updateCurrentProfile((prev) => ({
                          ...prev,
                          coverTheme: tKey,
                        }))
                      }
                      title={`Theme: ${theme.label}`}
                      aria-label={`Switch cover theme to ${theme.label}`}
                      className={`h-4 w-4 rounded-full ${theme.swatchClass} transition-transform cursor-pointer ${
                        active
                          ? 'ring-2 ring-white scale-110'
                          : 'opacity-75 hover:opacity-100'
                      }`}
                    />
                  )
                })}
              </div>

              <button
                type="button"
                onClick={() => coverFileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-black/40 backdrop-blur-md px-3 py-1.5 text-xs font-mono font-semibold text-white hover:bg-black/60 transition-colors cursor-pointer"
              >
                <ImageIcon className="h-3.5 w-3.5 text-amber-300" />
                Change Cover
              </button>

              <Link
                to="/alumni/1"
                className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-white/20 bg-black/35 backdrop-blur-md px-3 py-1.5 text-xs font-mono text-white hover:bg-black/55 transition-colors"
              >
                Directory View
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Identity Content & Key Credentials (Cleanly separated below banner so name is NEVER hidden!) */}
        <div className="px-6 sm:px-8 pb-6 sm:pb-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              {/* Avatar overlapping the bottom edge of the cover banner */}
              <div className="relative -mt-14 sm:-mt-16 shrink-0 group">
                <img
                  src={currentProfile.avatar}
                  alt={currentProfile.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = '/images/avatar.jpg'
                  }}
                  className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl object-cover ring-4 ring-card shadow-card-hover bg-stone"
                />
                <button
                  type="button"
                  onClick={() => avatarFileInputRef.current?.click()}
                  title="Upload new profile photo"
                  aria-label="Upload new profile photo"
                  className="absolute inset-0 rounded-2xl bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-[11px] font-mono font-semibold cursor-pointer"
                >
                  <Camera className="h-5 w-5 text-amber-300" />
                  <span>Change Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => avatarFileInputRef.current?.click()}
                  title="Change profile photo"
                  aria-label="Change profile photo"
                  className="absolute -bottom-1.5 -right-1.5 h-8 w-8 rounded-full bg-primary text-white dark:text-slate-950 ring-2 ring-card flex items-center justify-center shadow-sm hover:scale-105 transition-transform cursor-pointer"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              {/* Name, Status & Headline cleanly placed in the light/dark card body below the banner */}
              <div className="space-y-2 pt-3 sm:pt-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                    {currentProfile.name}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/35 bg-accent px-3 py-1 text-xs font-mono font-semibold text-primary">
                    <Sparkles className="h-3.5 w-3.5 text-gold" />
                    {currentProfile.openToReferralsOrMentoring
                      ? viewMode === 'STUDENT'
                        ? 'Open to Internships & Mentorship'
                        : 'Available for Mentorship & Referrals'
                      : 'Private Dossier'}
                  </span>
                </div>

                <p className="font-sans text-base sm:text-[17px] font-medium text-foreground/90 leading-snug max-w-3xl">
                  {currentProfile.headline}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm font-sans text-secondary pt-0.5">
                  <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    {currentProfile.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    {currentProfile.email}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs text-amber-700 dark:text-amber-300 font-semibold">
                    <Award className="h-4 w-4 text-gold shrink-0" />
                    {currentProfile.gpaOrHonors}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
              <Button
                variant="outline"
                onClick={() => {
                  setEditorTab('IDENTITY')
                  setIsEditing(true)
                }}
              >
                <Edit3 className="h-3.5 w-3.5 mr-1.5 text-primary" />
                Customize Dossier
              </Button>
              <Button
                onClick={() =>
                  navigate(viewMode === 'STUDENT' ? '/jobs' : '/mentorship')
                }
              >
                {viewMode === 'STUDENT'
                  ? 'Explore Referral Jobs'
                  : 'Open Mentorship Hub'}
              </Button>
            </div>
          </div>

          {/* 4-Column Multi-Color Credential Partition with Hover Motion */}
          <div className="mt-7 pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="relative overflow-hidden rounded-xl border border-border bg-background p-4 shadow-2xs space-y-1"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-emerald-400" />
              <p className="text-[11px] font-mono uppercase tracking-wider text-primary font-semibold">
                Institution & Faculty
              </p>
              <p className="font-display text-sm font-bold text-foreground">
                Sukkur IBA University
              </p>
              <p className="font-sans text-xs text-secondary">
                {currentProfile.department}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="relative overflow-hidden rounded-xl border border-border bg-background p-4 shadow-2xs space-y-1"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-400" />
              <p className="text-[11px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-300 font-semibold">
                Academic Standing
              </p>
              <p className="font-display text-sm font-bold text-foreground">
                {currentProfile.degree} (’
                {String(currentProfile.graduationYear).slice(-2)})
              </p>
              <p className="font-sans text-xs text-primary font-semibold">
                {currentProfile.gpaOrHonors}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="relative overflow-hidden rounded-xl border border-border bg-background p-4 shadow-2xs space-y-1"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-400" />
              <p className="text-[11px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold">
                Verified Portfolio & Links
              </p>
              <a
                href={currentProfile.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-sm font-bold text-primary hover:underline inline-flex items-center gap-1 truncate max-w-full"
              >
                <Globe2 className="h-3.5 w-3.5 shrink-0" />
                Portfolio & CV Dossier
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
              <p className="font-sans text-xs text-secondary">
                GitHub & LinkedIn verified
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="relative overflow-hidden rounded-xl border border-border bg-background p-4 shadow-2xs space-y-1"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-600 to-pink-500" />
              <p className="text-[11px] font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400 font-semibold">
                Directory Visibility
              </p>
              <p className="font-display text-sm font-bold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                {currentProfile.isPublic
                  ? 'Visible to Verified Network'
                  : 'Connections Only'}
              </p>
              <p className="font-sans text-xs text-secondary">
                Recruiter & mentor indexing active
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* 2. COMPREHENSIVE MULTI-TAB PROFILE & MEDIA EDITOR */}
      <AnimatePresence>
        {isEditing && (
          <motion.section
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border-2 border-primary/45 bg-card p-6 sm:p-7 shadow-card-hover space-y-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider font-bold text-primary flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-gold" />
                  Live Interactive Profile Studio
                </p>
                <h3 className="font-display text-xl font-bold text-foreground">
                  Customize{' '}
                  {viewMode === 'STUDENT'
                    ? 'Student Scholar'
                    : 'Alumni Member'}{' '}
                  Profile, Photo & Background
                </h3>
              </div>

              {/* Editor Section Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-background p-1">
                {(
                  [
                    { id: 'IDENTITY', label: 'Identity & Bio', icon: Edit3 },
                    {
                      id: 'MEDIA',
                      label: 'Photo & Cover Theme',
                      icon: Palette,
                    },
                    {
                      id: 'EXPERIENCE',
                      label: 'Experience & Honors',
                      icon: Briefcase,
                    },
                  ] as const
                ).map((tab) => {
                  const Icon = tab.icon
                  const active = editorTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setEditorTab(tab.id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono font-semibold transition-colors cursor-pointer ${
                        active
                          ? 'bg-primary text-white dark:text-slate-950 shadow-2xs'
                          : 'text-secondary hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {editorTab === 'MEDIA' && (
                <div className="space-y-6">
                  {/* Profile Avatar Customizer */}
                  <div className="rounded-xl border border-border bg-background p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-mono uppercase tracking-wider font-bold text-primary">
                          Profile Portrait Photo
                        </p>
                        <p className="text-xs text-secondary mt-0.5">
                          Upload an image from your device, paste a custom image
                          URL, or choose a curated portrait preset.
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => avatarFileInputRef.current?.click()}
                      >
                        <Upload className="h-3.5 w-3.5 mr-1.5" />
                        Upload Photo from Device
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-3 flex items-center gap-3">
                        <img
                          src={currentProfile.avatar}
                          alt={currentProfile.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.src = '/images/avatar.jpg'
                          }}
                          className="h-20 w-20 rounded-2xl object-cover ring-2 ring-primary/40 shrink-0"
                        />
                        <div className="text-xs text-secondary space-y-1">
                          <p className="font-semibold text-foreground">
                            Live Preview
                          </p>
                          <p>Square 1:1 ratio recommended</p>
                        </div>
                      </div>

                      <div className="md:col-span-9 space-y-3">
                        <div>
                          <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1">
                            Custom Profile Photo URL
                          </label>
                          <Input
                            value={currentProfile.avatar}
                            onChange={(e) =>
                              updateCurrentProfile((prev) => ({
                                ...prev,
                                avatar: e.target.value,
                              }))
                            }
                            placeholder="https://images.unsplash.com/..."
                          />
                        </div>

                        <div>
                          <p className="text-[11px] font-mono uppercase tracking-wider text-secondary mb-2">
                            Or Pick a Verified Portrait Preset:
                          </p>
                          <div className="flex flex-wrap items-center gap-2.5">
                            {PRESET_AVATARS.map((preset) => {
                              const isSelected =
                                currentProfile.avatar === preset.url
                              return (
                                <button
                                  key={preset.label}
                                  type="button"
                                  onClick={() =>
                                    updateCurrentProfile((prev) => ({
                                      ...prev,
                                      avatar: preset.url,
                                    }))
                                  }
                                  className={`group relative rounded-xl p-0.5 transition-transform cursor-pointer ${
                                    isSelected
                                      ? 'ring-2 ring-primary scale-105'
                                      : 'opacity-80 hover:opacity-100'
                                  }`}
                                  title={preset.label}
                                >
                                  <img
                                    src={preset.url}
                                    alt={preset.label}
                                    referrerPolicy="no-referrer"
                                    className="h-12 w-12 rounded-lg object-cover"
                                  />
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cover Banner Theme & Background Image Customizer */}
                  <div className="rounded-xl border border-border bg-background p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-mono uppercase tracking-wider font-bold text-primary">
                          Cover Background Banner & Color Theme
                        </p>
                        <p className="text-xs text-secondary mt-0.5">
                          Select a multi-color gradient palette and optional
                          background photography for your profile header.
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => coverFileInputRef.current?.click()}
                      >
                        <Upload className="h-3.5 w-3.5 mr-1.5" />
                        Upload Cover Background
                      </Button>
                    </div>

                    {/* Color Palette Selector */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {(Object.keys(COVER_THEMES) as CoverThemeId[]).map(
                        (themeKey) => {
                          const theme = COVER_THEMES[themeKey]
                          const isSelected =
                            currentProfile.coverTheme === themeKey
                          return (
                            <button
                              key={themeKey}
                              type="button"
                              onClick={() =>
                                updateCurrentProfile((prev) => ({
                                  ...prev,
                                  coverTheme: themeKey,
                                }))
                              }
                              className={`rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-primary bg-accent/70 ring-2 ring-primary/25'
                                  : 'border-border bg-card hover:border-primary/40'
                              }`}
                            >
                              <div
                                className={`h-7 w-full rounded-lg ${theme.swatchClass} mb-2`}
                              />
                              <p className="font-mono text-xs font-bold text-foreground truncate">
                                {theme.label}
                              </p>
                            </button>
                          )
                        },
                      )}
                    </div>

                    {/* Cover Image URL & Preset Selector */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1">
                          Cover Background Image URL (Optional)
                        </label>
                        <Input
                          value={currentProfile.coverImageUrl}
                          onChange={(e) =>
                            updateCurrentProfile((prev) => ({
                              ...prev,
                              coverImageUrl: e.target.value,
                            }))
                          }
                          placeholder="/images/campus.jpg or https://..."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1">
                          Preset Institutional Backdrops
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {PRESET_COVER_IMAGES.map((item) => (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() =>
                                updateCurrentProfile((prev) => ({
                                  ...prev,
                                  coverImageUrl: item.url,
                                }))
                              }
                              className={`rounded-lg border px-2.5 py-1.5 text-xs font-mono font-semibold transition-colors cursor-pointer ${
                                currentProfile.coverImageUrl === item.url
                                  ? 'border-primary bg-primary text-white dark:text-slate-950'
                                  : 'border-border bg-card text-secondary hover:text-foreground'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {editorTab === 'IDENTITY' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1.5">
                        Full Name
                      </label>
                      <Input
                        value={currentProfile.name}
                        onChange={(e) =>
                          updateCurrentProfile((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1.5">
                        Location / Chapter City
                      </label>
                      <Input
                        value={currentProfile.location}
                        onChange={(e) =>
                          updateCurrentProfile((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1.5">
                        Institutional / Contact Email
                      </label>
                      <Input
                        value={currentProfile.email}
                        onChange={(e) =>
                          updateCurrentProfile((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1.5">
                        Professional / Academic Headline
                      </label>
                      <Input
                        value={currentProfile.headline}
                        onChange={(e) =>
                          updateCurrentProfile((prev) => ({
                            ...prev,
                            headline: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1.5">
                        CGPA / Academic Honors
                      </label>
                      <Input
                        value={currentProfile.gpaOrHonors}
                        onChange={(e) =>
                          updateCurrentProfile((prev) => ({
                            ...prev,
                            gpaOrHonors: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1.5">
                        Degree Program
                      </label>
                      <Input
                        value={currentProfile.degree}
                        onChange={(e) =>
                          updateCurrentProfile((prev) => ({
                            ...prev,
                            degree: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1.5">
                        Department
                      </label>
                      <Input
                        value={currentProfile.department}
                        onChange={(e) =>
                          updateCurrentProfile((prev) => ({
                            ...prev,
                            department: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1.5">
                        Portfolio / Website URL
                      </label>
                      <Input
                        value={currentProfile.portfolioUrl}
                        onChange={(e) =>
                          updateCurrentProfile((prev) => ({
                            ...prev,
                            portfolioUrl: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1.5">
                      Biography & Career Summary
                    </label>
                    <textarea
                      rows={4}
                      value={currentProfile.bio}
                      onChange={(e) =>
                        updateCurrentProfile((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-sans text-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1.5">
                        {viewMode === 'STUDENT'
                          ? 'Featured Capstone Title'
                          : 'Featured Mentorship Track Title'}
                      </label>
                      <Input
                        value={currentProfile.capstoneOrFocusTitle}
                        onChange={(e) =>
                          updateCurrentProfile((prev) => ({
                            ...prev,
                            capstoneOrFocusTitle: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-end gap-4">
                      <label className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-foreground cursor-pointer select-none pb-2">
                        <input
                          type="checkbox"
                          checked={currentProfile.openToReferralsOrMentoring}
                          onChange={(e) =>
                            updateCurrentProfile((prev) => ({
                              ...prev,
                              openToReferralsOrMentoring: e.target.checked,
                            }))
                          }
                          className="h-4 w-4 accent-primary rounded"
                        />
                        {viewMode === 'STUDENT'
                          ? 'Show "Open to Internships & Mentorship" Status'
                          : 'Show "Available for Mentorship & Referrals" Status'}
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1.5">
                      {viewMode === 'STUDENT'
                        ? 'Final-Year Capstone / Research Summary'
                        : 'Mentorship & Advisory Track Summary'}
                    </label>
                    <textarea
                      rows={3}
                      value={currentProfile.capstoneOrFocusSummary}
                      onChange={(e) =>
                        updateCurrentProfile((prev) => ({
                          ...prev,
                          capstoneOrFocusSummary: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-sans text-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              {editorTab === 'EXPERIENCE' && (
                <div className="space-y-5">
                  <div className="rounded-xl border border-border bg-background p-4 space-y-3">
                    <p className="text-xs font-mono uppercase tracking-wider font-bold text-primary">
                      Add New Experience / Internship / Role
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Input
                        placeholder="Role Title (e.g., Software Engineer)"
                        value={newExpRole}
                        onChange={(e) => setNewExpRole(e.target.value)}
                      />
                      <Input
                        placeholder="Organization / Company"
                        value={newExpOrg}
                        onChange={(e) => setNewExpOrg(e.target.value)}
                      />
                      <Input
                        placeholder="Period (e.g., 2024 – Present)"
                        value={newExpPeriod}
                        onChange={(e) => setNewExpPeriod(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        placeholder="Location (e.g., Karachi / Remote)"
                        value={newExpLocation}
                        onChange={(e) => setNewExpLocation(e.target.value)}
                      />
                      <Input
                        placeholder="Role Type (e.g., Summer Internship, Full-Time)"
                        value={newExpType}
                        onChange={(e) => setNewExpType(e.target.value)}
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Key accomplishments and impact summary..."
                      value={newExpSummary}
                      onChange={(e) => setNewExpSummary(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-sm text-foreground"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddExperience}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Add Experience to Timeline
                    </Button>
                  </div>

                  {/* Add Honors / Achievements */}
                  <div className="rounded-xl border border-border bg-background p-4 space-y-3">
                    <p className="text-xs font-mono uppercase tracking-wider font-bold text-amber-700 dark:text-amber-300">
                      Manage Academic Honors & Key Achievements
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a new honor, award, or milestone..."
                        value={newAchievementInput}
                        onChange={(e) => setNewAchievementInput(e.target.value)}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleAddAchievement}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add Honor
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {currentProfile.achievements.map((ach) => (
                        <div
                          key={ach}
                          className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground"
                        >
                          <span>{ach}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAchievement(ach)}
                            className="text-secondary hover:text-error cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetProfile}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  Reset to Default
                </Button>

                <div className="flex items-center gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-1.5" />
                    Save Profile Changes
                  </Button>
                </div>
              </div>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      {/* 3. MAIN 2-COLUMN PROFILE DOSSIER */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Biography, Capstone/Focus, and Experience Timeline */}
        <div className="lg:col-span-7 space-y-6">
          {/* Biography Card with High-Legibility Sans Typography */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-card space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider font-semibold text-primary">
                  Personal & Academic Statement
                </p>
                <h3 className="font-display text-xl font-bold text-foreground">
                  About {currentProfile.name}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditorTab('IDENTITY')
                  setIsEditing(true)
                }}
              >
                <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                Edit Bio
              </Button>
            </div>

            <div className="rounded-xl border-l-4 border-l-primary border border-border/70 bg-background/80 p-4 sm:p-5">
              <p className="font-sans text-[15px] sm:text-base text-foreground/90 leading-[1.8] tracking-[-0.005em] font-normal">
                {currentProfile.bio}
              </p>
            </div>

            {/* Highlighted Capstone or Mentorship Track Box */}
            <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-accent/40 to-transparent p-4 sm:p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider font-bold text-amber-700 dark:text-amber-300">
                <BookOpen className="h-4 w-4 text-gold" />
                {viewMode === 'STUDENT'
                  ? 'Featured Senior Capstone Project'
                  : 'Featured Alumni Mentorship Track'}
              </div>
              <h4 className="font-display text-base sm:text-lg font-bold text-foreground">
                {currentProfile.capstoneOrFocusTitle}
              </h4>
              <p className="font-sans text-sm sm:text-[15px] text-foreground/85 leading-[1.75]">
                {currentProfile.capstoneOrFocusSummary}
              </p>
            </div>
          </motion.div>

          {/* Experience, Internships & Academic Roles */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-card space-y-5"
          >
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400">
                  Verified Experience & Leadership
                </p>
                <h3 className="font-display text-xl font-bold text-foreground">
                  {viewMode === 'STUDENT'
                    ? 'Internships & Campus Teaching Roles'
                    : 'Professional Career History'}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditorTab('EXPERIENCE')
                  setIsEditing(true)
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1 text-primary" />
                Add Role
              </Button>
            </div>

            <div className="relative pl-4 sm:pl-6 border-l-2 border-primary/35 space-y-5">
              {currentProfile.experiences.map((exp) => (
                <motion.article
                  key={exp.id}
                  whileHover={{ x: 3 }}
                  className="relative rounded-xl border border-border bg-background p-4 sm:p-5 hover:border-primary/45 transition-colors space-y-2"
                >
                  <span className="absolute -left-[25px] sm:-left-[33px] top-5 h-4 w-4 rounded-full border-2 border-primary bg-card" />

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-md border border-primary/25 bg-accent px-2.5 py-0.5 font-mono text-xs font-bold text-primary">
                      {exp.period}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-secondary">
                        {exp.type}
                      </span>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(exp.id)}
                          aria-label={`Remove ${exp.role}`}
                          className="text-secondary hover:text-error cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-display text-base sm:text-lg font-bold text-foreground">
                      {exp.role}
                    </h4>
                    <p className="font-sans text-sm font-semibold text-primary flex items-center gap-1.5 mt-0.5">
                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                      {exp.organization} · {exp.location}
                    </p>
                  </div>

                  <p className="font-sans text-sm sm:text-[15px] text-foreground/85 leading-[1.75] pt-1">
                    {exp.summary}
                  </p>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right 5 Cols: Profile Completion (Student), Skills Editor, and Honors */}
        <div className="lg:col-span-5 space-y-6">
          {viewMode === 'STUDENT' && (
            <ProfileCompletionCard
              completionPercentage={completionPercentage}
              checklist={studentChecklist}
              onToggleChecklistItem={handleToggleChecklistItem}
              onCompleteProfile={() => {
                setEditorTab('IDENTITY')
                setIsEditing(true)
              }}
            />
          )}

          {/* Skills & Career Interests Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5"
          >
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider font-semibold text-primary">
                  Competency & Skill Matrix
                </p>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Verified Technical & Domain Skills
                </h3>
              </div>
              <Code2 className="h-5 w-5 text-primary" />
            </div>

            <div className="flex flex-wrap gap-2">
              {currentProfile.skills.map((skill, idx) => {
                const colorStyles =
                  idx % 3 === 0
                    ? 'border-primary/30 bg-accent/65 text-foreground'
                    : idx % 3 === 1
                      ? 'border-blue-500/25 bg-blue-500/10 text-foreground'
                      : 'border-amber-500/30 bg-amber-500/10 text-foreground'
                return (
                  <span
                    key={skill}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-sans font-semibold ${colorStyles}`}
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      aria-label={`Remove ${skill}`}
                      className="text-secondary hover:text-destructive transition-colors cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )
              })}
            </div>

            {/* Quick Add Skill Input */}
            <div className="flex items-center gap-2 pt-1">
              <Input
                placeholder="Add a verified skill (e.g., GraphQL, Docker)..."
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSkill()
                  }
                }}
                className="h-9 text-xs"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddSkill}
                className="shrink-0"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add
              </Button>
            </div>

            {/* Career Interests */}
            <div className="pt-4 border-t border-border space-y-2.5">
              <p className="text-xs font-mono uppercase tracking-wider font-semibold text-purple-600 dark:text-purple-400">
                {viewMode === 'STUDENT'
                  ? 'Target Career & Fellowship Tracks'
                  : 'Mentoring & Advisory Topics'}
              </p>
              <div className="flex flex-wrap gap-2">
                {currentProfile.careerInterests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/25 bg-purple-500/10 px-3 py-1 text-xs font-sans font-medium text-foreground"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(interest)}
                      aria-label={`Remove ${interest}`}
                      className="text-secondary hover:text-destructive cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Input
                  placeholder="Add career track or mentoring interest..."
                  value={newInterestInput}
                  onChange={(e) => setNewInterestInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddInterest()
                    }
                  }}
                  className="h-9 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddInterest}
                  className="shrink-0"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Academic Honors & Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider font-semibold text-amber-700 dark:text-amber-300">
                  Distinctions & Impact
                </p>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Honors & Achievements
                </h3>
              </div>
              <Award className="h-5 w-5 text-gold" />
            </div>

            <ul className="space-y-3">
              {currentProfile.achievements.map((ach) => (
                <li
                  key={ach}
                  className="rounded-xl border border-border bg-background p-3.5 flex items-start justify-between gap-2.5"
                >
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="font-sans text-sm text-foreground/90 leading-[1.7]">
                      {ach}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-sans">
              <span className="text-secondary flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" />
                Registrar-verified dossier
              </span>
              <Link
                to="/alumni"
                className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                <Users className="h-3.5 w-3.5" />
                Browse Alumni Directory
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </RoleShell>
  )
}