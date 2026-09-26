-- Permanently remove seeded blog stories/categories that were never created by the site owner.
-- Existing future CMS-created blog content is not affected.
DELETE FROM contents
WHERE id IN (
  'registry-blog-posts-v2',
  'registry-blog-posts',
  'registry-blog-categories-v2',
  'registry-blog-categories'
);
