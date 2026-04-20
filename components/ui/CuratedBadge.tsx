interface CuratedBadgeProps {
  className?: string
}

export default function CuratedBadge({ className }: CuratedBadgeProps) {
  return (
    <span
      style={{
        background: 'oklch(0.12 0.02 50 / 0.72)',
        backdropFilter: 'blur(10px)',
        color: 'white',
        fontSize: '9.5px',
        fontWeight: 700,
        borderRadius: '6px',
        padding: '3px 7px',
        letterSpacing: '0.05em',
      }}
      className={`inline-flex items-center gap-1 uppercase ${className ?? ''}`}
    >
      <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
      </svg>
      CURATED
    </span>
  )
}
