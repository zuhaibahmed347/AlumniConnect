import { Button } from '@/components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUpRight,
  Bell,
  Calendar,
  Check,
  CheckCheck,
  Compass,
  PanelRightOpen,
  Sparkles,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

export type StudentNotificationCategory =
  | 'ALL'
  | 'CONNECTION'
  | 'EVENT'
  | 'MENTORSHIP'

export interface StudentNotificationItem {
  id: string
  category: Exclude<StudentNotificationCategory, 'ALL'>
  title: string
  detail: string
  actorName: string
  actorMeta: string
  time: string
  unread: boolean
  link: string
  actionLabel?: string
  /** Optional interactive connection request state */
  connectionStatus?: 'PENDING_INCOMING' | 'ACCEPTED' | 'DECLINED'
  /** Optional event reminder state */
  reminderAcknowledged?: boolean
}

export const INITIAL_STUDENT_NOTIFICATIONS: StudentNotificationItem[] = [
  {
    id: 'sn-1',
    category: 'MENTORSHIP',
    title: 'Mentorship Office Hours Confirmed',
    detail:
      'Sanaullah Memon reviewed your FinTech product teardown deck and confirmed your Saturday 4:00 PM PKT slot.',
    actorName: 'Sanaullah Memon',
    actorMeta: 'VP Product · Careem (BBA ’16)',
    time: '2 hours ago',
    unread: true,
    link: '/mentorship',
    actionLabel: 'View Session Brief',
  },
  {
    id: 'sn-2',
    category: 'CONNECTION',
    title: 'New Alumni Connection Request',
    detail:
      'Bilal Ahmed Mahar noticed your Distributed Systems capstone and invited you to connect for Cloud Engineering referrals.',
    actorName: 'Bilal Ahmed Mahar',
    actorMeta: 'Staff Cloud Architect · Systems Ltd (BSCS ’15)',
    time: '4 hours ago',
    unread: true,
    link: '/alumni/5',
    connectionStatus: 'PENDING_INCOMING',
  },
  {
    id: 'sn-3',
    category: 'EVENT',
    title: 'Event Reminder: Tech & FinTech Career Fair',
    detail:
      'Your registered seat for the Annual Sukkur IBA Tech & FinTech Career Fair (Main Auditorium) is confirmed for Nov 18 at 10:00 AM PKT.',
    actorName: 'Career Development Office',
    actorMeta: 'Sukkur IBA University · Main Auditorium',
    time: 'Today, 08:30 AM',
    unread: true,
    link: '/events/1',
    actionLabel: 'Event Pass',
    reminderAcknowledged: false,
  },
  {
    id: 'sn-4',
    category: 'CONNECTION',
    title: 'Alumni Connection Accepted',
    detail:
      'Dr. Sarah Khan accepted your connection invitation. Direct messaging and mentorship office hours are now unlocked.',
    actorName: 'Dr. Sarah Khan',
    actorMeta: 'VP Engineering · TechCorp (BSCS ’12)',
    time: 'Yesterday',
    unread: false,
    link: '/alumni/1',
    actionLabel: 'View Dossier',
    connectionStatus: 'ACCEPTED',
  },
  {
    id: 'sn-5',
    category: 'EVENT',
    title: 'Workshop Reminder: European AI Labs & DAAD',
    detail:
      'Dr. Aamir Soomro uploaded the pre-session reading packet for the Munich AI Research & DAAD Scholarship seminar.',
    actorName: 'Dr. Aamir Soomro',
    actorMeta: 'Principal ML Scientist · DeepScale Munich (BSCS ’14)',
    time: '2 days ago',
    unread: false,
    link: '/events/2',
    actionLabel: 'Workshop Details',
    reminderAcknowledged: true,
  },
  {
    id: 'sn-6',
    category: 'MENTORSHIP',
    title: 'Capstone Architecture Milestone Updated',
    detail:
      'Dr. Sarah Khan added 2 action items to your BSCS ’26 Cloud Capstone mentorship roadmap.',
    actorName: 'Dr. Sarah Khan',
    actorMeta: 'Mentor Track · Cloud & Distributed Systems',
    time: '3 days ago',
    unread: false,
    link: '/mentorship',
    actionLabel: 'Review Notes',
  },
]

const CATEGORY_TABS: {
  id: StudentNotificationCategory
  label: string
}[] = [
  { id: 'ALL', label: 'All' },
  { id: 'CONNECTION', label: 'Connections' },
  { id: 'EVENT', label: 'Events' },
  { id: 'MENTORSHIP', label: 'Mentorship' },
]

function getCategoryMeta(category: Exclude<StudentNotificationCategory, 'ALL'>) {
  switch (category) {
    case 'CONNECTION':
      return {
        label: 'Connection',
        icon: UserPlus,
        badgeClass: 'border-primary/30 bg-accent text-accent-foreground',
      }
    case 'EVENT':
      return {
        label: 'Event Reminder',
        icon: Calendar,
        badgeClass: 'border-gold/40 bg-stone text-gold',
      }
    case 'MENTORSHIP':
      return {
        label: 'Mentorship',
        icon: Compass,
        badgeClass: 'border-primary/30 bg-accent text-primary',
      }
  }
}

interface NotificationsProps {
  items: StudentNotificationItem[]
  isEmptyMode?: boolean
  onMarkAllRead: () => void
  onToggleRead: (id: string) => void
  onRespondConnection: (
    id: string,
    decision: 'ACCEPTED' | 'DECLINED',
  ) => void
  onAcknowledgeReminder: (id: string) => void
  onOpenSlideOver?: () => void
}

function NotificationCardList({
  items,
  onToggleRead,
  onRespondConnection,
  onAcknowledgeReminder,
}: Omit<NotificationsProps, 'isEmptyMode' | 'onMarkAllRead' | 'onOpenSlideOver'>) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-background p-6 text-center space-y-2">
        <Sparkles className="h-6 w-6 text-primary mx-auto" />
        <p className="text-sm font-semibold text-foreground">
          No notifications in this category
        </p>
        <p className="text-xs text-secondary max-w-xs mx-auto">
          Connection requests, event reminders, and mentor updates will appear here as you engage across the platform.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((notif) => {
        const meta = getCategoryMeta(notif.category)
        const CategoryIcon = meta.icon

        return (
          <article
            key={notif.id}
            className={`rounded-xl border p-4 transition-all space-y-2.5 ${
              notif.unread
                ? 'border-primary/40 bg-accent/35 shadow-xs'
                : 'border-border bg-background hover:border-primary/40'
            }`}
          >
            {/* Header Row: Category Pill + Timestamp + Unread Dot */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${meta.badgeClass}`}
                >
                  <CategoryIcon className="h-3 w-3" />
                  {meta.label}
                </span>
                {notif.unread && (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    NEW
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-secondary tabular-nums">
                  {notif.time}
                </span>
                <button
                  type="button"
                  onClick={() => onToggleRead(notif.id)}
                  title={notif.unread ? 'Mark as read' : 'Mark as unread'}
                  className="text-[11px] font-mono text-secondary hover:text-primary transition-colors cursor-pointer"
                >
                  {notif.unread ? 'Read' : 'Unread'}
                </button>
              </div>
            </div>

            {/* Title & Actor Meta */}
            <div className="space-y-1">
              <Link
                to={notif.link}
                className="font-display text-sm sm:text-base font-bold text-foreground hover:text-primary transition-colors block leading-snug"
              >
                {notif.title}
              </Link>
              <p className="text-[11px] font-mono text-secondary">
                {notif.actorName} · {notif.actorMeta}
              </p>
              <p className="text-xs text-secondary leading-relaxed pt-0.5">
                {notif.detail}
              </p>
            </div>

            {/* Interactive Footer Actions per Category */}
            <div className="pt-2 border-t border-border/80 flex flex-wrap items-center justify-between gap-2">
              {notif.category === 'CONNECTION' &&
              notif.connectionStatus === 'PENDING_INCOMING' ? (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => onRespondConnection(notif.id, 'ACCEPTED')}
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Accept Request
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRespondConnection(notif.id, 'DECLINED')}
                  >
                    Decline
                  </Button>
                </div>
              ) : notif.category === 'CONNECTION' &&
                notif.connectionStatus === 'ACCEPTED' ? (
                <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-primary">
                  <UserCheck className="h-3.5 w-3.5" />
                  Connected in Network
                </span>
              ) : notif.category === 'CONNECTION' &&
                notif.connectionStatus === 'DECLINED' ? (
                <span className="inline-flex items-center gap-1 text-xs font-mono text-secondary">
                  Invitation Declined
                </span>
              ) : notif.category === 'EVENT' ? (
                <button
                  type="button"
                  onClick={() => onAcknowledgeReminder(notif.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    notif.reminderAcknowledged
                      ? 'border-border bg-card text-secondary'
                      : 'border-primary/30 bg-card text-primary hover:border-primary'
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  {notif.reminderAcknowledged
                    ? 'Reminder Saved'
                    : 'Confirm Reminder'}
                </button>
              ) : (
                <span className="text-[11px] font-mono text-secondary">
                  Synced with Mentorship Ledger
                </span>
              )}

              <Link
                to={notif.link}
                className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-primary hover:underline ml-auto"
              >
                {notif.actionLabel ?? 'Open'}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </article>
        )
      })}
    </div>
  )
}

/**
 * Embedded Student Notifications List View for the Student Dashboard
 * with category filtering and trigger to open the Slide-Over Panel.
 */
export function Notifications({
  items,
  isEmptyMode = false,
  onMarkAllRead,
  onToggleRead,
  onRespondConnection,
  onAcknowledgeReminder,
  onOpenSlideOver,
}: NotificationsProps) {
  const [activeCategory, setActiveCategory] =
    useState<StudentNotificationCategory>('ALL')

  const visibleItems = useMemo(() => {
    if (isEmptyMode) return []
    if (activeCategory === 'ALL') return items
    return items.filter((item) => item.category === activeCategory)
  }, [items, isEmptyMode, activeCategory])

  const unreadCount = useMemo(
    () => (isEmptyMode ? 0 : items.filter((i) => i.unread).length),
    [items, isEmptyMode],
  )

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-mono uppercase tracking-wider font-semibold text-primary">
              Activity & Alerts
            </p>
            {unreadCount > 0 && (
              <span className="rounded-md bg-primary px-2 py-0.5 font-mono text-[10px] font-bold text-primary-foreground tabular-nums">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <h2 className="font-display text-xl font-bold text-foreground mt-0.5">
            Notifications
          </h2>
          <p className="text-xs text-secondary">
            Connection requests, campus event reminders & mentorship updates
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenSlideOver && (
            <button
              type="button"
              onClick={onOpenSlideOver}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-mono font-semibold text-foreground hover:border-primary transition-colors cursor-pointer"
              title="Open Notifications Slide-Over Panel"
            >
              <PanelRightOpen className="h-3.5 w-3.5 text-primary" />
              Slide-Over
            </button>
          )}
          <button
            type="button"
            onClick={onMarkAllRead}
            className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-primary hover:underline cursor-pointer"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        {CATEGORY_TABS.map((tab) => {
          const isActive = activeCategory === tab.id
          const count = isEmptyMode
            ? 0
            : tab.id === 'ALL'
              ? items.length
              : items.filter((i) => i.category === tab.id).length
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`rounded-lg border px-2.5 py-1 text-xs font-mono font-semibold transition-colors cursor-pointer ${
                isActive
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-secondary hover:text-foreground'
              }`}
            >
              {tab.label} ({count})
            </button>
          )
        })}
      </div>

      {/* List View */}
      <NotificationCardList
        items={visibleItems.slice(0, 4)}
        onToggleRead={onToggleRead}
        onRespondConnection={onRespondConnection}
        onAcknowledgeReminder={onAcknowledgeReminder}
      />

      {visibleItems.length > 4 && onOpenSlideOver && (
        <div className="pt-2 border-t border-border flex items-center justify-between text-xs font-mono">
          <span className="text-secondary">
            Showing 4 of {visibleItems.length} notifications
          </span>
          <button
            type="button"
            onClick={onOpenSlideOver}
            className="font-semibold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            View All in Slide-Over Panel
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Slide-Over Drawer Panel for Student Notifications
 */
export function NotificationsSlideOver({
  open,
  onClose,
  items,
  isEmptyMode = false,
  onMarkAllRead,
  onToggleRead,
  onRespondConnection,
  onAcknowledgeReminder,
}: NotificationsProps & {
  open: boolean
  onClose: () => void
}) {
  const [activeCategory, setActiveCategory] =
    useState<StudentNotificationCategory>('ALL')

  const visibleItems = useMemo(() => {
    if (isEmptyMode) return []
    if (activeCategory === 'ALL') return items
    return items.filter((item) => item.category === activeCategory)
  }, [items, isEmptyMode, activeCategory])

  const unreadCount = useMemo(
    () => (isEmptyMode ? 0 : items.filter((i) => i.unread).length),
    [items, isEmptyMode],
  )

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-modal flex justify-end bg-obsidian/65 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="student-notifications-slideover-title"
        >
          {/* Clickable backdrop area */}
          <div
            className="flex-1"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="w-full max-w-md h-full bg-card border-l border-border shadow-card-hover flex flex-col justify-between overflow-hidden"
          >
            {/* Slide-Over Header */}
            <div className="p-6 border-b border-border space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    <span className="text-xs font-mono uppercase tracking-wider font-bold text-primary">
                      Student Notification Center
                    </span>
                    {unreadCount > 0 && (
                      <span className="rounded-md bg-primary px-2 py-0.5 font-mono text-[10px] font-bold text-primary-foreground tabular-nums">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  <h2
                    id="student-notifications-slideover-title"
                    className="font-display text-xl font-bold text-foreground mt-1"
                  >
                    Recent Activity & Reminders
                  </h2>
                  <p className="text-xs text-secondary mt-0.5">
                    Manage incoming alumni connection requests, event reminders, and mentor updates.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close notifications panel"
                  className="rounded-lg border border-border p-1.5 text-secondary hover:text-foreground cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Filter Tabs + Mark All Read */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {CATEGORY_TABS.map((tab) => {
                    const isActive = activeCategory === tab.id
                    const count = isEmptyMode
                      ? 0
                      : tab.id === 'ALL'
                        ? items.length
                        : items.filter((i) => i.category === tab.id).length
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveCategory(tab.id)}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-mono font-semibold transition-colors cursor-pointer ${
                          isActive
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background text-secondary hover:text-foreground'
                        }`}
                      >
                        {tab.label} ({count})
                      </button>
                    )
                  })}
                </div>

                <button
                  type="button"
                  onClick={onMarkAllRead}
                  className="text-xs font-mono font-semibold text-primary hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              </div>
            </div>

            {/* Scrollable Notifications Feed */}
            <div className="flex-1 overflow-y-auto p-6">
              <NotificationCardList
                items={visibleItems}
                onToggleRead={onToggleRead}
                onRespondConnection={onRespondConnection}
                onAcknowledgeReminder={onAcknowledgeReminder}
              />
            </div>

            {/* Slide-Over Footer */}
            <div className="p-4 border-t border-border bg-background flex items-center justify-between text-xs font-mono">
              <Link
                to="/notifications"
                onClick={onClose}
                className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                Open Full Notifications Page
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <Button size="sm" variant="outline" onClick={onClose}>
                Close Panel
              </Button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
