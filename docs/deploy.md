# Deployment — Vibe Index

## Platform: Vercel

### 1. Push to GitHub

Ensure all changes are committed and pushed to `main`.

### 2. Create Vercel Project

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repository
3. Framework preset: **Next.js** (auto-detected)
4. Root directory: `/` (default)
5. Build command: `npm run build` (default)
6. Output directory: `.next` (default)

### 3. Environment Variables

In **Vercel → Project → Settings → Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | `sb_publishable_...` |
| `NEXT_PUBLIC_BASE_URL` | `https://your-domain.vercel.app` (or custom domain) |

> `NEXT_PUBLIC_BASE_URL` is used for Open Graph / social meta tags. Set it to your production URL.

### 4. Deploy

Click **Deploy**. The build runs `npm run build`. First deploy takes ~2 min.

### 5. Custom Domain (optional)

Vercel → Project → Settings → Domains → Add domain.
Update `NEXT_PUBLIC_BASE_URL` to match your custom domain.

---

## Supabase Production Checklist

Before going live, verify in your Supabase dashboard:

### Row Level Security
```sql
-- places table must have a public read policy
CREATE POLICY "Public read access"
ON places FOR SELECT
TO anon
USING (active = true);
```

### View permissions
The `places_with_location` view should inherit the RLS of the underlying `places` table.
If you use security-definer views, ensure the anon role can still SELECT:
```sql
GRANT SELECT ON places_with_location TO anon;
GRANT SELECT ON cities TO anon;
GRANT SELECT ON countries TO anon;
```

### API settings
- Dashboard → Settings → API
- Confirm the publishable key (starts with `sb_publishable_`) is what you're using in env vars
- Do **not** expose the service role key in any `NEXT_PUBLIC_` variable

---

## Post-Deploy Testing

Check these manually after each deploy:

- [ ] Home page loads, places appear
- [ ] City selector opens (bottom sheet on mobile, select on desktop)
- [ ] Selecting a city filters places correctly
- [ ] Tag filter pills work, Clear resets tags
- [ ] PlaceCard shows correct city + flag
- [ ] Place detail page loads, full location string visible
- [ ] Bookmark button saves/unsaves (persists on reload)
- [ ] Saved page shows bookmarked places
- [ ] Share button copies link / opens native share on mobile
- [ ] PWA install prompt appears on mobile after 2nd visit (Chrome)
- [ ] Offline: previously visited pages load from cache
- [ ] No console errors

---

## Environment Summary

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Yes | Supabase publishable (not anon/service) key |
| `NEXT_PUBLIC_BASE_URL` | Recommended | Production base URL for OG tags |
