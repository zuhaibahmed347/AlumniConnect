import { Router } from 'express'
import { prisma } from '../utils/prisma'
import { asyncHandler } from '../utils/asyncHandler'
import { successResponse } from '../utils/response'
import { AppError } from '../utils/errors'
import { optionalAuth, authenticate, AuthenticatedRequest } from '../middleware/auth'
import { UserRole } from '@alumni-connect/shared'

const router = Router()

const ALLOWED_STATE_KEYS = new Set([
  'jobApplications',
  'employerJobs',
  'employerOrg',
  'connectedAlumniIds',
  'alumniOverrides',
  'mentorshipRequests',
  'shortlistedMentorIds',
  'enrolledTrackIds',
  'eventRsvps',
  'mentorCustomSlots',
  'studentProfile',
  'alumniProfile',
  'moderationQueue',
])

const ADMIN_ONLY_STATE_KEYS = new Set(['moderationQueue'])
const EMPLOYER_OR_ADMIN_STATE_KEYS = new Set(['employerOrg', 'employerJobs'])

function isAdminOrModerator(req: AuthenticatedRequest): boolean {
  if (!req.user) return false
  return ([
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MODERATOR,
  ] as UserRole[]).includes(req.user.role)
}

function isEmployerOrAdmin(req: AuthenticatedRequest): boolean {
  if (!req.user) return false
  return (
    isAdminOrModerator(req) ||
    req.user.role === UserRole.EVENT_MANAGER ||
    req.user.persona === 'EMPLOYER'
  )
}

router.get(
  '/bootstrap',
  optionalAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const isAdmin = isAdminOrModerator(req)

    const [rawPlatformState, events, jobs, notifications, auditLogs] =
      await Promise.all([
        prisma.platformState.getAll(),
        prisma.event.findMany({
          include: {
            organizer: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { startDate: 'asc' },
          take: 30,
        }),
        prisma.job.findMany({
          include: {
            postedBy: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 30,
        }),
        req.user
          ? prisma.notification.findMany({
              where: { userId: req.user.id },
              orderBy: { createdAt: 'desc' },
              take: 25,
            })
          : Promise.resolve([]),
        isAdmin
          ? prisma.auditLog.findMany({
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
              orderBy: { createdAt: 'desc' },
              take: 20,
            })
          : Promise.resolve([]),
      ])

    const platformState: Record<string, unknown> = { ...(rawPlatformState || {}) }
    if (!isAdmin) {
      delete platformState.moderationQueue
    }

    successResponse(res, {
      platformState,
      events,
      jobs,
      notifications,
      auditLogs,
    })
  })
)

router.get(
  '/:key',
  optionalAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { key } = req.params
    if (!ALLOWED_STATE_KEYS.has(key)) {
      throw AppError.badRequest('Unsupported platform state key')
    }

    if (ADMIN_ONLY_STATE_KEYS.has(key) && !isAdminOrModerator(req)) {
      throw AppError.forbidden('Administrative permissions required')
    }

    const value = await prisma.platformState.getKey(key)
    successResponse(res, { key, value })
  })
)

router.put(
  '/:key',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { key } = req.params
    if (!ALLOWED_STATE_KEYS.has(key)) {
      throw AppError.badRequest('Unsupported platform state key')
    }

    if (ADMIN_ONLY_STATE_KEYS.has(key) && !isAdminOrModerator(req)) {
      throw AppError.forbidden('Administrative permissions required to modify this state key')
    }

    if (EMPLOYER_OR_ADMIN_STATE_KEYS.has(key) && !isEmployerOrAdmin(req)) {
      throw AppError.forbidden('Employer or administrator permissions required')
    }

    const value = req.body?.value !== undefined ? req.body.value : req.body
    const saved = await prisma.platformState.setKey(key, value)

    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: `STATE_SYNC_${key.toUpperCase()}`,
          resource: 'PlatformState',
          resourceId: key,
          metadata: { updatedBy: req.user.id },
        },
      })
    }

    successResponse(res, { key, value: saved })
  })
)

export default router
