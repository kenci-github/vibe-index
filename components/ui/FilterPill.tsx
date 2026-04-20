'use client'

interface FilterPillProps {
  label: string
  active: boolean
  onClick: () => void
  className?: string
}

export default function FilterPill({ label, active, onClick, className }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      style={{
        borderRadius: '20px',
        fontSize: '12px',
        padding: '6px 14px',
        transition: 'all 0.14s ease',
        border: active ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
        background: active ? 'var(--accent-light)' : 'transparent',
        color: active ? 'var(--accent)' : 'oklch(0.38 0.01 50)',
        fontWeight: active ? 600 : 400,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
      className={className}
    >
      {label}
    </button>
  )
}
