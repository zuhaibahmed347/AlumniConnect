import { Router } from 'express'
import { prisma } from '../utils/prisma'
import { validateParams, validateBody, validateQuery } from '../middleware/validation'
import { asyncHandler } from '../utils/asyncHandler'
import { successResponse, paginatedResponse, createdResponse, errorResponse } from '../utils/response'
import { AppError } from '../utils/errors'
import { idParamSchema, createConversationSchema, paginationSchema, addParticipantSchema, ConversationType } from '@alumni-connect/shared'
import { AuthenticatedRequest } from '../middleware/auth'
import { z } from 'zod'

const router = Router()

const participantParamsSchema = z.object({
  id: z.string().min(1, 'Conversation ID is required'),
  userId: z.string().min(1, 'User ID is required'),
})

router.get('/', validateQuery(paginationSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { page, limit } = req.query as any

  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: req.user!.id, leftAt: null } } },
    include: {
      participants: {
        where: { leftAt: null },
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
      },
    },
    orderBy: { updatedAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  })

  const total = await prisma.conversation.count({
    where: { participants: { some: { userId: req.user!.id, leftAt: null } } },
  })

  paginatedResponse(res, conversations, total, page, limit)
}))

router.post('/', validateBody(createConversationSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { type, name, participantIds } = req.body

  if (type === ConversationType.DIRECT && participantIds.length !== 1) {
    throw AppError.badRequest('Direct conversations must have exactly 1 other participant')
  }

  const allParticipantIds = [...new Set([req.user!.id, ...participantIds])]

  if (type === ConversationType.DIRECT) {
    const existing = await prisma.conversation.findFirst({
      where: {
        type: ConversationType.DIRECT,
        participants: {
          every: { userId: { in: allParticipantIds } },
        },
      },
      include: { participants: true },
    })
    if (existing) return successResponse(res, { conversation: existing })
  }

  const conversation = await prisma.conversation.create({
    data: {
      type,
      name,
      createdById: req.user!.id,
      participants: {
        create: allParticipantIds.map(userId => ({ userId, isAdmin: userId === req.user!.id })),
      },
    },
    include: {
      participants: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
    },
  })

  createdResponse(res, { conversation })
}))

router.get('/:id', validateParams(idParamSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: req.params.id },
    include: {
      participants: { where: { leftAt: null }, include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
    },
  })

  if (!conversation) throw AppError.notFound('Conversation not found')

  const isParticipant = conversation.participants.some(p => p.userId === req.user!.id)
  if (!isParticipant) throw AppError.forbidden('Not a participant')

  successResponse(res, { conversation })
}))

router.post('/:id/participants', validateParams(idParamSchema), validateBody(addParticipantSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params
  const { userId } = req.body

  const conversation = await prisma.conversation.findUnique({ where: { id } })
  if (!conversation) throw AppError.notFound('Conversation not found')

  const isParticipant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: id, userId: req.user!.id } },
  })
  if (!isParticipant || !isParticipant.isAdmin) throw AppError.forbidden('Only admins can add participants')

  const participant = await prisma.conversationParticipant.create({
    data: { conversationId: id, userId },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  })

  createdResponse(res, { participant })
}))

router.delete('/:id/participants/:userId', validateParams(participantParamsSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id, userId } = req.params

  const conversation = await prisma.conversation.findUnique({ where: { id } })
  if (!conversation) throw AppError.notFound('Conversation not found')

  const isParticipant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: id, userId: req.user!.id } },
  })
  const targetParticipant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: id, userId } },
  })
  if (!targetParticipant) throw AppError.notFound('Participant not found')

  if (req.user!.id !== userId && !isParticipant?.isAdmin) {
    throw AppError.forbidden('Cannot remove this participant')
  }

  await prisma.conversationParticipant.update({
    where: { id: targetParticipant.id },
    data: { leftAt: new Date() },
  })

  successResponse(res, { message: 'Participant removed' })
}))

router.post('/:id/leave', validateParams(idParamSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: id, userId: req.user!.id } },
  })
  if (!participant) throw AppError.notFound('Not a participant')

  await prisma.conversationParticipant.update({
    where: { id: participant.id },
    data: { leftAt: new Date() },
  })

  successResponse(res, { message: 'Left conversation' })
}))

export default router