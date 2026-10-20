import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

export function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>()

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
      <main className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-6 w-6 mx-auto mb-3" />
          <p>Loading messages...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar
              className="h-10 w-10 rounded-full"
              >UA</Avatar>
            <span>Conversation</span>
          </div>
          <Button variant="ghost" size="sm">
            Back to Messages
          </Button>
        </div>
      </header>

      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg p-6">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border-primary/20"
                >
                  <div className="w-10 h-10 rounded-full flex-shrink-0">
                    <Avatar>UA</Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{msg.senderName}</p>
                    <p className="text-sm text-secondary/70">{msg.content}</p>
                    <p className="text-xs text-secondary/60">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="min-h-[200px] flex flex-col items-center justify-center py-8 text-secondary">
                  <Loader2 className="h-6 w-6 mx-auto mb-3" />
                  <p>Loading messages...</p>
                </div>
              )}

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
    </main>
  )
}