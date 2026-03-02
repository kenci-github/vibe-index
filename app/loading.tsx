export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="px-4 pb-2 pt-5">
        <div className="h-7 w-24 animate-pulse rounded-lg bg-gray-200" />
        <div className="mt-1 h-4 w-48 animate-pulse rounded-md bg-gray-100" />
      </div>

      {/* City selector skeleton */}
      <div className="px-4 pb-3 pt-2">
        <div className="h-9 w-40 animate-pulse rounded-full bg-gray-100" />
      </div>

      {/* Tag bar skeleton */}
      <div className="flex gap-2 overflow-hidden px-4 pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-7 w-16 shrink-0 animate-pulse rounded-full bg-gray-100"
          />
        ))}
      </div>

      {/* Count skeleton */}
      <div className="px-4 pb-1 pt-2">
        <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
      </div>

      {/* Card grid skeleton */}
      <div className="grid grid-cols-2 gap-3 px-4 pb-24 pt-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    </div>
  )
}
