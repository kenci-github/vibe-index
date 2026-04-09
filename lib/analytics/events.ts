import { getSessionId } from './session'
import type { PlaceCategory, TasteTag, IntentTag, MomentTag } from '@/types'

export type EventType =
  | 'city_selected'
  | 'tag_applied'
  | 'search_submitted'
  | 'listing_viewed'
  | 'video_played'
  | 'bookmark_tapped'
  | 'share_tapped'
  | 'booking_cta_tapped'

export interface EventPayload {
  event_type: EventType
  place_id?: string
  city_id?: string
  category?: PlaceCategory | null
  taste_tags?: TasteTag[]
  intent_tags?: IntentTag[]
  moment_tags?: MomentTag[]
  search_query?: string
  cta_type?: string
  metadata?: Record<string, unknown>
}

/**
 * Fire-and-forget dual-track event logger.
 * Posts to /api/events (always) and calls window.posthog if available.
 */
export function logEvent(payload: EventPayload): void {
  if (typeof window === 'undefined') return

  const sessionId = getSessionId()
  const body = JSON.stringify({ ...payload, session_id: sessionId })

  // Track 1: internal events table
  fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    // fire-and-forget — silently ignore failures
  })

  // Track 2: PostHog (if wired up)
  const ph = (window as Window & { posthog?: { capture: (e: string, p?: object) => void } }).posthog
  if (ph?.capture) {
    ph.capture(payload.event_type, { ...payload, session_id: sessionId })
  }
}
