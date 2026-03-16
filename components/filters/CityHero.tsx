import Image from 'next/image'
import { FLAG_MAP } from '@/lib/constants/flags'
import type { City, Country } from '@/types'

interface CityHeroProps {
  city: (City & { country: Country }) | null
}

export default function CityHero({ city }: CityHeroProps) {
  if (!city) return null

  const flag = FLAG_MAP[city.country.code] ?? ''
  const hasImage = !!city.hero_image_url

  return (
    <div className="relative mx-4 mt-3 overflow-hidden rounded-2xl">
      {hasImage ? (
        <>
          <Image
            src={city.hero_image_url!}
            alt={city.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) calc(100vw - 32px), 736px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="relative p-4 pt-24">
            <p className="text-xl font-bold text-white">{flag} {city.name}</p>
            {city.tagline && (
              <p className="mt-0.5 text-sm italic text-white/80">{city.tagline}</p>
            )}
          </div>
        </>
      ) : (
        <div className="bg-gradient-to-br from-accent/20 to-accent/5 p-4">
          <p className="text-xl font-bold text-gray-900">{flag} {city.name}</p>
          {city.tagline && (
            <p className="mt-0.5 text-sm italic text-gray-500">{city.tagline}</p>
          )}
        </div>
      )}
    </div>
  )
}
