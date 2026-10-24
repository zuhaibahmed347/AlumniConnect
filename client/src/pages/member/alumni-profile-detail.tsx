import { RoleShell } from '@/components/layout/role-shell'
import { Button } from '@/components/ui/button'
import { Input, SelectField } from '@/components/ui/input'
import {
  MENTORS_CATALOG,
  loadMentorshipRequests,
  saveMentorshipRequests,
  type StoredMentorshipRequest,
} from '@/lib/mentorship-data'
import {
  MentorAvailabilityCalendar,
  type CalendarSlotItem,
} from '@/components/ui/mentor-availability-calendar'
import {
  COVER_THEMES,
  PRESET_AVATARS,
  PRESET_COVER_IMAGES,
  type CoverThemeId,
} from '@/pages/member/profile'
import {
  getActivePersona,
  loadAlumniCatalogWithOverrides,
  saveAlumniProfileOverride,
  loadConnectedAlumniIds,
  saveConnectedAlumniIds,
  type AlumniDetailedRecord,
} from '@/lib/role-context'
import { toast } from '@/lib/toast'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowUpRight,
  Award,
  Briefcase,
  Building2,
  Camera,
  CheckCircle2,
  Clock,
  Compass,
  Edit3,
  ExternalLink,
  Globe2,
  GraduationCap,
  Image as ImageIcon,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

export function AlumniProfileDetailPage() {
  const { alumniId } = useParams<{ alumniId: string }>()
  const navigate = useNavigate()

  const avatarFileInputRef = useRef<HTMLInputElement | null>(null)
  const coverFileInputRef = useRef<HTMLInputElement | null>(null)

  const [catalog, setCatalog] = useState<AlumniDetailedRecord[]>(() =>
    loadAlumniCatalogWithOverrides(),
  )

  const alumni = useMemo(
    () => catalog.find((a) => a.id === alumniId) ?? catalog[0],
    [catalog, alumniId],
  )

  const [connections, setConnections] = useState<
    Record<string, 'CONNECTED' | 'PENDING'>
  >(() => loadConnectedAlumniIds())
  const [mentorshipRequests, setMentorshipRequests] = useState<
    StoredMentorshipRequest[]
  >(() => loadMentorshipRequests())

  // Privacy simulation toggle to demonstrate respect for profile visibility settings
  const [simulateRestrictedPrivacy, setSimulateRestrictedPrivacy] =
    useState(false)

  // Live Alumni Profile & Media Editor state
  const [isEditingAlumni, setIsEditingAlumni] = useState(false)
  const [newSkillDraft, setNewSkillDraft] = useState('')
  const [newInterestDraft, setNewInterestDraft] = useState('')

  // Mentorship request modal state
  const [showMentorModal, setShowMentorModal] = useState(false)
  const [mentorshipGoal, setMentorshipGoal] = useState('')
  const [preferredComm, setPreferredComm] = useState('Video Call & Async Docs')
  const [mentoringTopic, setMentoringTopic] = useState(
    alumni.skills[0] ?? 'Career & Technical Guidance',
  )
  const [selectedCalendarSlot, setSelectedCalendarSlot] =
    useState<CalendarSlotItem | null>(null)

  useEffect(() => {
    setMentoringTopic(alumni.skills[0] ?? 'Career & Technical Guidance')
    setSelectedCalendarSlot(null)
  }, [alumni.id, alumni.skills])

  const linkedMentorRecord = useMemo(
    () =>
      MENTORS_CATALOG.find(
        (m) =>
          m.id === (alumni.mentorId ?? alumni.id) || m.name === alumni.name,
      ) ?? MENTORS_CATALOG[0],
    [alumni.mentorId, alumni.id, alumni.name],
  )

  const connStatus = connections[alumni.id]
  const isConnected = connStatus === 'CONNECTED'
  const isPending = connStatus === 'PENDING'

  const canMessage =
    !simulateRestrictedPrivacy &&
    (alumni.allowMessaging === 'ALL_VERIFIED' || isConnected)

  const existingMentorshipReq = mentorshipRequests.find(
    (r) =>
      r.mentorId === (alumni.mentorId ?? alumni.id) &&
      (r.status === 'PENDING' || r.status === 'ACTIVE'),
  )

  const peerAlumni = useMemo(
    () => catalog.filter((a) => a.id !== alumni.id).slice(0, 4),
    [catalog, alumni.id],
  )

  const updateAlumniField = (patch: Partial<AlumniDetailedRecord>) => {
    saveAlumniProfileOverride(alumni.id, patch)
    setCatalog(loadAlumniCatalogWithOverrides())
  }

  const handleAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateAlumniField({ avatar: reader.result })
        toast.success(`Updated profile photo for ${alumni.name}.`)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleCoverUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateAlumniField({ coverBannerUrl: reader.result })
        toast.success(`Updated cover background for ${alumni.name}.`)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleAddSkill = () => {
    const trimmed = newSkillDraft.trim()
    if (!trimmed) return
    if (alumni.skills.includes(trimmed)) {
      toast.error('Skill already listed.')
      return
    }
    updateAlumniField({ skills: [...alumni.skills, trimmed] })
    setNewSkillDraft('')
    toast.success(`Added "${trimmed}" to ${alumni.name}'s skills.`)
  }

  const handleRemoveSkill = (skill: string) => {
    updateAlumniField({
      skills: alumni.skills.filter((s) => s !== skill),
    })
  }

  const handleAddInterest = () => {
    const trimmed = newInterestDraft.trim()
    if (!trimmed) return
    updateAlumniField({ interests: [...alumni.interests, trimmed] })
    setNewInterestDraft('')
    toast.success(`Added "${trimmed}" to advisory interests.`)
  }

  const handleRemoveInterest = (interest: string) => {
    updateAlumniField({
      interests: alumni.interests.filter((i) => i !== interest),
    })
  }

  const handleToggleConnection = () => {
    const next = { ...connections }
    if (isConnected || isPending) {
      delete next[alumni.id]
      toast({
        title: isConnected
          ? 'Connection Removed'
          : 'Connection Request Withdrawn',
        description: `Updated connection status for ${alumni.name}.`,
      })
    } else {
      next[alumni.id] = 'CONNECTED'
      toast({
        title: 'Connected with Alumni',
        description: `You are now connected with ${alumni.name} (${alumni.chapter}).`,
        variant: 'success',
      })
    }
    setConnections(next)
    saveConnectedAlumniIds(next)
  }

  const handleMessageClick = () => {
    if (!canMessage) {
      toast.error(
        `${alumni.name} only accepts direct messages from confirmed connections. Connect first to message.`,
      )
      return
    }
    navigate('/messages/1')
  }

  const handleSubmitMentorship = (e: FormEvent) => {
    e.preventDefault()
    if (!mentorshipGoal.trim()) {
      toast.error('Please describe your mentorship goal and career interests.')
      return
    }

    const slotLabel = selectedCalendarSlot
      ? `${selectedCalendarSlot.dayLabel} · ${selectedCalendarSlot.timeLabel} (${selectedCalendarSlot.format})`
      : undefined

    const newReq: StoredMentorshipRequest = {
      id: `req-${Date.now()}`,
      mentorId: alumni.mentorId ?? alumni.id,
      mentorName: alumni.name,
      mentorHeadline: alumni.headline,
      menteeName: 'Zainab Magsi (BSCS ’26)',
      mode: selectedCalendarSlot ? 'OFFICE_HOURS' : 'LONG_TERM',
      status: 'PENDING',
      goal: `${mentoringTopic} (${preferredComm}): ${mentorshipGoal.trim()}`,
      slotLabel,
      requestedAt: new Date().toISOString().slice(0, 10),
      startedAt: null,
      meetingCount: 0,
      lastMeeting: null,
      duration: selectedCalendarSlot
        ? `45-min Session · ${slotLabel}`
        : `6-Month Mentorship · ${preferredComm}`,
      notes: [
        `Requested mentorship from ${alumni.name}'s Alumni Profile page.${
          slotLabel ? ` Selected slot: ${slotLabel}` : ''
        }`,
      ],
    }

    const updated = [newReq, ...mentorshipRequests]
    setMentorshipRequests(updated)
    saveMentorshipRequests(updated)
    setShowMentorModal(false)
    setMentorshipGoal('')

    toast({
      title: 'Mentorship Request Sent',
      description: `Your request to ${alumni.name}${
        slotLabel ? ` for ${slotLabel}` : ''
      } is now pending review.`,
      variant: 'success',
    })
  }

  const activeThemeKey =
    (alumni.coverTheme as CoverThemeId) ?? 'emerald-gold'
  const activeCoverTheme =
    COVER_THEMES[activeThemeKey] ?? COVER_THEMES['emerald-gold']

  return (
    <RoleShell
      role={getActivePersona()}
      title={alumni.name}
      subtitle={`${alumni.degree} · Class of ${alumni.graduationYear} · ${alumni.chapter}`}
      badge="Verified Alumni Profile"
      headerActions={
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-mono font-semibold text-foreground hover:border-primary/50 transition-colors"
          >
            My Scholar / Alumni Dossier
          </Link>
          <button
            type="button"
            onClick={() => setSimulateRestrictedPrivacy((prev) => !prev)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-mono font-semibold transition-colors cursor-pointer ${
              simulateRestrictedPrivacy
                ? 'border-primary bg-primary text-white dark:text-slate-950'
                : 'border-border bg-card text-foreground hover:border-primary/50'
            }`}
          >
            {simulateRestrictedPrivacy
              ? 'Privacy: Connections-Only'
              : 'Test Privacy Visibility'}
          </button>
          <Button
            size="sm"
            variant={isEditingAlumni ? 'outline' : 'default'}
            onClick={() => setIsEditingAlumni((prev) => !prev)}
          >
            {isEditingAlumni ? (
              <>
                <X className="h-3.5 w-3.5 mr-1.5" />
                Close Editor
              </>
            ) : (
              <>
                <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                Edit Alumni Profile
              </>
            )}
          </Button>
        </div>
      }
    >
      {/* Hidden File Inputs for Direct Device Photo & Cover Uploads */}
      <input
        ref={avatarFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />
      <input
        ref={coverFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleCoverUpload}
        className="hidden"
      />

      {/* Top Breadcrumb + Quick Alumni Profile Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/alumni"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Alumni Discovery Directory
        </Link>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-secondary mr-1">
            Switch Alumni:
          </span>
          {catalog.slice(0, 6).map((item) => {
            const active = item.id === alumni.id
            return (
              <Link
                key={item.id}
                to={`/alumni/${item.id}`}
                className={`rounded-lg border px-2.5 py-1 text-xs font-sans font-medium transition-colors ${
                  active
                    ? 'border-primary bg-primary text-white dark:text-slate-950 font-semibold shadow-2xs'
                    : 'border-border bg-card text-secondary hover:border-primary/40 hover:text-foreground'
                }`}
              >
                {item.name.split(' ').slice(0, 2).join(' ')}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Executive Identity Dossier Card with Multi-Color Architectural Banner */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 24 }}
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
      >
        {/* Top Architectural Cover Banner */}
        <div
          className={`relative h-36 sm:h-44 bg-gradient-to-r ${activeCoverTheme.gradient} px-6 sm:px-8 py-4 flex items-start justify-between overflow-hidden`}
        >
          {alumni.coverBannerUrl && (
            <img
              src={alumni.coverBannerUrl}
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-luminosity"
            />
          )}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.18),transparent_45%)]"
          />

          <div className="relative z-10 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/35 backdrop-blur-md px-3 py-1 text-xs font-mono font-semibold text-white">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
              Verified Sukkur IBA Graduate
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/30 backdrop-blur-md px-3 py-1 text-xs font-mono text-white/95">
              <Globe2 className="h-3.5 w-3.5 text-amber-300" />
              {alumni.chapter}
            </span>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-2">
            {/* Quick Theme Swatches */}
            <div className="hidden md:flex items-center gap-1 rounded-lg border border-white/20 bg-black/35 backdrop-blur-md px-2 py-1">
              {(Object.keys(COVER_THEMES) as CoverThemeId[]).map((tKey) => {
                const theme = COVER_THEMES[tKey]
                const active = activeThemeKey === tKey
                return (
                  <button
                    key={tKey}
                    type="button"
                    onClick={() => updateAlumniField({ coverTheme: tKey })}
                    title={`Cover Theme: ${theme.label}`}
                    aria-label={`Switch cover theme to ${theme.label}`}
                    className={`h-4 w-4 rounded-full ${theme.swatchClass} transition-transform cursor-pointer ${
                      active
                        ? 'ring-2 ring-white scale-110'
                        : 'opacity-75 hover:opacity-100'
                    }`}
                  />
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => coverFileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-black/40 backdrop-blur-md px-3 py-1.5 text-xs font-mono font-semibold text-white hover:bg-black/60 transition-colors cursor-pointer"
            >
              <ImageIcon className="h-3.5 w-3.5 text-amber-300" />
              Change Cover
            </button>

            {alumni.isMentor && alumni.mentorId && (
              <Link
                to={`/mentorship/mentors/${alumni.mentorId}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300/45 bg-black/50 backdrop-blur-md px-3 py-1.5 text-xs font-mono font-semibold text-amber-200 hover:bg-black/70 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Full Mentor Dossier
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Main Identity Body (Cleanly below the cover banner so Name is 100% legible) */}
        <div className="px-6 sm:px-8 pb-6 sm:pb-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              {/* Avatar overlapping the bottom edge of the cover banner */}
              <div className="relative -mt-14 sm:-mt-16 shrink-0 group">
                <img
                  src={alumni.avatar}
                  alt={alumni.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = '/images/avatar.jpg'
                  }}
                  className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl object-cover ring-4 ring-card shadow-card-hover bg-stone"
                />
                <button
                  type="button"
                  onClick={() => avatarFileInputRef.current?.click()}
                  title="Upload new profile photo"
                  aria-label="Upload new profile photo"
                  className="absolute inset-0 rounded-2xl bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-[11px] font-mono font-semibold cursor-pointer"
                >
                  <Camera className="h-5 w-5 text-amber-300" />
                  <span>Change Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => avatarFileInputRef.current?.click()}
                  title="Change profile photo"
                  aria-label="Change profile photo"
                  className="absolute -bottom-1.5 -right-1.5 h-8 w-8 rounded-full bg-primary text-white dark:text-slate-950 ring-2 ring-card flex items-center justify-center shadow-sm hover:scale-105 transition-transform cursor-pointer"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 pt-3 sm:pt-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                    {alumni.name}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-0.5 text-xs font-mono font-semibold ${
                      isConnected
                        ? 'border-primary/40 bg-accent text-primary'
                        : isPending
                          ? 'border-gold/40 bg-gold/15 text-foreground'
                          : 'border-border bg-stone text-secondary'
                    }`}
                  >
                    {isConnected
                      ? '1st-Degree Connection'
                      : isPending
                        ? 'Invitation Pending'
                        : 'Sukkur IBA Network'}
                  </span>
                </div>

                <p className="font-sans text-base sm:text-[17px] font-medium text-foreground/90 leading-snug">
                  {alumni.headline}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm font-sans text-secondary pt-0.5">
                  <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                    <Building2 className="h-4 w-4 text-primary shrink-0" />
                    {alumni.currentRole} at {alumni.company}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    {alumni.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Primary Relationship Actions */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
              <Button
                variant={isConnected ? 'outline' : 'default'}
                onClick={handleToggleConnection}
              >
                {isConnected ? (
                  <>
                    <UserCheck className="h-4 w-4 mr-1.5 text-primary" />
                    Connected ✓
                  </>
                ) : isPending ? (
                  <>
                    <Clock className="h-4 w-4 mr-1.5 text-primary" />
                    Request Pending
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-1.5" />
                    Connect with {alumni.name.split(' ')[0]}
                  </>
                )}
              </Button>

              <Button variant="outline" onClick={handleMessageClick}>
                {canMessage ? (
                  <MessageSquare className="h-4 w-4 mr-1.5 text-primary" />
                ) : (
                  <Lock className="h-4 w-4 mr-1.5 text-secondary" />
                )}
                {canMessage ? 'Send Message' : 'Connections-Only'}
              </Button>

              {alumni.isMentor && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (existingMentorshipReq) {
                      navigate('/mentorship/relationships')
                    } else {
                      setShowMentorModal(true)
                    }
                  }}
                >
                  <Compass className="h-4 w-4 mr-1.5 text-primary" />
                  {existingMentorshipReq
                    ? `Mentorship: ${existingMentorshipReq.status}`
                    : 'Request Mentorship'}
                </Button>
              )}
            </div>
          </div>

          {/* 4-Column Color-Accented Institutional Credentials Bar */}
          <div className="mt-7 pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="relative overflow-hidden rounded-xl border border-border bg-background p-4 shadow-2xs space-y-1"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-emerald-400" />
              <p className="text-[11px] font-mono uppercase tracking-wider text-primary font-semibold">
                Academic Degree
              </p>
              <p className="font-display text-sm font-bold text-foreground flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                {alumni.degree}
              </p>
              <p className="font-sans text-xs text-secondary">
                {alumni.department} · Class of {alumni.graduationYear}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="relative overflow-hidden rounded-xl border border-border bg-background p-4 shadow-2xs space-y-1"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-400" />
              <p className="text-[11px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-300 font-semibold">
                Industry & Domain
              </p>
              <p className="font-display text-sm font-bold text-foreground flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-amber-600 shrink-0" />
                {alumni.industry}
              </p>
              <p className="font-sans text-xs text-secondary">
                {alumni.company}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="relative overflow-hidden rounded-xl border border-border bg-background p-4 shadow-2xs space-y-1"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-400" />
              <p className="text-[11px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold">
                Shared Network
              </p>
              <p className="font-display text-sm font-bold text-foreground flex items-center gap-1.5">
                <Users className="h-4 w-4 text-blue-600 shrink-0" />
                {alumni.mutualConnections} Mutual Scholars
              </p>
              <p className="font-sans text-xs text-secondary">
                Verified Sukkur IBA cohort overlap
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="relative overflow-hidden rounded-xl border border-border bg-background p-4 shadow-2xs space-y-1"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-600 to-pink-500" />
              <p className="text-[11px] font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400 font-semibold">
                Contact & Privacy
              </p>
              {alumni.showEmail && !simulateRestrictedPrivacy ? (
                <>
                  <p className="font-display text-sm font-bold text-primary truncate flex items-center gap-1.5">
                    <Mail className="h-4 w-4 shrink-0" />
                    {alumni.email}
                  </p>
                  <p className="font-sans text-xs text-secondary">
                    Direct institutional contact enabled
                  </p>
                </>
              ) : (
                <>
                  <p className="font-display text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Lock className="h-4 w-4 text-primary shrink-0" />
                    Platform Messaging
                  </p>
                  <p className="font-sans text-xs text-secondary">
                    Email protected by privacy settings
                  </p>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Live Alumni Profile & Media Editor Drawer */}
      <AnimatePresence>
        {isEditingAlumni && (
          <motion.section
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border-2 border-primary/45 bg-card p-6 sm:p-7 shadow-card-hover space-y-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider font-bold text-primary flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-gold" />
                  Live Alumni Profile & Media Studio
                </p>
                <h3 className="font-display text-xl font-bold text-foreground">
                  Edit {alumni.name}’s Profile, Photo & Background Cover
                </h3>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setIsEditingAlumni(false)
                  toast.success(`Saved changes to ${alumni.name}'s profile.`)
                }}
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Done Editing
              </Button>
            </div>

            {/* Avatar & Cover Customizer */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="rounded-xl border border-border bg-background p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-mono uppercase tracking-wider font-bold text-primary">
                    Profile Photo
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => avatarFileInputRef.current?.click()}
                  >
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    Upload Photo
                  </Button>
                </div>
                <Input
                  value={alumni.avatar}
                  onChange={(e) =>
                    updateAlumniField({ avatar: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/..."
                />
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {PRESET_AVATARS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => updateAlumniField({ avatar: preset.url })}
                      className={`rounded-lg p-0.5 transition-transform cursor-pointer ${
                        alumni.avatar === preset.url
                          ? 'ring-2 ring-primary scale-105'
                          : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        referrerPolicy="no-referrer"
                        className="h-10 w-10 rounded-md object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-mono uppercase tracking-wider font-bold text-primary">
                    Cover Background & Theme
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => coverFileInputRef.current?.click()}
                  >
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    Upload Cover
                  </Button>
                </div>
                <Input
                  value={alumni.coverBannerUrl ?? ''}
                  onChange={(e) =>
                    updateAlumniField({ coverBannerUrl: e.target.value })
                  }
                  placeholder="/images/campus.jpg or https://..."
                />
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_COVER_IMAGES.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() =>
                        updateAlumniField({ coverBannerUrl: item.url })
                      }
                      className={`rounded-md border px-2 py-1 text-[11px] font-mono font-semibold cursor-pointer ${
                        (alumni.coverBannerUrl ?? '') === item.url
                          ? 'border-primary bg-primary text-white dark:text-slate-950'
                          : 'border-border bg-card text-secondary hover:text-foreground'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Identity & Career Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1">
                  Full Name
                </label>
                <Input
                  value={alumni.name}
                  onChange={(e) => updateAlumniField({ name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1">
                  Current Role
                </label>
                <Input
                  value={alumni.currentRole}
                  onChange={(e) =>
                    updateAlumniField({ currentRole: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1">
                  Company / Organization
                </label>
                <Input
                  value={alumni.company}
                  onChange={(e) =>
                    updateAlumniField({ company: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1">
                  Executive Headline
                </label>
                <Input
                  value={alumni.headline}
                  onChange={(e) =>
                    updateAlumniField({ headline: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1">
                  Location / Chapter
                </label>
                <Input
                  value={alumni.location}
                  onChange={(e) =>
                    updateAlumniField({ location: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1">
                Executive Biography
              </label>
              <textarea
                rows={3}
                value={alumni.bio}
                onChange={(e) => updateAlumniField({ bio: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-sans text-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Main 2-Column Content Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Executive Biography, Career Journey Timeline & Visual Availability Calendar */}
        <div className="lg:col-span-8 space-y-6">
          {/* Executive Biography Card with High-Readability Sans Typography */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider font-semibold text-primary">
                  Executive Biography
                </p>
                <h3 className="font-display text-xl font-bold text-foreground">
                  About {alumni.name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {alumni.linkedinUrl && (
                  <a
                    href={alumni.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-mono font-semibold text-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    LinkedIn
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingAlumni(true)}
                >
                  <Edit3 className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
              </div>
            </div>

            <div className="rounded-xl border-l-4 border-l-primary border border-border/70 bg-background/70 p-4 sm:p-5">
              <p className="font-sans text-[15px] sm:text-base text-foreground/90 leading-[1.8] tracking-[-0.005em] font-normal">
                {alumni.bio}
              </p>
            </div>
          </div>

          {/* Career Journey & Academic Foundation Timeline */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-card space-y-5">
            <div className="border-b border-border pb-3.5">
              <p className="text-xs font-mono uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400">
                Verified Career Progression
              </p>
              <h3 className="font-display text-xl font-bold text-foreground">
                Career Journey & Academic Foundation
              </h3>
            </div>

            <div className="relative pl-4 sm:pl-6 border-l-2 border-primary/30 space-y-5">
              {alumni.careerJourney.map((step, idx) => (
                <motion.div
                  key={step.period}
                  whileHover={{ x: 3 }}
                  className="relative rounded-xl border border-border bg-background p-4 sm:p-5 shadow-2xs hover:border-primary/40 transition-colors space-y-2"
                >
                  <span className="absolute -left-[25px] sm:-left-[33px] top-5 h-4 w-4 rounded-full border-2 border-primary bg-card" />

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-md border border-primary/25 bg-accent px-2.5 py-0.5 font-mono text-xs font-bold text-primary">
                      {step.period}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-sans font-medium text-secondary">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {step.location}
                    </span>
                  </div>

                  <div className="pt-0.5">
                    <h4 className="font-display text-base sm:text-lg font-bold text-foreground">
                      {step.role}
                    </h4>
                    <p className="font-sans text-sm font-semibold text-primary">
                      {step.company}
                    </p>
                  </div>

                  <p className="font-sans text-sm sm:text-[15px] text-foreground/85 leading-[1.7] pt-1">
                    {step.highlight}
                  </p>

                  {idx === 0 && (
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-primary font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Current Position
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mentor Visual Availability Calendar (integrated when alumnus is a mentor) */}
          {alumni.isMentor && (
            <MentorAvailabilityCalendar
              mentor={linkedMentorRecord}
              selectedSlotId={selectedCalendarSlot?.id}
              existingRequests={mentorshipRequests.filter(
                (r) => r.mentorId === (alumni.mentorId ?? alumni.id),
              )}
              onSelectSlot={(slot) => {
                setSelectedCalendarSlot(slot)
                setShowMentorModal(true)
              }}
            />
          )}
        </div>

        {/* Right 4 Cols: Skills, Achievements, Mentorship & Peer Alumni */}
        <div className="lg:col-span-4 space-y-6">
          {/* Verified Competencies & Interests */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5">
            <div className="border-b border-border pb-3">
              <p className="text-xs font-mono uppercase tracking-wider font-semibold text-primary">
                Verified Competencies
              </p>
              <h3 className="font-display text-lg font-bold text-foreground">
                Skills & Specializations
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {alumni.skills.map((skill, idx) => {
                const colorStyles =
                  idx % 3 === 0
                    ? 'border-primary/30 bg-accent/65 text-foreground'
                    : idx % 3 === 1
                      ? 'border-blue-500/25 bg-blue-500/10 text-foreground'
                      : 'border-amber-500/30 bg-amber-500/10 text-foreground'
                return (
                  <span
                    key={skill}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-sans font-semibold ${colorStyles}`}
                  >
                    <Link
                      to={`/alumni?q=${encodeURIComponent(skill)}`}
                      className="hover:underline"
                    >
                      {skill}
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      aria-label={`Remove ${skill}`}
                      className="text-secondary hover:text-destructive cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )
              })}
            </div>

            {/* Quick Add Skill */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add skill..."
                value={newSkillDraft}
                onChange={(e) => setNewSkillDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSkill()
                  }
                }}
                className="h-9 text-xs"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddSkill}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="pt-4 border-t border-border space-y-2.5">
              <p className="text-xs font-mono uppercase tracking-wider font-semibold text-purple-600 dark:text-purple-400">
                Advisory & Mentoring Interests
              </p>
              <div className="flex flex-wrap gap-2">
                {alumni.interests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/25 bg-purple-500/10 px-3 py-1 text-xs font-sans font-medium text-foreground/90"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(interest)}
                      aria-label={`Remove ${interest}`}
                      className="text-secondary hover:text-destructive cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add mentoring interest..."
                  value={newInterestDraft}
                  onChange={(e) => setNewInterestDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddInterest()
                    }
                  }}
                  className="h-9 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddInterest}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Honors & Institutional Impact */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
            <div className="border-b border-border pb-3">
              <p className="text-xs font-mono uppercase tracking-wider font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-gold" />
                Honors & Institutional Impact
              </p>
              <h3 className="font-display text-lg font-bold text-foreground">
                Key Achievements
              </h3>
            </div>

            <ul className="space-y-3">
              {alumni.achievements.map((ach) => (
                <li
                  key={ach}
                  className="rounded-xl border border-border/80 bg-background p-3.5 flex items-start gap-2.5"
                >
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="font-sans text-sm text-foreground/90 leading-[1.65]">
                    {ach}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore Other Alumni Cohort Peers */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider font-semibold text-primary">
                  Fellow Graduates
                </p>
                <h3 className="font-display text-lg font-bold text-foreground">
                  More Sukkur IBA Alumni
                </h3>
              </div>
              <Link
                to="/alumni"
                className="text-xs font-mono font-semibold text-primary hover:underline"
              >
                Directory
              </Link>
            </div>

            <div className="space-y-2.5">
              {peerAlumni.map((peer) => (
                <Link
                  key={peer.id}
                  to={`/alumni/${peer.id}`}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3 hover:border-primary/45 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={peer.avatar}
                      alt={peer.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = '/images/avatar.jpg'
                      }}
                      className="h-10 w-10 rounded-xl object-cover ring-1 ring-border shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {peer.name}
                      </p>
                      <p className="font-sans text-xs text-secondary truncate">
                        {peer.currentRole} · {peer.company}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-secondary group-hover:text-primary shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mentorship Request Modal */}
      <AnimatePresence>
        {showMentorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowMentorModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider font-bold text-primary">
                    Mentorship Application
                  </p>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    Request Mentorship from {alumni.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMentorModal(false)}
                  aria-label="Close modal"
                  className="rounded-lg border border-border p-1.5 text-secondary hover:text-foreground cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitMentorship} className="space-y-4">
                {selectedCalendarSlot && (
                  <div className="rounded-xl border border-primary/30 bg-accent/70 p-3.5 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider font-bold text-primary">
                        Selected Calendar Time Slot
                      </p>
                      <p className="text-xs font-mono font-bold text-foreground mt-0.5">
                        {selectedCalendarSlot.dayLabel} ·{' '}
                        {selectedCalendarSlot.timeLabel} (
                        {selectedCalendarSlot.format})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCalendarSlot(null)}
                      className="text-[11px] font-mono text-secondary hover:text-foreground underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1.5">
                    Mentoring Topic & Career Interest
                  </label>
                  <SelectField
                    value={mentoringTopic}
                    onChange={(e) => setMentoringTopic(e.target.value)}
                  >
                    {alumni.skills.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                    <option value="Graduate Role & Resume Calibration">
                      Graduate Role & Resume Calibration
                    </option>
                  </SelectField>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1.5">
                    Preferred Communication Method
                  </label>
                  <SelectField
                    value={preferredComm}
                    onChange={(e) => setPreferredComm(e.target.value)}
                  >
                    <option value="Video Call & Async Docs">
                      Video Call & Async Docs
                    </option>
                    <option value="Platform Messaging & Code Review">
                      Platform Messaging & Code Review
                    </option>
                    <option value="In-Person Chapter Hub Session">
                      In-Person Chapter Hub Session
                    </option>
                  </SelectField>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1.5">
                    Your Goals & Background Note
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={mentorshipGoal}
                    onChange={(e) => setMentorshipGoal(e.target.value)}
                    placeholder={`Share your academic year, career goals, and what you'd like to discuss with ${alumni.name}...`}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-sans text-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowMentorModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Submit Mentorship Request</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </RoleShell>
  )
}
