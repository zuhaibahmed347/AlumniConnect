import { Router } from 'express'
import { prisma } from '../utils/prisma'
import { validateQuery, validateParams } from '../middleware/validation'
import { asyncHandler } from '../utils/asyncHandler'
import { successResponse, paginatedResponse } from '../utils/response'
import { AppError } from '../utils/errors'
import { alumniFiltersSchema, idParamSchema } from '@alumni-connect/shared'
import { AuthenticatedRequest } from '../middleware/auth'

const router = Router()

router.get('/', validateQuery(alumniFiltersSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { search, graduationYear, degree, major, location, industry, skills, page, limit, sortBy, sortOrder } = req.query as any

  const where: any = {
    user: { status: 'ACTIVE' },
    isPublic: true,
  }

  if (search) {
    where.OR = [
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { headline: { contains: search, mode: 'insensitive' } },
      { bio: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (graduationYear) where.graduationYear = parseInt(graduationYear)
  if (degree) where.degree = { contains: degree, mode: 'insensitive' }
  if (major) where.major = { contains: major, mode: 'insensitive' }
  if (location) where.location = { contains: location, mode: 'insensitive' }
  if (industry) {
    where.experiences = { some: { company: { contains: industry, mode: 'insensitive' } } }
  }
  if (skills && skills.length > 0) {
    where.profileSkills = { some: { skill: { name: { in: skills } } } }
  }

  const [profiles, total] = await Promise.all([
    prisma.profile.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, email: true } },
        profileSkills: { include: { skill: true }, take: 5 },
        experiences: { take: 1, orderBy: { startDate: 'desc' } },
      },
      orderBy: { [sortBy || 'user.createdAt']: sortOrder || 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.profile.count({ where }),
  ])

  paginatedResponse(res, profiles, total, page, limit)
}))

router.get('/:id', validateParams(idParamSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const profile = await prisma.profile.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, email: true, role: true, createdAt: true } },
      educations: { orderBy: { startYear: 'desc' } },
      experiences: { orderBy: { startDate: 'desc' } },
      profileSkills: { include: { skill: true } },
    },
  })

  if (!profile) throw AppError.notFound('Profile not found')

  if (!profile.isPublic && profile.userId !== req.user?.id) {
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(req.user?.role || '')
    if (!isAdmin) throw AppError.forbidden('Profile is private')
  }

  const isOwnProfile = profile.userId === req.user?.id
  const showEmail = profile.showEmail || isOwnProfile
  const showPhone = profile.showPhone || isOwnProfile

  successResponse(res, { profile: { ...profile, user: { ...profile.user, email: showEmail ? profile.user.email : undefined } } })
}))

router.get('/skills/all', asyncHandler(async (req, res) => {
  const skills = await prisma.skill.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, category: true },
  })

  successResponse(res, { skills })
}))

export default router