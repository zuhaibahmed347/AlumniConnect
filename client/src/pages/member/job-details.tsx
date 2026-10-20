import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Calendar, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Avatar } from '@/components/ui/avatar'

export function JobDetailsPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [job, setJob] = useState<any>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [showApply, setShowApply] = useState(false)

  useEffect(() => {
    // In a real app, this would fetch the job from the API
    if (!jobId) {
      setLoading(false)
      return
    }

    // Mock job data - would come from API based on jobId
    const mockJob = {
      id: jobId || '1',
      title: 'Senior Full Stack Engineer',
      company: 'TechCorp',
      companyLogoUrl: 'https://logo.clearbit.com/techcorp.com',
      companyWebsite: 'https://techcorp.com',
      description: 'We are looking for a Senior Full Stack Engineer to join our core product team. You will build features end-to-end, mentor junior engineers, and contribute to architectural decisions.',
      requirements: '5+ years experience with React, Node.js, TypeScript, PostgreSQL. Experience with AWS and Kubernetes preferred.',
      benefits: 'Competitive salary, equity, health insurance, learning budget, flexible remote work.',
      location: 'Karachi, Pakistan',
      isRemote: true,
      employmentType: 'FULL_TIME',
      salaryMin: 80000,
      salaryMax: 150000,
      salaryCurrency: 'USD',
      status: 'ACTIVE',
      postedById: 'admin-1',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      externalApplyUrl: 'https://apply.techcorp.com/senior-engineer',
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      applications: 47,
    }

    setJob(mockJob)
    setLoading(false)
  }, [jobId])

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-6 w-6 mx-auto mb-3" />
          <p>Loading job details...</p>
        </div>
      </main>
    )
  }

  if (!job) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto text-center py-8">
          <svg
            className="h-12 w-12 mx-auto mb-4 text-secondary/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v6a2 2 0 002 2H9a2 2 0 002-2zM5 13l7 7-7 7"
            />
          </svg>
          <h2 className="text-2xl font-bold">Job Not Found</h2>
          <p className="text-secondary/80">The job posting you requested could not be found.</p>
        </div>
      </main>
    )
  }

  const isExpired = new Date(job.expiresAt) < new Date()
  const daysUntilExpiry = isExpired
    ? 0
    : Math.ceil((new Date(job.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <main className="min-h-screen bg-background">
      {/* Job Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/jobs')}>
              ← Back to Jobs
            </Button>
            <Avatar
              className="h-8 w-8"
              >{(job.company || '').substring(0, 2)}</Avatar>
            <div>
              <p className="font-medium">{job.title}</p>
              <p className="text-sm text-secondary/80">
                {job.company}
              </p>
            </div>
          </div>
        </div>
      </header>

 {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Job Info Summary */}
        <section className="bg-white rounded-lg p-6 mb-8">
          <div className="grid grid-cols-2 gap-4 mb-4">
 {/* Job Type & Location */}
            <div>
              <p className="text-secondary/80 text-xs mb-1">Employment Type</p>
              <p className="font-medium">
                {job.employmentType}
              </p>
            </div>
            <div>
              <p className="text-secondary/80 text-xs mb-1">Location</p>
              <p className="font-medium">
                {job.location}
                {job.isRemote && ' (Remote)'}
              </p>
            </div>
 {/* Salary */}
            {job.salaryMin && job.salaryMax && (
              <div>
                <p className="text-secondary/80 text-xs mb-1">Salary</p>
                <p className="font-medium">
                  {job.salaryMin}-{job.salaryMax} {job.salaryCurrency}
                </p>
              </div>
            )}
 {/* Expiry Date */}
            <div>
              <p className="text-secondary/80 text-xs mb-1">Posting Date</p>
              <p className="text-sm text-secondary">
                {new Date(job.postedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

 {/* Status & Expiry */}
          {isExpired ? (
            <div className="mt-4 p-4 rounded-lg bg-error/10 text-error">
              <p className="text-error/80 text-sm">
                <Clock className="h-4 w-4 mr-2" /> This posting has expired
              </p>
            </div>
          ) : (
            <div className="mt-4 p-4 rounded-lg bg-success/10 text-success">
              <p className="text-success/80 text-sm">
                <Calendar className="h-4 w-4 mr-2" /> Expires in {daysUntilExpiry} days
              </p>
            </div>
          )}

 {/* Actions */}
          <div className="mt-6 pt-6 border-t border-border/10 flex gap-3">
 {/* Save/Bookmark Button */}<Button
              variant={isSaved ? 'secondary' : 'default'}
              size="lg"
              onClick={() => setIsSaved((prev) => !prev)}
            >
              {isSaved ? 'Saved' : 'Save Job'}</Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => alert('Report this listing')}
            >
              Report</Button>
          </div>
        </section>

 {/* Job Description */}
        <section className="bg-white rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Job Description</h2>
          <p className="text-secondary/80 mb-6">{job.description}</p>

 {/* Requirements */}
          <div>
            <h3 className="text-secondary/80 text-xs mb-2">Requirements</h3>
            <ul className="space-y-2 text-sm text-secondary">
              {job.requirements?.split('.').filter((s: string) => s.length > 0).map((req: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <svg
                    className="h-4 w-4 text-primary flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l13-13l7-7m7 7l-7 7-13-13"
                    />
                  </svg>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

 {/* Benefits */}
          <div>
            <h3 className="text-secondary/80 text-xs mb-2">Benefits</h3>
            <ul className="space-y-2 text-sm text-secondary">
              {job.benefits?.split('.').filter((s: string) => s.length > 0).map((ben: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <svg
                    className="h-4 w-4 text-primary flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l13-13l7-7m7 7l-7 7-13-13"
                    />
                  </svg>
                  <span>{ben}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

 {/* Apply Section */}
        {job.status === 'ACTIVE' && !isExpired && (
          <section className="bg-white rounded-lg p-6 mt-8">
            <h2 className="text-lg font-medium mb-4">Apply for this Job</h2>
            <p className="text-secondary/80 mb-6">
              Apply directly through the company's application system or submit your resume.
            </p>
            <div className="space-y-4">
              <Button
                type="button"
                onClick={() => window.open(job.externalApplyUrl || '#', '_blank')}
                className="w-full bg-primary text-white py-3 rounded-md hover:bg-primary/90 transition-colors"
              >
                Apply Online
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowApply(true)}
                className="w-full border border-primary text-primary py-3 rounded-md hover:bg-primary/5 transition-colors"
              >
                Submit Resume
              </Button>
            </div>
          </section>
        )}

 {/* Application Form Modal */}
 {showApply && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold mb-4">Submit Your Resume</h2>
              <p className="text-secondary/80 mb-6">
                Please submit your resume and a brief cover letter.
              </p>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  alert('Application submitted successfully!')
                  setShowApply(false)
                }}
              >
                <div>
                  <label htmlFor="resume" className="block text-sm font-medium">
                    Resume/CV
                  </label>
                  <Input
                    id="resume"
                    type="file"
                    className="rounded border border-border px-3 py-2"
                  />
                </div>
                <div>
                  <label htmlFor="coverLetter" className="block text-sm font-medium">
                    Cover Letter
                  </label>
                  <Input
                    id="coverLetter"
                    placeholder="Tell us why you're interested in this role..."
                    className="rounded border border-border px-3 py-2 h-24"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-primary text-white"
                  >
                    Submit Application
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowApply(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}