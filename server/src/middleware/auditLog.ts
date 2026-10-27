import { Request, Response, NextFunction } from 'express'
import { prisma } from '../utils/prisma'
import { AuthenticatedRequest } from './auth'

const REDACTED_AUDIT_KEYS = new Set([
  'password',
  'currentPassword',
  'newPassword',
  'confirmPassword',
  'passwordHash',
  'passwordResetToken',
  'passwordResetTokenHash',
  'token',
  'accessToken',
  'refreshToken',
])

function sanitizeLogString(value: string): string {
  return value.replace(/[\r\n\0\t]+/g, ' ').slice(0, 500)
}

function sanitizeAuditMetadata(
  meta?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!meta || typeof meta !== 'object') return undefined
  const clean: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(meta)) {
    if (REDACTED_AUDIT_KEYS.has(key)) {
      clean[key] = '[REDACTED]'
    } else if (typeof val === 'string') {
      clean[key] = sanitizeLogString(val)
    } else {
      clean[key] = val
    }
  }
  return clean
}

export interface AuditLogOptions {
  action: string
  resource: string
  getResourceId?: (req: AuthenticatedRequest) => string | Promise<string>
  getMetadata?: (req: AuthenticatedRequest, res: Response) => Record<string, unknown> | Promise<Record<string, unknown>>
}

export function auditLog(options: AuditLogOptions) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send
    const startTime = Date.now()

    res.send = function (body?: string) {
      const duration = Date.now() - startTime
      const statusCode = res.statusCode

      if (req.user && (statusCode >= 200 && statusCode < 400)) {
        const resourceId = options.getResourceId ? options.getResourceId(req) : undefined
        const metadata = options.getMetadata ? options.getMetadata(req, res) : {}

        Promise.resolve(metadata)
          .then((meta) =>
            prisma.auditLog.create({
              data: {
                userId: req.user!.id,
                action: sanitizeLogString(options.action),
                resource: sanitizeLogString(options.resource),
                resourceId: typeof resourceId === 'string' ? sanitizeLogString(resourceId) : undefined,
                metadata: {
                  ...(sanitizeAuditMetadata(meta) || {}),
                  method: req.method,
                  path: sanitizeLogString(req.path),
                  statusCode,
                  duration,
                },
                ipAddress: req.ip,
                userAgent: req.get('user-agent')
                  ? sanitizeLogString(req.get('user-agent')!)
                  : undefined,
              },
            }),
          )
          .catch(() => {})
      }

      return originalSend.call(this, body)
    }

    next()
  }
}

export async function logAction(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  metadata?: Record<string, unknown>,
  req?: Request
) {
  await prisma.auditLog.create({
    data: {
      userId: sanitizeLogString(userId),
      action: sanitizeLogString(action),
      resource: sanitizeLogString(resource),
      resourceId: resourceId ? sanitizeLogString(resourceId) : undefined,
      metadata: sanitizeAuditMetadata(metadata),
      ipAddress: req?.ip,
      userAgent: req?.get('user-agent')
        ? sanitizeLogString(req.get('user-agent')!)
        : undefined,
    },
  })
}