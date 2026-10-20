/**
 * Public entry point for the alumni constellation.
 *
 * Responsibilities kept out of the scene itself:
 *  - capability detection (WebGL, viewport, prefers-reduced-motion)
 *  - code-splitting the three.js bundle out of the initial download
 *  - error containment, so a failed canvas degrades to the CSS fallback
 *    instead of blanking the landing page
 */
import { Canvas } from '@react-three/fiber'
import { Component, lazy, useEffect, useState, type ReactNode } from 'react'
import { ConstellationFallback } from './ConstellationFallback'

/** three.js is only downloaded on viewports that can actually use it. */
const ConstellationScene = lazy(() =>
  import('./ConstellationScene').then((module) => ({
    default: module.ConstellationScene,
  })),
)

export interface Constellation3DProps {
  className?: string
}

function canRenderWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    if (!context) return false
    // Release the probe context immediately — mobile browsers cap live contexts.
    context.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

/** Catches render/effect failures from the canvas so the page never blanks. */
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
        <ConstellationFallback className="h-full w-full" reason="Interactive view unavailable" />
      )
    }
    return this.props.children
  }
}

function ConstellationCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 14], fov: 42 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
      onCreated={({ gl }) => gl.setClearAlpha(0)}
    >
      <ConstellationScene />
    </Canvas>
  )
}

export function Constellation3D({ className }: Constellation3DProps) {
  // Start as "not capable" so the first paint is always the cheap CSS fallback;
  // we upgrade to the canvas only after confirming it is supported.
  const [enabled, setEnabled] = useState(false)

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

  return (
    <div
      className={`relative isolate overflow-hidden rounded-2xl bg-navy ${className ?? ''}`}
    >
      {/* Soft indigo/violet/cyan depth behind the network. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(67,56,202,0.45),transparent_55%),radial-gradient(circle_at_72%_70%,rgba(34,211,238,0.28),transparent_50%),radial-gradient(circle_at_60%_20%,rgba(124,58,237,0.32),transparent_45%)]"
      />

      {enabled ? (
        <SceneErrorBoundary>
          <ConstellationCanvas />
        </SceneErrorBoundary>
      ) : (
        <ConstellationFallback className="h-full w-full" />
      )}
    </div>
  )
}

export default Constellation3D
