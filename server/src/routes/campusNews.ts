import { Router, Request, Response } from 'express'
import { GoogleGenAI } from '@google/genai'
import { asyncHandler } from '../utils/asyncHandler'
import { successResponse } from '../utils/response'

const router = Router()

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

const TOPIC_PROMPTS: Record<string, string> = {
  all: 'latest public news headlines, institutional achievements, convocation updates, admissions announcements, and research milestones',
  academics:
    'latest academic rankings, HEC awards, international accreditations, faculty achievements, and convocation news',
  admissions:
    'latest admissions announcements, Talent Hunt Program (THP), scholarship programs, and entry test updates',
  research:
    'latest computer science, AI, renewable energy, business research publications, and conference news',
}

// Short in-memory cache per topic so dashboard mounts are snappy
const newsCache = new Map<
  string,
  { expiresAt: number; payload: CampusNewsPayload }
>()
const CACHE_TTL_MS = 5 * 60 * 1000

function getGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  })
}

function parseHeadlinesFromText(
  rawText: string,
  sources: GroundedSource[],
): CampusNewsHeadline[] {
  const defaultUrl = sources[0]?.uri || 'https://www.iba-suk.edu.pk'
  const defaultSource = sources[0]?.title || 'Sukkur IBA University'

  // Attempt to extract a JSON array if present in the model output
  const jsonMatch = rawText.match(/\[[\s\S]*\]/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, 6).map((item: any, idx: number) => {
          const matchedSource = sources[idx % Math.max(1, sources.length)]
          return {
            id: `siba-news-${idx + 1}`,
            title: String(item.title || 'Sukkur IBA University Update').trim(),
            category: String(item.category || 'Campus Update').trim(),
            summary: String(
              item.summary ||
                'Latest public announcement from Sukkur IBA University.',
            ).trim(),
            dateLabel: String(item.dateLabel || 'Recent').trim(),
            sourceTitle: String(
              item.sourceTitle || matchedSource?.title || defaultSource,
            ).trim(),
            sourceUrl: String(
              item.sourceUrl || matchedSource?.uri || defaultUrl,
            ).trim(),
          }
        })
      }
    } catch {
      // Fall through to line-based parsing if JSON parsing fails
    }
  }

  // Fallback line parser if model returned bullet points
  const lines = rawText
    .split('\n')
    .map((l) => l.replace(/^[-*•\d.)+\s]+/, '').trim())
    .filter((l) => l.length > 25)

  return lines.slice(0, 5).map((line, idx) => {
    const matchedSource = sources[idx % Math.max(1, sources.length)]
    return {
      id: `siba-news-${idx + 1}`,
      title: line.length > 110 ? `${line.slice(0, 107)}...` : line,
      category: 'Campus News',
      summary: line,
      dateLabel: 'Latest Grounded Result',
      sourceTitle: matchedSource?.title || defaultSource,
      sourceUrl: matchedSource?.uri || defaultUrl,
    }
  })
}

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const rawTopic = String(req.query.topic || 'all').toLowerCase()
    const topic = TOPIC_PROMPTS[rawTopic] ? rawTopic : 'all'
    const forceRefresh = req.query.refresh === 'true'

    const cached = newsCache.get(topic)
    if (!forceRefresh && cached && cached.expiresAt > Date.now()) {
      return successResponse(res, cached.payload)
    }

    const ai = getGeminiClient()
    const topicFocus = TOPIC_PROMPTS[topic]

    const prompt = `Search Google for the ${topicFocus} regarding "Sukkur IBA University" (Sindh, Pakistan).
Return a JSON array of 5 real, current public news headlines about Sukkur IBA University.
Each object in the JSON array must have these exact string fields:
- "title": concise, factual news headline (max 95 characters)
- "category": short label such as "Admissions", "Academics", "Research", "Ranking", or "Campus Life"
- "summary": 1-sentence factual summary of the news item
- "dateLabel": publication timeframe or year (e.g. "2025", "2026", or month/year)
- "sourceTitle": name of the publication or official university page
Output ONLY the valid JSON array.`

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    })

    // Extract grounded web sources from groundingChunks
    const rawChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    const sources: GroundedSource[] = []
    const seenUris = new Set<string>()

    for (const chunk of rawChunks) {
      const uri = chunk.web?.uri
      const title = chunk.web?.title || 'Sukkur IBA Web Source'
      if (uri && !seenUris.has(uri)) {
        seenUris.add(uri)
        sources.push({ title, uri })
      }
    }

    const headlines = parseHeadlinesFromText(response.text || '', sources)

    const payload: CampusNewsPayload = {
      topic,
      updatedAt: new Date().toISOString(),
      headlines,
      sources,
      grounded: true,
    }

    newsCache.set(topic, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      payload,
    })

    return successResponse(res, payload)
  }),
)

export default router
