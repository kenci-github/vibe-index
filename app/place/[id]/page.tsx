import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MapPin, ExternalLink, Share2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import BookmarkButton from '@/components/BookmarkButton'
import ShareButton from '@/components/ShareButton'
import type { Place } from '@/lib/types'

interface PlacePageProps {
  params: Promise<{ id: string }>
}

async function getPlace(id: string): Promise<Place | null> {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('id', id)
    .eq('active', true)
    .single()

  if (error || !data) return null
  return data as Place
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { id } = await params
  const place = await getPlace(id)

  if (!place) notFound()

  const tagGroups = [
    { label: 'Vibe', tags: place.taste_tags ?? [] },
    { label: 'Intent', tags: place.intent_tags ?? [] },
    { label: 'Moment', tags: place.moment_tags ?? [] },
  ].filter((g) => g.tags.length > 0)

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero image */}
      <div className="relative h-[55vh] w-full overflow-hidden bg-gray-200">
        {place.thumbnail_url ? (
          <Image
            src={place.thumbnail_url}
            alt={place.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top actions */}
        <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-4">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex gap-2">
            <ShareButton />
            <BookmarkButton id={place.id} />
          </div>
        </div>

        {/* Place name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h1 className="text-2xl font-bold leading-tight text-white">{place.name}</h1>
          {(place.neighbourhood || place.city) && (
            <div className="mt-1 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-white/70" />
              <p className="text-sm text-white/70">
                {[place.neighbourhood, place.city].filter(Boolean).join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-5">
        {/* Description */}
        {place.description && (
          <p className="text-base leading-relaxed text-gray-700">{place.description}</p>
        )}

        {/* Tags */}
        {tagGroups.length > 0 && (
          <div className="mt-5 space-y-3">
            {tagGroups.map(({ label, tags }) => (
              <div key={label}>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-gray-400">
                  {label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      className="border-gray-200 bg-gray-50 text-xs text-gray-600"
                      variant="outline"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action links */}
        <div className="mt-6 flex flex-col gap-3">
          {place.google_maps_url && (
            <a
              href={place.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-3.5 text-sm font-semibold text-white"
            >
              <MapPin className="h-4 w-4" />
              Open in Maps
            </a>
          )}
          {place.tiktok_url && (
            <a
              href={place.tiktok_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-3.5 text-sm font-semibold text-gray-700"
            >
              <ExternalLink className="h-4 w-4" />
              View on TikTok
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
