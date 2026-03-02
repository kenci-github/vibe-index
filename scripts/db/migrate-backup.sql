-- =============================================================
-- migrate-backup.sql — Re-apply migration to a restored backup
-- Run AFTER restore.sql has been executed and the original
-- places rows have been re-inserted from a backup dump.
-- =============================================================

-- 1. Recreate countries
CREATE TABLE IF NOT EXISTS countries (
  id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code char(2) NOT NULL UNIQUE
);

-- 2. Recreate cities
CREATE TABLE IF NOT EXISTS cities (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  country_id uuid NOT NULL REFERENCES countries(id)
);

-- 3. Seed the countries used in the app
INSERT INTO countries (name, code) VALUES
  ('United Kingdom', 'GB'),
  ('United States',  'US'),
  ('Japan',          'JP'),
  ('Mexico',         'MX'),
  ('France',         'FR'),
  ('Germany',        'DE'),
  ('Italy',          'IT'),
  ('Canada',         'CA'),
  ('Australia',      'AU'),
  ('Brazil',         'BR')
ON CONFLICT (code) DO NOTHING;

-- 4. Seed the cities
INSERT INTO cities (name, country_id)
SELECT c.name, co.id FROM (VALUES
  ('London',       'GB'),
  ('New York City','US'),
  ('Tokyo',        'JP'),
  ('Mexico City',  'MX'),
  ('Paris',        'FR'),
  ('Berlin',       'DE'),
  ('Milan',        'IT'),
  ('Toronto',      'CA'),
  ('Melbourne',    'AU'),
  ('Rio de Janeiro','BR')
) AS c(name, code)
JOIN countries co ON co.code = c.code
ON CONFLICT DO NOTHING;

-- 5. Add city_id FK to places
ALTER TABLE places ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES cities(id);

-- 6. Populate city_id from the existing city text column
UPDATE places p
SET city_id = c.id
FROM cities c
WHERE lower(p.city) = lower(c.name);

-- 7. Recreate the places_with_location view
CREATE OR REPLACE VIEW places_with_location AS
SELECT
  p.*,
  ci.name  AS city_name,
  co.name  AS country_name,
  co.code  AS country_code
FROM places p
LEFT JOIN cities    ci ON ci.id = p.city_id
LEFT JOIN countries co ON co.id = ci.country_id;
