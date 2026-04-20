interface StarRatingProps {
  rating: number
  className?: string
}

export default function StarRating({ rating, className }: StarRatingProps) {
  return (
    <span
      className={`inline-flex items-center gap-[3px] ${className ?? ''}`}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        style={{ color: 'var(--accent)' }}
      >
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
      </svg>
      <span
        style={{
          fontSize: '11.5px',
          fontWeight: 600,
          color: 'var(--text)',
        }}
      >
        {rating.toFixed(1)}
      </span>
    </span>
  )
}
