import { Router } from 'express'
import { prisma } from '../utils/prisma'
import { validateParams, validateBody, validateQuery } from '../middleware/validation'
import { asyncHandler } from '../utils/asyncHandler'
import { successResponse, paginatedResponse, createdResponse } from '../utils/response'
import { AppError } from '../utils/errors'
import {
  idParamSchema,
  sendMessageSchema,
  paginationSchema,
  updateMessageSchema,
  UserRole,
} from '@alumni-connect/shared'
import { AuthenticatedRequest } from '../middleware/auth'
import { logAction } from '../middleware/auditLog'
import { validateSafeAttachments, sanitizePlainTextContent } from '../utils/sanitize'

import { z } from 'zod'

const router = Router()

const conversationIdParamSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required'),
})

async function authorizeConversationAccess(
  conversationId: string,
  user: NonNullable<AuthenticatedRequest['user']>,
  allowDynamicThreadInit = false
) {
  let conv = await prisma.conversation.findUnique({ where: { id: conversationId } })

  if (!conv) {
    if (!allowDynamicThreadInit) {
      throw AppError.notFound('Conversation not found')
    }
    conv = await prisma.conversation.create({
      data: {
        id: conversationId,
        type: 'DIRECT',
        name: `Thread ${conversationId}`,
        createdById: user.id,
        participants: {
          create: [{ userId: user.id, isAdmin: true }],
        },
      },
    })
  }

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: user.id } },
  })

  if (!participant || participant.leftAt !== null) {
    throw AppError.forbidden('You are not an authorized participant of this conversation')
  }

  return participant
}

router.get(
  '/:conversationId',
  validateParams(conversationIdParamSchema),
  validateQuery(paginationSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { conversationId } = req.params
    const { page, limit } = req.query as any

    const participant = await authorizeConversationAccess(conversationId, req.user!, false)

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
  })
)

router.post(
  '/',
  validateBody(sendMessageSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { conversationId, content = '', messageType, attachments, metadata } = req.body
    const sanitizedContent = sanitizePlainTextContent(String(content))

    const isDynamicClientThread =
      conversationId.startsWith('thread-') || conversationId.startsWith('conv-custom-')
    await authorizeConversationAccess(conversationId, req.user!, isDynamicClientThread)

    const hasAttachments = Array.isArray(attachments) && attachments.length > 0
    if (!sanitizedContent && !hasAttachments) {
      throw AppError.badRequest(
        'Message must include text or at least one attached file'
      )
    }

    if (hasAttachments) {
      validateSafeAttachments(attachments)
    }

    const allImages =
      hasAttachments &&
      attachments.every(
        (att: { mimeType?: string; category?: string }) =>
          att.category === 'IMAGE' ||
          (typeof att.mimeType === 'string' && att.mimeType.startsWith('image/'))
      )

    const resolvedMessageType = hasAttachments
      ? allImages
        ? 'IMAGE'
        : 'FILE'
      : messageType || 'TEXT'

    const mergedMetadata = hasAttachments
      ? { ...(metadata || {}), attachments }
      : metadata

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: req.user!.id,
        content: sanitizedContent,
        messageType: resolvedMessageType,
        metadata: mergedMetadata,
      },
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

    const previewText = sanitizedContent
      ? `${sanitizedContent.slice(0, 50)}${sanitizedContent.length > 50 ? '...' : ''}`
      : hasAttachments
        ? `Attached ${attachments.length} file${attachments.length > 1 ? 's' : ''}`
        : 'New message'

    await Promise.all(
      otherParticipants.map((p: any) =>
        prisma.notification.create({
          data: {
            userId: p.user.id,
            type: 'NEW_MESSAGE',
            title: 'New Message',
            message: `${req.user!.name}: ${previewText}`,
            data: { conversationId, messageId: message.id },
          },
        })
      )
    )

    await logAction(
      req.user!.id,
      'MESSAGE_SENT',
      'Message',
      message.id,
      { conversationId, attachmentCount: hasAttachments ? attachments.length : 0 },
      req
    )

    createdResponse(res, { message })
  })
)

router.patch(
  '/:id',
  validateParams(idParamSchema),
  validateBody(updateMessageSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params
    const sanitizedContent = sanitizePlainTextContent(String(req.body.content || ''))

    const message = await prisma.message.findUnique({ where: { id } })
    if (!message) throw AppError.notFound('Message not found')

    if (message.senderId !== req.user!.id) {
      throw AppError.forbidden('Can only edit your own messages')
    }

    const updated = await prisma.message.update({
      where: { id },
      data: { content: sanitizedContent, updatedAt: new Date() },
    })

    await logAction(req.user!.id, 'MESSAGE_UPDATED', 'Message', id, {}, req)

    successResponse(res, { message: updated })
  })
)

router.delete(
  '/:id',
  validateParams(idParamSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params

    const message = await prisma.message.findUnique({ where: { id } })
    if (!message) throw AppError.notFound('Message not found')

    const isSender = message.senderId === req.user!.id
    const isAdminOrMod = ([
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.MODERATOR,
    ] as UserRole[]).includes(req.user!.role)

    if (!isSender && !isAdminOrMod) {
      throw AppError.forbidden('Can only delete your own messages')
    }

    await prisma.message.update({ where: { id }, data: { deletedAt: new Date() } })

    await logAction(req.user!.id, 'MESSAGE_DELETED', 'Message', id, {}, req)

    successResponse(res, { message: 'Message deleted' })
  })
)

export default router