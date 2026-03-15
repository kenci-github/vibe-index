interface SkeletonCardProps {
  variant?: 'default' | 'hero' | 'wide'
}

export default function SkeletonCard({ variant = 'default' }: SkeletonCardProps) {
  const aspectClass =
    variant === 'hero' ? 'aspect-[16/9] lg:aspect-[3/4]' :
    variant === 'wide' ? 'aspect-[21/9] lg:aspect-[3/4]' :
    'aspect-[3/4]'

  return (
    <div className="block">
      {/* Thumbnail placeholder */}
      <div className={`${aspectClass} w-full animate-pulse rounded-2xl bg-stone-200`} />
      {/* Title placeholder */}
      <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-stone-200" />
      {/* Subtitle placeholder */}
      <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-stone-200" />
      {/* Tag pills placeholder */}
      <div className="mt-3 flex gap-2">
        <div className="h-4 w-10 animate-pulse rounded-full bg-stone-200" />
        <div className="h-4 w-12 animate-pulse rounded-full bg-stone-200" />
        <div className="h-4 w-8 animate-pulse rounded-full bg-stone-200" />
      </div>
    </div>
  )
}
