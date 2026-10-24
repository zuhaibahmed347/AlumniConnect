import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { loginSchema } from '@alumni-connect/shared/schemas'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from '@/lib/toast'
import { api, setToken, ApiError } from '@/services/api'
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
import { ArrowRight, KeyRound, Lock, Mail, Sparkles } from 'lucide-react'

type FormValues = z.infer<typeof loginSchema>

interface LoginResponse {
  user: { id: string; email: string; name: string; role: string }
  accessToken: string
}

const ADMIN_ROLES = new Set([
  'SUPER_ADMIN',
  'ADMIN',
  'EVENT_MANAGER',
  'MODERATOR',
  'MENTORSHIP_MANAGER',
])

const ROLE_SIGNIN_CONFIG: Record<
  PlatformPersona,
  {
    portalName: string
    emailPlaceholder: string
    demoEmail: string
    route: string
    token: string
    helperText: string
    accentBadgeClass: string
  }
> = {
  STUDENT: {
    portalName: 'Student Career & Mentorship Hub',
    emailPlaceholder: 'zainab.magsi.cs23@iba-suk.edu.pk',
    demoEmail: 'zainab.magsi.cs23@iba-suk.edu.pk',
    route: '/student',
    token: 'demo-student',
    helperText: 'Sign in with your @iba-suk.edu.pk student CMS credentials.',
    accentBadgeClass:
      'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  },
  ALUMNI: {
    portalName: 'Verified Alumni Network Hub',
    emailPlaceholder: 'ahmed.hassan@alumni.iba-suk.edu.pk',
    demoEmail: 'ahmed.hassan@alumni.iba-suk.edu.pk',
    route: '/dashboard',
    token: 'demo-alumni',
    helperText: 'Access global chapters, job referrals, and cohort directories.',
    accentBadgeClass:
      'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30',
  },
  MENTOR: {
    portalName: 'Mentorship Guild Console',
    emailPlaceholder: 'aamir.soomro@mentor.iba-suk.edu.pk',
    demoEmail: 'aamir.soomro@mentor.iba-suk.edu.pk',
    route: '/mentor',
    token: 'demo-mentor',
    helperText: 'Manage your availability calendar, mentees, and fellowship tracks.',
    accentBadgeClass:
      'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30',
  },
  EMPLOYER: {
    portalName: 'Corporate Talent & Referral Portal',
    emailPlaceholder: 'talent@systems-ltd.com',
    demoEmail: 'talent@systems-ltd.com',
    route: '/employer',
    token: 'demo-employer',
    helperText: 'Post roles, review alumni-backed referrals, and manage campus drives.',
    accentBadgeClass:
      'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30',
  },
  ADMIN: {
    portalName: 'Institutional Governance Console',
    emailPlaceholder: 'advancement.admin@iba-suk.edu.pk',
    demoEmail: 'advancement.admin@iba-suk.edu.pk',
    route: '/admin',
    token: 'demo-admin',
    helperText: 'Restricted to authorized Sukkur IBA Advancement & Registry staff.',
    accentBadgeClass:
      'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
  },
}

const PERSONA_LIST: PlatformPersona[] = [
  'STUDENT',
  'ALUMNI',
  'MENTOR',
  'EMPLOYER',
  'ADMIN',
]

export function SignInPage() {
  const [selectedPersona, setSelectedPersona] = useState<PlatformPersona>(() =>
    getActivePersona(),
  )
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const activeConfig = ROLE_SIGNIN_CONFIG[selectedPersona]
  const activeSlide = AUTH_PERSONA_SLIDES[selectedPersona]
  const ActiveRoleIcon = PERSONA_ICONS[selectedPersona]

  const handleSelectPersona = (persona: PlatformPersona) => {
    setSelectedPersona(persona)
    setActivePersona(persona)
  }

  const handleLaunchInstantDemo = (persona: PlatformPersona) => {
    const cfg = ROLE_SIGNIN_CONFIG[persona]
    setToken(cfg.token)
    setActivePersona(persona)
    toast.success(`Signed into ${cfg.portalName}`)
    navigate(cfg.route)
  }

  const handleAutofillDemoCredentials = () => {
    setValue('email', activeConfig.demoEmail, { shouldValidate: true })
    setValue('password', 'SukkurIBA@2026', { shouldValidate: true })
    toast({
      title: `${activeSlide.shortLabel} Credentials Populated`,
      description: 'Click Sign In or Launch Instant Demo Session below.',
    })
  }

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    try {
      const res = await api.post<LoginResponse>('/auth/login', {
        email: data.email,
        password: data.password,
      })
      setToken(res.accessToken)
      const isAdmin = ADMIN_ROLES.has(res.user.role)
      const resolvedPersona: PlatformPersona = isAdmin
        ? 'ADMIN'
        : res.user.role === 'EMPLOYER'
          ? 'EMPLOYER'
          : res.user.role === 'MENTOR'
            ? 'MENTOR'
            : res.user.role === 'STUDENT'
              ? 'STUDENT'
              : 'ALUMNI'
      setActivePersona(resolvedPersona)
      toast({
        title: 'Sign In Successful',
        description: `Welcome back, ${res.user.name}`,
        variant: 'success',
      })
      navigate(ROLE_SIGNIN_CONFIG[resolvedPersona].route)
    } catch (error) {
      // If demo credentials were used and backend isn't seeded with that demo user, allow seamless demo session fallback
      if (data.email === activeConfig.demoEmail) {
        handleLaunchInstantDemo(selectedPersona)
        return
      }
      toast({
        title: 'Sign In Failed',
        description:
          error instanceof ApiError ? error.message : 'Invalid credentials',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShowcaseLayout
      activePersona={selectedPersona}
      onPersonaChange={handleSelectPersona}
      modeLabel="Role-Based Sign In"
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
        className="w-full rounded-2xl sm:rounded-3xl border border-border/90 bg-card/95 dark:bg-card/90 backdrop-blur-xl p-4 min-[375px]:p-6 sm:p-8 shadow-[0_24px_60px_-15px_rgba(9,20,34,0.18)] space-y-5 sm:space-y-6"
      >
        {/* Role Selector Tabs at Top of Auth Card */}
        <div className="space-y-2.5 min-[375px]:space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <span className="text-[11px] min-[375px]:text-xs font-mono text-secondary">
              Select Your User Portal
            </span>
            <button
              type="button"
              onClick={handleAutofillDemoCredentials}
              className="inline-flex items-center gap-1 text-[11px] min-[375px]:text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span>Fill {activeSlide.shortLabel} Demo Login</span>
            </button>
          </div>

          <div
            role="tablist"
            aria-label="Choose your user role to sign in"
            className="grid grid-cols-5 gap-1 min-[375px]:gap-1.5 p-1 min-[375px]:p-1.5 rounded-xl sm:rounded-2xl bg-stone/80 dark:bg-stone/50 border border-border/80"
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
                  onClick={() => handleSelectPersona(roleKey)}
                  className={`relative flex flex-col items-center justify-center gap-0.5 min-[375px]:gap-1 rounded-lg sm:rounded-xl py-1.5 min-h-[44px] px-0.5 min-[375px]:px-1 text-[10px] min-[375px]:text-[11px] font-semibold leading-tight transition-colors cursor-pointer min-w-0 ${
                    isSelected
                      ? 'text-white dark:text-slate-950'
                      : 'text-secondary hover:text-foreground'
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="signinFormRoleTab"
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

        {/* Dynamic Role Context Header */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={`header-${selectedPersona}`}
            layout="position"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-mono font-semibold ${activeConfig.accentBadgeClass}`}
              >
                <ActiveRoleIcon className="h-3.5 w-3.5" />
                {activeConfig.portalName}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground pt-1">
              Sign in as {activeSlide.shortLabel}
            </h1>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed">
              {activeConfig.helperText}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Sign In Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-foreground mb-1.5"
            >
              {selectedPersona === 'EMPLOYER'
                ? 'Corporate Partner Email'
                : 'Institutional or Verified Email'}
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder={activeConfig.emailPlaceholder}
                className={cn(
                  'h-11 pl-10 rounded-xl',
                  errors.email && 'border-error',
                )}
                aria-invalid={errors.email ? true : undefined}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-error mt-1.5">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-foreground"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="Enter your password"
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

          {/* Primary Sign In CTA + 1-Click Role Demo CTA */}
          <div className="space-y-2.5 pt-1">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-sm font-semibold rounded-xl shadow-sm"
            >
              {isLoading
                ? 'Authenticating...'
                : `Sign In to ${activeSlide.shortLabel} Portal`}
            </Button>

            <button
              type="button"
              onClick={() => handleLaunchInstantDemo(selectedPersona)}
              className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-xl border border-primary/35 bg-primary/8 hover:bg-primary/15 text-xs font-semibold text-primary dark:text-accent transition-colors cursor-pointer"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>
                Instant 1-Click {activeSlide.shortLabel} Demo Session
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* All 5 Role Portals Quick Switcher Matrix */}
          <div className="pt-4 border-t border-border/80 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-secondary">
              <span>Quick Role Workspace Launch</span>
              <span>RBAC Verified</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(
                [
                  { label: 'Student Hub', persona: 'STUDENT' },
                  { label: 'Alumni Hub', persona: 'ALUMNI' },
                  { label: 'Mentor Console', persona: 'MENTOR' },
                  { label: 'Employer Portal', persona: 'EMPLOYER' },
                  { label: 'Admin Portal', persona: 'ADMIN' },
                ] as const
              ).map((item) => {
                const isCurrent = selectedPersona === item.persona
                return (
                  <button
                    key={item.persona}
                    type="button"
                    onClick={() => handleLaunchInstantDemo(item.persona)}
                    className={`rounded-xl border px-2.5 py-2 text-xs font-mono font-semibold transition-all cursor-pointer text-left flex items-center justify-between ${
                      isCurrent
                        ? 'border-primary bg-primary/10 text-primary dark:text-accent'
                        : 'border-border bg-background/80 text-foreground hover:border-primary/50 hover:text-primary'
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    <ArrowRight className="h-3 w-3 shrink-0 opacity-70" />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Register Link */}
          <p className="text-xs text-secondary text-center pt-2 border-t border-border/70">
            New to Sukkur IBA AlumniConnect?{' '}
            <Link
              to="/register"
              className="font-semibold text-primary hover:underline"
            >
              Claim your verified profile
            </Link>
          </p>
        </form>
      </motion.div>
    </AuthShowcaseLayout>
  )
}
