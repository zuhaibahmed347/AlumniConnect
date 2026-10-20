import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2, ChevronDown, UserPlus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { motion, Variants } from 'framer-motion'

const initialFilters = {
  search: '',
  graduationYear: undefined as number | undefined,
  degree: undefined as string | undefined,
  major: undefined as string | undefined,
  location: undefined as string | undefined,
  industry: undefined as string | undefined,
  skills: [] as string[],
  sortBy: 'newest' as 'newest' | 'oldest' | 'name',
  sortOrder: 'desc' as 'asc' | 'desc',
}

const directoryEntrance: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (staggerChildren: number = 0.15) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: staggerChildren,
    },
  }),
}

const cardEntrance: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 25,
      delay: 0.1,
    },
  },
}

export function AlumniDirectoryPage() {
  const [filters, setFilters] = useState<typeof initialFilters>(initialFilters)
  const [page, setPage] = useState(1)
  const [loading] = useState(false)

  // Mock alumni data structure for now
  const alumniData = [
    {
      id: '1',
      name: 'Ahmed Hassan',
      headline: 'Software Engineer at TechCorp',
      graduationYear: 2020,
      department: 'Computer Science',
      location: 'Karachi, Pakistan',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      skills: ['JavaScript', 'React', 'Node.js'],
      connectionStatus: 'Not Connected',
    },
    {
      id: '2',
      name: 'Saba Ahmed',
      headline: 'Marketing Manager at MegaCorp',
      graduationYear: 2019,
      department: 'Business Administration',
      location: 'Lahore, Pakistan',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      skills: ['Digital Marketing', 'SEO', 'Content Strategy'],
      connectionStatus: 'Connected',
    },
    {
      id: '3',
      name: 'Usman Khan',
      headline: 'Data Scientist at DataInsights',
      graduationYear: 2021,
      department: 'Computer Science',
      location: 'Islamabad, Pakistan',
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop',
      skills: ['Python', 'Machine Learning', 'SQL'],
      connectionStatus: 'Not Connected',
    },
    {
      id: '4',
      name: 'Fatima Shah',
      headline: 'HR Manager at HumaneCorp',
      graduationYear: 2018,
      department: 'Business Administration',
      location: 'Karachi, Pakistan',
      avatar: 'https://images.unsplash.com/photo-1494790108377-d9c69b4316e4?w=100&h=100&fit=crop',
      skills: ['HR', 'Recruitment', 'Employee Relations'],
      connectionStatus: 'Connected',
    },
  ]

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    setPage(1)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">Alumni Directory</h1>
            <Search className="h-5 w-5 text-secondary" />
          </div>
          <Button variant="ghost" size="sm">
            <UserPlus className="h-4 w-4 mr-2" /> Add Connection
          </Button>
        </div>
      </header>

      {/* Filters Section */}
      <section className="p-4 sm:p-6 bg-white mb-6">
        <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium mb-1">
              Search by name, skills, or department
            </label>
            <Input
              id="search"
              placeholder="Type to search..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>

          {/* Graduation Year */}
          <div>
            <label htmlFor="graduationYear" className="block text-sm font-medium mb-1">
              Graduation Year
            </label>
            <Input
              id="graduationYear"
              type="number"
              placeholder="e.g. 2020"
              value={filters.graduationYear || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  graduationYear: e.target
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
            />
          </div>

          {/* Degree */}
          <div>
            <label htmlFor="degree" className="block text-sm font-medium mb-1">
              Degree
            </label>
            <Input
              id="degree"
              placeholder="e.g. BS"
              value={filters.degree || ''}
              onChange={(e) =>
                setFilters({ ...filters, degree: e.target.value })
              }
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium mb-1">
              Location
            </label>
            <Input
              id="location"
              placeholder="e.g. Karachi"
              value={filters.location || ''}
              onChange={(e) =>
                setFilters({ ...filters, location: e.target.value })
              }
            />
          </div>

          {/* Skills Filter */}
          <div>
            <label htmlFor="skills" className="block text-sm font-medium mb-1">
              Skills
            </label>
            <div className="flex flex-wrap gap-2">
              <span
                className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium hover:text-primary hover:bg-primary/5 transition-colors"
              >
                All
                <ChevronDown className="ml-1 h-3 w-3" />
              </span>
              <span
                className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium bg-primary/5 text-primary hover:text-white hover:bg-primary transition-colors"
              >
                JavaScript
              </span>
              <span
                className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium bg-primary/5 text-primary hover:text-white hover:bg-primary transition-colors"
              >
                Python
              </span>
              <span
                className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium bg-primary/5 text-primary hover:text-white hover:bg-primary transition-colors"
              >
                React
              </span>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <select
              onChange={(e) =>
                setFilters({ ...filters, sortBy: e.target.value as any })
              }
              className="rounded border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>

          {/* Apply/Reset Buttons */}
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1">
              Apply Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setFilters(initialFilters)}
            >
              Reset
            </Button>
          </div>
        </form>
      </section>

      {/* Alumni Grid */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={directoryEntrance}
            initial="hidden"
            animate="visible"
          >
            {loading && (
              <div className="min-h-[200px] flex flex-col items-center justify-center py-8 text-secondary">
                <Loader2 className="h-6 w-6 mx-auto mb-3" />
                <p>Loading alumni...</p>
              </div>
            )}

            {!loading && alumniData.length === 0 && (
              <div className="min-h-[200px] flex flex-col items-center justify-center py-8 text-secondary">
                <svg
                  className="h-8 w-8 mb-3 opacity-50"
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
                <p>No alumni found matching your criteria.</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {alumniData.map((alumni) => (
                <motion.div
                  key={alumni.id}
                  variants={cardEntrance}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  style={{ transitionDelay: alumniData.indexOf(alumni) * 0.05 + 's' }}
                >
                  <div
                    className="group rounded-lg border bg-card p-4 hover:bg-card/80 transition-colors cursor-pointer"
                  >
                    <div className="h-24 w-24 rounded-md overflow-hidden mb-3">
                      <img
                        src={alumni.avatar}
                        alt={alumni.name}
                        className="w-full h-full object-cover"
                      />
                      {!alumni.avatar && (
                        <div
                          className="absolute inset-0 flex items-center justify-center bg-primary/20"
                        >
                          <span className="text-xs font-medium text-primary">
                            {alumni.name.substring(0, 2)}
                          </span>
                        </div>
                      )}
                    </div>
                    <h4 className="font-medium mb-1">{alumni.name}</h4>
                    <p className="text-sm text-secondary mb-1">
                      {alumni.headline}
                    </p>
                    <div className="flex flex-wrap gap-1 text-xs">
                      {alumni.skills.map((skill: string) => (
                        <span
                          key={skill}
                          className="inline-flex items-center rounded-full border border-primary/20 px-2 py-0.5 text-primary"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div
                      className="mt-2 pt-2 border-t border-border/10 flex items-center justify-between"
                    >
                      <span className="text-secondary">
                        {alumni.graduationYear} {alumni.department}
                      </span>
                      <span className="text-primary font-medium">
                        {alumni.connectionStatus}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {!loading && alumniData.length > 0 && (
              <div className="mt-6 flex justify-center items-center gap-2 text-sm text-secondary">
                <span>Page {page} of {Math.ceil(alumniData.length / 10)}</span>
                <Button
                  variant="outline"
                  size="default"
                  className="h-8 w-8 flex items-center justify-center"
                  onClick={() => setPage(1)}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="default"
                  className="h-8 w-8 flex items-center justify-center"
                  onClick={() => setPage(Math.max(page - 1, 1))}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="default"
                  className="h-8 w-8 flex items-center justify-center"
                  onClick={() => setPage(Math.min(page + 1, 4))}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="default"
                  className="h-8 w-8 flex items-center justify-center"
                  onClick={() => setPage(4)}
                >
                  Last
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </main>
  )
}