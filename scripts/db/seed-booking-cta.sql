-- =============================================================
-- seed-booking-cta.sql
-- Non-destructive: adds booking_url + cta_type to existing places.
-- Run in Supabase SQL Editor.
-- Safe to re-run — uses WHERE name = '...' so only matching rows
-- are updated; all other columns remain untouched.
-- =============================================================

-- Step 1: Add columns if they don't already exist
ALTER TABLE places
  ADD COLUMN IF NOT EXISTS booking_url text,
  ADD COLUMN IF NOT EXISTS cta_type text
    CHECK (cta_type IN ('whatsapp','opentable','fresha','website','phone','instagram'));

-- =============================================================
-- Step 2: Update individual places by name
-- Replace the name values below with your actual place names.
-- The examples below show one of each cta_type.
-- =============================================================

-- OpenTable (restaurant reservation)
UPDATE places SET
  cta_type   = 'opentable',
  booking_url = 'https://www.opentable.com/r/your-restaurant-london'
WHERE name = 'Your Restaurant Name';

-- WhatsApp (phone number stored in booking_url, no spaces, with country code)
UPDATE places SET
  cta_type   = 'whatsapp',
  booking_url = '447911123456'
WHERE name = 'Your Cocktail Bar Name';

-- Fresha (beauty / spa / wellness)
UPDATE places SET
  cta_type   = 'fresha',
  booking_url = 'https://www.fresha.com/a/your-salon-london-address/booking'
WHERE name = 'Your Salon Name';

-- Website (generic external link)
UPDATE places SET
  cta_type   = 'website',
  booking_url = 'https://www.yourplace.com/reservations'
WHERE name = 'Your Café Name';

-- Phone (click-to-call, store full number with country code)
UPDATE places SET
  cta_type   = 'phone',
  booking_url = '+442071234567'
WHERE name = 'Your Rooftop Bar Name';

-- Instagram DM (store the handle without @)
UPDATE places SET
  cta_type   = 'instagram',
  booking_url = 'yourinstagramhandle'
WHERE name = 'Your Pop-Up Name';

-- =============================================================
-- Verify — check which places now have a CTA set
-- =============================================================
SELECT id, name, cta_type, booking_url
FROM places
WHERE cta_type IS NOT NULL
ORDER BY name;
