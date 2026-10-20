import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/* ==================== Not Found Page ==================== */
export function NotFoundPage() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-md mx-auto text-center">
        <div className="h-64 w-64 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <svg className="h-12 w-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7l7 9z" />
          </svg>
        </div>
        <h2 className="text-5xl font-bold tracking-tight mb-2">404</h2>
        <p className="text-secondary mb-6">Page not found</p>
        <p className="text-secondary/60">The page you're looking for doesn't exist or has been moved.</p>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    </main>
  )
}

/* ==================== Unauthorized Page ==================== */
export function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-md mx-auto text-center">
        <div className="h-64 w-64 rounded-lg bg-error/10 flex items-center justify-center mx-auto mb-6">
          <svg className="h-12 w-12 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7l7 9z" />
          </svg>
        </div>
        <h2 className="text-5xl font-bold tracking-tight mb-2">401</h2>
        <p className="text-secondary mb-6">Not authorized</p>
        <p className="text-secondary/60">You don't have permission to access this page.</p>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    </main>
  )
}

/* ==================== Forbidden Page ==================== */
export function ForbiddenPage() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-md mx-auto text-center">
        <div className="h-64 w-64 rounded-lg bg-warning/10 flex items-center justify-center mx-auto mb-6">
          <svg className="h-12 w-12 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3h-2m0 0h-2m-2 2h-2m2 2h2m2 2h2m-7 3a2 2 0 01-2-2V5a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2zm-7 4a2 2 0 00-2 2v4a2 2 0 002-2h4a2 2 0 002-2v-4a2 2 0 00-2-2zm7-8a2 2 0 012 2v4a2 2 0 00-2-2h-4a2 2 0 00-2 2v4a2 2 0 012-2zM5 7a2 2 0 012 2h4a2 2 0 012 2v5a2 2 0 01-2 2h-4a2 2 0 01-2-2v-5zM5 3a2 2 0 012-2h4a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2V3z" />
          </svg>
        </div>
        <h2 className="text-5xl font-bold tracking-tight mb-2">403</h2>
        <p className="text-secondary mb-6">Access denied</p>
        <p className="text-secondary/60">You don't have the necessary permissions to perform this action.</p>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    </main>
  )
}

/* ==================== Session Expired Page ==================== */
export function SessionExpiredPage() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-md mx-auto text-center">
        <div className="h-64 w-64 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <svg className="h-12 w-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7l7 9z" />
          </svg>
        </div>
        <h2 className="text-5xl font-bold tracking-tight mb-2">Session Expired</h2>
        <p className="text-secondary mb-6">Your session has expired.</p>
        <p className="text-secondary/60">Please sign in again to continue.</p>
        <Button
          variant="outline"
          onClick={() => window.location.href = '/login'}
          className="mt-4"
        >
          Re-sign In
        </Button>
      </div>
    </main>
  )
}

/* ==================== Validation Error Component ==================== */
export function ValidationError({ errors }: { errors: Record<string, string[]> }) {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-md">
      <p className="text-sm font-medium text-red-600">Validation failed</p>
      <ul className="mt-1 text-sm text-red-700">
        {Object.entries(errors).map(([field, messages]) => (
          <li key={field} className="list-disc pl-2">
            {field}: {messages[0]}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ==================== API Error Component ==================== */
export function ApiError({ error }: { error: { message: string; code?: string } }) {
  return (
    <div className="bg-error/5 border-l-4 border-error p-4 mb-4 rounded-md">
      <p className="text-sm font-medium text-error">{error.message}</p>
      {error.code && (
        <p className="text-xs text-error/70 mt-1">Code: {error.code}</p>
      )}
    </div>
  )
}

/* ==================== Network Error Component ==================== */
export function NetworkError({ retry }: { retry: () => void }) {
  return (
    <div className="bg-secondary/5 border-l-4 border-secondary p-4 mb-4 rounded-md">
      <p className="text-sm font-medium">Network failure</p>
      <p className="text-xs text-secondary/70 mt-1">Unable to connect to the server. Check your internet connection and try again.</p>
      <Button
        variant="outline"
        size="sm"
        onClick={retry}
        className="mt-2"
      >
        Retry
      </Button>
    </div>
  )
}

/* ==================== Empty State Component ==================== */
export function EmptyState({
  icon,
  title,
  description,
  buttonText,
  buttonOnClick,
}: {
  icon: React.ReactNode
  title: string
  description: string
  buttonText?: string
  buttonOnClick?: () => void
}) {
  return (
    <div className="text-center py-12">
      <div className="h-16 w-16 rounded-md flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-secondary/70 mb-6">{description}</p>
      {buttonText && buttonOnClick && (
        <Button onClick={buttonOnClick}>{buttonText}</Button>
      )}
    </div>
  )
}

/* ==================== Skeleton Loader ==================== */
export function SkeletonLoader({
  width,
  height,
  className,
}: {
  width?: string
  height?: string
  className?: string
}) {
  const size = {
    width: width || '100%',
    height: height || '1rem',
  }

  return (
    <div
      className={cn(
        'animate-pulse bg-secondary/50 rounded-md',
        className,
      )}
      style={{ width: size.width, height: size.height }}
    />
  )
}

/* ==================== Skeleton Text ==================== */
export function SkeletonText({
  lines,
  className,
}: {
  lines?: number
  className?: string
}) {
  const lineCount = lines || 3

  return (
    <div className={cn(
      'space-y-1.5',
      className,
    )}>
      {Array.from({ length: lineCount }).map((_, i) => (
        <div key={i} className="h-6 rounded-md bg-secondary/50 animate-pulse" />
      ))}
    </div>
  )
}

/* ==================== Skeleton Image ==================== */
export function SkeletonImage({
  className,
}: {
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-md bg-secondary/50 h-48 w-full animate-pulse',
        className,
      )}
    />
  )
}

/* ==================== Confirmation Dialog (as component) ==================== */
export function ConfirmationDialog({
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: {
  title: string
  description: string
  confirmText: string
  cancelText?: string
  onConfirm: () => void
  onCancel?: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-secondary/70 mb-6">{description}</p>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel || (() => window.location.hash = '')}
          >
            {cancelText || 'Cancel'}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}