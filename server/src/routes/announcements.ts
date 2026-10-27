import { Router } from 'express'
import { prisma } from '../utils/prisma'
import { validateParams, validateBody, validateQuery } from '../middleware/validation'
import { asyncHandler } from '../utils/asyncHandler'
import { successResponse, paginatedResponse, createdResponse, errorResponse } from '../utils/response'
import { AppError } from '../utils/errors'
import { idParamSchema, createAnnouncementSchema, updateAnnouncementSchema, paginationSchema, AnnouncementPriority } from '@alumni-connect/shared'
import { requirePermission, AuthenticatedRequest } from '../middleware/auth'
import { logAction } from '../middleware/auditLog'

const router = Router()

router.get('/', validateQuery(paginationSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { page, limit, isPublished } = req.query as any

  const where: any = {}
  if (isPublished !== undefined) where.isPublished = isPublished === 'true'
  else if (!['SUPER_ADMIN', 'ADMIN'].includes(req.user!.role)) where.isPublished = true

  if (!['SUPER_ADMIN', 'ADMIN'].includes(req.user!.role)) {
    where.OR = [
      { targetRoles: { has: req.user!.role } },
      { targetRoles: { equals: [] } },
    ]
  }

  const [announcements, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      include: { author: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.announcement.count({ where }),
  ])

  paginatedResponse(res, announcements, total, page, limit)
}))

router.get('/latest', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const where: any = { isPublished: true, publishedAt: { lte: new Date() } }

  if (!['SUPER_ADMIN', 'ADMIN'].includes(req.user!.role)) {
    where.OR = [
      { targetRoles: { has: req.user!.role } },
      { targetRoles: { equals: [] } },
    ]
  }

  const announcements = await prisma.announcement.findMany({
    where,
    include: { author: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: { publishedAt: 'desc' },
    take: 5,
  })

  successResponse(res, { announcements })
}))

router.get('/:id', validateParams(idParamSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const announcement = await prisma.announcement.findUnique({
    where: { id: req.params.id },
    include: { author: { select: { id: true, name: true, avatarUrl: true } } },
  })

  if (!announcement) throw AppError.notFound('Announcement not found')

  if (!announcement.isPublished && !['SUPER_ADMIN', 'ADMIN'].includes(req.user!.role)) {
    throw AppError.forbidden('Announcement not published')
  }

  successResponse(res, { announcement })
}))

router.post('/', validateBody(createAnnouncementSchema), requirePermission('announcements:write'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const data = {
    ...req.body,
    authorId: req.user!.id,
    publishedAt: req.body.isPublished ? new Date() : null,
  }

  const announcement = await prisma.announcement.create({
    data,
    include: { author: { select: { id: true, name: true, avatarUrl: true } } },
  })

  if (announcement.isPublished) {
    const users = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { role: { in: announcement.targetRoles.length > 0 ? announcement.targetRoles : undefined } },
          { role: { notIn: ['SUPER_ADMIN', 'ADMIN'] } },
        ],
      },
      select: { id: true },
    })

    await prisma.notification.createMany({
      data: users.map(u => ({
        userId: u.id,
        type: 'ANNOUNCEMENT',
        title: announcement.title,
        message: announcement.content.slice(0, 100) + (announcement.content.length > 100 ? '...' : ''),
        data: { announcementId: announcement.id },
      })),
    })
  }

  await logAction(req.user!.id, 'ANNOUNCEMENT_CREATED', 'Announcement', announcement.id, req.body, req)

  createdResponse(res, { announcement })
}))

router.patch('/:id', validateParams(idParamSchema), validateBody(updateAnnouncementSchema), requirePermission('announcements:write'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params

  const announcement = await prisma.announcement.findUnique({ where: { id } })
  if (!announcement) throw AppError.notFound('Announcement not found')

  const isAuthor = announcement.authorId === req.user!.id
  const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(req.user!.role)

  if (!isAuthor && !isAdmin) throw AppError.forbidden('Not authorized')

  const data = { ...req.body }
  if (data.isPublished === true && !announcement.isPublished) {
    data.publishedAt = new Date()
  } else if (data.isPublished === false) {
    data.publishedAt = null
  }

  const updated = await prisma.announcement.update({
    where: { id },
    data,
    include: { author: { select: { id: true, name: true, avatarUrl: true } } },
  })

  if (updated.isPublished && !announcement.isPublished) {
    const users = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { role: { in: updated.targetRoles.length > 0 ? updated.targetRoles : undefined } },
          { role: { notIn: ['SUPER_ADMIN', 'ADMIN'] } },
        ],
      },
      select: { id: true },
    })

    await prisma.notification.createMany({
      data: users.map(u => ({
        userId: u.id,
        type: 'ANNOUNCEMENT',
        title: updated.title,
        message: updated.content.slice(0, 100) + (updated.content.length > 100 ? '...' : ''),
        data: { announcementId: updated.id },
      })),
    })
  }

  await logAction(req.user!.id, 'ANNOUNCEMENT_UPDATED', 'Announcement', id, req.body, req)

  successResponse(res, { announcement: updated })
}))

router.delete('/:id', validateParams(idParamSchema), requirePermission('announcements:delete'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params

  const announcement = await prisma.announcement.findUnique({ where: { id } })
  if (!announcement) throw AppError.notFound('Announcement not found')

  const isAuthor = announcement.authorId === req.user!.id
  const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(req.user!.role)

  if (!isAuthor && !isAdmin) throw AppError.forbidden('Not authorized')

  await prisma.announcement.delete({ where: { id } })

  await logAction(req.user!.id, 'ANNOUNCEMENT_DELETED', 'Announcement', id, {}, req)

  successResponse(res, { message: 'Announcement deleted' })
}))

export default router