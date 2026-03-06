export default function SkeletonCard() {
  return (
    <div className="block">
      {/* Thumbnail placeholder */}
      <div className="aspect-[3/4] w-full animate-pulse rounded-2xl bg-gray-200" />
      {/* Title placeholder */}
      <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-gray-200" />
      {/* Subtitle placeholder */}
      <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-gray-200" />
      {/* Tag pills placeholder */}
      <div className="mt-3 flex gap-2">
        <div className="h-4 w-10 animate-pulse rounded-full bg-gray-200" />
        <div className="h-4 w-12 animate-pulse rounded-full bg-gray-200" />
        <div className="h-4 w-8 animate-pulse rounded-full bg-gray-200" />
      </div>
    </div>
  )
}
