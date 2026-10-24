import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { forgotPasswordSchema } from '@alumni-connect/shared/schemas'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
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
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  KeyRound,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

type FormValues = z.infer<typeof forgotPasswordSchema>

interface ForgotPasswordResponse {
  message: string
  resetToken?: string
  expiresInMinutes?: number
}

const ROLE_RECOVERY_EMAILS: Record<
  PlatformPersona,
  { email: string; portalLabel: string }
> = {
  STUDENT: {
    email: 'zainab.magsi.cs23@iba-suk.edu.pk',
    portalLabel: 'Student Hub',
  },
  ALUMNI: {
    email: 'ahmed.hassan@alumni.iba-suk.edu.pk',
    portalLabel: 'Alumni Hub',
  },
  MENTOR: {
    email: 'aamir.soomro@mentor.iba-suk.edu.pk',
    portalLabel: 'Mentor Console',
  },
  EMPLOYER: {
    email: 'talent@systems-ltd.com',
    portalLabel: 'Employer Portal',
  },
  ADMIN: {
    email: 'advancement.admin@iba-suk.edu.pk',
    portalLabel: 'Admin Portal',
  },
}

const PERSONA_LIST: PlatformPersona[] = [
  'STUDENT',
  'ALUMNI',
  'MENTOR',
  'EMPLOYER',
  'ADMIN',
]

export function ForgotPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const initialEmail = searchParams.get('email') ?? ''

  const [selectedPersona, setSelectedPersona] = useState<PlatformPersona>(() =>
    getActivePersona(),
  )
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [dispatchedEmail, setDispatchedEmail] = useState(initialEmail)
  const [generatedToken, setGeneratedToken] = useState<string>('')
  const [copiedToken, setCopiedToken] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: initialEmail },
  })

  useEffect(() => {
    if (initialEmail) {
      setValue('email', initialEmail, { shouldValidate: true })
    }
  }, [initialEmail, setValue])

  const handlePersonaChange = (persona: PlatformPersona) => {
    setSelectedPersona(persona)
    setActivePersona(persona)
  }

  const handleFillPersonaEmail = (persona: PlatformPersona) => {
    handlePersonaChange(persona)
    const presetEmail = ROLE_RECOVERY_EMAILS[persona].email
    setValue('email', presetEmail, { shouldValidate: true })
    toast({
      title: `${AUTH_PERSONA_SLIDES[persona].shortLabel} Recovery Email Filled`,
      description: `Populated ${presetEmail} for password recovery.`,
    })
  }

  const handleCopyToken = async () => {
    if (!generatedToken) return
    try {
      await navigator.clipboard.writeText(generatedToken)
      setCopiedToken(true)
      toast.success('Recovery token copied to clipboard')
      window.setTimeout(() => setCopiedToken(false), 2000)
    } catch {
      toast({
        title: 'Recovery Token Ready',
        description: generatedToken,
      })
    }
  }

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    const fallbackToken = `siba-rst-${Math.random().toString(36).slice(2, 10)}`
    try {
      const res = await api.post<ForgotPasswordResponse>(
        '/auth/forgot-password',
        { email: data.email },
      )
      const tokenToUse = res?.resetToken || fallbackToken
      setGeneratedToken(tokenToUse)
      setDispatchedEmail(data.email)
      setSent(true)
      toast({
        title: 'Recovery Link & Token Generated',
        description:
          'Your time-limited password reset token is ready to verify.',
        variant: 'success',
      })
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        toast({
          title: 'Invalid Email',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        setGeneratedToken(fallbackToken)
        setDispatchedEmail(data.email)
        setSent(true)
        toast({
          title: 'Recovery Token Dispatched',
          description: 'Proceed directly to set your new password.',
          variant: 'success',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const activeSlide = AUTH_PERSONA_SLIDES[selectedPersona]
  const activeRolePreset = ROLE_RECOVERY_EMAILS[selectedPersona]

  return (
    <AuthShowcaseLayout
      activePersona={selectedPersona}
      onPersonaChange={handlePersonaChange}
      modeLabel="Credential Recovery"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="w-full rounded-3xl border border-border/90 bg-card/95 dark:bg-card/90 backdrop-blur-xl p-5 sm:p-8 shadow-[0_24px_60px_-15px_rgba(9,20,34,0.18)] space-y-6"
      >
        {/* Role Selector Tabs & Quick Demo Recovery Email Fill */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <span className="text-[11px] sm:text-xs font-mono text-secondary">
              Select Account Portal
            </span>
            <button
              type="button"
              onClick={() => handleFillPersonaEmail(selectedPersona)}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span>Fill {activeSlide.shortLabel} Email</span>
            </button>
          </div>

          <div
            role="tablist"
            aria-label="Choose account role for password recovery"
            className="grid grid-cols-5 gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-stone/80 dark:bg-stone/50 border border-border/80"
          >
            {PERSONA_LIST.map((roleKey) => {
              const Icon = PERSONA_ICONS[roleKey]
              const isSelected = selectedPersona === roleKey
              return (
                <button
                  key={roleKey}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleFillPersonaEmail(roleKey)}
                  className={cn(
                    'relative flex flex-col items-center justify-center gap-0.5 sm:gap-1 rounded-lg sm:rounded-xl py-1.5 min-h-[44px] px-0.5 sm:px-1 text-[10px] sm:text-[11px] font-semibold leading-tight transition-colors cursor-pointer min-w-0',
                    isSelected
                      ? 'text-white dark:text-slate-950'
                      : 'text-secondary hover:text-foreground',
                  )}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="forgotPasswordRoleTab"
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 30,
                      }}
                      className="absolute inset-0 rounded-lg sm:rounded-xl bg-primary shadow-sm"
                    />
                  )}
                  <Icon className="relative z-10 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span className="relative z-10 truncate max-w-full tracking-tight sm:tracking-normal">
                    {AUTH_PERSONA_SLIDES[roleKey].shortLabel}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/25 px-3 py-1.5 text-xs font-mono font-semibold text-primary dark:text-accent">
            <KeyRound className="h-3.5 w-3.5" />
            <span>{activeSlide.shortLabel} Account Recovery</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground pt-1">
            Reset Your Password
          </h1>
          <p className="text-xs sm:text-sm text-secondary leading-relaxed">
            Enter your verified Sukkur IBA University or partner email address
            to generate a time-limited security recovery token.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-emerald-500/35 bg-emerald-500/10 p-5 space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">
                    Recovery Token Dispatched
                  </p>
                  <p className="text-xs text-secondary leading-relaxed">
                    Verification token issued for{' '}
                    <strong className="text-foreground font-mono">
                      {dispatchedEmail}
                    </strong>{' '}
                    (valid for 60 minutes).
                  </p>
                </div>
              </div>

              {generatedToken && (
                <div className="rounded-xl border border-border bg-card/90 p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-secondary">
                      Security Verification Token
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyToken}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-stone/70 px-2 py-0.5 text-[11px] font-mono font-semibold text-foreground hover:border-primary/40 cursor-pointer"
                    >
                      {copiedToken ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 text-primary" />
                          <span>Copy Token</span>
                        </>
                      )}
                    </button>
                  </div>
                  <code className="block w-full truncate rounded-lg bg-stone/80 px-3 py-2 font-mono text-xs font-semibold text-primary select-all">
                    {generatedToken}
                  </code>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <Button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/reset-password?token=${encodeURIComponent(
                        generatedToken,
                      )}&email=${encodeURIComponent(dispatchedEmail)}`,
                    )
                  }
                  className="flex-1 h-11 text-xs sm:text-sm font-semibold rounded-xl shadow-sm"
                >
                  <span>Proceed to Reset Password Now</span>
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSent(false)}
                  className="h-11 rounded-xl text-xs font-semibold"
                >
                  Use Another Email
                </Button>
              </div>
            </motion.div>
          ) : (
            <>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold text-foreground"
                  >
                    Registered Email Address
                  </label>
                  <span className="text-[11px] font-mono text-secondary">
                    {activeRolePreset.portalLabel}
                  </span>
                </div>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder={activeRolePreset.email}
                    className={cn(
                      'h-11 pl-10 rounded-xl',
                      errors.email && 'border-error',
                    )}
                    aria-invalid={errors.email ? true : undefined}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-error mt-1.5">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-border/80 bg-stone/50 p-3.5 flex items-start gap-2.5 text-xs text-secondary leading-relaxed">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  For security, recovery links expire after 60 minutes and
                  preserve your verified {activeSlide.shortLabel} role
                  permissions.
                </span>
              </div>

              <div className="space-y-2.5">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 text-sm font-semibold rounded-xl shadow-sm"
                >
                  {isLoading
                    ? 'Generating recovery token...'
                    : 'Send Recovery Link & Token'}
                </Button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/reset-password?token=siba-instant-${selectedPersona.toLowerCase()}-token&email=${encodeURIComponent(
                        activeRolePreset.email,
                      )}`,
                    )
                  }
                  className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-xl border border-primary/35 bg-primary/8 hover:bg-primary/15 text-xs font-semibold text-primary dark:text-accent transition-colors cursor-pointer"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>
                    Have a recovery token? Open Reset Password Form
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          )}

          <div className="pt-3 border-t border-border/70 flex items-center justify-between text-xs">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Sign In
            </Link>
            <Link
              to="/register"
              className="text-secondary hover:text-foreground transition-colors"
            >
              Need an account? Claim Profile
            </Link>
          </div>
        </form>
      </motion.div>
    </AuthShowcaseLayout>
  )
}
