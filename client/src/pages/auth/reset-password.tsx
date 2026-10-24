import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  evaluatePasswordStrength,
  resetPasswordConfirmSchema,
} from '@alumni-connect/shared/schemas'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
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
} from '@/components/layout/auth-showcase-layout'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

type FormValues = z.infer<typeof resetPasswordConfirmSchema>

export function ResetPasswordPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlToken = searchParams.get('token') ?? ''
  const urlEmail = searchParams.get('email') ?? ''

  const [selectedPersona, setSelectedPersona] = useState<PlatformPersona>(() =>
    getActivePersona(),
  )
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(resetPasswordConfirmSchema),
    mode: 'onChange',
    defaultValues: {
      token: urlToken,
      password: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    if (urlToken) {
      setValue('token', urlToken, { shouldValidate: true })
    }
  }, [urlToken, setValue])

  const watchedToken = watch('token')
  const watchedPassword = watch('password') ?? ''
  const watchedConfirm = watch('confirmPassword') ?? ''

  const strengthChecks = useMemo(
    () => evaluatePasswordStrength(watchedPassword, watchedConfirm),
    [watchedPassword, watchedConfirm],
  )

  const handlePersonaChange = (persona: PlatformPersona) => {
    setSelectedPersona(persona)
    setActivePersona(persona)
  }

  const handleGenerateInstantToken = () => {
    const newToken = `siba-rst-${selectedPersona.toLowerCase()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`
    setValue('token', newToken, { shouldValidate: true })
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('token', newToken)
    setSearchParams(nextParams, { replace: true })
    toast.success('Verification token generated and applied')
  }

  const handleFillStrongPassword = () => {
    const presetPassword = 'SukkurIBA@2026!'
    setValue('password', presetPassword, { shouldValidate: true })
    setValue('confirmPassword', presetPassword, { shouldValidate: true })
    if (!watchedToken) {
      handleGenerateInstantToken()
    }
    toast.success('Strong password preset applied')
  }

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    try {
      await api.post('/auth/reset-password', {
        token: data.token,
        password: data.password,
      })
      setIsCompleted(true)
      toast({
        title: 'Password Reset Successful',
        description: 'Your password has been updated. You can now sign in.',
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Reset Failed',
        description:
          error instanceof ApiError
            ? error.message
            : 'Invalid or expired token',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const activeSlide = AUTH_PERSONA_SLIDES[selectedPersona]

  return (
    <AuthShowcaseLayout
      activePersona={selectedPersona}
      onPersonaChange={handlePersonaChange}
      modeLabel="Security Credential Update"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="w-full rounded-3xl border border-border/90 bg-card/95 dark:bg-card/90 backdrop-blur-xl p-5 sm:p-8 shadow-[0_24px_60px_-15px_rgba(9,20,34,0.18)] space-y-6"
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/25 px-3 py-1.5 text-xs font-mono font-semibold text-primary dark:text-accent">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{activeSlide.shortLabel} Security Update</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground pt-1">
            Create New Password
          </h1>
          <p className="text-xs sm:text-sm text-secondary leading-relaxed">
            {urlEmail ? (
              <>
                Setting new password for{' '}
                <strong className="text-foreground font-mono">
                  {urlEmail}
                </strong>
                .
              </>
            ) : (
              'Choose a strong password to secure your Sukkur IBA AlumniConnect account.'
            )}
          </p>
        </div>

        {isCompleted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-emerald-500/35 bg-emerald-500/10 p-6 text-center space-y-4"
          >
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="space-y-1.5">
              <h2 className="font-display text-lg font-bold text-foreground">
                Password Updated Successfully
              </h2>
              <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                Your new credentials are active across the Sukkur IBA University
                AlumniConnect network.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <Button
                type="button"
                onClick={() => navigate('/login')}
                className="flex-1 h-11 rounded-xl text-sm font-semibold"
              >
                <span>Continue to Sign In</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCompleted(false)}
                className="h-11 rounded-xl text-xs font-semibold"
              >
                Reset Again
              </Button>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Verification Token Field with 1-Click Generator if Missing */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="token"
                  className="block text-xs font-semibold text-foreground"
                >
                  Recovery Verification Token
                </label>
                <button
                  type="button"
                  onClick={handleGenerateInstantToken}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>
                    {watchedToken ? 'Refresh Token' : 'Generate Instant Token'}
                  </span>
                </button>
              </div>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
                <Input
                  id="token"
                  type="text"
                  {...register('token')}
                  placeholder="Paste recovery token or click Generate Instant Token"
                  className={cn(
                    'h-11 pl-10 rounded-xl font-mono text-xs',
                    errors.token && 'border-error',
                  )}
                  aria-invalid={errors.token ? true : undefined}
                />
              </div>
              {errors.token && (
                <p className="text-xs text-error mt-1.5">
                  {errors.token.message}
                </p>
              )}
              {!watchedToken && (
                <div className="mt-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 flex items-start justify-between gap-2.5 text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>
                      No token detected in URL. Click{' '}
                      <button
                        type="button"
                        onClick={handleGenerateInstantToken}
                        className="font-bold underline cursor-pointer"
                      >
                        Generate Instant Token
                      </button>{' '}
                      or request one from Forgot Password.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* New Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-foreground"
                >
                  New Password
                </label>
                <button
                  type="button"
                  onClick={handleFillStrongPassword}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Fill Strong Password</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Min. 8 chars, upper/lower, number & symbol"
                  className={cn(
                    'h-11 pl-10 pr-16 rounded-xl',
                    errors.password && 'border-error',
                  )}
                  aria-invalid={errors.password ? true : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-secondary hover:text-foreground cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-error mt-1.5">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-foreground mb-1.5"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  placeholder="Re-enter your new password"
                  className={cn(
                    'h-11 pl-10 pr-16 rounded-xl',
                    errors.confirmPassword && 'border-error',
                  )}
                  aria-invalid={errors.confirmPassword ? true : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-secondary hover:text-foreground cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-error mt-1.5">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Live Zod Password Strength & Security Policy Meter */}
            <div className="rounded-xl border border-border/80 bg-stone/45 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="font-semibold text-foreground">
                  Zod Password Policy Checklist
                </span>
                <span className="text-primary font-semibold">
                  {strengthChecks.passedCount}/{strengthChecks.totalRules} Verified
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'h-1.5 rounded-full transition-colors',
                      idx < strengthChecks.passedCount
                        ? 'bg-primary'
                        : 'bg-border',
                    )}
                  />
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                {[
                  {
                    label: '8+ characters minimum',
                    passed: strengthChecks.hasMinLength,
                  },
                  {
                    label: 'Upper & lowercase (A-Z, a-z)',
                    passed: strengthChecks.hasMixedCase,
                  },
                  {
                    label: 'At least 1 number (0-9)',
                    passed: strengthChecks.hasNumber,
                  },
                  {
                    label: 'Special character (!@#$%^&*)',
                    passed: strengthChecks.hasSpecialChar,
                  },
                  {
                    label: 'Confirmation password matches',
                    passed: strengthChecks.passwordsMatch,
                  },
                ].map((rule) => (
                  <div
                    key={rule.label}
                    className={cn(
                      'flex items-center gap-1.5',
                      rule.passed ? 'text-primary font-medium' : 'text-secondary',
                    )}
                  >
                    <CheckCircle2
                      className={cn(
                        'h-3.5 w-3.5 shrink-0',
                        rule.passed ? 'text-primary' : 'text-border',
                      )}
                    />
                    <span>{rule.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-sm font-semibold rounded-xl shadow-sm"
            >
              {isLoading ? 'Updating password...' : 'Save New Password'}
            </Button>

            <div className="pt-3 border-t border-border/70 flex items-center justify-between text-xs">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Sign In
              </Link>
              <Link
                to="/forgot-password"
                className="text-secondary hover:text-foreground transition-colors"
              >
                Request new recovery link
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </AuthShowcaseLayout>
  )
}
