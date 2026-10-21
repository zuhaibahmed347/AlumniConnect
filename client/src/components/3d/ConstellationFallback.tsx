/**
 * Static, CSS-only alumni meridian & constellation fallback.
 *
 * Rendered instead of the WebGL scene on mobile, for users who prefer reduced
 * motion, and on any device where WebGL is unavailable or the canvas fails.
 * Uses the Meridian Emerald, Burnished Gold, and Luminous Aqua palette on
 * Deep Midnight Obsidian.
 */

const nodes = [
  [14, 22], [30, 13], [48, 24], [67, 15], [85, 24],
  [10, 48], [27, 41], [50, 48], [71, 42], [88, 50],
  [18, 75], [37, 81], [55, 72], [75, 79], [89, 68],
] as const

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
      className={`relative overflow-hidden rounded-2xl bg-[#091422] ${className ?? ''}`}
      role="img"
      aria-label={
        reason
          ? `Stylised illustration of the Sukkur IBA global alumni meridian network. ${reason}`
          : 'Stylised illustration of the Sukkur IBA global alumni meridian network'
      }
    >
      {/* Rich Meridian Emerald, Burnished Gold & Aqua atmospheric depth */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_28%_24%,rgba(13,110,91,0.48),transparent_55%),radial-gradient(circle_at_74%_72%,rgba(245,158,11,0.22),transparent_50%),radial-gradient(circle_at_55%_45%,rgba(45,212,191,0.22),transparent_48%)]"
      />

      <svg
        viewBox="0 0 100 96"
        className="relative h-full w-full animate-constellation-drift"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        focusable="false"
      >
        {/* Orbital Meridian Rings */}
        <g fill="none" strokeLinecap="round">
          <ellipse
            cx="50"
            cy="48"
            rx="32"
            ry="18"
            transform="rotate(-22 50 48)"
            stroke="#F59E0B"
            strokeWidth="0.3"
            opacity="0.45"
          />
          <ellipse
            cx="50"
            cy="48"
            rx="38"
            ry="22"
            transform="rotate(28 50 48)"
            stroke="#10B981"
            strokeWidth="0.3"
            opacity="0.4"
          />
          <circle
            cx="50"
            cy="48"
            r="12"
            stroke="#2DD4BF"
            strokeWidth="0.25"
            strokeDasharray="1.5 1.5"
            opacity="0.5"
          />
        </g>

        {/* Connections */}
        <g stroke="#2DD4BF" strokeWidth="0.26" strokeLinecap="round" opacity="0.35">
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

        {/* Nodes — Burnished Gold, Meridian Emerald, and Aqua */}
        {nodes.map(([x, y], i) => (
          <g key={`${x}-${y}`}>
            <circle
              cx={x}
              cy={y}
              r={i === 7 ? 2.8 : i % 3 === 0 ? 2.1 : 1.5}
              fill={
                i % 4 === 0
                  ? '#F59E0B'
                  : i % 3 === 0
                    ? '#10B981'
                    : i % 2 === 0
                      ? '#2DD4BF'
                      : '#FAF8F5'
              }
            />
            <circle
              cx={x}
              cy={y}
              r={i === 7 ? 5.6 : i % 3 === 0 ? 4.4 : 3.1}
              fill="#FAF8F5"
              opacity="0.1"
            />
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
