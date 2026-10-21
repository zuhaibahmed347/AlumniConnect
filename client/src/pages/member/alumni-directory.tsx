import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2, UserPlus, MapPin, ArrowUpRight } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'

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
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.07,
    },
  },
}

const cardEntrance: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 240,
      damping: 26,
    },
  },
}

const ALUMNI_DATA = [
  {
    id: '1',
    name: 'Ahmed Hassan',
    headline: 'Senior Software Engineer · TechCorp',
    graduationYear: 2020,
    department: 'Computer Science',
    location: 'Karachi, Pakistan',
    avatar: '/images/avatar.jpg',
    skills: ['TypeScript', 'React', 'Node.js'],
    connectionStatus: 'Connect',
  },
  {
    id: '2',
    name: 'Saba Ahmed',
    headline: 'Growth & Brand Lead · Creative Studio',
    graduationYear: 2019,
    department: 'Business Administration',
    location: 'Lahore, Pakistan',
    avatar: '/images/avatar.jpg',
    skills: ['Product Marketing', 'Growth', 'Analytics'],
    connectionStatus: 'Connected',
  },
  {
    id: '3',
    name: 'Usman Khan',
    headline: 'Principal Data Scientist · DataInsights',
    graduationYear: 2021,
    department: 'Computer Science',
    location: 'Islamabad, Pakistan',
    avatar: '/images/avatar.jpg',
    skills: ['Python', 'Machine Learning', 'SQL'],
    connectionStatus: 'Connect',
  },
  {
    id: '4',
    name: 'Fatima Shah',
    headline: 'VP People & Talent · HumaneCorp',
    graduationYear: 2018,
    department: 'Business Administration',
    location: 'Karachi, Pakistan',
    avatar: '/images/avatar.jpg',
    skills: ['Executive Search', 'People Ops', 'Mentorship'],
    connectionStatus: 'Connected',
  },
]

export function AlumniDirectoryPage() {
  const [filters, setFilters] = useState<typeof initialFilters>(initialFilters)
  const [page, setPage] = useState(1)
  const [loading] = useState(false)
  const [connectedIds, setConnectedIds] = useState<Record<string, boolean>>({
    '2': true,
    '4': true,
  })

  const filteredAlumni = ALUMNI_DATA.filter((alum) => {
    const q = filters.search.trim().toLowerCase()
    const matchSearch =
      !q ||
      alum.name.toLowerCase().includes(q) ||
      alum.headline.toLowerCase().includes(q) ||
      alum.department.toLowerCase().includes(q) ||
      alum.skills.some((s) => s.toLowerCase().includes(q))
    const matchYear =
      !filters.graduationYear || alum.graduationYear === filters.graduationYear
    const matchLocation =
      !filters.location ||
      alum.location.toLowerCase().includes(filters.location.toLowerCase())
    const matchSkill =
      filters.skills.length === 0 ||
      filters.skills.some((s) => alum.skills.includes(s))
    return matchSearch && matchYear && matchLocation && matchSkill
  })

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    setPage(1)
  }

  const toggleSkill = (skill: string) => {
    setFilters((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }))
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="page-container py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs font-mono uppercase tracking-wider text-primary hover:underline"
            >
              AlumniConnect
            </Link>
            <span aria-hidden="true" className="text-border">
              /
            </span>
            <h1 className="font-display text-xl font-bold tracking-tight">
              Alumni Directory
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="text-xs font-medium text-secondary hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Button variant="default" size="sm" className="px-3.5 py-2 h-auto">
              <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Invite Classmate
            </Button>
          </div>
        </div>
      </header>

      <div className="page-container py-8 space-y-8">
        {/* Filters Section */}
        <section className="rounded-2xl border border-border bg-white p-6 shadow-card">
          <form
            onSubmit={onSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end"
          >
            <div className="lg:col-span-4">
              <label htmlFor="search" className="block text-xs font-semibold mb-1.5">
                Search by name, skill, or faculty
              </label>
              <div className="relative">
                <Search className="h-4 w-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  id="search"
                  placeholder="e.g. Computer Science, React, Karachi..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="pl-9 h-9"
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <label
                htmlFor="graduationYear"
                className="block text-xs font-semibold mb-1.5"
              >
                Class Year
              </label>
              <Input
                id="graduationYear"
                type="number"
                placeholder="e.g. 2020"
                value={filters.graduationYear || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    graduationYear: e.target.value
                      ? parseInt(e.target.value, 10)
                      : undefined,
                  })
                }
                className="h-9 font-mono tabular-nums"
              />
            </div>

            <div className="lg:col-span-3">
              <label htmlFor="location" className="block text-xs font-semibold mb-1.5">
                Chapter / City
              </label>
              <Input
                id="location"
                placeholder="e.g. Karachi, Lahore"
                value={filters.location || ''}
                onChange={(e) =>
                  setFilters({ ...filters, location: e.target.value })
                }
                className="h-9"
              />
            </div>

            <div className="lg:col-span-3 flex gap-2">
              <Button type="submit" className="flex-1 h-9">
                Apply Filters
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 px-3"
                onClick={() => setFilters(initialFilters)}
              >
                Reset
              </Button>
            </div>
          </form>

          {/* Interactive Skill Filter Buttons */}
          <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-secondary mr-1">
              Filter by expertise:
            </span>
            {['TypeScript', 'React', 'Python', 'Machine Learning', 'Product Marketing'].map(
              (skill) => {
                const active = filters.skills.includes(skill)
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-primary text-white'
                        : 'bg-stone text-secondary hover:text-foreground'
                    }`}
                  >
                    {skill}
                  </button>
                )
              },
            )}
          </div>
        </section>

        {/* Alumni Grid */}
        <section>
          <motion.div
            variants={directoryEntrance}
            initial="hidden"
            animate="visible"
          >
            {loading && (
              <div className="min-h-[200px] flex flex-col items-center justify-center py-8 text-secondary">
                <Loader2 className="h-6 w-6 mx-auto mb-3 animate-spin" />
                <p>Loading alumni directory...</p>
              </div>
            )}

            {!loading && filteredAlumni.length === 0 && (
              <div className="rounded-2xl border border-border bg-white p-12 text-center text-secondary">
                <p className="font-display text-lg font-semibold text-foreground mb-1">
                  No alumni found matching your criteria
                </p>
                <p className="text-sm mb-4">
                  Try clearing your search query or selecting a different cohort year.
                </p>
                <Button variant="outline" onClick={() => setFilters(initialFilters)}>
                  Reset Filters
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredAlumni.map((alumni) => {
                const isConnected = Boolean(connectedIds[alumni.id])
                return (
                  <motion.article
                    key={alumni.id}
                    variants={cardEntrance}
                    className="group rounded-2xl border border-border bg-white p-6 flex flex-col justify-between hover:shadow-card-hover transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <img
                          src={alumni.avatar}
                          alt={alumni.name}
                          referrerPolicy="no-referrer"
                          className="h-14 w-14 rounded-xl object-cover ring-1 ring-border"
                        />
                        <span className="text-xs font-mono tabular-nums text-secondary">
                          Class of {alumni.graduationYear}
                        </span>
                      </div>

                      <h2 className="font-display text-lg font-bold text-foreground mb-1">
                        {alumni.name}
                      </h2>
                      <p className="text-xs text-secondary leading-relaxed mb-3">
                        {alumni.headline}
                      </p>

                      {/* Clean unboxed metadata */}
                      <p className="text-xs text-secondary/80 flex items-center gap-1.5 mb-4">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{alumni.location}</span>
                        <span aria-hidden="true">·</span>
                        <span>{alumni.department}</span>
                      </p>

                      <p className="text-xs text-secondary font-mono">
                        {alumni.skills.join(' · ')}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() =>
                          setConnectedIds((prev) => ({
                            ...prev,
                            [alumni.id]: !prev[alumni.id],
                          }))
                        }
                        className={`inline-flex items-center gap-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                          isConnected
                            ? 'text-success'
                            : 'text-primary hover:underline'
                        }`}
                      >
                        {isConnected ? 'Connected ✓' : 'Request Introduction'}
                        {!isConnected && <ArrowUpRight className="h-3.5 w-3.5" />}
                      </button>
                      <span className="text-[11px] font-mono text-secondary/70 tabular-nums">
                        Verified
                      </span>
                    </div>
                  </motion.article>
                )
              })}
            </div>

            {!loading && filteredAlumni.length > 0 && (
              <div className="mt-8 flex justify-center items-center gap-2 text-xs font-mono text-secondary tabular-nums">
                <span>
                  Page {page} of {Math.max(1, Math.ceil(filteredAlumni.length / 10))}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(page - 1, 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </motion.div>
        </section>
      </div>
    </main>
  )
}