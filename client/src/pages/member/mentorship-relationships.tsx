import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { GlobalSearchTrigger } from '@/components/ui/global-search-bar'
import {
  loadMentorshipRequests,
  saveMentorshipRequests,
  type StoredMentorshipRequest,
} from '@/lib/mentorship-data'
import { toast } from '@/lib/toast'
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Users,
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

type RelationshipFilter = 'ALL' | 'ACTIVE' | 'PENDING' | 'COMPLETED'

export function MentorshipRelationshipsPage() {
  const [relationships, setRelationships] = useState<StoredMentorshipRequest[]>(
    () => loadMentorshipRequests(),
  )
  const [statusFilter, setStatusFilter] = useState<RelationshipFilter>('ALL')
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [noteDraft, setNoteDraft] = useState('')

  const counts = useMemo(() => {
    return {
      all: relationships.length,
      active: relationships.filter((r) => r.status === 'ACTIVE').length,
      pending: relationships.filter((r) => r.status === 'PENDING').length,
      completed: relationships.filter((r) => r.status === 'COMPLETED').length,
    }
  }, [relationships])

  const filteredRelationships = useMemo(() => {
    if (statusFilter === 'ALL') return relationships
    return relationships.filter((r) => r.status === statusFilter)
  }, [relationships, statusFilter])

  const updateRelationshipStatus = (
    id: string,
    nextStatus: StoredMentorshipRequest['status'],
    message: string,
  ) => {
    const updated = relationships.map((rel) => {
      if (rel.id !== id) return rel
      return {
        ...rel,
        status: nextStatus,
        startedAt:
          nextStatus === 'ACTIVE' && !rel.startedAt
            ? new Date().toISOString().slice(0, 10)
            : rel.startedAt,
      }
    })
    setRelationships(updated)
    saveMentorshipRequests(updated)
    toast.success(message)
  }

  const handleAddSessionNote = (id: string) => {
    const trimmed = noteDraft.trim()
    if (!trimmed) {
      toast.error('Please enter a session note before saving.')
      return
    }
    const updated = relationships.map((rel) => {
      if (rel.id !== id) return rel
      return {
        ...rel,
        meetingCount: rel.meetingCount + 1,
        lastMeeting: new Date().toISOString().slice(0, 10),
        notes: [trimmed, ...(rel.notes ?? [])],
      }
    })
    setRelationships(updated)
    saveMentorshipRequests(updated)
    setNoteDraft('')
    setActiveNoteId(null)
    toast.success('Session note logged and meeting counter updated.')
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="page-container py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-sm">
            <Link
              to="/mentorship"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-primary hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Mentorship Guild
            </Link>
            <span aria-hidden="true" className="text-border">
              /
            </span>
            <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground">
              My Mentorship Relationships
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <GlobalSearchTrigger />
            <Link to="/mentorship">
              <Button variant="default" size="sm">
                <Users className="h-3.5 w-3.5 mr-1.5" />
                Find Another Mentor
              </Button>
            </Link>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <div className="page-container py-8 sm:py-10 space-y-8">
        {/* Telemetry Summary Strip */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="font-display text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
                {counts.all}
              </p>
              <p className="text-xs font-mono text-secondary mt-1">
                Total Mentorship Records
              </p>
            </div>
            <div>
              <p className="font-display text-2xl sm:text-3xl font-bold text-primary tabular-nums">
                {counts.active}
              </p>
              <p className="text-xs font-mono text-secondary mt-1">
                Active Apprenticeships
              </p>
            </div>
            <div>
              <p className="font-display text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
                {counts.pending}
              </p>
              <p className="text-xs font-mono text-secondary mt-1">
                Pending Confirmation
              </p>
            </div>
            <div>
              <p className="font-display text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
                {counts.completed}
              </p>
              <p className="text-xs font-mono text-secondary mt-1">
                Graduated Cohorts
              </p>
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div
            role="tablist"
            aria-label="Filter mentorship relationships by status"
            className="flex flex-wrap items-center gap-2"
          >
            {(
              [
                { id: 'ALL', label: `All (${counts.all})` },
                { id: 'ACTIVE', label: `Active (${counts.active})` },
                { id: 'PENDING', label: `Pending (${counts.pending})` },
                { id: 'COMPLETED', label: `Completed (${counts.completed})` },
              ] as const
            ).map((tab) => {
              const isSelected = statusFilter === tab.id
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`rounded-xl border px-3.5 py-2 text-xs font-mono transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground font-semibold'
                      : 'border-border bg-card text-secondary hover:text-foreground hover:border-primary/40'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Relationships Ledger */}
        {filteredRelationships.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center space-y-3">
            <Calendar className="h-8 w-8 text-secondary mx-auto" />
            <h2 className="font-display text-lg font-bold text-foreground">
              No mentorship records in this view
            </h2>
            <p className="text-sm text-secondary max-w-md mx-auto">
              Browse the Mentorship Guild to book a 1-on-1 office hours slot or apply for a 6-month mentorship cohort.
            </p>
            <Link to="/mentorship">
              <Button variant="default" size="sm">
                Explore Mentors
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredRelationships.map((rel) => {
                const isAddingNote = activeNoteId === rel.id
                return (
                  <motion.article
                    layout
                    key={rel.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <Link
                          to={`/mentorship/mentors/${rel.mentorId}`}
                          className="h-12 w-12 rounded-xl border border-border bg-primary/10 text-primary font-display font-bold text-sm flex items-center justify-center shrink-0 hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          {rel.mentorName
                            .split(' ')
                            .map((p) => p[0])
                            .slice(0, 2)
                            .join('')}
                        </Link>
                        <div>
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                            <Link
                              to={`/mentorship/mentors/${rel.mentorId}`}
                              className="font-display text-lg font-bold text-foreground hover:text-primary transition-colors"
                            >
                              {rel.mentorName}
                            </Link>
                            <span className="text-xs font-mono text-primary">
                              · {rel.status}
                            </span>
                            <span className="text-xs font-mono text-secondary">
                              ·{' '}
                              {rel.mode === 'OFFICE_HOURS'
                                ? '1-on-1 Office Hours'
                                : '6-Month Cohort Track'}
                            </span>
                          </div>
                          <p className="text-xs font-mono text-secondary mt-0.5">
                            {rel.mentorHeadline} · Mentee: {rel.menteeName}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {rel.status === 'PENDING' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() =>
                              updateRelationshipStatus(
                                rel.id,
                                'ACTIVE',
                                `Mentorship session with ${rel.mentorName} confirmed and moved to Active.`,
                              )
                            }
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                            Confirm & Activate
                          </Button>
                        )}
                        {rel.status === 'ACTIVE' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setActiveNoteId(isAddingNote ? null : rel.id)
                              setNoteDraft('')
                            }}
                          >
                            <Plus className="h-3.5 w-3.5 mr-1.5" />
                            Log Session Note
                          </Button>
                        )}
                        {rel.status === 'ACTIVE' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateRelationshipStatus(
                                rel.id,
                                'COMPLETED',
                                `Marked mentorship with ${rel.mentorName} as graduated/completed.`,
                              )
                            }
                          >
                            Mark Completed
                          </Button>
                        )}
                        {rel.status === 'PENDING' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateRelationshipStatus(
                                rel.id,
                                'CANCELLED',
                                'Mentorship request withdrawn.',
                              )
                            }
                          >
                            Withdraw
                          </Button>
                        )}
                        <Link
                          to={`/mentorship/mentors/${rel.mentorId}`}
                          className="inline-flex items-center gap-1 text-xs font-mono text-primary hover:underline px-2 py-1"
                        >
                          Dossier
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* Goal & Cadence Bar */}
                    <div className="rounded-xl border border-border bg-background p-4 space-y-2">
                      <p className="text-xs font-mono uppercase tracking-wider text-primary">
                        Primary Objective
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {rel.goal}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-secondary pt-1">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          {rel.duration}
                        </span>
                        <span>·</span>
                        <span>{rel.meetingCount} sessions completed</span>
                        {rel.slotLabel && (
                          <>
                            <span>·</span>
                            <span className="text-foreground">
                              Slot: {rel.slotLabel}
                            </span>
                          </>
                        )}
                        {rel.lastMeeting && (
                          <>
                            <span>·</span>
                            <span>
                              Last met:{' '}
                              {new Date(rel.lastMeeting).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Inline Log Note Form */}
                    {isAddingNote && (
                      <div className="rounded-xl border border-primary/40 bg-background p-4 space-y-3">
                        <label className="block text-xs font-mono uppercase tracking-wider text-primary">
                          Log New Session Takeaway or Action Item
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2.5">
                          <Input
                            value={noteDraft}
                            onChange={(e) => setNoteDraft(e.target.value)}
                            placeholder="e.g., Reviewed system design diagram; action item: benchmark Redis cluster failover..."
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={() => handleAddSessionNote(rel.id)}
                          >
                            Save Note
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Session Notes Log */}
                    {rel.notes && rel.notes.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-xs font-mono text-secondary inline-flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-primary" />
                          Session Log & Milestones
                        </p>
                        <ul className="space-y-1.5 text-xs text-secondary pl-5 list-disc">
                          {rel.notes.map((note, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {note}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.article>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  )
}