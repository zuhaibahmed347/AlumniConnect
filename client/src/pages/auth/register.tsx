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
import { motion } from 'framer-motion'

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
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      department: '',
    },
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
        description:
          error instanceof ApiError ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(13,110,91,0.08),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(217,119,6,0.07),transparent_50%)]"
      />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 26 }}
        className="max-w-lg w-full space-y-7 relative z-10 py-6"
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
            Sukkur IBA University · Verified Registry
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground mb-1.5">
            Claim Your Alumni Profile
          </h1>
          <p className="text-sm text-secondary">
            Join 5,420+ graduates across 42 countries
          </p>
        </div>

        {/* Registration Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-card space-y-5"
        >
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-xs font-semibold mb-1.5">
              Full Name
            </label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ayesha Siddiqui"
              className={cn('h-10', errors.name && 'border-error')}
              aria-invalid={errors.name ? true : undefined}
            />
            {errors.name && (
              <p className="text-xs text-error mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold mb-1.5">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="ayesha.siddiqui@iba-suk.edu.pk"
              className={cn('h-10', errors.email && 'border-error')}
              aria-invalid={errors.email ? true : undefined}
            />
            {errors.email && (
              <p className="text-xs text-error mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Passwords Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                  className={cn('h-10 pr-12', errors.password && 'border-error')}
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
                <p className="text-xs text-error mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  placeholder="••••••••"
                  className={cn(
                    'h-10 pr-12',
                    errors.confirmPassword && 'border-error',
                  )}
                  aria-invalid={errors.confirmPassword ? true : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-secondary hover:text-foreground"
                  aria-label="Toggle password visibility"
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-error mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          {/* Cohort & Department Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="graduationYear"
                className="block text-xs font-semibold mb-1.5"
              >
                Graduation Year{' '}
                <span className="text-secondary/60 font-normal">(optional)</span>
              </label>
              <Input
                id="graduationYear"
                type="number"
                {...register('graduationYear')}
                placeholder="2020"
                className={cn(
                  'h-10 font-mono tabular-nums',
                  errors.graduationYear && 'border-error',
                )}
                aria-invalid={errors.graduationYear ? true : undefined}
              />
              {errors.graduationYear && (
                <p className="text-xs text-error mt-1">
                  {errors.graduationYear.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="department"
                className="block text-xs font-semibold mb-1.5"
              >
                Department{' '}
                <span className="text-secondary/60 font-normal">(optional)</span>
              </label>
              <Input
                id="department"
                {...register('department')}
                placeholder="Computer Science"
                className={cn('h-10', errors.department && 'border-error')}
                aria-invalid={errors.department ? true : undefined}
              />
              {errors.department && (
                <p className="text-xs text-error mt-1">
                  {errors.department.message}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 text-sm font-semibold rounded-xl"
          >
            {isLoading ? 'Creating account...' : 'Create Alumni Account'}
          </Button>

          {/* Already have account link */}
          <p className="text-xs text-secondary text-center pt-2 border-t border-border">
            Already registered?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary hover:underline"
            >
              Sign In
            </Link>
          </p>
        </form>
      </motion.div>
    </main>
  )
}
