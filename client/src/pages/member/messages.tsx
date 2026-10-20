import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2, UserPlus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '@/components/ui/avatar'

export function MessagesPage() {
  const navigate = useNavigate()

  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    // In a real app, this would fetch conversations from the API
    const mockConversations = [
      {
        id: '1',
        type: 'DIRECT',
        participantIds: ['1', '2'],
        lastMessage: {
          senderName: 'Ahmed Hassan',
          content: 'Hi! How are you doing?',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          isRead: false,
        },
        participants: [
          { userId: '1', name: 'Current User', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', isAdmin: true },
          { userId: '2', name: 'Ahmed Hassan', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop', isAdmin: false },
        ],
      },
      {
        id: '2',
        type: 'DIRECT',
        participantIds: ['1', '3'],
        lastMessage: {
          senderName: 'Usman Khan',
          content: 'Thanks for the connection!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          isRead: true,
        },
        participants: [
          { userId: '1', name: 'Current User', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', isAdmin: true },
          { userId: '3', name: 'Usman Khan', avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop', isAdmin: false },
        ],
      },
      {
        id: '3',
        type: 'DIRECT',
        participantIds: ['1', '4'],
        lastMessage: {
          senderName: 'Fatima Shah',
          content: 'See you at the reunion!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
          isRead: false,
        },
        participants: [
          { userId: '1', name: 'Current User', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', isAdmin: true },
          { userId: '4', name: 'Fatima Shah', avatar: 'https://images.unsplash.com/photo-1494790108377-d9c69b4316e4?w=100&h=100&fit=crop', isAdmin: false },
        ],
      },
    ]

    setConversations(mockConversations)
    setLoading(false)
  }, [])

  const onSearchChange = (value: string) => {
    setSearch(value)
  }

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

  const unreadCount = conversations
    .filter((c) => c.lastMessage?.isRead === false)
    .length

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">Messages</h1>
            <Search className="h-5 w-5 text-secondary" />
          </div>
          <Button variant="ghost" size="sm">
            <UserPlus className="h-4 w-4 mr-2" /> New Message
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Search and Actions */}
        <section className="mb-6 bg-white rounded-lg p-4">
          <form
            className="grid grid-cols-1 sm:grid-cols-5 gap-3"
            onSubmit={(e) => e.preventDefault()}
          >
            <div>
              <Input
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="rounded border border-border px-3 py-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">Mark All Read</Button>
              <span className="text-secondary/80">
                {unreadCount} unread
              </span>
            </div>
          </form>
        </section>

        {/* Conversations List */}
        <section className="bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="overflow-x-auto">
              <div className="space-y-2">
                {loading && (
                  <div className="min-h-[200px] flex flex-col items-center justify-center py-8 text-secondary">
                    <Loader2 className="h-6 w-6 mx-auto mb-3" />
                    <p>Loading conversations...</p>
                  </div>
                )}

                {!loading && conversations.length === 0 && (
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
                    <p>No conversations found</p>
                  </div>
                )}

                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="group rounded-lg border bg-card p-4 hover:bg-card/80 transition-colors cursor-pointer"
                    onClick={() => navigate(`/messages/${conv.id}`)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Participant Avatar */}
                      <div className="w-10 h-10 rounded-md flex-shrink-0">
                        <Avatar
                          className="h-6 w-6"
                          >{conv.participants?.find((p: any) => p.userId !== '1')?.name?.substring(0, 2) || 'UA'}</Avatar>
                      </div>

                      {/* Conversation Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {conv.participants?.find((p: any) => p.userId !== '1')?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-secondary/70 truncate">
                          {conv.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>

                      {/* Last Message & Timestamp */}
                      <div className="flex items-center gap-3 text-xs text-secondary/70">
                        <span>
                          {conv.lastMessage?.timestamp
                            ? new Date(conv.lastMessage.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Just now'}
                        </span>
                        {conv.lastMessage?.isRead === false && (
                          <span className="bg-primary/20 text-primary/80 rounded-full px-2 py-0.5">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Empty state when no conversations */}
                {conversations.length === 0 && !loading && (
                  <div className="min-h-[200px] flex flex-col items-center justify-center py-8 text-secondary">
                    <Search className="h-8 w-8 mb-3 opacity-50" />
                    <p>Start a new conversation by clicking "New Message" above</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}