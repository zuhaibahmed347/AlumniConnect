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

type FormValues = z.infer<typeof loginSchema>

interface LoginResponse {
  user: { id: string; email: string; name: string; role: string }
  accessToken: string
}

const ADMIN_ROLES = new Set(['SUPER_ADMIN', 'ADMIN', 'EVENT_MANAGER', 'MODERATOR', 'MENTORSHIP_MANAGER'])

export function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    try {
      const res = await api.post<LoginResponse>('/auth/login', {
        email: data.email,
        password: data.password,
      })
      setToken(res.accessToken)
      toast({
        title: 'Sign In Successful',
        description: `Welcome back, ${res.user.name}`,
        variant: 'success',
      })
      navigate(ADMIN_ROLES.has(res.user.role) ? '/admin' : '/dashboard')
    } catch (error) {
      toast({
        title: 'Sign In Failed',
        description: error instanceof ApiError ? error.message : 'Invalid credentials',
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
          <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center mx-auto mb-4">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7l7 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">AlumniConnect</h2>
          <p className="text-secondary">Sign in to your account</p>
        </div>

        {/* Sign In Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg p-6 shadow-sm space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="Enter your email"
              className={cn(errors.email && 'border-red-500')}
              aria-invalid={errors.email ? true : undefined}
            />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="Enter your password"
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

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>

          {/* Forgot Password Link */}
          <p className="text-sm text-secondary/70 text-right">
            <Link to="/forgot-password" className="underline hover:text-primary">
              Forgot password?
            </Link>
          </p>

          {/* Register Link */}
          <p className="text-sm text-secondary/70 text-center">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium underline hover:text-primary">
              Register
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}
