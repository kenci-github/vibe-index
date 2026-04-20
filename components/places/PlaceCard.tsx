import Link from 'next/link'
import BookmarkButton from '@/components/actions/BookmarkButton'
import PlaceImage from '@/components/places/PlaceImage'
import CreatorAttribution from '@/components/places/CreatorAttribution'
import CuratedBadge from '@/components/ui/CuratedBadge'
import StarRating from '@/components/ui/StarRating'
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

  // ── Overlay variants (hero / wide) — keep existing dark-gradient style ──
  if (variant === 'hero' || variant === 'wide') {
    const aspectClass =
      variant === 'hero' ? 'aspect-[16/9] lg:aspect-[3/4]' : 'aspect-[21/9] lg:aspect-[3/4]'
    const nameSize =
      variant === 'hero'
        ? 'text-[26px] font-bold lg:text-base lg:font-semibold'
        : 'text-[22px] font-bold lg:text-base lg:font-semibold'
    const namePadding = variant === 'hero' ? 'p-4 pt-12 lg:p-3 lg:pt-8' : 'p-3 pt-8'

    return (
      <Link href={`/place/${place.id}`} className="group block">
        <div className="relative overflow-hidden rounded-2xl bg-stone-100 transition-shadow duration-200 hover:shadow-lg">
          <div className={`relative ${aspectClass} w-full`}>
            {place.thumbnail_url ? (
              <PlaceImage
                src={place.thumbnail_url}
                alt={place.name}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-stone-200 to-stone-300" />
            )}
          </div>

          {place.featured && (
            <CuratedBadge className="absolute left-2.5 top-2.5" />
          )}

          <BookmarkButton id={place.id} className="absolute right-2 top-2" />

          <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/72 via-black/20 to-transparent ${namePadding}`}>
            <p className={`font-display ${nameSize} leading-tight text-white`}>{place.name}</p>
            <p className="text-[11px] text-white/72 mb-1">📍 {locationLine}</p>
            {place.creator_handle && place.creator_platform && (
              <CreatorAttribution
                handle={place.creator_handle}
                platform={place.creator_platform}
                videoUrl={place.tiktok_url}
                variant="card"
              />
            )}
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

        {variant !== 'hero' && (
          <div className="mt-2 px-0.5">
            <p className="truncate text-xs text-warm-gray-mid">{locationLine}</p>
          </div>
        )}

        {variant !== 'hero' && place.category && (() => {
          const cat = CATEGORIES.find(c => c.value === place.category)
          return cat ? (
            <p className="mt-0.5 px-0.5 text-xs text-warm-gray-mid">{cat.emoji} {cat.label}</p>
          ) : null
        })()}

        {searchMode && matchedTags.length > 0 && (
          <p className="mt-1.5 px-0.5 text-xs font-medium text-accent">
            ✦ Matched for: {matchedTags.map(t => t.replace(/-/g, ' ')).join(' · ')}
          </p>
        )}
      </Link>
    )
  }

  // ── Default variant — photo-first layout ──
  const firstIntentTag = (place.intent_tags ?? [])[0]
  const categoryLabel = (() => {
    if (place.category) {
      const cat = CATEGORIES.find(c => c.value === place.category)
      return cat ? `${cat.emoji} ${cat.label}` : firstIntentTag?.replace(/-/g, ' ')
    }
    return firstIntentTag?.replace(/-/g, ' ')
  })()

  return (
    <Link href={`/place/${place.id}`} className="group block">
      <div
        className="transition-all duration-[220ms] ease-[ease]"
        style={{
          borderRadius: 14,
          border: '1px solid var(--border)',
          background: 'white',
          boxShadow: 'var(--shadow-card)',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement
          el.style.transform = 'translateY(-2px)'
          el.style.boxShadow = 'var(--shadow-card-hover)'
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement
          el.style.transform = ''
          el.style.boxShadow = 'var(--shadow-card)'
        }}
      >
        {/* Image container */}
        <div
          className="relative overflow-hidden"
          style={{
            height: 195,
            borderRadius: '14px 14px 0 0',
            position: 'relative',
          }}
        >
          {place.thumbnail_url ? (
            <PlaceImage
              src={place.thumbnail_url}
              alt={place.name}
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-[450ms] ease-[ease] group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-stone-200 to-stone-300" />
          )}

          {/* Curated badge */}
          {place.featured && (
            <CuratedBadge className="absolute top-2 left-2" />
          )}

          {/* Bookmark button */}
          <div className="absolute top-2 right-2">
            <BookmarkButton id={place.id} />
          </div>
        </div>

        {/* Info area */}
        <div style={{ padding: '12px 14px 14px' }}>
          {/* Row 1: name + rating */}
          <div className="flex items-start justify-between gap-2">
            <h3
              className="leading-tight tracking-tight"
              style={{
                fontFamily: 'var(--font-jakarta)',
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--text)',
                flex: 1,
                minWidth: 0,
              }}
            >
              {place.name}
            </h3>
            <StarRating rating={4.7} />
          </div>

          {/* Row 2: location */}
          <p
            className="truncate"
            style={{
              color: 'var(--muted)',
              fontSize: 11.5,
              marginTop: 4,
            }}
          >
            📍 {locationLine}
          </p>

          {/* Row 3: taste tags + category */}
          <div className="flex items-center justify-between gap-1 mt-2">
            {/* Taste tags */}
            <div className="flex gap-1 flex-wrap min-w-0">
              {(place.taste_tags ?? []).slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: 'var(--accent-light)',
                    color: 'var(--accent)',
                    fontSize: 10,
                    fontWeight: 600,
                    borderRadius: 20,
                    padding: '2px 8px',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Category / intent type */}
            {categoryLabel && (
              <span
                className="shrink-0"
                style={{
                  color: 'var(--dim)',
                  fontSize: 10.5,
                }}
              >
                {categoryLabel}
              </span>
            )}
          </div>

          {/* Creator attribution (if any) */}
          {place.creator_handle && place.creator_platform && (
            <div className="mt-2">
              <CreatorAttribution
                handle={place.creator_handle}
                platform={place.creator_platform}
                videoUrl={place.tiktok_url}
                variant="card"
              />
            </div>
          )}
        </div>
      </div>

      {/* Search matched line */}
      {searchMode && matchedTags.length > 0 && (
        <p className="mt-1.5 px-0.5 text-xs font-medium text-accent">
          ✦ Matched for: {matchedTags.map(t => t.replace(/-/g, ' ')).join(' · ')}
        </p>
      )}
    </Link>
  )
}
