import { z } from 'zod'
import { UserRole, UserStatus, EventStatus, JobStatus, EmploymentType, MentorshipStatus, AnnouncementPriority } from './types'

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 100
export const PASSWORD_UPPERCASE_REGEX = /[A-Z]/
export const PASSWORD_LOWERCASE_REGEX = /[a-z]/
export const PASSWORD_NUMBER_REGEX = /[0-9]/
export const PASSWORD_SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>_\-=+[\]\\;/~`']/

export const strongPasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`)
  .regex(PASSWORD_UPPERCASE_REGEX, 'Password must include at least one uppercase letter (A-Z)')
  .regex(PASSWORD_LOWERCASE_REGEX, 'Password must include at least one lowercase letter (a-z)')
  .regex(PASSWORD_NUMBER_REGEX, 'Password must include at least one number (0-9)')
  .regex(
    PASSWORD_SPECIAL_CHAR_REGEX,
    'Password must include at least one special character (!@#$%^&*)',
  )

export interface PasswordStrengthEvaluation {
  hasMinLength: boolean
  hasMixedCase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
  passwordsMatch: boolean
  passedCount: number
  totalRules: number
  isStrong: boolean
}

export function evaluatePasswordStrength(
  password: string,
  confirmPassword?: string,
): PasswordStrengthEvaluation {
  const hasMinLength = password.length >= PASSWORD_MIN_LENGTH
  const hasMixedCase =
    PASSWORD_UPPERCASE_REGEX.test(password) &&
    PASSWORD_LOWERCASE_REGEX.test(password)
  const hasNumber = PASSWORD_NUMBER_REGEX.test(password)
  const hasSpecialChar = PASSWORD_SPECIAL_CHAR_REGEX.test(password)
  const hasConfirm = typeof confirmPassword === 'string'
  const passwordsMatch = hasConfirm
    ? hasMinLength && password === confirmPassword
    : true

  const ruleResults = hasConfirm
    ? [hasMinLength, hasMixedCase, hasNumber, hasSpecialChar, passwordsMatch]
    : [hasMinLength, hasMixedCase, hasNumber, hasSpecialChar]

  const passedCount = ruleResults.filter(Boolean).length

  return {
    hasMinLength,
    hasMixedCase,
    hasNumber,
    hasSpecialChar,
    passwordsMatch,
    passedCount,
    totalRules: ruleResults.length,
    isStrong: hasMinLength && hasMixedCase && hasNumber && hasSpecialChar,
  }
}

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: strongPasswordSchema,
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(6, 'Valid recovery verification token is required'),
  password: strongPasswordSchema,
})

export const resetPasswordConfirmSchema = resetPasswordSchema
  .extend({
    confirmPassword: z.string().min(1, 'Confirm your password is required'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: strongPasswordSchema,
})

export const changePasswordConfirmSchema = changePasswordSchema
  .extend({
    confirmPassword: z.string().min(1, 'Confirm your password is required'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })


export const updateProfileSchema = z.object({
  headline: z.string().max(200).optional(),
  bio: z.string().max(2000).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedinUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  twitterUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  graduationYear: z.number().int().min(1950).max(new Date().getFullYear() + 5).optional(),
  degree: z.string().max(100).optional(),
  major: z.string().max(100).optional(),
  isPublic: z.boolean().optional(),
  showEmail: z.boolean().optional(),
  showPhone: z.boolean().optional(),
})

export const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().max(300).optional(),
  coverImageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
  timezone: z.string().min(1, 'Timezone is required'),
  location: z.string().max(200).optional(),
  isVirtual: z.boolean(),
  virtualUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  capacity: z.number().int().min(1).optional(),
})

export const updateEventSchema = createEventSchema.partial().extend({
  status: z.nativeEnum(EventStatus).optional(),
})

export const createJobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  company: z.string().min(2, 'Company name is required').max(100),
  companyLogoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  companyWebsite: z.string().url('Invalid URL').optional().or(z.literal('')),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  location: z.string().max(200).optional(),
  isRemote: z.boolean(),
  employmentType: z.nativeEnum(EmploymentType),
  salaryMin: z.number().int().min(0).optional(),
  salaryMax: z.number().int().min(0).optional(),
  salaryCurrency: z.string().length(3).default('USD'),
  expiresAt: z.string().datetime('Invalid date').optional(),
  externalApplyUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
})

export const updateJobSchema = createJobSchema.partial().extend({
  status: z.nativeEnum(JobStatus).optional(),
})

export const createMentorshipProfileSchema = z.object({
  headline: z.string().min(5, 'Headline must be at least 5 characters').max(200),
  bio: z.string().min(20, 'Bio must be at least 20 characters').max(3000),
  expertise: z.array(z.string().min(1)).min(1, 'At least one area of expertise is required').max(10),
  industries: z.array(z.string().min(1)).min(1, 'At least one industry is required').max(10),
  maxMentees: z.number().int().min(1).max(20).default(3),
  meetingFrequency: z.string().max(100).optional(),
  preferredFormat: z.string().max(100).optional(),
})

export const updateMentorshipProfileSchema = createMentorshipProfileSchema.partial().extend({
  isAvailable: z.boolean().optional(),
})

export const createMentorshipRequestSchema = z.object({
  mentorId: z.string().uuid('Invalid mentor ID'),
  message: z.string().min(20, 'Message must be at least 20 characters').max(2000),
})

export const respondToMentorshipRequestSchema = z.object({
  requestId: z.string().uuid('Invalid request ID'),
  status: z.enum([MentorshipStatus.ACCEPTED, MentorshipStatus.REJECTED]),
})

export const createConversationSchema = z.object({
  type: z.enum(['DIRECT', 'GROUP']),
  name: z.string().max(100).optional(),
  participantIds: z.array(z.string().uuid()).min(1, 'At least one participant is required'),
})

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID'),
  content: z.string().min(1, 'Message cannot be empty').max(10000),
  messageType: z.enum(['TEXT', 'IMAGE', 'FILE']).default('TEXT'),
  metadata: z.record(z.unknown()).optional(),
})

export const createAnnouncementSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  content: z.string().min(10, 'Content must be at least 10 characters').max(10000),
  priority: z.nativeEnum(AnnouncementPriority).default(AnnouncementPriority.NORMAL),
  expiresAt: z.string().datetime('Invalid date').optional(),
  targetRoles: z.array(z.nativeEnum(UserRole)).optional(),
})

export const updateAnnouncementSchema = createAnnouncementSchema.partial().extend({
  isPublished: z.boolean().optional(),
})

export const userFiltersSchema = z.object({
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  graduationYear: z.number().int().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const eventFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(EventStatus).optional(),
  isVirtual: z.boolean().optional(),
  startDateFrom: z.string().datetime().optional(),
  startDateTo: z.string().datetime().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const jobFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(JobStatus).optional(),
  employmentType: z.nativeEnum(EmploymentType).optional(),
  isRemote: z.boolean().optional(),
  location: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const alumniFiltersSchema = z.object({
  search: z.string().optional(),
  graduationYear: z.number().int().optional(),
  degree: z.string().optional(),
  major: z.string().optional(),
  location: z.string().optional(),
  industry: z.string().optional(),
  skills: z.array(z.string()).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const educationSchema = z.object({
  institution: z.string().min(2).max(200),
  degree: z.string().min(2).max(100),
  fieldOfStudy: z.string().max(100).optional(),
  startYear: z.number().int().min(1950).max(new Date().getFullYear() + 5),
  endYear: z.number().int().min(1950).max(new Date().getFullYear() + 5).optional(),
  description: z.string().max(1000).optional(),
  isCurrent: z.boolean().default(false),
})

export const educationUpdateSchema = educationSchema.partial()

export const experienceSchema = z.object({
  company: z.string().min(2).max(200),
  title: z.string().min(2).max(100),
  location: z.string().max(200).optional(),
  employmentType: z.nativeEnum(EmploymentType),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().max(2000).optional(),
})

export const experienceUpdateSchema = experienceSchema.partial()

export const profileSkillSchema = z.object({
  skillId: z.string().uuid('Invalid skill ID'),
  proficiency: z.number().int().min(1).max(5).default(1),
})

export const userUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
})

export const addParticipantSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
})

export const updateMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(10000),
})

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
})

export const slugParamSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
})

export type EducationInput = z.infer<typeof educationSchema>
export type EducationUpdateInput = z.infer<typeof educationUpdateSchema>
export type ExperienceInput = z.infer<typeof experienceSchema>
export type ExperienceUpdateInput = z.infer<typeof experienceUpdateSchema>
export type ProfileSkillInput = z.infer<typeof profileSkillSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>
export type PaginationParams = z.infer<typeof paginationSchema>
export type IdParam = z.infer<typeof idParamSchema>
export type SlugParam = z.infer<typeof slugParamSchema>