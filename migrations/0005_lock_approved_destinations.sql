-- Permanently keep only the three approved Holidays Hunt destinations.
-- This changes destination registry data only. Tour content and SEO are untouched.

UPDATE contents
SET structured_content = json_set(
  structured_content,
  '$.value',
  (
    SELECT json_group_object(key, json(value))
    FROM json_each(
      CASE
        WHEN json_type(structured_content, '$.value') = 'text'
          THEN json_extract(structured_content, '$.value')
        ELSE json_extract(structured_content, '$.value')
      END
    )
    WHERE key IN ('jammu-kashmir', 'himachal', 'amritsar')
  )
),
updated_at = datetime('now')
WHERE id = 'registry-destinations';

-- Remove legacy duplicate destination-registry rows so an old copy cannot resurrect dummy destinations.
DELETE FROM contents
WHERE content_type = 'shared_local_state'
  AND slug = 'hh_destinations_registry_v2'
  AND id <> 'registry-destinations';
