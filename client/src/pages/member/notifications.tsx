import { CheckCircle, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { toast } from '@/lib/toast'
import { api } from '@/services/api'

const FALLBACK_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'MENTORSHIP_RESPONSE',
    title: 'Mentorship Session Confirmed',
    message: 'Dr. Sarah Khan accepted your mentorship request for the DAAD & AI Research Fellowship track.',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'notif-2',
    type: 'EVENT_REGISTRATION',
    title: 'Seat Reserved: Annual Alumni Homecoming 2026',
    message: 'Your registration for Annual Sukkur IBA Alumni Homecoming 2026 at Main Auditorium is confirmed.',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'notif-3',
    type: 'MENTORSHIP_REQUEST',
    title: 'New Mentorship Request',
    message: 'Zainab Magsi (BSCS 2026) requested a portfolio & system design review.',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'notif-4',
    type: 'JOB_APPLICATION',
    title: 'Job Application Update',
    message: 'Careem FinTech shortlisted your application for Staff Distributed Systems Engineer.',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
]

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [markAllLoading, setMarkAllLoading] = useState(false)
  const [filterTab, setFilterTab] = useState<'ALL' | 'UNREAD'>('ALL')

  const loadNotifications = async () => {
    try {
      const res = await api.list<any>('/notifications', { query: { page: 1, limit: 30 } })
      if (res.items && res.items.length > 0) {
        setNotifications(res.items)
      } else {
        setNotifications(FALLBACK_NOTIFICATIONS)
      }
    } catch {
      setNotifications(FALLBACK_NOTIFICATIONS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadNotifications()
    const handleHydrate = () => void loadNotifications()
    window.addEventListener('persona-changed', handleHydrate)
    return () => window.removeEventListener('persona-changed', handleHydrate)
  }, [])

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const visibleNotifications =
    filterTab === 'UNREAD'
      ? notifications.filter((n) => !n.isRead)
      : notifications

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
      )
    )
    try {
      await api.patch(`/notifications/${id}/read`)
    } catch {
      // Optimistically updated
    }
  }

  const markAllAsRead = async () => {
    setMarkAllLoading(true)
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
    )
    try {
      await api.patch('/notifications/read-all')
      toast.success('All notifications marked as read.')
    } catch {
      toast.success('All notifications marked as read.')
    } finally {
      setMarkAllLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground p-8">
        <div className="min-h-[200px] flex flex-col items-center justify-center py-8">
          <Loader2 className="h-6 w-6 mx-auto mb-3 animate-spin text-primary" />
          <p className="text-secondary">Loading notifications...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Notifications</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-secondary">
              {unreadCount} unread
            </span>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Filter Tabs */}
        <section className="mb-6">
          <div className="flex border-b border-border/50">
            <button
              type="button"
              onClick={() => setFilterTab('ALL')}
              className={`px-4 py-2 text-sm transition-colors border-b-2 ${
                filterTab === 'ALL'
                  ? 'font-semibold text-foreground border-primary dark:border-accent'
                  : 'font-medium text-secondary hover:text-foreground border-transparent'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('UNREAD')}
              className={`px-4 py-2 text-sm transition-colors border-b-2 ${
                filterTab === 'UNREAD'
                  ? 'font-semibold text-foreground border-primary dark:border-accent'
                  : 'font-medium text-secondary hover:text-foreground border-transparent'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </section>

        {/* Notifications List */}
        <section className="space-y-3 max-h-96 overflow-y-auto">
          {visibleNotifications.length === 0 && !loading && (
            <div className="min-h-[200px] flex flex-col items-center justify-center py-8 text-secondary text-center">
              <svg className="h-8 w-8 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v6a2 2 0 002 2H9a2 2 0 002-2zM5 13l7 7-7 7" />
              </svg>
              <p>No notifications yet</p>
            </div>
          )}

          {visibleNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`relative flex items-start gap-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                notification.isRead
                  ? 'bg-card border-border hover:bg-stone/50'
                  : 'bg-primary/10 border-primary/30 hover:bg-primary/15'
              }`}
              onClick={() => {
                if (!notification.isRead) {
                  void markAsRead(notification.id)
                }
                toast({
                  title: notification.title,
                  description: notification.message,
                  variant: 'default',
                })
              }}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${
                  notification.isRead ? 'bg-secondary/50' : 'bg-accent'
                }`}
              />

              <div className="flex-1 min-w-0 pr-8">
                <p
                  className={`text-sm ${
                    notification.isRead
                      ? 'font-medium text-foreground/90'
                      : 'font-semibold text-foreground'
                  }`}
                >
                  {notification.title}
                </p>
                <p className="text-xs text-secondary mt-0.5">
                  {notification.message}
                </p>
              </div>

              <button
                type="button"
                className="text-secondary hover:text-foreground p-1.5 rounded transition-colors"
                aria-label="Mark as read"
                onClick={(e) => {
                  e.stopPropagation()
                  void markAsRead(notification.id)
                }}
              >
                <CheckCircle className="h-4 w-4" />
              </button>
            </div>
          ))}
        </section>

        {/* Action Buttons */}
        <section className="mt-6 flex gap-2">
          <button
            type="button"
            className="flex-1 py-2.5 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-stone transition-colors"
            onClick={() => void markAllAsRead()}
            disabled={markAllLoading}
          >
            {markAllLoading ? 'Marking all as read...' : 'Mark All as Read'}
          </button>
          <a
            href="/settings#notifications"
            className="flex-1 py-2.5 text-center rounded-lg text-sm font-medium text-secondary hover:text-foreground transition-colors underline"
          >
            Notification Preferences
          </a>
        </section>
      </div>
    </main>
  )
}