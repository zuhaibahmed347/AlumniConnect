import reactToast from 'react-hot-toast'

export interface ToastOptions {
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'error'
}

/**
 * Lightweight toast adapter with the same call shape the auth screens use
 * (`toast({ title, description, variant })`), backed by react-hot-toast.
 */
export function toast(options: ToastOptions | string) {
  if (typeof options === 'string') {
    return reactToast(options)
  }
  const { title, description, variant } = options
  const message = [title, description].filter(Boolean).join(' — ')
  switch (variant) {
    case 'destructive':
    case 'error':
      return reactToast.error(message || 'Something went wrong')
    case 'success':
      return reactToast.success(message || 'Done')
    case 'warning':
      return reactToast(message, { icon: '⚠️' })
    default:
      return reactToast(message)
  }
}

toast.success = reactToast.success
toast.error = reactToast.error
toast.loading = reactToast.loading
toast.dismiss = reactToast.dismiss
