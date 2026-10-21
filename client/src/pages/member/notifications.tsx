import { CheckCircle, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { toast } from '@/lib/toast'

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [markAllLoading, setMarkAllLoading] = useState(false)

  useEffect(() => {
    const mockNotifications = [
      {
        id: '1',
        type: 'NEW_MESSAGE',
        title: 'New Message',
        message: 'Ahmed Hassan: Hey! How are you?',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 5),
      },
      {
        id: '2',
        type: 'EVENT_REGISTRATION',
        title: 'Event Registration',
        message: 'You are registered for the Alumni Reunion',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
      {
        id: '3',
        type: 'MENTORSHIP_REQUEST',
        title: 'Mentorship Request',
        message: 'New mentorship request received',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
      },
      {
        id: '4',
        type: 'JOB_APPLICATION',
        title: 'Job Application',
        message: 'New job posting matches your skills',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
      },
    ]

    setNotifications(mockNotifications)
    setLoading(false)
  }, [])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAsRead = async (id: string) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, isRead: true, readAt: new Date() } : n
      )
    )
  }

  const markAllAsRead = async () => {
    setMarkAllLoading(true)
    setNotifications(
      notifications.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
    )
    setMarkAllLoading(false)
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
              className="px-4 py-2 text-sm font-semibold text-foreground border-b-2 border-primary dark:border-accent"
            >
              All
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-secondary hover:text-foreground transition-colors border-b-2 border-transparent"
            >
              Unread
            </button>
          </div>
        </section>

        {/* Notifications List */}
        <section className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.length === 0 && !loading && (
            <div className="min-h-[200px] flex flex-col items-center justify-center py-8 text-secondary text-center">
              <svg className="h-8 w-8 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v6a2 2 0 002 2H9a2 2 0 002-2zM5 13l7 7-7 7" />
              </svg>
              <p>No notifications yet</p>
            </div>
          )}

          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`relative flex items-start gap-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                notification.isRead
                  ? 'bg-card border-border hover:bg-stone/50'
                  : 'bg-primary/10 border-primary/30 hover:bg-primary/15'
              }`}
              onClick={() => {
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
                className="text-secondary hover:text-foreground p-1.5 rounded transition-colors"
                aria-label="Mark as read"
                onClick={(e) => {
                  e.stopPropagation()
                  markAsRead(notification.id)
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
            className="flex-1 py-2.5 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-stone transition-colors"
            onClick={markAllAsRead}
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