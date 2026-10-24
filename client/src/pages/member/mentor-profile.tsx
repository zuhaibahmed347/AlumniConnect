import { useState, useMemo, type FormEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Globe,
  CheckCircle2,
  Star,
  Award,
  Users,
  Video,
  MessageSquare,
  Send,
  Briefcase,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Target,
  BookOpen,
  Bookmark,
  MapPin,
} from 'lucide-react'
import { RoleSwitcherStrip } from '@/components/layout/role-shell'
import { Button } from '@/components/ui/button'
import { SelectField } from '@/components/ui/input'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { GlobalSearchTrigger } from '@/components/ui/global-search-bar'
import {
  MENTORS_CATALOG,
  MENTORSHIP_GOALS,
  loadMentorshipRequests,
  saveMentorshipRequests,
  loadShortlistedMentorIds,
  saveShortlistedMentorIds,
  type StoredMentorshipRequest,
} from '@/lib/mentorship-data'
import {
  MentorAvailabilityCalendar,
  loadMentorCustomSlots,
  type CalendarSlotItem,
} from '@/components/ui/mentor-availability-calendar'
import { toast } from '@/lib/toast'

const MENTOR_PORTRAITS: Record<string, string> = {
  '1': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=480&q=80',
  '2': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=480&q=80',
  '3': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=480&q=80',
  '4': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=480&q=80',
  '5': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=480&q=80',
  '6': 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=480&q=80',
  'm-1': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=480&q=80',
  'm-2': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=480&q=80',
  'm-3': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=480&q=80',
  'm-4': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=480&q=80',
  'm-5': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=480&q=80',
  'm-6': 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=480&q=80',
}

export function MentorProfilePage() {
  const { mentorId } = useParams<{ mentorId: string }>()
  const navigate = useNavigate()

  const mentor = useMemo(
    () =>
      MENTORS_CATALOG.find((m) => m.id === mentorId) ?? MENTORS_CATALOG[0],
    [mentorId],
  )

  const [requests, setRequests] = useState<StoredMentorshipRequest[]>(() =>
    loadMentorshipRequests(),
  )
  const [shortlistedIds, setShortlistedIds] = useState<string[]>(() =>
    loadShortlistedMentorIds(),
  )

  const availableCalendarSlots = useMemo(
    () => loadMentorCustomSlots(mentor.id, mentor.officeHoursSlots),
    [mentor.id, mentor.officeHoursSlots],
  )

  const [engagementMode, setEngagementMode] = useState<
    'LONG_TERM' | 'OFFICE_HOURS'
  >('LONG_TERM')
  const [selectedGoalTopic, setSelectedGoalTopic] = useState<string>(
    mentor.featuredTopic,
  )
  const [selectedSlotId, setSelectedSlotId] = useState<string>(
    availableCalendarSlots[0]?.id ?? mentor.officeHoursSlots[0]?.id ?? '',
  )
  const [preferredChannel, setPreferredChannel] = useState<string>(
    mentor.preferredFormat,
  )
  const [careerGoalsText, setCareerGoalsText] = useState('')
  const [portfolioNotes, setPortfolioNotes] = useState('')
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null)

  const isShortlisted = shortlistedIds.includes(mentor.id)
  const openSeats = Math.max(0, mentor.maxMentees - mentor.currentMentees)

  const existingMentorRequests = useMemo(
    () => requests.filter((r) => r.mentorId === mentor.id),
    [requests, mentor.id],
  )

  const handleSelectCalendarSlot = (slot: CalendarSlotItem) => {
    setSelectedSlotId(slot.id)
    setEngagementMode('OFFICE_HOURS')
    if (slot.format === 'Video Call') {
      setPreferredChannel('Video Call (Google Meet / Zoom)')
    } else if (slot.format === 'Async Code/Doc Review') {
      setPreferredChannel('Async RFC / Code / Portfolio Critique')
    } else if (slot.format === 'In-Person Hub') {
      setPreferredChannel(`In-Person Chapter Hub Session (${mentor.chapter})`)
    }
    toast.success(
      `Selected ${slot.dayLabel} at ${slot.timeLabel} (${slot.format})`,
    )
    const dispatchConsole = document.getElementById('mentor-dispatch-console')
    if (dispatchConsole && window.innerWidth < 1024) {
      dispatchConsole.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleToggleShortlist = () => {
    const next = isShortlisted
      ? shortlistedIds.filter((id) => id !== mentor.id)
      : [...shortlistedIds, mentor.id]
    setShortlistedIds(next)
    saveShortlistedMentorIds(next)
    toast(
      isShortlisted
        ? `Removed ${mentor.name} from your mentor shortlist`
        : `Saved ${mentor.name} to your mentor shortlist`,
    )
  }

  const handleSubmitRequest = (e: FormEvent) => {
    e.preventDefault()
    if (!careerGoalsText.trim()) {
      toast('Please describe your career goals before submitting.')
      return
    }

    const chosenSlot = availableCalendarSlots.find(
      (s) => s.id === selectedSlotId,
    )
    const slotLabel = chosenSlot
      ? `${chosenSlot.dayLabel} · ${chosenSlot.timeLabel} (${chosenSlot.format})`
      : 'Flexible Scheduling'

    const newReq: StoredMentorshipRequest = {
      id: `req-${Date.now()}`,
      mentorId: mentor.id,
      mentorName: mentor.name,
      mentorHeadline: mentor.headline,
      menteeName: 'Waqar Ahmed',
      mode: engagementMode,
      status: 'PENDING',
      goal: `${selectedGoalTopic} — ${careerGoalsText.trim()}`,
      slotLabel,
      requestedAt: new Date().toISOString().slice(0, 10),
      startedAt: null,
      meetingCount: 0,
      lastMeeting: null,
      duration:
        engagementMode === 'LONG_TERM'
          ? '6 months · Cohort Application'
          : '45-min Diagnostic Session',
      notes: [
        `Preferred Channel: ${preferredChannel}`,
        ...(portfolioNotes.trim() ? [portfolioNotes.trim()] : []),
      ],
    }

    const updated = [newReq, ...requests]
    setRequests(updated)
    saveMentorshipRequests(updated)
    setCareerGoalsText('')
    setPortfolioNotes('')
    setSubmittedNotice(
      `Mentorship request dispatched to ${mentor.name} (${slotLabel}). You can track or manage this request below.`,
    )
    toast(`Mentorship request sent to ${mentor.name}!`)
  }

  const handleCancelRequest = (reqId: string) => {
    const updated = requests.map((r) =>
      r.id === reqId ? { ...r, status: 'CANCELLED' as const } : r,
    )
    setRequests(updated)
    saveMentorshipRequests(updated)
    setSubmittedNotice('Mentorship request marked as cancelled.')
    toast('Mentorship request cancelled.')
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Global Role Context Switcher */}
      <RoleSwitcherStrip />

      {/* Top Institutional Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/mentorship"
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-secondary hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Mentorship Hub
            </Link>
            <span className="text-border">/</span>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
                Faculty Dossier #{mentor.id.padStart(3, '0')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Mentor Dossier Switcher Dropdown */}
            <div className="hidden md:block w-64">
              <SelectField
                aria-label="Switch Mentor Dossier"
                value={mentor.id}
                onChange={(e) => {
                  const nextMentor = MENTORS_CATALOG.find(
                    (m) => m.id === e.target.value,
                  )
                  if (nextMentor) {
                    setSelectedGoalTopic(nextMentor.featuredTopic)
                    setSelectedSlotId(nextMentor.officeHoursSlots[0]?.id ?? '')
                    setPreferredChannel(nextMentor.preferredFormat)
                    navigate(`/mentorship/mentors/${nextMentor.id}`)
                  }
                }}
              >
                {MENTORS_CATALOG.map((m) => (
                  <option key={m.id} value={m.id}>
                    Dossier: {m.name} ({m.company})
                  </option>
                ))}
              </SelectField>
            </div>
            <GlobalSearchTrigger />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 sm:px-8 py-8 space-y-8">
        {submittedNotice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-accent/90 border border-primary/30 rounded-xl px-5 py-3.5 flex items-center justify-between text-xs text-primary font-medium shadow-sm"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {submittedNotice}
            </span>
            <button
              type="button"
              onClick={() => setSubmittedNotice(null)}
              className="text-[11px] font-mono uppercase tracking-wider underline ml-4 cursor-pointer"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {/* Executive Mentor Dossier Hero Card with Top Band & Partitioned Telemetry */}
        <section className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden relative">
          {/* Colored Top Accent Bar */}
          <div className="h-2 w-full bg-gradient-to-r from-primary via-gold to-primary" />

          {/* Dossier Top Classification Bar */}
          <div
            className={`px-6 sm:px-8 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 ${
              mentor.isAvailable
                ? 'bg-accent/65 border-primary/20'
                : 'bg-gold/10 border-gold/25'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-primary font-bold">
                Sukkur IBA Verified Alumni Mentorship Faculty · {mentor.chapter}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider font-bold px-3 py-1 rounded-md border ${
                  mentor.isAvailable
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-gold/20 text-foreground border-gold/40'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    mentor.isAvailable ? 'bg-emerald-300' : 'bg-gold'
                  }`}
                />
                {mentor.isAvailable
                  ? `Accepting Mentees (${openSeats} of ${mentor.maxMentees} Seats Open)`
                  : 'Cohort Full · Waitlist Open'}
              </span>

              <button
                type="button"
                onClick={handleToggleShortlist}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-md border transition-colors cursor-pointer ${
                  isShortlisted
                    ? 'bg-gold/15 border-gold/40 text-foreground'
                    : 'bg-card border-border text-secondary hover:text-foreground'
                }`}
              >
                <Bookmark
                  className={`w-3.5 h-3.5 ${
                    isShortlisted ? 'fill-gold text-gold' : ''
                  }`}
                />
                {isShortlisted ? 'Shortlisted' : 'Save to Shortlist'}
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                {/* High-Contrast Portrait Avatar */}
                <div className="relative shrink-0">
                  {MENTOR_PORTRAITS[mentor.id] ? (
                    <img
                      src={MENTOR_PORTRAITS[mentor.id]}
                      alt={mentor.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-primary/30 shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-accent border-2 border-primary/30 flex items-center justify-center font-display text-3xl font-bold text-primary shrink-0">
                      {mentor.initials}
                    </div>
                  )}
                  <span
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${
                      mentor.isAvailable ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                </div>

                {/* Primary Identity Details */}
                <div className="space-y-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-primary text-primary-foreground font-bold">
                        Class of &apos;{String(mentor.classYear).slice(-2)}
                      </span>
                      <span className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-stone border border-border text-foreground font-semibold">
                        {mentor.department}
                      </span>
                      <span className="text-[11px] font-mono text-foreground font-bold flex items-center gap-1 bg-gold/15 border border-gold/30 px-2.5 py-0.5 rounded-md">
                        <Star className="w-3.5 h-3.5 fill-gold text-gold" />{' '}
                        {mentor.avgRating.toFixed(2)} Avg Rating
                      </span>
                    </div>

                    <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                      {mentor.name}
                    </h1>
                    <p className="text-sm sm:text-base text-foreground/90 font-medium mt-1 flex flex-wrap items-center gap-2">
                      <Briefcase className="w-4 h-4 text-primary shrink-0" />
                      <span>{mentor.role}</span>
                      <span className="text-secondary">·</span>
                      <span className="text-primary font-bold">
                        {mentor.company}
                      </span>
                    </p>
                  </div>

                  {/* Partitioned Meta Strip */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground bg-stone/70 border border-border px-3 py-1.5 rounded-lg">
                      <MapPin className="w-3.5 h-3.5 text-primary" />{' '}
                      {mentor.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground bg-stone/70 border border-border px-3 py-1.5 rounded-lg">
                      <Globe className="w-3.5 h-3.5 text-primary" />{' '}
                      {mentor.chapter}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground bg-stone/70 border border-border px-3 py-1.5 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-gold" /> SLA:{' '}
                      {mentor.responseWindow}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground bg-stone/70 border border-border px-3 py-1.5 rounded-lg">
                      <GraduationCap className="w-3.5 h-3.5 text-primary" />{' '}
                      {mentor.meetingFrequency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Highlight Callout Box */}
              <div className="lg:w-80 shrink-0 bg-accent/55 border border-primary/25 rounded-xl p-4 flex flex-col justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold" /> Featured
                    Advisory Focus
                  </span>
                  <p className="text-xs font-semibold text-foreground leading-relaxed">
                    {mentor.featuredTopic}
                  </p>
                </div>
                <div className="pt-2.5 border-t border-primary/15 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-secondary uppercase tracking-wider">
                    Format
                  </span>
                  <span className="font-semibold text-foreground">
                    {mentor.preferredFormat}
                  </span>
                </div>
              </div>
            </div>

            {/* 4-Card Partitioned Impact Telemetry Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-7 pt-6 border-t border-border">
              <div className="bg-stone/55 border border-border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                    Sessions Completed
                  </p>
                  <p className="font-display text-2xl font-bold text-foreground mt-1">
                    {mentor.sessionsCompleted}
                  </p>
                  <p className="text-[11px] text-secondary mt-0.5">
                    Verified 1-on-1 & group hours
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-accent border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Video className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-stone/55 border border-border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-gold font-bold">
                    Mentees Guided
                  </p>
                  <p className="font-display text-2xl font-bold text-foreground mt-1">
                    {mentor.totalMenteesServed} Alumni
                  </p>
                  <p className="text-[11px] text-secondary mt-0.5">
                    Across global cohorts
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold shrink-0">
                  <Award className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-stone/55 border border-border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                    Guild Satisfaction
                  </p>
                  <p className="font-display text-2xl font-bold text-foreground mt-1 flex items-center gap-1.5">
                    {mentor.avgRating.toFixed(2)}
                    <Star className="w-4 h-4 text-gold fill-gold" />
                  </p>
                  <p className="text-[11px] text-secondary mt-0.5">
                    Verified mentee reviews
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-accent border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-stone/55 border border-border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                    Current Capacity
                  </p>
                  <p className="font-display text-2xl font-bold text-primary mt-1">
                    {openSeats} / {mentor.maxMentees} Open
                  </p>
                  <p className="text-[11px] text-secondary mt-0.5">
                    {mentor.meetingFrequency}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-accent border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Users className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Two-Column Partitioned Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Detailed Dossier Sections */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section 01: Executive Biography & Coaching Methodology */}
            <section className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-accent/80 via-stone/50 to-transparent border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 rounded-full bg-primary" />
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary font-bold block">
                      Section 01 · Mentor Overview
                    </span>
                    <h2 className="font-display text-lg font-bold text-foreground">
                      Executive Biography & Coaching Methodology
                    </h2>
                  </div>
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-md bg-card border border-border text-primary font-bold">
                  Verified Alumni
                </span>
              </div>

              <div className="p-6 space-y-5">
                <div className="bg-stone/45 border-l-4 border-primary rounded-r-xl p-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold block mb-1.5">
                    Professional Trajectory & Scope
                  </span>
                  <p className="text-sm text-foreground leading-relaxed">
                    {mentor.bio}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-accent/45 border border-primary/20 rounded-xl p-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold flex items-center gap-1.5 mb-1.5">
                      <Target className="w-3.5 h-3.5 text-primary" /> Signature
                      Mentorship Style
                    </span>
                    <p className="text-xs font-medium text-foreground leading-relaxed">
                      {mentor.mentorshipStyle}
                    </p>
                  </div>

                  <div className="bg-stone/55 border border-border rounded-xl p-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-gold font-bold flex items-center gap-1.5 mb-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-gold" /> Session
                      Cadence & Format
                    </span>
                    <p className="text-xs text-foreground leading-relaxed font-medium">
                      {mentor.meetingFrequency} via {mentor.preferredFormat}.
                      Typical response window: {mentor.responseWindow}.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Interactive Visual Availability Calendar */}
            <div id="mentor-availability-calendar">
              <MentorAvailabilityCalendar
                mentor={mentor}
                selectedSlotId={selectedSlotId}
                onSelectSlot={handleSelectCalendarSlot}
                existingRequests={existingMentorRequests}
              />
            </div>

            {/* Section 02: Domain Expertise & Sector Specialization */}
            <section className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-accent/80 via-stone/50 to-transparent border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 rounded-full bg-gold" />
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-gold font-bold block">
                      Section 02 · Competency Matrix
                    </span>
                    <h2 className="font-display text-lg font-bold text-foreground">
                      Industries, Technical Pillars & Advisory Domains
                    </h2>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-secondary font-semibold">
                  {mentor.industries.length + mentor.expertise.length} Verified
                  Tags
                </span>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-stone/40 border border-border rounded-xl p-4">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold mb-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary" />{' '}
                    Industry Sectors
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {mentor.industries.map((ind) => (
                      <span
                        key={ind}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-accent/85 text-primary border border-primary/25"
                      >
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-stone/40 border border-border rounded-xl p-4">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-gold font-bold mb-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gold" /> Core
                    Mentoring & Technical Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise.map((exp) => (
                      <span
                        key={exp}
                        className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-card text-foreground border border-border"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 03: 6-Month Apprenticeship Blueprint */}
            <section className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-accent/80 via-stone/50 to-transparent border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 rounded-full bg-primary" />
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary font-bold block">
                      Section 03 · Structured Roadmap
                    </span>
                    <h2 className="font-display text-lg font-bold text-foreground">
                      6-Month Mentorship Progression Blueprint
                    </h2>
                  </div>
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-md bg-stone border border-border text-foreground font-semibold">
                  {mentor.roadmap.length} Milestones
                </span>
              </div>

              <div className="p-6 space-y-4">
                {mentor.roadmap.map((step, idx) => {
                  const accentStyles =
                    idx === 0
                      ? {
                          box: 'border-l-primary bg-accent/35',
                          badge: 'bg-primary text-primary-foreground',
                        }
                      : idx === 1
                        ? {
                            box: 'border-l-gold bg-gold/10',
                            badge: 'bg-gold text-white',
                          }
                        : {
                            box: 'border-l-primary bg-stone/50',
                            badge: 'bg-foreground text-background',
                          }

                  return (
                    <div
                      key={step.phase}
                      className={`border border-border border-l-4 ${accentStyles.box} rounded-xl p-4`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-display text-sm font-bold text-foreground">
                          {step.title}
                        </span>
                        <span
                          className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-md font-bold ${accentStyles.badge}`}
                        >
                          {step.phase}
                        </span>
                      </div>
                      <p className="text-xs text-secondary leading-relaxed">
                        {step.outcome}
                      </p>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Section 04: Verified Mentee Endorsements */}
            <section className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-accent/80 via-stone/50 to-transparent border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 rounded-full bg-gold" />
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-gold font-bold block">
                      Section 04 · Peer Feedback
                    </span>
                    <h2 className="font-display text-lg font-bold text-foreground">
                      Verified Mentee Endorsements
                    </h2>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-foreground flex items-center gap-1 bg-gold/15 border border-gold/30 px-2.5 py-1 rounded-md">
                  <Star className="w-3.5 h-3.5 fill-gold text-gold" />{' '}
                  {mentor.avgRating.toFixed(2)} / 5.0
                </span>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mentor.testimonials.map((t) => (
                  <div
                    key={t.menteeName}
                    className="bg-stone/45 border border-border rounded-xl p-4 flex flex-col justify-between gap-3"
                  >
                    <p className="text-xs text-foreground leading-relaxed italic">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="pt-2.5 border-t border-border/70 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="font-bold text-foreground block">
                          {t.menteeName}
                        </span>
                        <span className="text-secondary text-[10px]">
                          {t.menteeRole}
                        </span>
                      </div>
                      <span className="font-mono text-primary font-semibold">
                        Class of &apos;{String(t.classYear).slice(-2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Active / Historical Requests for this Mentor */}
            <AnimatePresence>
              {existingMentorRequests.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-primary/30 rounded-2xl shadow-sm overflow-hidden"
                >
                  <div className="px-6 py-4 bg-accent/70 border-b border-primary/20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-primary" />
                      <h2 className="font-display text-base font-bold text-foreground">
                        Your Mentorship Requests with {mentor.name}
                      </h2>
                    </div>
                    <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-primary text-primary-foreground font-bold">
                      {existingMentorRequests.length} Record
                      {existingMentorRequests.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="p-6 space-y-3">
                    {existingMentorRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-4 rounded-xl border border-border bg-stone/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-foreground">
                              {req.goal}
                            </span>
                            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-accent text-primary font-bold border border-primary/20">
                              {req.status}
                            </span>
                          </div>
                          <p className="text-xs text-secondary flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-primary" />{' '}
                            {req.slotLabel ?? req.duration} · Requested{' '}
                            {req.requestedAt}
                          </p>
                          {req.notes.length > 0 && (
                            <p className="text-xs text-foreground/80 mt-2 bg-card p-2.5 rounded-lg border border-border">
                              {req.notes.join(' · ')}
                            </p>
                          )}
                        </div>
                        {req.status === 'PENDING' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelRequest(req.id)}
                          >
                            Cancel Request
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Sticky Direct Session Dispatch Console */}
          <div
            id="mentor-dispatch-console"
            className="lg:col-span-5 lg:sticky lg:top-24"
          >
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-primary via-gold to-primary" />
              <div className="px-6 py-4 bg-gradient-to-r from-accent/85 via-stone/50 to-transparent border-b border-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary font-bold flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-primary" /> Direct Session
                    Dispatch
                  </span>
                  <span className="text-[10px] font-mono font-bold text-primary bg-card px-2 py-0.5 rounded border border-primary/20">
                    SLA: {mentor.responseWindow}
                  </span>
                </div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Request Mentorship Session
                </h2>
                <p className="text-xs text-secondary mt-0.5">
                  Select an open time slot from the visual availability calendar
                  or configure your engagement below with {mentor.name}.
                </p>
              </div>

              <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
                <SelectField
                  label="Engagement Track Mode"
                  value={engagementMode}
                  onChange={(e) =>
                    setEngagementMode(
                      e.target.value as 'LONG_TERM' | 'OFFICE_HOURS',
                    )
                  }
                >
                  <option value="LONG_TERM">
                    6-Month Structured Apprenticeship ({mentor.meetingFrequency})
                  </option>
                  <option value="OFFICE_HOURS">
                    1-on-1 Tactical Office Hours (45-Min Diagnostic)
                  </option>
                </SelectField>

                <SelectField
                  label="Primary Advisory Focus Topic"
                  value={selectedGoalTopic}
                  onChange={(e) => setSelectedGoalTopic(e.target.value)}
                >
                  <option value={mentor.featuredTopic}>
                    Featured: {mentor.featuredTopic}
                  </option>
                  {mentor.expertise.map((skill) => (
                    <option key={skill} value={`${skill} Deep-Dive & Coaching`}>
                      {skill} Deep-Dive & Coaching
                    </option>
                  ))}
                  {MENTORSHIP_GOALS.filter((g) => g.id !== 'ALL').map((g) => (
                    <option key={g.id} value={g.label}>
                      {g.label}
                    </option>
                  ))}
                </SelectField>

                <SelectField
                  label="Preferred Office Hours Slot (Synced with Calendar)"
                  value={selectedSlotId}
                  onChange={(e) => setSelectedSlotId(e.target.value)}
                >
                  {availableCalendarSlots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.dayLabel} at {slot.timeLabel} ({slot.timezone}) —{' '}
                      {slot.format}
                    </option>
                  ))}
                  <option value="flexible">
                    Propose Custom Window via Direct Message
                  </option>
                </SelectField>

                <SelectField
                  label="Preferred Communication Channel"
                  value={preferredChannel}
                  onChange={(e) => setPreferredChannel(e.target.value)}
                >
                  <option value={mentor.preferredFormat}>
                    Recommended: {mentor.preferredFormat}
                  </option>
                  <option value="Video Call (Google Meet / Zoom)">
                    Video Call (Google Meet / Zoom)
                  </option>
                  <option value="Async RFC / Code / Portfolio Critique">
                    Async RFC / Code / Portfolio Critique
                  </option>
                  <option value="In-Person Chapter Hub Session">
                    In-Person Chapter Hub Session ({mentor.chapter})
                  </option>
                </SelectField>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider font-bold text-foreground/90 select-none flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Your Career Goals & Desired Outcomes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe your target role, current blockers, and what you want to achieve with this mentor..."
                    value={careerGoalsText}
                    onChange={(e) => setCareerGoalsText(e.target.value)}
                    required
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-secondary/60 shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider font-bold text-foreground/90 select-none flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                    Portfolio / GitHub / CV Links (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Paste links to your resume, architecture doc, or specific discussion points..."
                    value={portfolioNotes}
                    onChange={(e) => setPortfolioNotes(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-secondary/60 shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="pt-2 space-y-2.5">
                  <Button type="submit" className="w-full">
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    {mentor.isAvailable
                      ? 'Dispatch Mentorship Request'
                      : 'Join Priority Waitlist'}
                  </Button>
                  <Link to="/messages" className="block">
                    <Button type="button" variant="outline" className="w-full">
                      <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Message{' '}
                      {mentor.name.split(' ')[0]} Directly
                    </Button>
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
export default MentorProfilePage