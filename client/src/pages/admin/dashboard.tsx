import { RoleShell } from '@/components/layout/role-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CampusNewsTicker } from '@/components/ui/campus-news-ticker'
import { PerformanceSummaryCard } from '@/components/admin/PerformanceSummaryCard'
import { InstitutionalAnalyticsModule } from '@/pages/admin/analytics'
import {
  MENTORS_CATALOG,
  loadMentorshipRequests,
} from '@/lib/mentorship-data'
import {
  ALUMNI_DETAILED_CATALOG,
  loadEmployerJobs,
  loadJobApplications,
} from '@/lib/role-context'
import { toast } from '@/lib/toast'
import { api } from '@/services/api'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUpRight,
  BarChart3,
  Briefcase,
  Calendar,
  CheckCircle2,
  Compass,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

interface ModerationQueueItem {
  id: string
  category: 'USER_VERIFICATION' | 'EMPLOYER_APPROVAL' | 'JOB_MODERATION' | 'EVENT_REVIEW'
  title: string
  submittedBy: string
  submittedAt: string
  detail: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}

export function AdminDashboardPage() {
  const navigate = useNavigate()

  const mentorshipRequests = loadMentorshipRequests()
  const employerJobs = loadEmployerJobs()
  const applications = loadJobApplications()

  const [moderationQueue, setModerationQueue] = useState<ModerationQueueItem[]>(
    [
      {
        id: 'mod-1',
        category: 'USER_VERIFICATION',
        title: 'Alumni Degree Verification — Saba Ahmed (BBA ’19)',
        submittedBy: 'saba.ahmed@iba-suk.edu.pk',
        submittedAt: '2 hours ago',
        detail: 'Transcript & Registrar Roll #SIBA-2015-0842 matched against convocation ledger.',
        status: 'PENDING',
      },
      {
        id: 'mod-2',
        category: 'EMPLOYER_APPROVAL',
        title: 'Employer Partner Request — Menapay Ventures',
        submittedBy: 'Sanaullah Memon (VP Product · Dubai Chapter)',
        submittedAt: '5 hours ago',
        detail: 'Requesting recruiter posting privileges for Summer 2026 FinTech Fellowship.',
        status: 'PENDING',
      },
      {
        id: 'mod-3',
        category: 'JOB_MODERATION',
        title: 'Job Posting Review — Graduate Software Engineer (TechCorp)',
        submittedBy: 'Engr. Tariq Mahmood (BSCS ’15)',
        submittedAt: 'Yesterday',
        detail: 'Verified compensation band (PKR 240k–320k/mo) and Sukkur/Karachi hybrid hub.',
        status: 'PENDING',
      },
    ],
  )

  const [confirmingItem, setConfirmingItem] = useState<{
    item: ModerationQueueItem
    decision: 'APPROVED' | 'REJECTED'
  } | null>(null)
  const [moderationReason, setModerationReason] = useState('')

  const [auditLogs, setAuditLogs] = useState([
    {
      id: 'log-1',
      actor: 'Usman Khan (SUPER_ADMIN)',
      action: 'Verified Alumni Batch 2020 Registrar CSV (48 records)',
      time: 'Today · 11:20 PKT',
    },
    {
      id: 'log-2',
      actor: 'Dr. Sarah Khan (MENTORSHIP_MANAGER)',
      action: 'Published Cohort IX Systems Engineering Track syllabus',
      time: 'Yesterday · 18:45 PKT',
    },
    {
      id: 'log-3',
      actor: 'System Security Monitor',
      action: 'Enforced RBAC permissions matrix across 6 institutional roles',
      time: 'Oct 20, 2026',
    },
  ])

  useEffect(() => {
    void api
      .get<{ queue?: ModerationQueueItem[]; auditLogs?: any[] }>('/admin/moderation')
      .then((res) => {
        if (Array.isArray(res?.queue) && res.queue.length > 0) {
          setModerationQueue(res.queue)
        }
        if (Array.isArray(res?.auditLogs) && res.auditLogs.length > 0) {
          setAuditLogs(
            res.auditLogs.slice(0, 8).map((l: any) => ({
              id: l.id,
              actor: l.user?.name ? `${l.user.name} (ADMIN)` : 'Usman Khan (SUPER_ADMIN)',
              action: l.action,
              time: l.createdAt
                ? new Date(l.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Just now',
            }))
          )
        }
      })
      .catch(() => {})
  }, [])

  const handleConfirmModeration = () => {
    if (!confirmingItem) return
    const { item, decision } = confirmingItem
    setModerationQueue((prev) =>
      prev.map((q) => (q.id === item.id ? { ...q, status: decision } : q)),
    )
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        actor: 'Usman Khan (ADMIN)',
        action: `${decision}: ${item.title}${
          moderationReason.trim() ? ` — Reason: ${moderationReason.trim()}` : ''
        }`,
        time: 'Just now',
      },
      ...prev,
    ])
    void api
      .post(`/admin/moderation/${item.id}/decide`, {
        decision,
        reason: moderationReason.trim(),
        title: item.title,
      })
      .catch(() => {})
    setConfirmingItem(null)
    setModerationReason('')
    toast({
      title:
        decision === 'APPROVED'
          ? 'Verification / Moderation Approved'
          : 'Submission Rejected',
      description: `${item.title} marked as ${decision} and recorded in the institutional audit log.`,
      variant: decision === 'APPROVED' ? 'success' : 'default',
    })
  }

  const pendingQueue = moderationQueue.filter((q) => q.status === 'PENDING')

  const kpiCards = [
    {
      label: 'Total Platform Users',
      value: '5,420',
      sub: '3,840 Alumni · 1,490 Students · 90 Staff',
      to: '/admin/users',
    },
    {
      label: 'Verified Alumni & Students',
      value: `${ALUMNI_DETAILED_CATALOG.length} Featured`,
      sub: '94.2% Registrar-verified accounts',
      to: '/admin/users',
    },
    {
      label: 'Active Guild Mentors',
      value: `${MENTORS_CATALOG.length} Chairs`,
      sub: `${mentorshipRequests.length} tracked mentorship pairings`,
      to: '/admin/mentorship',
    },
    {
      label: 'Employers & Job Postings',
      value: `${employerJobs.length} Active`,
      sub: `${applications.length} candidate applications tracked`,
      to: '/admin/jobs',
    },
  ]

  const managementShortcuts = [
    {
      title: 'User & Verification Management',
      desc: 'Search alumni & students, verify degrees, and manage account statuses.',
      to: '/admin/users',
      icon: Users,
    },
    {
      title: 'Roles & Permissions Matrix',
      desc: 'Inspect RBAC hierarchy across Super Admin, Admin, Moderator, and Member.',
      to: '/admin/roles',
      icon: Sparkles,
    },
    {
      title: 'Event Administration',
      desc: 'Create, publish, and archive campus reunions, workshops, and webinars.',
      to: '/admin/events',
      icon: Calendar,
    },
    {
      title: 'Job & Employer Moderation',
      desc: 'Review employer postings, verify organizations, and audit referrals.',
      to: '/admin/jobs',
      icon: Briefcase,
    },
    {
      title: 'Mentorship Oversight',
      desc: 'Monitor mentor-mentee pairings, cohort capacity, and reported issues.',
      to: '/admin/mentorship',
      icon: Compass,
    },
    {
      title: 'Analytics & Institutional Reports',
      desc: 'Cohort growth, placement velocity, and regional chapter engagement.',
      to: '/admin/analytics',
      icon: BarChart3,
    },
    {
      title: 'Platform Settings & Audit',
      desc: 'Configure registration policies, verification rules, and security.',
      to: '/admin/settings',
      icon: Settings,
    },
    {
      title: 'Administrator Profile & Security',
      desc: 'Manage admin credentials, active sessions, and access logs.',
      to: '/admin/profile',
      icon: UserCheck,
    },
  ]

  return (
    <RoleShell
      role="ADMIN"
      title="Institutional Administration Portal"
      subtitle="Sukkur IBA University · Office of Alumni Relations & Career Governance"
      badge="Role: SUPER_ADMIN"
      headerActions={
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate('/admin/command-center')}
        >
          Command Center View
        </Button>
      }
    >
      {/* Live Campus News & Institutional Telemetry */}
      <CampusNewsTicker />

      {/* 1. Executive KPI Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="rounded-2xl border border-border bg-card p-5 shadow-card hover:border-primary/50 transition-colors block"
          >
            <div className="flex items-center justify-between text-xs font-mono text-primary font-semibold">
              <span>{card.label}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
            <p className="font-mono text-2xl sm:text-3xl font-bold text-foreground mt-2 tabular-nums">
              {card.value}
            </p>
            <p className="text-xs text-secondary mt-1">{card.sub}</p>
          </Link>
        ))}
      </section>

      {/* 1.5 24-Hour API Error Rate & Performance Summary Card (From Performance Logging Middleware) */}
      <PerformanceSummaryCard />

      {/* 2. Pending Verification & Moderation Queue + Audit Log */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider font-semibold text-primary flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5" />
                Governance & Verification Queue
              </p>
              <h2 className="font-display text-xl font-bold text-foreground">
                Pending Moderation Tasks ({pendingQueue.length})
              </h2>
            </div>
            <Link
              to="/admin/users"
              className="text-xs font-mono font-semibold text-primary hover:underline"
            >
              Open Full User Table
            </Link>
          </div>

          {pendingQueue.length === 0 ? (
            <div className="rounded-xl border border-border bg-background p-6 text-center space-y-2">
              <ShieldCheck className="h-6 w-6 text-primary mx-auto" />
              <p className="text-sm font-semibold text-foreground">
                All pending verification and moderation tasks are complete
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingQueue.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-border bg-background p-4 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <span className="font-bold text-primary">
                      {item.category.replace('_', ' ')}
                    </span>
                    <span className="text-secondary">{item.submittedAt}</span>
                  </div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-xs text-secondary">
                    Submitted by <strong className="text-foreground">{item.submittedBy}</strong> —{' '}
                    {item.detail}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={() =>
                        setConfirmingItem({ item, decision: 'APPROVED' })
                      }
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setConfirmingItem({ item, decision: 'REJECTED' })
                      }
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1.5" />
                      Reject with Reason
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 5 Cols: Recent Administrative Audit Activity */}
        <div className="lg:col-span-5 rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
          <div className="border-b border-border pb-4">
            <p className="text-xs font-mono uppercase tracking-wider font-semibold text-primary">
              Immutable Audit Trail
            </p>
            <h2 className="font-display text-xl font-bold text-foreground">
              Recent Administrative Activity
            </h2>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-border bg-background p-3.5 space-y-1"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-primary">{log.actor}</span>
                  <span className="text-secondary">{log.time}</span>
                </div>
                <p className="text-xs text-foreground leading-relaxed">
                  {log.action}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2.5 Embedded Institutional Analytics & Telemetry Module */}
      <InstitutionalAnalyticsModule embedded={true} />

      {/* 3. Administrative Modules Directory */}
      <section className="space-y-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider font-semibold text-primary">
            Role-Scoped Control Planes
          </p>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Administrative Modules & Oversight Consoles
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {managementShortcuts.map((mod) => {
            const Icon = mod.icon
            return (
              <Link
                key={mod.to}
                to={mod.to}
                className="rounded-2xl border border-border bg-card p-5 shadow-card hover:border-primary/60 transition-colors flex flex-col justify-between gap-3 group"
              >
                <div className="space-y-2">
                  <div className="h-9 w-9 rounded-xl border border-border bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-secondary leading-relaxed">
                    {mod.desc}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-primary">
                  Open Module
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Confirmation Modal for Consequential Moderation Actions */}
      <AnimatePresence>
        {confirmingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setConfirmingItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
            >
              <h3 className="font-display text-lg font-bold text-foreground">
                Confirm Moderation Action ({confirmingItem.decision})
              </h3>
              <p className="text-xs text-secondary">
                Target: <strong className="text-foreground">{confirmingItem.item.title}</strong>
              </p>
              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-foreground mb-1">
                  Audit Reason / Moderation Note
                </label>
                <Input
                  value={moderationReason}
                  onChange={(e) => setModerationReason(e.target.value)}
                  placeholder="Enter verification reference or moderation reason..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmingItem(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant={
                    confirmingItem.decision === 'REJECTED'
                      ? 'destructive'
                      : 'default'
                  }
                  onClick={handleConfirmModeration}
                >
                  Confirm {confirmingItem.decision}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </RoleShell>
  )
}