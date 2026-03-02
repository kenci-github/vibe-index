# Setup — Vibe Index

## Prerequisites

- Node.js 18.17 or later ([nodejs.org](https://nodejs.org))
- A Supabase project with the `places` table (see [Data Model](data-model.md))

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
# .env.local is already present with Supabase credentials.
# Ensure NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY is set correctly.

# 3. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create `.env.local` at the project root (never commit this file):

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_...
```

Both values are found in your Supabase dashboard under **Settings → API**.

> The legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` is accepted as a fallback but
> the publishable key is preferred.

## Build & Deploy

```bash
npm run build    # production build
npm run start    # run production build locally
```

Deployment target is **Vercel**. Connect the GitHub repo and add the two
`NEXT_PUBLIC_*` env vars in the Vercel project settings.

## Supabase Row Level Security

The `places` table should have a public read policy so the anon key can
fetch rows without authentication:

```sql
CREATE POLICY "Public read access"
ON places FOR SELECT
TO anon
USING (active = true);
```
