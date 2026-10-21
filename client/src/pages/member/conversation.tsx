import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()

  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch messages from the API
    const mockMessages = [
      {
        id: '1',
        content: 'Hi! How are you doing?',
        senderName: 'Ahmed Hassan',
        timestamp: new Date(),
        isRead: false,
      },
      {
        id: '2',
        content: 'Thanks for the connection!',
        senderName: 'Usman Khan',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        isRead: true,
      },
    ]

    setMessages(mockMessages)
    setLoading(false)
  }, [conversationId])

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-6 w-6 mx-auto mb-3 animate-spin text-primary" />
          <p className="text-secondary">Loading messages...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 rounded-full">UA</Avatar>
            <span className="font-semibold text-foreground">Conversation</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <Button variant="ghost" size="sm" onClick={() => navigate('/messages')}>
              Back to Messages
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20"
              >
                <div className="w-10 h-10 rounded-full flex-shrink-0">
                  <Avatar>UA</Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{msg.senderName}</p>
                  <p className="text-sm text-secondary mt-0.5">{msg.content}</p>
                  <p className="text-xs text-secondary/80 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {!loading && messages.length === 0 && (
              <div className="min-h-[200px] flex flex-col items-center justify-center py-8 text-secondary">
                <svg
                  className="h-8 w-8 mb-3 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v6a2 2 0 002 2H9a2 2 0 002-2zM5 13l7 7-7 7"
                  />
                </svg>
                <p>No messages yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}