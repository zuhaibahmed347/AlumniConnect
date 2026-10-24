import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowUpRight,
  Bookmark,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  XCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'

export type JobTrackerStatus =
  | 'SAVED'
  | 'APPLIED'
  | 'INTERVIEWING'
  | 'ACCEPTED'
  | 'DECLINED'

export type RawApplicationStatus =
  | JobTrackerStatus
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'OFFERED'
  | 'REJECTED'
  | 'Saved'
  | 'Applied'
  | 'Interviewing'
  | 'Accepted'
  | 'Declined'

export interface TrackedJobItem {
  id: string
  jobId: string
  jobTitle: string
  company: string
  location: string
  employmentType: string
  updatedAt: string
  status: RawApplicationStatus
  referrer?: string
  stipendOrSalary?: string
}

export interface JobApplicationTrackerProps {
  /** List of tracked job applications and/or saved jobs */
  items: TrackedJobItem[]
  /** Optional callback when a student updates the tracked status of a job */
  onStatusChange?: (itemId: string, nextStatus: JobTrackerStatus) => void
  /** Optional callback when the primary empty-state CTA is clicked */
  onExploreJobs?: () => void
  /** Optional className override */
  className?: string
}

interface StatusPillConfig {
  key: JobTrackerStatus
  label: 'Saved' | 'Applied' | 'Interviewing' | 'Accepted' | 'Declined'
  pillClass: string
  dotClass: string
  icon: React.ComponentType<{ className?: string }>
}

const STATUS_PILL_CONFIG: Record<JobTrackerStatus, StatusPillConfig> = {
  SAVED: {
    key: 'SAVED',
    label: 'Saved',
    pillClass: 'border-border bg-stone text-foreground',
    dotClass: 'bg-secondary',
    icon: Bookmark,
  },
  APPLIED: {
    key: 'APPLIED',
    label: 'Applied',
    pillClass: 'border-primary/35 bg-accent/70 text-primary',
    dotClass: 'bg-primary',
    icon: Clock,
  },
  INTERVIEWING: {
    key: 'INTERVIEWING',
    label: 'Interviewing',
    pillClass: 'border-gold/50 bg-gold/15 text-foreground',
    dotClass: 'bg-gold',
    icon: Sparkles,
  },
  ACCEPTED: {
    key: 'ACCEPTED',
    label: 'Accepted',
    pillClass: 'border-primary bg-primary text-primary-foreground',
    dotClass: 'bg-primary-foreground',
    icon: CheckCircle2,
  },
  DECLINED: {
    key: 'DECLINED',
    label: 'Declined',
    pillClass: 'border-border bg-background text-secondary line-through',
    dotClass: 'bg-secondary/60',
    icon: XCircle,
  },
}

export function normalizeJobTrackerStatus(
  raw: RawApplicationStatus,
): JobTrackerStatus {
  const upper = String(raw).toUpperCase()
  if (upper === 'SAVED') return 'SAVED'
  if (
    upper === 'APPLIED' ||
    upper === 'SUBMITTED' ||
    upper === 'UNDER_REVIEW'
  ) {
    return 'APPLIED'
  }
  if (
    upper === 'INTERVIEWING' ||
    upper === 'INTERVIEW' ||
    upper === 'SHORTLISTED'
  ) {
    return 'INTERVIEWING'
  }
  if (upper === 'ACCEPTED' || upper === 'OFFERED') {
    return 'ACCEPTED'
  }
  if (upper === 'DECLINED' || upper === 'REJECTED') {
    return 'DECLINED'
  }
  return 'APPLIED'
}

const FILTER_TABS: Array<{
  id: 'ALL' | JobTrackerStatus
  label: string
}> = [
  { id: 'ALL', label: 'All Tracked' },
  { id: 'SAVED', label: 'Saved' },
  { id: 'APPLIED', label: 'Applied' },
  { id: 'INTERVIEWING', label: 'Interviewing' },
  { id: 'ACCEPTED', label: 'Accepted' },
]

const STATUS_PROGRESSION_ORDER: JobTrackerStatus[] = [
  'SAVED',
  'APPLIED',
  'INTERVIEWING',
  'ACCEPTED',
]

export const JobApplicationTracker: React.FC<JobApplicationTrackerProps> = ({
  items,
  onStatusChange,
  onExploreJobs,
  className,
}) => {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState<'ALL' | JobTrackerStatus>(
    'ALL',
  )

  const normalizedItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        normalizedStatus: normalizeJobTrackerStatus(item.status),
      })),
    [items],
  )

  const statusCounts = useMemo(() => {
    const counts: Record<'ALL' | JobTrackerStatus, number> = {
      ALL: normalizedItems.length,
      SAVED: 0,
      APPLIED: 0,
      INTERVIEWING: 0,
      ACCEPTED: 0,
      DECLINED: 0,
    }
    for (const item of normalizedItems) {
      counts[item.normalizedStatus] += 1
    }
    return counts
  }, [normalizedItems])

  const filteredItems = useMemo(() => {
    if (activeFilter === 'ALL') return normalizedItems
    return normalizedItems.filter(
      (item) => item.normalizedStatus === activeFilter,
    )
  }, [normalizedItems, activeFilter])

  return (
    <Card
      className={cn(
        'rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-card space-y-4',
        className,
      )}
    >
      {/* Header & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Briefcase className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-mono uppercase tracking-wider font-semibold text-primary">
              Job Application Tracker
            </p>
          </div>
          <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">
            Saved & Applied Career Pipeline
          </h3>
        </div>

        <Link
          to="/jobs"
          className="text-xs font-mono font-semibold text-primary hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
        >
          Open Job Board
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Status-Pill Filter Bar */}
      <div
        className="flex flex-wrap items-center gap-1.5"
        role="tablist"
        aria-label="Filter tracked jobs by status"
      >
        {FILTER_TABS.map((tab) => {
          const isSelected = activeFilter === tab.id
          const count = statusCounts[tab.id]
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setActiveFilter(tab.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-mono font-semibold transition-colors cursor-pointer',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground shadow-2xs'
                  : 'border-border bg-background text-secondary hover:border-primary/40 hover:text-foreground',
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.2 text-[10px] font-bold tabular-nums',
                  isSelected
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-stone text-foreground',
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Tracked Jobs List or Empty State */}
      {filteredItems.length === 0 ? (
        <EmptyState
          compact
          variant="jobs"
          title={
            activeFilter === 'ALL'
              ? 'No Saved or Applied Jobs Yet'
              : `No Jobs in "${
                  FILTER_TABS.find((t) => t.id === activeFilter)?.label
                }" Stage`
          }
          description={
            activeFilter === 'ALL'
              ? 'Save internships or submit a quick application to track your status from Applied to Interviewing and Accepted.'
              : 'Switch back to All Tracked or update a role status pill below.'
          }
          actionLabel={
            activeFilter === 'ALL' ? 'Explore Career Board' : 'Show All Tracked'
          }
          onAction={() => {
            if (activeFilter === 'ALL') {
              if (onExploreJobs) {
                onExploreJobs()
              } else {
                navigate('/jobs')
              }
            } else {
              setActiveFilter('ALL')
            }
          }}
        />
      ) : (
        <div className="space-y-2.5">
          {filteredItems.map((item) => {
            const pill = STATUS_PILL_CONFIG[item.normalizedStatus]
            const StatusIcon = pill.icon

            return (
              <article
                key={item.id}
                className="rounded-xl border border-border bg-background p-3.5 sm:p-4 hover:border-primary/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/jobs/${item.jobId}`}
                      className="font-display text-sm sm:text-base font-bold text-foreground hover:text-primary transition-colors truncate"
                    >
                      {item.jobTitle}
                    </Link>
                    <span className="rounded border border-border bg-stone px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-secondary font-semibold">
                      {item.employmentType.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-secondary">
                    <span className="inline-flex items-center gap-1 font-medium text-foreground">
                      <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      {item.company}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {item.location}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="h-3 w-3 shrink-0" />
                      {item.updatedAt}
                    </span>
                    {item.referrer && (
                      <span className="font-mono text-[11px] text-primary">
                        · Referrer: {item.referrer}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Clean Status-Pill UI & Stage Selector */}
                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                  {/* Status Pill */}
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-mono font-bold tracking-wide',
                      pill.pillClass,
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full shrink-0',
                        pill.dotClass,
                      )}
                      aria-hidden="true"
                    />
                    <StatusIcon className="h-3.5 w-3.5 shrink-0" />
                    <span>{pill.label}</span>
                  </span>

                  {/* Quick Stage Pill Switcher when onStatusChange is provided */}
                  {onStatusChange && (
                    <div
                      className="inline-flex items-center rounded-full border border-border bg-card p-0.5"
                      role="group"
                      aria-label={`Update status for ${item.jobTitle}`}
                    >
                      {STATUS_PROGRESSION_ORDER.map((stage) => {
                        const stageMeta = STATUS_PILL_CONFIG[stage]
                        const isCurrent = item.normalizedStatus === stage
                        return (
                          <button
                            key={stage}
                            type="button"
                            onClick={() => onStatusChange(item.id, stage)}
                            title={`Mark as ${stageMeta.label}`}
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold transition-colors cursor-pointer',
                              isCurrent
                                ? 'bg-primary text-primary-foreground'
                                : 'text-secondary hover:text-foreground',
                            )}
                          >
                            {stageMeta.label}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  <Link
                    to={`/jobs/${item.jobId}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-mono font-semibold text-foreground hover:border-primary transition-colors"
                  >
                    Details
                    <ArrowUpRight className="h-3 w-3 text-primary" />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </Card>
  )
}

export default JobApplicationTracker
