export const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  EVENT_MANAGER: 'EVENT_MANAGER',
  MODERATOR: 'MODERATOR',
  MENTORSHIP_MANAGER: 'MENTORSHIP_MANAGER',
  MEMBER: 'MEMBER',
} as const
export type UserRole = (typeof UserRole)[keyof typeof UserRole]
export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  SUSPENDED: 'SUSPENDED',
} as const
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus]
export const EventStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const
export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus]
export const RegistrationStatus = {
  REGISTERED: 'REGISTERED',
  CANCELLED: 'CANCELLED',
  WAITLISTED: 'WAITLISTED',
  ATTENDED: 'ATTENDED',
} as const
export type RegistrationStatus = (typeof RegistrationStatus)[keyof typeof RegistrationStatus]
export const JobStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  FILLED: 'FILLED',
  ARCHIVED: 'ARCHIVED',
} as const
export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus]
export const EmploymentType = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACT',
  INTERNSHIP: 'INTERNSHIP',
  FREELANCE: 'FREELANCE',
  REMOTE: 'REMOTE',
} as const
export type EmploymentType = (typeof EmploymentType)[keyof typeof EmploymentType]
export const MentorshipStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const
export type MentorshipStatus = (typeof MentorshipStatus)[keyof typeof MentorshipStatus]
export const NotificationType = {
  MENTORSHIP_REQUEST: 'MENTORSHIP_REQUEST',
  MENTORSHIP_RESPONSE: 'MENTORSHIP_RESPONSE',
  EVENT_REGISTRATION: 'EVENT_REGISTRATION',
  EVENT_UPDATE: 'EVENT_UPDATE',
  EVENT_REMINDER: 'EVENT_REMINDER',
  JOB_APPLICATION: 'JOB_APPLICATION',
  NEW_MESSAGE: 'NEW_MESSAGE',
  ANNOUNCEMENT: 'ANNOUNCEMENT',
  SYSTEM: 'SYSTEM',
} as const
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]
export const AnnouncementPriority = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const
export type AnnouncementPriority = (typeof AnnouncementPriority)[keyof typeof AnnouncementPriority]
export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  role: UserRole
  status: UserStatus
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
}

export interface Profile {
  id: string
  userId: string
  headline?: string
  bio?: string
  location?: string
  website?: string
  linkedinUrl?: string
  twitterUrl?: string
  githubUrl?: string
  graduationYear?: number
  degree?: string
  major?: string
  isPublic: boolean
  showEmail: boolean
  showPhone: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Education {
  id: string
  profileId: string
  institution: string
  degree: string
  fieldOfStudy?: string
  startYear: number
  endYear?: number
  description?: string
  isCurrent: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Experience {
  id: string
  profileId: string
  company: string
  title: string
  location?: string
  employmentType: EmploymentType
  startDate: Date
  endDate?: Date
  isCurrent: boolean
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface Skill {
  id: string
  name: string
  category?: string
  createdAt: Date
}

export interface ProfileSkill {
  profileId: string
  skillId: string
  proficiency: number
  createdAt: Date
}

export interface Event {
  id: string
  title: string
  slug: string
  description: string
  shortDescription?: string
  coverImageUrl?: string
  startDate: Date
  endDate: Date
  timezone: string
  location?: string
  isVirtual: boolean
  virtualUrl?: string
  capacity?: number
  status: EventStatus
  organizerId: string
  createdAt: Date
  updatedAt: Date
}

export interface EventRegistration {
  id: string
  eventId: string
  userId: string
  status: RegistrationStatus
  registeredAt: Date
  attendedAt?: Date
  cancelledAt?: Date
}

export interface Job {
  id: string
  title: string
  slug: string
  company: string
  companyLogoUrl?: string
  companyWebsite?: string
  description: string
  requirements?: string
  benefits?: string
  location?: string
  isRemote: boolean
  employmentType: EmploymentType
  salaryMin?: number
  salaryMax?: number
  salaryCurrency: string
  status: JobStatus
  postedById: string
  expiresAt?: Date
  externalApplyUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface MentorshipProfile {
  id: string
  userId: string
  headline: string
  bio: string
  expertise: string[]
  industries: string[]
  maxMentees: number
  currentMentees: number
  isAvailable: boolean
  meetingFrequency?: string
  preferredFormat?: string
  createdAt: Date
  updatedAt: Date
}

export interface MentorshipRequest {
  id: string
  mentorId: string
  menteeId: string
  message: string
  status: MentorshipStatus
  requestedAt: Date
  respondedAt?: Date
  startedAt?: Date
  completedAt?: Date
  cancelledAt?: Date
  cancellationReason?: string
}

export interface Conversation {
  id: string
  type: 'DIRECT' | 'GROUP'
  name?: string
  avatarUrl?: string
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface ConversationParticipant {
  id: string
  conversationId: string
  userId: string
  joinedAt: Date
  leftAt?: Date
  isAdmin: boolean
  lastReadAt?: Date
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM'
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
  isRead: boolean
  readAt?: Date
  createdAt: Date
}

export interface Announcement {
  id: string
  title: string
  content: string
  priority: AnnouncementPriority
  authorId: string
  publishedAt?: Date
  expiresAt?: Date
  isPublished: boolean
  targetRoles?: UserRole[]
  createdAt: Date
  updatedAt: Date
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  resource: string
  resourceId?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  meta?: Record<string, unknown>
}

export interface JWTPayload {
  sub: string
  email: string
  role: UserRole
  iat: number
  exp: number
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface RegisterInput {
  email: string
  password: string
  name: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface ForgotPasswordInput {
  email: string
}

export interface ResetPasswordInput {
  token: string
  password: string
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export interface UpdateProfileInput {
  headline?: string
  bio?: string
  location?: string
  website?: string
  linkedinUrl?: string
  twitterUrl?: string
  githubUrl?: string
  graduationYear?: number
  degree?: string
  major?: string
  isPublic?: boolean
  showEmail?: boolean
  showPhone?: boolean
}

export interface CreateEventInput {
  title: string
  description: string
  shortDescription?: string
  coverImageUrl?: string
  startDate: string
  endDate: string
  timezone: string
  location?: string
  isVirtual: boolean
  virtualUrl?: string
  capacity?: number
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  status?: EventStatus
}

export interface CreateJobInput {
  title: string
  company: string
  companyLogoUrl?: string
  companyWebsite?: string
  description: string
  requirements?: string
  benefits?: string
  location?: string
  isRemote: boolean
  employmentType: EmploymentType
  salaryMin?: number
  salaryMax?: number
  salaryCurrency?: string
  expiresAt?: string
  externalApplyUrl?: string
}

export interface UpdateJobInput extends Partial<CreateJobInput> {
  status?: JobStatus
}

export interface CreateMentorshipProfileInput {
  headline: string
  bio: string
  expertise: string[]
  industries: string[]
  maxMentees?: number
  meetingFrequency?: string
  preferredFormat?: string
}

export interface UpdateMentorshipProfileInput extends Partial<CreateMentorshipProfileInput> {
  isAvailable?: boolean
}

export interface CreateMentorshipRequestInput {
  mentorId: string
  message: string
}

export interface RespondToMentorshipRequestInput {
  requestId: string
  status: typeof MentorshipStatus.ACCEPTED | typeof MentorshipStatus.REJECTED
}

export interface CreateConversationInput {
  type: 'DIRECT' | 'GROUP'
  name?: string
  participantIds: string[]
}

export interface SendMessageInput {
  conversationId: string
  content: string
  messageType?: 'TEXT' | 'IMAGE' | 'FILE'
  metadata?: Record<string, unknown>
}

export interface CreateAnnouncementInput {
  title: string
  content: string
  priority?: AnnouncementPriority
  expiresAt?: string
  targetRoles?: UserRole[]
}

export interface UpdateAnnouncementInput extends Partial<CreateAnnouncementInput> {
  isPublished?: boolean
}

export interface UserFilters {
  search?: string
  role?: UserRole
  status?: UserStatus
  graduationYear?: number
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface EventFilters {
  search?: string
  status?: EventStatus
  isVirtual?: boolean
  startDateFrom?: string
  startDateTo?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface JobFilters {
  search?: string
  status?: JobStatus
  employmentType?: EmploymentType
  isRemote?: boolean
  location?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface AlumniFilters {
  search?: string
  graduationYear?: number
  degree?: string
  major?: string
  location?: string
  industry?: string
  skills?: string[]
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}