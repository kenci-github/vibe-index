export default function PlaceLoading() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero skeleton */}
      <div className="h-[55vh] w-full animate-pulse bg-gray-200" />

      {/* Content skeleton */}
      <div className="px-4 pt-5">
        <div className="space-y-2">
          <div className="h-5 w-3/4 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
        </div>

        {/* Tag group skeletons */}
        <div className="mt-5 space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i}>
              <div className="mb-2 h-3 w-12 animate-pulse rounded bg-gray-200" />
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-6 w-16 animate-pulse rounded-full bg-gray-100" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Button skeleton */}
        <div className="mt-6 h-12 w-full animate-pulse rounded-xl bg-gray-200" />
      </div>
    </div>
  )
}
