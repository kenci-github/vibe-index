'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FLAG_MAP } from '@/lib/constants/flags'
import type { City, Country } from '@/types'

interface CitySelectorProps {
  cities: (City & { country: Country })[]
  selectedCityId: string | null
  onSelect: (cityId: string | null) => void
}

export default function CitySelector({ cities, selectedCityId, onSelect }: CitySelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [isMobile, setIsMobile] = useState(true)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 150)
    }
  }, [open])

  const selectedCity = cities.find((c) => c.id === selectedCityId)
  const triggerLabel = selectedCity
    ? `${FLAG_MAP[selectedCity.country.code] ?? ''} ${selectedCity.name}`
    : 'Explore Everywhere'

  const filtered = search.trim()
    ? cities.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.country.name.toLowerCase().includes(search.toLowerCase())
      )
    : cities

  // Group by country
  const grouped = filtered.reduce<Record<string, { country: Country; cities: (City & { country: Country })[] }>>(
    (acc, city) => {
      const key = city.country.id
      if (!acc[key]) acc[key] = { country: city.country, cities: [] }
      acc[key].cities.push(city)
      return acc
    },
    {}
  )
  const groups = Object.values(grouped).sort((a, b) => a.country.name.localeCompare(b.country.name))

  function closeSheet() {
    setOpen(false)
    setSearch('')
  }

  function handleSelect(cityId: string | null) {
    // TODO: if city.active === false, show WaitlistForm instead of selecting
    // Currently unreachable via normal UI — getCities() returns active cities only
    onSelect(cityId)
    closeSheet()
  }

  // Desktop: styled select
  if (!isMobile) {
    return (
      <div className="relative inline-block">
        <select
          value={selectedCityId ?? ''}
          onChange={(e) => handleSelect(e.target.value || null)}
          className="appearance-none rounded-full border border-gray-200 bg-white py-2 pl-4 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          <option value="">Explore Everywhere</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}, {city.country.name}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
          ▾
        </span>
      </div>
    )
  }

  // Mobile: bottom sheet
  // NOTE: backdrop + sheet are portalled to document.body to escape the sticky
  // header's backdrop-filter stacking context (which would clip fixed children).
  const sheet = (
    <>
      {/* Backdrop */}
      <div
        onClick={closeSheet}
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Select city"
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 flex max-h-[85dvh] flex-col rounded-t-2xl bg-white shadow-2xl transition-transform duration-300 ease-out',
          open ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        {/* Drag handle */}
        <div className="flex justify-center pb-2 pt-3">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2">
            <span className="text-gray-400 text-sm">🔍</span>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search cities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-base text-gray-800 placeholder-gray-400 focus:outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-xs text-gray-400">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* City list */}
        <div className="flex-1 overflow-y-auto">
          {/* Explore Everywhere */}
          <button
            onClick={() => handleSelect(null)}
            className={cn(
              'flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors',
              selectedCityId === null ? 'bg-accent/5 font-semibold text-accent' : 'text-gray-700 hover:bg-gray-50'
            )}
          >
            <span className="text-lg">🌍</span>
            <span className="flex-1 text-sm">Explore Everywhere</span>
            {selectedCityId === null && <Check className="h-4 w-4 text-accent" />}
          </button>

          {/* Grouped cities */}
          {groups.map(({ country, cities: groupCities }) => (
            <div key={country.id}>
              <div className="flex items-center gap-2 bg-gray-50 px-5 py-2">
                <span>{FLAG_MAP[country.code] ?? ''}</span>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  {country.name}
                </span>
              </div>
              {groupCities.map((city) => {
                const active = city.id === selectedCityId
                return (
                  <button
                    key={city.id}
                    onClick={() => handleSelect(city.id)}
                    className={cn(
                      'flex w-full items-center px-5 py-3.5 text-left transition-colors',
                      active ? 'bg-accent/5 font-semibold text-accent' : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <span className="flex-1 text-sm">{city.name}</span>
                    {active && <Check className="h-4 w-4 text-accent" />}
                  </button>
                )
              })}
            </div>
          ))}

          {groups.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-gray-400">No cities found</div>
          )}

          {/* Bottom padding for safe area */}
          <div className="h-8" />
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-accent/50 active:scale-95"
      >
        <span>{triggerLabel}</span>
        <span className="text-xs text-gray-400">▾</span>
      </button>

      {/* Portal backdrop + sheet to body to escape sticky header backdrop-filter stacking context */}
      {typeof document !== 'undefined' && createPortal(sheet, document.body)}
    </>
  )
}
