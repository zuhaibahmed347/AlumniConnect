import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  MapPin,
  FileCode2,
  CheckCircle2,
  Sparkles,
  Globe,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type {
  MentorRecord,
  MentorSessionSlot,
  StoredMentorshipRequest,
} from '@/lib/mentorship-data'
import { cn } from '@/lib/utils'

const CUSTOM_SLOTS_STORAGE_KEY = 'siba_mentor_custom_slots_v1'

export interface CalendarSlotItem extends MentorSessionSlot {
  dateIso: string // e.g. '2026-11-12'
  dayOfMonth: number // e.g. 12
  weekdayShort: string // e.g. 'Thu'
  monthShort: string // e.g. 'Nov'
  durationMinutes: number
  pktTimeLabel: string
  topicHint: string
  capacityLabel: 'Open' | '1 Seat Left'
}

/**
 * Generates an enriched set of calendar dates for November 2026 and maps
 * the mentor's officeHoursSlots (plus supplemental realistic open windows)
 * onto specific calendar dates so students can visually browse open days and times.
 */
const NOVEMBER_2026_DAYS = Array.from({ length: 30 }, (_, index) => {
  const dayNum = index + 1
  // Nov 1, 2026 is a Sunday
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const weekdayFull = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]
  const weekdayIdx = index % 7
  const dateIso = `2026-11-${String(dayNum).padStart(2, '0')}`
  return {
    dateIso,
    dayNum,
    weekdayShort: weekdayNames[weekdayIdx],
    weekdayFull: weekdayFull[weekdayIdx],
    dayLabel: `${weekdayNames[weekdayIdx]}, Nov ${dayNum}`,
    isWeekend: weekdayIdx === 0 || weekdayIdx === 6,
  }
})

/**
 * Supplemental recurring slots per mentor so every mentor has a realistic
 * multi-week visual schedule across November 2026 in addition to their primary slots.
 */
const SUPPLEMENTAL_SLOTS_BY_MENTOR: Record<string, MentorSessionSlot[]> = {
  '1': [
    {
      id: 'sk-3',
      dayLabel: 'Tue, Nov 17',
      timeLabel: '20:00 PKT',
      timezone: 'UTC+5',
      format: 'Video Call',
    },
    {
      id: 'sk-4',
      dayLabel: 'Thu, Nov 19',
      timeLabel: '19:30 PKT',
      timezone: 'UTC+5',
      format: 'Video Call',
    },
    {
      id: 'sk-5',
      dayLabel: 'Sat, Nov 21',
      timeLabel: '11:30 PKT',
      timezone: 'UTC+5',
      format: 'In-Person Hub',
    },
    {
      id: 'sk-6',
      dayLabel: 'Tue, Nov 24',
      timeLabel: '19:00 PKT',
      timezone: 'UTC+5',
      format: 'Async Code/Doc Review',
    },
  ],
  '2': [
    {
      id: 'sm-3',
      dayLabel: 'Wed, Nov 18',
      timeLabel: '20:00 GST',
      timezone: 'UTC+4',
      format: 'Video Call',
    },
    {
      id: 'sm-4',
      dayLabel: 'Sat, Nov 21',
      timeLabel: '15:00 GST',
      timezone: 'UTC+4',
      format: 'Async Code/Doc Review',
    },
    {
      id: 'sm-5',
      dayLabel: 'Sun, Nov 22',
      timeLabel: '16:30 GST',
      timezone: 'UTC+4',
      format: 'Video Call',
    },
  ],
  '3': [
    {
      id: 'as-3',
      dayLabel: 'Tue, Nov 17',
      timeLabel: '18:30 CET',
      timezone: 'UTC+1',
      format: 'Video Call',
    },
    {
      id: 'as-4',
      dayLabel: 'Sat, Nov 21',
      timeLabel: '14:00 CET',
      timezone: 'UTC+1',
      format: 'Async Code/Doc Review',
    },
  ],
  '4': [
    {
      id: 'fm-3',
      dayLabel: 'Thu, Nov 19',
      timeLabel: '18:00 PKT',
      timezone: 'UTC+5',
      format: 'Video Call',
    },
    {
      id: 'fm-4',
      dayLabel: 'Sat, Nov 21',
      timeLabel: '12:00 PKT',
      timezone: 'UTC+5',
      format: 'In-Person Hub',
    },
  ],
  '5': [
    {
      id: 'uk-3',
      dayLabel: 'Wed, Nov 18',
      timeLabel: '19:00 GMT',
      timezone: 'UTC+0',
      format: 'Video Call',
    },
    {
      id: 'uk-4',
      dayLabel: 'Sun, Nov 22',
      timeLabel: '15:00 GMT',
      timezone: 'UTC+0',
      format: 'Async Code/Doc Review',
    },
  ],
  '6': [
    {
      id: 'nb-3',
      dayLabel: 'Thu, Nov 19',
      timeLabel: '17:30 EST',
      timezone: 'UTC-5',
      format: 'Video Call',
    },
    {
      id: 'nb-4',
      dayLabel: 'Sat, Nov 21',
      timeLabel: '10:30 EST',
      timezone: 'UTC-5',
      format: 'Video Call',
    },
  ],
}

export function loadMentorCustomSlots(
  mentorId: string,
  baseSlots: MentorSessionSlot[],
): MentorSessionSlot[] {
  const defaultCombined = [
    ...baseSlots,
    ...(SUPPLEMENTAL_SLOTS_BY_MENTOR[mentorId] ?? []),
  ]
  if (typeof window === 'undefined') return defaultCombined
  try {
    const raw = window.localStorage.getItem(CUSTOM_SLOTS_STORAGE_KEY)
    if (!raw) return defaultCombined
    const parsed = JSON.parse(raw) as Record<string, MentorSessionSlot[]>
    const storedForMentor = parsed[mentorId]
    if (Array.isArray(storedForMentor) && storedForMentor.length > 0) {
      return storedForMentor
    }
    return defaultCombined
  } catch {
    return defaultCombined
  }
}

export function saveMentorCustomSlots(
  mentorId: string,
  slots: MentorSessionSlot[],
): void {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(CUSTOM_SLOTS_STORAGE_KEY)
    const parsed: Record<string, MentorSessionSlot[]> = raw
      ? JSON.parse(raw)
      : {}
    parsed[mentorId] = slots
    window.localStorage.setItem(
      CUSTOM_SLOTS_STORAGE_KEY,
      JSON.stringify(parsed),
    )
    window.dispatchEvent(
      new CustomEvent('mentor-slots-updated', { detail: { mentorId, slots } }),
    )
  } catch {
    // Ignore storage errors
  }
}

function parseDayNumberFromLabel(dayLabel: string, fallbackIndex: number): number {
  const match = dayLabel.match(/(\d{1,2})/)
  if (match) {
    const parsed = Number.parseInt(match[1], 10)
    if (parsed >= 1 && parsed <= 30) return parsed
  }
  return Math.min(28, 10 + fallbackIndex * 3)
}

function convertToPktLabel(timeLabel: string, timezone: string): string {
  if (timeLabel.includes('PKT') || timezone === 'UTC+5') {
    return timeLabel
  }
  const match = timeLabel.match(/(\d{1,2}):(\d{2})/)
  if (!match) return `${timeLabel} (PKT +5)`
  const hour = Number.parseInt(match[1], 10)
  const minute = match[2]

  let offsetDiff = 0
  if (timezone.includes('UTC+4') || timeLabel.includes('GST')) offsetDiff = 1
  else if (timezone.includes('UTC+1') || timeLabel.includes('CET')) offsetDiff = 4
  else if (timezone.includes('UTC+0') || timeLabel.includes('GMT')) offsetDiff = 5
  else if (timezone.includes('UTC-5') || timeLabel.includes('EST')) offsetDiff = 10

  const pktHour = (hour + offsetDiff) % 24
  const nextDaySuffix = hour + offsetDiff >= 24 ? ' (+1d)' : ''
  return `${String(pktHour).padStart(2, '0')}:${minute} PKT${nextDaySuffix}`
}

function enrichSlot(
  slot: MentorSessionSlot,
  idx: number,
  mentor: MentorRecord,
): CalendarSlotItem {
  const dayOfMonth = parseDayNumberFromLabel(slot.dayLabel, idx)
  const dayMeta =
    NOVEMBER_2026_DAYS[dayOfMonth - 1] ?? NOVEMBER_2026_DAYS[11]
  const topicHint =
    slot.format === 'Async Code/Doc Review'
      ? `RFC / Portfolio / CV Critique · ${mentor.expertise[0] ?? 'Advisory'}`
      : slot.format === 'In-Person Hub'
        ? `In-Person Chapter Session (${mentor.chapter})`
        : `1-on-1 Video Diagnostic · ${mentor.expertise[idx % mentor.expertise.length] ?? mentor.featuredTopic}`

  return {
    ...slot,
    dayLabel: `${dayMeta.weekdayShort}, Nov ${dayOfMonth}`,
    dateIso: dayMeta.dateIso,
    dayOfMonth,
    weekdayShort: dayMeta.weekdayShort,
    monthShort: 'Nov',
    durationMinutes: slot.format === 'Async Code/Doc Review' ? 30 : 45,
    pktTimeLabel: convertToPktLabel(slot.timeLabel, slot.timezone),
    topicHint,
    capacityLabel: idx % 2 === 0 ? 'Open' : '1 Seat Left',
  }
}

export interface MentorAvailabilityCalendarProps {
  mentor: MentorRecord
  selectedSlotId?: string
  onSelectSlot?: (slot: CalendarSlotItem) => void
  existingRequests?: StoredMentorshipRequest[]
  /** When true, allows mentors to add/remove slots directly on the visual calendar */
  editable?: boolean
  onSlotsChange?: (updatedSlots: MentorSessionSlot[]) => void
  compact?: boolean
}

export function MentorAvailabilityCalendar({
  mentor,
  selectedSlotId,
  onSelectSlot,
  existingRequests = [],
  editable = false,
  onSlotsChange,
  compact = false,
}: MentorAvailabilityCalendarProps) {
  const [rawSlots, setRawSlots] = useState<MentorSessionSlot[]>(() =>
    loadMentorCustomSlots(mentor.id, mentor.officeHoursSlots),
  )

  useEffect(() => {
    setRawSlots(loadMentorCustomSlots(mentor.id, mentor.officeHoursSlots))
  }, [mentor.id, mentor.officeHoursSlots])

  useEffect(() => {
    const handleExternalUpdate = (e: Event) => {
      const detail = (
        e as CustomEvent<{ mentorId: string; slots: MentorSessionSlot[] }>
      ).detail
      if (detail && detail.mentorId === mentor.id) {
        setRawSlots(detail.slots)
      }
    }
    window.addEventListener('mentor-slots-updated', handleExternalUpdate)
    return () =>
      window.removeEventListener('mentor-slots-updated', handleExternalUpdate)
  }, [mentor.id])

  const enrichedSlots = useMemo(
    () => rawSlots.map((slot, idx) => enrichSlot(slot, idx, mentor)),
    [rawSlots, mentor],
  )

  const [formatFilter, setFormatFilter] = useState<
    'ALL' | MentorSessionSlot['format']
  >('ALL')
  const [showPktTime, setShowPktTime] = useState<boolean>(true)
  const [calendarScope, setCalendarScope] = useState<'TWO_WEEKS' | 'FULL_MONTH'>(
    compact ? 'TWO_WEEKS' : 'FULL_MONTH',
  )
  const [weekWindowStart, setWeekWindowStart] = useState<number>(8) // Nov 9 (index 8) to Nov 22
  const [selectedDayNum, setSelectedDayNum] = useState<number | 'ALL'>('ALL')

  // Quick-add slot state when editable === true
  const [quickAddTime, setQuickAddTime] = useState('19:30 PKT')
  const [quickAddFormat, setQuickAddFormat] =
    useState<MentorSessionSlot['format']>('Video Call')

  const filteredSlots = useMemo(
    () =>
      enrichedSlots.filter((s) =>
        formatFilter === 'ALL' ? true : s.format === formatFilter,
      ),
    [enrichedSlots, formatFilter],
  )

  const slotsByDay = useMemo(() => {
    const map = new Map<number, CalendarSlotItem[]>()
    for (const slot of filteredSlots) {
      const list = map.get(slot.dayOfMonth) ?? []
      list.push(slot)
      map.set(slot.dayOfMonth, list)
    }
    return map
  }, [filteredSlots])

  const requestedSlotLabels = useMemo(() => {
    const set = new Set<string>()
    for (const req of existingRequests) {
      if (req.status !== 'CANCELLED' && req.slotLabel) {
        set.add(req.slotLabel)
      }
    }
    return set
  }, [existingRequests])

  const visibleDays = useMemo(() => {
    if (calendarScope === 'FULL_MONTH') {
      return NOVEMBER_2026_DAYS
    }
    return NOVEMBER_2026_DAYS.slice(weekWindowStart, weekWindowStart + 14)
  }, [calendarScope, weekWindowStart])

  const displayedSlots = useMemo(() => {
    if (selectedDayNum === 'ALL') {
      return [...filteredSlots].sort((a, b) => a.dayOfMonth - b.dayOfMonth)
    }
    return slotsByDay.get(selectedDayNum) ?? []
  }, [filteredSlots, selectedDayNum, slotsByDay])

  const totalOpenDays = slotsByDay.size
  const totalOpenSlots = filteredSlots.length

  const handleDayClick = (dayNum: number) => {
    const hasSlots = (slotsByDay.get(dayNum)?.length ?? 0) > 0
    if (selectedDayNum === dayNum) {
      setSelectedDayNum('ALL')
      return
    }
    setSelectedDayNum(dayNum)
    if (hasSlots && onSelectSlot) {
      const firstSlot = slotsByDay.get(dayNum)?.[0]
      if (firstSlot) {
        onSelectSlot(firstSlot)
      }
    }
  }

  const handleAddSlotForDay = () => {
    const targetDay =
      typeof selectedDayNum === 'number' ? selectedDayNum : 18
    const dayMeta =
      NOVEMBER_2026_DAYS[targetDay - 1] ?? NOVEMBER_2026_DAYS[17]
    const newSlot: MentorSessionSlot = {
      id: `slot-${mentor.id}-${Date.now()}`,
      dayLabel: `${dayMeta.weekdayShort}, Nov ${targetDay}`,
      timeLabel: quickAddTime.trim() || '19:30 PKT',
      timezone: 'UTC+5',
      format: quickAddFormat,
    }
    const updated = [...rawSlots, newSlot]
    setRawSlots(updated)
    saveMentorCustomSlots(mentor.id, updated)
    onSlotsChange?.(updated)
  }

  const handleRemoveSlot = (slotId: string) => {
    const updated = rawSlots.filter((s) => s.id !== slotId)
    setRawSlots(updated)
    saveMentorCustomSlots(mentor.id, updated)
    onSlotsChange?.(updated)
  }

  const getFormatIcon = (format: MentorSessionSlot['format']) => {
    if (format === 'Video Call') return <Video className="w-3.5 h-3.5" />
    if (format === 'In-Person Hub') return <MapPin className="w-3.5 h-3.5" />
    return <FileCode2 className="w-3.5 h-3.5" />
  }

  return (
    <section
      aria-label={`Visual availability calendar for ${mentor.name}`}
      className="bg-card border border-border rounded-2xl shadow-card overflow-hidden"
    >
      {/* Header Banner */}
      <div className="px-6 py-4 bg-gradient-to-r from-accent/80 via-stone/50 to-transparent border-b border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 rounded-full bg-primary" />
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary font-bold block">
              Live Session Schedule · November 2026
            </span>
            <h2 className="font-display text-lg font-bold text-foreground">
              Visual Mentor Availability Calendar
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold px-2.5 py-1 rounded-md bg-accent text-primary border border-primary/25">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {totalOpenSlots} Open Slot{totalOpenSlots === 1 ? '' : 's'} across{' '}
            {totalOpenDays} Day{totalOpenDays === 1 ? '' : 's'}
          </span>

          <button
            type="button"
            onClick={() => setShowPktTime((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-md bg-card border border-border text-foreground hover:border-primary/40 transition-colors cursor-pointer"
            title="Toggle between Student Local Time (PKT) and Mentor Timezone"
          >
            <Globe className="w-3 h-3 text-primary" />
            {showPktTime
              ? 'Viewing in PKT (UTC+5)'
              : `Mentor TZ (${rawSlots[0]?.timezone ?? 'Local'})`}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Controls Toolbar: Format Filter & View Scope */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/70">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'ALL', label: 'All Formats' },
                { id: 'Video Call', label: 'Video Call' },
                { id: 'In-Person Hub', label: 'In-Person Hub' },
                { id: 'Async Code/Doc Review', label: 'Async Review' },
              ] as const
            ).map((tab) => {
              const active = formatFilter === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFormatFilter(tab.id)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer border',
                    active
                      ? 'bg-primary text-primary-foreground border-primary shadow-2xs'
                      : 'bg-stone/50 text-secondary border-border hover:text-foreground hover:border-primary/30',
                  )}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            {calendarScope === 'TWO_WEEKS' && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={weekWindowStart <= 0}
                  onClick={() =>
                    setWeekWindowStart((prev) => Math.max(0, prev - 7))
                  }
                  aria-label="Previous week"
                  className="p-1 rounded-md border border-border bg-card text-foreground disabled:opacity-40 hover:border-primary/40 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono font-semibold text-secondary px-1.5">
                  Nov {weekWindowStart + 1} – Nov{' '}
                  {Math.min(30, weekWindowStart + 14)}
                </span>
                <button
                  type="button"
                  disabled={weekWindowStart + 14 >= 30}
                  onClick={() =>
                    setWeekWindowStart((prev) => Math.min(16, prev + 7))
                  }
                  aria-label="Next week"
                  className="p-1 rounded-md border border-border bg-card text-foreground disabled:opacity-40 hover:border-primary/40 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                setCalendarScope((prev) =>
                  prev === 'FULL_MONTH' ? 'TWO_WEEKS' : 'FULL_MONTH',
                )
              }
              className="text-[11px] font-mono font-semibold text-primary hover:underline cursor-pointer"
            >
              {calendarScope === 'FULL_MONTH'
                ? 'Compact 2-Week View'
                : 'Expand Full Month'}
            </button>
          </div>
        </div>

        {/* Visual Calendar Grid */}
        <div className="space-y-2">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div
                key={d}
                className="text-[10px] font-mono uppercase tracking-wider font-bold text-secondary py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {visibleDays.map((day) => {
              const daySlots = slotsByDay.get(day.dayNum) ?? []
              const hasOpenSlots = daySlots.length > 0
              const isSelectedDay = selectedDayNum === day.dayNum
              const hasActiveSelection = daySlots.some(
                (s) => s.id === selectedSlotId,
              )
              const hasStudentRequest =
                daySlots.length > 0 &&
                Array.from(requestedSlotLabels).some((lbl) =>
                  lbl.includes(`Nov ${day.dayNum}`),
                )

              return (
                <motion.button
                  key={day.dateIso}
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleDayClick(day.dayNum)}
                  aria-label={`${day.dayLabel}, ${daySlots.length} open time slots`}
                  aria-pressed={isSelectedDay}
                  className={cn(
                    'relative rounded-xl border p-2 sm:p-2.5 flex flex-col items-center justify-between min-h-[68px] sm:min-h-[76px] transition-all cursor-pointer text-left',
                    isSelectedDay
                      ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/30 shadow-sm'
                      : hasActiveSelection
                        ? 'bg-accent border-primary text-foreground ring-1 ring-primary/40'
                        : hasOpenSlots
                          ? 'bg-accent/55 hover:bg-accent border-primary/35 text-foreground'
                          : 'bg-stone/35 hover:bg-stone/60 border-border/70 text-secondary/75',
                  )}
                >
                  <div className="w-full flex items-center justify-between">
                    <span
                      className={cn(
                        'font-mono text-xs sm:text-sm font-bold',
                        isSelectedDay
                          ? 'text-primary-foreground'
                          : hasOpenSlots
                            ? 'text-foreground'
                            : 'text-secondary/70',
                      )}
                    >
                      {day.dayNum}
                    </span>
                    {hasStudentRequest && (
                      <span
                        title="You have a requested session on this date"
                        className="w-2 h-2 rounded-full bg-gold shrink-0"
                      />
                    )}
                  </div>

                  {/* Slot density badge inside day cell */}
                  {hasOpenSlots ? (
                    <div className="w-full mt-1.5 space-y-1">
                      <span
                        className={cn(
                          'block text-[10px] font-mono font-bold truncate px-1.5 py-0.5 rounded text-center',
                          isSelectedDay
                            ? 'bg-white/20 text-white'
                            : 'bg-primary/15 text-primary',
                        )}
                      >
                        {daySlots.length}{' '}
                        {daySlots.length === 1 ? 'Slot' : 'Slots'}
                      </span>
                      <div className="hidden sm:flex items-center justify-center gap-1">
                        {daySlots.slice(0, 3).map((s) => (
                          <span
                            key={s.id}
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              isSelectedDay ? 'bg-white' : 'bg-primary',
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span className="text-[9px] font-mono uppercase tracking-wider opacity-50 mt-auto">
                      —
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Legend & Filter Reset Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] font-mono text-secondary">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-accent border border-primary/40" />
              Open Office Hours
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
              Selected Date
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gold" />
              Requested by You
            </span>
          </div>

          {selectedDayNum !== 'ALL' && (
            <button
              type="button"
              onClick={() => setSelectedDayNum('ALL')}
              className="text-primary font-semibold hover:underline cursor-pointer"
            >
              Show All {filteredSlots.length} Open Slots →
            </button>
          )}
        </div>

        {/* Interactive Time Slots Drawer for Selected Date or All Dates */}
        <div className="pt-3 border-t border-border space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              <h3 className="font-display text-sm sm:text-base font-bold text-foreground">
                {selectedDayNum === 'ALL'
                  ? `All Upcoming Open Time Slots (${displayedSlots.length})`
                  : `Available Time Slots for Nov ${selectedDayNum}, 2026 (${displayedSlots.length})`}
              </h3>
            </div>
            <span className="text-[11px] font-mono text-secondary">
              Click any slot to pre-fill your session request
            </span>
          </div>

          <AnimatePresence mode="popLayout">
            {displayedSlots.length === 0 ? (
              <motion.div
                key="empty-day"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="rounded-xl border border-border bg-stone/40 p-5 text-center space-y-2"
              >
                <p className="text-sm font-semibold text-foreground">
                  No published slots on{' '}
                  {selectedDayNum === 'ALL'
                    ? 'this filter'
                    : `November ${selectedDayNum}`}
                </p>
                <p className="text-xs text-secondary max-w-md mx-auto">
                  Select a highlighted emerald date on the calendar above or view
                  all upcoming open time windows for {mentor.name}.
                </p>
                {selectedDayNum !== 'ALL' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDayNum('ALL')}
                  >
                    View All {filteredSlots.length} Open Slots
                  </Button>
                )}
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {displayedSlots.map((slot) => {
                  const isSelected = selectedSlotId === slot.id
                  const isAlreadyRequested = Array.from(
                    requestedSlotLabels,
                  ).some(
                    (lbl) =>
                      lbl.includes(slot.dayLabel) &&
                      lbl.includes(slot.timeLabel),
                  )

                  return (
                    <motion.div
                      key={slot.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      onClick={() => onSelectSlot?.(slot)}
                      role={onSelectSlot ? 'button' : undefined}
                      tabIndex={onSelectSlot ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (
                          onSelectSlot &&
                          (e.key === 'Enter' || e.key === ' ')
                        ) {
                          e.preventDefault()
                          onSelectSlot(slot)
                        }
                      }}
                      className={cn(
                        'group rounded-xl border p-4 transition-all flex flex-col justify-between gap-3',
                        onSelectSlot && 'cursor-pointer',
                        isSelected
                          ? 'bg-accent/90 border-primary ring-2 ring-primary/25 shadow-sm'
                          : 'bg-background hover:bg-stone/45 border-border hover:border-primary/45',
                      )}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono text-xs font-bold text-primary uppercase tracking-wider block">
                              {slot.dayLabel}, 2026
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span className="font-display text-base font-bold text-foreground">
                                {showPktTime
                                  ? slot.pktTimeLabel
                                  : `${slot.timeLabel} (${slot.timezone})`}
                              </span>
                              <span className="text-[11px] font-mono text-secondary">
                                · {slot.durationMinutes}m
                              </span>
                            </div>
                          </div>

                          {editable ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveSlot(slot.id)
                              }}
                              aria-label={`Delete slot ${slot.dayLabel}`}
                              className="p-1.5 rounded-lg text-secondary hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : isAlreadyRequested ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-gold/15 text-gold border border-gold/30">
                              Requested
                            </span>
                          ) : isSelected ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-primary text-primary-foreground">
                              <CheckCircle2 className="w-3 h-3" />
                              Selected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-accent text-primary border border-primary/20">
                              {slot.capacityLabel}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-secondary leading-relaxed">
                          {slot.topicHint}
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-border/60 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold text-foreground/85">
                          <span className="text-primary">
                            {getFormatIcon(slot.format)}
                          </span>
                          {slot.format}
                        </span>

                        {onSelectSlot && (
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 text-xs font-mono font-bold transition-colors',
                              isSelected
                                ? 'text-primary'
                                : 'text-secondary group-hover:text-primary',
                            )}
                          >
                            {isSelected ? 'Ready to Book' : 'Select Slot'}
                            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Optional Mentor Quick-Publish Bar when editable === true */}
        {editable && (
          <div className="pt-4 border-t border-border bg-stone/35 -mx-6 -mb-6 p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Quick Calendar Slot Publisher
              </span>
              <p className="text-xs text-secondary">
                Adding open window for{' '}
                <strong className="text-foreground">
                  Nov {typeof selectedDayNum === 'number' ? selectedDayNum : 18}
                  , 2026
                </strong>{' '}
                (click any date cell above to change target date).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={quickAddTime}
                onChange={(e) => setQuickAddTime(e.target.value)}
                placeholder="19:30 PKT"
                aria-label="Time window"
                className="h-9 w-28 rounded-lg border border-border bg-card px-2.5 text-xs font-mono text-foreground"
              />
              <select
                value={quickAddFormat}
                onChange={(e) =>
                  setQuickAddFormat(
                    e.target.value as MentorSessionSlot['format'],
                  )
                }
                aria-label="Session format"
                className="h-9 rounded-lg border border-border bg-card px-2.5 text-xs font-mono text-foreground"
              >
                <option value="Video Call">Video Call</option>
                <option value="In-Person Hub">In-Person Hub</option>
                <option value="Async Code/Doc Review">
                  Async Code/Doc Review
                </option>
              </select>
              <Button
                type="button"
                size="sm"
                onClick={handleAddSlotForDay}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add to Nov{' '}
                {typeof selectedDayNum === 'number' ? selectedDayNum : 18}
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
