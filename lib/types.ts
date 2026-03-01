export interface Place {
  id: string
  name: string
  city: string
  neighbourhood: string
  description: string
  thumbnail_url: string
  taste_tags: string[]
  intent_tags: string[]
  moment_tags: string[]
  tiktok_url: string | null
  google_maps_url: string | null
  active: boolean
}
