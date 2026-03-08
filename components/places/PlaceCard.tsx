import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import BookmarkButton from '@/components/actions/BookmarkButton'
import PlaceImage from '@/components/places/PlaceImage'
import { FLAG_MAP } from '@/lib/constants/flags'
import type { Place } from '@/types'

interface PlaceCardProps {
  place: Place
}

export default function PlaceCard({ place }: PlaceCardProps) {
  const tasteTags = (place.taste_tags ?? []).slice(0, 3)
  const flag = FLAG_MAP[place.country_code] ?? ''
  const locationLine = place.neighbourhood
    ? `${place.neighbourhood} · ${place.city_name} ${flag}`
    : `${place.city_name} ${flag}`

  return (
    <Link href={`/place/${place.id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-gray-100">
        <div className="aspect-[3/4] w-full">
          {place.thumbnail_url ? (
            <PlaceImage
              src={place.thumbnail_url}
              alt={place.name}
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300" />
          )}
        </div>

        {place.featured && (
          <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">
            ✦ Featured
          </span>
        )}
        <BookmarkButton id={place.id} className="absolute right-2 top-2" />

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 pt-8">
          <p className="truncate text-sm font-bold text-white">{place.name}</p>
          <p className="mt-0.5 truncate text-xs text-white/70">{locationLine}</p>
        </div>
      </div>

      {tasteTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1 px-0.5">
          {tasteTags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="border-gray-200 text-[10px] text-gray-500"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </Link>
  )
}
