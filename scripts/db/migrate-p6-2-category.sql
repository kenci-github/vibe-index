-- P6.2 — Add category column to places + refresh places_with_location view
-- Run in Supabase SQL Editor

-- 1. Add category column
ALTER TABLE places
  ADD COLUMN IF NOT EXISTS category text;

-- 2. Add CHECK constraint for valid values
ALTER TABLE places
  DROP CONSTRAINT IF EXISTS places_category_check;
ALTER TABLE places
  ADD CONSTRAINT places_category_check
  CHECK (category IN (
    'food', 'drink', 'cafe', 'spa', 'wellness',
    'hair', 'nails', 'dental', 'fitness',
    'nightlife', 'shopping', 'experience'
  ));

-- 3. Index for filtering
CREATE INDEX IF NOT EXISTS places_category_idx ON places(category);

-- 4. Refresh places_with_location view to expose category
DROP VIEW IF EXISTS places_with_location;
CREATE VIEW places_with_location AS
  SELECT
    p.*,
    ci.name           AS city_name,
    ci.tagline        AS city_tagline,
    ci.hero_image_url AS city_hero_image_url,
    ci.active         AS city_active,
    co.name           AS country_name,
    co.code           AS country_code
  FROM places p
  JOIN cities    ci ON ci.id = p.city_id
  JOIN countries co ON co.id = ci.country_id;

-- 5. Seed categories for known places
UPDATE places SET category = 'food'      WHERE name IN ('Cafe Cecilia', 'Nopi', 'Le Coucou', 'Rosetta', 'Sexy Fish', 'Sketch', 'Ceresio 7', 'Bambi', 'Aprazível', 'Expendio de Maíz Sin Nombre');
UPDATE places SET category = 'drink'     WHERE name IN ('Swift Bar', 'Gimlet at Cavendish House', 'The Everleigh', 'Bemelmans Bar', 'Bar Basso', 'Bar High Five', 'Bar Urca', 'Bar Raval', 'Alobar Yorkville', 'Bar Tausend');
UPDATE places SET category = 'cafe'      WHERE name IN ('Attendant Coffee', 'Café de Flore', 'Café de l''Ambre');
UPDATE places SET category = 'nightlife' WHERE name IN ('Clärchens Ballhaus', 'Caveau de la Huchette');
UPDATE places SET category = 'spa'       WHERE name IN ('Aman Spa London');

-- 6. Verify — check all active places and their category assignments
SELECT
  name,
  category,
  city_name
FROM places_with_location
WHERE active = true
ORDER BY category NULLS LAST, city_name, name;
