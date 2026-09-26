-- Permanently remove destinations the site owner chose to delete.
-- Jammu & Kashmir remains the only valid destination.
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
    WHERE key = 'jammu-kashmir'
  )
),
updated_at = datetime('now')
WHERE id = 'registry-destinations';

-- Remove any legacy destination-registry rows that could contain deleted data.
DELETE FROM contents
WHERE content_type = 'shared_local_state'
  AND slug = 'hh_destinations_registry_v2'
  AND id <> 'registry-destinations';
