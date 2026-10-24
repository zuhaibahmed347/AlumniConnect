import {
  createBrowserRouter,
  useRouteError,
  Link,
  Outlet,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { useEffect, useState, type ReactNode } from 'react'
import {
  ShieldAlert,
  ArrowLeft,
  LayoutDashboard,
  Lock,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react'
import { pageTransition } from '@/lib/motion'
import {
  PLATFORM_PERSONAS,
  getActivePersona,
  setActivePersona,
  type PlatformPersona,
} from '@/lib/role-context'
import { RoleSwitcherStrip } from '@/components/layout/role-shell'
import { GlobalSearchProvider } from '@/components/ui/global-search-bar'
import { toast } from '@/lib/toast'
import { LandingPage } from '@/pages/public/landing'
import { SignInPage } from '@/pages/auth/signin'
import { RegisterPage } from '@/pages/auth/register'
import { ForgotPasswordPage } from '@/pages/auth/forgot-password'
import { ResetPasswordPage } from '@/pages/auth/reset-password'
import { DashboardPage } from '@/pages/member/dashboard'
import { StudentDashboardPage } from '@/pages/member/student-dashboard'
import { AlumniDirectoryPage } from '@/pages/member/alumni-directory'
import { AlumniProfileDetailPage } from '@/pages/member/alumni-profile-detail'
import { ProfilePage } from '@/pages/member/profile'
import { NotificationsPage } from '@/pages/member/notifications'
import { SettingsPage } from '@/pages/member/settings'
import { EventsHubPage } from '@/pages/member/events'
import { JobsPage } from '@/pages/member/jobs'
import { MessagesPage } from '@/pages/member/messages'
import { ConversationPage } from '@/pages/member/conversation'
import { MentorshipProgramPage } from '@/pages/member/mentorship'
import { MentorshipRelationshipsPage } from '@/pages/member/mentorship-relationships'
import { MentorProfilePage } from '@/pages/member/mentor-profile'
import { MentorWorkspacePage } from '@/pages/member/mentor-workspace'
import { EmployerWorkspacePage } from '@/pages/member/employer-workspace'
import { JobDetailsPage } from '@/pages/member/job-details'
import { EventDetailsPage } from '@/pages/member/event-details'
import { AdminDashboardPage } from '@/pages/admin/dashboard'
import { AdminCommandCenterPage } from '@/pages/admin/institutional-command-center'
import { AdminUsersPage } from '@/pages/admin/users'
import { AdminEventAdministrationPage } from '@/pages/admin/event-administration'
import { AdminJobAdministrationPage } from '@/pages/admin/job-administration'
import { AdminMentorshipOverviewPage } from '@/pages/admin/mentorship-overview'
import { AdminRolesMatrixPage } from '@/pages/admin/roles-matrix'
import { AdminAnalyticsPage } from '@/pages/admin/analytics'
import { AdminProfilePage } from '@/pages/admin/profile'
import { AdminSettingsPage } from '@/pages/admin/settings'

const GUARD_POLICY_STORAGE_KEY = 'siba_guard_policy_v1'
export type GuardEnforcementMode = 'forbidden' | 'dashboard'

/**
 * Resolves the user's current role from the active persona store and session token.
 */
export function resolveCurrentUserRole(): PlatformPersona {
  if (typeof window === 'undefined') return 'ALUMNI'
  const explicitPersona = window.localStorage.getItem('siba_active_persona_v1')
  if (
    explicitPersona === 'STUDENT' ||
    explicitPersona === 'ALUMNI' ||
    explicitPersona === 'MENTOR' ||
    explicitPersona === 'EMPLOYER' ||
    explicitPersona === 'ADMIN'
  ) {
    return explicitPersona
  }

  const token = window.localStorage.getItem('accessToken') ?? ''
  if (token.includes('admin')) return 'ADMIN'
  if (token.includes('employer')) return 'EMPLOYER'
  if (token.includes('mentor')) return 'MENTOR'
  if (token.includes('student')) return 'STUDENT'

  return getActivePersona()
}

/**
 * Returns the canonical dashboard route for a given user role.
 */
export function getAppropriateDashboardForRole(role: PlatformPersona): string {
  return PLATFORM_PERSONAS[role]?.defaultRoute ?? '/dashboard'
}

/**
 * Evaluates whether the current user role satisfies the route's allowed roles list.
 */
export function hasRoleAccess(
  userRole: PlatformPersona,
  allowedRoles: readonly PlatformPersona[],
): boolean {
  return allowedRoles.includes(userRole)
}

export function getGuardEnforcementMode(): GuardEnforcementMode {
  if (typeof window === 'undefined') return 'forbidden'
  const raw = window.localStorage.getItem(GUARD_POLICY_STORAGE_KEY)
  return raw === 'dashboard' ? 'dashboard' : 'forbidden'
}

export function setGuardEnforcementMode(mode: GuardEnforcementMode): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(GUARD_POLICY_STORAGE_KEY, mode)
  } catch {
    // Ignore storage errors
  }
}

interface ForbiddenLocationState {
  from?: string
  requiredRoles?: PlatformPersona[]
  currentRole?: PlatformPersona
  portalName?: string
  appropriateDashboard?: string
}

export interface RoleRouteGuardProps {
  allowedRoles: readonly PlatformPersona[]
  portalName: string
  redirectMode?: GuardEnforcementMode
  children?: ReactNode
}

/**
 * Role-Based Route Guard:
 * Checks the user's active role and prevents unauthorized access to Admin,
 * Employer, Mentor, or Student dashboards, redirecting unauthorized users
 * either to the 403 Forbidden page or directly to their appropriate dashboard.
 */
export function RoleRouteGuard({
  allowedRoles,
  portalName,
  redirectMode,
  children,
}: RoleRouteGuardProps) {
  const location = useLocation()
  const [currentRole, setCurrentRole] = useState<PlatformPersona>(() =>
    resolveCurrentUserRole(),
  )

  useEffect(() => {
    const syncRole = () => {
      setCurrentRole(resolveCurrentUserRole())
    }
    window.addEventListener('persona-changed', syncRole)
    window.addEventListener('storage', syncRole)
    return () => {
      window.removeEventListener('persona-changed', syncRole)
      window.removeEventListener('storage', syncRole)
    }
  }, [])

  const isAuthorized = hasRoleAccess(currentRole, allowedRoles)

  if (!isAuthorized) {
    const appropriateDashboard = getAppropriateDashboardForRole(currentRole)
    const searchParams = new URLSearchParams(location.search)
    const queryPolicy = searchParams.get('guard')
    const activeMode: GuardEnforcementMode =
      queryPolicy === 'dashboard'
        ? 'dashboard'
        : queryPolicy === 'forbidden'
          ? 'forbidden'
          : (redirectMode ?? getGuardEnforcementMode())

    if (activeMode === 'dashboard') {
      return (
        <Navigate
          to={appropriateDashboard}
          replace
          state={
            {
              from: location.pathname,
              requiredRoles: [...allowedRoles],
              currentRole,
              portalName,
              appropriateDashboard,
            } satisfies ForbiddenLocationState
          }
        />
      )
    }

    return (
      <Navigate
        to="/403"
        replace
        state={
          {
            from: location.pathname,
            requiredRoles: [...allowedRoles],
            currentRole,
            portalName,
            appropriateDashboard,
          } satisfies ForbiddenLocationState
        }
      />
    )
  }

  return children ? <>{children}</> : <Outlet />
}

/**
 * 403 Forbidden Page:
 * Displayed when a user attempts to access a role-restricted dashboard
 * (Admin, Employer, Mentor, or Student) without the required role permissions.
 */
export function ForbiddenPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state as ForbiddenLocationState | null) ?? null

  const [currentRole, setCurrentRole] = useState<PlatformPersona>(() =>
    resolveCurrentUserRole(),
  )
  const [enforcementMode, setEnforcementMode] = useState<GuardEnforcementMode>(
    () => getGuardEnforcementMode(),
  )

  const attemptedPath = state?.from ?? '/admin'
  const requiredRoles: PlatformPersona[] =
    state?.requiredRoles && state.requiredRoles.length > 0
      ? state.requiredRoles
      : attemptedPath.startsWith('/employer')
        ? ['EMPLOYER', 'ADMIN']
        : attemptedPath.startsWith('/mentor')
          ? ['MENTOR', 'ADMIN']
          : attemptedPath.startsWith('/student')
            ? ['STUDENT', 'ADMIN']
            : ['ADMIN']

  const portalName =
    state?.portalName ??
    (attemptedPath.startsWith('/employer')
      ? 'Employer & Recruiter Console'
      : attemptedPath.startsWith('/mentor')
        ? 'Alumni Mentor Workspace'
        : attemptedPath.startsWith('/student')
          ? 'Student Scholar Hub'
          : 'Institutional Admin Portal')

  useEffect(() => {
    const handlePersonaChange = (e: Event) => {
      const nextRole =
        (e as CustomEvent<PlatformPersona>).detail ?? resolveCurrentUserRole()
      setCurrentRole(nextRole)
    }
    window.addEventListener('persona-changed', handlePersonaChange)
    return () =>
      window.removeEventListener('persona-changed', handlePersonaChange)
  }, [])

  const currentPersona = PLATFORM_PERSONAS[currentRole]
  const appropriateDashboard = getAppropriateDashboardForRole(currentRole)
  const primaryRequiredRole = requiredRoles[0] ?? 'ADMIN'
  const requiredPersonaMeta = PLATFORM_PERSONAS[primaryRequiredRole]
  const nowAuthorized = hasRoleAccess(currentRole, requiredRoles)

  const handleSwitchToRequiredRole = (roleToActivate: PlatformPersona) => {
    setActivePersona(roleToActivate)
    setCurrentRole(roleToActivate)
    const meta = PLATFORM_PERSONAS[roleToActivate]
    toast.success(
      `Role switched to ${meta.label}. Redirecting to ${attemptedPath}...`,
    )
    navigate(attemptedPath, { replace: true })
  }

  const handleToggleGuardMode = (nextMode: GuardEnforcementMode) => {
    setGuardEnforcementMode(nextMode)
    setEnforcementMode(nextMode)
    toast({
      title:
        nextMode === 'dashboard'
          ? 'Guard Policy: Auto-Redirect to Dashboard'
          : 'Guard Policy: Show 403 Forbidden Screen',
      description:
        nextMode === 'dashboard'
          ? 'Unauthorized route attempts will now immediately redirect to your role dashboard.'
          : 'Unauthorized route attempts will display this 403 Forbidden security screen.',
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <RoleSwitcherStrip />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(220,38,38,0.07),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(13,110,91,0.08),transparent_50%)]"
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 250, damping: 26 }}
          className="relative z-10 w-full max-w-2xl rounded-2xl border border-border bg-card shadow-card overflow-hidden"
        >
          {/* Top security accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-error via-accent to-primary" />

          <div className="p-6 sm:p-8 lg:p-10 space-y-6">
            {/* Status header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-lg border border-error/30 bg-error/10 px-3 py-1 text-xs font-mono uppercase tracking-wider font-semibold text-error">
                <ShieldAlert className="h-3.5 w-3.5" />
                HTTP 403 · Forbidden Access
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-stone/60 px-2.5 py-1 text-[11px] font-mono text-secondary">
                <Lock className="h-3 w-3 text-primary" />
                RBAC Route Guard Active
              </span>
            </div>

            {/* Title & explanation */}
            <div className="space-y-2.5">
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Access Restricted to {requiredPersonaMeta.label}s
              </h1>
              <p className="text-sm sm:text-[15px] text-secondary leading-relaxed">
                Your current session is authenticated as{' '}
                <strong className="font-semibold text-foreground">
                  {currentPersona.userName}
                </strong>{' '}
                with the{' '}
                <span className="font-mono text-xs font-semibold text-primary px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
                  {currentPersona.label} ({currentRole})
                </span>{' '}
                role, which does not have permission to open the{' '}
                <strong className="font-semibold text-foreground">
                  {portalName}
                </strong>{' '}
                (
                <code className="font-mono text-xs text-error">
                  {attemptedPath}
                </code>
                ).
              </p>
            </div>

            {/* Role comparison matrix card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 rounded-xl border border-border bg-background/70 p-4">
              <div className="space-y-1">
                <p className="text-[11px] font-mono uppercase tracking-wider text-secondary">
                  Your Active Role
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {currentPersona.label}
                </p>
                <p className="text-xs text-secondary">
                  Assigned workspace:{' '}
                  <code className="font-mono text-primary font-semibold">
                    {appropriateDashboard}
                  </code>
                </p>
              </div>

              <div className="space-y-1 sm:border-l sm:border-border sm:pl-4">
                <p className="text-[11px] font-mono uppercase tracking-wider text-secondary">
                  Required Role(s) for {attemptedPath}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {requiredRoles.map((roleKey) => (
                    <span
                      key={roleKey}
                      className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-mono font-semibold text-primary"
                    >
                      {PLATFORM_PERSONAS[roleKey].shortLabel} ({roleKey})
                    </span>
                  ))}
                </div>
                <p className="text-xs text-secondary">
                  Protected portal: {portalName}
                </p>
              </div>
            </div>

            {/* Primary CTA: Redirect to user's appropriate dashboard */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to={appropriateDashboard}
                replace
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white dark:text-slate-950 shadow-sm hover:bg-primary-light transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                Go to My {currentPersona.shortLabel} Dashboard (
                {appropriateDashboard})
              </Link>

              {nowAuthorized && (
                <Link
                  to={attemptedPath}
                  replace
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-primary bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/15 transition-colors"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Continue to {attemptedPath}
                </Link>
              )}

              <Link
                to="/"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </div>

            {/* Quick Role Switcher & Guard Redirect Mode Toggle for Evaluators */}
            <div className="pt-5 border-t border-border space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  <span className="text-xs font-mono uppercase tracking-wider font-semibold text-foreground">
                    Switch Role to Unlock {portalName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono text-secondary">
                    Guard Behavior:
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleGuardMode(
                        enforcementMode === 'forbidden'
                          ? 'dashboard'
                          : 'forbidden',
                      )
                    }
                    className="rounded-md border border-border bg-stone/60 px-2.5 py-1 text-[11px] font-mono font-semibold text-foreground hover:border-primary/40 cursor-pointer"
                  >
                    {enforcementMode === 'forbidden'
                      ? 'Mode: 403 Forbidden Page'
                      : 'Mode: Auto-Redirect to Dashboard'}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {requiredRoles.map((roleKey) => {
                  const meta = PLATFORM_PERSONAS[roleKey]
                  return (
                    <button
                      key={roleKey}
                      type="button"
                      onClick={() => handleSwitchToRequiredRole(roleKey)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-primary/35 bg-primary/10 px-3.5 py-2 text-xs font-mono font-semibold text-primary hover:bg-primary hover:text-white dark:hover:text-slate-950 transition-colors cursor-pointer"
                    >
                      Authorize as {meta.label} ({meta.userName})
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

/** Route-level error boundary rendered by react-router when a route throws. */
function RouteError() {
  const error = useRouteError()
  const message = error instanceof Error ? error.message : 'Unknown error'
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center gap-4">
      <h1 className="font-display text-2xl font-bold tracking-tight">
        Something went wrong
      </h1>
      <p className="text-secondary max-w-md">{message}</p>
      <Link to="/" className="underline text-primary hover:text-primary/80">
        Back to home
      </Link>
    </main>
  )
}

/**
 * Global Animated Route Shell:
 * Wraps every route in Framer Motion's `AnimatePresence` and `MotionConfig`
 * so page transitions animate smoothly and respect `prefers-reduced-motion`.
 */
function AnimatedRouteShell() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  return (
    <MotionConfig reducedMotion="user">
      <GlobalSearchProvider>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={pageTransition}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="min-h-screen"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </GlobalSearchProvider>
    </MotionConfig>
  )
}

export const router = createBrowserRouter([
  {
    element: <AnimatedRouteShell />,
    errorElement: <RouteError />,
    children: [
      /* Public & Auth routes */
      { path: '/', element: <LandingPage />, errorElement: <RouteError /> },
      { path: '/login', element: <SignInPage />, errorElement: <RouteError /> },
      { path: '/register', element: <RegisterPage />, errorElement: <RouteError /> },
      {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
        errorElement: <RouteError />,
      },
      {
        path: '/reset-password',
        element: <ResetPasswordPage />,
        errorElement: <RouteError />,
      },

      /* 403 Forbidden routes */
      { path: '/403', element: <ForbiddenPage />, errorElement: <RouteError /> },
      {
        path: '/forbidden',
        element: <ForbiddenPage />,
        errorElement: <RouteError />,
      },

      /* Student Dashboard routes (Protected: STUDENT or ADMIN) */
      {
        element: (
          <RoleRouteGuard
            allowedRoles={['STUDENT', 'ADMIN']}
            portalName="Student Scholar Hub"
          />
        ),
        errorElement: <RouteError />,
        children: [
          { path: '/student', element: <StudentDashboardPage /> },
          { path: '/student/dashboard', element: <StudentDashboardPage /> },
        ],
      },

      /* General Member & Alumni Hub routes */
      { path: '/dashboard', element: <DashboardPage />, errorElement: <RouteError /> },
      {
        path: '/alumni',
        element: <AlumniDirectoryPage />,
        errorElement: <RouteError />,
      },
      {
        path: '/directory',
        element: <AlumniDirectoryPage />,
        errorElement: <RouteError />,
      },
      {
        path: '/alumni/:alumniId',
        element: <AlumniProfileDetailPage />,
        errorElement: <RouteError />,
      },
      { path: '/profile', element: <ProfilePage />, errorElement: <RouteError /> },
      { path: '/messages', element: <MessagesPage />, errorElement: <RouteError /> },
      {
        path: '/messages/:conversationId',
        element: <ConversationPage />,
        errorElement: <RouteError />,
      },
      {
        path: '/notifications',
        element: <NotificationsPage />,
        errorElement: <RouteError />,
      },
      { path: '/settings', element: <SettingsPage />, errorElement: <RouteError /> },
      { path: '/events', element: <EventsHubPage />, errorElement: <RouteError /> },
      { path: '/jobs', element: <JobsPage />, errorElement: <RouteError /> },
      {
        path: '/mentorship',
        element: <MentorshipProgramPage />,
        errorElement: <RouteError />,
      },
      {
        path: '/mentorship/relationships',
        element: <MentorshipRelationshipsPage />,
        errorElement: <RouteError />,
      },
      {
        path: '/mentorship/mentors/:mentorId',
        element: <MentorProfilePage />,
        errorElement: <RouteError />,
      },
      {
        path: '/jobs/:jobId',
        element: <JobDetailsPage />,
        errorElement: <RouteError />,
      },
      {
        path: '/events/:eventId',
        element: <EventDetailsPage />,
        errorElement: <RouteError />,
      },

      /* Mentor Dashboard routes (Protected: MENTOR or ADMIN) */
      {
        element: (
          <RoleRouteGuard
            allowedRoles={['MENTOR', 'ADMIN']}
            portalName="Alumni Mentor Workspace"
          />
        ),
        errorElement: <RouteError />,
        children: [
          { path: '/mentor', element: <MentorWorkspacePage /> },
          { path: '/mentor/dashboard', element: <MentorWorkspacePage /> },
        ],
      },

      /* Employer Dashboard routes (Protected: EMPLOYER or ADMIN) */
      {
        element: (
          <RoleRouteGuard
            allowedRoles={['EMPLOYER', 'ADMIN']}
            portalName="Employer & Recruiter Console"
          />
        ),
        errorElement: <RouteError />,
        children: [
          { path: '/employer', element: <EmployerWorkspacePage /> },
          { path: '/employer/dashboard', element: <EmployerWorkspacePage /> },
        ],
      },

      /* Admin Dashboard & Administration routes (Protected: ADMIN only) */
      {
        element: (
          <RoleRouteGuard
            allowedRoles={['ADMIN']}
            portalName="Institutional Admin Portal"
          />
        ),
        errorElement: <RouteError />,
        children: [
          { path: '/admin', element: <AdminDashboardPage /> },
          { path: '/admin/command-center', element: <AdminCommandCenterPage /> },
          { path: '/admin/users', element: <AdminUsersPage /> },
          { path: '/admin/events', element: <AdminEventAdministrationPage /> },
          { path: '/admin/jobs', element: <AdminJobAdministrationPage /> },
          {
            path: '/admin/mentorship',
            element: <AdminMentorshipOverviewPage />,
          },
          { path: '/admin/roles', element: <AdminRolesMatrixPage /> },
          { path: '/admin/analytics', element: <AdminAnalyticsPage /> },
          { path: '/admin/profile', element: <AdminProfilePage /> },
          { path: '/admin/settings', element: <AdminSettingsPage /> },
        ],
      },

      /* Catch-all */
      { path: '*', element: <RouteError />, errorElement: <RouteError /> },
    ],
  },
])