import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Circle,
  Sparkles,
  UserCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface ProfileChecklistItem {
  id: string
  label: string
  description: string
  weight: number
  completed: boolean
  actionHref: string
  actionLabel: string
}

export interface ProfileCompletionCardProps {
  /** Completion percentage from 0 to 100 */
  completionPercentage: number
  /** Optional interactive checklist items */
  checklist?: ProfileChecklistItem[]
  /** Optional handler to toggle a checklist item */
  onToggleChecklistItem?: (id: string) => void
  /** Optional handler when 'Complete Profile' is clicked (defaults to navigating to /profile) */
  onCompleteProfile?: () => void
  /** Destination route for the 'Complete Profile' button */
  completeProfileHref?: string
  /** Optional handler to reset checklist in empty/new student simulation mode */
  onResetEmptyState?: () => void
  /** Whether new-student simulation mode is currently active */
  isNewStudentEmptyMode?: boolean
  /** Optional className override */
  className?: string
}

function getReadinessTier(completionPercentage: number): {
  label: string
  badgeClass: string
} {
  const clamped = Math.max(0, Math.min(100, Math.round(completionPercentage)))
  if (clamped >= 90) {
    return {
      label: 'All-Star Student Profile',
      badgeClass: 'border-primary/40 bg-accent text-primary',
    }
  }
  if (clamped >= 65) {
    return {
      label: 'Mentor-Ready Profile',
      badgeClass: 'border-border bg-stone text-foreground',
    }
  }
  return {
    label: 'Building Foundation',
    badgeClass: 'border-border bg-background text-secondary',
  }
}

export const ProfileCompletionCard: React.FC<ProfileCompletionCardProps> = ({
  completionPercentage,
  checklist = [],
  onToggleChecklistItem,
  onCompleteProfile,
  completeProfileHref = '/profile',
  onResetEmptyState,
  isNewStudentEmptyMode = false,
  className,
}) => {
  const navigate = useNavigate()
  const normalizedPercentage = Math.max(
    0,
    Math.min(100, Math.round(completionPercentage)),
  )
  const isUnder100 = normalizedPercentage < 100
  const readinessTier = getReadinessTier(normalizedPercentage)

  const nextIncompleteStep = checklist.find((item) => !item.completed)

  const handleCompleteProfileClick = () => {
    if (onCompleteProfile) {
      onCompleteProfile()
      return
    }
    navigate(nextIncompleteStep?.actionHref || completeProfileHref)
  }

  return (
    <Card
      className={cn(
        'overflow-hidden rounded-xl border border-border shadow-card bg-card p-0',
        className,
      )}
    >
      {/* Top Radial Gauge + Linear Progress Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-br from-stone/60 via-card to-accent/25 border-b border-border/80">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary font-semibold">
                Profile Readiness
              </span>
              <span
                className={cn(
                  'inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider',
                  readinessTier.badgeClass,
                )}
              >
                {readinessTier.label}
              </span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-foreground tracking-tight">
              {isUnder100
                ? 'Complete your student profile'
                : 'Profile 100% Mentor-Ready'}
            </h3>
            <p className="text-xs text-secondary font-sans leading-relaxed">
              {isUnder100
                ? 'Students with 90%+ profile readiness receive 3x faster mentor responses and recruiter outreach.'
                : 'Your academic record, skills, and portfolio are verified and visible to Sukkur IBA alumni mentors.'}
            </p>
          </div>

          {/* Radial SVG Progress Gauge */}
          <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
            <svg
              className="w-20 h-20 -rotate-90"
              viewBox="0 0 80 80"
              role="img"
              aria-label={`Profile completion ${normalizedPercentage} percent`}
            >
              <circle
                cx="40"
                cy="40"
                r="33"
                className="stroke-border/80"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="33"
                className="stroke-primary transition-all duration-500 ease-out"
                strokeWidth="7"
                strokeDasharray={2 * Math.PI * 33}
                strokeDashoffset={
                  2 * Math.PI * 33 * (1 - normalizedPercentage / 100)
                }
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-lg font-bold text-foreground leading-none tabular-nums">
                {normalizedPercentage}%
              </span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-secondary mt-0.5">
                Ready
              </span>
            </div>
          </div>
        </div>

        {/* Continuous Progress Bar */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-sans font-medium text-secondary">
              Overall Profile Completion
            </span>
            <span className="font-mono font-semibold text-foreground tabular-nums">
              {normalizedPercentage}%
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Profile completion progress"
            aria-valuenow={normalizedPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            className="w-full h-2.5 rounded-full bg-stone overflow-hidden border border-border/60"
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${normalizedPercentage}%` }}
            />
          </div>

          {/* Segmented Milestone Bar when checklist items exist */}
          {checklist.length > 0 && (
            <div
              className="grid gap-1.5 pt-1"
              style={{
                gridTemplateColumns: `repeat(${checklist.length}, minmax(0, 1fr))`,
              }}
            >
              {checklist.map((step) => (
                <div
                  key={step.id}
                  className={cn(
                    'h-1.5 rounded-full transition-colors duration-300',
                    step.completed ? 'bg-primary/85' : 'bg-stone',
                  )}
                  title={`${step.label} (${step.weight}%)`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Prominent 'Complete Profile' CTA when completion is under 100% */}
        {isUnder100 && (
          <div className="mt-4 pt-3 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-secondary font-sans">
              <Sparkles className="w-3.5 h-3.5 text-gold shrink-0" />
              <span>
                {nextIncompleteStep
                  ? `Next step: ${nextIncompleteStep.label} (+${nextIncompleteStep.weight}%)`
                  : `${100 - normalizedPercentage}% remaining to unlock full readiness`}
              </span>
            </div>
            <Button
              size="sm"
              onClick={handleCompleteProfileClick}
              className="shrink-0"
            >
              <span>Complete Profile</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Interactive Checklist Steps */}
      {checklist.length > 0 && (
        <div className="p-4 sm:p-5 divide-y divide-border/60">
          {checklist.map((item) => (
            <div
              key={item.id}
              className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group"
            >
              <button
                type="button"
                onClick={() => onToggleChecklistItem?.(item.id)}
                className="flex items-start gap-3 text-left flex-1 min-w-0 focus:outline-none cursor-pointer"
              >
                <span className="mt-0.5 shrink-0">
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-primary fill-primary/15" />
                  ) : (
                    <Circle className="w-4 h-4 text-secondary group-hover:text-primary transition-colors" />
                  )}
                </span>
                <div className="min-w-0">
                  <p
                    className={cn(
                      'text-xs sm:text-sm font-semibold font-sans transition-colors truncate',
                      item.completed
                        ? 'text-secondary line-through'
                        : 'text-foreground group-hover:text-primary',
                    )}
                  >
                    {item.label}
                  </p>
                  <p className="text-[11px] text-secondary font-sans truncate">
                    {item.description}
                  </p>
                </div>
              </button>

              {!item.completed ? (
                <button
                  type="button"
                  onClick={() => navigate(item.actionHref)}
                  className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent/60 hover:bg-primary hover:text-primary-foreground text-primary font-sans text-xs font-semibold transition-colors cursor-pointer"
                >
                  {item.actionLabel}
                  <ArrowRight className="w-3 h-3" />
                </button>
              ) : (
                <span className="font-mono text-[10px] uppercase tracking-wider text-primary font-semibold shrink-0">
                  +{item.weight}%
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer Banner */}
      <div className="px-5 py-3 bg-stone/40 border-t border-border/70 flex items-center justify-between gap-2">
        <span className="text-[11px] text-secondary font-sans flex items-center gap-1.5">
          {isUnder100 ? (
            <>
              <Award className="w-3.5 h-3.5 text-gold shrink-0" />
              Click any item to toggle completion or finish setup in your profile
            </>
          ) : (
            <>
              <UserCheck className="w-3.5 h-3.5 text-primary shrink-0" />
              All profile milestones completed — you have priority visibility
            </>
          )}
        </span>
        {isNewStudentEmptyMode && onResetEmptyState && (
          <button
            type="button"
            onClick={onResetEmptyState}
            className="text-[11px] font-semibold text-primary hover:underline shrink-0 cursor-pointer"
          >
            Reset empty state
          </button>
        )}
      </div>
    </Card>
  )
}

export default ProfileCompletionCard
