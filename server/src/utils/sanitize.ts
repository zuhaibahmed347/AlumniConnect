import { Request, Response, NextFunction } from 'express'
import createDOMPurify, { type WindowLike } from 'dompurify'
import { JSDOM } from 'jsdom'
import { AppError } from './errors'

/**
 * Server-side JSDOM window + DOMPurify singleton instance for sanitizing
 * all untrusted user-generated content (bios, messages, job descriptions,
 * event descriptions, mentorship notes, and profile fields) prior to storage.
 */
const jsdomWindow = new JSDOM('').window
const DOMPurify = createDOMPurify(jsdomWindow as unknown as WindowLike)

// Enforce strict URI validation hook inside DOMPurify
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if ('href' in node) {
    const href = String(node.getAttribute('href') || '').trim()
    if (/^\s*(?:javascript|vbscript|data\s*:\s*text\/html)\s*:/i.test(href)) {
      node.removeAttribute('href')
    }
  }
  if ('src' in node) {
    const src = String(node.getAttribute('src') || '').trim()
    if (/^\s*(?:javascript|vbscript|data\s*:\s*text\/html)\s*:/i.test(src)) {
      node.removeAttribute('src')
    }
  }
})

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

const SCRIPT_TAG_REGEX =
  /<\s*\/?\s*(script|iframe|object|embed|applet|meta|link|style|base|form|svg|math)\b[^>]*>/gi
const SCRIPT_BLOCK_REGEX = /<\s*(script|style)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi
const INLINE_EVENT_HANDLER_REGEX = /\bon[a-z]{2,25}\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi
const DANGEROUS_URI_PROTOCOL_REGEX =
  /^\s*(?:javascript|vbscript|data\s*:\s*text\/html)\s*:/i

const FORBIDDEN_ATTACHMENT_EXTENSIONS = new Set([
  '.exe',
  '.dll',
  '.bat',
  '.cmd',
  '.sh',
  '.bash',
  '.ps1',
  '.vbs',
  '.msi',
  '.scr',
  '.com',
  '.pif',
  '.php',
  '.jsp',
  '.asp',
  '.aspx',
  '.cgi',
  '.jar',
  '.htaccess',
])

const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

/**
 * Decodes common HTML entities produced by DOMPurify when stripping tags from
 * plain-text fields (e.g. `&amp;` -> `&`) so stored plain text remains clean
 * while all HTML/JS tags remain completely removed.
 */
function decodeSafeTextEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
}

/**
 * Sanitizes plain-text user-generated content (bios, messages, headlines, titles)
 * using DOMPurify + JSDOM with zero permitted HTML tags (`ALLOWED_TAGS: []`).
 */
export function sanitizePlainTextContent(input: string): string {
  const withoutNulls = input.replace(/\0/g, '').replace(SCRIPT_BLOCK_REGEX, '')
  const purified = DOMPurify.sanitize(withoutNulls, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  })
  return decodeSafeTextEntities(purified)
    .replace(SCRIPT_TAG_REGEX, '')
    .replace(INLINE_EVENT_HANDLER_REGEX, '')
}

/**
 * Sanitizes rich-text descriptions (job descriptions, requirements, benefits,
 * event descriptions) using DOMPurify + JSDOM with a strict formatting allowlist
 * and zero script/event/embed capabilities.
 */
export function sanitizeRichTextContent(input: string): string {
  const withoutNulls = input.replace(/\0/g, '').replace(SCRIPT_BLOCK_REGEX, '')
  const purified = DOMPurify.sanitize(withoutNulls, {
    ALLOWED_TAGS: [
      'b',
      'i',
      'em',
      'strong',
      'p',
      'br',
      'ul',
      'ol',
      'li',
      'code',
      'pre',
      'blockquote',
    ],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
    FORBID_TAGS: [
      'script',
      'iframe',
      'object',
      'embed',
      'applet',
      'meta',
      'link',
      'style',
      'base',
      'form',
      'input',
      'button',
      'svg',
      'math',
      'img',
    ],
    FORBID_ATTR: [
      'onerror',
      'onload',
      'onclick',
      'onmouseover',
      'onfocus',
      'onblur',
      'style',
      'src',
      'href',
    ],
  })
  return decodeSafeTextEntities(purified)
    .replace(SCRIPT_TAG_REGEX, '')
    .replace(INLINE_EVENT_HANDLER_REGEX, '')
}

const RICH_TEXT_FIELDS = new Set([
  'description',
  'requirements',
  'benefits',
])

/**
 * Sanitizes an untrusted string to neutralize stored/reflected XSS vectors
 * using DOMPurify + JSDOM while preserving normal punctuation.
 */
export function sanitizeString(input: string, fieldName = ''): string {
  const cleaned = input.replace(/\0/g, '')
  const lowerField = fieldName.toLowerCase()

  // Never mutate password fields so exact user password characters are hashed
  if (lowerField.includes('password')) {
    return cleaned
  }

  // Block dangerous URI schemes on URL-like fields
  if (
    (lowerField.includes('url') ||
      lowerField.includes('website') ||
      lowerField.includes('avatar')) &&
    DANGEROUS_URI_PROTOCOL_REGEX.test(cleaned)
  ) {
    return ''
  }

  const sanitized = RICH_TEXT_FIELDS.has(lowerField)
    ? sanitizeRichTextContent(cleaned)
    : sanitizePlainTextContent(cleaned)

  if (DANGEROUS_URI_PROTOCOL_REGEX.test(sanitized)) {
    return sanitized.replace(DANGEROUS_URI_PROTOCOL_REGEX, 'blocked:')
  }

  return sanitized
}

/**
 * Recursively sanitizes objects/arrays using DOMPurify + JSDOM, strips prototype
 * pollution keys, and neutralizes HTML/JS injection payloads before storage.
 */
export function sanitizePayload<T>(value: T, fieldName = '', depth = 0): T {
  if (depth > 12 || value === null || value === undefined) {
    return value
  }

  if (typeof value === 'string') {
    return sanitizeString(value, fieldName) as unknown as T
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizePayload(item, fieldName, depth + 1)) as unknown as T
  }

  if (typeof value === 'object' && !(value instanceof Date)) {
    const cleanObj: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (DANGEROUS_KEYS.has(key)) {
        continue
      }
      cleanObj[key] = sanitizePayload(val, key, depth + 1)
    }
    return cleanObj as T
  }

  return value
}

export interface SanitizeContentOptions {
  richTextFields?: string[]
  plainTextFields?: string[]
}

/**
 * Explicit pre-storage sanitizer for user-generated content records
 * (bios, messages, job descriptions, mentorship requests, event descriptions).
 */
export function sanitizeUserGeneratedContent<T>(
  data: T,
  fieldOrOptions?: string | SanitizeContentOptions
): T {
  const baseSanitized = sanitizePayload(
    data,
    typeof fieldOrOptions === 'string' ? fieldOrOptions : ''
  )

  if (
    fieldOrOptions &&
    typeof fieldOrOptions === 'object' &&
    baseSanitized &&
    typeof baseSanitized === 'object' &&
    !Array.isArray(baseSanitized)
  ) {
    const result = { ...(baseSanitized as Record<string, unknown>) }
    const richSet = new Set(
      (fieldOrOptions.richTextFields || []).map((f) => f.toLowerCase())
    )
    const plainSet = new Set(
      (fieldOrOptions.plainTextFields || []).map((f) => f.toLowerCase())
    )

    for (const [key, val] of Object.entries(result)) {
      if (typeof val === 'string') {
        const lowerKey = key.toLowerCase()
        if (plainSet.has(lowerKey)) {
          result[key] = sanitizePlainTextContent(val)
        } else if (richSet.has(lowerKey)) {
          result[key] = sanitizeRichTextContent(val)
        }
      }
    }
    return result as T
  }

  return baseSanitized
}

/**
 * Validates message or profile file attachment metadata to prevent executable
 * uploads, path traversal filenames, dangerous data URIs, and oversized files.
 */
export function validateSafeAttachments(attachments: unknown[]): void {
  for (const raw of attachments) {
    if (!raw || typeof raw !== 'object') {
      throw AppError.badRequest('Invalid attachment format')
    }
    const att = raw as Record<string, unknown>
    const name = String(att.name || '').trim()
    const extension = String(att.extension || '').toLowerCase().trim()
    const mimeType = String(att.mimeType || '').toLowerCase().trim()
    const size = Number(att.size ?? 0)
    const url = String(att.url || '').trim()

    if (!name || name.includes('..') || name.includes('/') || name.includes('\\')) {
      throw AppError.badRequest('Invalid or unsafe attachment filename')
    }

    const extFromName = name.includes('.')
      ? `.${name.split('.').pop()!.toLowerCase()}`
      : ''
    const normalizedExt = extension.startsWith('.')
      ? extension
      : extension
        ? `.${extension}`
        : extFromName

    if (
      FORBIDDEN_ATTACHMENT_EXTENSIONS.has(normalizedExt) ||
      FORBIDDEN_ATTACHMENT_EXTENSIONS.has(extFromName)
    ) {
      throw AppError.badRequest(
        `Executable or script file type (${normalizedExt || extFromName}) is not permitted`,
      )
    }

    if (
      mimeType.includes('application/x-msdownload') ||
      mimeType.includes('application/x-executable') ||
      mimeType.includes('application/x-sh') ||
      mimeType.includes('text/html') ||
      mimeType.includes('application/javascript')
    ) {
      throw AppError.badRequest(
        `Attachment MIME type (${mimeType}) is not permitted`,
      )
    }

    if (Number.isNaN(size) || size < 0 || size > MAX_ATTACHMENT_SIZE_BYTES) {
      throw AppError.badRequest(
        'Attachment exceeds the 10MB maximum allowed size',
      )
    }

    if (DANGEROUS_URI_PROTOCOL_REGEX.test(url)) {
      throw AppError.badRequest('Unsafe attachment URL protocol')
    }
  }
}

/**
 * Express middleware that sanitizes req.body and req.query against XSS and prototype pollution.
 */
export function requestSanitizerMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizePayload(req.body)
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizePayload(req.query)
  }
  next()
}
