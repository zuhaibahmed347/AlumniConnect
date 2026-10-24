import { RoleShell } from '@/components/layout/role-shell'
import { Button } from '@/components/ui/button'
import { Input, SelectField } from '@/components/ui/input'
import {
  MENTORS_CATALOG,
  loadMentorshipRequests,
  saveMentorshipRequests,
  type MentorSessionSlot,
  type StoredMentorshipRequest,
} from '@/lib/mentorship-data'
import {
  MentorAvailabilityCalendar,
  loadMentorCustomSlots,
  saveMentorCustomSlots,
} from '@/components/ui/mentor-availability-calendar'
import { toast } from '@/lib/toast'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  History,
  MessageSquare,
  Plus,
  Settings,
  SlidersHorizontal,
  Trash2,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

type MentorConsoleTab =
  | 'OVERVIEW'
  | 'REQUESTS'
  | 'ACTIVE_MENTEES'
  | 'AVAILABILITY'
  | 'PROFILE_EDITOR'
  | 'HISTORY'
  | 'SETTINGS'

export function MentorWorkspacePage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<MentorConsoleTab>('OVERVIEW')

  // Load persisted mentorship requests & relationships
  const [requests, setRequests] = useState<StoredMentorshipRequest[]>(() =>
    loadMentorshipRequests(),
  )

  // Mentor profile state (seeded from Dr. Sarah Khan's record)
  const defaultMentor = MENTORS_CATALOG[0]
  const [mentorProfile, setMentorProfile] = useState({
    name: defaultMentor.name,
    headline: defaultMentor.headline,
    bio: defaultMentor.bio,
    mentorshipStyle: defaultMentor.mentorshipStyle,
    featuredTopic: defaultMentor.featuredTopic,
    expertiseText: defaultMentor.expertise.join(', '),
    industriesText: defaultMentor.industries.join(', '),
    maxMentees: defaultMentor.maxMentees,
    isAvailable: defaultMentor.isAvailable,
    meetingFrequency: defaultMentor.meetingFrequency,
    preferredFormat: defaultMentor.preferredFormat,
    responseWindow: defaultMentor.responseWindow,
  })

  // Office hours availability slots state (persisted with MentorAvailabilityCalendar)
  const [slots, setSlots] = useState<MentorSessionSlot[]>(() =>
    loadMentorCustomSlots(defaultMentor.id, defaultMentor.officeHoursSlots),
  )
  const [newSlotDay, setNewSlotDay] = useState('Tue, Nov 24')
  const [newSlotTime, setNewSlotTime] = useState('19:00 PKT')
  const [newSlotFormat, setNewSlotFormat] =
    useState<MentorSessionSlot['format']>('Video Call')

  // Decline modal reason state
  const [decliningId, setDecliningId] = useState<string | null>(null)
  const [declineReason, setDeclineReason] = useState('')

  // Session note state for active mentees
  const [noteDraftById, setNoteDraftById] = useState<Record<string, string>>({})

  // Notification & privacy settings state
  const [mentorSettings, setMentorSettings] = useState({
    emailOnNewRequest: true,
    inAppSessionReminders: true,
    allowFinalYearStudents: true,
    allowJuniorAlumni: true,
    autoPauseWhenFull: true,
    requireGoalStatement: true,
  })

  const pendingRequests = useMemo(
    () => requests.filter((r) => r.status === 'PENDING'),
    [requests],
  )
  const activeRelationships = useMemo(
    () => requests.filter((r) => r.status === 'ACTIVE'),
    [requests],
  )
  const completedOrCancelled = useMemo(
    () =>
      requests.filter(
        (r) => r.status === 'COMPLETED' || r.status === 'CANCELLED',
      ),
    [requests],
  )

  const handleAcceptRequest = (req: StoredMentorshipRequest) => {
    const updated = requests.map((item) =>
      item.id === req.id
        ? {
            ...item,
            status: 'ACTIVE' as const,
            startedAt: new Date().toISOString().slice(0, 10),
            notes: [
              `Accepted by mentor on ${new Date().toISOString().slice(0, 10)}.`,
              ...(item.notes ?? []),
            ],
          }
        : item,
    )
    setRequests(updated)
    saveMentorshipRequests(updated)
    toast({
      title: 'Mentorship Request Accepted',
      description: `${req.menteeName} is now an active mentee in your cohort.`,
      variant: 'success',
    })
  }

  const handleConfirmDecline = (id: string) => {
    const req = requests.find((r) => r.id === id)
    const updated = requests.map((item) =>
      item.id === id
        ? {
            ...item,
            status: 'CANCELLED' as const,
            notes: [
              `Declined by mentor: ${
                declineReason.trim() || 'Cohort capacity reached for this cycle.'
              }`,
              ...(item.notes ?? []),
            ],
          }
        : item,
    )
    setRequests(updated)
    saveMentorshipRequests(updated)
    setDecliningId(null)
    setDeclineReason('')
    toast({
      title: 'Mentorship Request Declined',
      description: req
        ? `Sent response note to ${req.menteeName}.`
        : 'Request status updated.',
    })
  }

  const handleCompleteRelationship = (req: StoredMentorshipRequest) => {
    const updated = requests.map((item) =>
      item.id === req.id
        ? {
            ...item,
            status: 'COMPLETED' as const,
            notes: [
              `Graduated / completed mentorship track on ${new Date()
                .toISOString()
                .slice(0, 10)}.`,
              ...(item.notes ?? []),
            ],
          }
        : item,
    )
    setRequests(updated)
    saveMentorshipRequests(updated)
    toast({
      title: 'Mentorship Marked Completed',
      description: `${req.menteeName}'s record moved to Mentorship History.`,
      variant: 'success',
    })
  }

  const handleAddMenteeNote = (id: string) => {
    const text = (noteDraftById[id] ?? '').trim()
    if (!text) {
      toast.error('Please write a brief session note before logging.')
      return
    }
    const updated = requests.map((item) =>
      item.id === id
        ? {
            ...item,
            meetingCount: item.meetingCount + 1,
            lastMeeting: new Date().toISOString().slice(0, 10),
            notes: [text, ...(item.notes ?? [])],
          }
        : item,
    )
    setRequests(updated)
    saveMentorshipRequests(updated)
    setNoteDraftById((prev) => ({ ...prev, [id]: '' }))
    toast.success('Session note logged and meeting count incremented.')
  }

  const handleAddSlot = (e: FormEvent) => {
    e.preventDefault()
    if (!newSlotDay.trim() || !newSlotTime.trim()) {
      toast.error('Please provide both day and time labels for the slot.')
      return
    }
    const created: MentorSessionSlot = {
      id: `slot-${Date.now()}`,
      dayLabel: newSlotDay.trim(),
      timeLabel: newSlotTime.trim(),
      timezone: 'UTC+5',
      format: newSlotFormat,
    }
    const updated = [...slots, created]
    setSlots(updated)
    saveMentorCustomSlots(defaultMentor.id, updated)
    toast.success(`Added office hour slot: ${created.dayLabel} · ${created.timeLabel}`)
  }

  const handleRemoveSlot = (slotId: string) => {
    const updated = slots.filter((s) => s.id !== slotId)
    setSlots(updated)
    saveMentorCustomSlots(defaultMentor.id, updated)
    toast({
      title: 'Office Hour Slot Removed',
      description: 'Your mentoring availability window has been updated.',
    })
  }

  const tabs: {
    id: MentorConsoleTab
    label: string
    icon: typeof UserCheck
    count?: number
  }[] = [
    { id: 'OVERVIEW', label: 'Mentor Overview', icon: UserCheck },
    {
      id: 'REQUESTS',
      label: 'Incoming Requests',
      icon: Clock,
      count: pendingRequests.length,
    },
    {
      id: 'ACTIVE_MENTEES',
      label: 'Active Mentees',
      icon: Users,
      count: activeRelationships.length,
    },
    {
      id: 'AVAILABILITY',
      label: 'Availability & Slots',
      icon: Calendar,
      count: slots.length,
    },
    { id: 'PROFILE_EDITOR', label: 'Mentor Profile Editor', icon: SlidersHorizontal },
    {
      id: 'HISTORY',
      label: 'Mentorship History',
      icon: History,
      count: completedOrCancelled.length,
    },
    { id: 'SETTINGS', label: 'Notifications & Privacy', icon: Settings },
  ]

  return (
    <RoleShell
      role="MENTOR"
      title="Mentor Faculty Console"
      subtitle="Manage incoming requests, active mentees, availability windows, and mentor profile"
      badge={
        mentorProfile.isAvailable
          ? 'Status: Accepting Mentees'
          : 'Status: Paused'
      }
      headerActions={
        <button
          type="button"
          onClick={() => {
            setMentorProfile((prev) => {
              const next = !prev.isAvailable
              toast({
                title: next
                  ? 'Mentor Availability: Open'
                  : 'Mentor Availability: Paused',
                description: next
                  ? 'Students and alumni can now submit mentorship requests.'
                  : 'New incoming requests are temporarily paused.',
              })
              return { ...prev, isAvailable: next }
            })
          }}
          className={`rounded-lg border px-3 py-1.5 text-xs font-mono font-semibold transition-colors cursor-pointer ${
            mentorProfile.isAvailable
              ? 'border-primary bg-primary text-white dark:text-slate-950'
              : 'border-border bg-card text-foreground'
          }`}
        >
          {mentorProfile.isAvailable ? 'Accepting Mentees' : 'Requests Paused'}
        </button>
      }
    >
      {/* Top KPI Summary Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="font-mono text-2xl sm:text-3xl font-bold text-primary tabular-nums">
            {pendingRequests.length}
          </p>
          <p className="text-xs font-mono text-secondary mt-1">
            Incoming Pending Requests
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="font-mono text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
            {activeRelationships.length} / {mentorProfile.maxMentees}
          </p>
          <p className="text-xs font-mono text-secondary mt-1">
            Active Mentee Cohort Capacity
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="font-mono text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
            {slots.length}
          </p>
          <p className="text-xs font-mono text-secondary mt-1">
            Published Office Hour Slots
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="font-mono text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
            {completedOrCancelled.length}
          </p>
          <p className="text-xs font-mono text-secondary mt-1">
            Completed & Archived Records
          </p>
        </div>
      </section>

      {/* Mentor Console Navigation Tabs */}
      <div
        role="tablist"
        aria-label="Mentor Workspace Sections"
        className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-2 shadow-card"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isSelected = activeTab === tab.id
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isSelected}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-primary text-white dark:text-slate-950 shadow-sm'
                  : 'text-foreground hover:bg-stone'
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`font-mono text-[11px] font-bold tabular-nums px-1.5 py-0.5 rounded ${
                    isSelected
                      ? 'bg-black/15 text-white dark:bg-black/20 dark:text-slate-950'
                      : 'bg-stone text-primary'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="space-y-6"
        >
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Incoming Requests Quick Queue */}
              <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider font-semibold text-primary">
                      Action Required
                    </p>
                    <h2 className="font-display text-xl font-bold text-foreground">
                      Incoming Mentorship Requests ({pendingRequests.length})
                    </h2>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('REQUESTS')}
                  >
                    Review All
                  </Button>
                </div>

                {pendingRequests.length === 0 ? (
                  <div className="rounded-xl border border-border bg-background p-6 text-center space-y-2">
                    <CheckCircle2 className="h-6 w-6 text-primary mx-auto" />
                    <p className="text-sm font-semibold text-foreground">
                      Inbox Zero — All incoming mentorship requests have been reviewed
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="rounded-xl border border-border bg-background p-4 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-display text-base font-bold text-foreground">
                              {req.menteeName}
                            </p>
                            <p className="text-xs font-mono text-secondary">
                              Requested {req.requestedAt} · {req.duration}
                            </p>
                          </div>
                          <span className="font-mono text-xs font-bold text-primary">
                            {req.mode === 'OFFICE_HOURS'
                              ? '1-ON-1 OFFICE HOURS'
                              : '6-MONTH COHORT'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                          <strong className="font-semibold">Goal:</strong>{' '}
                          {req.goal}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptRequest(req)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                            Accept Request
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setActiveTab('REQUESTS')
                              setDecliningId(req.id)
                            }}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1.5" />
                            Decline
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate('/messages/1')}
                          >
                            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                            Message Mentee
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right 5 Cols: Active Mentees & Upcoming Office Hours */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="font-display text-lg font-bold text-foreground">
                      Active Mentees ({activeRelationships.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('ACTIVE_MENTEES')}
                      className="text-xs font-mono font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Manage Notes
                    </button>
                  </div>

                  {activeRelationships.map((rel) => (
                    <div
                      key={rel.id}
                      className="rounded-xl border border-border bg-background p-3.5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-foreground">
                          {rel.menteeName}
                        </span>
                        <span className="text-primary font-semibold tabular-nums">
                          {rel.meetingCount} sessions logged
                        </span>
                      </div>
                      <p className="text-xs text-secondary line-clamp-2">
                        {rel.goal}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="font-display text-lg font-bold text-foreground">
                      Published Office Hour Windows
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('AVAILABILITY')}
                      className="text-xs font-mono font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Edit Schedule
                    </button>
                  </div>
                  <div className="space-y-2">
                    {slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="rounded-xl border border-border bg-background px-3.5 py-2.5 flex items-center justify-between text-xs font-mono"
                      >
                        <span className="font-semibold text-foreground">
                          {slot.dayLabel} · {slot.timeLabel}
                        </span>
                        <span className="text-secondary">{slot.format}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INCOMING REQUESTS DETAILS */}
          {activeTab === 'REQUESTS' && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5">
              <div className="border-b border-border pb-4">
                <p className="text-xs font-mono uppercase tracking-wider font-semibold text-primary">
                  Application Review Queue
                </p>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Incoming Mentorship Requests ({pendingRequests.length})
                </h2>
                <p className="text-xs text-secondary mt-1">
                  Review scholar goals, preferred communication formats, and requested session slots before accepting or declining.
                </p>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="rounded-xl border border-border bg-background p-8 text-center space-y-2">
                  <p className="text-base font-bold text-foreground">
                    No pending mentorship requests right now
                  </p>
                  <p className="text-xs text-secondary">
                    New requests submitted from the Student Hub or Mentorship Guild will appear here immediately.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="rounded-xl border border-border bg-background p-5 space-y-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <span className="text-xs font-mono font-bold text-primary">
                            {req.mode === 'OFFICE_HOURS'
                              ? '1-ON-1 OFFICE HOURS REQUEST'
                              : '6-MONTH MENTORSHIP APPLICATION'}
                          </span>
                          <h3 className="font-display text-lg font-bold text-foreground mt-0.5">
                            Applicant: {req.menteeName}
                          </h3>
                          <p className="text-xs font-mono text-secondary">
                            Submitted on {req.requestedAt} · Target Mentor:{' '}
                            {req.mentorName}
                          </p>
                        </div>
                        {req.slotLabel && (
                          <span className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-mono font-semibold text-foreground">
                            Requested Slot: {req.slotLabel}
                          </span>
                        )}
                      </div>

                      <div className="rounded-lg border border-border bg-card p-3.5 space-y-1">
                        <p className="text-xs font-mono uppercase text-secondary">
                          Submitted Goal & Career Context
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">
                          {req.goal}
                        </p>
                      </div>

                      {decliningId === req.id ? (
                        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                          <label className="block text-xs font-mono uppercase font-semibold text-foreground">
                            Reason / Feedback Note for Applicant
                          </label>
                          <Input
                            value={declineReason}
                            onChange={(e) => setDeclineReason(e.target.value)}
                            placeholder="e.g., Cohort slots are currently full for Q4; recommending Dr. Aamir's track..."
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleConfirmDecline(req.id)}
                            >
                              Confirm Decline
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDecliningId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2.5">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptRequest(req)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                            Accept & Start Mentorship
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDecliningId(req.id)}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1.5" />
                            Decline with Note
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate('/messages/1')}
                          >
                            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                            Message Applicant
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACTIVE MENTEES & SESSION NOTES */}
          {activeTab === 'ACTIVE_MENTEES' && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5">
              <div className="border-b border-border pb-4">
                <p className="text-xs font-mono uppercase tracking-wider font-semibold text-primary">
                  Cohort Execution Ledger
                </p>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Active Mentorship Relationships ({activeRelationships.length})
                </h2>
              </div>

              <div className="space-y-4">
                {activeRelationships.map((rel) => (
                  <div
                    key={rel.id}
                    className="rounded-xl border border-border bg-background p-5 space-y-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-mono font-bold text-primary">
                          ACTIVE · {rel.duration}
                        </span>
                        <h3 className="font-display text-lg font-bold text-foreground">
                          Mentee: {rel.menteeName}
                        </h3>
                        <p className="text-xs font-mono text-secondary">
                          Started {rel.startedAt ?? rel.requestedAt} ·{' '}
                          {rel.meetingCount} sessions completed · Last met{' '}
                          {rel.lastMeeting ?? 'Recently'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate('/messages/1')}
                        >
                          <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                          Message
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleCompleteRelationship(rel)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-primary" />
                          Mark Completed
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm font-medium text-foreground">
                      Objective: {rel.goal}
                    </p>

                    {/* Session Notes History */}
                    <div className="rounded-lg border border-border bg-card p-3.5 space-y-2">
                      <p className="text-xs font-mono uppercase font-semibold text-foreground flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        Session Notes & Milestones
                      </p>
                      <ul className="space-y-1.5 text-xs text-secondary">
                        {(rel.notes ?? []).map((note, idx) => (
                          <li key={idx} className="text-foreground/90">
                            · {note}
                          </li>
                        ))}
                      </ul>

                      <div className="pt-2 flex flex-col sm:flex-row gap-2">
                        <Input
                          value={noteDraftById[rel.id] ?? ''}
                          onChange={(e) =>
                            setNoteDraftById((prev) => ({
                              ...prev,
                              [rel.id]: e.target.value,
                            }))
                          }
                          placeholder="Log a new session milestone or action item..."
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddMenteeNote(rel.id)}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Log Session Note
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: AVAILABILITY & SESSION SCHEDULING */}
          {activeTab === 'AVAILABILITY' && (
            <div className="space-y-6">
              <MentorAvailabilityCalendar
                mentor={{ ...defaultMentor, officeHoursSlots: slots }}
                editable
                onSlotsChange={(updated) => setSlots(updated)}
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
                  <div className="border-b border-border pb-4">
                    <p className="text-xs font-mono uppercase tracking-wider font-semibold text-primary">
                      Platform Office Hours Schedule
                    </p>
                    <h2 className="font-display text-xl font-bold text-foreground">
                      Published Mentoring Time Windows ({slots.length})
                    </h2>
                    <p className="text-xs text-secondary mt-1">
                      Define recurring or upcoming time windows that students and alumni can select when requesting a 1-on-1 session on AlumniConnect.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="rounded-xl border border-border bg-background p-4 flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="font-mono text-sm font-bold text-foreground">
                            {slot.dayLabel} · {slot.timeLabel} ({slot.timezone})
                          </p>
                          <p className="text-xs text-secondary mt-0.5">
                            Format: {slot.format}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveSlot(slot.id)}
                          aria-label={`Remove slot ${slot.dayLabel}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Add New Office Hour Slot
                  </h3>
                  <form onSubmit={handleAddSlot} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1">
                        Day / Date Label
                      </label>
                      <Input
                        value={newSlotDay}
                        onChange={(e) => setNewSlotDay(e.target.value)}
                        placeholder="e.g., Thu, Nov 26"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1">
                        Time Window
                      </label>
                      <Input
                        value={newSlotTime}
                        onChange={(e) => setNewSlotTime(e.target.value)}
                        placeholder="e.g., 19:30 PKT"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1">
                        Session Format
                      </label>
                      <SelectField
                        value={newSlotFormat}
                        onChange={(e) =>
                          setNewSlotFormat(
                            e.target.value as MentorSessionSlot['format'],
                          )
                        }
                      >
                        <option value="Video Call">Video Call</option>
                        <option value="Async Code/Doc Review">
                          Async Code/Doc Review
                        </option>
                        <option value="In-Person Hub">In-Person Hub</option>
                      </SelectField>
                    </div>
                    <Button type="submit" className="w-full">
                      <Plus className="h-4 w-4 mr-1.5" />
                      Publish Office Hour Slot
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MENTOR PROFILE EDITOR */}
          {activeTab === 'PROFILE_EDITOR' && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                toast.success('Mentor profile, expertise topics, and communication preferences saved.')
              }}
              className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5"
            >
              <div className="border-b border-border pb-4">
                <p className="text-xs font-mono uppercase tracking-wider font-semibold text-primary">
                  Faculty Dossier Configuration
                </p>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Edit Mentor Profile & Topics
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1.5">
                    Mentor Headline
                  </label>
                  <Input
                    value={mentorProfile.headline}
                    onChange={(e) =>
                      setMentorProfile((prev) => ({
                        ...prev,
                        headline: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1.5">
                    Featured 1-on-1 Topic
                  </label>
                  <Input
                    value={mentorProfile.featuredTopic}
                    onChange={(e) =>
                      setMentorProfile((prev) => ({
                        ...prev,
                        featuredTopic: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1.5">
                    Expertise Domains (comma-separated)
                  </label>
                  <Input
                    value={mentorProfile.expertiseText}
                    onChange={(e) =>
                      setMentorProfile((prev) => ({
                        ...prev,
                        expertiseText: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1.5">
                    Industries (comma-separated)
                  </label>
                  <Input
                    value={mentorProfile.industriesText}
                    onChange={(e) =>
                      setMentorProfile((prev) => ({
                        ...prev,
                        industriesText: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1.5">
                    Preferred Communication Method
                  </label>
                  <SelectField
                    value={mentorProfile.preferredFormat}
                    onChange={(e) =>
                      setMentorProfile((prev) => ({
                        ...prev,
                        preferredFormat: e.target.value,
                      }))
                    }
                  >
                    <option value="Video Call & RFC Docs">
                      Video Call & RFC Docs
                    </option>
                    <option value="Platform Messaging & Async Code Review">
                      Platform Messaging & Async Code Review
                    </option>
                    <option value="In-Person Chapter Hub">
                      In-Person Chapter Hub
                    </option>
                  </SelectField>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1.5">
                    Maximum Concurrent Mentees
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={mentorProfile.maxMentees}
                    onChange={(e) =>
                      setMentorProfile((prev) => ({
                        ...prev,
                        maxMentees: Number(e.target.value) || 1,
                      }))
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1.5">
                    Mentor Biography & Coaching Approach
                  </label>
                  <Input
                    value={mentorProfile.bio}
                    onChange={(e) =>
                      setMentorProfile((prev) => ({
                        ...prev,
                        bio: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit">Save Mentor Profile</Button>
              </div>
            </form>
          )}

          {/* TAB 6: MENTORSHIP HISTORY */}
          {activeTab === 'HISTORY' && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
              <div className="border-b border-border pb-4">
                <p className="text-xs font-mono uppercase tracking-wider font-semibold text-primary">
                  Alumni Impact Archive
                </p>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Completed & Archived Mentorship Relationships
                </h2>
              </div>

              <div className="space-y-3">
                {completedOrCancelled.map((rec) => (
                  <div
                    key={rec.id}
                    className="rounded-xl border border-border bg-background p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-primary">
                        {rec.status} · {rec.duration}
                      </span>
                      <span className="text-secondary tabular-nums">
                        {rec.meetingCount} sessions · Last met{' '}
                        {rec.lastMeeting ?? rec.requestedAt}
                      </span>
                    </div>
                    <h3 className="font-display text-base font-bold text-foreground">
                      Mentee: {rec.menteeName}
                    </h3>
                    <p className="text-xs text-secondary">{rec.goal}</p>
                    {(rec.notes ?? []).length > 0 && (
                      <p className="text-xs font-mono text-foreground/85 pt-1">
                        Outcome Note: {rec.notes[0]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: MENTOR NOTIFICATION & PRIVACY SETTINGS */}
          {activeTab === 'SETTINGS' && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5">
              <div className="border-b border-border pb-4">
                <p className="text-xs font-mono uppercase tracking-wider font-semibold text-primary flex items-center gap-1.5">
                  <Bell className="h-3.5 w-3.5" />
                  Preferences & Discoverability
                </p>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Mentor Notification & Privacy Settings
                </h2>
              </div>

              <div className="space-y-3">
                {[
                  {
                    key: 'emailOnNewRequest' as const,
                    title: 'Email notification on new mentorship request',
                    desc: 'Receive an institutional email digest when a student or alumnus requests a session.',
                  },
                  {
                    key: 'inAppSessionReminders' as const,
                    title: 'In-app office hour reminders',
                    desc: 'Display a reminder banner 24 hours prior to confirmed mentoring sessions.',
                  },
                  {
                    key: 'allowFinalYearStudents' as const,
                    title: 'Visible to Final-Year Undergraduate Scholars',
                    desc: 'Allow graduating Sukkur IBA students to discover your mentor profile and apply.',
                  },
                  {
                    key: 'autoPauseWhenFull' as const,
                    title: 'Automatically pause requests when cohort reaches max capacity',
                    desc: 'Switch profile status to Waitlist once all mentee slots are filled.',
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start justify-between gap-4 rounded-xl border border-border bg-background p-4 cursor-pointer"
                  >
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {item.title}
                      </p>
                      <p className="text-xs text-secondary mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={mentorSettings[item.key]}
                      onChange={(e) => {
                        setMentorSettings((prev) => ({
                          ...prev,
                          [item.key]: e.target.checked,
                        }))
                        toast.success('Mentor preference updated.')
                      }}
                      className="h-4 w-4 mt-1"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </RoleShell>
  )
}
