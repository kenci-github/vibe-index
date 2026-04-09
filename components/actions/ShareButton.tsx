'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'
import { logEvent } from '@/lib/analytics/events'

export default function ShareButton() {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = window.location.href
    logEvent({ event_type: 'share_tapped', metadata: { url } })

    if (navigator.share) {
      try {
        await navigator.share({ url })
        return
      } catch {
        // fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleShare}
      aria-label="Share this place"
      className="flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-transform active:scale-90"
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
    </button>
  )
}
