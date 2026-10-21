import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { loginSchema } from '@alumni-connect/shared/schemas'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from '@/lib/toast'
import { api, setToken, ApiError } from '@/services/api'
import { motion } from 'framer-motion'

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
        description:
          error instanceof ApiError ? error.message : 'Invalid credentials',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute top-4 right-4 z-20">
        <ThemeSwitcher />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(13,110,91,0.08),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(217,119,6,0.07),transparent_50%)]"
      />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 26 }}
        className="max-w-md w-full space-y-7 relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-block mb-4">
            <img
              src="/images/university-logo.jpg"
              alt="Sukkur IBA University"
              className="h-12 w-12 rounded-xl object-cover mx-auto ring-1 ring-border shadow-sm"
            />
          </Link>
          <p className="text-xs font-mono uppercase tracking-wider text-primary mb-1">
            Sukkur IBA University
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground mb-1.5">
            Welcome back to AlumniConnect
          </h1>
          <p className="text-sm text-secondary">
            Sign in to access the alumni directory, mentorship, and referrals
          </p>
        </div>

        {/* Sign In Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-card text-foreground rounded-2xl border border-border p-6 sm:p-8 shadow-card space-y-5"
        >
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-foreground mb-2">
              Institutional or Personal Email
            </label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="name@iba-suk.edu.pk"
              className={cn('h-10', errors.email && 'border-error')}
              aria-invalid={errors.email ? true : undefined}
            />
            {errors.email && (
              <p className="text-xs text-error mt-1.5">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-xs font-semibold text-foreground">
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
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="Enter your password"
                className={cn('h-10 pr-14', errors.password && 'border-error')}
                aria-invalid={errors.password ? true : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-secondary hover:text-foreground"
                aria-label="Toggle password visibility"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-error mt-1.5">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 text-sm font-semibold rounded-xl"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>

          {/* Register Link */}
          <p className="text-xs text-secondary text-center pt-2 border-t border-border">
            New to the alumni network?{' '}
            <Link
              to="/register"
              className="font-semibold text-primary hover:underline"
            >
              Claim your profile
            </Link>
          </p>
        </form>
      </motion.div>
    </main>
  )
}
