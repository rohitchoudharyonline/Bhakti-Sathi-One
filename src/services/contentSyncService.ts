/**
 * Cross-Browser Content Synchronization Service
 * 
 * Ensures D1/server content is the authoritative source of truth when online,
 * loads server content before public/CMS rendering, prevents stale localStorage
 * from overwriting server data, and provides reliable multi-browser consistency.
 */

import { saveAllMediaAssetsToDb } from '../utils/mediaStorage';
import { DestinationMeta } from '../data/destinationsData';

export interface SyncedRegistryDef {
  id: string;
  storageKey: string;
  title: string;
  contentType: string;
}

export const SYNCED_REGISTRIES: SyncedRegistryDef[] = [
  { id: 'registry-packages', storageKey: 'hh_tour_packages_v2', title: 'Tour Packages Registry', contentType: 'shared_local_state' },
  { id: 'registry-deleted-packages', storageKey: 'hh_deleted_package_ids', title: 'Deleted Package IDs', contentType: 'shared_local_state' },
  { id: 'registry-destinations', storageKey: 'hh_destinations_registry_v2', title: 'Destinations Registry', contentType: 'shared_local_state' },
  { id: 'registry-temples', storageKey: 'hh_temples_places_v1', title: 'Temples and Sacred Places', contentType: 'shared_local_state' },
  { id: 'registry-blog-posts-v2', storageKey: 'hh_blog_posts_v2', title: 'Blog Posts Registry', contentType: 'shared_local_state' },
  { id: 'registry-deleted-blog-posts', storageKey: 'hh_deleted_blog_post_ids', title: 'Deleted Blog Post IDs', contentType: 'shared_local_state' },
  { id: 'registry-deleted-blog-categories', storageKey: 'hh_deleted_blog_category_ids', title: 'Deleted Blog Category IDs', contentType: 'shared_local_state' },
  { id: 'registry-blog-posts', storageKey: 'hh_blog_posts_v1', title: 'Legacy Blog Posts Registry', contentType: 'shared_local_state' },
  { id: 'registry-blog-categories-v2', storageKey: 'hh_blog_categories_v2', title: 'Blog Categories Registry', contentType: 'shared_local_state' },
  { id: 'registry-blog-categories', storageKey: 'hh_blog_categories_v1', title: 'Legacy Blog Categories Registry', contentType: 'shared_local_state' },
  { id: 'registry-guides-v1', storageKey: 'hh_guide_articles_v1', title: 'Pilgrimage Guides Registry', contentType: 'shared_local_state' },
  { id: 'registry-guides', storageKey: 'hh_guides_v1', title: 'Legacy Guides Registry', contentType: 'shared_local_state' },
  { id: 'registry-guide-categories', storageKey: 'hh_guide_categories_v1', title: 'Guide Categories Registry', contentType: 'shared_local_state' },
  { id: 'registry-custom-pages-v2', storageKey: 'hh_custom_pages_v2', title: 'Custom Pages Registry', contentType: 'shared_local_state' },
  { id: 'registry-custom-pages', storageKey: 'hh_custom_pages_v1', title: 'Legacy Custom Pages Registry', contentType: 'shared_local_state' },
  { id: 'registry-page-seo', storageKey: 'hh_page_seo_configs_v1', title: 'Page SEO Configs Registry', contentType: 'shared_local_state' },
  { id: 'registry-media-assets-v2', storageKey: 'hh_media_assets_v2', title: 'Media Assets Registry', contentType: 'shared_local_state' },
  { id: 'registry-media-assets', storageKey: 'hh_media_assets_v1', title: 'Legacy Media Assets Registry', contentType: 'shared_local_state' },
  { id: 'registry-inquiries-v2', storageKey: 'hh_booking_inquiries_v2', title: 'Booking Inquiries & Newsletter Registry', contentType: 'shared_local_state' },
  { id: 'registry-settings-v2', storageKey: 'hh_agency_settings_v2', title: 'Agency Settings Registry', contentType: 'shared_local_state' },
  { id: 'registry-settings', storageKey: 'hh_system_settings_v1', title: 'Legacy Agency Settings Registry', contentType: 'shared_local_state' },
];

const REGISTRY_BY_KEY = new Map<string, SyncedRegistryDef>(
  SYNCED_REGISTRIES.map((r) => [r.storageKey, r])
);
const APPROVED_DESTINATION_SLUGS = new Set(['jammu-kashmir']);

function normalizeDestinationRegistry(value: unknown): Record<string, any> {
  let parsed: any = value;
  if (typeof parsed === 'string') {
    try { parsed = JSON.parse(parsed); } catch { return {}; }
  }
  if (Array.isArray(parsed)) {
    const map: Record<string, any> = {};
    for (const destination of parsed) {
      const slug = String(destination?.slug || destination?.id || '').toLowerCase().trim();
      if (slug && destination && typeof destination === 'object') map[slug] = destination;
    }
    return map;
  }
  if (parsed && typeof parsed === 'object') return parsed as Record<string, any>;
  return {};
}

function cleanApprovedDestinations(value: unknown): Record<string, any> {
  const map = normalizeDestinationRegistry(value);
  const cleaned: Record<string, any> = {};
  for (const [slug, destination] of Object.entries(map)) {
    if (APPROVED_DESTINATION_SLUGS.has(String(slug).toLowerCase()) && destination) cleaned[slug] = destination;
  }
  return cleaned;
}

const DISALLOWED_DUMMY_PACKAGE_IDS = new Set([
  'pkg-kashmir-01', 'pkg-kashmir-02', 'pkg-kashmir-03', 'pkg-kashmir-04',
  'pkg-jammu-01', 'pkg-jammu-02', 'pkg-ladakh-01',
]);

// These are the three real Holidays Hunt tours. They must never be hidden
// by an old browser/server deletion tombstone after the approved restore.
const PROTECTED_REAL_TOUR_IDS = new Set([
  'pkg-1789721050903',
  'pkg-1789720939137',
  'pkg-1789411062209',
]);
const PROTECTED_REAL_TOUR_SLUGS = new Set([
  'kashmir-pilgrimage-tour-package',
  '6-days-kashmir-honeymoon-package-srinagar-gulmarg-pahalgam',
  'kashmir-tour-package-5-nights-6-days',
]);

// These were seeded into the CMS but were never created by the site owner.
// They are permanently filtered from every server/browser hydration.
const PURGED_BLOG_POST_IDS = new Set([
  'post-kashmir-best-time',
  'post-vaishno-devi-helicopter-guide',
]);
const PURGED_BLOG_CATEGORY_IDS = new Set([
  'cat-kashmir',
  'cat-tips-rates',
  'cat-spiritual',
]);

const REGISTRY_BY_ID = new Map<string, SyncedRegistryDef>(
  SYNCED_REGISTRIES.map((r) => [r.id, r])
);

export const SHARED_STORAGE_KEYS = new Set<string>(
  SYNCED_REGISTRIES.map((r) => r.storageKey)
);

interface ServerContentRow {
  id: string;
  content_type?: string;
  title?: string;
  slug?: string;
  status?: string;
  structured_content?: unknown;
  updated_at?: string;
  created_at?: string;
}

interface DecodedRegistryItem {
  id: string;
  storageKey: string;
  value: string;
  updatedAt?: string;
}

// In-memory locks and synchronization status tracking
let isHydrating = false;
let isInitialized = false;
const inFlightPushes = new Map<string, Promise<boolean>>();
const pendingSyncQueue = new Map<string, { value: string; options: { allowMediaDeletion?: boolean; allowTourDeletion?: boolean } }>();
const lastSyncedTimestamps = new Map<string, number>();

/**
 * Extracts rows from different possible backend envelope formats:
 * { data: [...] }, { contents: [...] }, { results: [...] }, or direct array [...].
 */
function extractRowsFromPayload(payload: unknown): ServerContentRow[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as ServerContentRow[];
  if (typeof payload === 'object' && payload !== null) {
    const p = payload as Record<string, unknown>;
    if (Array.isArray(p.data)) return p.data as ServerContentRow[];
    if (Array.isArray(p.contents)) return p.contents as ServerContentRow[];
    if (Array.isArray(p.results)) return p.results as ServerContentRow[];
  }
  return [];
}

/**
 * Safely parses structured_content whether returned as an object, JSON string, or null.
 */
function decodeServerRow(row: ServerContentRow): DecodedRegistryItem | null {
  if (!row || typeof row !== 'object') return null;

  let structured: unknown = row.structured_content;
  if (typeof structured === 'string') {
    try {
      structured = JSON.parse(structured);
    } catch {
      structured = null;
    }
  }

  if (structured && typeof structured === 'object') {
    const s = structured as Record<string, unknown>;
    const storageKey = typeof s.storageKey === 'string' ? s.storageKey : undefined;
    let value = s.value;

    if (storageKey && SHARED_STORAGE_KEYS.has(storageKey)) {
      const strValue = typeof value === 'string' ? value : JSON.stringify(value ?? '');
      return {
        id: row.id,
        storageKey,
        value: strValue,
        updatedAt: row.updated_at,
      };
    }
  }

  // Fallback: match by row.id or row.slug if mapped to a registry
  const reg = REGISTRY_BY_ID.get(row.id) || (row.slug ? REGISTRY_BY_KEY.get(row.slug) : undefined);
  if (reg && structured && typeof structured === 'object') {
    const val = typeof (structured as any).value === 'string'
      ? (structured as any).value
      : JSON.stringify(structured);
    return {
      id: reg.id,
      storageKey: reg.storageKey,
      value: val,
      updatedAt: row.updated_at,
    };
  }

  return null;
}

/**
 * Loads all authoritative content from D1 before app renders.
 * Applies server data to localStorage and marks timestamps.
 */

/**
 * Removes browser-local copies of shared registries before server hydration.
 * The server database is the only source of truth for shared public/CMS content.
 */
export function clearSharedRegistryCache() {
  const wasHydrating = isHydrating;
  isHydrating = true;
  try {
    // Keep the three approved real tours available during a transient server
    // failure. The authoritative D1 copy will replace this cache when it loads.
    let preservedPackages: string | null = null;
    try {
      const raw = window.localStorage.getItem('hh_tour_packages_v2');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const approved = parsed.filter((pkg: any) => {
            const id = String(pkg?.id || '');
            const slug = String(pkg?.slug || '').trim().toLowerCase();
            return !DISALLOWED_DUMMY_PACKAGE_IDS.has(id);
          });
          if (approved.length > 0) preservedPackages = JSON.stringify(approved);
        }
      }
    } catch {}

    for (const reg of SYNCED_REGISTRIES) {
      try {
        // Keep deletion tombstones until the server copy has been merged.
        if (reg.storageKey !== 'hh_deleted_blog_post_ids' && reg.storageKey !== 'hh_deleted_blog_category_ids') {
          window.localStorage.removeItem(reg.storageKey);
          window.localStorage.removeItem(`_sync_time_${reg.storageKey}`);
        }
      } catch {}
    }
    // Explicitly clear legacy/current blog registries so an old browser cannot
    // resurrect the removed seeded records.
    for (const key of ['hh_blog_posts_v2', 'hh_blog_posts_v1', 'hh_blog_categories_v2', 'hh_blog_categories_v1']) {
      try { window.localStorage.removeItem(key); } catch {}
    }

    if (preservedPackages) {
      window.localStorage.setItem('hh_tour_packages_v2', preservedPackages);
    }
  } finally {
    isHydrating = wasHydrating;
  }
}

export async function loadAuthoritativeServerContent(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    // Preserve any existing local media metadata so uploads made before server
    // persistence was enabled can be migrated into the authoritative registry.
    let localMediaForMigration: string | null = null;
    try {
      const rawMedia = window.localStorage.getItem('hh_media_assets_v2');
      if (rawMedia) {
        const parsedMedia = JSON.parse(rawMedia);
        if (Array.isArray(parsedMedia) && parsedMedia.length > 0) {
          // dataUrl is only a browser preview and can be very large; R2 URL/path
          // is the durable asset reference that should be shared through D1.
          localMediaForMigration = JSON.stringify(
            parsedMedia.map(({ dataUrl, ...asset }: any) => asset)
          );
        }
      }
    } catch {}

    // Purge stale browser copies first so legacy/dummy content cannot flash or be pushed back.
    clearSharedRegistryCache();

    const response = await fetch('/api/contents?type=shared_local_state&_nocache=' + Date.now(), {
      credentials: 'include',
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

    if (!response.ok) {
      console.warn(`[ContentSync] Server returned status ${response.status}. Using local cache fallback.`);
      return false;
    }

    const payload = await response.json().catch(() => null);
    const rows = extractRowsFromPayload(payload);

    if (rows.length === 0) {
      // Never repopulate the shared database from browser-local data.
      // An empty/failed server registry must not resurrect stale or legacy content.
      return false;
    }

    const serverItemsByKey = new Map<string, DecodedRegistryItem>();
    for (const row of rows) {
      const decoded = decodeServerRow(row);
      if (!decoded) continue;

      // A legacy migration or older deployment can leave duplicate D1 rows
      // for the same shared registry key. Always prefer the newest server
      // version so an older tour registry cannot replace the current one.
      const existing = serverItemsByKey.get(decoded.storageKey);
      if (!existing) {
        serverItemsByKey.set(decoded.storageKey, decoded);
        continue;
      }

      // The registry's canonical ID is authoritative when legacy duplicate
      // rows exist. A newer random/legacy row must not replace it.
      const canonicalId = REGISTRY_BY_KEY.get(decoded.storageKey)?.id;
      const existingIsCanonical = existing.id === canonicalId;
      const decodedIsCanonical = decoded.id === canonicalId;

      if (decodedIsCanonical && !existingIsCanonical) {
        serverItemsByKey.set(decoded.storageKey, decoded);
        continue;
      }
      if (existingIsCanonical && !decodedIsCanonical) {
        continue;
      }

      const existingTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
      const decodedTime = decoded.updatedAt ? new Date(decoded.updatedAt).getTime() : 0;
      if (decodedTime >= existingTime) {
        serverItemsByKey.set(decoded.storageKey, decoded);
      }
    }

    // If the media registry does not exist yet, migrate the existing browser
    // library once. This preserves uploads already present in R2 while making
    // their metadata survive logout/login and work across browsers.
    let mediaRegistryMigrated = false;
    if (!serverItemsByKey.has('hh_media_assets_v2') && localMediaForMigration) {
      serverItemsByKey.set('hh_media_assets_v2', {
        id: 'registry-media-assets-v2',
        storageKey: 'hh_media_assets_v2',
        value: localMediaForMigration,
        updatedAt: new Date().toISOString(),
      });
      mediaRegistryMigrated = true;
    }

    const destinationItem = serverItemsByKey.get('hh_destinations_registry_v2');
    if (destinationItem) {
      try {
        destinationItem.value = JSON.stringify(cleanApprovedDestinations(destinationItem.value));
      } catch {}
    }

    // Permanently remove only the uncreated seeded blog records. Future CMS-created
    // posts/categories remain supported.
    for (const [registryKey, purgedIds] of [
      ['hh_blog_posts_v2', PURGED_BLOG_POST_IDS],
      ['hh_blog_categories_v2', PURGED_BLOG_CATEGORY_IDS],
    ] as const) {
      const item = serverItemsByKey.get(registryKey);
      if (!item) continue;
      try {
        const parsed = JSON.parse(item.value);
        if (Array.isArray(parsed)) {
          item.value = JSON.stringify(parsed.filter((entry: any) => !purgedIds.has(String(entry?.id || ''))));
        }
      } catch {}
    }

    const packageItem = serverItemsByKey.get('hh_tour_packages_v2');
    if (packageItem) {
      try {
        const parsed = JSON.parse(packageItem.value);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((pkg: any) => {
        const id = String(pkg?.id || '');
        const slug = String(pkg?.slug || '');
        return !DISALLOWED_DUMMY_PACKAGE_IDS.has(id);
      });
          packageItem.value = JSON.stringify(cleaned);
        }
      } catch {}
    }

    // Never allow stale deletion tombstones to hide the three real tours.
    const deletedPackageItem = serverItemsByKey.get('hh_deleted_package_ids');
    if (deletedPackageItem) {
      try {
        const parsed = JSON.parse(deletedPackageItem.value);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((id: any) => {
            const key = String(id ?? '').trim().toLowerCase();
            return !PROTECTED_REAL_TOUR_IDS.has(key) && !PROTECTED_REAL_TOUR_SLUGS.has(key);
          });
          deletedPackageItem.value = JSON.stringify(cleaned);
        }
      } catch {}
    }

    // Merge blog deletion tombstones from localStorage with the server copy.
    // These IDs are persisted in D1 so relogin/cache clear cannot resurrect deleted content.
    for (const tombstoneKey of ['hh_deleted_blog_post_ids', 'hh_deleted_blog_category_ids']) {
      try {
        const localRaw = window.localStorage.getItem(tombstoneKey);
        const serverItem = serverItemsByKey.get(tombstoneKey);
        const serverRaw = serverItem?.value;
        const localIds = localRaw ? JSON.parse(localRaw) : [];
        const serverIds = serverRaw ? JSON.parse(serverRaw) : [];
        const merged = Array.from(new Set([
          ...(Array.isArray(serverIds) ? serverIds : []),
          ...(Array.isArray(localIds) ? localIds : []),
        ].map(String)));
        if (merged.length > 0 || serverItem) {
          const item = serverItem || {
            id: tombstoneKey === 'hh_deleted_blog_post_ids' ? 'registry-deleted-blog-posts' : 'registry-deleted-blog-categories',
            storageKey: tombstoneKey,
            value: '[]',
            updatedAt: undefined,
          };
          item.value = JSON.stringify(merged);
          serverItemsByKey.set(tombstoneKey, item);
        }
      } catch {}
    }

    // Remove deleted posts/categories from the authoritative registries before hydration.
    for (const [registryKey, tombstoneKey, field] of [
      ['hh_blog_posts_v2', 'hh_deleted_blog_post_ids', 'id'],
      ['hh_blog_categories_v2', 'hh_deleted_blog_category_ids', 'id'],
    ] as const) {
      const registryItem = serverItemsByKey.get(registryKey);
      const tombstoneItem = serverItemsByKey.get(tombstoneKey);
      if (!registryItem || !tombstoneItem) continue;
      try {
        const deletedIds = new Set(JSON.parse(tombstoneItem.value).map(String));
        const parsed = JSON.parse(registryItem.value);
        if (Array.isArray(parsed)) {
          registryItem.value = JSON.stringify(parsed.filter((item: any) => !deletedIds.has(String(item?.[field] || ''))));
        }
      } catch {}
    }

    isHydrating = true;
    try {
      for (const [key, item] of serverItemsByKey) {
        try {
          // Server is authoritative source of truth: write server confirmed data
          window.localStorage.setItem(key, item.value);
          const timestamp = item.updatedAt ? new Date(item.updatedAt).getTime() : Date.now();
          lastSyncedTimestamps.set(key, timestamp);
          window.localStorage.setItem(`_sync_time_${key}`, String(timestamp));

          // Also populate IndexedDB media storage if media assets are hydrated
          if (key === 'hh_media_assets_v2' || key === 'hh_media_assets_v1') {
            try {
              const parsedAssets = JSON.parse(item.value);
              if (Array.isArray(parsedAssets)) {
                void saveAllMediaAssetsToDb(parsedAssets);
              }
            } catch {}
          }
        } catch (e) {
          console.error(`[ContentSync] Error writing server state for ${key}:`, e);
        }
      }
    } finally {
      isHydrating = false;
    }

    if (mediaRegistryMigrated) {
      void syncRegistryToServer(
        'hh_media_assets_v2',
        serverItemsByKey.get('hh_media_assets_v2')!.value
      );
    }

    for (const blogKey of ['hh_blog_posts_v2', 'hh_blog_categories_v2'] as const) {
      const blogItem = serverItemsByKey.get(blogKey);
      if (blogItem) void syncRegistryToServer(blogKey, blogItem.value);
    }

    // Persist any local deletion tombstones that were merged into the authoritative
    // state during this load, including tombstones created before this fix deployed.
    for (const tombstoneKey of ['hh_deleted_blog_post_ids', 'hh_deleted_blog_category_ids']) {
      try {
        const value = window.localStorage.getItem(tombstoneKey);
        if (value) void syncRegistryToServer(tombstoneKey, value);
      } catch {}
    }

    // Broadcast synchronization to all in-memory React contexts
    try {
      window.dispatchEvent(
        new CustomEvent('holidayshunt_content_synced', {
          detail: { keys: Array.from(serverItemsByKey.keys()) },
        })
      );
    } catch {}



    return true;
  } catch (err) {
    console.warn('[ContentSync] Offline or network error while loading server content:', err);
    return false;
  } finally {
    isInitialized = true;
  }
}

/**
 * Pushes a single registry's value to D1 server.
 * Uses PUT for existing records, falling back to POST if not yet created.
 */
export async function syncRegistryToServer(
  key: string,
  value: string,
  options: { allowMediaDeletion?: boolean; allowTourDeletion?: boolean } = {}
): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!SHARED_STORAGE_KEYS.has(key)) return false;
  if (isHydrating) return false;

  const registry = REGISTRY_BY_KEY.get(key);
  if (!registry) return false;

  // Never write the known legacy dummy tour records back to D1.
  if (key === 'hh_tour_packages_v2') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        // A completely empty browser registry is never a valid automatic sync.
        // Explicit CMS deletion is handled separately with allowTourDeletion.
        if (parsed.length === 0 && !options.allowTourDeletion) return false;
        const cleaned = parsed.filter((pkg: any) => {
          const id = String(pkg?.id || '');
          const slug = String(pkg?.slug || '');
          return !DISALLOWED_DUMMY_PACKAGE_IDS.has(id);
        });
        if (cleaned.length === 0) return false;
        value = JSON.stringify(cleaned);
      }
    } catch {}
  }

  if (key === 'hh_media_assets_v2') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        // D1 stores metadata/reference text only. Image bytes and browser
        // preview data stay in R2/IndexedDB and are never written to D1.
        value = JSON.stringify(parsed.map(({ dataUrl, ...asset }: any) => asset));
      }
    } catch {}
  }

  if (key === 'hh_destinations_registry_v2') {
    try {
      value = JSON.stringify(cleanApprovedDestinations(value));
    } catch {}
  }

  // If a push for this key is already running, queue it
  if (inFlightPushes.has(key)) {
    pendingSyncQueue.set(key, { value, options });
    return inFlightPushes.get(key)!;
  }

  const pushPromise = (async () => {
    try {
      const payload = {
        id: registry.id,
        content_type: 'shared_local_state',
        title: registry.title,
        slug: registry.storageKey,
        status: 'published',
        structured_content: {
          storageKey: key,
          value,
          updatedAt: new Date().toISOString(),
          ...(key === 'hh_media_assets_v2' && options.allowMediaDeletion ? { allowMediaDeletion: true } : {}),
          ...(key === 'hh_tour_packages_v2' && options.allowTourDeletion ? { allowTourDeletion: true } : {}),
        },
      };

      const syncHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('bs_cms_session_token') : null;
      if (token) {
        syncHeaders['Authorization'] = `Bearer ${token}`;
        syncHeaders['X-CMS-Token'] = token;
      }

      // 1. Try PUT first (deterministic record update)
      const putRes = await fetch(`/api/contents/${encodeURIComponent(registry.id)}`, {
        method: 'PUT',
        credentials: 'include',
        cache: 'no-store',
        headers: syncHeaders,
        body: JSON.stringify(payload),
      }).catch(() => null);

      if (putRes && putRes.ok) {
        const now = Date.now();
        lastSyncedTimestamps.set(key, now);
        window.localStorage.setItem(`_sync_time_${key}`, String(now));
        return true;
      }

      // 2. If PUT returned 404 or record not found, create via POST
      if (!putRes || putRes.status === 404) {
        const postRes = await fetch('/api/contents', {
          method: 'POST',
          credentials: 'include',
          cache: 'no-store',
          headers: syncHeaders,
          body: JSON.stringify(payload),
        }).catch(() => null);

        if (postRes && postRes.ok) {
          const now = Date.now();
          lastSyncedTimestamps.set(key, now);
          window.localStorage.setItem(`_sync_time_${key}`, String(now));
          return true;
        }
      }

      // If unauthenticated or offline, do not overwrite or crash
      return false;
    } catch (err) {
      console.warn(`[ContentSync] Could not push ${key} to server:`, err);
      return false;
    } finally {
      inFlightPushes.delete(key);

      // Process any pending sync that occurred while in flight
      const pending = pendingSyncQueue.get(key);
      if (pending !== undefined) {
        pendingSyncQueue.delete(key);
        void syncRegistryToServer(key, pending.value, pending.options);
      }
    }
  })();

  inFlightPushes.set(key, pushPromise);
  return pushPromise;
}

/**
 * Fetches all authoritative destinations directly from the server database.
 */
export async function fetchDestinationsFromServer(): Promise<Record<string, DestinationMeta> | null> {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch('/api/destinations?_t=' + Date.now(), {
      credentials: 'include',
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    if (!res.ok) return null;
    const json = await res.json().catch(() => null);
    if (json && json.success) {
      const map = cleanApprovedDestinations(json.data) as Record<string, DestinationMeta>;
      if (Object.keys(map).length > 0) return map;
    }
  } catch (err) {
    console.warn('[ContentSync] fetchDestinationsFromServer error:', err);
  }
  return null;
}

/**
 * Saves or updates a destination directly in the server database.
 */
export async function saveDestinationToServer(destination: DestinationMeta): Promise<boolean> {
  if (typeof window === 'undefined' || !destination || !destination.slug) return false;
  try {
    // Unmark as deleted locally
    try {
      const savedDeleted = window.localStorage.getItem('hh_deleted_destination_slugs');
      if (savedDeleted) {
        const arr = JSON.parse(savedDeleted);
        if (Array.isArray(arr)) {
          window.localStorage.setItem('hh_deleted_destination_slugs', JSON.stringify(arr.filter((s) => s !== destination.slug)));
        }
      }
    } catch {}

    const syncHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    const token = window.localStorage.getItem('bs_cms_session_token');
    if (token) {
      syncHeaders['Authorization'] = `Bearer ${token}`;
      syncHeaders['X-CMS-Token'] = token;
    }

    const res = await fetch(`/api/destinations/${encodeURIComponent(destination.slug)}`, {
      method: 'PUT',
      credentials: 'include',
      cache: 'no-store',
      headers: syncHeaders,
      body: JSON.stringify(destination),
    });

    // Update local registry caches
    const updateLocalMap = (storageKey: string) => {
      try {
        const raw = window.localStorage.getItem(storageKey);
        let map: Record<string, any> = {};
        if (raw) {
          try { map = JSON.parse(raw); } catch {}
        }
        map[destination.slug] = destination;
        window.localStorage.setItem(storageKey, JSON.stringify(map));
      } catch {}
    };

    updateLocalMap('hh_destinations_registry_v2');
    updateLocalMap('hh_destinations_registry_v1');

    return res.ok;
  } catch (e) {
    console.warn('[ContentSync] saveDestinationToServer failed:', e);
    return false;
  }
}

/**
 * Deletes a destination from the server database.
 */
export async function deleteDestinationFromServer(slug: string): Promise<boolean> {
  if (typeof window === 'undefined' || !slug) return false;
  try {
    // 1. Mark as deleted in local tombstone tracking
    try {
      const savedDeleted = window.localStorage.getItem('hh_deleted_destination_slugs');
      const arr: string[] = savedDeleted ? JSON.parse(savedDeleted) : [];
      if (!arr.includes(slug)) {
        arr.push(slug);
        window.localStorage.setItem('hh_deleted_destination_slugs', JSON.stringify(arr));
      }
    } catch {}

    // 2. Remove from local caches
    const removeFromMap = (storageKey: string) => {
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (raw) {
          const map = JSON.parse(raw);
          if (map && typeof map === 'object') {
            delete map[slug];
            window.localStorage.setItem(storageKey, JSON.stringify(map));
          }
        }
      } catch {}
    };

    removeFromMap('hh_destinations_registry_v2');
    removeFromMap('hh_destinations_registry_v1');

    const syncHeaders: Record<string, string> = {};
    const token = window.localStorage.getItem('bs_cms_session_token');
    if (token) {
      syncHeaders['Authorization'] = `Bearer ${token}`;
      syncHeaders['X-CMS-Token'] = token;
    }
    const res = await fetch(`/api/destinations/${encodeURIComponent(slug)}`, {
      method: 'DELETE',
      credentials: 'include',
      cache: 'no-store',
      headers: syncHeaders,
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Deletes a record from D1 when deleted in the CMS.
 */
export async function deleteRecordFromServer(id: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const deleteHeaders: Record<string, string> = {};
    const token = window.localStorage.getItem('bs_cms_session_token');
    if (token) {
      deleteHeaders['Authorization'] = `Bearer ${token}`;
      deleteHeaders['X-CMS-Token'] = token;
    }
    const res = await fetch(`/api/contents/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'include',
      cache: 'no-store',
      headers: deleteHeaders,
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Installs the safe storage bridge:
 * - Hooks localStorage to sync registry changes with debouncing
 * - Listens for window focus / visibility change to re-sync fresh content from server
 */
export function installContentSyncBridge() {
  if (typeof window === 'undefined') return;

  const originalSetItem = window.localStorage.setItem.bind(window.localStorage);
  const originalRemoveItem = window.localStorage.removeItem.bind(window.localStorage);

  const debounceTimers = new Map<string, number>();

  window.localStorage.setItem = function (key: string, value: string) {
    originalSetItem(key, value);

    if (isHydrating || !isInitialized) return;
    if (!SHARED_STORAGE_KEYS.has(key)) return;

    // Debounce write to avoid multiple rapid requests during local edits
    const existingTimer = debounceTimers.get(key);
    if (existingTimer) window.clearTimeout(existingTimer);

    const timer = window.setTimeout(() => {
      debounceTimers.delete(key);
      void syncRegistryToServer(key, value);
    }, 400);

    debounceTimers.set(key, timer);
  };

  window.localStorage.removeItem = function (key: string) {
    originalRemoveItem(key);
    if (isHydrating || !isInitialized) return;
    const reg = REGISTRY_BY_KEY.get(key);
    if (reg) {
      void deleteRecordFromServer(reg.id);
    }
  };

  // When switching tabs or focusing the window, check for newer content from other browsers
  let lastFocusCheck = Date.now();
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && Date.now() - lastFocusCheck > 25000) {
      lastFocusCheck = Date.now();
      void loadAuthoritativeServerContent();
    }
  });
}