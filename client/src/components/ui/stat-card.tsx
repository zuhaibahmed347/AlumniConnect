import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  /** Optional supporting caption shown under the title. */
  hint?: string
}

export function StatCard({ title, value, icon, trend, hint }: StatCardProps) {
  const trendClass =
    trend === 'up'
      ? 'text-success'
      : trend === 'down'
        ? 'text-error'
        : 'text-secondary'

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      {icon && (
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      )}
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <p className={cn('mt-1 text-sm', trendClass)}>{title}</p>
      {hint && <p className="mt-1 text-xs text-secondary/70">{hint}</p>}
    </div>
  )
}
