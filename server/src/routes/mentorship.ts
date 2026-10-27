import { Router } from 'express'
import { prisma } from '../utils/prisma'
import { validateParams, validateBody, validateQuery } from '../middleware/validation'
import { asyncHandler } from '../utils/asyncHandler'
import { successResponse, paginatedResponse, createdResponse, errorResponse } from '../utils/response'
import { AppError } from '../utils/errors'
import { idParamSchema, createMentorshipProfileSchema, updateMentorshipProfileSchema, createMentorshipRequestSchema, respondToMentorshipRequestSchema, paginationSchema, MentorshipStatus, UserRole } from '@alumni-connect/shared'
import { requirePermission, AuthenticatedRequest } from '../middleware/auth'
import { logAction } from '../middleware/auditLog'

const router = Router()

router.get('/mentors', validateQuery(paginationSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { page, limit, sortBy, sortOrder } = req.query as any

  const where = {
    isAvailable: true,
    currentMentees: { lt: prisma.mentorshipProfile.fields.maxMentees },
  }

  const [mentors, total] = await Promise.all([
    prisma.mentorshipProfile.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, profile: { select: { headline: true, location: true } } } },
      },
      orderBy: { [sortBy || 'createdAt']: sortOrder || 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.mentorshipProfile.count({ where }),
  ])

  paginatedResponse(res, mentors, total, page, limit)
}))

router.get('/profile/me', asyncHandler(async (req: AuthenticatedRequest, res) => {
  let profile = await prisma.mentorshipProfile.findUnique({
    where: { userId: req.user!.id },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
      sentRequests: { include: { mentee: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } } } },
      receivedRequests: { include: { mentor: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } } } },
    },
  })

  if (!profile) {
    profile = await prisma.mentorshipProfile.create({
      data: { userId: req.user!.id, headline: '', bio: '', expertise: [], industries: [] },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        sentRequests: { include: { mentee: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } } } },
        receivedRequests: { include: { mentor: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } } } },
      },
    })
  }

  successResponse(res, { profile })
}))

router.get('/profile/:id', validateParams(idParamSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const profile = await prisma.mentorshipProfile.findUnique({
    where: { id: req.params.id },
    include: { user: { select: { id: true, name: true, avatarUrl: true, profile: { select: { headline: true, location: true } } } } },
  })

  if (!profile) throw AppError.notFound('Mentorship profile not found')

  successResponse(res, { profile })
}))

router.post('/profile', validateBody(createMentorshipProfileSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const existing = await prisma.mentorshipProfile.findUnique({ where: { userId: req.user!.id } })
  if (existing) throw AppError.conflict('Mentorship profile already exists')

  const profile = await prisma.mentorshipProfile.create({
    data: { userId: req.user!.id, ...req.body },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  })

  await logAction(req.user!.id, 'MENTORSHIP_PROFILE_CREATED', 'MentorshipProfile', profile.id, req.body, req)

  createdResponse(res, { profile })
}))

router.patch('/profile/me', validateBody(updateMentorshipProfileSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const profile = await prisma.mentorshipProfile.upsert({
    where: { userId: req.user!.id },
    create: { userId: req.user!.id, ...req.body },
    update: req.body,
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  })

  await logAction(req.user!.id, 'MENTORSHIP_PROFILE_UPDATED', 'MentorshipProfile', profile.id, req.body, req)

  successResponse(res, { profile })
}))

router.post('/requests', validateBody(createMentorshipRequestSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { mentorId, message } = req.body

  const mentorProfile = await prisma.mentorshipProfile.findUnique({ where: { id: mentorId } })
  if (!mentorProfile) throw AppError.notFound('Mentor not found')

  if (!mentorProfile.isAvailable) throw AppError.badRequest('Mentor is not accepting mentees')

  if (mentorProfile.currentMentees >= mentorProfile.maxMentees) throw AppError.badRequest('Mentor has reached maximum mentees')

  if (mentorProfile.userId === req.user!.id) throw AppError.badRequest('Cannot request mentorship from yourself')

  const existing = await prisma.mentorshipRequest.findFirst({
    where: { mentorId, menteeId: req.user!.id, status: { in: [MentorshipStatus.PENDING, MentorshipStatus.ACCEPTED, MentorshipStatus.ACTIVE] } },
  })
  if (existing) throw AppError.conflict('You already have a pending or active request with this mentor')

  const menteeProfile = await prisma.mentorshipProfile.findUnique({ where: { userId: req.user!.id } })
  if (!menteeProfile) throw AppError.badRequest('You must create a mentorship profile first')

  const request = await prisma.mentorshipRequest.create({
    data: { mentorId, menteeId: req.user!.id, message },
    include: { mentor: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } } },
  })

  await prisma.notification.create({
    data: {
      userId: mentorProfile.userId,
      type: 'MENTORSHIP_REQUEST',
      title: 'New Mentorship Request',
      message: `${req.user!.name} has requested mentorship`,
      data: { requestId: request.id },
    },
  })

  await logAction(req.user!.id, 'MENTORSHIP_REQUEST_CREATED', 'MentorshipRequest', request.id, { mentorId }, req)

  createdResponse(res, { request })
}))

router.get('/requests', validateQuery(paginationSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { page, limit, status } = req.query as any

  const where: any = {
    OR: [{ mentor: { userId: req.user!.id } }, { menteeId: req.user!.id }],
  }
  if (status) where.status = status

  const [requests, total] = await Promise.all([
    prisma.mentorshipRequest.findMany({
      where,
      include: {
        mentor: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
        mentee: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
      },
      orderBy: { requestedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.mentorshipRequest.count({ where }),
  ])

  paginatedResponse(res, requests, total, page, limit)
}))

router.get('/requests/:id', validateParams(idParamSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const request = await prisma.mentorshipRequest.findUnique({
    where: { id: req.params.id },
    include: {
      mentor: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
      mentee: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
    },
  })

  if (!request) throw AppError.notFound('Request not found')

  const isParticipant = request.mentor.userId === req.user!.id || request.menteeId === req.user!.id
  const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'MENTORSHIP_MANAGER'].includes(req.user!.role)

  if (!isParticipant && !isAdmin) throw AppError.forbidden('Not authorized')

  successResponse(res, { request })
}))

router.patch('/requests/:id', validateParams(idParamSchema), validateBody(respondToMentorshipRequestSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params
  const { status } = req.body

  const request = await prisma.mentorshipRequest.findUnique({ where: { id }, include: { mentor: { select: { userId: true } } } })
  if (!request) throw AppError.notFound('Request not found')

  if (request.mentor.userId !== req.user!.id) throw AppError.forbidden('Only the mentor can respond')

  if (request.status !== MentorshipStatus.PENDING) throw AppError.badRequest('Request already responded to')

  const data: any = { status, respondedAt: new Date() }
  if (status === MentorshipStatus.ACCEPTED) {
    data.startedAt = new Date()
    await prisma.mentorshipProfile.update({
      where: { id: request.mentorId },
      data: { currentMentees: { increment: 1 } },
    })
  }

  const updated = await prisma.mentorshipRequest.update({ where: { id }, data })

  await prisma.notification.create({
    data: {
      userId: request.menteeId,
      type: 'MENTORSHIP_RESPONSE',
      title: `Mentorship Request ${status}`,
      message: `Your mentorship request has been ${status.toLowerCase()}`,
      data: { requestId: request.id },
    },
  })

  await logAction(req.user!.id, 'MENTORSHIP_REQUEST_RESPONDED', 'MentorshipRequest', id, { status }, req)

  successResponse(res, { request: updated })
}))

router.post('/requests/:id/cancel', validateParams(idParamSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params
  const { reason } = req.body

  const request = await prisma.mentorshipRequest.findUnique({ where: { id }, include: { mentor: { select: { userId: true } } } })
  if (!request) throw AppError.notFound('Request not found')

  const isParticipant = request.mentor.userId === req.user!.id || request.menteeId === req.user!.id
  if (!isParticipant) throw AppError.forbidden('Not authorized')

  const cancellableStatuses: MentorshipStatus[] = [MentorshipStatus.PENDING, MentorshipStatus.ACCEPTED, MentorshipStatus.ACTIVE]
  if (!cancellableStatuses.includes(request.status)) {
    throw AppError.badRequest('Cannot cancel this request')
  }

  const updated = await prisma.mentorshipRequest.update({
    where: { id },
    data: { status: MentorshipStatus.CANCELLED, cancelledAt: new Date(), cancellationReason: reason },
  })

  if (request.status === MentorshipStatus.ACCEPTED || request.status === MentorshipStatus.ACTIVE) {
    await prisma.mentorshipProfile.update({
      where: { id: request.mentorId },
      data: { currentMentees: { decrement: 1 } },
    })
  }

  const otherUserId = request.mentor.userId === req.user!.id ? request.menteeId : request.mentor.userId
  await prisma.notification.create({
    data: {
      userId: otherUserId,
      type: 'MENTORSHIP_RESPONSE',
      title: 'Mentorship Cancelled',
      message: `The mentorship has been cancelled${reason ? `: ${reason}` : ''}`,
      data: { requestId: request.id },
    },
  })

  await logAction(req.user!.id, 'MENTORSHIP_CANCELLED', 'MentorshipRequest', id, { reason }, req)

  successResponse(res, { request: updated })
}))

export default router