import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  Newspaper,
  ExternalLink,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  Globe2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface GroundedSource {
  title: string
  uri: string
}

export interface CampusNewsHeadline {
  id: string
  title: string
  category: string
  summary: string
  dateLabel: string
  sourceTitle: string
  sourceUrl: string
}

export interface CampusNewsPayload {
  topic: string
  updatedAt: string
  headlines: CampusNewsHeadline[]
  sources: GroundedSource[]
  grounded: boolean
}

type NewsTopic = 'all' | 'academics' | 'admissions' | 'research'

const TOPICS: readonly { id: NewsTopic; label: string }[] = [
  { id: 'all', label: 'All Campus News' },
  { id: 'academics', label: 'Academics & Rankings' },
  { id: 'admissions', label: 'Admissions & Scholarships' },
  { id: 'research', label: 'Research & AI' },
] as const

export function CampusNewsTicker() {
  const prefersReducedMotion = useReducedMotion()
  const [topic, setTopic] = useState<NewsTopic>('all')
  const [data, setData] = useState<CampusNewsPayload | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [activeIndex, setActiveIndex] = useState<number>(0)
  const [direction, setDirection] = useState<number>(1)
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  const fetchCampusNews = useCallback(
    async (selectedTopic: NewsTopic, forceRefresh = false) => {
      if (forceRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      try {
        const params = new URLSearchParams({ topic: selectedTopic })
        if (forceRefresh) {
          params.set('refresh', 'true')
        }
        const response = await fetch(`/api/campus-news?${params.toString()}`)
        const json = await response.json()

        if (!response.ok || !json.success) {
          throw new Error(
            json?.error?.message ||
              `Failed to fetch campus news (HTTP ${response.status})`,
          )
        }

        setData(json.data as CampusNewsPayload)
        setActiveIndex(0)
      } catch (err: any) {
        setError(
          err?.message ||
            'Unable to load grounded Sukkur IBA University news headlines right now.',
        )
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [],
  )

  useEffect(() => {
    fetchCampusNews(topic, false)
  }, [topic, fetchCampusNews])

  const headlines = data?.headlines || []
  const sources = data?.sources || []
  const totalHeadlines = headlines.length

  const stepHeadline = useCallback(
    (delta: number) => {
      if (totalHeadlines <= 1) return
      setDirection(delta)
      setActiveIndex((prev) => (prev + delta + totalHeadlines) % totalHeadlines)
    },
    [totalHeadlines],
  )

  // Auto-rotate ticker every 5.5 seconds unless paused, expanded, or reduced motion
  useEffect(() => {
    if (
      loading ||
      isPaused ||
      isExpanded ||
      prefersReducedMotion ||
      totalHeadlines <= 1
    ) {
      return
    }
    const timer = window.setInterval(() => {
      stepHeadline(1)
    }, 5500)
    return () => window.clearInterval(timer)
  }, [loading, isPaused, isExpanded, prefersReducedMotion, totalHeadlines, stepHeadline])

  const currentHeadline = headlines[activeIndex]

  return (
    <section
      aria-label="Sukkur IBA University Live Campus News Ticker"
      className="rounded-2xl border border-border bg-card shadow-card overflow-hidden"
    >
      {/* Top Bar: Ticker Label + Topic Filters + Playback & Refresh Controls */}
      <div className="px-4 sm:px-6 py-3 border-b border-border bg-stone/45 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
          </span>
          <Newspaper className="h-4 w-4 text-primary shrink-0" />
          <span className="font-display text-xs sm:text-sm font-bold tracking-tight text-foreground">
            Campus News
          </span>
          <span aria-hidden="true" className="text-border">
            ·
          </span>
          <span className="text-xs font-mono text-secondary tabular-nums">
            Sukkur IBA University · Google Search Grounded
          </span>
        </div>

        {/* Topic Filter Buttons & Refresh */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div
            role="tablist"
            aria-label="Campus news topic filter"
            className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-background border border-border"
          >
            {TOPICS.map((t) => {
              const active = topic === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTopic(t.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-primary text-white font-semibold shadow-sm'
                      : 'text-secondary hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              )
            })}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading || refreshing}
            onClick={() => fetchCampusNews(topic, true)}
            aria-label="Refresh grounded campus news"
            className="h-8 px-2.5"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 mr-1 ${refreshing ? 'animate-spin text-primary' : ''}`}
            />
            <span>{refreshing ? 'Searching...' : 'Refresh'}</span>
          </Button>
        </div>
      </div>

      {/* Main Ticker Bar */}
      <div className="px-4 sm:px-6 py-3.5">
        {loading ? (
          <div className="flex items-center justify-between gap-4 py-1">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <RefreshCw className="h-4 w-4 animate-spin text-primary shrink-0" />
              <div className="space-y-1.5 flex-1 max-w-xl">
                <div className="h-4 w-3/4 rounded bg-stone animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-stone/70 animate-pulse" />
              </div>
            </div>
            <span className="text-xs font-mono text-secondary tabular-nums shrink-0">
              Searching live Sukkur IBA headlines...
            </span>
          </div>
        ) : error ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1 text-xs">
            <div className="flex items-center gap-2 text-error">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fetchCampusNews(topic, true)}
            >
              Retry Search
            </Button>
          </div>
        ) : currentHeadline ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Sliding Headline Stage */}
            <div className="min-w-0 flex-1 overflow-hidden">
              <AnimatePresence mode="wait" initial={false} custom={direction}>
                <motion.div
                  key={`${topic}-${currentHeadline.id}`}
                  custom={direction}
                  initial={{
                    y: direction > 0 ? 18 : -18,
                    opacity: 0,
                  }}
                  animate={{
                    y: 0,
                    opacity: 1,
                  }}
                  exit={{
                    y: direction > 0 ? -18 : 18,
                    opacity: 0,
                  }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col gap-1"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-secondary tabular-nums">
                    <span className="text-primary font-semibold">
                      0{activeIndex + 1} / 0{totalHeadlines}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-foreground">
                      {currentHeadline.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{currentHeadline.dateLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate max-w-[220px]">
                      Source: {currentHeadline.sourceTitle}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2.5 min-w-0">
                    <a
                      href={currentHeadline.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-display text-sm sm:text-base font-bold text-foreground hover:text-primary transition-colors truncate"
                    >
                      {currentHeadline.title}
                    </a>
                    <a
                      href={currentHeadline.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Read source for ${currentHeadline.title}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline shrink-0"
                    >
                      <span>Source</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <p className="text-xs text-secondary truncate">
                    {currentHeadline.summary}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Ticker Navigation & Expand Controls */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-1">
                <button
                  type="button"
                  onClick={() => stepHeadline(-1)}
                  aria-label="Previous headline"
                  className="p-1.5 rounded-lg text-secondary hover:text-foreground hover:bg-stone transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaused((p) => !p)}
                  aria-label={isPaused ? 'Resume news ticker' : 'Pause news ticker'}
                  className="p-1.5 rounded-lg text-secondary hover:text-foreground hover:bg-stone transition-colors"
                >
                  {isPaused ? (
                    <Play className="h-3.5 w-3.5 text-primary fill-primary" />
                  ) : (
                    <Pause className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => stepHeadline(1)}
                  aria-label="Next headline"
                  className="p-1.5 rounded-lg text-secondary hover:text-foreground hover:bg-stone transition-colors"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:border-primary/45 hover:bg-stone/60 transition-colors whitespace-nowrap"
              >
                <span>
                  {isExpanded
                    ? 'Hide Feed'
                    : `All Headlines (${totalHeadlines})`}
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-primary" />
                )}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-secondary py-1">
            No public headlines returned for this topic.
          </p>
        )}
      </div>

      {/* Expandable Full Headlines & Grounded Search Citations Drawer */}
      <AnimatePresence initial={false}>
        {isExpanded && !loading && !error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border bg-background/60"
          >
            <div className="p-4 sm:p-6 space-y-5">
              {/* Mobile/Tablet Topic Selector */}
              <div className="flex lg:hidden flex-wrap items-center gap-1.5">
                {TOPICS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTopic(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      topic === t.id
                        ? 'bg-primary text-white font-semibold'
                        : 'bg-stone text-secondary hover:text-foreground'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* All Headlines List */}
              <div className="divide-y divide-border border-t border-b border-border">
                {headlines.map((item, idx) => (
                  <div
                    key={item.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-secondary tabular-nums">
                        <span className="text-primary font-semibold">
                          0{idx + 1} · {item.category}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{item.dateLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.sourceTitle}</span>
                      </div>
                      <h4 className="font-display text-sm sm:text-base font-bold text-foreground">
                        {item.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                        {item.summary}
                      </p>
                    </div>

                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline whitespace-nowrap shrink-0 self-start sm:self-center"
                    >
                      <span>Open Source</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ))}
              </div>

              {/* Google Search Grounding Sources Footer */}
              {sources.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-secondary">
                    <Globe2 className="h-3.5 w-3.5 text-primary" />
                    <span>Verified Web Sources (Google Search Grounding):</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                    {sources.map((src) => (
                      <a
                        key={src.uri}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline truncate max-w-[280px]"
                      >
                        <span className="truncate">{src.title}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
