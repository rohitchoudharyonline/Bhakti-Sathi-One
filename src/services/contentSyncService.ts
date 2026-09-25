/**
 * Cross-Browser Content Synchronization Service
 * 
 * Ensures D1/server content is the authoritative source of truth when online,
 * loads server content before public/CMS rendering, prevents stale localStorage
 * from overwriting server data, and provides reliable multi-browser consistency.
 */

import { saveAllMediaAssetsToDb } from '../utils/mediaStorage';
import { DestinationMeta } from '../data/destinationsData';
import { DEFAULT_PACKAGES } from '../data/defaultPackages';

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
const pendingSyncQueue = new Map<string, string>();
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
    for (const reg of SYNCED_REGISTRIES) {
      try {
        window.localStorage.removeItem(reg.storageKey);
        window.localStorage.removeItem(`_sync_time_${reg.storageKey}`);
      } catch {}
    }
  } finally {
    isHydrating = wasHydrating;
  }
}

export async function loadAuthoritativeServerContent(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
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

    let shouldBootstrapPackages = false;
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

    // If the public tour registry is missing or empty, rebuild it from the
    // controlled Jammu & Kashmir defaults instead of showing dummy/blank tours.
    const packageKey = 'hh_tour_packages_v2';
    const packageItem = serverItemsByKey.get(packageKey);
    let packageCount = 0;
    try {
      const parsed = packageItem ? JSON.parse(packageItem.value) : [];
      packageCount = Array.isArray(parsed) ? parsed.length : 0;
    } catch {}
    if (packageCount === 0 && DEFAULT_PACKAGES.length === 3) {
      const value = JSON.stringify(DEFAULT_PACKAGES);
      serverItemsByKey.set(packageKey, {
        id: REGISTRY_BY_KEY.get(packageKey)?.id || 'registry-packages',
        storageKey: packageKey,
        value,
        updatedAt: new Date().toISOString(),
      });
      shouldBootstrapPackages = true;
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

    // Broadcast synchronization to all in-memory React contexts
    try {
      window.dispatchEvent(
        new CustomEvent('holidayshunt_content_synced', {
          detail: { keys: Array.from(serverItemsByKey.keys()) },
        })
      );
    } catch {}


    if (shouldBootstrapPackages) {
      await syncRegistryToServer(packageKey, JSON.stringify(DEFAULT_PACKAGES));
    }

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
export async function syncRegistryToServer(key: string, value: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!SHARED_STORAGE_KEYS.has(key)) return false;
  if (isHydrating) return false;

  const registry = REGISTRY_BY_KEY.get(key);
  if (!registry) return false;

  // If a push for this key is already running, queue it
  if (inFlightPushes.has(key)) {
    pendingSyncQueue.set(key, value);
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
      const nextVal = pendingSyncQueue.get(key);
      if (nextVal !== undefined) {
        pendingSyncQueue.delete(key);
        void syncRegistryToServer(key, nextVal);
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
    if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
      const map: Record<string, DestinationMeta> = {};
      for (const d of json.data) {
        if (d && d.slug) {
          map[d.slug] = d;
        }
      }
      return map;
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
