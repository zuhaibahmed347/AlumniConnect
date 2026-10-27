import { Router } from 'express'
import { prisma } from '../utils/prisma'
import { validateParams, validateBody } from '../middleware/validation'
import { asyncHandler } from '../utils/asyncHandler'
import { successResponse, errorResponse, createdResponse } from '../utils/response'
import { AppError } from '../utils/errors'
import { idParamSchema, updateProfileSchema, educationSchema, educationUpdateSchema, experienceSchema, experienceUpdateSchema, profileSkillSchema } from '@alumni-connect/shared'
import { requireOwnershipOrAdmin } from '../middleware/auth'
import { logAction } from '../middleware/auditLog'
import { AuthenticatedRequest } from '../middleware/auth'
import { sanitizeUserGeneratedContent } from '../utils/sanitize'
import { z } from 'zod'

const router = Router()

const skillIdParamSchema = z.object({
  skillId: z.string().min(1, 'Skill ID is required'),
})

router.get('/me', asyncHandler(async (req: AuthenticatedRequest, res) => {
  let profile = await prisma.profile.findUnique({
    where: { userId: req.user!.id },
    include: {
      educations: { orderBy: { startYear: 'desc' } },
      experiences: { orderBy: { startDate: 'desc' } },
      profileSkills: { include: { skill: true } },
    },
  })

  if (!profile) {
    profile = await prisma.profile.create({
      data: { userId: req.user!.id },
      include: {
        educations: true,
        experiences: true,
        profileSkills: { include: { skill: true } },
      },
    })
  }

  successResponse(res, { profile })
}))

router.get('/:id', validateParams(idParamSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const profile = await prisma.profile.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, email: true, role: true } },
      educations: { orderBy: { startYear: 'desc' } },
      experiences: { orderBy: { startDate: 'desc' } },
      profileSkills: { include: { skill: true } },
    },
  })

  if (!profile) throw AppError.notFound('Profile not found')

  const isAdmin = (['SUPER_ADMIN', 'ADMIN'] as string[]).includes(req.user?.role || '')
  if (!profile.isPublic && profile.userId !== req.user?.id && !isAdmin) {
    throw AppError.forbidden('Profile is private')
  }

  const canSeeEmail = profile.showEmail || profile.userId === req.user?.id || isAdmin
  const sanitizedProfile = {
    ...profile,
    user: profile.user
      ? {
          ...profile.user,
          email: canSeeEmail ? profile.user.email : undefined,
        }
      : profile.user,
  }

  successResponse(res, { profile: sanitizedProfile })
}))

router.patch('/me', validateBody(updateProfileSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const sanitizedData = sanitizeUserGeneratedContent(req.body, {
    plainTextFields: ['headline', 'bio', 'location', 'website', 'linkedinUrl', 'githubUrl', 'twitterUrl', 'phone'],
  })

  const profile = await prisma.profile.upsert({
    where: { userId: req.user!.id },
    create: { userId: req.user!.id, ...sanitizedData },
    update: sanitizedData,
    include: {
      educations: true,
      experiences: true,
      profileSkills: { include: { skill: true } },
    },
  })

  await logAction(req.user!.id, 'PROFILE_UPDATED', 'Profile', profile.id, sanitizedData, req)

  successResponse(res, { profile })
}))

router.post('/me/education', validateBody(educationSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const profile = await prisma.profile.findUniqueOrThrow({ where: { userId: req.user!.id } })
  const sanitizedData = sanitizeUserGeneratedContent(req.body, {
    plainTextFields: ['institution', 'degree', 'fieldOfStudy', 'description'],
  })

  const education = await prisma.education.create({
    data: { profileId: profile.id, ...sanitizedData },
  })

  await logAction(req.user!.id, 'EDUCATION_ADDED', 'Education', education.id, sanitizedData, req)

  createdResponse(res, { education })
}))

router.patch('/me/education/:id', validateParams(idParamSchema), validateBody(educationUpdateSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params

  const education = await prisma.education.findUnique({ where: { id } })
  if (!education) throw AppError.notFound('Education not found')

  const profile = await prisma.profile.findUniqueOrThrow({ where: { userId: req.user!.id } })
  if (education.profileId !== profile.id) throw AppError.forbidden('Not your education')

  const sanitizedData = sanitizeUserGeneratedContent(req.body, {
    plainTextFields: ['institution', 'degree', 'fieldOfStudy', 'description'],
  })

  const updated = await prisma.education.update({
    where: { id },
    data: sanitizedData,
  })

  await logAction(req.user!.id, 'EDUCATION_UPDATED', 'Education', id, sanitizedData, req)

  successResponse(res, { education: updated })
}))

router.delete('/me/education/:id', validateParams(idParamSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params

  const education = await prisma.education.findUnique({ where: { id } })
  if (!education) throw AppError.notFound('Education not found')

  const profile = await prisma.profile.findUniqueOrThrow({ where: { userId: req.user!.id } })
  if (education.profileId !== profile.id) throw AppError.forbidden('Not your education')

  await prisma.education.delete({ where: { id } })

  await logAction(req.user!.id, 'EDUCATION_DELETED', 'Education', id, {}, req)

  successResponse(res, { message: 'Education deleted' })
}))

router.post('/me/experience', validateBody(experienceSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const profile = await prisma.profile.findUniqueOrThrow({ where: { userId: req.user!.id } })
  const sanitizedData = sanitizeUserGeneratedContent(req.body, {
    plainTextFields: ['company', 'title', 'location', 'description'],
  })

  const experience = await prisma.experience.create({
    data: { profileId: profile.id, ...sanitizedData },
  })

  await logAction(req.user!.id, 'EXPERIENCE_ADDED', 'Experience', experience.id, sanitizedData, req)

  createdResponse(res, { experience })
}))

router.patch('/me/experience/:id', validateParams(idParamSchema), validateBody(experienceUpdateSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params

  const experience = await prisma.experience.findUnique({ where: { id } })
  if (!experience) throw AppError.notFound('Experience not found')

  const profile = await prisma.profile.findUniqueOrThrow({ where: { userId: req.user!.id } })
  if (experience.profileId !== profile.id) throw AppError.forbidden('Not your experience')

  const sanitizedData = sanitizeUserGeneratedContent(req.body, {
    plainTextFields: ['company', 'title', 'location', 'description'],
  })

  const updated = await prisma.experience.update({
    where: { id },
    data: sanitizedData,
  })

  await logAction(req.user!.id, 'EXPERIENCE_UPDATED', 'Experience', id, sanitizedData, req)

  successResponse(res, { experience: updated })
}))

router.delete('/me/experience/:id', validateParams(idParamSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params

  const experience = await prisma.experience.findUnique({ where: { id } })
  if (!experience) throw AppError.notFound('Experience not found')

  const profile = await prisma.profile.findUniqueOrThrow({ where: { userId: req.user!.id } })
  if (experience.profileId !== profile.id) throw AppError.forbidden('Not your experience')

  await prisma.experience.delete({ where: { id } })

  await logAction(req.user!.id, 'EXPERIENCE_DELETED', 'Experience', id, {}, req)

  successResponse(res, { message: 'Experience deleted' })
}))

router.post('/me/skills', validateBody(profileSkillSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const profile = await prisma.profile.findUniqueOrThrow({ where: { userId: req.user!.id } })
  const { skillId, proficiency } = req.body

  const skill = await prisma.skill.findUnique({ where: { id: skillId } })
  if (!skill) throw AppError.notFound('Skill not found')

  const profileSkill = await prisma.profileSkill.upsert({
    where: { profileId_skillId: { profileId: profile.id, skillId } },
    create: { profileId: profile.id, skillId, proficiency: proficiency || 1 },
    update: { proficiency: proficiency || 1 },
    include: { skill: true },
  })

  await logAction(req.user!.id, 'SKILL_ADDED', 'ProfileSkill', profileSkill.skillId, { proficiency }, req)

  createdResponse(res, { profileSkill })
}))

router.delete('/me/skills/:skillId', validateParams(skillIdParamSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { skillId } = req.params

  const profile = await prisma.profile.findUniqueOrThrow({ where: { userId: req.user!.id } })

  await prisma.profileSkill.delete({
    where: { profileId_skillId: { profileId: profile.id, skillId } },
  })

  await logAction(req.user!.id, 'SKILL_REMOVED', 'ProfileSkill', skillId, {}, req)

  successResponse(res, { message: 'Skill removed' })
}))

export default router