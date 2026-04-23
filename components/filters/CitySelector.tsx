'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FLAG_MAP } from '@/lib/constants/flags'
import { logEvent } from '@/lib/analytics/events'
import type { City, Country } from '@/types'

interface CitySelectorProps {
  cities: (City & { country: Country })[]
  selectedCityId: string | null
  onSelect: (cityId: string | null) => void
}

const Chevron = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, color: 'var(--dim)' }}>
    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default function CitySelector({ cities, selectedCityId, onSelect }: CitySelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [isMobile, setIsMobile] = useState(true)
  const [mounted, setMounted] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
    const check = () => setIsMobile(window.innerWidth < 1024)
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
  const triggerLabel = selectedCity ? selectedCity.name : 'Explore Everywhere'

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

  function close() {
    setOpen(false)
    setSearch('')
  }

  function handleSelect(cityId: string | null) {
    logEvent({ event_type: 'city_selected', city_id: cityId ?? undefined })
    onSelect(cityId)
    close()
  }

  // ── Desktop: custom dropdown matching prototype ──────────────────────────────
  if (!isMobile) {
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(!open)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 13px', border: '1.5px solid var(--border)',
            borderRadius: 11, background: 'var(--surface)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15 }}>🌐</span>
            {triggerLabel}
          </span>
          <Chevron />
        </button>

        {open && (
          <>
            <div onClick={close} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
            <div style={{
              position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0,
              background: 'white', border: '1px solid var(--border)', borderRadius: 11,
              boxShadow: '0 8px 24px oklch(0 0 0/0.1)', overflow: 'hidden', zIndex: 50,
            }}>
              {/* Explore Everywhere */}
              <div
                onClick={() => handleSelect(null)}
                style={{
                  padding: '10px 13px', fontSize: 12.5, cursor: 'pointer',
                  background: selectedCityId === null ? 'var(--accent-light)' : 'transparent',
                  color: selectedCityId === null ? 'var(--accent)' : 'inherit',
                  fontWeight: selectedCityId === null ? 600 : 400,
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (selectedCityId !== null) (e.currentTarget as HTMLElement).style.background = 'var(--surface)' }}
                onMouseLeave={e => { if (selectedCityId !== null) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                🌐 Explore Everywhere
              </div>

              {/* Cities */}
              {cities.map((city) => {
                const active = city.id === selectedCityId
                return (
                  <div
                    key={city.id}
                    onClick={() => handleSelect(city.id)}
                    style={{
                      padding: '10px 13px', fontSize: 12.5, cursor: 'pointer',
                      background: active ? 'var(--accent-light)' : 'transparent',
                      color: active ? 'var(--accent)' : 'inherit',
                      fontWeight: active ? 600 : 400,
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--surface)' }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    {FLAG_MAP[city.country.code] ?? ''} {city.name}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    )
  }

  // ── Mobile: bottom sheet ─────────────────────────────────────────────────────
  const sheet = (
    <>
      <div
        onClick={close}
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Select city"
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 flex max-h-[85dvh] flex-col rounded-t-2xl bg-white shadow-2xl transition-transform duration-300 ease-out',
          open ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div className="flex justify-center pb-2 pt-3">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>
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
              <button onClick={() => setSearch('')} className="text-xs text-gray-400">✕</button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
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
          <div className="h-8" />
        </div>
      </div>
    </>
  )

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 13px', border: '1.5px solid var(--border)',
          borderRadius: 11, background: 'var(--surface)',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15 }}>🌐</span>
          {triggerLabel}
        </span>
        <Chevron />
      </button>
      {mounted && createPortal(sheet, document.body)}
    </>
  )
}
