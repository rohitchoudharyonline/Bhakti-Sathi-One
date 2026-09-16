import { MediaAsset } from '../types/cms';

const DB_NAME = 'holidays_hunt_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'media_assets';

// In-memory cache for synchronous resolution during renders
const memoryAssetCache = new Map<string, MediaAsset>();
const memoryDataUrlCache = new Map<string, string>();

let dbPromise: Promise<IDBDatabase | null> | null = null;

function getDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      try {
        const req = window.indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            store.createIndex('storagePath', 'storagePath', { unique: false });
            store.createIndex('url', 'url', { unique: false });
            store.createIndex('fileName', 'fileName', { unique: false });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => {
          console.warn('[MediaStorage] Failed to open IndexedDB:', req.error);
          resolve(null);
        };
      } catch (err) {
        console.warn('[MediaStorage] IndexedDB not available:', err);
        resolve(null);
      }
    });
  }
  return dbPromise;
}

function updateMemoryCaches(asset: MediaAsset) {
  if (!asset || !asset.id) return;
  memoryAssetCache.set(asset.id, asset);
  if (asset.url) memoryAssetCache.set(asset.url, asset);
  if (asset.storagePath) memoryAssetCache.set(asset.storagePath, asset);
  if (asset.fileName) memoryAssetCache.set(asset.fileName, asset);

  if (asset.dataUrl) {
    if (asset.id) memoryDataUrlCache.set(asset.id, asset.dataUrl);
    if (asset.url) memoryDataUrlCache.set(asset.url, asset.dataUrl);
    if (asset.storagePath) memoryDataUrlCache.set(asset.storagePath, asset.dataUrl);
    if (asset.fileName) memoryDataUrlCache.set(asset.fileName, asset.dataUrl);
  }
}

/**
 * Synchronous lookup for a dataUrl by URL, storagePath, or filename
 */
export function getCachedMediaDataUrl(keyOrUrl?: string | null): string | undefined {
  if (!keyOrUrl || typeof keyOrUrl !== 'string') return undefined;
  const clean = keyOrUrl.trim();
  if (memoryDataUrlCache.has(clean)) return memoryDataUrlCache.get(clean);

  // Check matching storage path suffix or filename
  for (const [key, dataUrl] of memoryDataUrlCache.entries()) {
    if (clean.includes(key) || key.includes(clean)) {
      return dataUrl;
    }
  }
  return undefined;
}

/**
 * Initializes the media storage from IndexedDB and populates in-memory cache
 */
export async function initMediaStorage(): Promise<MediaAsset[]> {
  const db = await getDb();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const assets: MediaAsset[] = req.result || [];
        for (const a of assets) {
          updateMemoryCaches(a);
        }
        resolve(assets);
      };
      req.onerror = () => {
        console.warn('[MediaStorage] Error loading all assets:', req.error);
        resolve([]);
      };
    } catch (e) {
      console.warn('[MediaStorage] Exception in initMediaStorage:', e);
      resolve([]);
    }
  });
}

/**
 * Persists an individual MediaAsset to IndexedDB and updates in-memory cache
 */
export async function saveMediaAssetToDb(asset: MediaAsset): Promise<void> {
  if (!asset || !asset.id) return;
  updateMemoryCaches(asset);

  const db = await getDb();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(asset);
      req.onsuccess = () => resolve();
      req.onerror = () => {
        console.warn('[MediaStorage] Error saving asset:', req.error);
        resolve();
      };
    } catch {
      resolve();
    }
  });
}

/**
 * Bulk persists an array of MediaAssets to IndexedDB
 */
export async function saveAllMediaAssetsToDb(assets: MediaAsset[]): Promise<void> {
  if (!Array.isArray(assets) || assets.length === 0) return;
  for (const a of assets) updateMemoryCaches(a);

  const db = await getDb();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      for (const asset of assets) {
        if (asset && asset.id) store.put(asset);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => {
        console.warn('[MediaStorage] Error bulk saving assets:', tx.error);
        resolve();
      };
    } catch {
      resolve();
    }
  });
}

/**
 * Deletes a MediaAsset from IndexedDB and clears it from cache
 */
export async function deleteMediaAssetFromDb(id: string): Promise<void> {
  memoryAssetCache.delete(id);
  memoryDataUrlCache.delete(id);

  const db = await getDb();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}
