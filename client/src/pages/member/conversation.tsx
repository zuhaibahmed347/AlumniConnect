import { RoleShell } from '@/components/layout/role-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ALUMNI_DETAILED_CATALOG, getActivePersona } from '@/lib/role-context'
import { toast } from '@/lib/toast'
import { ArrowLeft, CheckCircle2, RotateCcw, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'

interface SingleMessage {
  id: string
  senderName: string
  isMe: boolean
  content: string
  timestamp: string
  failed?: boolean
}

export function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const partner =
    ALUMNI_DETAILED_CATALOG.find((a) => a.id === conversationId) ??
    ALUMNI_DETAILED_CATALOG[0]

  const [messages, setMessages] = useState<SingleMessage[]>([
    {
      id: '1',
      senderName: partner.name,
      isMe: false,
      content: `Salam! Glad to connect through Sukkur IBA AlumniConnect. Let me know how I can help with your ${partner.industry} career plans or technical preparation.`,
      timestamp: '10:30 AM',
    },
    {
      id: '2',
      senderName: 'You',
      isMe: true,
      content:
        'Thank you so much! I would love to share my resume and capstone project for a quick 15-minute review.',
      timestamp: '10:34 AM',
    },
  ])
  const [draft, setDraft] = useState('')

  const handleSend = (e: FormEvent) => {
    e.preventDefault()
    if (!draft.trim()) return
    const nextMsg: SingleMessage = {
      id: `m-${Date.now()}`,
      senderName: 'You',
      isMe: true,
      content: draft.trim(),
      timestamp: 'Just now',
    }
    setMessages((prev) => [...prev, nextMsg])
    setDraft('')
    toast.success('Message sent.')
  }

  return (
    <RoleShell
      role={getActivePersona()}
      title={`Conversation with ${partner.name}`}
      subtitle={`${partner.headline} · ${partner.chapter}`}
      badge="Direct Thread"
    >
      <div className="flex items-center justify-between">
        <Link
          to="/messages"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to All Conversations
        </Link>
        <Link
          to={`/alumni/${partner.id}`}
          className="text-xs font-mono font-semibold text-primary hover:underline"
        >
          View {partner.name}&apos;s Full Profile
        </Link>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5">
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.isMe ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-xl rounded-2xl border p-4 space-y-1 ${
                  msg.isMe
                    ? 'border-primary/40 bg-primary/10 text-foreground'
                    : 'border-border bg-background text-foreground'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-xs font-mono">
                  <span className="font-bold text-primary">
                    {msg.senderName}
                  </span>
                  <span className="text-secondary">{msg.timestamp}</span>
                </div>
                <p className="text-sm leading-relaxed">{msg.content}</p>
                {msg.failed ? (
                  <button
                    type="button"
                    onClick={() =>
                      setMessages((prev) =>
                        prev.map((m) =>
                          m.id === msg.id ? { ...m, failed: false } : m,
                        ),
                      )
                    }
                    className="inline-flex items-center gap-1 text-xs font-mono text-primary hover:underline"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Retry
                  </button>
                ) : (
                  <div className="flex items-center justify-end gap-1 text-[10px] font-mono text-secondary">
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                    <span>Delivered</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSend}
          className="pt-4 border-t border-border flex items-center gap-2.5"
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Reply to ${partner.name}...`}
            className="flex-1"
          />
          <Button type="submit" disabled={!draft.trim()}>
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Send Reply
          </Button>
        </form>
      </section>
    </RoleShell>
  )
}