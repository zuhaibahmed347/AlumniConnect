import { RoleShell } from '@/components/layout/role-shell'
import { Button } from '@/components/ui/button'
import {
  MessageAttachmentsList,
  StagedAttachmentsTray,
  WhatsAppAttachmentPicker,
  readFilesAsAttachments,
} from '@/components/ui/chat-attachments'
import { Input } from '@/components/ui/input'
import { ALUMNI_DETAILED_CATALOG, getActivePersona } from '@/lib/role-context'
import { toast } from '@/lib/toast'
import { api } from '@/services/api'
import type { MessageAttachment } from '@alumni-connect/shared/types'
import {
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  Send,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react'
import {
  useState,
  type DragEvent,
  type FormEvent,
} from 'react'
import { Link, useParams } from 'react-router-dom'

interface SingleMessage {
  id: string
  senderName: string
  isMe: boolean
  content: string
  timestamp: string
  failed?: boolean
  attachments?: MessageAttachment[]
}

const SAMPLE_RESUME_DATA_URL =
  'data:text/markdown;charset=utf-8,' +
  encodeURIComponent(
    '# Sukkur IBA Graduate Resume & Portfolio Summary\n\n- Degree: BS Computer Science\n- Key Projects: Distributed Order Settlement Engine, Campus Connect Portal\n',
  )

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
      content: `Salam! Glad to connect through Sukkur IBA AlumniConnect. Let me know how I can help with your ${partner.industry} career plans or technical preparation. You can attach any file format here (PDF, DOCX, ZIP, code, spreadsheets, or images).`,
      timestamp: '10:30 AM',
    },
    {
      id: '2',
      senderName: 'You',
      isMe: true,
      content:
        'Thank you so much! I would love to share my resume and capstone project summary for a quick 15-minute review.',
      timestamp: '10:34 AM',
      attachments: [
        {
          id: 'att-conv-seed-1',
          name: 'Sukkur_IBA_Graduate_Resume_Portfolio.md',
          mimeType: 'text/markdown',
          size: 14280,
          extension: 'md',
          url: SAMPLE_RESUME_DATA_URL,
          category: 'DOCUMENT',
        },
      ],
    },
  ])
  const [draft, setDraft] = useState('')
  const [stagedAttachments, setStagedAttachments] = useState<
    MessageAttachment[]
  >([])
  const [isReadingFiles, setIsReadingFiles] = useState(false)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  const processSelectedFiles = async (fileList: FileList | File[]) => {
    if (!fileList || fileList.length === 0) return
    setIsReadingFiles(true)
    try {
      const parsed = await readFilesAsAttachments(fileList)
      setStagedAttachments((prev) => [...prev, ...parsed])
      toast.success(
        `Attached ${parsed.length} ${parsed.length === 1 ? 'file' : 'files'} (${parsed.map((f) => f.name).join(', ')}).`,
      )
    } catch {
      toast.error('Could not read one or more selected files. Please try again.')
    } finally {
      setIsReadingFiles(false)
    }
  }

  const handleDragOver = (e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
  }

  const handleDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void processSelectedFiles(e.dataTransfer.files)
    }
  }

  const handleRemoveAttachment = (id: string) => {
    setStagedAttachments((prev) => prev.filter((item) => item.id !== id))
  }

  const handleClearAttachments = () => {
    setStagedAttachments([])
  }

  const handleSend = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed && stagedAttachments.length === 0) return

    const attachmentsToSend =
      stagedAttachments.length > 0 ? [...stagedAttachments] : undefined

    const nextMsg: SingleMessage = {
      id: `m-${Date.now()}`,
      senderName: 'You',
      isMe: true,
      content: trimmed,
      timestamp: 'Just now',
      attachments: attachmentsToSend,
    }
    setMessages((prev) => [...prev, nextMsg])
    setDraft('')
    setStagedAttachments([])
    void api
      .post('/messages', {
        conversationId: `conv-${conversationId || partner.id}`,
        content: trimmed,
        messageType: attachmentsToSend ? 'FILE' : 'TEXT',
        attachments: attachmentsToSend,
      })
      .catch(() => {
        // Optimistic message already rendered
      })
    toast.success(
      attachmentsToSend
        ? `Message sent with ${attachmentsToSend.length} ${attachmentsToSend.length === 1 ? 'attachment' : 'attachments'}.`
        : 'Message sent.',
    )
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

      <section
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-2xl border bg-card p-6 shadow-card space-y-5 transition-colors ${
          isDraggingOver
            ? 'border-primary ring-2 ring-primary/30 bg-primary/5'
            : 'border-border'
        }`}
      >
        {isDraggingOver && (
          <div className="pointer-events-none absolute inset-3 z-20 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary bg-background/90 backdrop-blur-xs p-6 text-center">
            <UploadCloud className="h-10 w-10 text-primary mb-2 animate-bounce" />
            <p className="font-display text-base font-bold text-foreground">
              Drop any file format to attach
            </p>
            <p className="text-xs font-mono text-secondary mt-1">
              PDF, Word, Excel, PowerPoint, ZIP/RAR, Images, Audio, Video, Source Code, CSV, JSON, or binary files
            </p>
          </div>
        )}

        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.isMe ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-xl w-full sm:w-auto rounded-2xl border p-4 space-y-2 ${
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

                {msg.content && (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                )}

                <MessageAttachmentsList attachments={msg.attachments} />

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

        <div className="pt-4 border-t border-border space-y-3">
          <StagedAttachmentsTray
            attachments={stagedAttachments}
            onRemove={handleRemoveAttachment}
            onClearAll={handleClearAttachments}
          />

          <form onSubmit={handleSend} className="flex items-center gap-2">
            <WhatsAppAttachmentPicker
              isReadingFiles={isReadingFiles}
              onSelectFiles={(files) => {
                void processSelectedFiles(files)
              }}
            />

            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={
                stagedAttachments.length > 0
                  ? `Add an optional message for your ${stagedAttachments.length} attached ${stagedAttachments.length === 1 ? 'file' : 'files'}...`
                  : `Reply or click + to choose audio, video, or any file for ${partner.name}...`
              }
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={
                isReadingFiles ||
                (!draft.trim() && stagedAttachments.length === 0)
              }
            >
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Send Reply
            </Button>
          </form>

          <div className="flex items-center justify-between text-[11px] font-mono text-secondary">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Click + to attach small audio, short video, photos, or any document format · Drag & drop enabled
            </span>
          </div>
        </div>
      </section>
    </RoleShell>
  )
}