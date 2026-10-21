import { Input, SelectField } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
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
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Job Administration</h1>
            <Briefcase className="h-5 w-5 text-secondary" />
          </div>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
              ← Back to Command Center
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div>
          <div className="bg-card border border-border rounded-lg p-4 mb-6 shadow-sm">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center"
            >
              <div>
                <Input
                  placeholder="Search jobs..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
              </div>
              <div>
                <SelectField
                  value={filters.status || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      status:
                        e.target.value === ''
                          ? undefined
                          : (e.target.value as
                              | 'DRAFT'
                              | 'ACTIVE'
                              | 'EXPIRED'
                              | 'FILLED'
                              | 'ARCHIVED'),
                    })
                  }
                  aria-label="Filter by status"
                >
                  <option value="">All Statuses</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="EXPIRED">EXPIRED</option>
                  <option value="FILLED">FILLED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </SelectField>
              </div>
              <div>
                <SelectField
                  value={filters.employmentType || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      employmentType:
                        e.target.value === ''
                          ? undefined
                          : (e.target.value as
                              | 'FULL_TIME'
                              | 'PART_TIME'
                              | 'CONTRACT'
                              | 'INTERNSHIP'
                              | 'FREELANCE'
                              | 'REMOTE'),
                    })
                  }
                  aria-label="Filter by employment type"
                >
                  <option value="">All Types</option>
                  <option value="FULL_TIME">FULL_TIME</option>
                  <option value="PART_TIME">PART_TIME</option>
                  <option value="CONTRACT">CONTRACT</option>
                  <option value="INTERNSHIP">INTERNSHIP</option>
                  <option value="FREELANCE">FREELANCE</option>
                  <option value="REMOTE">REMOTE</option>
                </SelectField>
              </div>
              <div>
                <Button type="submit" className="w-full sm:w-auto">
                  Apply Filters
                </Button>
              </div>
            </form>
          </div>

          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="group rounded-lg border border-border bg-card p-5 hover:bg-stone/50 transition-colors cursor-pointer shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-5 w-5 text-primary dark:text-accent" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{job.title}</p>
                    <p className="text-xs text-secondary truncate mt-0.5">
                      {job.company}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border/60 text-xs text-secondary flex flex-wrap gap-x-4 gap-y-1">
                  <span>
                    {job.location} {job.isRemote && '(Remote)'}
                  </span>
                  <span>
                    Empl: {job.employmentType} · Apps: {job.applications}
                  </span>
                  <span>
                    Expires: {new Date(job.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}

            {(loading || jobs.length === 0) && (
              <div className="min-h-[200px] flex flex-col items-center justify-center py-8 text-secondary">
                <Briefcase className="h-8 w-8 mb-3 opacity-50" />
                <p>No jobs found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}