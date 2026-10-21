import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { GoogleGenAI } from '@google/genai'

interface GroundedSource {
  title: string
  uri: string
}

interface CampusNewsHeadline {
  id: string
  title: string
  category: string
  summary: string
  dateLabel: string
  sourceTitle: string
  sourceUrl: string
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

const devNewsCache = new Map<
  string,
  { expiresAt: number; payload: Record<string, unknown> }
>()

function campusNewsGroundingPlugin(): Plugin {
  return {
    name: 'campus-news-search-grounding-api',
    configureServer(server) {
      server.middlewares.use('/api/campus-news', async (req, res, next) => {
        if (req.method !== 'GET') {
          next()
          return
        }

        try {
          const urlObj = new URL(req.url || '/', 'http://localhost:3000')
          const rawTopic = (urlObj.searchParams.get('topic') || 'all').toLowerCase()
          const topic = TOPIC_PROMPTS[rawTopic] ? rawTopic : 'all'
          const forceRefresh = urlObj.searchParams.get('refresh') === 'true'

          const cached = devNewsCache.get(topic)
          if (!forceRefresh && cached && cached.expiresAt > Date.now()) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(JSON.stringify({ success: true, data: cached.payload }))
            return
          }

          const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              },
            },
          })

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

          const rawText = response.text || ''
          const defaultUrl = sources[0]?.uri || 'https://www.iba-suk.edu.pk'
          const defaultSource = sources[0]?.title || 'Sukkur IBA University'
          let headlines: CampusNewsHeadline[] = []

          const jsonMatch = rawText.match(/\[[\s\S]*\]/)
          if (jsonMatch) {
            try {
              const parsed = JSON.parse(jsonMatch[0])
              if (Array.isArray(parsed) && parsed.length > 0) {
                headlines = parsed.slice(0, 6).map((item: any, idx: number) => {
                  const matchedSource =
                    sources[idx % Math.max(1, sources.length)]
                  return {
                    id: `siba-news-${idx + 1}`,
                    title: String(
                      item.title || 'Sukkur IBA University Update',
                    ).trim(),
                    category: String(item.category || 'Campus Update').trim(),
                    summary: String(
                      item.summary ||
                        'Latest public announcement from Sukkur IBA University.',
                    ).trim(),
                    dateLabel: String(item.dateLabel || 'Recent').trim(),
                    sourceTitle: String(
                      item.sourceTitle ||
                        matchedSource?.title ||
                        defaultSource,
                    ).trim(),
                    sourceUrl: String(
                      item.sourceUrl || matchedSource?.uri || defaultUrl,
                    ).trim(),
                  }
                })
              }
            } catch {
              // Fall back to line parsing below
            }
          }

          if (headlines.length === 0) {
            const lines = rawText
              .split('\n')
              .map((l) => l.replace(/^[-*•\d.)+\s]+/, '').trim())
              .filter((l) => l.length > 25)

            headlines = lines.slice(0, 5).map((line, idx) => {
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

          const payload = {
            topic,
            updatedAt: new Date().toISOString(),
            headlines,
            sources,
            grounded: true,
          }

          devNewsCache.set(topic, {
            expiresAt: Date.now() + 5 * 60 * 1000,
            payload,
          })

          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.end(JSON.stringify({ success: true, data: payload }))
        } catch (err: any) {
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 500
          res.end(
            JSON.stringify({
              success: false,
              error: {
                message:
                  err?.message ||
                  'Failed to fetch grounded Sukkur IBA campus news',
              },
            }),
          )
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), campusNewsGroundingPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@alumni-connect/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber'],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
          ],
          charts: ['recharts'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
      },
    },
  },
})
