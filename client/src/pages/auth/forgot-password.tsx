import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { forgotPasswordSchema } from '@alumni-connect/shared/schemas'
import { Link } from 'react-router-dom'
import { toast } from '@/lib/toast'
import { api, ApiError } from '@/services/api'

type FormValues = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: data.email })
      setSent(true)
      toast({
        title: 'Reset Link Sent',
        description: 'If the email exists, a password reset link has been sent',
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof ApiError ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="max-w-md mx-auto w-full space-y-8">
        {/* Brand Header */}
        <div className="text-center">
          <img
            src="/images/university-logo.jpg"
            alt="Sukkur IBA University"
            className="h-12 w-12 rounded-lg object-cover mx-auto mb-4 ring-1 ring-border"
          />
          <h2 className="text-2xl font-bold tracking-tight mb-2 text-foreground">AlumniConnect</h2>
          <p className="text-secondary">Password Recovery</p>
        </div>

        {/* Forgot Password Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-card text-foreground border border-border rounded-2xl p-6 shadow-card space-y-6">
          {sent ? (
            <p className="text-sm text-secondary text-center">
              If an account exists for that email, a reset link has been sent. Check your inbox.
            </p>
          ) : (
            <>
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
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

              {/* Submit Button */}
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Sending reset link...' : 'Send Reset Link'}
              </Button>
            </>
          )}

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
