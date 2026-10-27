import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion'
import { Star, CheckCircle2, Sparkles } from 'lucide-react'
import { toast } from '@/lib/toast'
import { api, syncPlatformStateKey } from '@/services/api'

export type EventEngagementStatus = 'NONE' | 'INTERESTED' | 'ATTENDING'

const STORAGE_KEY = 'siba_event_rsvp_map_v1'
const SYNC_EVENT = 'siba-event-rsvp-sync'

const DEFAULT_RSVP_MAP: Record<string, EventEngagementStatus> = {
  '1': 'ATTENDING',
  '2': 'INTERESTED',
}

function readRsvpMap(): Record<string, EventEngagementStatus> {
  if (typeof window === 'undefined') return DEFAULT_RSVP_MAP
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_RSVP_MAP
    const parsed = JSON.parse(raw) as Record<string, EventEngagementStatus>
    return { ...DEFAULT_RSVP_MAP, ...parsed }
  } catch {
    return DEFAULT_RSVP_MAP
  }
}

export function useEventRsvpState() {
  const [rsvpMap, setRsvpMap] = useState<Record<string, EventEngagementStatus>>(
    () => readRsvpMap()
  )

  useEffect(() => {
    const handleSync = () => {
      setRsvpMap(readRsvpMap())
    }
    window.addEventListener(SYNC_EVENT, handleSync)
    window.addEventListener('siba-backend-hydrated', handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener(SYNC_EVENT, handleSync)
      window.removeEventListener('siba-backend-hydrated', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  const toggleEventStatus = useCallback(
    (
      eventId: string,
      targetStatus: Exclude<EventEngagementStatus, 'NONE'>,
      eventTitle?: string
    ) => {
      setRsvpMap((prev) => {
        const current = prev[eventId] || 'NONE'
        const nextStatus: EventEngagementStatus =
          current === targetStatus ? 'NONE' : targetStatus
        const updated = { ...prev, [eventId]: nextStatus }

        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
          window.dispatchEvent(new CustomEvent(SYNC_EVENT))
          syncPlatformStateKey('eventRsvps', updated)
          void api.post(`/events/${eventId}/rsvp`, {
            status: nextStatus,
            title: eventTitle,
          }).catch(() => {})
        } catch {
          // Ignore storage quota errors
        }

        if (eventTitle) {
          if (nextStatus === 'ATTENDING') {
            toast.success(`Seat reserved! You are marked as Attending for "${eventTitle}".`)
          } else if (nextStatus === 'INTERESTED') {
            toast(`Saved "${eventTitle}" to your Interested events list.`)
          } else {
            toast(`Removed RSVP status for "${eventTitle}".`)
          }
        }

        return updated
      })
    },
    []
  )

  const counts = {
    attending: Object.values(rsvpMap).filter((s) => s === 'ATTENDING').length,
    interested: Object.values(rsvpMap).filter((s) => s === 'INTERESTED').length,
  }

  return {
    rsvpMap,
    toggleEventStatus,
    counts,
  }
}

interface TiltEventCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  engagementStatus?: EventEngagementStatus
}

/**
 * Interactive Event Card wrapper with:
 * 1. Framer Motion `layout` animations when toggling 'Interested' or 'Attending' or reordering cards
 * 2. Subtle 3D perspective tilt effect (`rotateX`, `rotateY`, dynamic glare) on pointer hover
 */
export function TiltEventCard({
  children,
  className = '',
  onClick,
  engagementStatus = 'NONE',
}: TiltEventCardProps) {
  const cardRef = useRef<HTMLElement | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const [isHovered, setIsHovered] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { stiffness: 260, damping: 24, mass: 0.6 }
  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], prefersReducedMotion ? [0, 0] : [4.5, -4.5]),
    springConfig
  )
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], prefersReducedMotion ? [0, 0] : [-4.5, 4.5]),
    springConfig
  )

  const glareLeft = useTransform(mouseX, [-0.5, 0.5], ['15%', '85%'])
  const glareTop = useTransform(mouseY, [-0.5, 0.5], ['15%', '85%'])

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!cardRef.current || prefersReducedMotion) return
    const rect = cardRef.current.getBoundingClientRect()
    const xPct = (e.clientX - rect.left) / rect.width - 0.5
    const yPct = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(xPct)
    mouseY.set(yPct)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    mouseX.set(0)
    mouseY.set(0)
  }

  const activeBorderClass =
    engagementStatus === 'ATTENDING'
      ? 'border-primary/60 dark:border-[#2DD4BF]/55 ring-1 ring-primary/25 dark:ring-[#2DD4BF]/25'
      : engagementStatus === 'INTERESTED'
      ? 'border-gold/60 dark:border-[#F59E0B]/55 ring-1 ring-gold/20 dark:ring-[#F59E0B]/20'
      : 'border-border'

  return (
    <motion.article
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={prefersReducedMotion ? undefined : { y: -5 }}
      transition={{
        layout: { type: 'spring', stiffness: 320, damping: 28 },
        opacity: { duration: 0.22 },
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1050,
        transformStyle: 'preserve-3d',
      }}
      className={`relative group rounded-2xl border bg-card text-foreground overflow-hidden flex flex-col justify-between shadow-card transition-shadow hover:shadow-xl ${activeBorderClass} ${className}`}
    >
      {/* Subtle 3D Specular Sheen on Hover */}
      <motion.div
        aria-hidden="true"
        style={{
          left: glareLeft,
          top: glareTop,
          opacity: isHovered && !prefersReducedMotion ? 1 : 0,
        }}
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 z-10 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.12),transparent_70%)] blur-2xl transition-opacity duration-300"
      />
      {children}
    </motion.article>
  )
}

interface EventRsvpToggleBarProps {
  eventId: string
  eventTitle: string
  status: EventEngagementStatus
  onToggle: (
    eventId: string,
    target: Exclude<EventEngagementStatus, 'NONE'>,
    title?: string
  ) => void
  baseCount?: number
  compact?: boolean
}

/**
 * Interactive 'Interested' & 'Attending' toggle bar with Framer Motion layout transitions.
 */
export function EventRsvpToggleBar({
  eventId,
  eventTitle,
  status,
  onToggle,
  baseCount,
  compact = false,
}: EventRsvpToggleBarProps) {
  const isInterested = status === 'INTERESTED'
  const isAttending = status === 'ATTENDING'

  const effectiveCount =
    typeof baseCount === 'number'
      ? baseCount + (isAttending ? 1 : 0)
      : undefined

  return (
    <motion.div layout className="space-y-2.5">
      <motion.div
        layout
        className="flex flex-wrap items-center justify-between gap-2 pt-1"
      >
        <div
          role="group"
          aria-label={`RSVP status for ${eventTitle}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-stone border border-border/80"
        >
          {/* Interested Button */}
          <motion.button
            layout
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation()
              onToggle(eventId, 'INTERESTED', eventTitle)
            }}
            aria-pressed={isInterested}
            className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              isInterested
                ? 'text-amber-950 dark:text-amber-100'
                : 'text-secondary hover:text-foreground'
            }`}
          >
            {isInterested && (
              <motion.span
                layoutId={`rsvp-pill-${eventId}`}
                transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                className="absolute inset-0 rounded-lg bg-[#F59E0B]/25 dark:bg-[#F59E0B]/30 border border-[#F59E0B]/50 shadow-sm"
              />
            )}
            <Star
              className={`relative z-10 h-3.5 w-3.5 transition-transform ${
                isInterested
                  ? 'fill-[#F59E0B] text-[#F59E0B] scale-110'
                  : 'text-secondary'
              }`}
            />
            <span className="relative z-10">
              {isInterested ? 'Interested ★' : 'Interested'}
            </span>
          </motion.button>

          {/* Attending Button */}
          <motion.button
            layout
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation()
              onToggle(eventId, 'ATTENDING', eventTitle)
            }}
            aria-pressed={isAttending}
            className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              isAttending
                ? 'text-white'
                : 'text-secondary hover:text-foreground'
            }`}
          >
            {isAttending && (
              <motion.span
                layoutId={`rsvp-pill-${eventId}`}
                transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                className="absolute inset-0 rounded-lg bg-primary dark:bg-[#0D6E5B] border border-primary/40 shadow-sm"
              />
            )}
            <CheckCircle2
              className={`relative z-10 h-3.5 w-3.5 transition-transform ${
                isAttending ? 'text-white scale-110' : 'text-secondary'
              }`}
            />
            <span className="relative z-10">
              {isAttending ? 'Attending ✓' : 'Attending'}
            </span>
          </motion.button>
        </div>

        {typeof effectiveCount === 'number' && !compact && (
          <motion.span
            layout
            key={effectiveCount}
            initial={{ opacity: 0.6, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-mono tabular-nums text-secondary"
          >
            <strong className="text-foreground">{effectiveCount}</strong> going
          </motion.span>
        )}
      </motion.div>

      {/* Layout-Animated Confirmation Banner when Interested or Attending is active */}
      <AnimatePresence initial={false}>
        {status !== 'NONE' && (
          <motion.div
            key={status}
            layout
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="overflow-hidden"
          >
            <div
              className={`rounded-xl px-3 py-2 text-xs font-mono flex items-center justify-between gap-2 border ${
                isAttending
                  ? 'bg-primary/10 dark:bg-[#0D6E5B]/25 border-primary/30 dark:border-[#2DD4BF]/35 text-primary dark:text-[#2DD4BF]'
                  : 'bg-[#F59E0B]/10 dark:bg-[#F59E0B]/20 border-[#F59E0B]/35 text-amber-800 dark:text-[#F59E0B]'
              }`}
            >
              <span className="inline-flex items-center gap-1.5 font-semibold truncate">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                {isAttending
                  ? 'Confirmed Attending · Priority pass active'
                  : 'Saved to Interested · Calendar reminder set'}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggle(eventId, status, eventTitle)
                }}
                className="underline opacity-80 hover:opacity-100 shrink-0 text-[11px]"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
