# Data Model — Vibe Index

## Supabase Table: `places`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | Primary key |
| `name` | `text` | Place name |
| `city` | `text` | e.g. London |
| `neighbourhood` | `text` | e.g. Shoreditch |
| `description` | `text` | Short copy, 1–3 sentences |
| `thumbnail_url` | `text` | Public image URL |
| `taste_tags` | `taste_tag[]` | Postgres enum array |
| `intent_tags` | `intent_tag[]` | Postgres enum array |
| `moment_tags` | `moment_tag[]` | Postgres enum array |
| `tiktok_url` | `text` | nullable |
| `google_maps_url` | `text` | nullable |
| `active` | `boolean` | false = hidden from app |

---

## Tag Enums

### `taste_tag` — the vibe/atmosphere
```
sexy · cozy · chic · loud · dim · kinetic
earthy · elegant · stylish · playful · intimate
```

### `intent_tag` — what you're doing
```
date · solo · group · chill · brunch
spa · manicure · dessert · late-night
```

### `moment_tag` — when / the occasion
```
before-dinner · rainy-day · late-night
sunday-morning · after-shopping
```

---

## Filtering Logic

Places are filtered using the Postgres array overlap operator (`&&`),
expressed in PostgREST as `.ov.{}`. Each tag is routed to its correct
enum column to avoid type errors:

```
taste_tags  ∩ selected_taste_tags  ≠ ∅
OR
intent_tags ∩ selected_intent_tags ≠ ∅
OR
moment_tags ∩ selected_moment_tags ≠ ∅
```

Multiple tags within the same category return places that match **any**
of those tags (OR, not AND).

---

## TypeScript Interface

```ts
interface Place {
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
```

Defined in `lib/types.ts`.
