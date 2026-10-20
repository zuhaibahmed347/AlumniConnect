import { Request, Response, NextFunction } from 'express'
import { prisma } from '../utils/prisma'
import { AuthenticatedRequest } from './auth'
import { Prisma } from '@prisma/client'

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
                action: options.action,
                resource: options.resource,
                resourceId: typeof resourceId === 'string' ? resourceId : undefined,
                metadata: {
                  ...meta,
                  method: req.method,
                  path: req.path,
                  statusCode,
                  duration,
                } as Prisma.InputJsonValue,
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
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
      userId,
      action,
      resource,
      resourceId,
      metadata: metadata as Prisma.InputJsonValue | undefined,
      ipAddress: req?.ip,
      userAgent: req?.get('user-agent'),
    },
  })
}