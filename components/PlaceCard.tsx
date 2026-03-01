import Link from 'next/link'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import BookmarkButton from '@/components/BookmarkButton'
import type { Place } from '@/lib/types'

interface PlaceCardProps {
  place: Place
}

export default function PlaceCard({ place }: PlaceCardProps) {
  const allTags = [...(place.taste_tags ?? []), ...(place.intent_tags ?? [])].slice(0, 3)

  return (
    <Link href={`/place/${place.id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-gray-100">
        <div className="aspect-[3/4] w-full">
          {place.thumbnail_url ? (
            <Image
              src={place.thumbnail_url}
              alt={place.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300" />
          )}
        </div>

        <BookmarkButton id={place.id} className="absolute right-2 top-2" />

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 pt-8">
          <p className="truncate text-sm font-bold text-white">{place.name}</p>
          {place.neighbourhood && (
            <div className="mt-0.5 flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0 text-white/70" />
              <p className="truncate text-xs text-white/70">{place.neighbourhood}</p>
            </div>
          )}
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1 px-0.5">
          {allTags.map((tag) => (
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
