import { Input, SelectField } from '@/components/ui/input'
import {
  MENTORSHIP_GOALS,
  type MentorAvailabilityFilter,
  type MentorshipGoalId,
} from '@/lib/mentorship-data'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import {
  Bookmark,
  Briefcase,
  Check,
  Clock,
  Code2,
  Globe2,
  RotateCcw,
  Search,
  SlidersHorizontal,
  UserCheck,
  Users,
  X,
} from 'lucide-react'

const springIndicator = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 30,
}

const tagSpring = {
  type: 'spring' as const,
  stiffness: 360,
  damping: 26,
}

export interface MentorFilterSystemProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  availabilityFilter: MentorAvailabilityFilter
  onAvailabilityChange: (value: MentorAvailabilityFilter) => void
  selectedIndustries: string[]
  onToggleIndustry: (industry: string) => void
  onClearIndustries: () => void
  selectedExpertise: string[]
  onToggleExpertise: (expertise: string) => void
  onClearExpertise: () => void
  selectedChapter: string
  onChapterChange: (chapter: string) => void
  selectedGoal: MentorshipGoalId
  onGoalChange: (goal: MentorshipGoalId) => void
  onResetAll: () => void
  industries: string[]
  expertiseTopics: string[]
  chapters: string[]
  industryCounts: Record<string, number>
  expertiseCounts: Record<string, number>
  availabilityCounts: Record<MentorAvailabilityFilter, number>
  totalMentors: number
  filteredCount: number
  openSlotsTotal: number
}

export interface ActiveFilterTag {
  id: string
  category: string
  label: string
  onRemove: () => void
}

export function MentorFilterSystem({
  searchQuery,
  onSearchChange,
  availabilityFilter,
  onAvailabilityChange,
  selectedIndustries,
  onToggleIndustry,
  onClearIndustries,
  selectedExpertise,
  onToggleExpertise,
  onClearExpertise,
  selectedChapter,
  onChapterChange,
  selectedGoal,
  onGoalChange,
  onResetAll,
  industries,
  expertiseTopics,
  chapters,
  industryCounts,
  expertiseCounts,
  availabilityCounts,
  totalMentors,
  filteredCount,
  openSlotsTotal,
}: MentorFilterSystemProps) {
  const availabilityOptions: {
    id: MentorAvailabilityFilter
    label: string
    icon: typeof Users
  }[] = [
    { id: 'ALL', label: 'All Mentors', icon: Users },
    { id: 'AVAILABLE', label: 'Accepting Mentees', icon: UserCheck },
    { id: 'WAITLIST', label: 'Cohort Waitlist', icon: Clock },
    { id: 'SHORTLISTED', label: 'Saved Shortlist', icon: Bookmark },
  ]

  // Build list of active filter tags for the motion-enabled tag bar
  const activeTags: ActiveFilterTag[] = []

  if (selectedGoal !== 'ALL') {
    const goalMeta = MENTORSHIP_GOALS.find((g) => g.id === selectedGoal)
    activeTags.push({
      id: `goal-${selectedGoal}`,
      category: 'Objective',
      label: goalMeta?.shortLabel ?? selectedGoal,
      onRemove: () => onGoalChange('ALL'),
    })
  }

  if (availabilityFilter !== 'ALL') {
    const availMeta = availabilityOptions.find(
      (a) => a.id === availabilityFilter,
    )
    activeTags.push({
      id: `avail-${availabilityFilter}`,
      category: 'Availability',
      label: availMeta?.label ?? availabilityFilter,
      onRemove: () => onAvailabilityChange('ALL'),
    })
  }

  selectedIndustries.forEach((industry) => {
    activeTags.push({
      id: `industry-${industry}`,
      category: 'Industry',
      label: industry,
      onRemove: () => onToggleIndustry(industry),
    })
  })

  selectedExpertise.forEach((topic) => {
    activeTags.push({
      id: `expertise-${topic}`,
      category: 'Expertise',
      label: topic,
      onRemove: () => onToggleExpertise(topic),
    })
  })

  if (selectedChapter !== 'ALL') {
    activeTags.push({
      id: `chapter-${selectedChapter}`,
      category: 'Chapter',
      label: selectedChapter,
      onRemove: () => onChapterChange('ALL'),
    })
  }

  if (searchQuery.trim() !== '') {
    activeTags.push({
      id: 'search-query',
      category: 'Keyword',
      label: `"${searchQuery.trim()}"`,
      onRemove: () => onSearchChange(''),
    })
  }

  const hasActiveFilters = activeTags.length > 0

  return (
    <div
      className="rounded-2xl border border-border bg-card shadow-card overflow-visible"
      role="region"
      aria-label="Interactive Mentor Filtering System"
    >
      {/* Distinct Colored Header Band for Filter Console */}
      <div className="rounded-t-2xl border-b border-border bg-stone/75 px-5 py-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="h-8 w-8 rounded-lg border border-primary/30 bg-accent text-primary flex items-center justify-center shrink-0">
            <SlidersHorizontal className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider font-bold text-primary">
              Multi-Facet Mentor Discovery Console
            </p>
            <h3 className="font-display text-base font-bold text-foreground">
              Filter by Industry, Expertise, Chapter & Availability
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-card px-3.5 py-2 text-xs font-mono text-foreground tabular-nums shadow-2xs">
          <span>
            Showing{' '}
            <strong className="font-bold text-primary">{filteredCount}</strong>{' '}
            of {totalMentors} Mentors
          </span>
          <span aria-hidden="true" className="text-border">
            |
          </span>
          <span className="text-primary font-bold">
            {openSlotsTotal} Open Slots
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Row 1: Search Input + 3 Styled Custom Dropdown Selectors */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end pb-5 border-b border-border">
          <div className="lg:col-span-5 space-y-1.5">
            <label
              htmlFor="mentor-search-input"
              className="text-xs font-mono uppercase tracking-wider font-bold text-foreground/90 flex items-center gap-1.5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Keyword Search
            </label>
            <div className="relative">
              <Search
                className="h-4 w-4 text-primary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <Input
                id="mentor-search-input"
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by mentor name, company, topic, or stack..."
                aria-label="Search mentors by name, company, industry, or expertise"
                className="pl-10 pr-9 w-full text-foreground placeholder:text-secondary/80 font-medium"
              />
              <AnimatePresence>
                {searchQuery.trim().length > 0 && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.14 }}
                    onClick={() => onSearchChange('')}
                    aria-label="Clear search query"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-secondary hover:text-foreground hover:bg-stone transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Custom Dropdown 1: Regional Chapter */}
          <div className="lg:col-span-3">
            <SelectField
              label="Regional Chapter"
              aria-label="Filter by Regional Chapter"
              icon={<Globe2 className="h-4 w-4" />}
              value={selectedChapter}
              onChange={(e) => onChapterChange(e.target.value)}
            >
              {chapters.map((chapter) => (
                <option key={chapter} value={chapter}>
                  {chapter === 'ALL' ? 'All Global Chapters' : chapter}
                </option>
              ))}
            </SelectField>
          </div>

          {/* Custom Dropdown 2: Quick Industry Jump */}
          <div className="lg:col-span-2">
            <SelectField
              label="Industry Quick-Pick"
              aria-label="Quick select industry sector"
              icon={<Briefcase className="h-4 w-4" />}
              value={selectedIndustries[0] ?? 'ALL'}
              onChange={(e) => {
                const val = e.target.value
                if (val === 'ALL') {
                  onClearIndustries()
                } else if (!selectedIndustries.includes(val)) {
                  onToggleIndustry(val)
                }
              }}
            >
              <option value="ALL">All Industries</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind} ({industryCounts[ind] ?? 0})
                </option>
              ))}
            </SelectField>
          </div>

          {/* Custom Dropdown 3: Quick Expertise Jump */}
          <div className="lg:col-span-2">
            <SelectField
              label="Skill Quick-Pick"
              aria-label="Quick select expertise topic"
              icon={<Code2 className="h-4 w-4" />}
              value={selectedExpertise[0] ?? 'ALL'}
              onChange={(e) => {
                const val = e.target.value
                if (val === 'ALL') {
                  onClearExpertise()
                } else if (!selectedExpertise.includes(val)) {
                  onToggleExpertise(val)
                }
              }}
            >
              <option value="ALL">All Skills</option>
              {expertiseTopics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic} ({expertiseCounts[topic] ?? 0})
                </option>
              ))}
            </SelectField>
          </div>
        </div>

        {/* Partitioned Facet 1: Availability Filter (Segmented Motion Control) */}
        <div className="rounded-xl border border-border bg-background p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-primary flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-primary" />
              01 · Availability & Cohort Capacity Status
            </span>
            <span className="text-xs font-mono text-secondary">
              Filter by real-time 1-on-1 mentee slot availability
            </span>
          </div>

          <LayoutGroup id="mentor-availability-group">
            <div
              role="group"
              aria-label="Filter by Mentor Availability"
              className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-xl border border-border bg-card p-1.5"
            >
              {availabilityOptions.map((option) => {
                const Icon = option.icon
                const isSelected = availabilityFilter === option.id
                const count = availabilityCounts[option.id] ?? 0

                return (
                  <motion.button
                    key={option.id}
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onAvailabilityChange(option.id)}
                    aria-pressed={isSelected}
                    className={`relative flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'text-primary-foreground'
                        : 'text-foreground hover:bg-stone/70'
                    }`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="mentor-availability-active-bg"
                        transition={springIndicator}
                        className="absolute inset-0 rounded-lg bg-primary shadow-sm"
                      />
                    )}
                    <span className="relative z-10 inline-flex items-center gap-1.5 truncate">
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{option.label}</span>
                    </span>
                    <span
                      className={`relative z-10 font-mono text-[11px] font-bold tabular-nums px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-black/20 text-primary-foreground'
                          : 'bg-stone text-foreground'
                      }`}
                    >
                      {count}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </LayoutGroup>
        </div>

        {/* Partitioned Facet 2 & 3 Side-by-Side: Industry Sectors & Domain Expertise */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Facet 2: Industry Filter */}
          <div className="rounded-xl border border-border bg-background p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-primary flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-primary" />
                02 · Industry Sectors
                {selectedIndustries.length > 0 && (
                  <span className="rounded bg-accent px-1.5 py-0.5 font-mono text-[10px] text-primary font-bold tabular-nums">
                    {selectedIndustries.length} active
                  </span>
                )}
              </span>
              {selectedIndustries.length > 0 ? (
                <button
                  type="button"
                  onClick={onClearIndustries}
                  className="text-xs font-mono font-semibold text-primary hover:underline cursor-pointer"
                >
                  Reset industries
                </button>
              ) : (
                <span className="text-[11px] font-mono text-secondary">
                  Multi-select enabled
                </span>
              )}
            </div>

            <div
              role="group"
              aria-label="Filter by Industry Sector"
              className="flex flex-wrap items-center gap-2"
            >
              <motion.button
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClearIndustries}
                aria-pressed={selectedIndustries.length === 0}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  selectedIndustries.length === 0
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-card text-foreground hover:border-primary/60 hover:bg-stone/70'
                }`}
              >
                <span>All Industries</span>
                <span
                  className={`font-mono text-[11px] font-bold tabular-nums ${
                    selectedIndustries.length === 0
                      ? 'text-primary-foreground/90'
                      : 'text-primary'
                  }`}
                >
                  {totalMentors}
                </span>
              </motion.button>

              {industries.map((industry) => {
                const isSelected = selectedIndustries.includes(industry)
                const count = industryCounts[industry] ?? 0

                return (
                  <motion.button
                    key={industry}
                    type="button"
                    layout
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    transition={tagSpring}
                    onClick={() => onToggleIndustry(industry)}
                    aria-pressed={isSelected}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-border bg-card text-foreground hover:border-primary/60 hover:bg-stone/70'
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                    <span>{industry}</span>
                    <span
                      className={`font-mono text-[11px] font-bold tabular-nums ${
                        isSelected ? 'text-primary-foreground/90' : 'text-primary'
                      }`}
                    >
                      {count}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Facet 3: Domain Expertise Filter */}
          <div className="rounded-xl border border-border bg-background p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-primary flex items-center gap-1.5">
                <Code2 className="h-4 w-4 text-primary" />
                03 · Domain Expertise & Craft
                {selectedExpertise.length > 0 && (
                  <span className="rounded bg-accent px-1.5 py-0.5 font-mono text-[10px] text-primary font-bold tabular-nums">
                    {selectedExpertise.length} active
                  </span>
                )}
              </span>
              {selectedExpertise.length > 0 ? (
                <button
                  type="button"
                  onClick={onClearExpertise}
                  className="text-xs font-mono font-semibold text-primary hover:underline cursor-pointer"
                >
                  Reset expertise
                </button>
              ) : (
                <span className="text-[11px] font-mono text-secondary">
                  Toggle specializations
                </span>
              )}
            </div>

            <div
              role="group"
              aria-label="Filter by Domain Expertise"
              className="flex flex-wrap items-center gap-2"
            >
              <motion.button
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClearExpertise}
                aria-pressed={selectedExpertise.length === 0}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  selectedExpertise.length === 0
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-card text-foreground hover:border-primary/60 hover:bg-stone/70'
                }`}
              >
                <span>All Expertise</span>
              </motion.button>

              {expertiseTopics.map((topic) => {
                const isSelected = selectedExpertise.includes(topic)
                const count = expertiseCounts[topic] ?? 0

                return (
                  <motion.button
                    key={topic}
                    type="button"
                    layout
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    transition={tagSpring}
                    onClick={() => onToggleExpertise(topic)}
                    aria-pressed={isSelected}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-border bg-card text-foreground hover:border-primary/60 hover:bg-stone/70'
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                    <span>{topic}</span>
                    <span
                      className={`font-mono text-[11px] font-bold tabular-nums ${
                        isSelected ? 'text-primary-foreground/90' : 'text-primary'
                      }`}
                    >
                      {count}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Motion-Enabled Selected Filter Tags Bar */}
        <AnimatePresence initial={false}>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-primary/30 bg-accent/45 p-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider font-bold text-primary mr-1">
                    Active Filters ({activeTags.length}):
                  </span>

                  <AnimatePresence mode="popLayout">
                    {activeTags.map((tag) => (
                      <motion.button
                        key={tag.id}
                        layout
                        type="button"
                        initial={{ opacity: 0, scale: 0.86, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.86, y: -4 }}
                        whileHover={{ y: -1, scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        transition={tagSpring}
                        onClick={tag.onRemove}
                        aria-label={`Remove ${tag.category} filter: ${tag.label}`}
                        className="group inline-flex items-center gap-1.5 rounded-lg border border-primary bg-card px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <span className="font-mono text-[11px] font-bold text-primary group-hover:text-primary-foreground">
                          {tag.category}:
                        </span>
                        <span className="font-semibold text-foreground group-hover:text-primary-foreground">
                          {tag.label}
                        </span>
                        <X className="h-3.5 w-3.5 text-primary group-hover:text-primary-foreground shrink-0 ml-0.5" />
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>

                <motion.button
                  type="button"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={onResetAll}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-mono font-bold text-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Clear All Filters</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
