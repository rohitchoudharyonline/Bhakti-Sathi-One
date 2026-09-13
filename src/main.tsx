import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx';
import './index.css';

// The legacy CMS stores public content in localStorage. This bridge mirrors
// the three public registries to the shared D1 contents API and hydrates the
// cache before React mounts, so every browser reads the same data.
const SHARED_KEYS = new Set([
  'hh_tour_packages_v2',
  'hh_destinations_registry_v2',
  'hh_temples_places_v1',
]);
const API_PATH = '/api/contents';

type SharedWindow = Window & { __bhaktiSharedBridge?: boolean };
type SharedRow = {
  id?: string;
  updated_at?: string;
  structured_content?: { storageKey?: string; value?: string } | null;
};

const syncSharedKey = async (key: string, value: string) => {
  const body = {
    id: `local-${key}`,
    content_type: 'shared_local_state',
    title: key,
    slug: key,
    status: 'published',
    structured_content: { storageKey: key, value },
  };

  // The API uses PUT for an existing content record. If this is the first
  // write, fall back to POST to create it.
  try {
    const update = await fetch(`${API_PATH}/${encodeURIComponent(body.id)}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (update.ok) return;
  } catch {
    // Try creation below.
  }

  try {
    await fetch(API_PATH, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // Keep localStorage as an offline fallback.
  }
};

const installSharedContentBridge = async (): Promise<void> => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  const storage = window.localStorage;
  const originalSetItem = storage.setItem.bind(storage);
  const sharedWindow = window as SharedWindow;
  if (sharedWindow.__bhaktiSharedBridge) return;
  sharedWindow.__bhaktiSharedBridge = true;
  let hydrating = false;

  storage.setItem = ((key: string, value: string) => {
    originalSetItem(key, value);
    if (hydrating || !SHARED_KEYS.has(key)) return;
    void syncSharedKey(key, value);
  }) as typeof storage.setItem;

  try {
    const response = await fetch(`${API_PATH}?type=shared_local_state`, {
      credentials: 'include',
      cache: 'no-store',
    });
    if (!response.ok) return;
    const payload = await response.json() as { data?: SharedRow[] };
    const newestByKey = new Map<string, string>();

    // The API sorts by updated_at descending. Keep only the newest row for
    // each storage key so an older duplicate can never overwrite fresh data.
    for (const row of payload.data || []) {
      const key = row.structured_content?.storageKey;
      const value = row.structured_content?.value;
      if (key && SHARED_KEYS.has(key) && typeof value === 'string' && !newestByKey.has(key)) {
        newestByKey.set(key, value);
      }
    }

    hydrating = true;
    try {
      for (const [key, value] of newestByKey) originalSetItem(key, value);
    } finally {
      hydrating = false;
    }
  } catch {
    // Offline or older deployments continue using the existing local cache.
  }
};

const mountApp = () => {
  const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim()
    || '969580668423-u2tnqu48ng8qjgjm4dhb45aaaj5b7mtu.apps.googleusercontent.com';

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <HelmetProvider>
        <GoogleOAuthProvider clientId={clientId}>
          <App />
        </GoogleOAuthProvider>
      </HelmetProvider>
    </StrictMode>,
  );
};

void installSharedContentBridge().finally(mountApp);
