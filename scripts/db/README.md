# Database Scripts

Run all scripts in the **Supabase SQL Editor** (Dashboard → SQL Editor → New Query).

## Files

### `migrate-backup.sql`
Re-applies the full multi-city migration to a clean/restored database.
Use this if you've rolled back and want to re-apply the schema.

**What it does:**
1. Creates `countries` table (id, name, code)
2. Creates `cities` table (id, name, country_id FK)
3. Seeds 10 countries and 10 cities
4. Adds `city_id` FK column to `places`
5. Populates `city_id` by matching the `city` text column to city names
6. Creates the `places_with_location` view (joins places → cities → countries)

### `restore.sql`
Rolls back the multi-city migration completely.

**What it does:**
1. Drops the `places_with_location` view
2. Removes the `city_id` column from `places`
3. Drops the `cities` and `countries` tables

> **Warning:** This is destructive. Take a backup before running.

## Notes

- The app queries `places_with_location` exclusively (never `places` directly).
- Row Level Security: ensure `places` has a public SELECT policy for the anon role.
- The `city` text column on `places` is kept for legacy compatibility; `city_id` is the FK used for filtering.
