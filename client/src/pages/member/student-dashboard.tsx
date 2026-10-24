import { RoleShell } from '@/components/layout/role-shell'
import { Button } from '@/components/ui/button'
import { CampusNewsTicker } from '@/components/ui/campus-news-ticker'
import {
  DashboardStats,
  type DashboardStatsProps,
} from '@/components/ui/dashboard-stats'
import { EmptyState } from '@/components/ui/empty-state'
import {
  JobApplicationTracker,
  type JobTrackerStatus,
  type TrackedJobItem,
} from '@/components/ui/job-application-tracker'
import {
  ProfileCompletionCard,
  type ProfileChecklistItem as CompletionCardChecklistItem,
} from '@/components/ui/profile-completion-card'
import {
  QuickActionsGrid,
  type QuickActionsGridProps,
} from '@/components/ui/quick-actions-grid'
import {
  INITIAL_STUDENT_NOTIFICATIONS,
  Notifications,
  NotificationsSlideOver,
  type StudentNotificationItem,
} from '@/components/ui/student-notifications'
import {
  MENTORS_CATALOG,
  loadMentorshipRequests,
  saveMentorshipRequests,
  type MentorRecord,
  type StoredMentorshipRequest,
} from '@/lib/mentorship-data'
import {
  ALUMNI_DETAILED_CATALOG,
  loadConnectedAlumniIds,
  loadJobApplications,
  saveConnectedAlumniIds,
  saveJobApplications,
  type StudentJobApplication,
} from '@/lib/role-context'
import { toast } from '@/lib/toast'
import { color } from '@/styles/tokens'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Bell,
  Bookmark,
  Briefcase,
  Calendar,
  Clock,
  Compass,
  ExternalLink,
  FileText,
  GraduationCap,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
  UserCheck,
  UserPlus,
  Users,
  Video,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

interface ProfileChecklistItem {
  id: string
  category: string
  label: string
  helper: string
  points: number
  completed: boolean
  actionRoute: string
  actionLabel: string
}

interface StudentEventItem {
  id: string
  title: string
  category: 'Campus Career Fair' | 'Alumni Seminar' | 'Technical Workshop'
  monthShort: string
  dayNum: string
  dateLabel: string
  timeLabel: string
  format: string
  isOnline: boolean
  organizer: string
  organizerRole: string
  seatsRemaining: number
  totalSeats: number
}

interface StudentOpportunityItem {
  id: string
  title: string
  company: string
  location: string
  type: 'INTERNSHIP' | 'GRADUATE ROLE' | 'RESEARCH FELLOWSHIP'
  stipend: string
  postedBy: string
  postedByClass: string
  deadline: string
  daysLeft: number
  skills: string[]
  matchScore: number
  externalUrl: string
}

const STUDENT_EVENTS: StudentEventItem[] = [
  {
    id: '1',
    title: 'Annual Sukkur IBA Tech & FinTech Career Fair 2026',
    category: 'Campus Career Fair',
    monthShort: 'NOV',
    dayNum: '18',
    dateLabel: 'Nov 18, 2026',
    timeLabel: '10:00 AM PKT',
    format: 'Main Auditorium, Sukkur IBA & Virtual Booths',
    isOnline: false,
    organizer: 'Career Development Office & Alumni Guild',
    organizerRole: '38 Partner Employers Attending',
    seatsRemaining: 42,
    totalSeats: 250,
  },
  {
    id: '2',
    title: 'Breaking into European AI Labs & DAAD Scholarships',
    category: 'Alumni Seminar',
    monthShort: 'NOV',
    dayNum: '24',
    dateLabel: 'Nov 24, 2026',
    timeLabel: '07:00 PM PKT',
    format: 'Live Online Workshop',
    isOnline: true,
    organizer: 'Dr. Aamir Soomro',
    organizerRole: 'Principal ML Scientist · DeepScale Munich (BSCS ’14)',
    seatsRemaining: 19,
    totalSeats: 120,
  },
  {
    id: '3',
    title: 'System Design & Graduate Software Engineer Mock Loops',
    category: 'Technical Workshop',
    monthShort: 'DEC',
    dayNum: '02',
    dateLabel: 'Dec 02, 2026',
    timeLabel: '06:30 PM PKT',
    format: 'Hybrid · Karachi Hub & Online',
    isOnline: true,
    organizer: 'Dr. Sarah Khan & Ahmed Hassan',
    organizerRole: 'Engineering Leadership · TechCorp',
    seatsRemaining: 14,
    totalSeats: 60,
  },
]

const STUDENT_OPPORTUNITIES: StudentOpportunityItem[] = [
  {
    id: '4',
    title: 'Product Strategy & Venture Fellow (Summer / Grad)',
    company: 'Menapay Ventures',
    location: 'Karachi / Hybrid',
    type: 'INTERNSHIP',
    stipend: 'PKR 120,000 / mo',
    postedBy: 'Sanaullah Memon',
    postedByClass: 'BBA ’16 · VP Product',
    deadline: 'Dec 15, 2026',
    daysLeft: 18,
    skills: ['Product Analytics', 'SQL', 'FinTech GTM'],
    matchScore: 94,
    externalUrl: '',
  },
  {
    id: '1',
    title: 'Graduate Software Engineer — Core Cloud Platform',
    company: 'TechCorp',
    location: 'Karachi / Remote',
    type: 'GRADUATE ROLE',
    stipend: 'PKR 260,000 / mo',
    postedBy: 'Dr. Sarah Khan',
    postedByClass: 'BSCS ’12 · VP Engineering',
    deadline: 'Nov 30, 2026',
    daysLeft: 9,
    skills: ['TypeScript', 'Distributed Systems', 'Kubernetes'],
    matchScore: 98,
    externalUrl: '',
  },
  {
    id: '2',
    title: 'Applied ML Research Intern (LLM Quantization)',
    company: 'DeepScale Munich',
    location: 'Munich / Remote Prep',
    type: 'RESEARCH FELLOWSHIP',
    stipend: '€2,400 / mo Stipend',
    postedBy: 'Dr. Aamir Soomro',
    postedByClass: 'BSCS ’14 · Principal Scientist',
    deadline: 'Dec 05, 2026',
    daysLeft: 14,
    skills: ['PyTorch', 'Transformers', 'Python'],
    matchScore: 91,
    externalUrl: 'https://deepscale.example.com/fellowships',
  },
]

const MENTOR_MATCH_METADATA: Record<
  string,
  { matchScore: number; matchReason: string; alumId: string; avatar: string }
> = {
  'm-1': {
    matchScore: 98,
    matchReason: 'Matches your BSCS ’26 track, Distributed Systems focus & Cloud Capstone',
    alumId: '1',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=480&q=80',
  },
  'm-2': {
    matchScore: 94,
    matchReason: 'Matches your FinTech product interest & MENA venture fellowship goal',
    alumId: '2',
    avatar:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=480&q=80',
  },
  'm-3': {
    matchScore: 96,
    matchReason: 'Matches your AI/ML elective specialization & European MS/PhD interest',
    alumId: '3',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=480&q=80',
  },
  'm-4': {
    matchScore: 89,
    matchReason: 'Matches your SQL & analytics stack for quantitative finance roles',
    alumId: '4',
    avatar:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=480&q=80',
  },
}

type MentorTrackFilter = 'ALL' | 'AVAILABLE' | 'TECH_AI' | 'PRODUCT_FINTECH'
type SummaryFilterTab = 'ALL' | 'REGISTERED_SAVED'

export {
  QuickActionsGrid,
  type QuickActionsGridProps,
  DashboardStats,
  type DashboardStatsProps,
}

export function StudentDashboardPage() {
  const navigate = useNavigate()

  // Toggleable empty state mode for evaluating "new students without connections"
  const [isNewStudentEmptyMode, setIsNewStudentEmptyMode] = useState(false)

  // Mentor recommendation filter
  const [mentorFilter, setMentorFilter] = useState<MentorTrackFilter>('ALL')

  // Summary filter tab for Events & Career Opportunities
  const [eventsViewFilter, setEventsViewFilter] =
    useState<SummaryFilterTab>('ALL')
  const [opportunitiesViewFilter, setOpportunitiesViewFilter] =
    useState<SummaryFilterTab>('ALL')

  // Interactive Mentorship Request Modal state
  const [activeMentorModal, setActiveMentorModal] =
    useState<MentorRecord | null>(null)
  const [requestMode, setRequestMode] = useState<'OFFICE_HOURS' | 'LONG_TERM'>(
    'OFFICE_HOURS',
  )
  const [selectedSlotLabel, setSelectedSlotLabel] = useState<string>('')
  const [requestGoalText, setRequestGoalText] = useState<string>(
    'Seeking feedback on my final-year BSCS capstone architecture and preparation for graduate software engineering technical interviews.',
  )

  // Profile completion checklist state
  const [checklist, setChecklist] = useState<ProfileChecklistItem[]>([
    {
      id: 'chk-email',
      category: 'Institutional Auth',
      label: 'Verify Sukkur IBA student email (@iba-suk.edu.pk)',
      helper: 'Confirms enrollment status for alumni-only referrals',
      points: 25,
      completed: true,
      actionRoute: '/settings',
      actionLabel: 'Verified',
    },
    {
      id: 'chk-academic',
      category: 'Academic Dossier',
      label: 'Add BS Computer Science cohort, CGPA & 2026 graduation',
      helper: 'Matches you with department alumni & degree mentors',
      points: 25,
      completed: true,
      actionRoute: '/profile',
      actionLabel: 'Edit Cohort',
    },
    {
      id: 'chk-skills',
      category: 'Career & Skills',
      label: 'Select 5 core technical skills & target career tracks',
      helper: 'Powers affinity ranking for internships & mentors',
      points: 25,
      completed: true,
      actionRoute: '/profile',
      actionLabel: 'Update Skills',
    },
    {
      id: 'chk-capstone',
      category: 'Portfolio & CV',
      label: 'Upload CV PDF & link final-year capstone repository',
      helper: 'Unlocks 1-click Quick Apply for partner employer roles',
      points: 25,
      completed: false,
      actionRoute: '/profile/edit',
      actionLabel: 'Upload CV',
    },
  ])

  const completionPercentage = useMemo(() => {
    if (isNewStudentEmptyMode) return 25
    return checklist.reduce(
      (sum, item) => sum + (item.completed ? item.points : 0),
      0,
    )
  }, [checklist, isNewStudentEmptyMode])

  const readinessTier = useMemo(() => {
    if (completionPercentage >= 100) {
      return {
        badge: 'ALL-STAR SCHOLAR · 100%',
        summary: 'Priority alumni referral & fast-track mentor matching unlocked.',
      }
    }
    if (completionPercentage >= 75) {
      return {
        badge: 'CAREER READY · 75%',
        summary: '1 step remaining to unlock verified CV packet sharing with recruiters.',
      }
    }
    if (completionPercentage >= 50) {
      return {
        badge: 'BUILDING MOMENTUM · 50%',
        summary: 'Complete your skills and portfolio to boost mentor match accuracy.',
      }
    }
    return {
      badge: 'GETTING STARTED · 25%',
      summary: 'Complete your academic profile to unlock mentor office hours.',
    }
  }, [completionPercentage])

  const nextIncompleteStep = useMemo(() => {
    if (isNewStudentEmptyMode) return checklist[1]
    return checklist.find((item) => !item.completed) ?? null
  }, [checklist, isNewStudentEmptyMode])

  // Connected alumni state
  const [connections, setConnections] = useState<
    Record<string, 'CONNECTED' | 'PENDING'>
  >(() => loadConnectedAlumniIds())

  // Mentorship requests state
  const [mentorshipRequests, setMentorshipRequests] = useState<
    StoredMentorshipRequest[]
  >(() => loadMentorshipRequests())

  // Registered events state
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([
    '1',
    '3',
  ])

  // Saved & applied jobs state
  const [savedJobIds, setSavedJobIds] = useState<string[]>(['4', '1'])
  const [applications, setApplications] = useState<StudentJobApplication[]>(
    () => loadJobApplications(),
  )

  // Activity notifications state & Slide-over drawer state
  const [notifications, setNotifications] = useState<StudentNotificationItem[]>(
    INITIAL_STUDENT_NOTIFICATIONS,
  )
  const [isNotificationsSlideOverOpen, setIsNotificationsSlideOverOpen] =
    useState(false)

  const unreadNotificationsCount = useMemo(
    () =>
      isNewStudentEmptyMode
        ? 0
        : notifications.filter((n) => n.unread).length,
    [notifications, isNewStudentEmptyMode],
  )

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
    toast.success('All student notifications marked as read.')
  }

  const handleToggleNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n)),
    )
  }

  const handleRespondConnectionNotification = (
    id: string,
    decision: 'ACCEPTED' | 'DECLINED',
  ) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              unread: false,
              connectionStatus: decision,
            }
          : n,
      ),
    )
    if (decision === 'ACCEPTED') {
      const nextMap = { ...connections, '5': 'CONNECTED' as const }
      setConnections(nextMap)
      saveConnectedAlumniIds(nextMap)
      toast({
        title: 'Connection Request Accepted',
        description:
          'Bilal Ahmed Mahar (BSCS ’15) has been added to your verified alumni connections.',
        variant: 'success',
      })
    } else {
      toast({
        title: 'Connection Request Declined',
        description: 'The connection invitation was declined.',
      })
    }
  }

  const handleAcknowledgeEventReminder = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              unread: false,
              reminderAcknowledged: !n.reminderAcknowledged,
            }
          : n,
      ),
    )
    toast.success('Campus event reminder preference updated.')
  }

  const filteredMentors = useMemo(() => {
    const base = MENTORS_CATALOG.slice(0, 4)
    if (mentorFilter === 'AVAILABLE') {
      return base.filter((m) => m.isAvailable && m.currentMentees < m.maxMentees)
    }
    if (mentorFilter === 'TECH_AI') {
      return base.filter(
        (m) =>
          m.department.includes('Computer') ||
          m.industries.some((ind) => ind.includes('AI') || ind.includes('Cloud')),
      )
    }
    if (mentorFilter === 'PRODUCT_FINTECH') {
      return base.filter((m) =>
        m.industries.some(
          (ind) => ind.includes('FinTech') || ind.includes('Venture') || ind.includes('Banking'),
        ),
      )
    }
    return base
  }, [mentorFilter])

  const displayedEvents = useMemo(() => {
    if (eventsViewFilter === 'REGISTERED_SAVED') {
      return STUDENT_EVENTS.filter(
        (ev) => !isNewStudentEmptyMode && registeredEventIds.includes(ev.id),
      )
    }
    return STUDENT_EVENTS
  }, [eventsViewFilter, isNewStudentEmptyMode, registeredEventIds])

  const displayedOpportunities = useMemo(() => {
    if (opportunitiesViewFilter === 'REGISTERED_SAVED') {
      return STUDENT_OPPORTUNITIES.filter((opp) => savedJobIds.includes(opp.id))
    }
    return STUDENT_OPPORTUNITIES
  }, [opportunitiesViewFilter, savedJobIds])

  const toggleChecklistItem = (id: string) => {
    if (isNewStudentEmptyMode) {
      setIsNewStudentEmptyMode(false)
    }
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    )
    toast.success('Student profile completion status updated.')
  }

  const handleConnectAlumni = (alumniId: string, alumniName: string) => {
    const current = connections[alumniId]
    const nextMap = { ...connections }
    if (current === 'CONNECTED' || current === 'PENDING') {
      delete nextMap[alumniId]
      toast({
        title: 'Connection Removed',
        description: `Connection with ${alumniName} was removed.`,
      })
    } else {
      nextMap[alumniId] = 'PENDING'
      toast({
        title: 'Connection Request Sent',
        description: `Your introduction note was sent to ${alumniName}.`,
        variant: 'success',
      })
    }
    setConnections(nextMap)
    saveConnectedAlumniIds(nextMap)
  }

  const openMentorRequestModal = (mentor: MentorRecord) => {
    const existing = mentorshipRequests.find(
      (r) =>
        r.mentorId === mentor.id &&
        (r.status === 'PENDING' || r.status === 'ACTIVE'),
    )
    if (existing) {
      toast({
        title: `Mentorship Already ${existing.status}`,
        description: `You already have an ${existing.status.toLowerCase()} mentorship request with ${mentor.name}.`,
      })
      return
    }
    const defaultSlot = mentor.officeHoursSlots[0]
      ? `${mentor.officeHoursSlots[0].dayLabel} · ${mentor.officeHoursSlots[0].timeLabel} (${mentor.officeHoursSlots[0].format})`
      : 'Flexible Next Available Slot'
    setSelectedSlotLabel(defaultSlot)
    setRequestMode('OFFICE_HOURS')
    setActiveMentorModal(mentor)
  }

  const handleSubmitMentorshipModal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeMentorModal) return
    const trimmedGoal = requestGoalText.trim()
    if (!trimmedGoal) {
      toast.error('Please enter your mentorship goal before submitting.')
      return
    }

    const newReq: StoredMentorshipRequest = {
      id: `req-${Date.now()}`,
      mentorId: activeMentorModal.id,
      mentorName: activeMentorModal.name,
      mentorHeadline: activeMentorModal.headline,
      menteeName: 'Zainab Magsi (BSCS ’26)',
      mode: requestMode,
      status: 'PENDING',
      goal: trimmedGoal,
      slotLabel: selectedSlotLabel,
      requestedAt: new Date().toISOString().slice(0, 10),
      startedAt: null,
      meetingCount: 0,
      lastMeeting: null,
      duration:
        requestMode === 'OFFICE_HOURS'
          ? '45-min 1-on-1 Office Hours'
          : '12-Week Semester Track',
      notes: [
        `Requested via Student Dashboard (${selectedSlotLabel}).`,
      ],
    }

    const updated = [newReq, ...mentorshipRequests]
    setMentorshipRequests(updated)
    saveMentorshipRequests(updated)
    setActiveMentorModal(null)
    toast({
      title: 'Mentorship Request Sent',
      description: `Your request to ${activeMentorModal.name} is now tracked in your live status ledger.`,
      variant: 'success',
    })
  }

  const handleToggleEventRegistration = (event: StudentEventItem) => {
    const isRegistered = registeredEventIds.includes(event.id)
    setRegisteredEventIds((prev) =>
      isRegistered
        ? prev.filter((id) => id !== event.id)
        : [...prev, event.id],
    )
    toast({
      title: isRegistered ? 'Registration Cancelled' : 'Campus Seat Confirmed',
      description: isRegistered
        ? `You cancelled your registration for ${event.title}.`
        : `You are registered for ${event.title} on ${event.dateLabel}.`,
      variant: isRegistered ? 'default' : 'success',
    })
  }

  const handleToggleSaveJob = (jobId: string, jobTitle: string) => {
    const isSaved = savedJobIds.includes(jobId)
    setSavedJobIds((prev) =>
      isSaved ? prev.filter((id) => id !== jobId) : [...prev, jobId],
    )
    toast({
      title: isSaved ? 'Removed from Saved Roles' : 'Saved to Career Shortlist',
      description: `${jobTitle} ${isSaved ? 'removed from' : 'added to'} your saved opportunities.`,
    })
  }

  const handleApplyToOpportunity = (opp: StudentOpportunityItem) => {
    const existing = applications.find((a) => a.jobId === opp.id)
    if (existing) {
      toast({
        title: 'Application Already Tracked',
        description: `Your application for ${opp.title} at ${opp.company} is currently ${existing.status}.`,
      })
      return
    }
    const newApp: StudentJobApplication = {
      id: `app-${Date.now()}`,
      jobId: opp.id,
      jobTitle: opp.title,
      company: opp.company,
      location: opp.location,
      employmentType: opp.type,
      appliedAt: new Date().toISOString().slice(0, 10),
      status: 'SUBMITTED',
      applicantName: 'Zainab Magsi',
      applicantEmail: 'zainab.magsi.bscs22@iba-suk.edu.pk',
      applicantMajor: 'BS Computer Science',
      applicantGradYear: 2026,
      applicantGpa: '3.76 / 4.00',
      resumeUrl: 'https://iba-suk.edu.pk/portfolios/zainab-magsi-cv.pdf',
      coverNote: `Applying for ${opp.title} at ${opp.company} via Sukkur IBA Student Career Portal.`,
      skills: opp.skills,
    }
    const next = [newApp, ...applications]
    setApplications(next)
    saveJobApplications(next)
    toast({
      title: 'Application Sent to Alumni Referrer',
      description: `Your scholar dossier has been submitted to ${opp.postedBy} at ${opp.company}.`,
      variant: 'success',
    })
  }

  const activeConnectionsCount = isNewStudentEmptyMode
    ? 0
    : Object.keys(connections).length
  const confirmedConnectionsCount = isNewStudentEmptyMode
    ? 0
    : Object.values(connections).filter((status) => status === 'CONNECTED')
        .length
  const pendingConnectionsCount = isNewStudentEmptyMode
    ? 0
    : Object.values(connections).filter((status) => status === 'PENDING').length
  const visibleRequests = isNewStudentEmptyMode ? [] : mentorshipRequests
  const mentorshipSessionsCount = useMemo(() => {
    if (isNewStudentEmptyMode) return 0
    const completedMeetings = visibleRequests.reduce(
      (sum, req) => sum + (req.meetingCount || 0),
      0,
    )
    const scheduledOrPending = visibleRequests.filter(
      (req) => req.status === 'ACTIVE' || req.status === 'PENDING',
    ).length
    return Math.max(scheduledOrPending, completedMeetings + scheduledOrPending)
  }, [isNewStudentEmptyMode, visibleRequests])
  const savedJobsCount = isNewStudentEmptyMode ? 0 : savedJobIds.length
  const visibleApplications = isNewStudentEmptyMode ? [] : applications
  const registeredEventsCount = isNewStudentEmptyMode
    ? 0
    : registeredEventIds.length

  const completionChecklistItems: CompletionCardChecklistItem[] = useMemo(
    () =>
      checklist.map((item, idx) => ({
        id: item.id,
        label: item.label,
        description: `${item.category} · ${item.helper}`,
        weight: item.points,
        completed: isNewStudentEmptyMode ? idx === 0 : item.completed,
        actionHref: item.actionRoute,
        actionLabel: item.actionLabel,
      })),
    [checklist, isNewStudentEmptyMode],
  )

  const trackedJobItems: TrackedJobItem[] = useMemo(() => {
    if (isNewStudentEmptyMode) return []
    const items: TrackedJobItem[] = visibleApplications.map((app) => {
      const matchedOpp = STUDENT_OPPORTUNITIES.find((o) => o.id === app.jobId)
      return {
        id: app.id,
        jobId: app.jobId,
        jobTitle: app.jobTitle,
        company: app.company,
        location: app.location,
        employmentType: app.employmentType,
        updatedAt: app.appliedAt,
        status: app.status,
        referrer: matchedOpp
          ? `${matchedOpp.postedBy} (${matchedOpp.postedByClass})`
          : undefined,
        stipendOrSalary: matchedOpp?.stipend,
      }
    })

    for (const savedId of savedJobIds) {
      const alreadyApplied = visibleApplications.some(
        (app) => app.jobId === savedId,
      )
      if (!alreadyApplied) {
        const opp = STUDENT_OPPORTUNITIES.find((o) => o.id === savedId)
        if (opp) {
          items.push({
            id: `saved-${opp.id}`,
            jobId: opp.id,
            jobTitle: opp.title,
            company: opp.company,
            location: opp.location,
            employmentType: opp.type,
            updatedAt: `Due ${opp.deadline}`,
            status: 'SAVED',
            referrer: `${opp.postedBy} (${opp.postedByClass})`,
            stipendOrSalary: opp.stipend,
          })
        }
      }
    }

    return items
  }, [isNewStudentEmptyMode, visibleApplications, savedJobIds])

  const handleUpdateTrackedJobStatus = (
    itemId: string,
    nextStatus: JobTrackerStatus,
  ) => {
    const statusMap: Record<
      JobTrackerStatus,
      StudentJobApplication['status']
    > = {
      SAVED: 'SUBMITTED',
      APPLIED: 'SUBMITTED',
      INTERVIEWING: 'INTERVIEW',
      ACCEPTED: 'OFFERED',
      DECLINED: 'REJECTED',
    }

    if (itemId.startsWith('saved-')) {
      const jobId = itemId.replace('saved-', '')
      const opp = STUDENT_OPPORTUNITIES.find((o) => o.id === jobId)
      if (!opp || nextStatus === 'SAVED') return
      const newApp: StudentJobApplication = {
        id: `app-${Date.now()}`,
        jobId: opp.id,
        jobTitle: opp.title,
        company: opp.company,
        location: opp.location,
        employmentType: opp.type,
        appliedAt: new Date().toISOString().slice(0, 10),
        status: statusMap[nextStatus],
        applicantName: 'Zainab Magsi',
        applicantEmail: 'zainab.magsi.bscs22@iba-suk.edu.pk',
        applicantMajor: 'BS Computer Science',
        applicantGradYear: 2026,
        applicantGpa: '3.76 / 4.00',
        resumeUrl: 'https://iba-suk.edu.pk/portfolios/zainab-magsi-cv.pdf',
        coverNote: `Tracked via Student Job Application Tracker (${nextStatus}).`,
        skills: opp.skills,
      }
      const next = [newApp, ...applications]
      setApplications(next)
      saveJobApplications(next)
      toast.success(`Updated "${opp.title}" status to ${nextStatus}`)
      return
    }

    if (nextStatus === 'SAVED') {
      const targetApp = applications.find((a) => a.id === itemId)
      if (targetApp) {
        if (!savedJobIds.includes(targetApp.jobId)) {
          setSavedJobIds((prev) => [...prev, targetApp.jobId])
        }
        const remaining = applications.filter((a) => a.id !== itemId)
        setApplications(remaining)
        saveJobApplications(remaining)
        toast.success(`Moved "${targetApp.jobTitle}" back to Saved jobs`)
      }
      return
    }

    const updated = applications.map((app) =>
      app.id === itemId ? { ...app, status: statusMap[nextStatus] } : app,
    )
    setApplications(updated)
    saveJobApplications(updated)
    toast.success('Job application status updated.')
  }

  return (
    <RoleShell
      role="STUDENT"
      title="Student Career & Mentorship Hub"
      subtitle="Sukkur IBA University · Undergraduate & Graduate Scholar Portal"
      badge="Class of 2026"
      headerActions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsNotificationsSlideOverOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-mono font-semibold text-foreground hover:border-primary transition-colors cursor-pointer whitespace-nowrap"
            title="Open Student Notifications Slide-Over Panel"
          >
            <Bell className="h-3.5 w-3.5 text-primary" />
            <span>Notifications</span>
            {unreadNotificationsCount > 0 && (
              <span className="rounded bg-primary px-1.5 py-0.2 text-[10px] font-bold text-primary-foreground tabular-nums">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsNewStudentEmptyMode((prev) => !prev)}
            className={`rounded-lg border px-2.5 py-1.5 text-xs font-mono font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              isNewStudentEmptyMode
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-foreground hover:border-primary/50'
            }`}
            title="Toggle between populated student account and brand-new student empty state"
          >
            {isNewStudentEmptyMode
              ? 'Viewing: New Student Empty State'
              : 'Simulate New Student (Empty State)'}
          </button>
        </div>
      }
    >
      {/* TOP-LEVEL QUICK ACTIONS GRID */}
      <QuickActionsGrid onNavigate={(route) => navigate(route)} />

      {/* TOP-LEVEL STUDENT ACTIVITY STATS BAR */}
      <DashboardStats
        activeConnectionsCount={activeConnectionsCount}
        confirmedConnectionsCount={confirmedConnectionsCount}
        pendingConnectionsCount={pendingConnectionsCount}
        mentorshipSessionsCount={mentorshipSessionsCount}
        activeMentorTracksCount={visibleRequests.length}
        savedJobsCount={savedJobsCount}
        submittedApplicationsCount={visibleApplications.length}
        registeredEventsCount={registeredEventsCount}
      />

      {/* 1. STUDENT WELCOME & PROFILE COMPLETION STATUS HERO */}
      <section
        aria-label="Student Welcome and Profile Completion Status"
        className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 Cols: Welcome Narrative, Readiness Summary & Quick Actions */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-accent px-2.5 py-1 text-xs font-mono font-bold text-accent-foreground">
                <GraduationCap className="h-3.5 w-3.5 text-primary" />
                BS COMPUTER SCIENCE · COHORT ’26
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-stone px-2.5 py-1 text-xs font-mono font-semibold text-foreground"
                style={{ borderColor: `${color.burnishedGold}40` }}
              >
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                {readinessTier.badge}
              </span>
            </div>

            <div className="space-y-2.5">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground text-balance">
                Welcome back, Zainab. Build your bridge from Sukkur IBA to global industry.
              </h2>
              <p className="text-sm sm:text-base text-secondary leading-relaxed max-w-2xl">
                Connect with verified Sukkur IBA alumni mentors across 42 countries, book 1-on-1 office hours for your final-year capstone, and fast-track applications to alumni-referred internships.
              </p>
            </div>

            {/* Next-Best Action Banner */}
            {nextIncompleteStep ? (
              <div className="rounded-xl border border-primary/30 bg-accent/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-[11px] font-mono uppercase tracking-wider font-bold text-primary">
                    Next Recommended Milestone (+{nextIncompleteStep.points}% Readiness)
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {nextIncompleteStep.label}
                  </p>
                  <p className="text-xs text-secondary">
                    {nextIncompleteStep.helper}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => toggleChecklistItem(nextIncompleteStep.id)}
                  >
                    Mark Complete
                  </Button>
                  <Link
                    to={nextIncompleteStep.actionRoute}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-mono font-semibold text-foreground hover:border-primary transition-colors"
                  >
                    {nextIncompleteStep.actionLabel}
                    <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-primary/40 bg-accent/70 p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider font-bold text-primary">
                      100% Scholar Dossier Complete
                    </p>
                    <p className="text-xs text-secondary">
                      Your verified academic profile and CV packet are visible to Sukkur IBA alumni mentors and partner recruiters.
                    </p>
                  </div>
                </div>
                <Link
                  to="/profile"
                  className="text-xs font-mono font-semibold text-primary hover:underline shrink-0"
                >
                  View Public Dossier
                </Link>
              </div>
            )}

            {/* Quick Actions Bar */}
            <div className="pt-1 flex flex-wrap items-center gap-2.5">
              <Button onClick={() => navigate('/mentorship')}>
                <Compass className="h-4 w-4 mr-1.5" />
                Explore All Mentors
              </Button>
              <Button variant="outline" onClick={() => navigate('/alumni')}>
                <Users className="h-4 w-4 mr-1.5" />
                Alumni Directory
              </Button>
              <Button variant="outline" onClick={() => navigate('/jobs')}>
                <Briefcase className="h-4 w-4 mr-1.5" />
                Internships & Jobs
              </Button>
              <Button variant="ghost" onClick={() => navigate('/messages')}>
                <MessageSquare className="h-4 w-4 mr-1.5" />
                Messages
              </Button>
            </div>
          </div>

          {/* Right 5 Cols: Interactive Profile Completion Status Card */}
          <div className="lg:col-span-5">
            <ProfileCompletionCard
              completionPercentage={completionPercentage}
              checklist={completionChecklistItems}
              onToggleChecklistItem={toggleChecklistItem}
              completeProfileHref="/profile"
              isNewStudentEmptyMode={isNewStudentEmptyMode}
              onResetEmptyState={() => setIsNewStudentEmptyMode(false)}
            />
          </div>
        </div>
      </section>

      {/* Empty State Banner when New Student Mode is toggled */}
      <AnimatePresence>
        {isNewStudentEmptyMode && (
          <EmptyState
            variant="connections"
            badge="No Connections Yet"
            title="You haven't connected with any alumni or mentors yet"
            description="Welcome to Sukkur IBA AlumniConnect! Start by exploring recommended mentors below, requesting a 1-on-1 office hours slot, or registering for the upcoming Career Fair."
            actionLabel="Discover Sukkur IBA Alumni"
            onAction={() => navigate('/alumni')}
            secondaryActionLabel="Browse Available Mentors"
            onSecondaryAction={() => navigate('/mentorship')}
            className="border-primary/40"
          >
            <Button
              variant="ghost"
              onClick={() => setIsNewStudentEmptyMode(false)}
            >
              Restore Populated Student Data
            </Button>
          </EmptyState>
        )}
      </AnimatePresence>

      {/* 2. RECOMMENDED MENTOR CARDS SECTION */}
      <section aria-label="Recommended Mentors" className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-mono uppercase tracking-wider font-semibold text-primary">
              AI-Calibrated Department & Career Affinity Matches
            </p>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Recommended Alumni Mentors for You
            </h2>
            <p className="text-xs sm:text-sm text-secondary">
              Verified Sukkur IBA graduates offering 1-on-1 capstone code reviews, mock interviews, and graduate school guidance.
            </p>
          </div>

          {/* Mentor Filter Pills + Directory Link */}
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'ALL', label: 'All Matches' },
                { id: 'AVAILABLE', label: 'Open Slots Now' },
                { id: 'TECH_AI', label: 'Cloud & AI Systems' },
                { id: 'PRODUCT_FINTECH', label: 'Product & FinTech' },
              ] as const
            ).map((tab) => {
              const active = mentorFilter === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMentorFilter(tab.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-foreground hover:border-primary/50'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
            <Link
              to="/mentorship"
              className="inline-flex items-center gap-1 pl-2 text-xs font-mono font-semibold text-primary hover:underline"
            >
              Full Mentorship Hub
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMentors.slice(0, 3).map((mentor) => {
            const meta = MENTOR_MATCH_METADATA[mentor.id] ?? {
              matchScore: 90,
              matchReason: 'Matches your Sukkur IBA academic profile & target industry',
              alumId: '1',
              avatar:
                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=480&q=80',
            }
            const alumRecord = ALUMNI_DETAILED_CATALOG.find(
              (a) => a.id === meta.alumId,
            )
            const connState = isNewStudentEmptyMode
              ? undefined
              : connections[meta.alumId]
            const existingRequest = visibleRequests.find(
              (r) =>
                r.mentorId === mentor.id &&
                (r.status === 'PENDING' || r.status === 'ACTIVE'),
            )
            const openSlotsCount = Math.max(
              0,
              mentor.maxMentees - mentor.currentMentees,
            )
            const nextSlot = mentor.officeHoursSlots[0]

            return (
              <article
                key={mentor.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3.5">
                  {/* Top Row: Match Score Badge & Availability Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-accent px-2.5 py-1 font-mono text-[11px] font-bold text-accent-foreground">
                      <Sparkles className="h-3 w-3 text-primary" />
                      {meta.matchScore}% Affinity Match
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold ${
                        mentor.isAvailable && openSlotsCount > 0
                          ? 'border-primary/40 bg-primary/10 text-primary'
                          : 'border-gold/40 bg-gold/10 text-gold'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          mentor.isAvailable && openSlotsCount > 0
                            ? 'bg-primary'
                            : 'bg-gold'
                        }`}
                      />
                      {mentor.isAvailable && openSlotsCount > 0
                        ? `${openSlotsCount} ${openSlotsCount === 1 ? 'Slot' : 'Slots'} Open`
                        : 'Waitlist Open'}
                    </span>
                  </div>

                  {/* Mentor Identity Header */}
                  <div className="flex items-start gap-3.5">
                    <Link
                      to={`/alumni/${meta.alumId}`}
                      className="shrink-0 relative group"
                    >
                      <img
                        src={meta.avatar}
                        alt={mentor.name}
                        referrerPolicy="no-referrer"
                        className="h-14 w-14 rounded-xl object-cover ring-1 ring-border group-hover:ring-primary transition-all"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/alumni/${meta.alumId}`}
                        className="font-display text-base font-bold text-foreground hover:text-primary transition-colors block truncate"
                      >
                        {mentor.name}
                      </Link>
                      <p className="text-xs font-semibold text-foreground/90 truncate">
                        {mentor.role} · {mentor.company}
                      </p>
                      <p className="text-xs font-mono text-secondary mt-0.5">
                        Class of ’{String(mentor.classYear).slice(-2)} ·{' '}
                        {mentor.department}
                      </p>
                    </div>
                  </div>

                  {/* Why Recommended Box */}
                  <div className="rounded-xl border border-border bg-background p-3 space-y-1.5">
                    <p className="text-[11px] font-mono uppercase tracking-wider font-bold text-primary">
                      Featured Mentorship Topic
                    </p>
                    <p className="text-xs font-semibold text-foreground leading-snug">
                      {mentor.featuredTopic}
                    </p>
                    <p className="text-[11px] text-secondary leading-relaxed">
                      {meta.matchReason}
                    </p>
                  </div>

                  {/* Expertise Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {mentor.expertise.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md border border-border bg-stone px-2 py-0.5 font-mono text-[11px] font-medium text-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Telemetry Row: Location, Rating, Next Office Hours Slot */}
                  <div className="pt-1 space-y-1.5 text-xs font-mono text-secondary">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        {mentor.location}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                        <Star className="h-3.5 w-3.5 text-gold fill-gold" />
                        {mentor.avgRating.toFixed(1)} ({mentor.sessionsCompleted}{' '}
                        sessions)
                      </span>
                    </div>
                    {nextSlot && (
                      <div className="flex items-center gap-1.5 text-[11px] text-primary font-semibold">
                        <Video className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                          Next Office Hours: {nextSlot.dayLabel} ·{' '}
                          {nextSlot.timeLabel} {nextSlot.timezone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3.5 border-t border-border flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={existingRequest ? 'outline' : 'default'}
                      onClick={() => openMentorRequestModal(mentor)}
                    >
                      {existingRequest ? (
                        <>
                          <Clock className="h-3.5 w-3.5 mr-1 text-primary" />
                          {existingRequest.status === 'ACTIVE'
                            ? 'Active Mentor'
                            : 'Request Pending'}
                        </>
                      ) : (
                        <>
                          <Compass className="h-3.5 w-3.5 mr-1.5" />
                          Request Mentor
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleConnectAlumni(
                          meta.alumId,
                          alumRecord?.name ?? mentor.name,
                        )
                      }
                    >
                      {connState === 'CONNECTED' ? (
                        <>
                          <UserCheck className="h-3.5 w-3.5 mr-1 text-primary" />
                          Connected
                        </>
                      ) : connState === 'PENDING' ? (
                        <>
                          <Clock className="h-3.5 w-3.5 mr-1 text-primary" />
                          Sent
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-3.5 w-3.5 mr-1" />
                          Connect
                        </>
                      )}
                    </Button>
                  </div>

                  <Link
                    to={`/alumni/${meta.alumId}`}
                    className="text-xs font-mono font-semibold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Dossier
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* 3. SUMMARY SECTION FOR UPCOMING EVENTS & CAREER OPPORTUNITIES */}
      <section
        aria-label="Summary of Upcoming Events and Career Opportunities"
        className="space-y-5"
      >
        {/* Section Header + Executive Summary Strip */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-4">
            <div className="space-y-1">
              <p className="text-xs font-mono uppercase tracking-wider font-semibold text-primary">
                Campus & Industry Pulse
              </p>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Upcoming Events & Career Opportunities Summary
              </h2>
              <p className="text-xs sm:text-sm text-secondary">
                Track upcoming Sukkur IBA career fairs, alumni technical seminars, and referral-backed internships in one unified view.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to="/events"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono font-semibold text-foreground hover:border-primary transition-colors"
              >
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Events Calendar ({STUDENT_EVENTS.length})
              </Link>
              <Link
                to="/jobs"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono font-semibold text-foreground hover:border-primary transition-colors"
              >
                <Briefcase className="h-3.5 w-3.5 text-primary" />
                Career Board ({STUDENT_OPPORTUNITIES.length})
              </Link>
            </div>
          </div>

          {/* 3-Column Digest KPIs inside Summary Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-background p-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider font-semibold text-secondary">
                  Next Registered Event
                </p>
                <p className="font-display text-base font-bold text-foreground mt-1">
                  Nov 18 · Tech & FinTech Career Fair
                </p>
                <p className="text-xs font-mono text-primary mt-1">
                  {registeredEventsCount} of {STUDENT_EVENTS.length} campus events registered
                </p>
              </div>
              <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            </div>

            <div className="rounded-xl border border-border bg-background p-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider font-semibold text-secondary">
                  Top Alumni Referral Role
                </p>
                <p className="font-display text-base font-bold text-foreground mt-1">
                  98% Match · Graduate Cloud Engineer
                </p>
                <p className="text-xs font-mono text-primary mt-1">
                  {savedJobIds.length} saved · {visibleApplications.length} submitted
                </p>
              </div>
              <Briefcase className="h-5 w-5 text-gold shrink-0 mt-0.5" />
            </div>

            <div className="rounded-xl border border-border bg-background p-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider font-semibold text-secondary">
                  Active Referrals & Mentorships
                </p>
                <p className="font-display text-base font-bold text-foreground mt-1">
                  {visibleRequests.length + visibleApplications.length} Active Tracked Items
                </p>
                <p className="text-xs font-mono text-secondary mt-1">
                  Real-time status updates enabled
                </p>
              </div>
              <Award className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            </div>
          </div>

          {/* Side-by-Side Summary Columns: Upcoming Events (Left 6) & Career Opportunities (Right 6) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            {/* LEFT 6 COLS: Upcoming University & Networking Events Summary */}
            <div className="lg:col-span-6 rounded-xl border border-border bg-background p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-primary">
                      Workshops, Seminars & Fairs
                    </span>
                    <h3 className="font-display text-lg font-bold text-foreground">
                      Upcoming Campus & Alumni Events
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
                    <button
                      type="button"
                      onClick={() => setEventsViewFilter('ALL')}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                        eventsViewFilter === 'ALL'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-secondary hover:text-foreground'
                      }`}
                    >
                      All ({STUDENT_EVENTS.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setEventsViewFilter('REGISTERED_SAVED')}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                        eventsViewFilter === 'REGISTERED_SAVED'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-secondary hover:text-foreground'
                      }`}
                    >
                      Registered ({registeredEventsCount})
                    </button>
                  </div>
                </div>

                {displayedEvents.length === 0 ? (
                  <EmptyState
                    compact
                    variant="events"
                    title="No Registered Events Yet"
                    description="Switch back to All Events to reserve your seat for upcoming workshops and career fairs."
                    actionLabel="Show All Events"
                    onAction={() => setEventsViewFilter('ALL')}
                  />
                ) : (
                  <div className="space-y-3">
                    {displayedEvents.map((ev) => {
                      const isReg =
                        !isNewStudentEmptyMode &&
                        registeredEventIds.includes(ev.id)
                      return (
                        <article
                          key={ev.id}
                          className="rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors flex items-start gap-3.5"
                        >
                          {/* Date Calendar Badge */}
                          <div className="h-14 w-14 rounded-xl border border-primary/25 bg-accent flex flex-col items-center justify-center shrink-0 text-center">
                            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
                              {ev.monthShort}
                            </span>
                            <span className="font-display text-lg font-bold text-foreground leading-none mt-0.5 tabular-nums">
                              {ev.dayNum}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1 space-y-1.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-mono text-[11px] font-bold text-primary">
                                {ev.category}
                              </span>
                              <span className="font-mono text-[11px] text-secondary tabular-nums">
                                {ev.seatsRemaining} seats left
                              </span>
                            </div>

                            <Link
                              to={`/events/${ev.id}`}
                              className="font-display text-sm sm:text-base font-bold text-foreground hover:text-primary transition-colors block leading-snug"
                            >
                              {ev.title}
                            </Link>

                            <p className="text-xs text-secondary">
                              {ev.timeLabel} · {ev.format}
                            </p>
                            <p className="text-[11px] font-mono text-secondary">
                              Host: {ev.organizer}
                            </p>

                            <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                              <Button
                                size="sm"
                                variant={isReg ? 'outline' : 'default'}
                                onClick={() => handleToggleEventRegistration(ev)}
                              >
                                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                {isReg ? 'Registered · Cancel' : 'Register Seat'}
                              </Button>

                              <Link
                                to={`/events/${ev.id}`}
                                className="text-xs font-mono font-semibold text-primary hover:underline inline-flex items-center gap-1"
                              >
                                Event Details
                                <ArrowUpRight className="h-3 w-3" />
                              </Link>
                            </div>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-mono">
                <span className="text-secondary">
                  Automatic PKT calendar reminders active
                </span>
                <Link
                  to="/events"
                  className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  View All Events
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* RIGHT 6 COLS: Career Opportunities & Internships Summary */}
            <div className="lg:col-span-6 rounded-xl border border-border bg-background p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-primary">
                      Alumni-Referred Roles & Internships
                    </span>
                    <h3 className="font-display text-lg font-bold text-foreground">
                      Career Opportunities Summary
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
                    <button
                      type="button"
                      onClick={() => setOpportunitiesViewFilter('ALL')}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                        opportunitiesViewFilter === 'ALL'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-secondary hover:text-foreground'
                      }`}
                    >
                      All ({STUDENT_OPPORTUNITIES.length})
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setOpportunitiesViewFilter('REGISTERED_SAVED')
                      }
                      className={`rounded-md px-2.5 py-1 text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                        opportunitiesViewFilter === 'REGISTERED_SAVED'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-secondary hover:text-foreground'
                      }`}
                    >
                      Saved ({savedJobIds.length})
                    </button>
                  </div>
                </div>

                {displayedOpportunities.length === 0 ? (
                  <EmptyState
                    compact
                    variant="jobs"
                    title="No Jobs Found in Saved List"
                    description="Bookmark internships or graduate roles to compare deadlines and alumni referrers here."
                    actionLabel="Show All Opportunities"
                    onAction={() => setOpportunitiesViewFilter('ALL')}
                  />
                ) : (
                  <div className="space-y-3">
                    {displayedOpportunities.map((opp) => {
                      const isSaved = savedJobIds.includes(opp.id)
                      const appRecord = visibleApplications.find(
                        (a) => a.jobId === opp.id,
                      )

                      return (
                        <article
                          key={opp.id}
                          className="rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors space-y-2.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-md bg-accent px-2 py-0.5 font-bold text-accent-foreground text-[11px]">
                                {opp.type}
                              </span>
                              <span className="font-semibold text-foreground">
                                {opp.company}
                              </span>
                              <span className="text-secondary">
                                · {opp.location}
                              </span>
                            </div>
                            <span className="font-bold text-primary text-[11px]">
                              {opp.matchScore}% Skill Match
                            </span>
                          </div>

                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link
                                to={`/jobs/${opp.id}`}
                                className="font-display text-sm sm:text-base font-bold text-foreground hover:text-primary transition-colors block leading-snug"
                              >
                                {opp.title}
                              </Link>
                              <p className="text-xs font-mono text-secondary mt-0.5">
                                {opp.stipend} · Referrer: {opp.postedBy} (
                                {opp.postedByClass})
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleToggleSaveJob(opp.id, opp.title)
                              }
                              aria-label={`Save ${opp.title}`}
                              className={`p-2 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                                isSaved
                                  ? 'border-primary bg-primary/15 text-primary'
                                  : 'border-border bg-background text-foreground hover:border-primary/50'
                              }`}
                            >
                              <Bookmark
                                className={`h-4 w-4 ${
                                  isSaved ? 'fill-primary' : ''
                                }`}
                              />
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            {opp.skills.map((skill) => (
                              <span
                                key={skill}
                                className="rounded border border-border bg-stone px-2 py-0.5 font-mono text-[10px] text-foreground"
                              >
                                {skill}
                              </span>
                            ))}
                            <span className="ml-auto font-mono text-[11px] text-secondary">
                              Due {opp.deadline} ({opp.daysLeft}d left)
                            </span>
                          </div>

                          <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant={appRecord ? 'outline' : 'default'}
                                onClick={() => handleApplyToOpportunity(opp)}
                              >
                                {appRecord
                                  ? `Status: ${appRecord.status}`
                                  : 'Quick Apply'}
                              </Button>

                              {opp.externalUrl ? (
                                <a
                                  href={opp.externalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-mono font-semibold text-foreground hover:border-primary transition-colors"
                                >
                                  External Portal
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : null}
                            </div>

                            <Link
                              to={`/jobs/${opp.id}`}
                              className="text-xs font-mono font-semibold text-primary hover:underline inline-flex items-center gap-1"
                            >
                              Role Brief
                              <ArrowUpRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-mono">
                <span className="text-secondary">
                  Direct alumni referral routing enabled
                </span>
                <Link
                  to="/jobs"
                  className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  Browse All Opportunities
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LIVE APPLICATION & MENTORSHIP LEDGER + RECENT ACTIVITY NOTIFICATIONS */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Job Application Tracker + Live Mentorship Requests */}
        <div className="lg:col-span-7 space-y-6">
          <JobApplicationTracker
            items={trackedJobItems}
            onStatusChange={handleUpdateTrackedJobStatus}
            onExploreJobs={() => navigate('/jobs')}
          />

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider font-semibold text-primary">
                  Live Mentorship Ledger
                </p>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Active Mentorship Requests
                </h2>
              </div>
              <Link
                to="/mentorship"
                className="text-xs font-mono font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                Mentorship Hub
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {visibleRequests.length === 0 ? (
              <EmptyState
                compact
                icon={FileText}
                title="No Active Mentorship Requests Yet"
                description='Use "Request Mentor" above to book 1-on-1 office hours or semester mentorship.'
                actionLabel="Explore Mentors"
                onAction={() => navigate('/mentorship')}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {visibleRequests.slice(0, 4).map((req) => (
                  <div
                    key={req.id}
                    className="rounded-xl border border-border bg-background p-4 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="rounded-full border border-primary/30 bg-accent px-2.5 py-0.5 text-primary font-bold text-[10px]">
                        MENTORSHIP · {req.status}
                      </span>
                      <span className="text-secondary tabular-nums">
                        {req.requestedAt}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-foreground">
                      {req.mentorName}
                    </p>
                    <p className="text-xs text-secondary line-clamp-2">
                      {req.goal}
                    </p>
                    {req.slotLabel && (
                      <p className="text-[11px] font-mono text-primary pt-1">
                        Slot: {req.slotLabel}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Cols: Recent Notifications & Connection Activity (List View + Slide-Over Trigger) */}
        <div className="lg:col-span-5">
          <Notifications
            items={notifications}
            isEmptyMode={isNewStudentEmptyMode}
            onMarkAllRead={handleMarkAllNotificationsRead}
            onToggleRead={handleToggleNotificationRead}
            onRespondConnection={handleRespondConnectionNotification}
            onAcknowledgeReminder={handleAcknowledgeEventReminder}
            onOpenSlideOver={() => setIsNotificationsSlideOverOpen(true)}
          />
        </div>
      </section>

      {/* CAMPUS NEWS CARDS GRID */}
      <CampusNewsTicker />

      {/* SLIDE-OVER NOTIFICATIONS PANEL */}
      <NotificationsSlideOver
        open={isNotificationsSlideOverOpen}
        onClose={() => setIsNotificationsSlideOverOpen(false)}
        items={notifications}
        isEmptyMode={isNewStudentEmptyMode}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onToggleRead={handleToggleNotificationRead}
        onRespondConnection={handleRespondConnectionNotification}
        onAcknowledgeReminder={handleAcknowledgeEventReminder}
      />

      {/* INTERACTIVE MENTORSHIP REQUEST MODAL */}
      <AnimatePresence>
        {activeMentorModal && (
          <div
            className="fixed inset-0 z-modal flex items-center justify-center bg-obsidian/70 p-4 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-mentor-modal-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-card-hover space-y-5"
            >
              <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider font-bold text-primary">
                    Sukkur IBA Mentorship Request
                  </p>
                  <h3
                    id="student-mentor-modal-title"
                    className="font-display text-xl font-bold text-foreground"
                  >
                    Request Session with {activeMentorModal.name}
                  </h3>
                  <p className="text-xs text-secondary mt-0.5">
                    {activeMentorModal.headline}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveMentorModal(null)}
                  aria-label="Close modal"
                  className="rounded-lg border border-border p-1.5 text-secondary hover:text-foreground cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitMentorshipModal} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider font-semibold text-foreground block">
                    1. Select Mentorship Format
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setRequestMode('OFFICE_HOURS')}
                      className={`rounded-xl border p-3 text-left transition-colors cursor-pointer ${
                        requestMode === 'OFFICE_HOURS'
                          ? 'border-primary bg-accent text-foreground'
                          : 'border-border bg-background text-secondary hover:text-foreground'
                      }`}
                    >
                      <p className="font-mono text-xs font-bold text-primary">
                        1-on-1 Office Hours
                      </p>
                      <p className="text-xs mt-0.5">
                        45-min focused capstone, CV, or mock interview review
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRequestMode('LONG_TERM')}
                      className={`rounded-xl border p-3 text-left transition-colors cursor-pointer ${
                        requestMode === 'LONG_TERM'
                          ? 'border-primary bg-accent text-foreground'
                          : 'border-border bg-background text-secondary hover:text-foreground'
                      }`}
                    >
                      <p className="font-mono text-xs font-bold text-primary">
                        Semester Mentorship
                      </p>
                      <p className="text-xs mt-0.5">
                        Bi-weekly milestone coaching across 12 weeks
                      </p>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="mentor-slot-select"
                    className="text-xs font-mono uppercase tracking-wider font-semibold text-foreground block"
                  >
                    2. Preferred Office Hours Slot
                  </label>
                  <select
                    id="mentor-slot-select"
                    value={selectedSlotLabel}
                    onChange={(e) => setSelectedSlotLabel(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-mono text-foreground"
                  >
                    {activeMentorModal.officeHoursSlots.map((slot) => {
                      const label = `${slot.dayLabel} · ${slot.timeLabel} ${slot.timezone} (${slot.format})`
                      return (
                        <option key={slot.id} value={label}>
                          {label}
                        </option>
                      )
                    })}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="mentor-goal-textarea"
                    className="text-xs font-mono uppercase tracking-wider font-semibold text-foreground block"
                  >
                    3. Your Mentorship Goal & Preparation Agenda
                  </label>
                  <textarea
                    id="mentor-goal-textarea"
                    rows={3}
                    value={requestGoalText}
                    onChange={(e) => setRequestGoalText(e.target.value)}
                    placeholder="Share your target role, capstone topic, or specific questions..."
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveMentorModal(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Submit Mentorship Request</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </RoleShell>
  )
}

export {
  StudentDashboardPage as StudentDashboard,
  Notifications,
  NotificationsSlideOver,
  EmptyState,
  ProfileCompletionCard,
  JobApplicationTracker,
}


