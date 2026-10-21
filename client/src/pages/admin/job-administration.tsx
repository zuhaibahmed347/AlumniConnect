import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Briefcase } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function AdminJobAdministrationPage() {
  const navigate = useNavigate()

  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<{ search: string; status: string | undefined; employmentType: string | undefined }>({
    search: '',
    status: undefined,
    employmentType: undefined,
  })

  useEffect(() => {
    const mockJobs = [
      {
        id: '1',
        title: 'Senior Full Stack Engineer',
        slug: 'senior-full-stack-engineer-techcorp',
        company: 'TechCorp',
        companyLogoUrl: '/images/logos/techcorp.jpg',
        description:
          'We are looking for a Senior Full Stack Engineer to join our core product team.',
        requirements: '5+ years experience with React, Node.js, TypeScript, PostgreSQL.',
        benefits: 'Competitive salary, equity, health insurance, learning budget.',
        location: 'Karachi, Pakistan',
        isRemote: true,
        employmentType: 'FULL_TIME',
        salaryMin: 80000,
        salaryMax: 150000,
        salaryCurrency: 'USD',
        status: 'ACTIVE',
        postedBy: 'Platform Admin',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        applications: 47,
      },
      {
        id: '2',
        title: 'Data Scientist - NLP',
        slug: 'data-scientist-nlp-ai-innovations',
        company: 'AI Innovations',
        companyLogoUrl: '/images/logos/ai-innovations.jpg',
        description:
          'Join our NLP research team building next-generation language models.',
        requirements: 'PhD or MS in CS/ML. Strong publication record in NLP.',
        benefits: 'Top-tier compensation, research freedom, conference budget.',
        location: 'San Francisco, USA',
        isRemote: false,
        employmentType: 'FULL_TIME',
        salaryMin: 150000,
        salaryMax: 250000,
        salaryCurrency: 'USD',
        status: 'ACTIVE',
        postedBy: 'Platform Admin',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
        applications: 234,
      },
      {
        id: '3',
        title: 'UX Design Intern',
        slug: 'ux-design-intern-creative-studio',
        company: 'Creative Studio',
        companyLogoUrl: '/images/logos/creative-studio.jpg',
        description:
          'Summer internship program for aspiring UX designers.',
        requirements: 'Currently pursuing design degree. Figma proficiency.',
        benefits: 'Monthly stipend, mentorship, portfolio pieces.',
        location: 'Toronto, Canada',
        isRemote: true,
        employmentType: 'INTERNSHIP',
        salaryMin: 3000,
        salaryMax: 4000,
        salaryCurrency: 'CAD',
        status: 'ACTIVE',
        postedBy: 'Platform Admin',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        applications: 89,
      },
    ]

    setJobs(mockJobs)
    setLoading(false)
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">Job Administration</h1>
            <Briefcase className="h-5 w-5 text-secondary" />
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
            ← Back to Command Center
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div>
          <div className="bg-white rounded-lg p-4 mb-6">
            <form className="grid grid-cols-1 sm:grid-cols-6 gap-3">
              <div>
                <Input
                  placeholder="Search jobs..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="rounded border border-border px-3 py-2"
                />
              </div>
              <div>
                <select
                  value={filters.status || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      status:
                        e.target.value === ''
                          ? undefined
                          : e.target.value as
                            | 'DRAFT'
                            | 'ACTIVE'
                            | 'EXPIRED'
                            | 'FILLED'
                            | 'ARCHIVED',
                    })
                  }
                  className="rounded border border-border px-3 py-2"
                >
                  <option value="">All Statuses</option>
                  <option>DRAFT</option>
                  <option>ACTIVE</option>
                  <option>EXPIRED</option>
                  <option>FILLED</option>
                  <option>ARCHIVED</option>
                </select>
              </div>
              <div>
                <select
                  value={filters.employmentType || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      employmentType:
                        e.target.value === ''
                          ? undefined
                          : e.target.value as
                            | 'FULL_TIME'
                            | 'PART_TIME'
                            | 'CONTRACT'
                            | 'INTERNSHIP'
                            | 'FREELANCE'
                            | 'REMOTE',
                    })
                  }
                  className="rounded border border-border px-3 py-2"
                >
                  <option value="">All Types</option>
                  <option>FULL_TIME</option>
                  <option>PART_TIME</option>
                  <option>CONTRACT</option>
                  <option>INTERNSHIP</option>
                  <option>FREELANCE</option>
                  <option>REMOTE</option>
                </select>
              </div>
              <div>
                <Button type="submit" className="sm:col-auto w-auto">
                  Apply Filters
                </Button>
              </div>
            </form>
          </div>

          <div className="bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="overflow-x-auto">
                <div className="space-y-2">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="group rounded-lg border bg-card p-4 hover:bg-card/80 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        {job.companyLogoUrl && (
                          <div className="w-10 h-10 rounded-md flex-shrink-0">
                            <img
                              src={job.companyLogoUrl}
                              alt={job.company}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {!job.companyLogoUrl && (
                          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <svg
                              className="h-5 w-5 text-primary"
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
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{job.title}</p>
                          <p className="text-xs text-secondary/70 truncate">
                            {job.company}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-border/10 text-xs text-secondary">
                        <p>
                          {job.location}{' '}{job.isRemote && '(Remote)'}
                        </p>
                        <p>
                          Empl: {job.employmentType} · apps: {job.applications}
                        </p>
                        <p>
                          Expires: {new Date(job.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}

                  {loading || jobs.length === 0 && (
                    <div className="min-h-[200px] flex flex-col items-center justify-center py-8 text-secondary">
                      <Briefcase className="h-8 w-8 mb-3 opacity-50" />
                      <p>No jobs found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}