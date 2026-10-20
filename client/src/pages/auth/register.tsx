import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { registerSchema } from '@alumni-connect/shared/schemas'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from '@/lib/toast'
import { api, ApiError } from '@/services/api'

/**
 * The server's registerSchema only requires email/password/name.
 * We extend it locally for the extra UX fields (confirm password,
 * graduation year, department) collected on this screen.
 */
const formSchema = registerSchema
  .extend({
    confirmPassword: z.string().min(1, 'Confirm your password is required'),
    graduationYear: z.coerce
      .number()
      .int('Graduation year must be a whole number')
      .min(1950, 'Graduation year must be 1950 or later')
      .max(new Date().getFullYear() + 5, 'Graduation year looks incorrect')
      .optional()
      .or(z.literal('').transform(() => undefined)),
    department: z.string().max(100).optional(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof formSchema>

export function RegisterPage() {
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
    defaultValues: { email: '', password: '', confirmPassword: '', name: '', department: '' },
  })

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    try {
      await api.post('/auth/register', {
        email: data.email,
        password: data.password,
        name: data.name,
      })
      toast({
        title: 'Registration Successful',
        description: 'Your account has been created. Please sign in.',
        variant: 'success',
      })
      navigate('/login')
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: error instanceof ApiError ? error.message : 'Something went wrong',
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
          <p className="text-secondary">Create your account</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg p-6 shadow-sm space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Full Name
            </label>
            <Input
              id="name"
              {...register('name')}
              placeholder="John Doe"
              className={cn(errors.name && 'border-red-500')}
              aria-invalid={errors.name ? true : undefined}
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="john.doe@iba-suk.edu.pk"
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

          {/* Graduation Year */}
          <div>
            <label htmlFor="graduationYear" className="block text-sm font-medium mb-2">
              Graduation Year <span className="text-secondary/60">(optional)</span>
            </label>
            <Input
              id="graduationYear"
              type="number"
              {...register('graduationYear')}
              placeholder="2020"
              className={cn(errors.graduationYear && 'border-red-500')}
              aria-invalid={errors.graduationYear ? true : undefined}
            />
            {errors.graduationYear && (
              <p className="text-sm text-red-600 mt-1">{errors.graduationYear.message}</p>
            )}
          </div>

          {/* Department */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium mb-2">
              Department <span className="text-secondary/60">(optional)</span>
            </label>
            <Input
              id="department"
              {...register('department')}
              placeholder="Computer Science"
              className={cn(errors.department && 'border-red-500')}
              aria-invalid={errors.department ? true : undefined}
            />
            {errors.department && <p className="text-sm text-red-600 mt-1">{errors.department.message}</p>}
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>

          {/* Already have account link */}
          <p className="text-sm text-secondary/70 text-center">
            Already have an account?{' '}
            <Link to="/login" className="font-medium underline hover:text-primary">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}
