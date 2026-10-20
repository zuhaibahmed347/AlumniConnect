import { CheckCircle, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'

export function NotificationsPage() {

  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [markAllLoading, setMarkAllLoading] = useState(false)

  useEffect(() => {
    // In a real app, this would fetch notifications from the API
    const mockNotifications = [
      {
        id: '1',
        type: 'NEW_MESSAGE',
        title: 'New Message',
        message: 'Ahmed Hassan: Hey! How are you?',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      },
      {
        id: '2',
        type: 'EVENT_REGISTRATION',
        title: 'Event Registration',
        message: 'You are registered for the Alumni Reunion',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      },
      {
        id: '3',
        type: 'MENTORSHIP_REQUEST',
        title: 'Mentorship Request',
        message: 'New mentorship request received',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      },
      {
        id: '4',
        type: 'JOB_APPLICATION',
        title: 'Job Application',
        message: 'New job posting matches your skills',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
      },
    ]

    setNotifications(mockNotifications)
    setLoading(false)
  }, [])

  const [unreadCount, setUnreadCount] = useState(
    notifications.filter((n) => !n.isRead).length
  )

  const markAsRead = async (id: string) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, isRead: true, readAt: new Date() } : n
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = async () => {
    setMarkAllLoading(true)
    setNotifications(
      notifications.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
    )
    setUnreadCount(0)
    setMarkAllLoading(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="min-h-[200px] flex flex-col items-center justify-center py-8">
          <Loader2 className="h-6 w-6 mx-auto mb-3" />
          <p>Loading notifications...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Notifications</h1>
          <span className="text-sm text-secondary">
            {unreadCount} {unreadCount === 1 ? 'unread' : 'unread'}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Filter Tabs */}
        <section className="mb-6">
          <div className="flex border-b border-border/50">
            <button
              className="px-4 py-2 text-sm font-medium text-secondary hover:text-primary transition-colors border-b-2 border-primary"
            >
              All
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-secondary hover:text-primary transition-colors border-b-2 border-transparent"
            >
              Unread
            </button>
          </div>
        </section>

        {/* Notifications List */}
        <section className="space-y-3 max-h-96 overflow-y-auto">
          {loading && (
            <div className="min-h-[200px] flex flex-col items-center justify-center py-8 text-secondary">
              <Loader2 className="h-6 w-6 mx-auto mb-3" />
              <p>Loading notifications...</p>
            </div>
          )}

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
              className={`flex items-start gap-3 py-3 rounded-lg ${
                notification.isRead ? 'bg-primary/5' : 'bg-primary/10'
              } hover:${
                notification.isRead
                  ? 'bg-primary/10'
                  : 'bg-primary/20'
              } transition-colors cursor-pointer`}
              onClick={() => {
                // In real app, navigate to related resource
                window.alert(`Navigate to: ${notification.title}`)
              }}
            >
              <div className="w-2 h-2 rounded-full ${
                notification.isRead ? 'bg-secondary' : 'bg-primary'
              } flex-shrink-0 mt-1.5" />

              <div className="flex-1 min-w-0">
                <p className={`font-medium ${
                  notification.isRead ? 'text-primary' : 'font-semibold text-primary'
                }`}>
                  {notification.title}
                </p>
                <p className="text-xs text-secondary/80 mt-0.5">
                  {notification.message}
                </p>
              </div>

              {!notification.isRead && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              )}

              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-primary/30 hover:text-primary p-1 rounded"
                aria-label="Mark as read"
                onClick={(e) => {
                  e.stopPropagation()
                  markAsRead(notification.id)
                }}
              >
                <CheckCircle className="h-3 w-3" />
              </button>
            </div>
          ))}
        </section>

        {/* Action Buttons */}
        <section className="mt-6 flex gap-2">
          <button
            className="flex-1 py-2 rounded text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
            onClick={markAllAsRead}
            disabled={markAllLoading}
          >
            {markAllLoading ? 'Marking all as read...' : 'Mark All as Read'}
          </button>
          <a
            href="/settings#notifications"
            className="flex-1 py-2 rounded text-sm font-medium text-secondary hover:text-primary transition-colors underline"
          >
            Notification Preferences
          </a>
        </section>
      </div>
    </main>
  )
}