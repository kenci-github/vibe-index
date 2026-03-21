-- P6.1 — Add girls-night and solo-reset to intent_tags on matching places
-- Run in Supabase SQL Editor
-- intent_tags is text[] — no enum constraint, just start using the new values

-- Add girls-night to places that have group + playful characteristics
UPDATE places
SET intent_tags = array_append(intent_tags, 'girls-night')
WHERE 'group' = ANY(intent_tags)
  AND 'playful' = ANY(taste_tags)
  AND 'girls-night' != ALL(intent_tags)
  AND active = true;

-- Add solo-reset to places that are solo + chill (the "recharge alone" vibe)
UPDATE places
SET intent_tags = array_append(intent_tags, 'solo-reset')
WHERE 'solo' = ANY(intent_tags)
  AND 'chill' = ANY(intent_tags)
  AND 'solo-reset' != ALL(intent_tags)
  AND active = true;

-- Verify
SELECT name, intent_tags
FROM places
WHERE 'girls-night' = ANY(intent_tags)
   OR 'solo-reset'  = ANY(intent_tags)
ORDER BY name;
