'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'

interface VideoEmbedProps {
  url: string
  thumbnail?: string | null
}

export default function VideoEmbed({ url, thumbnail }: VideoEmbedProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle')
  const [oembedHtml, setOembedHtml] = useState<string | null>(null)

  async function handlePlay() {
    setState('loading')
    try {
      const res = await fetch(`/api/oembed?url=${encodeURIComponent(url)}`)
      if (!res.ok) throw new Error('oEmbed failed')
      const data = await res.json()
      if (!data.html) throw new Error('No embed HTML')
      setOembedHtml(data.html)
      setState('playing')
    } catch {
      setState('error')
    }
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-black aspect-[9/16]">
      {state === 'playing' && oembedHtml ? (
        <div
          className="absolute inset-0 [&_iframe]:!h-full [&_iframe]:!w-full"
          dangerouslySetInnerHTML={{ __html: oembedHtml }}
        />
      ) : (
        <>
          {/* Thumbnail */}
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt="Video thumbnail"
              fill
              className="object-cover"
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Play / loading / error button */}
          <div className="absolute inset-0 flex items-center justify-center">
            {state === 'error' ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2.5 text-sm font-semibold text-gray-900"
              >
                <ExternalLink className="h-4 w-4" />
                Watch on TikTok
              </a>
            ) : state === 'loading' ? (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </div>
            ) : (
              <button
                onClick={handlePlay}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform active:scale-95"
                aria-label="Play video"
              >
                <div
                  className="ml-1 h-0 w-0"
                  style={{
                    borderTop: '10px solid transparent',
                    borderBottom: '10px solid transparent',
                    borderLeft: '18px solid #FF4D4D',
                  }}
                />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
