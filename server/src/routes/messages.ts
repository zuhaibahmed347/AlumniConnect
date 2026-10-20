import { Router } from 'express'
import { prisma } from '../utils/prisma'
import { validateParams, validateBody, validateQuery } from '../middleware/validation'
import { asyncHandler } from '../utils/asyncHandler'
import { successResponse, paginatedResponse, createdResponse, errorResponse } from '../utils/response'
import { AppError } from '../utils/errors'
import { idParamSchema, sendMessageSchema, paginationSchema, updateMessageSchema } from '@alumni-connect/shared'
import { AuthenticatedRequest } from '../middleware/auth'
import { logAction } from '../middleware/auditLog'
import { MessageType } from '@prisma/client'

const router = Router()

router.get('/:conversationId', validateParams(idParamSchema), validateQuery(paginationSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { conversationId } = req.params
  const { page, limit } = req.query as any

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: req.user!.id } },
  })
  if (!participant || participant.leftAt) throw AppError.forbidden('Not a participant')

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId, deletedAt: null },
      include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.message.count({ where: { conversationId, deletedAt: null } }),
  ])

  await prisma.conversationParticipant.update({
    where: { id: participant.id },
    data: { lastReadAt: new Date() },
  })

  paginatedResponse(res, messages.reverse(), total, page, limit)
}))

router.post('/', validateBody(sendMessageSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { conversationId, content, messageType, metadata } = req.body

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: req.user!.id } },
  })
  if (!participant || participant.leftAt) throw AppError.forbidden('Not a participant')

  const message = await prisma.message.create({
    data: { conversationId, senderId: req.user!.id, content, messageType, metadata },
    include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
  })

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  })

  const otherParticipants = await prisma.conversationParticipant.findMany({
    where: { conversationId, userId: { not: req.user!.id }, leftAt: null },
    include: { user: { select: { id: true } } },
  })

  await Promise.all(otherParticipants.map(p =>
    prisma.notification.create({
      data: {
        userId: p.user.id,
        type: 'NEW_MESSAGE',
        title: 'New Message',
        message: `${req.user!.name}: ${content.slice(0, 50)}${content.length > 50 ? '...' : ''}`,
        data: { conversationId, messageId: message.id },
      },
    })
  ))

  await logAction(req.user!.id, 'MESSAGE_SENT', 'Message', message.id, { conversationId }, req)

  createdResponse(res, { message })
}))

router.patch('/:id', validateParams(idParamSchema), validateBody(updateMessageSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params
  const { content } = req.body

  const message = await prisma.message.findUnique({ where: { id } })
  if (!message) throw AppError.notFound('Message not found')

  if (message.senderId !== req.user!.id) throw AppError.forbidden('Can only edit your own messages')

  const updated = await prisma.message.update({ where: { id }, data: { content, updatedAt: new Date() } })

  await logAction(req.user!.id, 'MESSAGE_UPDATED', 'Message', id, { content }, req)

  successResponse(res, { message: updated })
}))

router.delete('/:id', validateParams(idParamSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params

  const message = await prisma.message.findUnique({ where: { id } })
  if (!message) throw AppError.notFound('Message not found')

  if (message.senderId !== req.user!.id) throw AppError.forbidden('Can only delete your own messages')

  await prisma.message.update({ where: { id }, data: { deletedAt: new Date() } })

  await logAction(req.user!.id, 'MESSAGE_DELETED', 'Message', id, {}, req)

  successResponse(res, { message: 'Message deleted' })
}))

export default router