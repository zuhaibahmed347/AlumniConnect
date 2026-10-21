import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, UserPlus } from 'lucide-react'
import { useState, useEffect } from 'react'

export function JobsPage() {

  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    status: 'active' as 'active' | 'expired',
    employmentType: undefined as EmploymentType | undefined,
    isRemote: undefined as boolean | undefined,
    location: undefined as string | undefined,
    page: 1,
    limit: 10,
  })

  useEffect(() => {
    // In a real app, this would fetch jobs from the API
    const mockJobs = [
      {
        id: '1',
        title: 'Software Engineer',
        company: 'TechCorp',
        companyLogoUrl: '/images/logos/techcorp.jpg',
        description: 'We are looking for a talented Software Engineer to join our team.',
        requirements: '3+ years of experience with React and Node.js',
        benefits: 'Competitive salary, health insurance, remote work',
        location: 'Karachi, Pakistan',
        isRemote: true,
        employmentType: 'FULL_TIME',
        status: 'ACTIVE',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      {
        id: '2',
        title: 'Data Scientist',
        company: 'DataInsights',
        companyLogoUrl: '/images/logos/datainsights.jpg',
        description: 'Analyze complex datasets to drive business decisions.',
        requirements: 'Master\'s degree in Data Science, 2+ years experience',
        benefits: 'Flexible hours, learning budget',
        location: 'Islamabad, Pakistan',
        isRemote: false,
        employmentType: 'FULL_TIME',
        status: 'ACTIVE',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
      },
      {
        id: '3',
        title: 'HR Associate',
        company: 'HumaneCorp',
        companyLogoUrl: '/images/logos/humane-corp.jpg',
        description: 'Support HR operations and employee relations.',
        requirements: 'Bachelor\'s degree in HR or Business',
        benefits: 'Paid time off, professional development',
        location: 'Lahore, Pakistan',
        isRemote: false,
        employmentType: 'CONTRACT',
        status: 'EXPIRED',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
        expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      },
    ]

    setJobs(mockJobs)
    setLoading(false)
  }, [])

  const employmentTypes: EmploymentType[] = [
    'FULL_TIME',
    'PART_TIME',
    'CONTRACT',
    'INTERNSHIP',
    'FREELANCE',
    'REMOTE',
  ]

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="min-h-[200px] flex flex-col items-center justify-center py-8">
          <Loader2 className="h-6 w-6 mx-auto mb-3" />
          <p>Loading jobs...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Jobs & Referrals</h1>
          <Button variant="ghost" size="sm">
            <UserPlus className="h-4 w-4 mr-2" /> Post Job
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <section className="mb-6 rounded-lg border bg-card/50 p-4">
          <h2 className="text-sm font-medium mb-4 text-secondary">Filter Jobs</h2>
          <form onSubmit={(e) => {
            e.preventDefault()
          }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            
            {/* Search */}
            <div>
              <Input
                placeholder="Search jobs..."
                className="flex-1 rounded border border-border px-3 py-2"
              />
            </div>

            {/* Employment Type */}
            <div>
              <select className="rounded border border-border px-3 py-2">
                <option>All Types</option>
                {employmentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <Input
                placeholder="Location"
                className="flex-1 rounded border border-border px-3 py-2"
              />
            </div>

            {/* Status */}
            <div>
              <select className="rounded border border-border px-3 py-2">
                <option>All Statuses</option>
                <option>Active</option>
                <option>Expired</option>
              </select>
            </div>

            {/* Apply Filters */}
            <Button type="submit" className="sm:col-auto w-auto">
              Apply
            </Button>
          </form>
        </section>

        {/* Jobs Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading && (
            <div className="min-h-[300px] flex flex-col items-center justify-center py-8 text-secondary">
              <Loader2 className="h-6 w-6 mx-auto mb-3" />
              <p>Loading jobs...</p>
            </div>
          )}

          {!loading && jobs.length === 0 && !loading && (
            <div className="min-h-[300px] flex flex-col items-center justify-center py-8 text-secondary text-center">
              <svg className="h-8 w-8 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v6a2 2 0 002 2H9a2 2 0 002-2zM5 13l7 7-7 7" />
              </svg>
              <p>No jobs found matching your criteria.</p>
            </div>
          )}

          {jobs.map((job) => {
            const isExpired = new Date() > new Date(job.expiresAt || 0)
            return (
              <div
                key={job.id}
                className={`rounded-lg border ${
                  isExpired ? 'bg-error/5 border-error' : 'bg-card border-border/50'
                } p-4 hover:${
                  isExpired
                    ? 'bg-error/10'
                    : 'bg-card/80'
                } transition-colors cursor-pointer`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={job.companyLogoUrl}
                      alt={job.company}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium mb-1">{job.title}</h4>
                    <p className="text-sm text-secondary truncate-line">{job.company}</p>
                  </div>
                  {/* Status badge */}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium ${
                    isExpired ? 'text-error bg-error/10' : 'text-primary bg-primary/10'
                  }`}>
                    {isExpired ? 'Expired' : 'Active'}
                  </span>
                </div>
                <p className="text-sm text-secondary/70 line-clamp-2 mb-3">
                  {job.description}
                </p>
                <div className="flex items-center justify-between text-xs text-secondary/70">
                  <div>
                    <span>{job.location}</span>
                    <span>{job.employmentType}</span>
                  </div>
                  <span>{new Date(job.expiresAt).toLocaleDateString()}</span>
                </div>
              </div>
            )
          })}

          {/* Pagination */}
          {jobs.length > 0 && (
            <div className="mt-6 flex justify-center items-center gap-2 text-sm text-secondary">
              <span>Page {filters.page} of {Math.ceil(jobs.length / filters.limit)}</span>
              <Button
                variant="outline"
                size="default"
                className="h-8 w-8 flex items-center justify-center"
                onClick={() => setFilters({ ...filters, page: 1 })}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="default"
                className="h-8 w-8 flex items-center justify-center"
                onClick={() => setFilters({ ...filters, page: Math.max(filters.page - 1, 1)})}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="default"
                className="h-8 w-8 flex items-center justify-center"
                onClick={() => setFilters({ ...filters, page: Math.min(filters.page + 1, 4)})}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="default"
                className="h-8 w-8 flex items-center justify-center"
                onClick={() => setFilters({ ...filters, page: 4 })}
              >
                Last
              </Button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

// Type for employment type
type EmploymentType = 
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'INTERNSHIP'
  | 'FREELANCE'
  | 'REMOTE'