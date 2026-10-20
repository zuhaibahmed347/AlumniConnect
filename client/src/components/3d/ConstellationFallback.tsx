/**
 * Static, CSS-only alumni constellation.
 *
 * Rendered instead of the WebGL scene on mobile, for users who prefer reduced
 * motion, and on any device where WebGL is unavailable or the canvas fails.
 * It uses the same indigo / violet / cyan palette as the 3D scene so the swap
 * is visually seamless, and every animation is a plain CSS transform that the
 * global `prefers-reduced-motion` rule already disables.
 */

/** Deterministic layout so the fallback never re-shuffles between renders. */
const nodes = [
  [12, 20], [30, 12], [48, 24], [66, 14], [86, 22],
  [8, 46], [26, 40], [44, 52], [62, 42], [82, 48],
  [16, 74], [36, 82], [54, 70], [74, 78], [90, 66],
] as const

/** Index pairs of the connections drawn between nearby nodes. */
const links = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [5, 6], [6, 7], [7, 8], [8, 9],
  [10, 11], [11, 12], [12, 13], [13, 14],
  [0, 5], [5, 10], [1, 6], [6, 11],
  [2, 7], [7, 12], [3, 8], [8, 13], [4, 9], [9, 14],
] as const

export interface ConstellationFallbackProps {
  className?: string
  /** Set when the WebGL scene failed at runtime; drives a muted label. */
  reason?: string
}

export function ConstellationFallback({ className, reason }: ConstellationFallbackProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-navy ${className ?? ''}`}
      role="img"
      aria-label={
        reason
          ? `Stylised illustration of a connected alumni network. ${reason}`
          : 'Stylised illustration of a connected alumni network'
      }
    >
      {/* Soft indigo/violet/cyan depth behind the network. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(67,56,202,0.45),transparent_55%),radial-gradient(circle_at_72%_70%,rgba(34,211,238,0.28),transparent_50%),radial-gradient(circle_at_60%_20%,rgba(124,58,237,0.32),transparent_45%)]"
      />

      <svg
        viewBox="0 0 100 96"
        className="relative h-full w-full animate-constellation-drift"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        focusable="false"
      >
        {/* Connections */}
        <g stroke="#818CF8" strokeWidth="0.25" strokeLinecap="round" opacity="0.35">
          {links.map(([a, b]) => (
            <line
              key={`${a}-${b}`}
              x1={nodes[a][0]}
              y1={nodes[a][1]}
              x2={nodes[b][0]}
              y2={nodes[b][1]}
            />
          ))}
        </g>

        {/* Nodes — the third of each cluster is cyan for a restrained highlight. */}
        {nodes.map(([x, y], i) => (
          <g key={`${x}-${y}`}>
            <circle
              cx={x}
              cy={y}
              r={i % 3 === 0 ? 2.1 : 1.5}
              fill={i % 5 === 0 ? '#22D3EE' : i % 2 === 0 ? '#7C3AED' : '#818CF8'}
            />
            <circle cx={x} cy={y} r={i % 3 === 0 ? 4.4 : 3.1} fill="currentColor" opacity="0.08" />
          </g>
        ))}
      </svg>

      {reason ? (
        <p className="absolute inset-x-0 bottom-3 px-4 text-center text-[11px] text-white/60">
          {reason}
        </p>
      ) : null}
    </div>
  )
}
