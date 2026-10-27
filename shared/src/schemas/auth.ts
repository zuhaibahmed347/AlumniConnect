import { z } from 'zod'

/**
 * Supported platform personas across the authentication showcase,
 * role-based sign-in portal, and registration flows.
 */
export const AUTH_PERSONAS = [
  'STUDENT',
  'ALUMNI',
  'MENTOR',
  'EMPLOYER',
  'ADMIN',
] as const

/**
 * Self-service registration personas (excludes administrative staff accounts
 * which require institutional provisioning).
 */
export const REGISTRATION_PERSONAS = [
  'STUDENT',
  'ALUMNI',
  'MENTOR',
  'EMPLOYER',
] as const

export const authPersonaSchema = z.enum(AUTH_PERSONAS, {
  errorMap: () => ({
    message:
      'Invalid persona selection. Expected STUDENT, ALUMNI, MENTOR, EMPLOYER, or ADMIN.',
  }),
})

export const registrationPersonaSchema = z.enum(REGISTRATION_PERSONAS, {
  errorMap: () => ({
    message:
      'Invalid registration persona. Expected STUDENT, ALUMNI, MENTOR, or EMPLOYER.',
  }),
})

export const personaSelectionSchema = z.object({
  persona: authPersonaSchema,
})

export type AuthPersona = z.infer<typeof authPersonaSchema>
export type RegistrationPersona = z.infer<typeof registrationPersonaSchema>
export type PersonaSelectionData = z.infer<typeof personaSelectionSchema>

/**
 * Safely validates an unknown value as an `AuthPersona`, falling back to `fallback`
 * when the input is missing or invalid.
 */
export function parseAuthPersona(
  value: unknown,
  fallback: AuthPersona = 'ALUMNI',
): AuthPersona {
  const parsed = authPersonaSchema.safeParse(value)
  return parsed.success ? parsed.data : fallback
}

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 100
export const PASSWORD_UPPERCASE_REGEX = /[A-Z]/
export const PASSWORD_LOWERCASE_REGEX = /[a-z]/
export const PASSWORD_NUMBER_REGEX = /[0-9]/
export const PASSWORD_SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>_\-=+[\]\\;/~`']/

export const strongPasswordSchema = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  )
  .max(
    PASSWORD_MAX_LENGTH,
    `Password must be at most ${PASSWORD_MAX_LENGTH} characters`,
  )
  .regex(
    PASSWORD_UPPERCASE_REGEX,
    'Password must include at least one uppercase letter (A-Z)',
  )
  .regex(
    PASSWORD_LOWERCASE_REGEX,
    'Password must include at least one lowercase letter (a-z)',
  )
  .regex(
    PASSWORD_NUMBER_REGEX,
    'Password must include at least one number (0-9)',
  )
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
  passedCount: boolean[]['length']
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

const graduationYearFieldSchema = z.preprocess(
  (val) => {
    if (val === '' || val === null || val === undefined) return undefined
    if (typeof val === 'string') {
      const trimmed = val.trim()
      if (!trimmed) return undefined
      const parsed = Number(trimmed)
      return Number.isNaN(parsed) ? val : parsed
    }
    return val
  },
  z
    .number({
      invalid_type_error: 'Graduation year must be a valid number',
    })
    .int('Graduation year must be a whole number')
    .min(1950, 'Graduation year must be 1950 or later')
    .max(new Date().getFullYear() + 6, 'Graduation year looks incorrect')
    .optional(),
)

/**
 * Shared sign-in schema for both frontend form validation and backend `/api/auth/login` validation.
 */
export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`),
  persona: authPersonaSchema.optional(),
})

/**
 * Shared registration payload schema for backend `/api/auth/register` and programmatic API calls.
 */
export const registerSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: strongPasswordSchema,
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  persona: registrationPersonaSchema.optional(),
  graduationYear: graduationYearFieldSchema,
  department: z
    .string()
    .trim()
    .max(100, 'Department must be at most 100 characters')
    .optional(),
})

/**
 * Client registration form schema with password confirmation and persona validation.
 */
export const registerFormSchema = registerSchema
  .extend({
    confirmPassword: z.string().min(1, 'Confirm your password is required'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  persona: authPersonaSchema.optional(),
})

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(6, 'Valid recovery verification token is required'),
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

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterInputValues = z.infer<typeof registerSchema>
export type RegisterFormValues = z.infer<typeof registerFormSchema>
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>
export type ResetPasswordConfirmValues = z.infer<typeof resetPasswordConfirmSchema>
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>
export type ChangePasswordConfirmValues = z.infer<typeof changePasswordConfirmSchema>
