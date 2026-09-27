-- Permanently clear the legacy/seeded blog registries that were repeatedly
-- resurrecting deleted Posts and Categories. New CMS-created records continue
-- to use the V2 registries protected by the Worker tombstone logic.

DELETE FROM contents
WHERE id IN (
  'registry-blog-posts-v2',
  'registry-blog-posts',
  'registry-blog-categories-v2',
  'registry-blog-categories'
);

INSERT OR IGNORE INTO contents
  (id, content_type, title, slug, structured_content, status, created_at, updated_at)
VALUES
  ('registry-deleted-blog-posts', 'shared_local_state', 'Deleted Blog Post IDs',
   'hh_deleted_blog_post_ids', '{"storageKey":"hh_deleted_blog_post_ids","value":"[]"}',
   'published', datetime('now'), datetime('now')),
  ('registry-deleted-blog-categories', 'shared_local_state', 'Deleted Blog Category IDs',
   'hh_deleted_blog_category_ids', '{"storageKey":"hh_deleted_blog_category_ids","value":"[]"}',
   'published', datetime('now'), datetime('now'));
