import { Router } from 'express'
import { prisma } from '../utils/prisma'
import { validateQuery, validateParams, validateBody } from '../middleware/validation'
import { asyncHandler } from '../utils/asyncHandler'
import { successResponse, paginatedResponse, createdResponse, errorResponse } from '../utils/response'
import { AppError } from '../utils/errors'
import { eventFiltersSchema, idParamSchema, slugParamSchema, createEventSchema, updateEventSchema } from '@alumni-connect/shared'
import { requirePermission, AuthenticatedRequest } from '../middleware/auth'
import { logAction } from '../middleware/auditLog'
import { EventStatus, RegistrationStatus } from '@prisma/client'

const router = Router()

router.get('/', validateQuery(eventFiltersSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { search, status, isVirtual, startDateFrom, startDateTo, page, limit, sortBy, sortOrder } = req.query as any

  const where: any = {}
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (status) where.status = status
  if (isVirtual !== undefined) where.isVirtual = isVirtual === 'true'
  if (startDateFrom || startDateTo) {
    where.startDate = {}
    if (startDateFrom) where.startDate.gte = new Date(startDateFrom)
    if (startDateTo) where.startDate.lte = new Date(startDateTo)
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        organizer: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { registrations: { where: { status: RegistrationStatus.REGISTERED } } } },
      },
      orderBy: { [sortBy || 'startDate']: sortOrder || 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.event.count({ where }),
  ])

  paginatedResponse(res, events, total, page, limit)
}))

router.get('/upcoming', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const events = await prisma.event.findMany({
    where: {
      status: EventStatus.PUBLISHED,
      startDate: { gte: new Date() },
    },
    include: {
      organizer: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { registrations: { where: { status: RegistrationStatus.REGISTERED } } } },
    },
    orderBy: { startDate: 'asc' },
    take: 10,
  })

  successResponse(res, { events })
}))

router.get('/:id', validateParams(idParamSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const event = await prisma.event.findUnique({
    where: { id: req.params.id },
    include: {
      organizer: { select: { id: true, name: true, avatarUrl: true, email: true } },
      registrations: {
        where: { status: RegistrationStatus.REGISTERED },
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        take: 20,
      },
      _count: { select: { registrations: { where: { status: RegistrationStatus.REGISTERED } } } },
    },
  })

  if (!event) throw AppError.notFound('Event not found')

  const userRegistration = req.user ? await prisma.eventRegistration.findUnique({
    where: { eventId_userId: { eventId: event.id, userId: req.user.id } },
  }) : null

  successResponse(res, { event: { ...event, userRegistration } })
}))

router.get('/slug/:slug', validateParams(slugParamSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const event = await prisma.event.findUnique({
    where: { slug: req.params.slug },
    include: {
      organizer: { select: { id: true, name: true, avatarUrl: true, email: true } },
      _count: { select: { registrations: { where: { status: RegistrationStatus.REGISTERED } } } },
    },
  })

  if (!event) throw AppError.notFound('Event not found')

  const userRegistration = req.user ? await prisma.eventRegistration.findUnique({
    where: { eventId_userId: { eventId: event.id, userId: req.user.id } },
  }) : null

  successResponse(res, { event: { ...event, userRegistration } })
}))

router.post('/', validateBody(createEventSchema), requirePermission('events:write'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const slug = req.body.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Date.now().toString(36)

  const event = await prisma.event.create({
    data: {
      ...req.body,
      slug,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      organizerId: req.user!.id,
    },
    include: { organizer: { select: { id: true, name: true, avatarUrl: true } } },
  })

  await logAction(req.user!.id, 'EVENT_CREATED', 'Event', event.id, req.body, req)

  createdResponse(res, { event })
}))

router.patch('/:id', validateParams(idParamSchema), validateBody(updateEventSchema), requirePermission('events:write'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params

  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) throw AppError.notFound('Event not found')

  const isOrganizer = event.organizerId === req.user!.id
  const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'EVENT_MANAGER'].includes(req.user!.role)

  if (!isOrganizer && !isAdmin) {
    throw AppError.forbidden('You can only update your own events')
  }

  const data = { ...req.body }
  if (data.startDate) data.startDate = new Date(data.startDate)
  if (data.endDate) data.endDate = new Date(data.endDate)

  const updated = await prisma.event.update({
    where: { id },
    data,
    include: { organizer: { select: { id: true, name: true, avatarUrl: true } } },
  })

  await logAction(req.user!.id, 'EVENT_UPDATED', 'Event', id, req.body, req)

  successResponse(res, { event: updated })
}))

router.delete('/:id', validateParams(idParamSchema), requirePermission('events:delete'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params

  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) throw AppError.notFound('Event not found')

  const isOrganizer = event.organizerId === req.user!.id
  const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(req.user!.role)

  if (!isOrganizer && !isAdmin) {
    throw AppError.forbidden('You can only delete your own events')
  }

  await prisma.event.delete({ where: { id } })

  await logAction(req.user!.id, 'EVENT_DELETED', 'Event', id, {}, req)

  successResponse(res, { message: 'Event deleted' })
}))

router.post('/:id/register', validateParams(idParamSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params

  const event = await prisma.event.findUnique({
    where: { id },
    include: { _count: { select: { registrations: { where: { status: RegistrationStatus.REGISTERED } } } } },
  })
  if (!event) throw AppError.notFound('Event not found')

  if (event.status !== EventStatus.PUBLISHED) {
    throw AppError.badRequest('Event is not open for registration')
  }

  if (event.startDate < new Date()) {
    throw AppError.badRequest('Event has already started')
  }

  if (event.capacity && event._count.registrations >= event.capacity) {
    throw AppError.badRequest('Event is full')
  }

  const existing = await prisma.eventRegistration.findUnique({
    where: { eventId_userId: { eventId: id, userId: req.user!.id } },
  })

  if (existing) {
    if (existing.status === RegistrationStatus.CANCELLED) {
      await prisma.eventRegistration.update({
        where: { id: existing.id },
        data: { status: RegistrationStatus.REGISTERED, cancelledAt: null },
      })
      return successResponse(res, { message: 'Registration restored' })
    }
    throw AppError.conflict('Already registered for this event')
  }

  await prisma.eventRegistration.create({
    data: { eventId: id, userId: req.user!.id, status: RegistrationStatus.REGISTERED },
  })

  await logAction(req.user!.id, 'EVENT_REGISTERED', 'EventRegistration', id, { eventId: id }, req)

  createdResponse(res, { message: 'Registered successfully' })
}))

router.delete('/:id/register', validateParams(idParamSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params

  const registration = await prisma.eventRegistration.findUnique({
    where: { eventId_userId: { eventId: id, userId: req.user!.id } },
  })

  if (!registration || registration.status === RegistrationStatus.CANCELLED) {
    throw AppError.notFound('Registration not found')
  }

  await prisma.eventRegistration.update({
    where: { id: registration.id },
    data: { status: RegistrationStatus.CANCELLED, cancelledAt: new Date() },
  })

  await logAction(req.user!.id, 'EVENT_REGISTRATION_CANCELLED', 'EventRegistration', registration.id, { eventId: id }, req)

  successResponse(res, { message: 'Registration cancelled' })
}))

router.get('/:id/registrations', validateParams(idParamSchema), requirePermission('events:read'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params
  const { status, page = 1, limit = 20 } = req.query as any

  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) throw AppError.notFound('Event not found')

  const isOrganizer = event.organizerId === req.user!.id
  const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'EVENT_MANAGER'].includes(req.user!.role)

  if (!isOrganizer && !isAdmin) {
    throw AppError.forbidden('You can only view registrations for your own events')
  }

  const where: any = { eventId: id }
  if (status) where.status = status

  const [registrations, total] = await Promise.all([
    prisma.eventRegistration.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      orderBy: { registeredAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.eventRegistration.count({ where }),
  ])

  paginatedResponse(res, registrations, total, page, limit)
}))

router.patch('/:id/registrations/:registrationId', validateParams(idParamSchema), requirePermission('events:manage'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { registrationId } = req.params
  const { status } = req.body

  const registration = await prisma.eventRegistration.findUnique({ where: { id: registrationId } })
  if (!registration) throw AppError.notFound('Registration not found')

  const updated = await prisma.eventRegistration.update({
    where: { id: registrationId },
    data: { status, attendedAt: status === 'ATTENDED' ? new Date() : null },
  })

  await logAction(req.user!.id, 'EVENT_REGISTRATION_STATUS_CHANGED', 'EventRegistration', registrationId, { newStatus: status }, req)

  successResponse(res, { registration: updated })
}))

export default router