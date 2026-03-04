import { NextRequest, NextResponse } from 'next/server'

const OEMBED_ENDPOINTS: Record<string, string> = {
  'tiktok.com': 'https://www.tiktok.com/oembed',
  'youtube.com': 'https://www.youtube.com/oembed',
  'youtu.be': 'https://www.youtube.com/oembed',
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

  const provider = Object.keys(OEMBED_ENDPOINTS).find((k) => url.includes(k))
  if (!provider) return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 })

  try {
    const endpoint = OEMBED_ENDPOINTS[provider]
    const res = await fetch(`${endpoint}?url=${encodeURIComponent(url)}&format=json`)
    if (!res.ok) return NextResponse.json({ error: 'oEmbed fetch failed' }, { status: 500 })

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'oEmbed fetch failed' }, { status: 500 })
  }
}
