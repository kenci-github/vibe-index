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
    </div>
  )
}
