interface InterpretationStripProps {
  interpretedAs: string | null
  resultCount: number
  onClear: () => void
}

export default function InterpretationStrip({ interpretedAs, resultCount, onClear }: InterpretationStripProps) {
  if (!interpretedAs) return null

  return (
    <div className="mx-4 my-2 flex items-center justify-between rounded-xl border-l-2 border-accent bg-accent/[0.06] px-4 py-3" aria-live="polite">
      <p className="text-sm font-medium text-accent">
        ✦ {interpretedAs}
        <span className="ml-2 inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-white">
          {resultCount}
        </span>
      </p>
      <button
        onClick={onClear}
        className="ml-4 shrink-0 text-xs text-accent/70 underline underline-offset-2 transition-colors hover:text-accent"
      >
        Clear
      </button>
    </div>
  )
}
