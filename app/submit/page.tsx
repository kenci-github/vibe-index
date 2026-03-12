'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function SubmitPage() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 pb-24 text-center">
        <p className="text-3xl text-accent">✦</p>
        <h2 className="mt-4 font-display text-2xl font-semibold text-foreground">Thanks for the tip</h2>
        <p className="mt-2 text-sm text-warm-gray-mid">We'll review it and add it to the index if it has the right vibe.</p>
        <Link href="/" className="mt-6 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white">
          Back to discover
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-4 pb-2 pt-5">
        <Link href="/" className="mb-4 flex items-center gap-1.5 text-sm text-warm-gray-mid">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="font-display text-3xl font-semibold text-foreground">Submit a Place</h1>
        <p className="mt-1 text-sm font-light text-warm-gray-mid">Know somewhere worth discovering?</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 px-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-warm-gray-mid">
            Place name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Cafe du Monde"
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-foreground placeholder:text-warm-gray-mid/50 focus:border-accent focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-warm-gray-mid">
            City *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. New Orleans"
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-foreground placeholder:text-warm-gray-mid/50 focus:border-accent focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-warm-gray-mid">
            What's the vibe?
          </label>
          <textarea
            rows={3}
            placeholder="Describe the atmosphere, who it's for, what makes it special…"
            className="w-full resize-none rounded-xl border border-border bg-white px-4 py-3 text-base text-foreground placeholder:text-warm-gray-mid/50 focus:border-accent focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-warm-gray-mid">
            Booking / website URL
          </label>
          <input
            type="url"
            placeholder="https://"
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-foreground placeholder:text-warm-gray-mid/50 focus:border-accent focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-warm-gray-mid">
            TikTok / Instagram Reel URL
          </label>
          <input
            type="url"
            placeholder="https://"
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-foreground placeholder:text-warm-gray-mid/50 focus:border-accent focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-warm-gray-mid">
            Your email (optional)
          </label>
          <input
            type="email"
            placeholder="we'll let you know when it goes live"
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-foreground placeholder:text-warm-gray-mid/50 focus:border-accent focus:outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          className="mt-2 w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-white transition active:scale-95"
        >
          Submit place
        </button>
      </form>
    </div>
  )
}
