import { Router } from 'express'
import { prisma } from '../utils/prisma'
import { validateParams, validateQuery } from '../middleware/validation'
import { asyncHandler } from '../utils/asyncHandler'
import { successResponse, paginatedResponse } from '../utils/response'
import { AppError } from '../utils/errors'
import { idParamSchema, paginationSchema } from '@alumni-connect/shared'
import { AuthenticatedRequest } from '../middleware/auth'

const router = Router()

router.get('/', validateQuery(paginationSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { page, limit, isRead } = req.query as any

  const where: any = { userId: req.user!.id }
  if (isRead !== undefined) where.isRead = isRead === 'true'

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ])

  paginatedResponse(res, notifications, total, page, limit)
}))

router.get('/unread-count', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const count = await prisma.notification.count({
    where: { userId: req.user!.id, isRead: false },
  })

  successResponse(res, { count })
}))

router.patch('/:id/read', validateParams(idParamSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } })
  if (!notification) throw AppError.notFound('Notification not found')
  if (notification.userId !== req.user!.id) throw AppError.forbidden('Not your notification')

  const updated = await prisma.notification.update({
    where: { id: notification.id },
    data: { isRead: true, readAt: new Date() },
  })

  successResponse(res, { notification: updated })
}))

router.patch('/read-all', asyncHandler(async (req: AuthenticatedRequest, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.id, isRead: false },
    data: { isRead: true, readAt: new Date() },
  })

  successResponse(res, { message: 'All notifications marked as read' })
}))

router.delete('/:id', validateParams(idParamSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } })
  if (!notification) throw AppError.notFound('Notification not found')
  if (notification.userId !== req.user!.id) throw AppError.forbidden('Not your notification')

  await prisma.notification.delete({ where: { id: notification.id } })

  successResponse(res, { message: 'Notification deleted' })
}))

export default router