import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type EmptyStateIllustrationVariant =
  | 'connections'
  | 'jobs'
  | 'events'
  | 'mentorship'
  | 'default'

export interface EmptyStateProps {
  title: string
  description: string
  badge?: string
  variant?: EmptyStateIllustrationVariant
  icon?: LucideIcon
  actionLabel?: string
  onAction?: () => void
  actionHref?: string
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  secondaryActionHref?: string
  compact?: boolean
  className?: string
  children?: ReactNode
}

function EmptyStateIllustration({
  variant,
  Icon,
}: {
  variant: EmptyStateIllustrationVariant
  Icon?: LucideIcon
}) {
  if (Icon) {
    return (
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/25 bg-accent/80 text-primary shadow-xs">
        <Icon className="h-7 w-7" />
      </div>
    )
  }

  if (variant === 'connections') {
    return (
      <svg
        viewBox="0 0 120 88"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="mx-auto h-20 w-28"
      >
        {/* Soft background halo */}
        <rect
          x="14"
          y="10"
          width="92"
          height="68"
          rx="18"
          className="fill-accent/70 stroke-primary/25"
          strokeWidth="1.5"
        />
        {/* Connecting dashed network lines */}
        <path
          d="M42 46L60 32L78 46"
          className="stroke-primary/50"
          strokeWidth="2"
          strokeDasharray="3 3"
          strokeLinecap="round"
        />
        <path
          d="M42 46H78"
          className="stroke-gold/70"
          strokeWidth="1.75"
          strokeDasharray="2 3"
          strokeLinecap="round"
        />
        {/* Left Node */}
        <circle
          cx="38"
          cy="48"
          r="11"
          className="fill-card stroke-primary"
          strokeWidth="2"
        />
        <circle cx="38" cy="45" r="3.5" className="fill-primary" />
        <path
          d="M32.5 53.5C33.8 51.2 35.7 50 38 50C40.3 50 42.2 51.2 43.5 53.5"
          className="stroke-primary"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        {/* Top Center Node (Gold Accent) */}
        <circle
          cx="60"
          cy="29"
          r="10"
          className="fill-card stroke-gold"
          strokeWidth="2"
        />
        <circle cx="60" cy="26.5" r="3" className="fill-gold" />
        <path
          d="M55.2 34C56.3 32.1 58 31.2 60 31.2C62 31.2 63.7 32.1 64.8 34"
          className="stroke-gold"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        {/* Right Node */}
        <circle
          cx="82"
          cy="48"
          r="11"
          className="fill-card stroke-primary"
          strokeWidth="2"
        />
        <circle cx="82" cy="45" r="3.5" className="fill-primary" />
        <path
          d="M76.5 53.5C77.8 51.2 79.7 50 82 50C84.3 50 86.2 51.2 87.5 53.5"
          className="stroke-primary"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  if (variant === 'jobs') {
    return (
      <svg
        viewBox="0 0 120 88"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="mx-auto h-20 w-28"
      >
        <rect
          x="14"
          y="10"
          width="92"
          height="68"
          rx="18"
          className="fill-stone stroke-border"
          strokeWidth="1.5"
        />
        {/* Briefcase body */}
        <rect
          x="34"
          y="32"
          width="44"
          height="30"
          rx="6"
          className="fill-card stroke-primary"
          strokeWidth="2"
        />
        {/* Briefcase handle */}
        <path
          d="M48 32V27C48 25.3431 49.3431 24 51 24H61C62.6569 24 64 25.3431 64 27V32"
          className="stroke-primary"
          strokeWidth="2"
        />
        <path d="M34 44H78" className="stroke-primary/40" strokeWidth="1.75" />
        {/* Search lens badge */}
        <circle
          cx="77"
          cy="55"
          r="10"
          className="fill-accent stroke-gold"
          strokeWidth="2"
        />
        <path
          d="M84 62L90 68"
          className="stroke-gold"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  if (variant === 'events') {
    return (
      <svg
        viewBox="0 0 120 88"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="mx-auto h-20 w-28"
      >
        <rect
          x="14"
          y="10"
          width="92"
          height="68"
          rx="18"
          className="fill-accent/65 stroke-primary/25"
          strokeWidth="1.5"
        />
        <rect
          x="36"
          y="24"
          width="48"
          height="42"
          rx="7"
          className="fill-card stroke-primary"
          strokeWidth="2"
        />
        <path d="M36 35H84" className="stroke-primary" strokeWidth="2" />
        <path
          d="M47 20V27M73 20V27"
          className="stroke-gold"
          strokeWidth="2.25"
          strokeLinecap="round"
        />
        <circle cx="50" cy="45" r="2.5" className="fill-primary" />
        <circle cx="60" cy="45" r="2.5" className="fill-gold" />
        <circle cx="70" cy="45" r="2.5" className="fill-primary/50" />
        <circle cx="50" cy="54" r="2.5" className="fill-primary/50" />
        <circle cx="60" cy="54" r="2.5" className="fill-primary" />
      </svg>
    )
  }

  // Default / Mentorship compass illustration
  return (
    <svg
      viewBox="0 0 120 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="mx-auto h-20 w-28"
    >
      <rect
        x="14"
        y="10"
        width="92"
        height="68"
        rx="18"
        className="fill-accent/70 stroke-primary/25"
        strokeWidth="1.5"
      />
      <circle
        cx="60"
        cy="44"
        r="20"
        className="fill-card stroke-primary"
        strokeWidth="2"
      />
      <polygon
        points="60,31 66,44 60,57 54,44"
        className="fill-gold/25 stroke-gold"
        strokeWidth="1.75"
      />
      <circle cx="60" cy="44" r="3" className="fill-primary" />
    </svg>
  )
}

export function EmptyState({
  title,
  description,
  badge,
  variant = 'default',
  icon,
  actionLabel,
  onAction,
  actionHref,
  secondaryActionLabel,
  onSecondaryAction,
  secondaryActionHref,
  compact = false,
  className,
  children,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className={cn(
        'rounded-2xl border border-border bg-card text-center shadow-card flex flex-col items-center justify-center',
        compact ? 'p-6 space-y-3' : 'p-8 sm:p-10 space-y-4',
        className,
      )}
    >
      <EmptyStateIllustration variant={variant} Icon={icon} />

      <div className="space-y-1.5 max-w-lg mx-auto">
        {badge && (
          <p className="text-[11px] font-mono uppercase tracking-widest font-bold text-primary">
            {badge}
          </p>
        )}
        <h3
          className={cn(
            'font-display font-bold text-foreground',
            compact ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl',
          )}
        >
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-secondary leading-relaxed">
          {description}
        </p>
      </div>

      {(actionLabel || secondaryActionLabel || children) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          {actionLabel &&
            (actionHref ? (
              <Link to={actionHref}>
                <Button size={compact ? 'sm' : 'default'}>{actionLabel}</Button>
              </Link>
            ) : (
              <Button size={compact ? 'sm' : 'default'} onClick={onAction}>
                {actionLabel}
              </Button>
            ))}

          {secondaryActionLabel &&
            (secondaryActionHref ? (
              <Link to={secondaryActionHref}>
                <Button variant="outline" size={compact ? 'sm' : 'default'}>
                  {secondaryActionLabel}
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                size={compact ? 'sm' : 'default'}
                onClick={onSecondaryAction}
              >
                {secondaryActionLabel}
              </Button>
            ))}

          {children}
        </div>
      )}
    </motion.div>
  )
}

export default EmptyState
