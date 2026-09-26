-- Remove seeded blog content that was never created by the site owner.
DELETE FROM contents
WHERE id IN (
  'registry-blog-posts-v2',
  'registry-blog-posts',
  'registry-blog-categories-v2',
  'registry-blog-categories'
);
