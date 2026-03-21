import type { PlaceCategory } from '@/types'

export const CATEGORIES: { value: PlaceCategory; label: string; emoji: string }[] = [
  { value: 'food',       label: 'Food',        emoji: '🍽️' },
  { value: 'drink',      label: 'Drinks',       emoji: '🍸' },
  { value: 'cafe',       label: 'Café',         emoji: '☕' },
  { value: 'spa',        label: 'Spa',          emoji: '🧖' },
  { value: 'wellness',   label: 'Wellness',     emoji: '🌿' },
  { value: 'hair',       label: 'Hair',         emoji: '✂️' },
  { value: 'nails',      label: 'Nails',        emoji: '💅' },
  { value: 'dental',     label: 'Dental',       emoji: '🦷' },
  { value: 'fitness',    label: 'Fitness',      emoji: '💪' },
  { value: 'nightlife',  label: 'Nightlife',    emoji: '🌙' },
  { value: 'shopping',   label: 'Shopping',     emoji: '🛍️' },
  { value: 'experience', label: 'Experience',   emoji: '✨' },
]

export const ALL_CATEGORIES = 'all' as const
