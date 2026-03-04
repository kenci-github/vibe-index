export const TASTE_TAGS = [
  'sexy',
  'cozy',
  'chic',
  'loud',
  'dim',
  'kinetic',
  'earthy',
  'elegant',
  'stylish',
  'playful',
  'intimate',
] as const

export const INTENT_TAGS = [
  'date',
  'solo',
  'group',
  'chill',
  'brunch',
  'spa',
  'manicure',
  'dessert',
  'late-night',
] as const

export const MOMENT_TAGS = [
  'before-dinner',
  'rainy-day',
  'late-night',
  'sunday-morning',
  'after-shopping',
] as const

export const ALL_TAGS = [...TASTE_TAGS, ...INTENT_TAGS, ...MOMENT_TAGS]

export const TAG_GROUPS = [
  { label: 'Vibe', tags: TASTE_TAGS },
  { label: 'Intent', tags: INTENT_TAGS },
  { label: 'Moment', tags: MOMENT_TAGS },
] as const
