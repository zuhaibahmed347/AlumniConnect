import { createBrowserRouter, useRouteError, Link } from 'react-router-dom'
import { LandingPage } from '@/pages/public/landing'
import { SignInPage } from '@/pages/auth/signin'
import { RegisterPage } from '@/pages/auth/register'
import { ForgotPasswordPage } from '@/pages/auth/forgot-password'
import { ResetPasswordPage } from '@/pages/auth/reset-password'
import { DashboardPage } from '@/pages/member/dashboard'
import { AlumniDirectoryPage } from '@/pages/member/alumni-directory'
import { ProfilePage } from '@/pages/member/profile'
import { NotificationsPage } from '@/pages/member/notifications'
import { SettingsPage } from '@/pages/member/settings'
import { EventsHubPage } from '@/pages/member/events'
import { JobsPage } from '@/pages/member/jobs'
import { MessagesPage } from '@/pages/member/messages'
import { ConversationPage } from '@/pages/member/conversation'
import { MentorshipProgramPage } from '@/pages/member/mentorship'
import { MentorshipRelationshipsPage } from '@/pages/member/mentorship-relationships'
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

/** Route-level error boundary rendered by react-router when a route throws. */
function RouteError() {
  const error = useRouteError()
  const message = error instanceof Error ? error.message : 'Unknown error'
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
      <p className="text-secondary max-w-md">{message}</p>
      <Link to="/" className="underline text-primary hover:text-primary/80">
        Back to home
      </Link>
    </main>
  )
}

export const router = createBrowserRouter([
  /* Public routes */
  { path: '/', element: <LandingPage />, errorElement: <RouteError /> },
  { path: '/login', element: <SignInPage />, errorElement: <RouteError /> },
  { path: '/register', element: <RegisterPage />, errorElement: <RouteError /> },
  { path: '/forgot-password', element: <ForgotPasswordPage />, errorElement: <RouteError /> },
  { path: '/reset-password', element: <ResetPasswordPage />, errorElement: <RouteError /> },

  /* Member routes */
  { path: '/dashboard', element: <DashboardPage />, errorElement: <RouteError /> },
  { path: '/alumni', element: <AlumniDirectoryPage />, errorElement: <RouteError /> },
  { path: '/profile', element: <ProfilePage />, errorElement: <RouteError /> },
  { path: '/messages', element: <MessagesPage />, errorElement: <RouteError /> },
  { path: '/messages/:conversationId', element: <ConversationPage />, errorElement: <RouteError /> },
  { path: '/notifications', element: <NotificationsPage />, errorElement: <RouteError /> },
  { path: '/settings', element: <SettingsPage />, errorElement: <RouteError /> },
  { path: '/events', element: <EventsHubPage />, errorElement: <RouteError /> },
  { path: '/jobs', element: <JobsPage />, errorElement: <RouteError /> },
  { path: '/mentorship', element: <MentorshipProgramPage />, errorElement: <RouteError /> },
  { path: '/mentorship/relationships', element: <MentorshipRelationshipsPage />, errorElement: <RouteError /> },
  { path: '/jobs/:id', element: <JobDetailsPage />, errorElement: <RouteError /> },
  { path: '/events/:eventId', element: <EventDetailsPage />, errorElement: <RouteError /> },

  /* Admin routes */
  { path: '/admin', element: <AdminDashboardPage />, errorElement: <RouteError /> },
  { path: '/admin/command-center', element: <AdminCommandCenterPage />, errorElement: <RouteError /> },
  { path: '/admin/users', element: <AdminUsersPage />, errorElement: <RouteError /> },
  { path: '/admin/events', element: <AdminEventAdministrationPage />, errorElement: <RouteError /> },
  { path: '/admin/jobs', element: <AdminJobAdministrationPage />, errorElement: <RouteError /> },
  { path: '/admin/mentorship', element: <AdminMentorshipOverviewPage />, errorElement: <RouteError /> },
  { path: '/admin/roles', element: <AdminRolesMatrixPage />, errorElement: <RouteError /> },
  { path: '/admin/analytics', element: <AdminAnalyticsPage />, errorElement: <RouteError /> },
  { path: '/admin/profile', element: <AdminProfilePage />, errorElement: <RouteError /> },
  { path: '/admin/settings', element: <AdminSettingsPage />, errorElement: <RouteError /> },

  /* Catch-all */
  { path: '*', element: <RouteError />, errorElement: <RouteError /> },
])