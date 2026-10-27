import { Router } from 'express'
import { prisma } from '../utils/prisma'
import { validateQuery, validateParams, validateBody } from '../middleware/validation'
import { asyncHandler } from '../utils/asyncHandler'
import { successResponse, paginatedResponse } from '../utils/response'
import { AppError } from '../utils/errors'
import { userFiltersSchema, idParamSchema, userUpdateSchema, UserRole } from '@alumni-connect/shared'
import { requirePermission, AuthenticatedRequest } from '../middleware/auth'
import { logAction } from '../middleware/auditLog'

const router = Router()

router.get(
  '/',
  validateQuery(userFiltersSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { search, role, status, page, limit, sortBy, sortOrder } = req.query as any
    const isAdmin = ([UserRole.SUPER_ADMIN, UserRole.ADMIN] as UserRole[]).includes(
      req.user!.role
    )

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        ...(isAdmin ? [{ email: { contains: search, mode: 'insensitive' } }] : []),
      ]
    }
    if (role) where.role = role
    if (status) where.status = status

    const [rawUsers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          role: true,
          status: true,
          emailVerified: true,
          createdAt: true,
          lastLoginAt: true,
          profile: {
            select: {
              headline: true,
              graduationYear: true,
              location: true,
              isPublic: true,
              showEmail: true,
            },
          },
        },
        orderBy: { [sortBy || 'createdAt']: sortOrder || 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    const sanitizedUsers = rawUsers.map((u: any) => {
      const canSeeEmail =
        isAdmin || u.id === req.user!.id || u.profile?.showEmail !== false
      return {
        ...u,
        email: canSeeEmail ? u.email : undefined,
      }
    })

    paginatedResponse(res, sanitizedUsers, total, page, limit)
  })
)

router.get(
  '/:id',
  validateParams(idParamSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        lastLoginAt: true,
        profile: {
          include: {
            educations: true,
            experiences: true,
            profileSkills: { include: { skill: true } },
          },
        },
      },
    })

    if (!user) throw AppError.notFound('User not found')

    const isSelf = user.id === req.user!.id
    const isAdmin = ([UserRole.SUPER_ADMIN, UserRole.ADMIN] as UserRole[]).includes(
      req.user!.role
    )

    if (user.profile && !user.profile.isPublic && !isSelf && !isAdmin) {
      throw AppError.forbidden('This user profile is private')
    }

    const canSeeEmail = isSelf || isAdmin || user.profile?.showEmail !== false
    const safeUser = {
      ...user,
      email: canSeeEmail ? user.email : undefined,
    }

    successResponse(res, { user: safeUser })
  })
)

router.patch(
  '/:id',
  validateParams(idParamSchema),
  validateBody(userUpdateSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params
    const isSelf = req.user!.id === id
    const isAdmin = ([UserRole.SUPER_ADMIN, UserRole.ADMIN] as UserRole[]).includes(
      req.user!.role
    )

    if (!isSelf && !isAdmin) {
      throw AppError.forbidden('You can only update your own profile')
    }

    // Prevent self-privilege escalation or account status tampering
    if (!isAdmin && (req.body.role !== undefined || req.body.status !== undefined)) {
      throw AppError.forbidden('Only administrators can modify user roles or account status')
    }

    if (
      req.body.role === UserRole.SUPER_ADMIN &&
      req.user!.role !== UserRole.SUPER_ADMIN
    ) {
      throw AppError.forbidden('Only super admins can assign super admin role')
    }

    const safeData: Record<string, unknown> = {}
    if (typeof req.body.name === 'string') safeData.name = req.body.name.trim()
    if (typeof req.body.avatarUrl === 'string') safeData.avatarUrl = req.body.avatarUrl.trim()
    if (isAdmin && req.body.role) safeData.role = req.body.role
    if (isAdmin && req.body.status) safeData.status = req.body.status

    const user = await prisma.user.update({
      where: { id },
      data: safeData,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        status: true,
      },
    })

    await logAction(req.user!.id, 'USER_UPDATED', 'User', id, safeData, req)

    successResponse(res, { user })
  })
)

router.delete(
  '/:id',
  validateParams(idParamSchema),
  requirePermission('users:delete'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params

    if (id === req.user!.id) {
      throw AppError.badRequest('Cannot delete your own account via admin endpoint')
    }

    const target = await prisma.user.findUnique({ where: { id } })
    if (!target) throw AppError.notFound('User not found')

    if (
      target.role === UserRole.SUPER_ADMIN &&
      req.user!.role !== UserRole.SUPER_ADMIN
    ) {
      throw AppError.forbidden('Cannot delete a super administrator account')
    }

    await prisma.user.delete({ where: { id } })

    await logAction(req.user!.id, 'USER_DELETED', 'User', id, {}, req)

    successResponse(res, { message: 'User deleted' })
  })
)

router.post(
  '/:id/role',
  validateParams(idParamSchema),
  requirePermission('users:manage-roles'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params
    const { role } = req.body

    if (!Object.values(UserRole).includes(role as UserRole)) {
      throw AppError.badRequest('Invalid role')
    }

    if (role === UserRole.SUPER_ADMIN && req.user!.role !== UserRole.SUPER_ADMIN) {
      throw AppError.forbidden('Only super admins can assign super admin role')
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    })

    await logAction(req.user!.id, 'USER_ROLE_CHANGED', 'User', id, { newRole: role }, req)

    successResponse(res, { user })
  })
)

router.post(
  '/:id/status',
  validateParams(idParamSchema),
  requirePermission('users:write'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params
    const { status } = req.body

    const user = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, email: true, name: true, status: true },
    })

    await logAction(
      req.user!.id,
      'USER_STATUS_CHANGED',
      'User',
      id,
      { newStatus: status },
      req
    )

    successResponse(res, { user })
  })
)

export default router