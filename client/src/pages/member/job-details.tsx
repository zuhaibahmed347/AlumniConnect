import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Bookmark,
  CheckCircle2,
  Send,
  Flag,
  X,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { toast } from '@/lib/toast'
import { SUKKUR_IBA_JOB_LISTINGS } from '@/components/ui/job-board-filter'
import {
  loadJobApplications,
  saveJobApplications,
  type StudentJobApplication,
} from '@/lib/role-context'
import { api } from '@/services/api'

export function JobDetailsPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()

  const job = useMemo(() => {
    return (
      SUKKUR_IBA_JOB_LISTINGS.find((item) => item.id === jobId) ||
      SUKKUR_IBA_JOB_LISTINGS[0]
    )
  }, [jobId])

  const [isSaved, setIsSaved] = useState(false)
  const [hasApplied, setHasApplied] = useState(() =>
    loadJobApplications().some((a) => a.jobId === (jobId || '1'))
  )
  const [showApply, setShowApply] = useState(false)
  const [applicantNote, setApplicantNote] = useState('')
  const [portfolioLink, setPortfolioLink] = useState('')

  const isExpired = new Date(job.expiresAt) < new Date()
  const daysUntilExpiry = isExpired
    ? 0
    : Math.ceil(
        (new Date(job.expiresAt).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )

  const handleToggleSave = () => {
    setIsSaved((prev) => {
      const next = !prev
      toast.success(
        next
          ? `Bookmarked "${job.title}" at ${job.company}`
          : `Removed "${job.title}" from saved roles`
      )
      return next
    })
  }

  const handleReport = () => {
    toast.success(
      'Listing flagged for Sukkur IBA Career Services review. Thank you.'
    )
  }

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newApp: StudentJobApplication = {
      id: `app-${Date.now()}`,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      location: job.location,
      employmentType: job.employmentType,
      appliedAt: new Date().toISOString().slice(0, 10),
      status: 'SUBMITTED',
      applicantName: 'Zainab Magsi',
      applicantEmail: 'zainab.magsi.bscs22@iba-suk.edu.pk',
      applicantMajor: 'BS Computer Science',
      applicantGradYear: 2026,
      applicantGpa: '3.76 / 4.00',
      resumeUrl:
        portfolioLink.trim() || 'https://iba-suk.edu.pk/portfolios/zainab-magsi-cv.pdf',
      coverNote:
        applicantNote.trim() ||
        `Referral request submitted to ${job.referrerName} (${job.referrerCohort}).`,
      skills: job.techStack,
    }
    const existing = loadJobApplications().filter((a) => a.jobId !== job.id)
    saveJobApplications([newApp, ...existing])
    void api.post(`/jobs/${job.id}/apply`, newApp).catch(() => {})
    setHasApplied(true)
    setShowApply(false)
    toast.success(
      `Referral dossier sent to ${job.referrerName} (${job.referrerCohort}) at ${job.company}!`
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="page-container py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/jobs')}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to Job Board
            </Button>
            <span aria-hidden="true" className="text-border hidden sm:inline">
              /
            </span>
            <span className="text-xs font-mono text-secondary truncate hidden sm:inline">
              {job.company} · {job.sectorLabel}
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <ThemeSwitcher />
            <Button
              variant={isSaved ? 'secondary' : 'outline'}
              size="sm"
              onClick={handleToggleSave}
            >
              <Bookmark
                className={`h-3.5 w-3.5 mr-1.5 ${
                  isSaved ? 'fill-current text-primary' : ''
                }`}
              />
              {isSaved ? 'Saved' : 'Save Role'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="page-container py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 8 Columns: Role Overview, Requirements, Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="lg:col-span-8 space-y-6"
          >
            {/* Primary Role Card */}
            <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-secondary mb-4">
                <span className="text-primary font-semibold">
                  {job.sectorLabel}
                </span>
                <span aria-hidden="true">·</span>
                <span>{job.workplaceLabel}</span>
                <span aria-hidden="true">·</span>
                <span>{job.experienceLabel}</span>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <img
                  src={job.companyLogoUrl}
                  alt={job.company}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-xl object-cover ring-1 ring-border shrink-0"
                />
                <div className="min-w-0">
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                    {job.title}
                  </h1>
                  <p className="text-sm text-secondary mt-1">
                    <span className="font-semibold text-foreground">
                      {job.company}
                    </span>{' '}
                    · {job.location} · Posted{' '}
                    {new Date(job.postedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Key Telemetry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-border/80 text-xs">
                <div>
                  <p className="text-secondary/80 font-mono uppercase tracking-wider text-[11px] mb-1">
                    Compensation
                  </p>
                  <p className="font-mono font-bold text-foreground tabular-nums">
                    {job.compensationDisplay}
                  </p>
                </div>
                <div>
                  <p className="text-secondary/80 font-mono uppercase tracking-wider text-[11px] mb-1">
                    Workplace Mode
                  </p>
                  <p className="font-semibold text-foreground">
                    {job.workplaceLabel}
                  </p>
                </div>
                <div>
                  <p className="text-secondary/80 font-mono uppercase tracking-wider text-[11px] mb-1">
                    Referral SLA
                  </p>
                  <p className="font-mono font-semibold text-primary tabular-nums">
                    ~{job.referralTurnaroundHours} Hours
                  </p>
                </div>
                <div>
                  <p className="text-secondary/80 font-mono uppercase tracking-wider text-[11px] mb-1">
                    Closing Window
                  </p>
                  <p className="font-mono font-semibold text-foreground tabular-nums flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    {daysUntilExpiry} days left
                  </p>
                </div>
              </div>

              {/* Unboxed Stack Line */}
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-mono text-secondary">
                <span className="text-foreground font-semibold">
                  Core Stack:
                </span>
                <span>{job.techStack.join(' · ')}</span>
              </div>
            </section>

            {/* Detailed Narrative & Requirements */}
            <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card space-y-6">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground mb-2.5">
                  Role Charter & Engineering Scope
                </h2>
                <p className="text-sm sm:text-base text-secondary leading-relaxed">
                  {job.description}
                </p>
              </div>

              <div className="pt-4 border-t border-border/80">
                <h3 className="font-display text-lg font-bold text-foreground mb-3">
                  Candidate Qualifications
                </h3>
                <ul className="space-y-2.5 text-sm text-secondary">
                  {job.requirements
                    .split('.')
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{req}.</span>
                      </li>
                    ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-border/80">
                <h3 className="font-display text-lg font-bold text-foreground mb-3">
                  Compensation & Alumni Benefits
                </h3>
                <ul className="space-y-2.5 text-sm text-secondary">
                  {job.benefits
                    .split('.')
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((ben, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{ben}.</span>
                      </li>
                    ))}
                </ul>
              </div>
            </section>
          </motion.div>

          {/* Right 4 Columns: Alumni Referrer Card & Direct Application Action */}
          <motion.aside
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.06 }}
            className="lg:col-span-4 space-y-6"
          >
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-primary mb-1">
                  Verified Alumni Referrer
                </p>
                <h2 className="font-display text-xl font-bold text-foreground">
                  {job.referrerName}
                </h2>
                <p className="text-xs text-secondary mt-0.5">
                  {job.referrerRole} at {job.company} ·{' '}
                  <span className="font-mono text-primary font-semibold">
                    {job.referrerCohort}
                  </span>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone/80 border border-border/70 text-xs text-secondary space-y-1.5">
                <p className="font-mono text-foreground font-semibold flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  Typical Referral Turnaround: ~{job.referralTurnaroundHours}{' '}
                  hours
                </p>
                <p className="leading-relaxed">
                  Your profile and CV are routed directly to {job.referrerName}
                  ’s internal hiring queue before entering public ATS screening.
                </p>
              </div>

              <div className="space-y-2.5">
                <Button
                  type="button"
                  variant="default"
                  className="w-full py-3"
                  onClick={() => setShowApply(true)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {hasApplied
                    ? 'Referral Dossier Submitted'
                    : 'Request Direct Alumni Referral'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleReport}
                >
                  <Flag className="h-3.5 w-3.5 mr-2" />
                  Flag or Update Listing
                </Button>
              </div>

              <div className="pt-3 border-t border-border/70 flex items-center justify-between text-xs text-secondary font-mono">
                <span>{job.applications} alumni applicants</span>
                <Link to="/jobs" className="text-primary hover:underline">
                  Explore similar roles →
                </Link>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>

      {/* Referral Application Modal */}
      <AnimatePresence>
        {showApply && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowApply(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 14 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-xl space-y-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-primary mb-1">
                    Fast-Track Referral Request
                  </p>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Apply for {job.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowApply(false)}
                  className="p-1.5 rounded-lg text-secondary hover:text-foreground hover:bg-stone"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form className="space-y-4" onSubmit={handleApplicationSubmit}>
                <div>
                  <label
                    htmlFor="portfolioLink"
                    className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1.5"
                  >
                    GitHub / LinkedIn / Portfolio URL
                  </label>
                  <Input
                    id="portfolioLink"
                    required
                    value={portfolioLink}
                    onChange={(e) => setPortfolioLink(e.target.value)}
                    placeholder="https://github.com/your-handle"
                  />
                </div>
                <div>
                  <label
                    htmlFor="coverLetter"
                    className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1.5"
                  >
                    Note to {job.referrerName} ({job.referrerCohort})
                  </label>
                  <Input
                    id="coverLetter"
                    required
                    value={applicantNote}
                    onChange={(e) => setApplicantNote(e.target.value)}
                    placeholder="Highlight your graduating cohort and relevant production impact..."
                  />
                </div>
                <div className="flex justify-end gap-2.5 pt-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowApply(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="default">
                    Send Referral Request
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