import type { Place } from '@/types'

interface MapStripProps {
  places: Place[]
  visible: boolean
}

const PILL_POSITIONS = [
  { top: '30%', left: '20%' },
  { top: '50%', left: '55%' },
  { top: '20%', left: '65%' },
  { top: '65%', left: '35%' },
]

const PLACEHOLDER_NAMES = ['The Velvet Room', 'Neon Garden', 'Blue Hour Bar', 'Casa Sol']

export default function MapStrip({ places, visible }: MapStripProps) {
  if (!visible) return null

  const pillNames =
    places.length > 0
      ? places.slice(0, 4).map((p) => p.name)
      : PLACEHOLDER_NAMES

  return (
    <div
      className="relative overflow-hidden"
      style={{
        height: 200,
        borderRadius: 14,
        marginBottom: 20,
        background: 'linear-gradient(135deg, oklch(0.55 0.08 195) 0%, oklch(0.45 0.06 210) 100%)',
      }}
    >
      {/* Grid-line SVG overlay */}
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none' }}
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Place name pills */}
      {pillNames.map((name, i) => (
        <span
          key={i}
          className="group/pill"
          style={{
            position: 'absolute',
            top: PILL_POSITIONS[i].top,
            left: PILL_POSITIONS[i].left,
            background: 'white',
            color: 'var(--text)',
            fontSize: 11,
            fontWeight: 600,
            borderRadius: 20,
            padding: '4px 10px',
            boxShadow: '0 2px 8px oklch(0 0 0 / 0.2)',
            cursor: 'default',
            transition: 'transform 0.15s',
            transform: 'translateZ(0)',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLSpanElement).style.transform = 'scale(1.06)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLSpanElement).style.transform = 'scale(1)'
          }}
        >
          {name}
        </span>
      ))}
    </div>
  )
}
