'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Star } from 'lucide-react'
import PlaceImage from '@/components/PlaceImage'
import type { Place } from '@/types'

const FLAG_MAP: Record<string, string> = {
  GB: '🇬🇧',
  US: '🇺🇸',
  JP: '🇯🇵',
  MX: '🇲🇽',
  FR: '🇫🇷',
  DE: '🇩🇪',
  IT: '🇮🇹',
  CA: '🇨🇦',
  AU: '🇦🇺',
  BR: '🇧🇷',
}

interface AirbnbCardProps {
  place: Place
  rating?: number
  reviewCount?: number
  priceLabel?: string
  hostAvatarUrl?: string
}

function WishlistButton() {
  const [wished, setWished] = useState(false)

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setWished((prev) => !prev)
      }}
      aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-transform active:scale-90"
    >
      <Heart
        className="h-4 w-4"
        strokeWidth={2}
        fill={wished ? '#FF5A5F' : 'none'}
        stroke={wished ? '#FF5A5F' : 'white'}
      />
    </button>
  )
}

function StarRow({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const filled = Math.round(rating)
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-3 w-3" strokeWidth={0} fill={i < filled ? '#FF5A5F' : '#E0E0E0'} />
        ))}
      </div>
      <span className="font-display text-xs font-medium text-[#484848]">{rating.toFixed(1)}</span>
      {reviewCount > 0 && (
        <span className="font-display text-xs text-[#767676]">({reviewCount})</span>
      )}
    </div>
  )
}

export default function AirbnbCard({
  place,
  rating = 4.5,
  reviewCount = 0,
  priceLabel,
  hostAvatarUrl,
}: AirbnbCardProps) {
  const flag = FLAG_MAP[place.country_code] ?? ''
  const locationLine = place.neighbourhood
    ? `${place.neighbourhood} · ${place.city_name} ${flag}`
    : `${place.city_name} ${flag}`
  const avatarSrc = hostAvatarUrl ?? 'https://placehold.co/32x32'

  return (
    <Link href={`/place/${place.id}`} className="block">
      <div className="card-airbnb overflow-hidden rounded-2xl bg-white">
        {/* Image container — 4:3, no overflow-hidden so avatar can escape downward */}
        <div className="relative aspect-[4/3] w-full bg-gray-100">
          {place.thumbnail_url ? (
            <PlaceImage
              src={place.thumbnail_url}
              alt={place.name}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300" />
          )}

          {/* Wishlist heart — top right */}
          <div className="absolute right-2 top-2 z-10">
            <WishlistButton />
          </div>

          {/* Host avatar — bottom left, translate-y-1/2 makes bottom half overflow into card body */}
          <div className="absolute bottom-0 left-3 z-10 translate-y-1/2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarSrc}
              alt="Host"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full border-2 border-white object-cover"
            />
          </div>
        </div>

        {/* Card body — pt-5 (20px) = 16px avatar overlap + 4px gap */}
        <div className="px-3 pb-3 pt-5">
          <p className="truncate text-sm font-semibold text-[#484848]">{place.name}</p>
          <p className="mt-0.5 truncate font-display text-xs text-[#767676]">{locationLine}</p>

          <div className="mt-2">
            <StarRow rating={rating} reviewCount={reviewCount} />
          </div>

          {priceLabel && (
            <p className="mt-1.5 font-display text-xs font-medium text-[#484848]">{priceLabel}</p>
          )}
        </div>
      </div>
    </Link>
  )
}
