import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { GlobalSearchTrigger } from '@/components/ui/global-search-bar'
import { RoleSwitcherStrip } from '@/components/layout/role-shell'
import {
  AlumniWorldMap,
  type CountryAlumniRecord,
} from '@/components/ui/alumni-world-map'
import {
  Search,
  Loader2,
  UserPlus,
  MapPin,
  ArrowUpRight,
  Globe2,
  X,
} from 'lucide-react'
import { useState, useEffect, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { toast } from '@/lib/toast'
import {
  loadConnectedAlumniIds,
  saveConnectedAlumniIds,
} from '@/lib/role-context'
import { api } from '@/services/api'

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
    country: 'Pakistan',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=480&q=80',
    skills: ['TypeScript', 'React', 'Node.js'],
    connectionStatus: 'Connect',
  },
  {
    id: '2',
    name: 'Sanaullah Memon',
    headline: 'Director of Payment Rail Product · Careem',
    graduationYear: 2016,
    department: 'Business Administration',
    location: 'Dubai, United Arab Emirates',
    country: 'United Arab Emirates',
    avatar:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=480&q=80',
    skills: ['Product Marketing', 'FinTech', 'Analytics'],
    connectionStatus: 'Connected',
  },
  {
    id: '3',
    name: 'Dr. Aamir Soomro',
    headline: 'VP of AI Infrastructure · AI Innovations',
    graduationYear: 2014,
    department: 'Computer Science',
    location: 'Munich, Germany',
    country: 'Germany',
    avatar:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=480&q=80',
    skills: ['Python', 'Machine Learning', 'Kubernetes'],
    connectionStatus: 'Connect',
  },
  {
    id: '4',
    name: 'Kamran Mahar',
    headline: 'Managing Director, Cloud Security · HumaneCorp',
    graduationYear: 2011,
    department: 'Computer Science',
    location: 'Riyadh, Saudi Arabia',
    country: 'Saudi Arabia',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=480&q=80',
    skills: ['Cloud Security', 'Executive Search', 'Mentorship'],
    connectionStatus: 'Connected',
  },
  {
    id: '5',
    name: 'Nadia Talpur',
    headline: 'Head of Design Engineering · Creative Studio',
    graduationYear: 2018,
    department: 'Computer Science',
    location: 'London, United Kingdom',
    country: 'United Kingdom',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=480&q=80',
    skills: ['React', 'Design Systems', 'TypeScript'],
    connectionStatus: 'Connect',
  },
  {
    id: '6',
    name: 'Zainab Khuhro',
    headline: 'Staff Applied AI Scientist · AI Innovations',
    graduationYear: 2017,
    department: 'Computer Science',
    location: 'San Francisco, United States',
    country: 'United States of America',
    avatar:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=480&q=80',
    skills: ['Python', 'Machine Learning', 'LLMs'],
    connectionStatus: 'Connect',
  },
  {
    id: '7',
    name: 'Bilal Ahmed Qureshi',
    headline: 'Chief Data Officer · DataInsights',
    graduationYear: 2017,
    department: 'Data Science',
    location: 'Islamabad, Pakistan',
    country: 'Pakistan',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=480&q=80',
    skills: ['Python', 'Machine Learning', 'SQL'],
    connectionStatus: 'Connect',
  },
  {
    id: '8',
    name: 'Farhan Ali Bhutto',
    headline: 'Partner, Enterprise Data Advisory · DataInsights',
    graduationYear: 2015,
    department: 'Business Administration',
    location: 'Toronto, Canada',
    country: 'Canada',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=480&q=80',
    skills: ['Analytics', 'Product Marketing', 'SQL'],
    connectionStatus: 'Connected',
  },
  {
    id: '9',
    name: 'Ayesha Siddiqui',
    headline: 'Principal Systems Architect · CloudScale',
    graduationYear: 2019,
    department: 'Computer Science',
    location: 'Karachi, Pakistan',
    country: 'Pakistan',
    avatar:
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=480&q=80',
    skills: ['TypeScript', 'Node.js', 'Kubernetes'],
    connectionStatus: 'Connect',
  },
  {
    id: '10',
    name: 'Hina Soomro',
    headline: 'Staff Power Systems Engineer · Siemens Energy',
    graduationYear: 2017,
    department: 'Electrical Engineering',
    location: 'Munich, Germany',
    country: 'Germany',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=480&q=80',
    skills: ['Python', 'Machine Learning', 'Analytics'],
    connectionStatus: 'Connect',
  },
]

export function AlumniDirectoryPage() {
  const [searchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [filters, setFilters] = useState<typeof initialFilters>({
    ...initialFilters,
    search: initialQuery,
  })
  const [page, setPage] = useState(1)
  const [loading] = useState(false)
  const [showWorldMap, setShowWorldMap] = useState(true)

  useEffect(() => {
    const qParam = searchParams.get('q')
    if (qParam !== null) {
      setFilters((prev) => ({ ...prev, search: qParam }))
    }
  }, [searchParams])
  const [connectedIds, setConnectedIds] = useState<Record<string, boolean>>(() => {
    const stored = loadConnectedAlumniIds()
    const map: Record<string, boolean> = { '2': true, '4': true, '8': true }
    for (const [k, v] of Object.entries(stored)) {
      if (v === 'CONNECTED' || v === 'PENDING') map[k] = true
    }
    return map
  })

  useEffect(() => {
    const syncConnections = () => {
      const stored = loadConnectedAlumniIds()
      const map: Record<string, boolean> = { '2': true, '4': true, '8': true }
      for (const [k, v] of Object.entries(stored)) {
        if (v === 'CONNECTED' || v === 'PENDING') map[k] = true
      }
      setConnectedIds(map)
    }
    window.addEventListener('siba-backend-hydrated', syncConnections)
    return () => window.removeEventListener('siba-backend-hydrated', syncConnections)
  }, [])

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
      alum.location.toLowerCase().includes(filters.location.toLowerCase()) ||
      alum.country.toLowerCase().includes(filters.location.toLowerCase())
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

  const handleMapCountrySelect = (country: CountryAlumniRecord) => {
    setFilters((prev) => ({
      ...prev,
      location:
        prev.location === country.countryName ? undefined : country.countryName,
    }))
    toast.success(
      `Inspecting ${country.displayName} (${country.alumniCount.toLocaleString()} verified alumni)`
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <RoleSwitcherStrip />
      {/* Header */}
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
              Global Alumni Directory
            </h1>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowWorldMap((v) => !v)}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-stone transition-colors"
            >
              <Globe2 className="h-3.5 w-3.5 text-primary" />
              {showWorldMap ? 'Hide 42-Country Map' : 'Show 42-Country Map'}
            </button>
            <Link
              to="/dashboard"
              className="hidden md:inline-flex text-xs font-medium text-secondary hover:text-foreground transition-colors px-2"
            >
              Dashboard
            </Link>
            <GlobalSearchTrigger compact />
            <ThemeSwitcher />
            <Button
              variant="default"
              size="sm"
              className="px-3.5 py-2 h-auto"
              onClick={() =>
                toast.success('Invitation link copied to your clipboard.')
              }
            >
              <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Invite Classmate
            </Button>
          </div>
        </div>
      </header>

      <div className="page-container py-8 space-y-8">
        {/* Collapsible D3.js Interactive 42-Country Distribution Map */}
        <AnimatePresence initial={false}>
          {showWorldMap && (
            <motion.section
              key="directory-world-map"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <AlumniWorldMap
                variant="adaptive"
                onCountrySelect={handleMapCountrySelect}
              />
            </motion.section>
          )}
        </AnimatePresence>

        {/* Filters Section */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <form
            onSubmit={onSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end"
          >
            <div className="lg:col-span-4">
              <label
                htmlFor="search"
                className="block text-xs font-semibold mb-1.5"
              >
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
                  className="pl-9 h-10"
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
                placeholder="e.g. 2018"
                value={filters.graduationYear || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    graduationYear: e.target.value
                      ? parseInt(e.target.value, 10)
                      : undefined,
                  })
                }
                className="h-10 font-mono tabular-nums"
              />
            </div>

            <div className="lg:col-span-3">
              <label
                htmlFor="location"
                className="block text-xs font-semibold mb-1.5"
              >
                Country / Chapter City
              </label>
              <div className="relative">
                <Input
                  id="location"
                  placeholder="e.g. Pakistan, Germany, Dubai"
                  value={filters.location || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      location: e.target.value || undefined,
                    })
                  }
                  className="h-10 pr-8"
                />
                {filters.location && (
                  <button
                    type="button"
                    aria-label="Clear location filter"
                    onClick={() =>
                      setFilters({ ...filters, location: undefined })
                    }
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-3 flex gap-2">
              <Button type="submit" className="flex-1 h-10">
                Apply Filters
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 px-3"
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
            {[
              'TypeScript',
              'React',
              'Python',
              'Machine Learning',
              'Product Marketing',
              'Cloud Security',
            ].map((skill) => {
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
            })}
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
              <div className="rounded-2xl border border-border bg-card p-12 text-center text-secondary">
                <p className="font-display text-lg font-semibold text-foreground mb-1">
                  No spotlight profiles in this sample match “
                  {filters.location || filters.search}”
                </p>
                <p className="text-sm mb-4">
                  Clear the active filter to browse all featured Sukkur IBA
                  scholars across chapters.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setFilters(initialFilters)}
                >
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
                    layout
                    variants={cardEntrance}
                    whileHover={{
                      y: -5,
                      boxShadow: '0 16px 36px -8px rgb(9 20 34 / 0.11)',
                    }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                    className="group rounded-2xl border border-border bg-card p-6 flex flex-col justify-between transition-colors shadow-card"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <Link to={`/alumni/${alumni.id}`}>
                          <img
                            src={alumni.avatar}
                            alt={alumni.name}
                            referrerPolicy="no-referrer"
                            className="h-14 w-14 rounded-xl object-cover ring-1 ring-border hover:ring-primary transition-all"
                          />
                        </Link>
                        <span className="text-xs font-mono tabular-nums text-secondary">
                          Class of {alumni.graduationYear}
                        </span>
                      </div>

                      <Link
                        to={`/alumni/${alumni.id}`}
                        className="font-display text-lg font-bold text-foreground hover:text-primary transition-colors mb-1 block"
                      >
                        {alumni.name}
                      </Link>
                      <p className="font-sans text-sm text-foreground/85 leading-relaxed mb-3">
                        {alumni.headline}
                      </p>

                      {/* Clean unboxed metadata */}
                      <p className="font-sans text-xs text-secondary flex items-center gap-1.5 mb-3.5">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{alumni.location}</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{alumni.department}</span>
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {alumni.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-md border border-border bg-stone px-2 py-0.5 font-sans text-xs font-medium text-foreground/90"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          const nextVal = !connectedIds[alumni.id]
                          const nextMap = {
                            ...connectedIds,
                            [alumni.id]: nextVal,
                          }
                          setConnectedIds(nextMap)
                          const persisted: Record<string, 'CONNECTED' | 'PENDING'> = {}
                          for (const [k, v] of Object.entries(nextMap)) {
                            if (v) persisted[k] = 'CONNECTED'
                          }
                          saveConnectedAlumniIds(persisted)
                          if (nextVal) {
                            void api.post(`/alumni/${alumni.id}/connect`).catch(() => {})
                            toast.success(`Connected with ${alumni.name}.`)
                          }
                        }}
                        className={`inline-flex items-center gap-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          isConnected
                            ? 'text-success'
                            : 'text-primary hover:underline'
                        }`}
                      >
                        {isConnected ? 'Connected ✓' : 'Request Introduction'}
                        {!isConnected && (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <Link
                        to={`/alumni/${alumni.id}`}
                        className="text-xs font-mono font-semibold text-primary hover:underline tabular-nums"
                      >
                        View Profile →
                      </Link>
                    </div>
                  </motion.article>
                )
              })}
            </div>

            {!loading && filteredAlumni.length > 0 && (
              <div className="mt-8 flex justify-center items-center gap-2 text-xs font-mono text-secondary tabular-nums">
                <span>
                  Page {page} of{' '}
                  {Math.max(1, Math.ceil(filteredAlumni.length / 10))}
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