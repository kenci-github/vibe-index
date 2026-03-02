-- =============================================================
-- restore.sql — Roll back the multi-city migration
-- WARNING: This drops countries and cities tables and removes
--          the city_id FK from places. Run in Supabase SQL Editor.
-- =============================================================

-- 1. Drop the view that joins places → cities → countries
DROP VIEW IF EXISTS places_with_location;

-- 2. Remove the city_id FK column from places
ALTER TABLE places DROP COLUMN IF EXISTS city_id;

-- 3. Drop cities and countries tables (in dependency order)
DROP TABLE IF EXISTS cities CASCADE;
DROP TABLE IF EXISTS countries CASCADE;
