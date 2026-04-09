import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin } from 'lucide-react'
import { getPlaceById, getRelatedPlaces, getTasteAffinityPlaces } from '@/lib/db/supabase'
import BookmarkButton from '@/components/actions/BookmarkButton'
import ShareButton from '@/components/actions/ShareButton'
import PlaceImage from '@/components/places/PlaceImage'
import VideoEmbed from '@/components/VideoEmbed'
import PlaceCard from '@/components/places/PlaceCard'
import BookingCTA from '@/components/places/BookingCTA'
import CreatorAttribution from '@/components/places/CreatorAttribution'
import PlaceViewTracker from '@/components/places/PlaceViewTracker'
import { CATEGORIES } from '@/lib/constants/categories'
import type { Metadata } from 'next'

interface PlacePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PlacePageProps): Promise<Metadata> {
  const { id } = await params
  const place = await getPlaceById(id)
  if (!place) return {}

  const title = `${place.name} — Vibe Index`
  const description =
    place.description ??
    `Discover ${place.name} in ${place.city_name}. Find your vibe.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(place.thumbnail_url && {
        images: [{ url: place.thumbnail_url, width: 800, height: 600, alt: place.name }],
      }),
    },
    twitter: {
      card: place.thumbnail_url ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(place.thumbnail_url && { images: [place.thumbnail_url] }),
    },
  }
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { id } = await params
  const place = await getPlaceById(id)
  if (!place) notFound()
  const [related, affinity] = await Promise.all([
    getRelatedPlaces(place),
    getTasteAffinityPlaces(place.id),
  ])

  const locationParts = [place.neighbourhood, place.city_name, place.country_name].filter(Boolean)
  const locationString = locationParts.join(' · ')

  const tagGroups = [
    { label: 'Vibe', tags: place.taste_tags ?? [] },
    { label: 'Intent', tags: place.intent_tags ?? [] },
    { label: 'Moment', tags: place.moment_tags ?? [] },
  ].filter((g) => g.tags.length > 0)

  return (
    <div className="min-h-screen bg-background pb-24">
      <PlaceViewTracker placeId={place.id} cityId={place.city_id} category={place.category} />
      {/* Back button — desktop (outside grid, above) */}
      <div className="hidden lg:flex items-center gap-3 mx-auto max-w-5xl px-8 pt-6 pb-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-medium text-warm-gray-mid hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      {/* Main layout — stacked mobile, two-column desktop */}
      <div className="mx-auto max-w-5xl lg:grid lg:grid-cols-[1fr_1fr] lg:gap-8 lg:px-8 lg:items-start">

        {/* Left col: hero image */}
        <div className="relative h-[55vh] lg:h-auto lg:aspect-[3/4] w-full overflow-hidden bg-gray-200 lg:rounded-2xl lg:sticky lg:top-24">
          {place.thumbnail_url ? (
            <PlaceImage
              src={place.thumbnail_url}
              alt={place.name}
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300" />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Mobile top actions */}
          <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-4 lg:hidden">
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

          {/* Place name overlay — mobile only */}
          <div className="absolute bottom-0 left-0 right-0 p-4 lg:hidden">
            <h1 className="font-display text-3xl font-bold leading-tight text-white">{place.name}</h1>
            {locationString && (
              <div className="mt-1 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-white/70" />
                <p className="text-sm text-white/70">{locationString}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right col: content */}
        <div className="px-4 pt-5 lg:px-0 lg:pt-0">

          {/* Desktop: name + location + actions */}
          <div className="hidden lg:block mb-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-4xl font-bold leading-tight text-foreground">{place.name}</h1>
                {locationString && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-warm-gray-mid" />
                    <p className="text-sm text-warm-gray-mid">{locationString}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 shrink-0 mt-1">
                <ShareButton />
                <BookmarkButton id={place.id} />
              </div>
            </div>
          </div>

          {/* Category pill */}
          {place.category && (() => {
            const cat = CATEGORIES.find(c => c.value === place.category)
            return cat ? (
              <p className="mb-4 text-sm text-warm-gray-mid">{cat.emoji} {cat.label}</p>
            ) : null
          })()}

          {/* Creator attribution */}
          {place.creator_handle && place.creator_platform && (
            <div className="mb-4">
              <CreatorAttribution
                handle={place.creator_handle}
                platform={place.creator_platform}
                videoUrl={place.tiktok_url}
                variant="detail"
              />
            </div>
          )}

          {/* Description */}
          {place.description && (
            <p className="text-base leading-relaxed text-foreground">{place.description}</p>
          )}

          {/* Action links */}
          <div className="mt-6 flex flex-col gap-3">
            <BookingCTA
              bookingUrl={place.booking_url}
              ctaType={place.cta_type}
              placeName={place.name}
            />
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
          </div>

          {/* Tags */}
          {tagGroups.length > 0 && (
            <div className="mt-5 space-y-3">
              {tagGroups.map(({ label, tags }) => (
                <div key={label}>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-warm-gray-mid">
                    {label}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* See more in category */}
          {place.category && (() => {
            const cat = CATEGORIES.find(c => c.value === place.category)
            if (!cat) return null
            const href = `/?category=${place.category}`
            return (
              <Link
                href={href}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
              >
                {cat.emoji} See more {cat.label} places →
              </Link>
            )
          })()}

          {/* Video embed */}
          {place.tiktok_url && (
            <div className="mt-5">
              <VideoEmbed url={place.tiktok_url} thumbnail={place.thumbnail_url} />
            </div>
          )}

          {/* Others also loved — affinity-based, cold-start safe */}
          {affinity.length > 0 && (
            <div className="mt-10">
              <div className="mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray-mid">
                  Others also loved
                </p>
                <p className="font-display text-xl font-bold leading-tight text-foreground">
                  based on your vibe
                </p>
              </div>
              <div className="-mx-4 lg:mx-0 overflow-x-auto scroll-smooth [scroll-snap-type:x_mandatory] [&::-webkit-scrollbar]:hidden">
                <div className="flex gap-3 px-4 lg:px-0 pb-3">
                  {affinity.map((r) => (
                    <div key={r.id} className="w-40 flex-shrink-0 [scroll-snap-align:start]">
                      <PlaceCard place={r} variant="default" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Related places */}
          {related.length > 0 && (
            <div className="mt-10">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray-mid">
                    More like this
                  </p>
                  <p className="font-display text-xl font-bold leading-tight text-foreground">
                    in {place.city_name}
                  </p>
                </div>
                {related.length > 2 && (
                  <p className="pb-0.5 text-xs text-warm-gray-mid sm:hidden">swipe →</p>
                )}
              </div>

              <div className="-mx-4 lg:mx-0 overflow-x-auto scroll-smooth [scroll-snap-type:x_mandatory] [&::-webkit-scrollbar]:hidden">
                <div className="flex gap-3 px-4 lg:px-0 pb-3">
                  {related.map((r) => (
                    <div key={r.id} className="w-40 flex-shrink-0 [scroll-snap-align:start]">
                      <PlaceCard place={r} variant="default" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
