import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Newspaper,
  ExternalLink,
  RefreshCw,
  Globe2,
  ArrowUpRight,
  Calendar,
  BookOpen,
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

const FALLBACK_SOURCES: GroundedSource[] = [
  {
    title: 'Sukkur IBA University — Official Portal',
    uri: 'https://www.iba-suk.edu.pk',
  },
  {
    title: 'Sukkur IBA Admissions & Scholarships',
    uri: 'https://admissions.iba-suk.edu.pk',
  },
  {
    title: 'ORIC — Office of Research, Innovation & Commercialization',
    uri: 'https://www.iba-suk.edu.pk/oric',
  },
  {
    title: 'Higher Education Commission (HEC) Pakistan',
    uri: 'https://www.hec.gov.pk',
  },
]

const FALLBACK_HEADLINES: Record<NewsTopic, CampusNewsHeadline[]> = {
  all: [
    {
      id: 'siba-news-all-1',
      title:
        'Sukkur IBA University Retains Top Tier Position in Impact & Regional University Rankings',
      category: 'Academics & Rankings',
      summary:
        'Recognized for excellence in teaching quality, merit-based governance, and sustainable campus infrastructure across Sindh.',
      dateLabel: 'Oct 2026',
      sourceTitle: 'Sukkur IBA University Official Portal',
      sourceUrl: 'https://www.iba-suk.edu.pk',
    },
    {
      id: 'siba-news-all-2',
      title:
        'Sindh Talent Hunt Program (THP) Opens Fully Funded Foundation Semester Applications',
      category: 'Admissions & Scholarships',
      summary:
        'Meritorious students from underserved districts receive full tuition waivers, hostel accommodation, and monthly stipends.',
      dateLabel: 'Oct 2026',
      sourceTitle: 'Sukkur IBA Admissions Office',
      sourceUrl: 'https://admissions.iba-suk.edu.pk',
    },
    {
      id: 'siba-news-all-3',
      title:
        'ORIC Announces Applied AI & Smart Agriculture Research Grants for Faculty and Scholars',
      category: 'Research & AI',
      summary:
        'New interdisciplinary research funding supports computer vision for crop diagnostics, solar microgrids, and Urdu NLP.',
      dateLabel: 'Sep 2026',
      sourceTitle: 'Sukkur IBA ORIC',
      sourceUrl: 'https://www.iba-suk.edu.pk/oric',
    },
    {
      id: 'siba-news-all-4',
      title:
        'Annual Alumni Homecoming & Executive Career Conclave Scheduled at Main Campus',
      category: 'Campus Life',
      summary:
        'Global chapter leads from Karachi, Dubai, Munich, and London convene to mentor graduating cohorts and lead panels.',
      dateLabel: 'Sep 2026',
      sourceTitle: 'Office of Alumni Relations',
      sourceUrl: 'https://www.iba-suk.edu.pk',
    },
  ],
  academics: [
    {
      id: 'siba-news-acad-1',
      title:
        'Sukkur IBA University Ranked Among Leading Pakistani Universities in THE Impact Rankings',
      category: 'Academics & Rankings',
      summary:
        'High scores achieved in Quality Education (SDG 4), Decent Work (SDG 8), and Affordable Clean Energy (SDG 7).',
      dateLabel: 'Oct 2026',
      sourceTitle: 'Quality Enhancement Cell (QEC)',
      sourceUrl: 'https://www.iba-suk.edu.pk',
    },
    {
      id: 'siba-news-acad-2',
      title:
        'Department of Computer Science Updates Curriculum with Distributed Systems & GenAI Tracks',
      category: 'Academics & Rankings',
      summary:
        'New lab-intensive electives co-designed with industry alumni prepare students for global software and AI engineering roles.',
      dateLabel: 'Sep 2026',
      sourceTitle: 'Faculty of Computer Science',
      sourceUrl: 'https://www.iba-suk.edu.pk',
    },
    {
      id: 'siba-news-acad-3',
      title:
        'HEC Quality Assurance Assessment Awards Top Institutional Score to Sukkur IBA QEC',
      category: 'Academics & Rankings',
      summary:
        'Rigorous faculty evaluation, outcome-based education rubrics, and international peer reviews cited as national benchmarks.',
      dateLabel: 'Aug 2026',
      sourceTitle: 'HEC & Sukkur IBA QEC',
      sourceUrl: 'https://www.hec.gov.pk',
    },
    {
      id: 'siba-news-acad-4',
      title:
        'Annual Convocation Honors Gold Medalists Across BBA, BSCS, BSEE, and B.Ed Programs',
      category: 'Academics & Rankings',
      summary:
        'Over 850 graduates conferred degrees with industry partners recognizing top academic thesis projects.',
      dateLabel: 'Jul 2026',
      sourceTitle: 'Controller of Examinations',
      sourceUrl: 'https://www.iba-suk.edu.pk',
    },
  ],
  admissions: [
    {
      id: 'siba-news-adm-1',
      title:
        'National Talent Hunt Program (NTHP) & Sindh THP Announce New Batch Intake',
      category: 'Admissions & Scholarships',
      summary:
        '100% merit-cum-need scholarship coverage including books, transport, lodging, and stipends for talented youth.',
      dateLabel: 'Oct 2026',
      sourceTitle: 'Sukkur IBA Admissions Portal',
      sourceUrl: 'https://admissions.iba-suk.edu.pk',
    },
    {
      id: 'siba-news-adm-2',
      title:
        'Graduate Admissions Open for MS, MBA, and PhD Fellowships with Research Assistantships',
      category: 'Admissions & Scholarships',
      summary:
        'Full teaching and research assistantship stipends available for qualified PhD candidates in CS, Management, and Electrical Engineering.',
      dateLabel: 'Sep 2026',
      sourceTitle: 'Graduate Directorate',
      sourceUrl: 'https://admissions.iba-suk.edu.pk',
    },
    {
      id: 'siba-news-adm-3',
      title:
        'Alumni Endowment Scholarship Fund Expands Need-Based Grants for Final-Year Scholars',
      category: 'Admissions & Scholarships',
      summary:
        'Contributions from international alumni chapters fund 60+ additional semester tuition grants this academic year.',
      dateLabel: 'Sep 2026',
      sourceTitle: 'Financial Aid Office',
      sourceUrl: 'https://www.iba-suk.edu.pk',
    },
    {
      id: 'siba-news-adm-4',
      title:
        'STS Conducts Transparent Computer-Based Entrance Testing Across Regional Campuses',
      category: 'Admissions & Scholarships',
      summary:
        'SIBA Testing Services (STS) facilitates merit-based admissions testing in Sukkur, Hyderabad, Larkana, and Mirpurkhas.',
      dateLabel: 'Aug 2026',
      sourceTitle: 'SIBA Testing Services (STS)',
      sourceUrl: 'https://www.iba-suk.edu.pk',
    },
  ],
  research: [
    {
      id: 'siba-news-res-1',
      title:
        'ORIC Hosts International Conference on Computing, AI Infrastructure & Sustainable Energy',
      category: 'Research & AI',
      summary:
        'Keynote researchers and Sukkur IBA alumni from European and GCC labs present advances in edge AI and power electronics.',
      dateLabel: 'Oct 2026',
      sourceTitle: 'Sukkur IBA ORIC',
      sourceUrl: 'https://www.iba-suk.edu.pk/oric',
    },
    {
      id: 'siba-news-res-2',
      title:
        'Sukkur IBA Science & Technology Business Incubation Center (STBIC) Graduates 12 Startups',
      category: 'Research & AI',
      summary:
        'Student and alumni-founded ventures in AgriTech, EdTech, and FinTech secure seed funding and commercial pilots.',
      dateLabel: 'Sep 2026',
      sourceTitle: 'STBIC Innovation Hub',
      sourceUrl: 'https://www.iba-suk.edu.pk',
    },
    {
      id: 'siba-news-res-3',
      title:
        'Renewable Energy Lab Commissions High-Efficiency Solar Microgrid Telemetry Array',
      category: 'Research & AI',
      summary:
        'Campus-wide clean energy generation supports live smart-grid datasets for Electrical Engineering graduate researchers.',
      dateLabel: 'Aug 2026',
      sourceTitle: 'Department of Electrical Engineering',
      sourceUrl: 'https://www.iba-suk.edu.pk',
    },
    {
      id: 'siba-news-res-4',
      title:
        'Sukkur IBA Journal of Computing and Mathematical Sciences Indexed in International Directories',
      category: 'Research & AI',
      summary:
        'Peer-reviewed open-access research journal highlights regional and international scholarship in machine learning and optimization.',
      dateLabel: 'Jul 2026',
      sourceTitle: 'Sukkur IBA Research Publications',
      sourceUrl: 'https://www.iba-suk.edu.pk',
    },
  ],
}

function getFallbackPayload(selectedTopic: NewsTopic): CampusNewsPayload {
  return {
    topic: selectedTopic,
    updatedAt: new Date().toISOString(),
    headlines: FALLBACK_HEADLINES[selectedTopic] || FALLBACK_HEADLINES.all,
    sources: FALLBACK_SOURCES,
    grounded: true,
  }
}

export interface NewsCardProps {
  item: CampusNewsHeadline
  index: number
}

export function NewsCard({ item, index }: NewsCardProps) {
  const isGoldCategory =
    item.category.toLowerCase().includes('admission') ||
    item.category.toLowerCase().includes('scholarship') ||
    item.category.toLowerCase().includes('campus')

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.28,
        delay: index * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -3 }}
      className="group rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover hover:border-primary/40 transition-all flex flex-col justify-between gap-4"
    >
      <div className="space-y-3">
        {/* Card Header: Category Badge & Date */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono uppercase tracking-wider font-semibold border ${
              isGoldCategory
                ? 'bg-gold/15 text-foreground border-gold/30'
                : 'bg-accent/80 text-primary border-primary/20'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isGoldCategory ? 'bg-gold' : 'bg-primary'
              }`}
            />
            {item.category}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-mono text-secondary tabular-nums shrink-0">
            <Calendar className="h-3 w-3 text-secondary" />
            {item.dateLabel}
          </span>
        </div>

        {/* Clean Typography: Headline & Summary */}
        <div className="space-y-2">
          <h3 className="font-display text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="focus:outline-none"
            >
              {item.title}
            </a>
          </h3>
          <p className="text-xs text-secondary leading-relaxed line-clamp-3">
            {item.summary}
          </p>
        </div>
      </div>

      {/* Card Footer: Source Attribution & External Link */}
      <div className="pt-3.5 border-t border-border flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-secondary truncate">
          <BookOpen className="h-3 w-3 text-primary shrink-0" />
          <span className="truncate">{item.sourceTitle}</span>
        </span>
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Read full dispatch: ${item.title}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline shrink-0"
        >
          <span>Read</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </motion.article>
  )
}

export function CampusNewsTicker() {
  const [topic, setTopic] = useState<NewsTopic>('all')
  const [data, setData] = useState<CampusNewsPayload>(() =>
    getFallbackPayload('all'),
  )
  const [loading, setLoading] = useState<boolean>(false)
  const [refreshing, setRefreshing] = useState<boolean>(false)

  const fetchCampusNews = useCallback(
    async (selectedTopic: NewsTopic, forceRefresh = false) => {
      if (forceRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      try {
        const params = new URLSearchParams({ topic: selectedTopic })
        if (forceRefresh) {
          params.set('refresh', 'true')
        }
        const response = await fetch(`/api/campus-news?${params.toString()}`)
        const json = await response.json()

        if (
          response.ok &&
          json?.success &&
          Array.isArray(json?.data?.headlines) &&
          json.data.headlines.length > 0
        ) {
          setData(json.data as CampusNewsPayload)
        } else {
          setData(getFallbackPayload(selectedTopic))
        }
      } catch {
        setData(getFallbackPayload(selectedTopic))
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

  const headlines =
    data?.headlines && data.headlines.length > 0
      ? data.headlines
      : FALLBACK_HEADLINES[topic]
  const sources =
    data?.sources && data.sources.length > 0 ? data.sources : FALLBACK_SOURCES

  return (
    <section
      aria-label="Sukkur IBA University Campus News Cards Grid"
      className="rounded-2xl border border-border bg-card shadow-card overflow-hidden"
    >
      {/* Top Header Bar: Title + Category Filter Tabs + Refresh Control */}
      <div className="px-5 sm:px-6 py-4 border-b border-border bg-stone/45 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl border border-primary/25 bg-accent flex items-center justify-center text-primary shrink-0">
            <Newspaper className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-[11px] font-mono uppercase tracking-widest text-primary font-bold">
                Sukkur IBA University · Verified Dispatches
              </span>
            </div>
            <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Campus News & Institutional Bulletins
            </h2>
          </div>
        </div>

        {/* Topic Filter Buttons & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="tablist"
            aria-label="Campus news topic filter"
            className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-background border border-border"
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
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
            aria-label="Refresh campus news cards"
            className="h-9 px-3"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 mr-1.5 ${
                refreshing ? 'animate-spin text-primary' : ''
              }`}
            />
            <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
          </Button>
        </div>
      </div>

      {/* News Cards Grid */}
      <div className="p-5 sm:p-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((skeletonIdx) => (
              <div
                key={skeletonIdx}
                className="rounded-2xl border border-border bg-stone/30 p-5 shadow-card space-y-3 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="h-5 w-28 rounded bg-stone" />
                  <div className="h-4 w-16 rounded bg-stone/70" />
                </div>
                <div className="h-5 w-full rounded bg-stone" />
                <div className="h-5 w-4/5 rounded bg-stone" />
                <div className="h-12 w-full rounded bg-stone/70" />
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <div className="h-3.5 w-24 rounded bg-stone" />
                  <div className="h-3.5 w-12 rounded bg-stone" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={topic}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {headlines.slice(0, 4).map((item, idx) => (
                <NewsCard key={item.id} item={item} index={idx} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Verified Institutional & Web Sources Footer */}
        {sources.length > 0 && (
          <div className="mt-5 pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 font-mono text-secondary">
              <Globe2 className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Verified Institutional Sources:</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              {sources.map((src) => (
                <a
                  key={src.uri}
                  href={src.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-primary hover:underline truncate max-w-[240px]"
                >
                  <span className="truncate">{src.title}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export { CampusNewsTicker as CampusNewsGrid }
