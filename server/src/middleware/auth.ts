import { Request, Response, NextFunction } from 'express'
import { prisma } from '../utils/prisma'
import { verifyAccessToken } from '../utils/jwt'
import { AppError } from '../utils/errors'
import { UserRole, UserStatus } from '@alumni-connect/shared'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    name: string
    role: UserRole
    status: UserStatus
  }
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      throw AppError.unauthorized('No token provided')
    }

    const token = authHeader.split(' ')[1]
    const payload = verifyAccessToken(token)

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true, status: true, emailVerified: true },
    })

    if (!user) {
      throw AppError.unauthorized('User not found')
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw AppError.forbidden('Account is not active')
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    }

    next()
  } catch (error) {
    next(error)
  }
}

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return next()
    }

    const token = authHeader.split(' ')[1]
    const payload = verifyAccessToken(token)

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true, status: true },
    })

    if (user && user.status === UserStatus.ACTIVE) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      }
    }

    next()
  } catch {
    next()
  }
}

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required')
    }

    if (!roles.includes(req.user.role)) {
      throw AppError.forbidden('Insufficient permissions')
    }

    next()
  }
}

export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required')
    }

    // Super admin has all permissions
    if (req.user.role === UserRole.SUPER_ADMIN) {
      return next()
    }

    // Check role-based permissions
    const rolePermissions: Record<UserRole, string[]> = {
      [UserRole.SUPER_ADMIN]: ['*'],
      [UserRole.ADMIN]: [
        'users:read', 'users:write', 'users:delete', 'users:manage-roles',
        'events:read', 'events:write', 'events:delete', 'events:manage',
        'jobs:read', 'jobs:write', 'jobs:delete', 'jobs:manage',
        'announcements:read', 'announcements:write', 'announcements:delete', 'announcements:manage',
        'moderation:read', 'moderation:write',
        'analytics:read', 'settings:read', 'settings:write',
      ],
      [UserRole.EVENT_MANAGER]: [
        'events:read', 'events:write', 'events:manage', 'users:read',
      ],
      [UserRole.MODERATOR]: [
        'users:read', 'users:write', 'moderation:read', 'moderation:write', 'announcements:read',
      ],
      [UserRole.MENTORSHIP_MANAGER]: [
        'mentorship:read', 'mentorship:write', 'mentorship:manage', 'users:read',
      ],
      [UserRole.MEMBER]: [
        'profile:read', 'profile:write', 'events:read', 'events:register',
        'jobs:read', 'jobs:apply', 'mentorship:read', 'mentorship:request',
        'messages:read', 'messages:write', 'notifications:read', 'announcements:read',
      ],
    }

    const permissions = rolePermissions[req.user.role] || []
    if (!permissions.includes('*') && !permissions.includes(permission)) {
      throw AppError.forbidden(`Permission required: ${permission}`)
    }

    next()
  }
}

export const requireOwnershipOrAdmin = (getResourceUserId: (req: AuthenticatedRequest) => Promise<string>) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required')
    }

    if (req.user.role === UserRole.SUPER_ADMIN || req.user.role === UserRole.ADMIN) {
      return next()
    }

    const resourceUserId = await getResourceUserId(req)
    if (resourceUserId !== req.user.id) {
      throw AppError.forbidden('You can only access your own resources')
    }

    next()
  }
}