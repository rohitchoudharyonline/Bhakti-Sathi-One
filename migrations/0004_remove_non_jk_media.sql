-- Remove the unused non-Jammu & Kashmir media asset from the shared registry.
UPDATE contents
SET structured_content = json_set(
  structured_content,
  '$.value',
  (SELECT json_group_array(json(value))
   FROM json_each(json_extract(structured_content, '$.value'))
   WHERE lower(COALESCE(json_extract(value, '$.name'), '')) NOT LIKE '%manali%')
),
updated_at = datetime('now')
WHERE id = 'registry-media-assets-v2';
