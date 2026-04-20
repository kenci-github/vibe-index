import type { ActiveFilters } from '@/types'

interface ActiveFilterBannerProps {
  activeTags: ActiveFilters
  onRemoveTag: (category: 'taste_tags' | 'intent_tags' | 'moment_tags', tag: string) => void
  onClearAll: () => void
}

function XIcon() {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--accent)', flexShrink: 0 }}>
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  )
}

export default function ActiveFilterBanner({
  activeTags,
  onRemoveTag,
  onClearAll,
}: ActiveFilterBannerProps) {
  const allActive = [
    ...activeTags.tasteTags.map((tag) => ({ tag: tag as string, category: 'taste_tags' as const })),
    ...activeTags.intentTags.map((tag) => ({ tag: tag as string, category: 'intent_tags' as const })),
    ...activeTags.momentTags.map((tag) => ({ tag: tag as string, category: 'moment_tags' as const })),
  ]

  if (allActive.length === 0) return null

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      style={{
        padding: '11px 14px',
        background: 'var(--accent-light)',
        borderLeft: '3px solid var(--accent)',
        borderRadius: 10,
        marginBottom: 20,
      }}
    >
      {/* Label */}
      <div className="flex items-center gap-1.5">
        <SparkleIcon />
        <span
          style={{
            color: 'var(--text)',
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          Showing results for
        </span>
      </div>

      {/* Tag chips */}
      {allActive.map(({ tag, category }) => (
        <span
          key={`${category}-${tag}`}
          className="inline-flex items-center gap-1"
          style={{
            background: 'var(--accent)',
            color: 'white',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 600,
            padding: '3px 10px',
          }}
        >
          {tag.replace(/-/g, ' ')}
          <button
            onClick={() => onRemoveTag(category, tag)}
            aria-label={`Remove ${tag} filter`}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'white',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <XIcon />
          </button>
        </span>
      ))}

      {/* Clear button */}
      <button
        onClick={onClearAll}
        className="ml-auto"
        style={{
          color: 'var(--accent)',
          fontSize: 12,
          fontWeight: 600,
          textDecoration: 'underline',
          cursor: 'pointer',
          background: 'none',
          border: 'none',
        }}
      >
        Clear
      </button>
    </div>
  )
}
