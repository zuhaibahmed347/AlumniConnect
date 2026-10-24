import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import {
  UserPlus,
  ArrowUpRight,
  Clock,
  Bookmark,
  CheckCircle2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input, SelectField } from '@/components/ui/input'
import {
  JobApplicationTracker,
  type JobTrackerStatus,
  type TrackedJobItem,
} from '@/components/ui/job-application-tracker'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { GlobalSearchTrigger } from '@/components/ui/global-search-bar'
import {
  loadJobApplications,
  saveJobApplications,
  type StudentJobApplication,
} from '@/lib/role-context'
import { toast } from '@/lib/toast'
import {
  JobBoardFilter,
  SUKKUR_IBA_JOB_LISTINGS,
  filterAndSortJobs,
  type AlumniJobListing,
  type JobBoardFilterState,
  type JobSector,
  type ExperienceLevel,
  type WorkplaceMode,
} from '@/components/ui/job-board-filter'

const reorderSpring = {
  type: 'spring' as const,
  stiffness: 310,
  damping: 28,
  mass: 0.85,
}

export function JobsPage() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<AlumniJobListing[]>(SUKKUR_IBA_JOB_LISTINGS)
  const [savedJobIds, setSavedJobIds] = useState<string[]>(['1', '4'])
  const [applications, setApplications] = useState<StudentJobApplication[]>(() =>
    loadJobApplications()
  )
  const [requestedReferralIds, setRequestedReferralIds] = useState<string[]>([])
  const [showPostModal, setShowPostModal] = useState(false)

  const [filters, setFilters] = useState<JobBoardFilterState>({
    search: '',
    sector: 'ALL',
    experienceLevel: 'ALL',
    workplaceMode: 'ALL',
    employmentType: 'ALL',
    sortBy: 'RECOMMENDED',
    viewMode: 'grid',
  })

  const [newRoleForm, setNewRoleForm] = useState({
    title: '',
    company: '',
    location: 'Remote · Karachi / Global',
    sector: 'AI_CLOUD' as Exclude<JobSector, 'ALL'>,
    experienceLevel: 'MID_SENIOR' as Exclude<ExperienceLevel, 'ALL'>,
    workplaceMode: 'REMOTE' as Exclude<WorkplaceMode, 'ALL'>,
    salaryMax: '140000',
    referrerName: 'Engr. Tariq Mahmood (BSCS ’15)',
    techStack: 'TypeScript, React, Go, Kubernetes',
    description: '',
  })

  const filteredJobs = useMemo(
    () => filterAndSortJobs(jobs, filters),
    [jobs, filters]
  )

  const sectorCounts = useMemo(() => {
    const counts: Record<JobSector, number> = {
      ALL: jobs.length,
      AI_CLOUD: 0,
      FINTECH: 0,
      DATA_ANALYTICS: 0,
      PRODUCT_DESIGN: 0,
      ENTERPRISE: 0,
    }
    for (const job of jobs) {
      counts[job.sector] = (counts[job.sector] || 0) + 1
    }
    return counts
  }, [jobs])

  const workplaceCounts = useMemo(() => {
    const counts: Record<WorkplaceMode, number> = {
      ALL: jobs.length,
      REMOTE: 0,
      HYBRID: 0,
      ON_SITE: 0,
    }
    for (const job of jobs) {
      counts[job.workplaceMode] = (counts[job.workplaceMode] || 0) + 1
    }
    return counts
  }, [jobs])

  const trackedJobItems: TrackedJobItem[] = useMemo(() => {
    const items: TrackedJobItem[] = applications.map((app) => {
      const matchedJob = jobs.find((j) => j.id === app.jobId)
      return {
        id: app.id,
        jobId: app.jobId,
        jobTitle: app.jobTitle,
        company: app.company,
        location: app.location,
        employmentType: app.employmentType,
        updatedAt: app.appliedAt,
        status: app.status,
        referrer: matchedJob
          ? `${matchedJob.referrerName} (${matchedJob.referrerCohort})`
          : undefined,
      }
    })

    for (const savedId of savedJobIds) {
      const alreadyTracked = applications.some((a) => a.jobId === savedId)
      if (!alreadyTracked) {
        const matchedJob = jobs.find((j) => j.id === savedId)
        if (matchedJob) {
          items.push({
            id: `saved-${matchedJob.id}`,
            jobId: matchedJob.id,
            jobTitle: matchedJob.title,
            company: matchedJob.company,
            location: matchedJob.location,
            employmentType: matchedJob.employmentLabel,
            updatedAt: 'Bookmarked',
            status: 'SAVED',
            referrer: `${matchedJob.referrerName} (${matchedJob.referrerCohort})`,
          })
        }
      }
    }

    return items
  }, [applications, savedJobIds, jobs])

  const handleUpdateTrackedJobStatus = (
    itemId: string,
    nextStatus: JobTrackerStatus
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
      const matchedJob = jobs.find((j) => j.id === jobId)
      if (!matchedJob || nextStatus === 'SAVED') return
      const newApp: StudentJobApplication = {
        id: `app-${Date.now()}`,
        jobId: matchedJob.id,
        jobTitle: matchedJob.title,
        company: matchedJob.company,
        location: matchedJob.location,
        employmentType: matchedJob.employmentType,
        appliedAt: new Date().toISOString().slice(0, 10),
        status: statusMap[nextStatus],
        applicantName: 'Zainab Magsi',
        applicantEmail: 'zainab.magsi.bscs22@iba-suk.edu.pk',
        applicantMajor: 'BS Computer Science',
        applicantGradYear: 2026,
        applicantGpa: '3.76 / 4.00',
        resumeUrl: 'https://iba-suk.edu.pk/portfolios/zainab-magsi-cv.pdf',
        coverNote: `Tracked via Job Application Tracker (${nextStatus}).`,
        skills: matchedJob.techStack,
      }
      const next = [newApp, ...applications]
      setApplications(next)
      saveJobApplications(next)
      toast.success(`Updated "${matchedJob.title}" status to ${nextStatus}`)
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
      app.id === itemId ? { ...app, status: statusMap[nextStatus] } : app
    )
    setApplications(updated)
    saveJobApplications(updated)
    toast.success('Job application status updated.')
  }

  const toggleSaveJob = (e: React.MouseEvent, job: AlumniJobListing) => {
    e.stopPropagation()
    const isAlreadySaved = savedJobIds.includes(job.id)
    setSavedJobIds((prev) =>
      isAlreadySaved ? prev.filter((id) => id !== job.id) : [...prev, job.id]
    )
    toast.success(
      isAlreadySaved
        ? `Removed "${job.title}" from saved roles`
        : `Saved "${job.title}" at ${job.company}`
    )
  }

  const handleRequestReferral = (
    e: React.MouseEvent,
    job: AlumniJobListing
  ) => {
    e.stopPropagation()
    if (requestedReferralIds.includes(job.id)) {
      navigate(`/jobs/${job.id}`)
      return
    }
    setRequestedReferralIds((prev) => [...prev, job.id])
    toast.success(
      `Referral request sent to ${job.referrerName} (${job.referrerCohort})`
    )
  }

  const handlePostRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoleForm.title.trim() || !newRoleForm.company.trim()) {
      toast.error('Please enter both a role title and partner company name.')
      return
    }

    const sectorMap: Record<Exclude<JobSector, 'ALL'>, string> = {
      AI_CLOUD: 'AI & Cloud Infrastructure',
      FINTECH: 'FinTech & Digital Banking',
      DATA_ANALYTICS: 'Data Science & Analytics',
      PRODUCT_DESIGN: 'Product & Experience Design',
      ENTERPRISE: 'Enterprise & Cybersecurity',
    }

    const levelMap: Record<Exclude<ExperienceLevel, 'ALL'>, string> = {
      ENTRY: 'Entry & Associate (0–2 yrs)',
      MID_SENIOR: 'Mid–Senior (3–6 yrs)',
      STAFF_PRINCIPAL: 'Staff & Principal (7+ yrs)',
      EXECUTIVE: 'Executive / VP (10+ yrs)',
    }

    const workplaceMap: Record<Exclude<WorkplaceMode, 'ALL'>, string> = {
      REMOTE: 'Remote (Global)',
      HYBRID: 'Hybrid (2–3 days in office)',
      ON_SITE: 'On-Site Campus / HQ',
    }

    const maxComp = Number(newRoleForm.salaryMax) || 135000
    const minComp = Math.max(35000, maxComp - 30000)

    const createdJob: AlumniJobListing = {
      id: String(Date.now()),
      title: newRoleForm.title.trim(),
      company: newRoleForm.company.trim(),
      companyLogoUrl: '/images/logos/ai-innovations.jpg',
      companyWebsite: 'https://iba-suk.edu.pk',
      sector: newRoleForm.sector,
      sectorLabel: sectorMap[newRoleForm.sector],
      experienceLevel: newRoleForm.experienceLevel,
      experienceLabel: levelMap[newRoleForm.experienceLevel],
      workplaceMode: newRoleForm.workplaceMode,
      workplaceLabel: workplaceMap[newRoleForm.workplaceMode],
      employmentType: 'FULL_TIME',
      employmentLabel: 'Full-Time',
      location: newRoleForm.location.trim() || 'Karachi, Pakistan',
      isRemote: newRoleForm.workplaceMode === 'REMOTE',
      salaryMin: minComp,
      salaryMax: maxComp,
      salaryCurrency: 'USD',
      compensationDisplay: `$${Math.round(minComp / 1000)}k – $${Math.round(
        maxComp / 1000
      )}k · Equity`,
      referralTurnaroundHours: 12,
      referrerName: newRoleForm.referrerName.split('(')[0].trim(),
      referrerCohort: 'BSCS ’15',
      referrerRole: 'Alumni Hiring Lead',
      referrerAvatar: '/images/avatars/aamir.jpg',
      description:
        newRoleForm.description.trim() ||
        'Direct alumni-referred opportunity for Sukkur IBA University graduates with fast-tracked technical interviews.',
      requirements:
        'Strong fundamentals in distributed systems, product engineering, and cross-functional collaboration.',
      benefits:
        'Competitive USD compensation, flexible work arrangement, and direct Sukkur IBA alumni mentorship.',
      techStack: newRoleForm.techStack
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 5),
      status: 'ACTIVE',
      postedAt: new Date().toISOString(),
      expiresAt: new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 45
      ).toISOString(),
      applications: 1,
      featuredScore: 100,
      externalApplyUrl: 'https://iba-suk.edu.pk',
    }

    setJobs((prev) => [createdJob, ...prev])
    setShowPostModal(false)
    setNewRoleForm({
      title: '',
      company: '',
      location: 'Remote · Karachi / Global',
      sector: 'AI_CLOUD',
      experienceLevel: 'MID_SENIOR',
      workplaceMode: 'REMOTE',
      salaryMax: '140000',
      referrerName: 'Engr. Tariq Mahmood (BSCS ’15)',
      techStack: 'TypeScript, React, Go, Kubernetes',
      description: '',
    })
    toast.success(`Published "${createdJob.title}" to the Alumni Job Board.`)
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Sticky Glassmorphic Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="page-container py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/"
              className="text-xs font-mono uppercase tracking-wider text-primary hover:underline shrink-0"
            >
              Sukkur IBA Alumni
            </Link>
            <span aria-hidden="true" className="text-border">
              /
            </span>
            <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight truncate">
              Direct Referral Job Board
            </h1>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to="/dashboard"
              className="hidden md:inline-flex text-xs font-medium text-secondary hover:text-foreground transition-colors px-2.5 py-1.5"
            >
              Member Dashboard
            </Link>
            <GlobalSearchTrigger compact />
            <ThemeSwitcher />
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowPostModal(true)}
            >
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              Post Referral Role
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="page-container py-8 sm:py-10 space-y-8">
        {/* Editorial Intro & Live Telemetry Strip */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-secondary mb-2.5">
              <span className="text-primary font-semibold uppercase tracking-wider">
                Verified Alumni Hiring Network
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{jobs.length} Active Roles</span>
              <span aria-hidden="true">·</span>
              <span>Direct Internal Referrals</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance">
              Skip cold queues with direct referrals from Sukkur IBA scholars.
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs text-secondary border-l-2 border-primary/40 pl-4 py-1">
            <div>
              <p className="font-mono uppercase tracking-wider text-[11px] text-secondary/80">
                Avg Referral SLA
              </p>
              <p className="font-mono text-base font-bold text-foreground tabular-nums">
                18 Hours
              </p>
            </div>
            <span aria-hidden="true" className="text-border">
              ·
            </span>
            <div>
              <p className="font-mono uppercase tracking-wider text-[11px] text-secondary/80">
                Saved Roles
              </p>
              <p className="font-mono text-base font-bold text-primary tabular-nums">
                {savedJobIds.length} Bookmarked
              </p>
            </div>
            <span aria-hidden="true" className="text-border">
              ·
            </span>
            <div>
              <p className="font-mono uppercase tracking-wider text-[11px] text-secondary/80">
                Referrals Requested
              </p>
              <p className="font-mono text-base font-bold text-foreground tabular-nums">
                {requestedReferralIds.length} Sent
              </p>
            </div>
          </div>
        </section>

        {/* Student Job Application & Saved Roles Status-Pill Tracker */}
        <JobApplicationTracker
          items={trackedJobItems}
          onStatusChange={handleUpdateTrackedJobStatus}
        />

        {/* Advanced Framer Motion Multi-Facet Filter Bar */}
        <JobBoardFilter
          filters={filters}
          onChange={setFilters}
          totalCount={jobs.length}
          filteredCount={filteredJobs.length}
          sectorCounts={sectorCounts}
          workplaceCounts={workplaceCounts}
        />

        {/* Animated Reordering Job Board List / Grid */}
        <LayoutGroup id="sukkur-iba-job-board">
          <motion.section
            layout
            transition={reorderSpring}
            aria-label="Filtered alumni job opportunities"
            className={
              filters.viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            <AnimatePresence mode="popLayout">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => {
                  const isSaved = savedJobIds.includes(job.id)
                  const isReferralRequested = requestedReferralIds.includes(
                    job.id
                  )

                  return (
                    <motion.article
                      key={job.id}
                      layout
                      layoutId={`job-card-${job.id}`}
                      initial={{ opacity: 0, scale: 0.94, y: 18 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: -12 }}
                      whileHover={{
                        y: -4,
                        transition: {
                          type: 'spring',
                          stiffness: 340,
                          damping: 24,
                        },
                      }}
                      transition={reorderSpring}
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      className={`group rounded-2xl border border-border bg-card p-6 shadow-card hover:border-primary/45 transition-colors cursor-pointer flex ${
                        filters.viewMode === 'list'
                          ? 'flex-col lg:flex-row lg:items-center justify-between gap-6'
                          : 'flex-col justify-between'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        {/* Quiet Unboxed Metadata Header (Zero-Pill Discipline) */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-secondary mb-3">
                          <div className="flex flex-wrap items-center gap-1.5 font-mono">
                            <span className="text-primary font-semibold">
                              {job.sectorLabel}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{job.workplaceLabel}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => toggleSaveJob(e, job)}
                            aria-label={
                              isSaved ? 'Remove bookmark' : 'Bookmark job'
                            }
                            className={`inline-flex items-center gap-1 text-xs font-mono transition-colors ${
                              isSaved
                                ? 'text-primary font-semibold'
                                : 'text-secondary hover:text-foreground'
                            }`}
                          >
                            <Bookmark
                              className={`h-3.5 w-3.5 ${
                                isSaved ? 'fill-current' : ''
                              }`}
                            />
                            <span>{isSaved ? 'Saved' : 'Save'}</span>
                          </button>
                        </div>

                        {/* Company Logo & Role Headline */}
                        <div className="flex items-start gap-3.5 mb-3.5">
                          <img
                            src={job.companyLogoUrl}
                            alt={job.company}
                            referrerPolicy="no-referrer"
                            className="w-11 h-11 rounded-xl object-cover ring-1 ring-border shrink-0 mt-0.5"
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                              {job.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-secondary mt-1">
                              <span className="font-semibold text-foreground/90">
                                {job.company}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{job.location}</span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono">
                                {job.experienceLabel}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Concise Description */}
                        <p className="text-xs sm:text-sm text-secondary leading-relaxed mb-4 line-clamp-2">
                          {job.description}
                        </p>

                        {/* Unboxed Technical Stack & Compensation Line */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono text-secondary/90 mb-4">
                          <span className="font-semibold text-foreground tabular-nums">
                            {job.compensationDisplay}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{job.techStack.join(' / ')}</span>
                        </div>
                      </div>

                      {/* Referrer Attribution & Action Footer */}
                      <div
                        className={
                          filters.viewMode === 'list'
                            ? 'lg:w-72 lg:border-l lg:border-border/80 lg:pl-6 flex flex-col justify-between gap-3 shrink-0'
                            : 'pt-4 border-t border-border/80 flex items-center justify-between gap-3'
                        }
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">
                            Referrer: {job.referrerName}{' '}
                            <span className="font-mono text-primary">
                              ({job.referrerCohort})
                            </span>
                          </p>
                          <p className="text-[11px] text-secondary font-mono flex items-center gap-1.5 mt-0.5 tabular-nums">
                            <Clock className="h-3 w-3 text-primary shrink-0" />
                            <span>
                              ~{job.referralTurnaroundHours}h referral response
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <motion.button
                            type="button"
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={(e) => handleRequestReferral(e, job)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-1.5 whitespace-nowrap ${
                              isReferralRequested
                                ? 'bg-stone text-primary border border-primary/30'
                                : 'bg-primary text-white hover:bg-primary/90 shadow-sm'
                            }`}
                          >
                            {isReferralRequested ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Referral Requested
                              </>
                            ) : (
                              <>
                                Request Referral
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </motion.article>
                  )
                })
              ) : (
                <div key="empty-job-board-state" className="col-span-full my-4">
                  <EmptyState
                    variant="jobs"
                    badge="No Jobs Found"
                    title="No alumni-referred roles match this exact filter combination"
                    description={`Try broadening your selected sector, experience level, or workplace mode to explore all ${jobs.length} active referral openings.`}
                    actionLabel="Reset All Job Filters"
                    onAction={() =>
                      setFilters({
                        ...filters,
                        search: '',
                        sector: 'ALL',
                        experienceLevel: 'ALL',
                        workplaceMode: 'ALL',
                        employmentType: 'ALL',
                      })
                    }
                    className="max-w-xl mx-auto"
                  />
                </div>
              )}
            </AnimatePresence>
          </motion.section>
        </LayoutGroup>
      </div>

      {/* Post New Alumni Referral Role Modal */}
      <AnimatePresence>
        {showPostModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowPostModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-primary mb-1">
                    Alumni Hiring Initiative
                  </p>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Post a Referral Opportunity
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  aria-label="Close modal"
                  className="p-1.5 rounded-lg text-secondary hover:text-foreground hover:bg-stone transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handlePostRoleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1.5">
                    Role Title
                  </label>
                  <Input
                    required
                    value={newRoleForm.title}
                    onChange={(e) =>
                      setNewRoleForm({ ...newRoleForm, title: e.target.value })
                    }
                    placeholder="e.g., Staff Backend Engineer (Core Ledger)"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1.5">
                      Company Name
                    </label>
                    <Input
                      required
                      value={newRoleForm.company}
                      onChange={(e) =>
                        setNewRoleForm({
                          ...newRoleForm,
                          company: e.target.value,
                        })
                      }
                      placeholder="e.g., Careem / Stripe / Systems"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1.5">
                      City / Region
                    </label>
                    <Input
                      value={newRoleForm.location}
                      onChange={(e) =>
                        setNewRoleForm({
                          ...newRoleForm,
                          location: e.target.value,
                        })
                      }
                      placeholder="Karachi / Dubai / Remote"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1.5">
                      Sector
                    </label>
                    <SelectField
                      value={newRoleForm.sector}
                      onChange={(e) =>
                        setNewRoleForm({
                          ...newRoleForm,
                          sector: e.target.value as Exclude<JobSector, 'ALL'>,
                        })
                      }
                    >
                      <option value="AI_CLOUD">AI & Cloud</option>
                      <option value="FINTECH">FinTech</option>
                      <option value="DATA_ANALYTICS">Data Science</option>
                      <option value="PRODUCT_DESIGN">Product & Design</option>
                      <option value="ENTERPRISE">Enterprise</option>
                    </SelectField>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1.5">
                      Experience Level
                    </label>
                    <SelectField
                      value={newRoleForm.experienceLevel}
                      onChange={(e) =>
                        setNewRoleForm({
                          ...newRoleForm,
                          experienceLevel: e.target.value as Exclude<
                            ExperienceLevel,
                            'ALL'
                          >,
                        })
                      }
                    >
                      <option value="ENTRY">Entry & Associate</option>
                      <option value="MID_SENIOR">Mid–Senior</option>
                      <option value="STAFF_PRINCIPAL">Staff & Principal</option>
                      <option value="EXECUTIVE">Executive / VP</option>
                    </SelectField>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1.5">
                      Workplace Mode
                    </label>
                    <SelectField
                      value={newRoleForm.workplaceMode}
                      onChange={(e) =>
                        setNewRoleForm({
                          ...newRoleForm,
                          workplaceMode: e.target.value as Exclude<
                            WorkplaceMode,
                            'ALL'
                          >,
                        })
                      }
                    >
                      <option value="REMOTE">Remote</option>
                      <option value="HYBRID">Hybrid</option>
                      <option value="ON_SITE">On-Site</option>
                    </SelectField>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1.5">
                      Target Max Salary (USD)
                    </label>
                    <Input
                      type="number"
                      value={newRoleForm.salaryMax}
                      onChange={(e) =>
                        setNewRoleForm({
                          ...newRoleForm,
                          salaryMax: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1.5">
                      Primary Tech Stack
                    </label>
                    <Input
                      value={newRoleForm.techStack}
                      onChange={(e) =>
                        setNewRoleForm({
                          ...newRoleForm,
                          techStack: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1.5">
                    Role Summary & Referral Notes
                  </label>
                  <Input
                    value={newRoleForm.description}
                    onChange={(e) =>
                      setNewRoleForm({
                        ...newRoleForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="What will this graduate build, and what should candidates highlight?"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPostModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="default">
                    Publish Role to Board
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}