import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  evaluatePasswordStrength,
  REGISTRATION_PERSONAS,
  registerFormSchema,
  registrationPersonaSchema,
  type RegisterFormValues,
  type RegistrationPersona,
} from '@alumni-connect/shared'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from '@/lib/toast'
import { api, ApiError } from '@/services/api'
import {
  getActivePersona,
  setActivePersona,
  type PlatformPersona,
} from '@/lib/role-context'
import {
  AuthShowcaseLayout,
  AUTH_PERSONA_SLIDES,
  PERSONA_ICONS,
} from '@/components/layout/auth-showcase-layout'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  CheckCircle2,
  GraduationCap,
  Lock,
  Mail,
  RefreshCw,
  User,
} from 'lucide-react'

type FormValues = RegisterFormValues

const REGISTER_PERSONAS: readonly RegistrationPersona[] = REGISTRATION_PERSONAS

const REGISTER_ROLE_COPY: Record<
  PlatformPersona,
  {
    title: string
    subtitle: string
    namePlaceholder: string
    emailPlaceholder: string
    yearLabel: string
    yearPlaceholder: string
    deptLabel: string
    deptPlaceholder: string
    submitLabel: string
  }
> = {
  STUDENT: {
    title: 'Activate Your Student Scholar Account',
    subtitle:
      'Connect with alumni mentors, apply for referrals, and track your career readiness.',
    namePlaceholder: 'Zainab Magsi',
    emailPlaceholder: 'zainab.magsi.cs23@iba-suk.edu.pk',
    yearLabel: 'Expected Graduation',
    yearPlaceholder: '2026',
    deptLabel: 'Academic Department',
    deptPlaceholder: 'Computer Science',
    submitLabel: 'Create Student Account',
  },
  ALUMNI: {
    title: 'Claim Your Verified Alumni Profile',
    subtitle:
      'Join 5,420+ Sukkur IBA graduates across 42 countries and 18 regional chapters.',
    namePlaceholder: 'Ayesha Siddiqui',
    emailPlaceholder: 'ayesha.siddiqui@iba-suk.edu.pk',
    yearLabel: 'Graduation Cohort',
    yearPlaceholder: '2019',
    deptLabel: 'Degree Department',
    deptPlaceholder: 'Computer Science',
    submitLabel: 'Claim Alumni Profile',
  },
  MENTOR: {
    title: 'Enroll in the Alumni Mentorship Guild',
    subtitle:
      'Publish office hours, review student portfolios, and mentor fellowship applicants.',
    namePlaceholder: 'Dr. Aamir Soomro',
    emailPlaceholder: 'aamir.soomro@iba-suk.edu.pk',
    yearLabel: 'Graduation Cohort',
    yearPlaceholder: '2014',
    deptLabel: 'Mentoring Specialty / Dept',
    deptPlaceholder: 'AI Infrastructure & Fellowships',
    submitLabel: 'Register as Alumni Mentor',
  },
  EMPLOYER: {
    title: 'Register as a Corporate Hiring Partner',
    subtitle:
      'Post high-impact engineering and business roles with verified alumni referral backing.',
    namePlaceholder: 'Hira Qureshi · Systems Limited',
    emailPlaceholder: 'talent@systems-ltd.com',
    yearLabel: 'Partner Since',
    yearPlaceholder: '2022',
    deptLabel: 'Industry Sector',
    deptPlaceholder: 'Enterprise Cloud & FinTech',
    submitLabel: 'Create Employer Partner Account',
  },
  ADMIN: {
    title: 'Request Institutional Staff Access',
    subtitle:
      'For Sukkur IBA Career Services, Alumni Advancement, and Registry administrators.',
    namePlaceholder: 'Advancement Directorate Officer',
    emailPlaceholder: 'advancement@iba-suk.edu.pk',
    yearLabel: 'Directorate Code',
    yearPlaceholder: '2026',
    deptLabel: 'Administrative Unit',
    deptPlaceholder: 'Alumni Advancement Office',
    submitLabel: 'Submit Staff Registration',
  },
}

export function RegisterPage() {
  const [selectedPersona, setSelectedPersona] = useState<RegistrationPersona>(() => {
    const current = getActivePersona()
    const parsed = registrationPersonaSchema.safeParse(current)
    return parsed.success ? parsed.data : 'ALUMNI'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(registerFormSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      department: '',
      persona: selectedPersona,
    },
  })

  const watchedPassword = watch('password') ?? ''
  const watchedConfirmPassword = watch('confirmPassword') ?? ''

  const strengthChecks = useMemo(
    () => evaluatePasswordStrength(watchedPassword, watchedConfirmPassword),
    [watchedPassword, watchedConfirmPassword],
  )

  const roleCopy = REGISTER_ROLE_COPY[selectedPersona]

  const handlePersonaChange = (persona: PlatformPersona) => {
    const parsed = registrationPersonaSchema.safeParse(persona)
    const nextPersona: RegistrationPersona = parsed.success ? parsed.data : 'ALUMNI'
    setSelectedPersona(nextPersona)
    setActivePersona(nextPersona)
    setValue('persona', nextPersona, { shouldValidate: true })
  }

  const handleFillStrongPassword = () => {
    const presetPassword = 'SukkurIBA@2026!'
    setValue('password', presetPassword, { shouldValidate: true })
    setValue('confirmPassword', presetPassword, { shouldValidate: true })
    toast.success('Strong password preset applied')
  }

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    try {
      const validatedPersona = registrationPersonaSchema.parse(
        data.persona ?? selectedPersona,
      )
      await api.post('/auth/register', {
        email: data.email,
        password: data.password,
        name: data.name,
        persona: validatedPersona,
        graduationYear: data.graduationYear,
        department: data.department,
      })
      setActivePersona(validatedPersona)
      toast({
        title: 'Registration Successful',
        description: `Your ${AUTH_PERSONA_SLIDES[validatedPersona].shortLabel} profile has been created. Please sign in.`,
        variant: 'success',
      })
      navigate('/login')
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description:
          error instanceof ApiError ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShowcaseLayout
      activePersona={selectedPersona}
      onPersonaChange={handlePersonaChange}
      modeLabel="Member & Partner Registration"
    >
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 26,
          layout: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
        }}
        className="w-full rounded-2xl sm:rounded-3xl border border-border/90 bg-card/95 dark:bg-card/90 backdrop-blur-xl p-4 min-[375px]:p-6 sm:p-8 shadow-[0_24px_60px_-15px_rgba(9,20,34,0.18)] space-y-4 sm:space-y-5"
      >
        {/* Role Account Type Selector */}
        <div className="space-y-2">
          <span className="text-[11px] min-[375px]:text-xs font-mono text-secondary">
            Choose Account Type
          </span>
          <div
            role="tablist"
            aria-label="Choose registration role"
            className="grid grid-cols-4 gap-1 min-[375px]:gap-1.5 p-1 min-[375px]:p-1.5 rounded-xl sm:rounded-2xl bg-stone/80 dark:bg-stone/50 border border-border/80"
          >
            {REGISTER_PERSONAS.map((roleKey) => {
              const Icon = PERSONA_ICONS[roleKey]
              const isSelected = selectedPersona === roleKey
              return (
                <button
                  key={roleKey}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handlePersonaChange(roleKey)}
                  className={`relative flex flex-col items-center justify-center gap-0.5 min-[375px]:gap-1 rounded-lg sm:rounded-xl py-1.5 min-h-[44px] px-1 text-[10px] min-[375px]:text-xs font-semibold leading-tight transition-colors cursor-pointer min-w-0 ${
                    isSelected
                      ? 'text-white dark:text-slate-950'
                      : 'text-secondary hover:text-foreground'
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="registerRoleActiveTab"
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 30,
                      }}
                      className="absolute inset-0 rounded-lg sm:rounded-xl bg-primary shadow-sm"
                    />
                  )}
                  <Icon className="relative z-10 h-3.5 w-3.5 min-[375px]:h-4 min-[375px]:w-4 shrink-0" />
                  <span className="relative z-10 truncate max-w-full tracking-tight sm:tracking-normal">
                    {AUTH_PERSONA_SLIDES[roleKey].shortLabel}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Dynamic Header */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={`reg-header-${selectedPersona}`}
            layout="position"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-1"
          >
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {roleCopy.title}
            </h1>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed">
              {roleCopy.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <input type="hidden" {...register('persona')} />
          {errors.persona && (
            <p className="text-xs text-error">{errors.persona.message}</p>
          )}
          {/* Full Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-semibold text-foreground mb-1.5"
            >
              {selectedPersona === 'EMPLOYER'
                ? 'Representative & Company Name'
                : 'Full Name'}
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
              <Input
                id="name"
                {...register('name')}
                placeholder={roleCopy.namePlaceholder}
                className={cn(
                  'h-10 pl-10 rounded-xl',
                  errors.name && 'border-error',
                )}
                aria-invalid={errors.name ? true : undefined}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-error mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-foreground mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder={roleCopy.emailPlaceholder}
                className={cn(
                  'h-10 pl-10 rounded-xl',
                  errors.email && 'border-error',
                )}
                aria-invalid={errors.email ? true : undefined}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-error mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Passwords Row */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleFillStrongPassword}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Strong Preset</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-secondary" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="Min. 8 chars + symbol"
                    className={cn(
                      'h-10 pl-9 pr-12 rounded-xl',
                      errors.password && 'border-error',
                    )}
                    aria-invalid={errors.password ? true : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-secondary hover:text-foreground cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-error mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-semibold mb-1.5"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-secondary" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    placeholder="Repeat password"
                    className={cn(
                      'h-10 pl-9 pr-12 rounded-xl',
                      errors.confirmPassword && 'border-error',
                    )}
                    aria-invalid={errors.confirmPassword ? true : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-secondary hover:text-foreground cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-error mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Compact Live Zod Password Strength Indicator */}
            <div className="rounded-xl border border-border/80 bg-stone/45 p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="font-semibold text-foreground">
                  Password Strength Policy
                </span>
                <span className="text-primary font-semibold">
                  {strengthChecks.passedCount}/{strengthChecks.totalRules} Verified
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'h-1 rounded-full transition-colors',
                      idx < strengthChecks.passedCount
                        ? 'bg-primary'
                        : 'bg-border',
                    )}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-[10px]">
                {[
                  {
                    label: '8+ characters',
                    passed: strengthChecks.hasMinLength,
                  },
                  {
                    label: 'Upper & lower case',
                    passed: strengthChecks.hasMixedCase,
                  },
                  {
                    label: 'Number (0-9)',
                    passed: strengthChecks.hasNumber,
                  },
                  {
                    label: 'Symbol (!@#$%)',
                    passed: strengthChecks.hasSpecialChar,
                  },
                  {
                    label: 'Passwords match',
                    passed: strengthChecks.passwordsMatch,
                  },
                ].map((rule) => (
                  <div
                    key={rule.label}
                    className={cn(
                      'flex items-center gap-1',
                      rule.passed ? 'text-primary font-medium' : 'text-secondary',
                    )}
                  >
                    <CheckCircle2
                      className={cn(
                        'h-3 w-3 shrink-0',
                        rule.passed ? 'text-primary' : 'text-border',
                      )}
                    />
                    <span className="truncate">{rule.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cohort & Department Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="graduationYear"
                className="block text-xs font-semibold mb-1.5"
              >
                {roleCopy.yearLabel}{' '}
                <span className="text-secondary/60 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <GraduationCap className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-secondary" />
                <Input
                  id="graduationYear"
                  type="number"
                  {...register('graduationYear')}
                  placeholder={roleCopy.yearPlaceholder}
                  className={cn(
                    'h-10 pl-9 rounded-xl font-mono tabular-nums',
                    errors.graduationYear && 'border-error',
                  )}
                  aria-invalid={errors.graduationYear ? true : undefined}
                />
              </div>
              {errors.graduationYear && (
                <p className="text-xs text-error mt-1">
                  {errors.graduationYear.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="department"
                className="block text-xs font-semibold mb-1.5"
              >
                {roleCopy.deptLabel}{' '}
                <span className="text-secondary/60 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-secondary" />
                <Input
                  id="department"
                  {...register('department')}
                  placeholder={roleCopy.deptPlaceholder}
                  className={cn(
                    'h-10 pl-9 rounded-xl',
                    errors.department && 'border-error',
                  )}
                  aria-invalid={errors.department ? true : undefined}
                />
              </div>
              {errors.department && (
                <p className="text-xs text-error mt-1">
                  {errors.department.message}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 text-sm font-semibold rounded-xl shadow-sm"
          >
            {isLoading ? 'Creating account...' : roleCopy.submitLabel}
          </Button>

          {/* Already have account link */}
          <p className="text-xs text-secondary text-center pt-2 border-t border-border/70">
            Already registered in the network?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary hover:underline"
            >
              Sign In
            </Link>
          </p>
        </form>
      </motion.div>
    </AuthShowcaseLayout>
  )
}
