import Link from 'next/link'
import BookmarkButton from '@/components/actions/BookmarkButton'
import PlaceImage from '@/components/places/PlaceImage'
import CreatorAttribution from '@/components/places/CreatorAttribution'
import { FLAG_MAP } from '@/lib/constants/flags'
import { CATEGORIES } from '@/lib/constants/categories'
import type { Place } from '@/types'

interface PlaceCardProps {
  place: Place
  searchMode?: boolean
  matchedTags?: string[]
  variant?: 'default' | 'hero' | 'wide'
}

export default function PlaceCard({ place, searchMode = false, matchedTags = [], variant = 'default' }: PlaceCardProps) {
  const tasteTags = (place.taste_tags ?? []).slice(0, 3)
  const flag = FLAG_MAP[place.country_code] ?? ''
  const locationLine = place.neighbourhood
    ? `${place.neighbourhood} · ${place.city_name} ${flag}`
    : `${place.city_name} ${flag}`

  const aspectClass =
    variant === 'hero' ? 'aspect-[16/9] lg:aspect-[3/4]' :
    variant === 'wide' ? 'aspect-[21/9] lg:aspect-[3/4]' :
    'aspect-[3/4]'

  const nameSize =
    variant === 'hero' ? 'text-[26px] font-bold lg:text-base lg:font-semibold' :
    variant === 'wide' ? 'text-[22px] font-bold lg:text-base lg:font-semibold' :
    'text-[16px] font-semibold'

  const namePadding =
    variant === 'hero' ? 'p-4 pt-12 lg:p-3 lg:pt-8' :
    'p-3 pt-8'

  return (
    <Link href={`/place/${place.id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-stone-100 transition-shadow duration-200 hover:shadow-lg">
        <div className={`relative ${aspectClass} w-full`}>
          {place.thumbnail_url ? (
            <PlaceImage
              src={place.thumbnail_url}
              alt={place.name}
              sizes={variant === 'default' ? '(max-width: 768px) 50vw, 33vw' : '(max-width: 768px) 100vw, 50vw'}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-stone-200 to-stone-300" />
          )}
        </div>

        {/* Featured badge */}
        {place.featured && (
          <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-amber-300 backdrop-blur-sm">
            ● Curated
          </span>
        )}

        <BookmarkButton id={place.id} className="absolute right-2 top-2" />

        {/* Name + location + tags — all inside overlay */}
        <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/72 via-black/20 to-transparent ${namePadding}`}>
          <p className={`font-display ${nameSize} leading-tight text-white`}>{place.name}</p>
          {/* Location — shown in overlay for all variants */}
          <p className="text-[11px] text-white/72 mb-1">📍 {locationLine}</p>
          {/* Creator attribution */}
          {place.creator_handle && place.creator_platform && (
            <CreatorAttribution
              handle={place.creator_handle}
              platform={place.creator_platform}
              videoUrl={place.tiktok_url}
              variant="card"
            />
          )}
          {/* Tags — moved inside overlay */}
          {!searchMode && tasteTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {tasteTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-accent/80 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Below-card location — default and wide only */}
      {variant !== 'hero' && (
        <div className="mt-2 px-0.5">
          <p className="truncate text-xs text-warm-gray-mid">{locationLine}</p>
        </div>
      )}

      {/* Category label */}
      {variant !== 'hero' && place.category && (() => {
        const cat = CATEGORIES.find(c => c.value === place.category)
        return cat ? (
          <p className="mt-0.5 px-0.5 text-xs text-warm-gray-mid">{cat.emoji} {cat.label}</p>
        ) : null
      })()}

      {/* Search matched line */}
      {searchMode && matchedTags.length > 0 && (
        <p className="mt-1.5 px-0.5 text-xs font-medium text-accent">
          ✦ Matched for: {matchedTags.map(t => t.replace(/-/g, ' ')).join(' · ')}
        </p>
      )}
    </Link>
  )
}
