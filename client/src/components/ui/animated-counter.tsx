import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface AnimatedCounterProps {
  /** Target numeric value to count up or interpolate to. */
  value: number
  /** Optional prefix such as '$' or '+' */
  prefix?: string
  /** Optional suffix such as '+', '%', or 'k' */
  suffix?: string
  /** Number of decimal places (default: 0) */
  decimals?: number
  /** Animation duration in seconds (default: 1.6) */
  duration?: number
  /** Additional classes for the counter element */
  className?: string
}

/**
 * Scroll-triggered animated numeric counter.
 *
 * - Triggers automatically when scrolled into the viewport (`useInView`).
 * - Smoothly interpolates whenever `value` changes (e.g. switching regional filters).
 * - Uses `tabular-nums` so digits never shift horizontally during animation.
 * - Respects `prefers-reduced-motion` by displaying the target number immediately.
 */
export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1.6,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.35 })
  const prefersReducedMotion = useReducedMotion()
  const [displayValue, setDisplayValue] = useState<number>(
    prefersReducedMotion ? value : 0,
  )
  const previousValueRef = useRef<number>(0)

  useEffect(() => {
    if (!isInView) return

    if (prefersReducedMotion) {
      setDisplayValue(value)
      previousValueRef.current = value
      return
    }

    const startValue = previousValueRef.current
    const controls = animate(startValue, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setDisplayValue(latest)
      },
      onComplete: () => {
        setDisplayValue(value)
        previousValueRef.current = value
      },
    })

    return () => {
      controls.stop()
      previousValueRef.current = value
    }
  }, [isInView, value, duration, prefersReducedMotion])

  const formatted = displayValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  const finalFormatted = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <span
      ref={ref}
      aria-label={`${prefix}${finalFormatted}${suffix}`}
      className={cn('font-mono tabular-nums tracking-tight', className)}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
