'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CitySelector from '@/components/filters/CitySelector'
import type { City, Country } from '@/types'

interface SubmitFormProps {
  cities: (City & { country: Country })[]
}

const inputClass =
  'w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-foreground placeholder:text-warm-gray-mid/50 focus:border-accent focus:outline-none transition-colors'
const labelClass =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-warm-gray-mid'
const errorClass = 'mt-1 text-xs text-red-500'

export default function SubmitForm({ cities }: SubmitFormProps) {
  const [placeName, setPlaceName] = useState('')
  const [cityId, setCityId] = useState<string | null>(null)
  const [vibeDescription, setVibeDescription] = useState('')
  const [bookingUrl, setBookingUrl] = useState('')
  const [socialUrl, setSocialUrl] = useState('')
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [serverError, setServerError] = useState<string | null>(null)

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {}
    if (!placeName.trim()) errs.placeName = 'Place name is required'
    if (!cityId) errs.cityId = 'Please select a city'
    if (!email.trim()) errs.email = 'Email is required'
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setStatus('loading')
    setServerError(null)

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          place_name: placeName.trim(),
          city_id: cityId,
          vibe_description: vibeDescription.trim() || null,
          booking_url: bookingUrl.trim() || null,
          social_url: socialUrl.trim() || null,
          submitter_email: email.trim(),
          website: honeypot, // honeypot field
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setServerError(data.error ?? 'Something went wrong. Please try again.')
        setStatus('error')
        return
      }

      setStatus('success')
    } catch {
      setServerError('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 pb-24 text-center">
        <p className="text-3xl text-accent">✦</p>
        <h2 className="mt-4 font-display text-2xl font-semibold text-foreground">Thanks for the tip</h2>
        <p className="mt-2 text-sm text-warm-gray-mid">
          We&apos;ll review it and add it to the index if it has the right vibe.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition active:scale-95"
        >
          Back to discover
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="mx-auto max-w-2xl px-4 pb-2 pt-5">
        <Link href="/" className="mb-4 flex items-center gap-1.5 text-sm text-warm-gray-mid">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="font-display text-3xl font-semibold text-foreground">Submit a Place</h1>
        <p className="mt-1 text-sm font-light text-warm-gray-mid">Know somewhere worth discovering?</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-2xl mt-6 space-y-5 px-4">

        {/* Honeypot — invisible to humans, filled by bots */}
        <div className="hidden" aria-hidden="true">
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        {/* Place name */}
        <div>
          <label className={labelClass}>Place name *</label>
          <input
            type="text"
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
            placeholder="e.g. Cafe du Monde"
            className={inputClass}
            maxLength={100}
          />
          {errors.placeName && <p className={errorClass}>{errors.placeName}</p>}
        </div>

        {/* City — CitySelector (bottom sheet on mobile, select on desktop) */}
        <div>
          <label className={labelClass}>City *</label>
          <CitySelector
            cities={cities}
            selectedCityId={cityId}
            onSelect={(id) => {
              setCityId(id)
              if (errors.cityId) setErrors((prev) => { const next = { ...prev }; delete next.cityId; return next })
            }}
          />
          {errors.cityId && <p className={errorClass}>{errors.cityId}</p>}
        </div>

        {/* Vibe description */}
        <div>
          <label className={labelClass}>What&apos;s the vibe?</label>
          <textarea
            rows={3}
            value={vibeDescription}
            onChange={(e) => setVibeDescription(e.target.value)}
            placeholder="Describe the atmosphere, who it's for, what makes it special…"
            maxLength={500}
            className="w-full resize-none rounded-xl border border-border bg-white px-4 py-3 text-base text-foreground placeholder:text-warm-gray-mid/50 focus:border-accent focus:outline-none transition-colors"
          />
        </div>

        {/* Booking URL */}
        <div>
          <label className={labelClass}>Booking / website URL</label>
          <input
            type="url"
            value={bookingUrl}
            onChange={(e) => setBookingUrl(e.target.value)}
            placeholder="https://"
            className={inputClass}
          />
        </div>

        {/* Social URL */}
        <div>
          <label className={labelClass}>TikTok / Instagram / YouTube URL</label>
          <input
            type="url"
            value={socialUrl}
            onChange={(e) => setSocialUrl(e.target.value)}
            placeholder="https://"
            className={inputClass}
          />
          {errors.socialUrl && <p className={errorClass}>{errors.socialUrl}</p>}
        </div>

        {/* Email */}
        <div>
          <label className={labelClass}>Your email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="we'll let you know when it goes live"
            className={inputClass}
            maxLength={200}
          />
          {errors.email && <p className={errorClass}>{errors.email}</p>}
        </div>

        {/* Server error */}
        {serverError && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{serverError}</p>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="mt-2 w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-60"
        >
          {status === 'loading' ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Submitting…
            </span>
          ) : (
            'Submit place'
          )}
        </button>
      </form>
    </div>
  )
}
