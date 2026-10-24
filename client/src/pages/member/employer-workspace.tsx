import { RoleShell } from '@/components/layout/role-shell'
import { Button } from '@/components/ui/button'
import { Input, SelectField } from '@/components/ui/input'
import {
  loadEmployerJobs,
  loadEmployerOrg,
  loadJobApplications,
  saveEmployerJobs,
  saveEmployerOrg,
  saveJobApplications,
  type EmployerJobPosting,
  type EmployerOrganizationProfile,
  type StudentJobApplication,
} from '@/lib/role-context'
import { toast } from '@/lib/toast'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Eye,
  FileText,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'

type EmployerTab =
  | 'DASHBOARD'
  | 'ORGANIZATION'
  | 'JOBS'
  | 'APPLICANTS'
  | 'SETTINGS'

export function EmployerWorkspacePage() {
  const [activeTab, setActiveTab] = useState<EmployerTab>('DASHBOARD')

  // Persisted employer state
  const [org, setOrg] = useState<EmployerOrganizationProfile>(() =>
    loadEmployerOrg(),
  )
  const [jobs, setJobs] = useState<EmployerJobPosting[]>(() =>
    loadEmployerJobs(),
  )
  const [applications, setApplications] = useState<StudentJobApplication[]>(
    () => loadJobApplications(),
  )

  // Job creation / editing form state
  const [editingJobId, setEditingJobId] = useState<string | null>(null)
  const [jobForm, setJobForm] = useState({
    title: '',
    department: 'Core Engineering',
    employmentType: 'FULL_TIME' as EmployerJobPosting['employmentType'],
    location: 'Karachi / Hybrid',
    isRemote: true,
    experienceLevel: 'ENTRY_GRADUATE' as EmployerJobPosting['experienceLevel'],
    salaryRange: 'PKR 220,000 – 300,000 / mo',
    applicationDeadline: '2026-12-20',
    applicationMethod:
      'PLATFORM_ONE_CLICK' as EmployerJobPosting['applicationMethod'],
    externalApplyUrl: '',
    status: 'PUBLISHED' as EmployerJobPosting['status'],
    description: '',
    requirementsText:
      'BS in Computer Science or Business Administration from Sukkur IBA\nStrong problem-solving and communication skills',
    skillsText: 'TypeScript, React, SQL, System Design',
  })

  // Preview & confirmation modal states
  const [previewingJob, setPreviewingJob] = useState<EmployerJobPosting | null>(
    null,
  )
  const [confirmAction, setConfirmAction] = useState<{
    jobId: string
    jobTitle: string
    type: 'CLOSE' | 'DELETE'
  } | null>(null)

  // Applicant filtering state
  const [applicantSearch, setApplicantSearch] = useState('')
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>('ALL')
  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState<string>('ALL')

  // Employer account settings state
  const [employerSettings, setEmployerSettings] = useState({
    notifyOnEveryApplication: true,
    weeklyCandidateDigest: true,
    allowDirectStudentInquiries: true,
    requireVerifiedTranscript: false,
  })

  // Calculate applicant counts per job from actual stored records
  const applicantCountByJobId = useMemo(() => {
    const map: Record<string, number> = {}
    for (const app of applications) {
      map[app.jobId] = (map[app.jobId] ?? 0) + 1
    }
    return map
  }, [applications])

  const filteredApplicants = useMemo(() => {
    return applications.filter((app) => {
      if (selectedJobFilter !== 'ALL' && app.jobId !== selectedJobFilter)
        return false
      if (
        selectedStatusFilter !== 'ALL' &&
        app.status !== selectedStatusFilter
      )
        return false
      if (applicantSearch.trim()) {
        const q = applicantSearch.toLowerCase()
        const hay = [
          app.applicantName,
          app.applicantEmail,
          app.applicantMajor,
          app.jobTitle,
          ...app.skills,
        ]
          .join(' ')
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [applications, selectedJobFilter, selectedStatusFilter, applicantSearch])

  const handleSaveOrg = (e: FormEvent) => {
    e.preventDefault()
    if (!org.name.trim() || !org.industry.trim()) {
      toast.error('Organization name and industry are required.')
      return
    }
    saveEmployerOrg(org)
    toast.success('Organization profile saved and verified.')
  }

  const handleEditJob = (job: EmployerJobPosting) => {
    setEditingJobId(job.id)
    setJobForm({
      title: job.title,
      department: job.department,
      employmentType: job.employmentType,
      location: job.location,
      isRemote: job.isRemote,
      experienceLevel: job.experienceLevel,
      salaryRange: job.salaryRange,
      applicationDeadline: job.applicationDeadline,
      applicationMethod: job.applicationMethod,
      externalApplyUrl: job.externalApplyUrl ?? '',
      status: job.status,
      description: job.description,
      requirementsText: job.requirements.join('\n'),
      skillsText: job.skills.join(', '),
    })
    setActiveTab('JOBS')
  }

  const buildJobFromForm = (
    overrideStatus?: EmployerJobPosting['status'],
  ): EmployerJobPosting => {
    return {
      id: editingJobId ?? `job-${Date.now()}`,
      title: jobForm.title.trim() || 'Untitled Career Opportunity',
      company: org.name.split(' ')[0] || 'TechCorp',
      department: jobForm.department.trim(),
      employmentType: jobForm.employmentType,
      location: jobForm.location.trim(),
      isRemote: jobForm.isRemote,
      experienceLevel: jobForm.experienceLevel,
      salaryRange: jobForm.salaryRange.trim(),
      applicationDeadline: jobForm.applicationDeadline,
      applicationMethod: jobForm.applicationMethod,
      externalApplyUrl: jobForm.externalApplyUrl.trim() || undefined,
      status: overrideStatus ?? jobForm.status,
      description: jobForm.description.trim(),
      requirements: jobForm.requirementsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      skills: jobForm.skillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      createdAt: new Date().toISOString().slice(0, 10),
    }
  }

  const handleSaveJob = (e: FormEvent) => {
    e.preventDefault()
    if (!jobForm.title.trim() || !jobForm.description.trim()) {
      toast.error('Please enter both a job title and role description.')
      return
    }
    const built = buildJobFromForm()
    const next = editingJobId
      ? jobs.map((j) => (j.id === editingJobId ? built : j))
      : [built, ...jobs]
    setJobs(next)
    saveEmployerJobs(next)
    setEditingJobId(null)
    setJobForm((prev) => ({ ...prev, title: '', description: '' }))
    toast({
      title: editingJobId ? 'Job Posting Updated' : 'Job Opportunity Published',
      description: `${built.title} is now saved under ${built.status} status.`,
      variant: 'success',
    })
  }

  const handleConfirmCloseOrDelete = () => {
    if (!confirmAction) return
    if (confirmAction.type === 'CLOSE') {
      const next = jobs.map((j) =>
        j.id === confirmAction.jobId ? { ...j, status: 'CLOSED' as const } : j,
      )
      setJobs(next)
      saveEmployerJobs(next)
      toast.success(`Closed posting: ${confirmAction.jobTitle}`)
    } else {
      const next = jobs.filter((j) => j.id !== confirmAction.jobId)
      setJobs(next)
      saveEmployerJobs(next)
      toast.success(`Deleted posting: ${confirmAction.jobTitle}`)
    }
    setConfirmAction(null)
  }

  const handleUpdateApplicantStatus = (
    appId: string,
    nextStatus: StudentJobApplication['status'],
  ) => {
    const updated = applications.map((a) =>
      a.id === appId ? { ...a, status: nextStatus } : a,
    )
    setApplications(updated)
    saveJobApplications(updated)
    toast({
      title: 'Applicant Status Updated',
      description: `Application moved to ${nextStatus} stage.`,
      variant: 'success',
    })
  }

  const tabs: {
    id: EmployerTab
    label: string
    icon: typeof Building2
    count?: number
  }[] = [
    { id: 'DASHBOARD', label: 'Employer Overview', icon: Building2 },
    { id: 'ORGANIZATION', label: 'Organization Profile', icon: ShieldCheck },
    {
      id: 'JOBS',
      label: 'Job Management',
      icon: Briefcase,
      count: jobs.length,
    },
    {
      id: 'APPLICANTS',
      label: 'Applicant Pipeline',
      icon: Users,
      count: applications.length,
    },
    { id: 'SETTINGS', label: 'Employer Settings', icon: Settings },
  ]

  return (
    <RoleShell
      role="EMPLOYER"
      title="Employer & Recruiter Portal"
      subtitle={org.name}
      badge="Verified University Partner · Prototype Workspace"
      headerActions={
        <Button
          size="sm"
          onClick={() => {
            setEditingJobId(null)
            setActiveTab('JOBS')
          }}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Post New Opportunity
        </Button>
      }
    >
      {/* Scope & Data Integrity Banner */}
      <div className="rounded-xl border border-primary/30 bg-card px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
          <span className="text-foreground">
            <strong>Verified Partner Workspace:</strong> Job postings, applicant status transitions, and organization edits are persisted locally and sync directly with the Student Career Hub.
          </span>
        </div>
        <span className="font-mono text-primary font-semibold">
          {org.verificationStatus === 'VERIFIED_PARTNER'
            ? 'SUKKUR IBA VERIFIED PARTNER'
            : 'VERIFICATION PENDING'}
        </span>
      </div>

      {/* Top Navigation Tabs */}
      <div
        role="tablist"
        aria-label="Employer Portal Sections"
        className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-2 shadow-card"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isSelected = activeTab === tab.id
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isSelected}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-primary text-white dark:text-slate-950 shadow-sm'
                  : 'text-foreground hover:bg-stone'
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`font-mono text-[11px] font-bold tabular-nums px-1.5 py-0.5 rounded ${
                    isSelected
                      ? 'bg-black/15 text-white dark:bg-black/20 dark:text-slate-950'
                      : 'bg-stone text-primary'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="space-y-6"
        >
          {/* A. EMPLOYER DASHBOARD */}
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <p className="font-mono text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
                    {jobs.filter((j) => j.status === 'PUBLISHED').length}
                  </p>
                  <p className="text-xs font-mono text-secondary mt-1">
                    Published Job Postings
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <p className="font-mono text-2xl sm:text-3xl font-bold text-primary tabular-nums">
                    {applications.length}
                  </p>
                  <p className="text-xs font-mono text-secondary mt-1">
                    Total Recorded Applicants
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <p className="font-mono text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
                    {
                      applications.filter(
                        (a) =>
                          a.status === 'SHORTLISTED' ||
                          a.status === 'INTERVIEW',
                      ).length
                    }
                  </p>
                  <p className="text-xs font-mono text-secondary mt-1">
                    Shortlisted / In Interview
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <p className="font-mono text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
                    {org.alumniEmployeesCount}
                  </p>
                  <p className="text-xs font-mono text-secondary mt-1">
                    Sukkur IBA Alumni Employed
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider font-semibold text-primary">
                      Active Requisitions
                    </p>
                    <h2 className="font-display text-xl font-bold text-foreground">
                      Published Jobs & Actual Applicant Counts
                    </h2>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveTab('APPLICANTS')}
                    >
                      Manage Applicants ({applications.length})
                    </Button>
                    <Button size="sm" onClick={() => setActiveTab('JOBS')}>
                      Create / Edit Postings
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {jobs.map((job) => {
                    const count = applicantCountByJobId[job.id] ?? 0
                    return (
                      <div
                        key={job.id}
                        className="rounded-xl border border-border bg-background p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                            <span className="font-bold text-primary">
                              {job.status}
                            </span>
                            <span>·</span>
                            <span className="text-foreground font-semibold">
                              {job.employmentType}
                            </span>
                            <span>·</span>
                            <span className="text-secondary">
                              {job.location}
                            </span>
                          </div>
                          <h3 className="font-display text-base font-bold text-foreground">
                            {job.title}
                          </h3>
                          <p className="text-xs font-mono text-secondary">
                            {job.salaryRange} · Deadline:{' '}
                            {job.applicationDeadline}
                          </p>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedJobFilter(job.id)
                              setActiveTab('APPLICANTS')
                            }}
                            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-mono font-bold text-primary hover:border-primary transition-colors cursor-pointer tabular-nums"
                          >
                            {count} Applicant{count === 1 ? '' : 's'}
                          </button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditJob(job)}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* B. ORGANIZATION PROFILE */}
          {activeTab === 'ORGANIZATION' && (
            <form
              onSubmit={handleSaveOrg}
              className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider font-semibold text-primary">
                    Employer Identity & Verification
                  </p>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Organization Profile
                  </h2>
                </div>
                <span className="font-mono text-xs font-bold text-primary">
                  Status: {org.verificationStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1.5">
                    Organization Name *
                  </label>
                  <Input
                    required
                    value={org.name}
                    onChange={(e) =>
                      setOrg((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1.5">
                    Industry Sector *
                  </label>
                  <Input
                    required
                    value={org.industry}
                    onChange={(e) =>
                      setOrg((prev) => ({ ...prev, industry: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1.5">
                    Official Website
                  </label>
                  <Input
                    type="url"
                    value={org.website}
                    onChange={(e) =>
                      setOrg((prev) => ({ ...prev, website: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1.5">
                    Headquarters & Recruiting Hubs
                  </label>
                  <Input
                    value={org.headquarters}
                    onChange={(e) =>
                      setOrg((prev) => ({
                        ...prev,
                        headquarters: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1.5">
                    Organization Description & Sukkur IBA Partnership Note
                  </label>
                  <Input
                    value={org.description}
                    onChange={(e) =>
                      setOrg((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit">Save Organization Profile</Button>
              </div>
            </form>
          )}

          {/* C. JOB MANAGEMENT */}
          {activeTab === 'JOBS' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 6 Cols: Create / Edit Job Form */}
              <form
                onSubmit={handleSaveJob}
                className="lg:col-span-6 rounded-2xl border border-border bg-card p-6 shadow-card space-y-4"
              >
                <div className="border-b border-border pb-3 flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-foreground">
                    {editingJobId
                      ? 'Edit Job Posting'
                      : 'Create New Job Posting'}
                  </h2>
                  {editingJobId && (
                    <button
                      type="button"
                      onClick={() => setEditingJobId(null)}
                      className="text-xs font-mono text-primary hover:underline cursor-pointer"
                    >
                      Switch to New Posting
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1">
                      Job Title *
                    </label>
                    <Input
                      required
                      value={jobForm.title}
                      onChange={(e) =>
                        setJobForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="e.g., Graduate Software Engineer (Class of 2026)"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1">
                      Employment Type
                    </label>
                    <SelectField
                      value={jobForm.employmentType}
                      onChange={(e) =>
                        setJobForm((prev) => ({
                          ...prev,
                          employmentType: e.target
                            .value as EmployerJobPosting['employmentType'],
                        }))
                      }
                    >
                      <option value="FULL_TIME">Full-Time</option>
                      <option value="INTERNSHIP">Internship / Fellowship</option>
                      <option value="PART_TIME">Part-Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="REMOTE">Remote</option>
                    </SelectField>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1">
                      Publication Status
                    </label>
                    <SelectField
                      value={jobForm.status}
                      onChange={(e) =>
                        setJobForm((prev) => ({
                          ...prev,
                          status: e.target
                            .value as EmployerJobPosting['status'],
                        }))
                      }
                    >
                      <option value="PUBLISHED">Published (Live)</option>
                      <option value="DRAFT">Draft</option>
                      <option value="CLOSED">Closed</option>
                      <option value="ARCHIVED">Archived</option>
                    </SelectField>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1">
                      Location
                    </label>
                    <Input
                      value={jobForm.location}
                      onChange={(e) =>
                        setJobForm((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1">
                      Application Deadline
                    </label>
                    <Input
                      type="date"
                      value={jobForm.applicationDeadline}
                      onChange={(e) =>
                        setJobForm((prev) => ({
                          ...prev,
                          applicationDeadline: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1">
                      Required Skills (comma-separated)
                    </label>
                    <Input
                      value={jobForm.skillsText}
                      onChange={(e) =>
                        setJobForm((prev) => ({
                          ...prev,
                          skillsText: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1">
                      Role Description & Responsibilities *
                    </label>
                    <Input
                      required
                      value={jobForm.description}
                      onChange={(e) =>
                        setJobForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Describe day-to-day responsibilities, team structure, and mentorship..."
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewingJob(buildJobFromForm())}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    Preview Before Publishing
                  </Button>
                  <Button type="submit" size="sm">
                    {editingJobId ? 'Save Changes' : 'Publish Opportunity'}
                  </Button>
                </div>
              </form>

              {/* Right 6 Cols: Existing Postings List */}
              <div className="lg:col-span-6 rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
                <h2 className="font-display text-lg font-bold text-foreground border-b border-border pb-3">
                  Manage Existing Postings ({jobs.length})
                </h2>

                <div className="space-y-3">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="rounded-xl border border-border bg-background p-4 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-mono font-bold text-primary">
                            {job.status} · {job.employmentType}
                          </span>
                          <h3 className="font-display text-base font-bold text-foreground">
                            {job.title}
                          </h3>
                          <p className="text-xs text-secondary">
                            {job.location} · Deadline {job.applicationDeadline}
                          </p>
                        </div>
                        <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
                          {applicantCountByJobId[job.id] ?? 0} applicants
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => setPreviewingJob(job)}
                        >
                          Preview
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleEditJob(job)}
                        >
                          Edit
                        </Button>
                        {job.status !== 'CLOSED' && (
                          <Button
                            size="xs"
                            variant="secondary"
                            onClick={() =>
                              setConfirmAction({
                                jobId: job.id,
                                jobTitle: job.title,
                                type: 'CLOSE',
                              })
                            }
                          >
                            Close Posting
                          </Button>
                        )}
                        <Button
                          size="xs"
                          variant="destructive"
                          onClick={() =>
                            setConfirmAction({
                              jobId: job.id,
                              jobTitle: job.title,
                              type: 'DELETE',
                            })
                          }
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* D. APPLICANT MANAGEMENT */}
          {activeTab === 'APPLICANTS' && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider font-semibold text-primary">
                    Candidate Review Pipeline
                  </p>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Submitted Applications ({filteredApplicants.length})
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative w-full sm:w-56">
                    <Search className="h-3.5 w-3.5 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      value={applicantSearch}
                      onChange={(e) => setApplicantSearch(e.target.value)}
                      placeholder="Search candidate or skill..."
                      className="pl-8"
                    />
                  </div>
                  <div className="w-full sm:w-48">
                    <SelectField
                      aria-label="Filter by Job Posting"
                      value={selectedJobFilter}
                      onChange={(e) => setSelectedJobFilter(e.target.value)}
                    >
                      <option value="ALL">All Job Requisitions</option>
                      {jobs.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.title}
                        </option>
                      ))}
                    </SelectField>
                  </div>
                  <div className="w-full sm:w-40">
                    <SelectField
                      aria-label="Filter by Application Status"
                      value={selectedStatusFilter}
                      onChange={(e) => setSelectedStatusFilter(e.target.value)}
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="SUBMITTED">Submitted</option>
                      <option value="SHORTLISTED">Shortlisted</option>
                      <option value="INTERVIEW">Interview</option>
                      <option value="OFFERED">Offered</option>
                      <option value="REJECTED">Rejected</option>
                    </SelectField>
                  </div>
                </div>
              </div>

              {filteredApplicants.length === 0 ? (
                <div className="rounded-xl border border-border bg-background p-8 text-center space-y-2">
                  <p className="text-base font-bold text-foreground">
                    No applicants match your current filter criteria
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setApplicantSearch('')
                      setSelectedJobFilter('ALL')
                      setSelectedStatusFilter('ALL')
                    }}
                  >
                    Reset Applicant Filters
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredApplicants.map((app) => (
                    <div
                      key={app.id}
                      className="rounded-xl border border-border bg-background p-5 space-y-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <span className="text-xs font-mono font-bold text-primary">
                            STAGE: {app.status} · Applied {app.appliedAt}
                          </span>
                          <h3 className="font-display text-lg font-bold text-foreground mt-0.5">
                            {app.applicantName} ({app.applicantMajor} ’
                            {String(app.applicantGradYear).slice(-2)})
                          </h3>
                          <p className="text-xs font-mono text-secondary">
                            Role: <strong className="text-foreground">{app.jobTitle}</strong> · GPA:{' '}
                            {app.applicantGpa} · {app.applicantEmail}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {(
                            [
                              'SHORTLISTED',
                              'INTERVIEW',
                              'OFFERED',
                              'REJECTED',
                            ] as const
                          ).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() =>
                                handleUpdateApplicantStatus(app.id, st)
                              }
                              className={`rounded-lg border px-2.5 py-1 text-xs font-mono font-semibold transition-colors cursor-pointer ${
                                app.status === st
                                  ? 'border-primary bg-primary text-white dark:text-slate-950'
                                  : 'border-border bg-card text-foreground hover:border-primary/50'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                        <strong className="text-foreground">
                          Candidate Note:
                        </strong>{' '}
                        {app.coverNote}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/70 text-xs font-mono">
                        <span className="text-foreground">
                          Skills: {app.skills.join(' · ')}
                        </span>
                        <span className="inline-flex items-center gap-1 text-primary">
                          <FileText className="h-3.5 w-3.5" />
                          Verified Sukkur IBA Dossier Attached
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* E. EMPLOYER SETTINGS */}
          {activeTab === 'SETTINGS' && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5">
              <div className="border-b border-border pb-4">
                <h2 className="font-display text-xl font-bold text-foreground">
                  Employer Account & Notification Settings
                </h2>
              </div>

              <div className="space-y-3">
                {[
                  {
                    key: 'notifyOnEveryApplication' as const,
                    title: 'Instant email alert on new student or alumni application',
                    desc: 'Send candidate dossier summary to the recruiting contact email.',
                  },
                  {
                    key: 'weeklyCandidateDigest' as const,
                    title: 'Weekly talent pool & referral digest',
                    desc: 'Receive a weekly summary of shortlisted Sukkur IBA candidates.',
                  },
                  {
                    key: 'allowDirectStudentInquiries' as const,
                    title: 'Allow verified final-year scholars to message recruiting team',
                    desc: 'Permits students to ask role-specific questions before applying.',
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start justify-between gap-4 rounded-xl border border-border bg-background p-4 cursor-pointer"
                  >
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {item.title}
                      </p>
                      <p className="text-xs text-secondary mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={employerSettings[item.key]}
                      onChange={(e) => {
                        setEmployerSettings((prev) => ({
                          ...prev,
                          [item.key]: e.target.checked,
                        }))
                        toast.success('Employer setting updated.')
                      }}
                      className="h-4 w-4 mt-1"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Job Preview Modal */}
      <AnimatePresence>
        {previewingJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setPreviewingJob(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-start justify-between border-b border-border pb-3">
                <div>
                  <span className="text-xs font-mono font-bold text-primary">
                    CANDIDATE VIEW PREVIEW · {previewingJob.employmentType}
                  </span>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    {previewingJob.title}
                  </h3>
                  <p className="text-xs font-mono text-secondary">
                    {previewingJob.company} · {previewingJob.location} ·{' '}
                    {previewingJob.salaryRange}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewingJob(null)}
                  className="rounded-lg border border-border p-1.5 text-secondary hover:text-foreground cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-secondary leading-relaxed">
                {previewingJob.description}
              </p>
              <div className="text-xs font-mono text-foreground">
                Required Skills: {previewingJob.skills.join(' · ')}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewingJob(null)}
                >
                  Close Preview
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Closing or Deleting a Job Posting */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setConfirmAction(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
            >
              <h3 className="font-display text-lg font-bold text-foreground">
                Confirm{' '}
                {confirmAction.type === 'CLOSE'
                  ? 'Closing Job Posting'
                  : 'Deleting Job Posting'}
              </h3>
              <p className="text-sm text-secondary">
                Are you sure you want to{' '}
                {confirmAction.type === 'CLOSE' ? 'close' : 'permanently delete'}{' '}
                <strong className="text-foreground">
                  {confirmAction.jobTitle}
                </strong>
                ?
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmAction(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant={
                    confirmAction.type === 'DELETE' ? 'destructive' : 'default'
                  }
                  size="sm"
                  onClick={handleConfirmCloseOrDelete}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                  Confirm
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </RoleShell>
  )
}
