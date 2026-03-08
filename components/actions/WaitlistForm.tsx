'use client'

import { useEffect, useState } from 'react'

interface WaitlistFormProps {
  cityId: string
  cityName: string
}

export default function WaitlistForm({ cityId, cityName }: WaitlistFormProps) {
  const [count, setCount] = useState<number | null>(null)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'duplicate'>('idle')

  useEffect(() => {
    fetch(`/api/waitlist/count?city_id=${cityId}`)
      .then((r) => r.json())
      .then((d) => setCount(d.count))
      .catch(() => {})
  }, [cityId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, city_id: cityId, city_name: cityName }),
      })
      const data = await res.json()
      if (data.alreadyJoined) setStatus('duplicate')
      else if (data.success) setStatus('success')
      else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success' || status === 'duplicate') {
    return (
      <p className="text-center text-sm text-gray-600">
        {status === 'duplicate'
          ? `You're already on the list for ${cityName}!`
          : `You're on the list! We'll email you when ${cityName} launches.`}
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xl font-bold text-gray-900">{cityName} is coming soon</p>
      {count !== null && (
        <p className="text-sm text-gray-500">
          Join {count} {count === 1 ? 'person' : 'people'} waiting
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
        >
          {status === 'loading' ? '…' : 'Notify me'}
        </button>
      </form>
      {status === 'error' && (
        <p className="text-xs text-red-500">Something went wrong — try again</p>
      )}
    </div>
  )
}
