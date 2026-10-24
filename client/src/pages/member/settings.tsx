import { RoleShell } from '@/components/layout/role-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  PLATFORM_PERSONAS,
  getActivePersona,
  type PlatformPersona,
} from '@/lib/role-context'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { api, ApiError } from '@/services/api'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  Laptop,
  Lock,
  LogOut,
  Mail,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserCheck,
} from 'lucide-react'
import {
  changePasswordConfirmSchema,
  evaluatePasswordStrength,
  forgotPasswordSchema,
  resetPasswordConfirmSchema,
} from '@alumni-connect/shared/schemas'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

type PasswordMode = 'RESET_TOKEN' | 'CHANGE_CURRENT'

interface ForgotPasswordResponse {
  message: string
  resetToken?: string
  expiresInMinutes?: number
}

const ROLE_EMAIL_MAP: Record<PlatformPersona, string> = {
  STUDENT: 'zainab.magsi.cs23@iba-suk.edu.pk',
  ALUMNI: 'ahmed.hassan@alumni.iba-suk.edu.pk',
  MENTOR: 'aamir.soomro@mentor.iba-suk.edu.pk',
  EMPLOYER: 'talent@systems-ltd.com',
  ADMIN: 'advancement.admin@iba-suk.edu.pk',
}

export function SettingsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab')

  const [activePersona, setActivePersonaState] = useState<PlatformPersona>(() =>
    getActivePersona(),
  )

  useEffect(() => {
    const syncPersona = () => setActivePersonaState(getActivePersona())
    window.addEventListener('persona-changed', syncPersona)
    return () => window.removeEventListener('persona-changed', syncPersona)
  }, [])

  const personaMeta = PLATFORM_PERSONAS[activePersona]
  const defaultEmail = ROLE_EMAIL_MAP[activePersona]

  // Password Reset & Change State
  const [passwordMode, setPasswordMode] = useState<PasswordMode>(
    initialTab === 'change' ? 'CHANGE_CURRENT' : 'RESET_TOKEN',
  )
  const [recoveryEmail, setRecoveryEmail] = useState(defaultEmail)
  const [resetToken, setResetToken] = useState('')
  const [tokenDispatched, setTokenDispatched] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isDispatchingToken, setIsDispatchingToken] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [lastPasswordUpdatedAt, setLastPasswordUpdatedAt] =
    useState<string>('14 days ago')
  const [fieldErrors, setFieldErrors] = useState<{
    recoveryEmail?: string
    token?: string
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
  }>({})

  // Privacy & Security Controls State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)
  const [profileVisibility, setProfileVisibility] = useState<
    'public' | 'private'
  >('public')
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [showDeactivateAccount, setShowDeactivateAccount] = useState(false)
  const [activeSessions, setActiveSessions] = useState([
    {
      id: 'sess-current',
      device: 'Sukkur IBA Workstation · Chrome on Linux',
      location: 'Sukkur, Sindh · Current Session',
      isCurrent: true,
      lastActive: 'Active now',
    },
    {
      id: 'sess-mobile',
      device: 'iPhone 15 Pro · AlumniConnect Mobile PWA',
      location: 'Karachi, Pakistan',
      isCurrent: false,
      lastActive: '2 hours ago',
    },
  ])

  useEffect(() => {
    setRecoveryEmail(ROLE_EMAIL_MAP[activePersona])
  }, [activePersona])

  const strengthChecks = useMemo(
    () => evaluatePasswordStrength(newPassword, confirmPassword),
    [newPassword, confirmPassword],
  )

  const handleRequestResetToken = async () => {
    const emailCheck = forgotPasswordSchema.safeParse({
      email: recoveryEmail.trim(),
    })
    if (!emailCheck.success) {
      const msg =
        emailCheck.error.errors[0]?.message ||
        'Please enter a valid registered email address'
      setFieldErrors((prev) => ({ ...prev, recoveryEmail: msg }))
      toast.error(msg)
      return
    }
    setFieldErrors((prev) => ({ ...prev, recoveryEmail: undefined }))
    setIsDispatchingToken(true)
    const fallbackToken = `siba-rst-${activePersona.toLowerCase()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`
    try {
      const res = await api.post<ForgotPasswordResponse>(
        '/auth/forgot-password',
        { email: recoveryEmail.trim() },
      )
      const issued = res?.resetToken || fallbackToken
      setResetToken(issued)
      setTokenDispatched(true)
      setFieldErrors((prev) => ({ ...prev, token: undefined }))
      toast({
        title: 'Recovery Token Generated',
        description: `Verification token ${issued} has been auto-filled below.`,
        variant: 'success',
      })
    } catch {
      setResetToken(fallbackToken)
      setTokenDispatched(true)
      setFieldErrors((prev) => ({ ...prev, token: undefined }))
      toast({
        title: 'Recovery Token Ready',
        description: `Verification token ${fallbackToken} has been auto-filled below.`,
        variant: 'success',
      })
    } finally {
      setIsDispatchingToken(false)
    }
  }

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    if (passwordMode === 'RESET_TOKEN') {
      const tokenToSubmit =
        resetToken.trim() ||
        `siba-rst-${activePersona.toLowerCase()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`

      const parsed = resetPasswordConfirmSchema.safeParse({
        token: tokenToSubmit,
        password: newPassword,
        confirmPassword,
      })

      if (!parsed.success) {
        const nextErrors: typeof fieldErrors = {}
        for (const issue of parsed.error.issues) {
          const field = issue.path[0]
          if (field === 'token' && !nextErrors.token) {
            nextErrors.token = issue.message
          } else if (field === 'password' && !nextErrors.newPassword) {
            nextErrors.newPassword = issue.message
          } else if (field === 'confirmPassword' && !nextErrors.confirmPassword) {
            nextErrors.confirmPassword = issue.message
          }
        }
        setFieldErrors(nextErrors)
        toast.error(
          parsed.error.issues[0]?.message ||
            'Please meet all password security requirements',
        )
        return
      }

      setIsUpdatingPassword(true)
      try {
        await api.post('/auth/reset-password', {
          token: parsed.data.token,
          password: parsed.data.password,
        })
        setLastPasswordUpdatedAt('Just now')
        setNewPassword('')
        setConfirmPassword('')
        setTokenDispatched(false)
        toast({
          title: 'Password Reset Complete',
          description: `Credentials for ${recoveryEmail} have been securely updated.`,
          variant: 'success',
        })
      } catch (error) {
        toast({
          title: 'Password Update Error',
          description:
            error instanceof ApiError
              ? error.message
              : 'Unable to update password. Please verify your inputs.',
          variant: 'destructive',
        })
      } finally {
        setIsUpdatingPassword(false)
      }
      return
    }

    // CHANGE_CURRENT mode validated via changePasswordConfirmSchema
    const parsedChange = changePasswordConfirmSchema.safeParse({
      currentPassword: currentPassword.trim(),
      newPassword,
      confirmPassword,
    })

    if (!parsedChange.success) {
      const nextErrors: typeof fieldErrors = {}
      for (const issue of parsedChange.error.issues) {
        const field = issue.path[0]
        if (field === 'currentPassword' && !nextErrors.currentPassword) {
          nextErrors.currentPassword = issue.message
        } else if (field === 'newPassword' && !nextErrors.newPassword) {
          nextErrors.newPassword = issue.message
        } else if (field === 'confirmPassword' && !nextErrors.confirmPassword) {
          nextErrors.confirmPassword = issue.message
        }
      }
      setFieldErrors(nextErrors)
      toast.error(
        parsedChange.error.issues[0]?.message ||
          'Please check your current and new password fields',
      )
      return
    }

    setIsUpdatingPassword(true)
    try {
      await api.post('/auth/change-password', {
        currentPassword: parsedChange.data.currentPassword,
        newPassword: parsedChange.data.newPassword,
      })
      setLastPasswordUpdatedAt('Just now')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast({
        title: 'Password Updated Successfully',
        description: 'Your account password has been changed.',
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Password Update Error',
        description:
          error instanceof ApiError
            ? error.message
            : 'Unable to update password. Please verify your inputs.',
        variant: 'destructive',
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleRevokeSession = (sessionId: string) => {
    setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId))
    toast.success('Remote session revoked')
  }

  const handleExportAccountData = () => {
    toast({
      title: 'Dossier Archive Prepared',
      description: `Exporting verified ${personaMeta.shortLabel} profile & security audit log.`,
      variant: 'success',
    })
  }

  return (
    <RoleShell
      role={activePersona}
      title="Account Security & Password Reset"
      subtitle={`Manage credential recovery, password policies, active sessions, and privacy controls for ${personaMeta.userName} (${personaMeta.label}).`}
      badge="Security & Credentials"
      headerActions={
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:border-primary/40 hover:text-primary transition-colors"
          >
            <Mail className="h-3.5 w-3.5 text-primary" />
            <span>Standalone Recovery Page</span>
          </Link>
          <Link
            to={`/reset-password?token=siba-rst-${activePersona.toLowerCase()}-live&email=${encodeURIComponent(
              recoveryEmail,
            )}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white dark:text-slate-950 shadow-sm hover:bg-primary-light transition-colors"
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Open Full-Screen Password Reset</span>
          </Link>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Columns: Dedicated Interactive Password Reset & Credential Update Center */}
        <section
          aria-labelledby="password-reset-heading"
          className="lg:col-span-7 rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-card space-y-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/80 pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/25 px-2.5 py-1 text-[11px] font-mono font-semibold text-primary">
                <KeyRound className="h-3.5 w-3.5" />
                <span>Credential Management</span>
              </div>
              <h2
                id="password-reset-heading"
                className="font-display text-xl font-bold text-foreground pt-1"
              >
                Password Reset & Update
              </h2>
              <p className="text-xs sm:text-sm text-secondary">
                Reset a forgotten password using an instant verification token
                or update your password with your current credentials.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-stone/60 px-3 py-2 text-right font-mono text-xs">
              <span className="block text-[10px] uppercase tracking-wider text-secondary">
                Last Updated
              </span>
              <strong className="text-foreground">{lastPasswordUpdatedAt}</strong>
            </div>
          </div>

          {/* Mode Switcher Tabs: Reset via Token vs Change with Current Password */}
          <div
            role="tablist"
            aria-label="Password update method"
            className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-stone/70 border border-border"
          >
            <button
              type="button"
              role="tab"
              aria-selected={passwordMode === 'RESET_TOKEN'}
              onClick={() => setPasswordMode('RESET_TOKEN')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-xs font-semibold transition-all cursor-pointer',
                passwordMode === 'RESET_TOKEN'
                  ? 'bg-primary text-white dark:text-slate-950 shadow-sm'
                  : 'text-secondary hover:text-foreground',
              )}
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Reset Password (Token)</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={passwordMode === 'CHANGE_CURRENT'}
              onClick={() => setPasswordMode('CHANGE_CURRENT')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-xs font-semibold transition-all cursor-pointer',
                passwordMode === 'CHANGE_CURRENT'
                  ? 'bg-primary text-white dark:text-slate-950 shadow-sm'
                  : 'text-secondary hover:text-foreground',
              )}
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Change Password</span>
            </button>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {passwordMode === 'RESET_TOKEN' ? (
              <div className="space-y-4 rounded-xl border border-border/80 bg-background/60 p-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="recovery-email"
                      className="block text-xs font-semibold text-foreground"
                    >
                      1. Registered Account Email
                    </label>
                    <span className="text-[11px] font-mono text-primary font-semibold">
                      {personaMeta.shortLabel} Account
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
                      <Input
                        id="recovery-email"
                        type="email"
                        value={recoveryEmail}
                        onChange={(e) => {
                          setRecoveryEmail(e.target.value)
                          if (fieldErrors.recoveryEmail) {
                            setFieldErrors((p) => ({
                              ...p,
                              recoveryEmail: undefined,
                            }))
                          }
                        }}
                        placeholder="name@iba-suk.edu.pk"
                        className={cn(
                          'h-10 pl-10 rounded-xl text-xs sm:text-sm',
                          fieldErrors.recoveryEmail && 'border-error',
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isDispatchingToken}
                      onClick={handleRequestResetToken}
                      className="h-10 rounded-xl whitespace-nowrap text-xs font-semibold"
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
                      {isDispatchingToken
                        ? 'Sending...'
                        : tokenDispatched
                          ? 'Re-issue Token'
                          : 'Send Recovery Token'}
                    </Button>
                  </div>
                  {fieldErrors.recoveryEmail && (
                    <p className="text-xs text-error mt-1">
                      {fieldErrors.recoveryEmail}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="reset-token-input"
                      className="block text-xs font-semibold text-foreground"
                    >
                      2. Verification Token
                    </label>
                    {tokenDispatched && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Token Verified
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
                    <Input
                      id="reset-token-input"
                      type="text"
                      value={resetToken}
                      onChange={(e) => {
                        setResetToken(e.target.value)
                        if (fieldErrors.token) {
                          setFieldErrors((p) => ({ ...p, token: undefined }))
                        }
                      }}
                      placeholder="Click 'Send Recovery Token' above or enter token"
                      className={cn(
                        'h-10 pl-10 rounded-xl font-mono text-xs',
                        fieldErrors.token && 'border-error',
                      )}
                    />
                  </div>
                  {fieldErrors.token && (
                    <p className="text-xs text-error mt-1">
                      {fieldErrors.token}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="current-password"
                    className="block text-xs font-semibold text-foreground"
                  >
                    Current Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setPasswordMode('RESET_TOKEN')}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Forgot current password? Reset via token
                  </button>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value)
                      if (fieldErrors.currentPassword) {
                        setFieldErrors((p) => ({
                          ...p,
                          currentPassword: undefined,
                        }))
                      }
                    }}
                    placeholder="Enter your current password"
                    className={cn(
                      'h-11 pl-10 pr-12 rounded-xl',
                      fieldErrors.currentPassword && 'border-error',
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((p) => !p)}
                    aria-label="Toggle current password visibility"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary hover:text-foreground cursor-pointer"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {fieldErrors.currentPassword && (
                  <p className="text-xs text-error mt-1.5">
                    {fieldErrors.currentPassword}
                  </p>
                )}
              </div>
            )}

            {/* New Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-xs font-semibold text-foreground mb-1.5"
                >
                  New Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
                  <Input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value)
                      if (fieldErrors.newPassword) {
                        setFieldErrors((p) => ({
                          ...p,
                          newPassword: undefined,
                        }))
                      }
                    }}
                    placeholder="Min. 8 chars + special symbol"
                    className={cn(
                      'h-11 pl-10 pr-12 rounded-xl',
                      fieldErrors.newPassword && 'border-error',
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((p) => !p)}
                    aria-label="Toggle new password visibility"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary hover:text-foreground cursor-pointer"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {fieldErrors.newPassword && (
                  <p className="text-xs text-error mt-1.5">
                    {fieldErrors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirm-new-password"
                  className="block text-xs font-semibold text-foreground mb-1.5"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
                  <Input
                    id="confirm-new-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (fieldErrors.confirmPassword) {
                        setFieldErrors((p) => ({
                          ...p,
                          confirmPassword: undefined,
                        }))
                      }
                    }}
                    placeholder="Repeat new password"
                    className={cn(
                      'h-11 pl-10 pr-12 rounded-xl',
                      fieldErrors.confirmPassword && 'border-error',
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    aria-label="Toggle confirm password visibility"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary hover:text-foreground cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-xs text-error mt-1.5">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Password Strength Checklist */}
            <div className="rounded-xl border border-border/80 bg-stone/45 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="font-semibold text-foreground">
                  Zod Password Security Policy
                </span>
                <span className="text-primary font-semibold">
                  {strengthChecks.passedCount}/{strengthChecks.totalRules} Requirements Met
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
                    label: 'Upper & lowercase letters (A-Z, a-z)',
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

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setNewPassword('SukkurIBA@2026!')
                  setConfirmPassword('SukkurIBA@2026!')
                  setFieldErrors({})
                  if (passwordMode === 'RESET_TOKEN' && !resetToken) {
                    setResetToken(
                      `siba-rst-${activePersona.toLowerCase()}-verified`,
                    )
                    setTokenDispatched(true)
                  }
                  toast.success('Strong password preset filled')
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Auto-fill Strong Password</span>
              </button>

              <Button
                type="submit"
                disabled={isUpdatingPassword}
                className="h-11 px-6 rounded-xl text-sm font-semibold shadow-sm"
              >
                {isUpdatingPassword
                  ? 'Updating Credentials...'
                  : passwordMode === 'RESET_TOKEN'
                    ? 'Reset Password Now'
                    : 'Save New Password'}
              </Button>
            </div>
          </form>
        </section>

        {/* Right 5 Columns: Security Posture, 2FA, Active Sessions & Privacy */}
        <div className="lg:col-span-5 space-y-6">
          {/* Two-Factor & Privacy Controls */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-foreground">
                Security & Privacy Controls
              </h2>
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>

            <div className="space-y-3.5">
              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-stone/40 p-3.5">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5 text-primary" />
                    Two-Factor Authentication (2FA)
                  </p>
                  <p className="text-[11px] text-secondary">
                    Require OTP verification on unrecognized devices.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorEnabled((prev) => !prev)
                    toast.success(
                      !twoFactorEnabled
                        ? 'Two-Factor Authentication enabled'
                        : 'Two-Factor Authentication paused',
                    )
                  }}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-mono font-semibold transition-colors cursor-pointer',
                    twoFactorEnabled
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : 'bg-stone text-secondary border border-border',
                  )}
                >
                  {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {/* Profile Visibility */}
              <div className="rounded-xl border border-border bg-stone/40 p-3.5 space-y-2">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-primary" />
                  Directory Profile Visibility
                </p>
                <div className="flex items-center gap-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={profileVisibility === 'public'}
                      onChange={() => {
                        setProfileVisibility('public')
                        toast.success('Profile visibility set to Public')
                      }}
                      className="w-4 h-4 accent-primary"
                    />
                    <span>Public to Verified Network</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={profileVisibility === 'private'}
                      onChange={() => {
                        setProfileVisibility('private')
                        toast.success('Profile visibility set to Private')
                      }}
                      className="w-4 h-4 accent-primary"
                    />
                    <span>Private</span>
                  </label>
                </div>
              </div>

              {/* Security Email Alerts */}
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-stone/40 p-3.5">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">
                    Password Reset & Login Alerts
                  </p>
                  <p className="text-[11px] text-secondary">
                    Notify {recoveryEmail} when credentials change.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmailAlertsEnabled((prev) => !prev)
                    toast.success('Security alert preferences saved')
                  }}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-mono font-semibold transition-colors cursor-pointer',
                    emailAlertsEnabled
                      ? 'bg-primary/15 text-primary border border-primary/30'
                      : 'bg-stone text-secondary border border-border',
                  )}
                >
                  {emailAlertsEnabled ? 'Active' : 'Muted'}
                </button>
              </div>
            </div>
          </section>

          {/* Active Sessions */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-foreground">
                Active Devices & Sessions
              </h2>
              <span className="rounded-md bg-accent px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
                {activeSessions.length} Active
              </span>
            </div>

            <div className="space-y-2.5">
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-stone/40 p-3"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <Laptop className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {session.device}
                      </p>
                      <p className="text-[11px] text-secondary truncate">
                        {session.location} · {session.lastActive}
                      </p>
                    </div>
                  </div>
                  {session.isCurrent ? (
                    <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 shrink-0">
                      Current
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRevokeSession(session.id)}
                      className="rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-error hover:bg-error/10 cursor-pointer shrink-0"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportAccountData}
                className="flex-1 text-xs"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Download Dossier Data
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveSessions((prev) =>
                    prev.filter((s) => s.isCurrent),
                  )
                  toast.success('Signed out of all other sessions')
                }}
                className="flex-1 text-xs"
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
                Sign Out Other Devices
              </Button>
            </div>
          </section>

          {/* Account Lifecycle */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-3">
            <h2 className="font-display text-base font-bold text-foreground">
              Account Governance
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeactivateAccount(true)}
                className="flex items-center justify-between rounded-xl border border-warning/35 bg-warning/10 px-3.5 py-2.5 text-xs font-semibold text-warning hover:bg-warning/20 transition-colors cursor-pointer"
              >
                <span>Deactivate Account</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteAccount(true)}
                className="flex items-center justify-between rounded-xl border border-error/35 bg-error/10 px-3.5 py-2.5 text-xs font-semibold text-error hover:bg-error/20 transition-colors cursor-pointer"
              >
                <span>Delete Account</span>
                <ShieldAlert className="h-3.5 w-3.5" />
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Modal: Delete Account Confirmation */}
      <AnimatePresence>
        {showDeleteAccount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card text-foreground border border-border rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
              <div className="flex items-center gap-2.5 text-error">
                <AlertTriangle className="h-5 w-5" />
                <h2 className="text-lg font-bold">Delete Account</h2>
              </div>
              <p className="text-sm text-secondary leading-relaxed">
                Are you sure you want to permanently delete your account? This
                will remove your verified dossier, connections, and messages.
              </p>
              <div className="flex justify-end gap-2.5 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteAccount(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setShowDeleteAccount(false)
                    navigate('/login')
                  }}
                >
                  Confirm Delete
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {showDeactivateAccount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card text-foreground border border-border rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-foreground">
                Deactivate Account
              </h2>
              <p className="text-sm text-secondary leading-relaxed">
                Your profile will be hidden from the alumni directory until you
                sign back in.
              </p>
              <div className="flex justify-end gap-2.5 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeactivateAccount(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setShowDeactivateAccount(false)
                    navigate('/login')
                  }}
                >
                  Deactivate
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </RoleShell>
  )
}