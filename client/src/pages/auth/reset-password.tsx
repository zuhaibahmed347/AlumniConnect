import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { resetPasswordSchema } from '@alumni-connect/shared/schemas'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { toast } from '@/lib/toast'
import { api, ApiError } from '@/services/api'

/** The server expects { token, password }; the token comes from the reset link URL. */
const formSchema = resetPasswordSchema.extend({
  confirmPassword: z.string().min(1, 'Confirm your password is required'),
}).refine((values) => values.password === values.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type FormValues = z.infer<typeof formSchema>

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password: data.password })
      toast({
        title: 'Password Reset Successful',
        description: 'Your password has been reset. You can now sign in.',
        variant: 'success',
      })
      navigate('/login')
    } catch (error) {
      toast({
        title: 'Reset Failed',
        description: error instanceof ApiError ? error.message : 'Invalid or expired token',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-md mx-auto w-full space-y-8">
        {/* Brand Header */}
        <div className="text-center">
          <img
            src="/images/university-logo.jpg"
            alt="Sukkur IBA University"
            className="h-12 w-12 rounded-lg object-cover mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold tracking-tight mb-2">AlumniConnect</h2>
          <p className="text-secondary">Reset your password</p>
        </div>

        {/* Reset Password Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg p-6 shadow-sm space-y-6">
          {!token && (
            <p className="text-sm text-red-600">
              This reset link is missing its token. Please open the link from your email again.
            </p>
          )}

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              New Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="••••••••"
                className={cn(errors.password && 'border-red-500')}
                aria-invalid={errors.password ? true : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
                aria-label="Toggle password visibility">
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                placeholder="••••••••"
                className={cn(errors.confirmPassword && 'border-red-500')}
                aria-invalid={errors.confirmPassword ? true : undefined}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
                aria-label="Toggle password visibility">
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading || !token} className="w-full">
            {isLoading ? 'Resetting password...' : 'Reset Password'}
          </Button>

          {/* Back to Sign In Link */}
          <p className="text-sm text-secondary/70 text-center">
            <Link to="/login" className="font-medium underline hover:text-primary">
              Back to Sign In
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}
