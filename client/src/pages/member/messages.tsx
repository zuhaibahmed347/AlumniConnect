import { RoleShell } from '@/components/layout/role-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getActivePersona } from '@/lib/role-context'
import { toast } from '@/lib/toast'
import {
  AlertCircle,
  CheckCircle2,
  Lock,
  MessageSquare,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

interface ChatMessageItem {
  id: string
  sender: 'THEM' | 'ME'
  senderName: string
  content: string
  timestamp: string
  status: 'SENT' | 'DELIVERED' | 'FAILED'
}

interface ThreadRecord {
  id: string
  alumniId: string
  participantName: string
  participantRole: string
  participantChapter: string
  avatar: string
  unreadCount: number
  connectionState: 'CONNECTED' | 'MENTORSHIP_PAIR' | 'CONNECTIONS_ONLY_LOCKED'
  lastPreview: string
  lastTimestamp: string
  messages: ChatMessageItem[]
}

const INITIAL_THREADS: ThreadRecord[] = [
  {
    id: '1',
    alumniId: '1',
    participantName: 'Ahmed Hassan',
    participantRole: 'Senior Software Engineer · TechCorp (BSCS ’20)',
    participantChapter: 'Karachi Chapter',
    avatar: '/images/avatars/hassan.jpg',
    unreadCount: 1,
    connectionState: 'CONNECTED',
    lastPreview:
      'Happy to review your distributed systems capstone RFC before Thursday’s mock interview!',
    lastTimestamp: '10:42 AM',
    messages: [
      {
        id: 'm-1',
        sender: 'ME',
        senderName: 'You',
        content:
          'Salam Ahmed! Thank you for accepting my connection request. I am preparing for the TechCorp Graduate Software Engineer loop.',
        timestamp: 'Yesterday · 6:15 PM',
        status: 'DELIVERED',
      },
      {
        id: 'm-2',
        sender: 'THEM',
        senderName: 'Ahmed Hassan',
        content:
          'Walaikum Assalam! Glad to connect. Happy to review your distributed systems capstone RFC before Thursday’s mock interview!',
        timestamp: '10:42 AM',
        status: 'DELIVERED',
      },
    ],
  },
  {
    id: '2',
    alumniId: '2',
    participantName: 'Sanaullah Memon',
    participantRole: 'VP of Payment Rail Product · Careem FinTech (BBA ’16)',
    participantChapter: 'Dubai & GCC Chapter',
    avatar: '/images/avatars/sana.jpg',
    unreadCount: 0,
    connectionState: 'MENTORSHIP_PAIR',
    lastPreview:
      'Your Menapay Ventures fellowship teardown deck looks strong. Let’s refine the unit economics slide.',
    lastTimestamp: 'Yesterday',
    messages: [
      {
        id: 'm-201',
        sender: 'THEM',
        senderName: 'Sanaullah Memon',
        content:
          'Your Menapay Ventures fellowship teardown deck looks strong. Let’s refine the unit economics slide during our Wednesday Office Hours.',
        timestamp: 'Yesterday · 4:20 PM',
        status: 'DELIVERED',
      },
    ],
  },
  {
    id: '3',
    alumniId: '4',
    participantName: 'Kamran Mahar',
    participantRole: 'Managing Director, Cloud Security · SovereignCloud (BSCS ’11)',
    participantChapter: 'Riyadh & GCC Chapter',
    avatar: '/images/avatars/kamran.jpg',
    unreadCount: 0,
    connectionState: 'CONNECTIONS_ONLY_LOCKED',
    lastPreview:
      'Direct messaging requires an accepted connection or active mentorship pairing.',
    lastTimestamp: 'Oct 18',
    messages: [],
  },
]

export function MessagesPage() {
  const [threads, setThreads] = useState<ThreadRecord[]>(INITIAL_THREADS)
  const [selectedThreadId, setSelectedThreadId] = useState<string>('1')
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState('')
  const [simulateSendFailure, setSimulateSendFailure] = useState(false)

  const filteredThreads = useMemo(() => {
    if (!search.trim()) return threads
    const q = search.toLowerCase()
    return threads.filter(
      (t) =>
        t.participantName.toLowerCase().includes(q) ||
        t.participantRole.toLowerCase().includes(q) ||
        t.lastPreview.toLowerCase().includes(q),
    )
  }, [threads, search])

  const activeThread = useMemo(
    () =>
      threads.find((t) => t.id === selectedThreadId) ??
      filteredThreads[0] ??
      threads[0],
    [threads, selectedThreadId, filteredThreads],
  )

  const handleSelectThread = (id: string) => {
    setSelectedThreadId(id)
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, unreadCount: 0 } : t)),
    )
  }

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed || !activeThread) return

    if (activeThread.connectionState === 'CONNECTIONS_ONLY_LOCKED') {
      toast.error(
        'Cannot send message: This alumnus only accepts messages from confirmed connections.',
      )
      return
    }

    const newMsg: ChatMessageItem = {
      id: `msg-${Date.now()}`,
      sender: 'ME',
      senderName: 'You',
      content: trimmed,
      timestamp: 'Just now',
      status: simulateSendFailure ? 'FAILED' : 'DELIVERED',
    }

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThread.id
          ? {
              ...t,
              lastPreview: trimmed,
              lastTimestamp: 'Just now',
              messages: [...t.messages, newMsg],
            }
          : t,
      ),
    )
    setDraft('')

    if (simulateSendFailure) {
      toast.error(
        'Message failed to send due to simulated network interruption. Use Retry on the message bubble.',
      )
    } else {
      toast.success('Message delivered.')
    }
  }

  const handleRetryFailedMessage = (threadId: string, msgId: string) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              messages: t.messages.map((m) =>
                m.id === msgId
                  ? { ...m, status: 'DELIVERED', timestamp: 'Retried · Just now' }
                  : m,
              ),
            }
          : t,
      ),
    )
    toast.success('Message resent and delivered.')
  }

  const handleUnlockConnection = (threadId: string) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              connectionState: 'CONNECTED',
              lastPreview: 'Connection confirmed — direct messaging enabled.',
            }
          : t,
      ),
    )
    toast.success('Connection confirmed. Direct messaging is now unlocked.')
  }

  return (
    <RoleShell
      role={getActivePersona()}
      title="Direct Messages & Mentorship Threads"
      subtitle="Verified Student, Alumni & Mentor Communications"
      badge={`${threads.reduce((acc, t) => acc + t.unreadCount, 0)} Unread`}
      headerActions={
        <button
          type="button"
          onClick={() => setSimulateSendFailure((prev) => !prev)}
          className={`rounded-lg border px-2.5 py-1.5 text-xs font-mono font-semibold transition-colors cursor-pointer ${
            simulateSendFailure
              ? 'border-destructive bg-destructive/15 text-destructive'
              : 'border-border bg-card text-foreground hover:border-primary/50'
          }`}
          title="Toggle simulated failed-send state to test retry workflow"
        >
          {simulateSendFailure
            ? 'Simulating Send Error: ON'
            : 'Test Failed-Send & Retry'}
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 4 Cols: Conversation List */}
        <section className="lg:col-span-4 rounded-2xl border border-border bg-card p-4 shadow-card space-y-4">
          <div className="relative">
            <Search className="h-4 w-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="pl-10"
            />
          </div>

          {filteredThreads.length === 0 ? (
            <div className="rounded-xl border border-border bg-background p-6 text-center space-y-2">
              <MessageSquare className="h-6 w-6 text-secondary mx-auto" />
              <p className="text-sm font-semibold text-foreground">
                No conversations match &ldquo;{search}&rdquo;
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredThreads.map((thread) => {
                const isSelected = activeThread?.id === thread.id
                return (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => handleSelectThread(thread.id)}
                    className={`w-full text-left rounded-xl border p-3.5 transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-background hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={thread.avatar}
                        alt={thread.participantName}
                        referrerPolicy="no-referrer"
                        className="h-11 w-11 rounded-xl object-cover ring-1 ring-border shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display text-sm font-bold text-foreground truncate">
                            {thread.participantName}
                          </span>
                          <span className="text-[11px] font-mono text-secondary shrink-0">
                            {thread.lastTimestamp}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-primary truncate">
                          {thread.participantRole}
                        </p>
                        <p className="text-xs text-secondary line-clamp-1 mt-1">
                          {thread.lastPreview}
                        </p>
                      </div>
                      {thread.unreadCount > 0 && (
                        <span className="rounded-md bg-primary px-1.5 py-0.5 font-mono text-[10px] font-bold text-white dark:text-slate-950">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {/* Right 8 Cols: Active Conversation Interface */}
        {activeThread && (
          <section className="lg:col-span-8 rounded-2xl border border-border bg-card p-6 shadow-card flex flex-col justify-between min-h-[520px]">
            {/* Thread Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={activeThread.avatar}
                  alt={activeThread.participantName}
                  referrerPolicy="no-referrer"
                  className="h-12 w-12 rounded-xl object-cover ring-1 ring-border"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/alumni/${activeThread.alumniId}`}
                      className="font-display text-lg font-bold text-foreground hover:text-primary transition-colors"
                    >
                      {activeThread.participantName}
                    </Link>
                    <span className="text-xs font-mono text-primary font-semibold">
                      · {activeThread.participantChapter}
                    </span>
                  </div>
                  <p className="text-xs text-secondary">
                    {activeThread.participantRole}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/messages/${activeThread.id}`}
                  className="text-xs font-mono font-semibold text-primary hover:underline"
                >
                  Focused View
                </Link>
                <Link
                  to={`/alumni/${activeThread.alumniId}`}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary/50"
                >
                  View Profile
                </Link>
              </div>
            </div>

            {/* Messages Stream */}
            <div className="py-5 space-y-4 flex-1">
              {activeThread.connectionState === 'CONNECTIONS_ONLY_LOCKED' ? (
                <div className="rounded-xl border border-border bg-background p-8 text-center space-y-3 my-auto">
                  <Lock className="h-8 w-8 text-primary mx-auto" />
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Connections-Only Messaging Permission
                  </h3>
                  <p className="text-xs sm:text-sm text-secondary max-w-md mx-auto">
                    {activeThread.participantName} has configured their privacy settings to accept messages only from confirmed Sukkur IBA connections or active mentees.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => handleUnlockConnection(activeThread.id)}
                  >
                    <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                    Connect with {activeThread.participantName} to Unlock
                  </Button>
                </div>
              ) : activeThread.messages.length === 0 ? (
                <div className="rounded-xl border border-border bg-background p-8 text-center space-y-2">
                  <p className="text-sm font-semibold text-foreground">
                    No messages in this thread yet
                  </p>
                  <p className="text-xs text-secondary">
                    Introduce yourself and share your Sukkur IBA graduation cohort or career question below.
                  </p>
                </div>
              ) : (
                activeThread.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'ME' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-xl rounded-2xl border p-4 space-y-1.5 ${
                        msg.status === 'FAILED'
                          ? 'border-destructive bg-destructive/10 text-foreground'
                          : msg.sender === 'ME'
                            ? 'border-primary/40 bg-primary/10 text-foreground'
                            : 'border-border bg-background text-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 text-[11px] font-mono">
                        <span className="font-bold text-primary">
                          {msg.senderName}
                        </span>
                        <span className="text-secondary">{msg.timestamp}</span>
                      </div>
                      <p className="text-sm leading-relaxed">{msg.content}</p>

                      {msg.status === 'FAILED' ? (
                        <div className="pt-2 flex items-center justify-between gap-3 border-t border-destructive/30 text-xs">
                          <span className="inline-flex items-center gap-1 text-destructive font-semibold">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Delivery failed
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleRetryFailedMessage(activeThread.id, msg.id)
                            }
                            className="inline-flex items-center gap-1 font-mono font-bold text-primary hover:underline cursor-pointer"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Retry Send
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1 text-[10px] font-mono text-secondary">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          <span>{msg.status}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Compose Bar */}
            <form
              onSubmit={handleSendMessage}
              className="pt-4 border-t border-border flex items-center gap-2.5"
            >
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={
                  activeThread.connectionState === 'CONNECTIONS_ONLY_LOCKED'
                }
                placeholder={
                  activeThread.connectionState === 'CONNECTIONS_ONLY_LOCKED'
                    ? 'Connect with this alumnus above to compose a message...'
                    : `Write a message to ${activeThread.participantName}...`
                }
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={
                  activeThread.connectionState === 'CONNECTIONS_ONLY_LOCKED' ||
                  !draft.trim()
                }
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Send
              </Button>
            </form>

            <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-secondary">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Protected by Sukkur IBA AlumniConnect Messaging Guidelines
              </span>
              <span>
                Permission: {activeThread.connectionState.replace(/_/g, ' ')}
              </span>
            </div>
          </section>
        )}
      </div>
    </RoleShell>
  )
}