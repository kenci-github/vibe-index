export type Country = {
  id: string
  name: string
  code: string
}

export type City = {
  id: string
  name: string
  country_id: string
  country?: Country
}

export type TasteTag =
  | 'sexy'
  | 'cozy'
  | 'chic'
  | 'loud'
  | 'dim'
  | 'kinetic'
  | 'earthy'
  | 'elegant'
  | 'stylish'
  | 'playful'
  | 'intimate'

export type IntentTag =
  | 'date'
  | 'solo'
  | 'group'
  | 'chill'
  | 'brunch'
  | 'spa'
  | 'manicure'
  | 'dessert'
  | 'late-night'

export type MomentTag =
  | 'before-dinner'
  | 'rainy-day'
  | 'late-night'
  | 'sunday-morning'
  | 'after-shopping'

export type TagType = 'taste' | 'intent' | 'moment'

export type Place = {
  id: string
  name: string
  city: string
  city_id: string
  city_name: string
  country_name: string
  country_code: string
  neighbourhood: string | null
  description: string | null
  thumbnail_url: string | null
  taste_tags: TasteTag[]
  intent_tags: IntentTag[]
  moment_tags: MomentTag[]
  tiktok_url: string | null
  google_maps_url: string | null
  active: boolean
  created_at: string
}

export type ActiveFilters = {
  cityId: string | null
  tasteTags: TasteTag[]
  intentTags: IntentTag[]
  momentTags: MomentTag[]
}
