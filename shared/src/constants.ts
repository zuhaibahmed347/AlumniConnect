import { UserRole } from './types'

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 100,
  [UserRole.ADMIN]: 80,
  [UserRole.EVENT_MANAGER]: 60,
  [UserRole.MODERATOR]: 50,
  [UserRole.MENTORSHIP_MANAGER]: 50,
  [UserRole.MEMBER]: 10,
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: ['*'],
  [UserRole.ADMIN]: [
    'users:read',
    'users:write',
    'users:delete',
    'users:manage-roles',
    'events:read',
    'events:write',
    'events:delete',
    'events:manage',
    'jobs:read',
    'jobs:write',
    'jobs:delete',
    'jobs:manage',
    'announcements:read',
    'announcements:write',
    'announcements:delete',
    'announcements:manage',
    'moderation:read',
    'moderation:write',
    'analytics:read',
    'settings:read',
    'settings:write',
  ],
  [UserRole.EVENT_MANAGER]: [
    'events:read',
    'events:write',
    'events:manage',
    'users:read',
  ],
  [UserRole.MODERATOR]: [
    'users:read',
    'users:write',
    'moderation:read',
    'moderation:write',
    'announcements:read',
  ],
  [UserRole.MENTORSHIP_MANAGER]: [
    'mentorship:read',
    'mentorship:write',
    'mentorship:manage',
    'users:read',
  ],
  [UserRole.MEMBER]: [
    'profile:read',
    'profile:write',
    'events:read',
    'events:register',
    'jobs:read',
    'jobs:apply',
    'mentorship:read',
    'mentorship:request',
    'messages:read',
    'messages:write',
    'notifications:read',
    'announcements:read',
  ],
}

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  maxLimit: 100,
}

export const JWT_CONFIG = {
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  issuer: 'alumni-connect',
  audience: 'alumni-connect-api',
}

export const RATE_LIMITS = {
  auth: { windowMs: 15 * 60 * 1000, max: 10 },
  api: { windowMs: 60 * 1000, max: 100 },
  upload: { windowMs: 60 * 1000, max: 10 },
}

export const FILE_UPLOAD = {
  maxSize: 10 * 1024 * 1024,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.pdf'],
}

export const VALIDATION = {
  passwordMinLength: 8,
  passwordMaxLength: 128,
  nameMinLength: 2,
  nameMaxLength: 100,
  bioMaxLength: 2000,
  headlineMaxLength: 200,
  messageMaxLength: 10000,
  announcementMaxLength: 10000,
}

export const MENTORSHIP = {
  defaultMaxMentees: 3,
  maxMenteesLimit: 20,
  minMessageLength: 20,
  maxMessageLength: 2000,
}

export const EVENT = {
  maxTitleLength: 200,
  maxDescriptionLength: 10000,
  maxShortDescriptionLength: 300,
  maxCapacity: 10000,
}

export const JOB = {
  maxTitleLength: 200,
  maxDescriptionLength: 10000,
  maxRequirementsLength: 5000,
  maxBenefitsLength: 5000,
  salaryCurrency: 'USD',
}

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:
    (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env
      ?.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

export const REFRESH_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  path: '/api/auth/refresh',
}

export const AVATAR_SIZES = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  '2xl': 96,
  '3xl': 128,
} as const

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 700,
} as const

export const Z_INDEX = {
  dropdown: 100,
  sticky: 200,
  modal: 300,
  popover: 400,
  toast: 500,
  tooltip: 600,
} as const