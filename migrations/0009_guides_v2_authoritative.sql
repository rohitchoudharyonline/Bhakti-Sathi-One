-- Remove legacy/default guide registries. Guides are now owned CMS content in V2.
DELETE FROM contents
WHERE id IN (
  'registry-guides-v1',
  'registry-guides',
  'registry-guide-categories'
);

INSERT OR IGNORE INTO contents
  (id, content_type, title, slug, structured_content, status, created_at, updated_at)
VALUES
  ('registry-guides-v2', 'shared_local_state', 'Guides Registry',
   'hh_guide_articles_v2', '{"storageKey":"hh_guide_articles_v2","value":"[]"}',
   'published', datetime('now'), datetime('now')),
  ('registry-deleted-guides', 'shared_local_state', 'Deleted Guide IDs',
   'hh_deleted_guide_ids', '{"storageKey":"hh_deleted_guide_ids","value":"[]"}',
   'published', datetime('now'), datetime('now')),
  ('registry-guide-categories-v2', 'shared_local_state', 'Guide Categories Registry',
   'hh_guide_categories_v2', '{"storageKey":"hh_guide_categories_v2","value":"[]"}',
   'published', datetime('now'), datetime('now')),
  ('registry-deleted-guide-categories', 'shared_local_state', 'Deleted Guide Category IDs',
   'hh_deleted_guide_category_ids', '{"storageKey":"hh_deleted_guide_category_ids","value":"[]"}',
   'published', datetime('now'), datetime('now'));
