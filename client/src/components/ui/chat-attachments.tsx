import type {
  MessageAttachment,
  MessageAttachmentCategory,
} from '@alumni-connect/shared/types'
import {
  Archive,
  Code2,
  Database,
  Download,
  File,
  FileAudio,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Headphones,
  Image as ImageIcon,
  Plus,
  Presentation,
  Trash2,
  Video,
  X,
} from 'lucide-react'
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'

const EXTENSION_MIME_FALLBACKS: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  odt: 'application/vnd.oasis.opendocument.text',
  rtf: 'application/rtf',
  txt: 'text/plain',
  md: 'text/markdown',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  csv: 'text/csv',
  tsv: 'text/tab-separated-values',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  odp: 'application/vnd.oasis.opendocument.presentation',
  zip: 'application/zip',
  rar: 'application/vnd.rar',
  '7z': 'application/x-7z-compressed',
  tar: 'application/x-tar',
  gz: 'application/gzip',
  tgz: 'application/gzip',
  bz2: 'application/x-bzip2',
  xz: 'application/x-xz',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  flac: 'audio/flac',
  opus: 'audio/opus',
  wma: 'audio/x-ms-wma',
  amr: 'audio/amr',
  aiff: 'audio/aiff',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  avi: 'video/x-msvideo',
  mkv: 'video/x-matroska',
  m4v: 'video/x-m4v',
  '3gp': 'video/3gpp',
  flv: 'video/x-flv',
  wmv: 'video/x-ms-wmv',
  ogv: 'video/ogg',
  json: 'application/json',
  xml: 'application/xml',
  yaml: 'application/x-yaml',
  yml: 'application/x-yaml',
  toml: 'application/toml',
  sql: 'application/sql',
  db: 'application/x-sqlite3',
  sqlite: 'application/x-sqlite3',
  py: 'text/x-python',
  js: 'text/javascript',
  mjs: 'text/javascript',
  cjs: 'text/javascript',
  ts: 'text/typescript',
  tsx: 'text/typescript',
  jsx: 'text/javascript',
  html: 'text/html',
  css: 'text/css',
  scss: 'text/x-scss',
  java: 'text/x-java-source',
  c: 'text/x-c',
  cpp: 'text/x-c++',
  h: 'text/x-c',
  cs: 'text/plain',
  go: 'text/x-go',
  rs: 'text/rust',
  php: 'application/x-httpd-php',
  rb: 'text/x-ruby',
  sh: 'application/x-sh',
  bat: 'application/x-msdos-program',
  ps1: 'text/plain',
  apk: 'application/vnd.android.package-archive',
  ipa: 'application/octet-stream',
  dmg: 'application/x-apple-diskimage',
  exe: 'application/vnd.microsoft.portable-executable',
  msi: 'application/x-msi',
  deb: 'application/vnd.debian.binary-package',
  rpm: 'application/x-rpm',
  iso: 'application/x-iso9660-image',
  fig: 'application/octet-stream',
  psd: 'image/vnd.adobe.photoshop',
  ai: 'application/postscript',
  eps: 'application/postscript',
}

const IMAGE_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'svg',
  'bmp',
  'ico',
  'avif',
  'tif',
  'tiff',
  'heic',
  'heif',
])

const AUDIO_EXTENSIONS = new Set([
  'mp3',
  'wav',
  'ogg',
  'm4a',
  'aac',
  'flac',
  'opus',
  'wma',
  'amr',
  'aiff',
])

const VIDEO_EXTENSIONS = new Set([
  'mp4',
  'webm',
  'mov',
  'avi',
  'mkv',
  'm4v',
  '3gp',
  'flv',
  'wmv',
])

const DOCUMENT_EXTENSIONS = new Set([
  'doc',
  'docx',
  'odt',
  'rtf',
  'txt',
  'md',
  'tex',
  'pages',
  'epub',
])

const SPREADSHEET_EXTENSIONS = new Set([
  'xls',
  'xlsx',
  'ods',
  'csv',
  'tsv',
  'numbers',
])

const PRESENTATION_EXTENSIONS = new Set(['ppt', 'pptx', 'odp', 'key'])

const ARCHIVE_EXTENSIONS = new Set([
  'zip',
  'rar',
  '7z',
  'tar',
  'gz',
  'tgz',
  'bz2',
  'xz',
  'iso',
  'dmg',
  'apk',
  'ipa',
  'deb',
  'rpm',
])

const CODE_EXTENSIONS = new Set([
  'js',
  'mjs',
  'cjs',
  'ts',
  'tsx',
  'jsx',
  'py',
  'java',
  'c',
  'cpp',
  'h',
  'hpp',
  'cs',
  'go',
  'rs',
  'php',
  'rb',
  'swift',
  'kt',
  'kts',
  'dart',
  'scala',
  'html',
  'css',
  'scss',
  'less',
  'sh',
  'bash',
  'zsh',
  'ps1',
  'bat',
  'dockerfile',
  'makefile',
  'r',
  'm',
  'ipynb',
])

const DATA_EXTENSIONS = new Set([
  'json',
  'xml',
  'yaml',
  'yml',
  'toml',
  'ini',
  'env',
  'sql',
  'db',
  'sqlite',
  'sqlite3',
  'parquet',
  'avro',
  'log',
])

export function extractFileExtension(fileName: string): string {
  const trimmed = fileName.trim()
  const lastDot = trimmed.lastIndexOf('.')
  if (lastDot <= 0 || lastDot === trimmed.length - 1) {
    return ''
  }
  return trimmed.slice(lastDot + 1).toLowerCase()
}

export function detectAttachmentCategory(
  mimeType: string,
  extension: string,
): MessageAttachmentCategory {
  const mime = mimeType.toLowerCase()
  const ext = extension.toLowerCase()

  if (
    (mime.startsWith('image/') && !mime.includes('photoshop')) ||
    IMAGE_EXTENSIONS.has(ext)
  ) {
    return 'IMAGE'
  }
  if (mime.startsWith('audio/') || AUDIO_EXTENSIONS.has(ext)) {
    return 'AUDIO'
  }
  if (mime.startsWith('video/') || VIDEO_EXTENSIONS.has(ext)) {
    return 'VIDEO'
  }
  if (mime === 'application/pdf' || ext === 'pdf') {
    return 'PDF'
  }
  if (SPREADSHEET_EXTENSIONS.has(ext) || mime.includes('spreadsheet') || mime === 'text/csv') {
    return 'SPREADSHEET'
  }
  if (PRESENTATION_EXTENSIONS.has(ext) || mime.includes('presentation')) {
    return 'PRESENTATION'
  }
  if (ARCHIVE_EXTENSIONS.has(ext) || mime.includes('zip') || mime.includes('compressed') || mime.includes('tar')) {
    return 'ARCHIVE'
  }
  if (CODE_EXTENSIONS.has(ext)) {
    return 'CODE'
  }
  if (DATA_EXTENSIONS.has(ext) || mime === 'application/json' || mime === 'application/xml') {
    return 'DATA'
  }
  if (DOCUMENT_EXTENSIONS.has(ext) || mime.includes('word') || mime.startsWith('text/')) {
    return 'DOCUMENT'
  }
  return 'FILE'
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value >= 10 || unitIndex === 0 ? Math.round(value) : value.toFixed(1)} ${units[unitIndex]}`
}

function readSingleFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error(`Unable to read file ${file.name}`))
      }
    }
    reader.onerror = () => {
      reject(new Error(`Error reading file ${file.name}`))
    }
    reader.readAsDataURL(file)
  })
}

export async function readFilesAsAttachments(
  fileList: FileList | File[],
): Promise<MessageAttachment[]> {
  const files = Array.from(fileList)
  const results = await Promise.all(
    files.map(async (file, index): Promise<MessageAttachment> => {
      const extension = extractFileExtension(file.name)
      const resolvedMime =
        file.type && file.type.trim().length > 0
          ? file.type
          : EXTENSION_MIME_FALLBACKS[extension] ?? 'application/octet-stream'
      const category = detectAttachmentCategory(resolvedMime, extension)
      const url = await readSingleFileAsDataUrl(file)

      return {
        id: `att-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name || `attachment-${index + 1}`,
        mimeType: resolvedMime,
        size: file.size,
        extension: extension || 'bin',
        url,
        category,
      }
    }),
  )
  return results
}

function getCategoryVisuals(category?: MessageAttachmentCategory) {
  switch (category) {
    case 'IMAGE':
      return {
        Icon: FileImage,
        badgeClass:
          'border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
        iconWrapClass:
          'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        label: 'Image',
      }
    case 'AUDIO':
      return {
        Icon: FileAudio,
        badgeClass:
          'border-purple-500/30 bg-purple-500/15 text-purple-600 dark:text-purple-400',
        iconWrapClass:
          'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
        label: 'Audio',
      }
    case 'VIDEO':
      return {
        Icon: FileVideo,
        badgeClass:
          'border-pink-500/30 bg-pink-500/15 text-pink-600 dark:text-pink-400',
        iconWrapClass:
          'bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30',
        label: 'Video',
      }
    case 'PDF':
      return {
        Icon: FileText,
        badgeClass:
          'border-rose-500/30 bg-rose-500/15 text-rose-600 dark:text-rose-400',
        iconWrapClass:
          'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
        label: 'PDF Document',
      }
    case 'DOCUMENT':
      return {
        Icon: FileText,
        badgeClass:
          'border-sky-500/30 bg-sky-500/15 text-sky-600 dark:text-sky-400',
        iconWrapClass:
          'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
        label: 'Document',
      }
    case 'SPREADSHEET':
      return {
        Icon: FileSpreadsheet,
        badgeClass:
          'border-teal-500/30 bg-teal-500/15 text-teal-600 dark:text-teal-400',
        iconWrapClass:
          'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30',
        label: 'Spreadsheet',
      }
    case 'PRESENTATION':
      return {
        Icon: Presentation,
        badgeClass:
          'border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400',
        iconWrapClass:
          'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
        label: 'Presentation',
      }
    case 'ARCHIVE':
      return {
        Icon: Archive,
        badgeClass:
          'border-orange-500/30 bg-orange-500/15 text-orange-600 dark:text-orange-400',
        iconWrapClass:
          'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
        label: 'Archive / Package',
      }
    case 'CODE':
      return {
        Icon: Code2,
        badgeClass:
          'border-indigo-500/30 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
        iconWrapClass:
          'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
        label: 'Source Code',
      }
    case 'DATA':
      return {
        Icon: Database,
        badgeClass:
          'border-cyan-500/30 bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
        iconWrapClass:
          'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
        label: 'Data File',
      }
    default:
      return {
        Icon: File,
        badgeClass: 'border-primary/30 bg-primary/15 text-primary',
        iconWrapClass: 'bg-primary/15 text-primary border-primary/30',
        label: 'File Attachment',
      }
  }
}

interface StagedAttachmentsTrayProps {
  attachments: MessageAttachment[]
  onRemove: (id: string) => void
  onClearAll: () => void
}

export function StagedAttachmentsTray({
  attachments,
  onRemove,
  onClearAll,
}: StagedAttachmentsTrayProps) {
  if (attachments.length === 0) return null

  return (
    <div className="rounded-xl border border-primary/30 bg-background/90 p-3 space-y-2.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-primary">
            {attachments.length} {attachments.length === 1 ? 'File' : 'Files'} Ready to Send
          </span>
          <span className="text-[11px] font-mono text-secondary">
            · Audio, Video, Photos & Documents supported
          </span>
        </div>
        {attachments.length > 1 && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-destructive hover:underline cursor-pointer"
          >
            <Trash2 className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {attachments.map((att) => {
          const category =
            att.category ?? detectAttachmentCategory(att.mimeType, att.extension)
          const { Icon, badgeClass, iconWrapClass } = getCategoryVisuals(category)
          const extLabel = (
            att.extension ||
            extractFileExtension(att.name) ||
            'FILE'
          ).toUpperCase()

          return (
            <div
              key={att.id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-card p-2 pr-2.5 shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                {category === 'IMAGE' ? (
                  <img
                    src={att.url}
                    alt={att.name}
                    className="h-10 w-10 rounded-md object-cover ring-1 ring-border shrink-0"
                  />
                ) : category === 'VIDEO' ? (
                  <video
                    src={att.url}
                    muted
                    preload="metadata"
                    className="h-10 w-10 rounded-md object-cover bg-black ring-1 ring-border shrink-0"
                  />
                ) : (
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border ${iconWrapClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-xs font-semibold text-foreground"
                    title={att.name}
                  >
                    {att.name}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center rounded border px-1.5 py-0.2 text-[10px] font-mono font-bold uppercase ${badgeClass}`}
                    >
                      .{extLabel}
                    </span>
                    <span className="text-[11px] font-mono text-secondary">
                      {formatFileSize(att.size)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemove(att.id)}
                  className="rounded-md p-1 text-secondary hover:bg-destructive/15 hover:text-destructive transition-colors cursor-pointer"
                  title={`Remove ${att.name}`}
                  aria-label={`Remove ${att.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {category === 'AUDIO' && (
                <audio
                  src={att.url}
                  controls
                  preload="metadata"
                  className="h-8 w-full"
                />
              )}

              {category === 'VIDEO' && (
                <video
                  src={att.url}
                  controls
                  preload="metadata"
                  className="max-h-32 w-full rounded-md bg-black"
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface WhatsAppAttachmentPickerProps {
  disabled?: boolean
  isReadingFiles?: boolean
  onSelectFiles: (files: FileList) => void
}

export function WhatsAppAttachmentPicker({
  disabled = false,
  isReadingFiles = false,
  onSelectFiles,
}: WhatsAppAttachmentPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const anyFileInputRef = useRef<HTMLInputElement | null>(null)
  const mediaInputRef = useRef<HTMLInputElement | null>(null)
  const audioInputRef = useRef<HTMLInputElement | null>(null)
  const shortVideoInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onSelectFiles(event.target.files)
    }
    event.target.value = ''
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      {/* Hidden specialized & unrestricted file inputs */}
      <input
        ref={anyFileInputRef}
        type="file"
        multiple
        onChange={handleInputChange}
        className="hidden"
        aria-label="Choose document or any file format"
      />
      <input
        ref={mediaInputRef}
        type="file"
        multiple
        accept="image/*,video/*,.mp4,.webm,.mov,.m4v,.3gp,.mkv,.avi"
        onChange={handleInputChange}
        className="hidden"
        aria-label="Choose photos or videos"
      />
      <input
        ref={audioInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac,.opus,.wma,.amr"
        onChange={handleInputChange}
        className="hidden"
        aria-label="Choose small audio or voice file"
      />
      <input
        ref={shortVideoInputRef}
        type="file"
        multiple
        accept="video/*,.mp4,.webm,.mov,.m4v,.3gp,.mkv,.avi"
        onChange={handleInputChange}
        className="hidden"
        aria-label="Choose small video clip"
      />

      {/* WhatsApp-style floating attachment menu */}
      {isOpen && !disabled && (
        <div
          role="menu"
          aria-label="Choose file type to send"
          className="absolute bottom-12 left-0 z-30 w-64 rounded-2xl border border-border bg-card p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <div className="px-2.5 py-1.5 border-b border-border/70 mb-1">
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-secondary">
              Choose File to Send
            </p>
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={() => anyFileInputRef.current?.click()}
            className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-primary/10 transition-colors cursor-pointer group"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 group-hover:scale-105 transition-transform">
              <FileText className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-foreground">
                Document & Any File
              </span>
              <span className="block text-[10px] font-mono text-secondary truncate">
                PDF, Word, ZIP, Code, Any format
              </span>
            </span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => mediaInputRef.current?.click()}
            className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-primary/10 transition-colors cursor-pointer group"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-500/15 text-pink-600 dark:text-pink-400 border border-pink-500/30 group-hover:scale-105 transition-transform">
              <ImageIcon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-foreground">
                Photos & Videos
              </span>
              <span className="block text-[10px] font-mono text-secondary truncate">
                Images, MP4, WebM, MOV clips
              </span>
            </span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => audioInputRef.current?.click()}
            className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-primary/10 transition-colors cursor-pointer group"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 group-hover:scale-105 transition-transform">
              <Headphones className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-foreground">
                Audio & Voice Clip
              </span>
              <span className="block text-[10px] font-mono text-secondary truncate">
                Small MP3, WAV, OGG, M4A, Voice
              </span>
            </span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => shortVideoInputRef.current?.click()}
            className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-primary/10 transition-colors cursor-pointer group"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 group-hover:scale-105 transition-transform">
              <Video className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-foreground">
                Small Video Format
              </span>
              <span className="block text-[10px] font-mono text-secondary truncate">
                Short MP4, WebM, MOV, 3GP video
              </span>
            </span>
          </button>
        </div>
      )}

      {/* WhatsApp-style + trigger button */}
      <button
        type="button"
        disabled={disabled || isReadingFiles}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Attach file menu"
        title="Attach file, small audio, short video, photo, or document"
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${
          isOpen
            ? 'border-primary bg-primary text-white dark:text-slate-950 shadow-sm'
            : 'border-border bg-background text-foreground hover:border-primary/60 hover:bg-primary/10 hover:text-primary'
        }`}
      >
        <Plus
          className={`h-5 w-5 transition-transform duration-200 ${
            isOpen ? 'rotate-45' : 'rotate-0'
          }`}
        />
      </button>
    </div>
  )
}

interface MessageAttachmentsListProps {
  attachments?: MessageAttachment[]
}

export function MessageAttachmentsList({
  attachments,
}: MessageAttachmentsListProps) {
  if (!attachments || attachments.length === 0) return null

  return (
    <div className="space-y-2.5 pt-1.5">
      {attachments.map((att) => {
        const category =
          att.category ?? detectAttachmentCategory(att.mimeType, att.extension)
        const { Icon, badgeClass, iconWrapClass, label } =
          getCategoryVisuals(category)
        const extLabel = (
          att.extension ||
          extractFileExtension(att.name) ||
          'FILE'
        ).toUpperCase()

        if (category === 'IMAGE') {
          return (
            <div
              key={att.id}
              className="overflow-hidden rounded-xl border border-border bg-card/90 shadow-2xs"
            >
              <div className="relative max-h-72 overflow-hidden bg-slate-950/20 flex items-center justify-center">
                <img
                  src={att.url}
                  alt={att.name}
                  className="max-h-72 w-auto max-w-full object-contain"
                />
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2 bg-card">
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-xs font-semibold text-foreground"
                    title={att.name}
                  >
                    {att.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`inline-flex items-center rounded border px-1.5 text-[10px] font-mono font-bold uppercase ${badgeClass}`}
                    >
                      {extLabel}
                    </span>
                    <span className="text-[11px] font-mono text-secondary">
                      {formatFileSize(att.size)}
                    </span>
                  </div>
                </div>
                <a
                  href={att.url}
                  download={att.name}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs font-mono font-semibold text-primary hover:bg-primary hover:text-white dark:hover:text-slate-950 transition-colors shrink-0"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </a>
              </div>
            </div>
          )
        }

        if (category === 'VIDEO') {
          return (
            <div
              key={att.id}
              className="overflow-hidden rounded-xl border border-border bg-card/90 shadow-2xs"
            >
              <video
                src={att.url}
                controls
                preload="metadata"
                className="max-h-72 w-full bg-black"
              />
              <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2 bg-card">
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-xs font-semibold text-foreground"
                    title={att.name}
                  >
                    {att.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`inline-flex items-center rounded border px-1.5 text-[10px] font-mono font-bold uppercase ${badgeClass}`}
                    >
                      {extLabel}
                    </span>
                    <span className="text-[11px] font-mono text-secondary">
                      {formatFileSize(att.size)}
                    </span>
                  </div>
                </div>
                <a
                  href={att.url}
                  download={att.name}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs font-mono font-semibold text-primary hover:bg-primary hover:text-white dark:hover:text-slate-950 transition-colors shrink-0"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </a>
              </div>
            </div>
          )
        }

        if (category === 'AUDIO') {
          return (
            <div
              key={att.id}
              className="rounded-xl border border-border bg-card p-3 space-y-2 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${iconWrapClass}`}
                  >
                    <FileAudio className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className="truncate text-xs font-semibold text-foreground"
                      title={att.name}
                    >
                      {att.name}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center rounded border px-1.5 text-[10px] font-mono font-bold uppercase ${badgeClass}`}
                      >
                        {extLabel}
                      </span>
                      <span className="text-[11px] font-mono text-secondary">
                        {formatFileSize(att.size)}
                      </span>
                    </div>
                  </div>
                </div>
                <a
                  href={att.url}
                  download={att.name}
                  className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs font-mono font-semibold text-primary hover:bg-primary hover:text-white dark:hover:text-slate-950 transition-colors shrink-0"
                >
                  <Download className="h-3.5 w-3.5" />
                  Save
                </a>
              </div>
              <audio
                src={att.url}
                controls
                preload="metadata"
                className="w-full h-9"
              />
            </div>
          )
        }

        const CardIcon = category === 'CODE' ? FileCode : Icon
        return (
          <div
            key={att.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card/95 p-3 shadow-2xs hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${iconWrapClass}`}
              >
                <CardIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-xs sm:text-sm font-semibold text-foreground"
                  title={att.name}
                >
                  {att.name}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span
                    className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase ${badgeClass}`}
                  >
                    .{extLabel}
                  </span>
                  <span className="text-[11px] font-mono text-secondary">
                    {label}
                  </span>
                  <span className="text-[11px] font-mono text-secondary">
                    · {formatFileSize(att.size)}
                  </span>
                </div>
              </div>
            </div>

            <a
              href={att.url}
              download={att.name}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-mono font-semibold text-primary hover:bg-primary hover:text-white dark:hover:text-slate-950 transition-colors shrink-0"
              title={`Download ${att.name}`}
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>
          </div>
        )
      })}
    </div>
  )
}
