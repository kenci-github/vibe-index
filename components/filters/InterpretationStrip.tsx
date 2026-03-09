interface InterpretationStripProps {
  interpretedAs: string | null
  resultCount: number
  onClear: () => void
}

export default function InterpretationStrip({ interpretedAs, resultCount, onClear }: InterpretationStripProps) {
  if (!interpretedAs) return null

  return (
    <div className="flex items-center justify-between px-4 py-2">
      <p className="text-sm text-warm-gray-mid">
        <span className="text-accent">✦</span>{' '}
        Showing results for:{' '}
        <span className="font-medium text-gray-700">{interpretedAs}</span>
      </p>
      <button
        onClick={onClear}
        className="ml-4 shrink-0 text-xs text-warm-gray-mid underline underline-offset-2 transition-colors hover:text-gray-800"
      >
        ✕ Clear
      </button>
    </div>
  )
}
