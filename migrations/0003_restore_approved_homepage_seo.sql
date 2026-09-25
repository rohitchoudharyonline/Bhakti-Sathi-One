-- Restore the homepage SEO that was previously approved for Holidays Hunt.
UPDATE contents
SET structured_content = json_set(
  structured_content,
  '$.value',
  json_set(
    json_extract(structured_content, '$.value'),
    '$.home.focusKeyword', 'tour packages',
    '$.home.metaTitle', 'Holidays Hunt | Family, Honeymoon & Pilgrimage Tour Packages',
    '$.home.metaDescription', 'Book family, honeymoon, pilgrimage & holiday tour packages from India with Holidays Hunt. Explore Kashmir, Himachal, Amritsar & Thailand.',
    '$.home.ogTitle', 'Holidays Hunt | Family, Honeymoon & Pilgrimage Tour Packages',
    '$.home.ogDescription', 'Book family, honeymoon, pilgrimage & holiday tour packages from India with Holidays Hunt. Explore Kashmir, Himachal, Amritsar & Thailand.'
  ),
  '$.updatedAt', datetime('now')
),
updated_at = datetime('now')
WHERE id = 'registry-page-seo';