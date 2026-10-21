/**
 * Public entry point for the 3D Alumni Meridian & Constellation.
 *
 * Includes:
 *  - WebGL capability & prefers-reduced-motion detection
 *  - Lazy-loaded Three.js scene with ErrorBoundary containment
 *  - Collapsible Unified Bottom Control Dock (Global Orbit / Chapter Hubs / Mentorship Web)
 *    with solid dark obsidian styling (zero backdrop-filter over the WebGL canvas)
 */
import { Canvas } from '@react-three/fiber'
import { Component, Suspense, lazy, useEffect, useState, type ReactNode } from 'react'
import { ConstellationFallback } from './ConstellationFallback'
import type { ConstellationMode } from './ConstellationScene'

const ConstellationScene = lazy(() =>
  import('./ConstellationScene').then((module) => ({
    default: module.ConstellationScene,
  })),
)

export interface Constellation3DProps {
  className?: string
  /** Optional external mode override */
  activeMode?: ConstellationMode
  onModeChange?: (mode: ConstellationMode) => void
}

function canRenderWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    if (!context) return false
    context.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

class SceneErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <ConstellationFallback
          className="h-full w-full"
          reason="Interactive view unavailable"
        />
      )
    }
    return this.props.children
  }
}

function ConstellationCanvas({
  mode,
  paused,
}: {
  mode: ConstellationMode
  paused: boolean
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 13.5], fov: 42 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
      onCreated={({ gl }) => gl.setClearAlpha(0)}
    >
      <Suspense fallback={null}>
        <ConstellationScene mode={mode} paused={paused} />
      </Suspense>
    </Canvas>
  )
}

const MODE_LABELS: { id: ConstellationMode; label: string; metric: string }[] = [
  { id: 'orbit', label: 'Global Orbit', metric: '42 Countries · 5,420 Alumni' },
  { id: 'clusters', label: 'Chapter Hubs', metric: '6 Regional Chapters · 18 Cities' },
  { id: 'mentorship', label: 'Mentorship Web', metric: '1,280 Active Pairings' },
]

export function Constellation3D({
  className,
  activeMode,
  onModeChange,
}: Constellation3DProps) {
  const [enabled, setEnabled] = useState(false)
  const [internalMode, setInternalMode] = useState<ConstellationMode>('orbit')
  const [paused, setPaused] = useState(false)
  const [dockCollapsed, setDockCollapsed] = useState(false)

  const mode = activeMode ?? internalMode
  const handleSelectMode = (next: ConstellationMode) => {
    setInternalMode(next)
    onModeChange?.(next)
  }

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const smallViewport = window.matchMedia('(max-width: 767px)')

    const evaluate = () => {
      setEnabled(
        !reducedMotion.matches && !smallViewport.matches && canRenderWebGL(),
      )
    }

    evaluate()
    reducedMotion.addEventListener('change', evaluate)
    smallViewport.addEventListener('change', evaluate)

    return () => {
      reducedMotion.removeEventListener('change', evaluate)
      smallViewport.removeEventListener('change', evaluate)
    }
  }, [])

  const currentMeta = MODE_LABELS.find((m) => m.id === mode) ?? MODE_LABELS[0]

  return (
    <div
      className={`relative isolate overflow-hidden rounded-2xl bg-[#091422] border border-white/10 shadow-2xl ${className ?? ''}`}
    >
      {/* Atmospheric Emerald, Burnished Gold & Aqua depth behind the 3D network */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_22%,rgba(13,110,91,0.48),transparent_55%),radial-gradient(circle_at_76%_72%,rgba(245,158,11,0.22),transparent_50%),radial-gradient(circle_at_52%_48%,rgba(45,212,191,0.18),transparent_48%)]"
      />

      {/* Minimal Top-Left Spec Label (unobstructed 3D center) */}
      <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-2 text-xs text-white/80">
        <span className="font-mono uppercase tracking-wider text-[#F59E0B]">
          3D Meridian
        </span>
        <span aria-hidden="true" className="text-white/30">
          ·
        </span>
        <span className="font-mono tabular-nums text-white/75">
          {currentMeta.metric}
        </span>
      </div>

      {/* Isolated 3D WebGL Canvas Mount */}
      <div className="h-full w-full">
        {enabled ? (
          <SceneErrorBoundary>
            <ConstellationCanvas mode={mode} paused={paused} />
          </SceneErrorBoundary>
        ) : (
          <ConstellationFallback className="h-full w-full" />
        )}
      </div>

      {/* Unified Bottom Control Dock — solid dark surface, zero backdrop-filter over WebGL */}
      <div className="absolute bottom-3 left-1/2 z-10 w-[92%] max-w-md -translate-x-1/2">
        <div className="flex justify-center mb-1">
          <button
            type="button"
            onClick={() => setDockCollapsed((prev) => !prev)}
            className="rounded-t-md bg-[#091422]/95 px-2.5 py-0.5 text-[11px] font-medium text-white/70 hover:text-white border border-b-0 border-white/15 transition-colors whitespace-nowrap shrink-0"
            aria-expanded={!dockCollapsed}
          >
            {dockCollapsed ? '▴ Show 3D Controls' : '▾ Hide Controls'}
          </button>
        </div>

        {!dockCollapsed && (
          <div className="flex items-center justify-between gap-1.5 rounded-xl bg-[#091422]/95 p-1.5 border border-white/15 shadow-lg">
            <div className="flex items-center gap-1 overflow-x-auto">
              {MODE_LABELS.map((item) => {
                const isActive = mode === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectMode(item.id)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-[#0D6E5B] text-white shadow-sm'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => setPaused((prev) => !prev)}
              className="rounded-lg border border-white/15 px-2.5 py-1.5 text-xs font-mono text-[#F59E0B] hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
              aria-label={paused ? 'Resume 3D orbital motion' : 'Pause 3D orbital motion'}
            >
              {paused ? 'Resume' : 'Pause'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Constellation3D
