import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx';
import './index.css';

const SHARED_KEYS = new Set([
  'hh_tour_packages_v2',
  'hh_destinations_registry_v2',
  'hh_temples_places_v1',
]);
const API_PATH = '/api/contents';

type SharedWindow = Window & { __bhaktiSharedBridge?: boolean };
type SharedContent = { storageKey?: string; value?: string };
type SharedRow = {
  id?: string;
  updated_at?: string;
  structured_content?: SharedContent | string | null;
};

const decodeContent = (row: SharedRow): SharedContent | null => {
  if (!row.structured_content) return null;
  if (typeof row.structured_content === 'object') return row.structured_content;
  try {
    const parsed = JSON.parse(row.structured_content) as unknown;
    return parsed && typeof parsed === 'object' ? parsed as SharedContent : null;
  } catch {
    return null;
  }
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

  try {
    const update = await fetch(`${API_PATH}/${encodeURIComponent(body.id)}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (update.ok) return;
  } catch {
    // Fall through to creation for first-time records or older deployments.
  }

  try {
    await fetch(API_PATH, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // localStorage remains the offline fallback.
  }
};

const installSharedContentBridge = async (): Promise<void> => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  const storage = window.localStorage;
  const originalSetItem = storage.setItem.bind(storage);
  const originalRemoveItem = storage.removeItem.bind(storage);
  const sharedWindow = window as SharedWindow;
  if (sharedWindow.__bhaktiSharedBridge) return;
  sharedWindow.__bhaktiSharedBridge = true;
  let hydrating = false;

  storage.setItem = ((key: string, value: string) => {
    originalSetItem(key, value);
    if (!hydrating && SHARED_KEYS.has(key)) void syncSharedKey(key, value);
  }) as typeof storage.setItem;

  storage.removeItem = ((key: string) => {
    originalRemoveItem(key);
    // An empty published value is safer than leaving stale CMS data in other browsers.
    if (!hydrating && SHARED_KEYS.has(key)) void syncSharedKey(key, '');
  }) as typeof storage.removeItem;

  try {
    const response = await fetch(`${API_PATH}?type=shared_local_state`, {
      credentials: 'include',
      cache: 'no-store',
    });
    if (!response.ok) return;
    const payload = await response.json() as {
      data?: SharedRow[];
      contents?: SharedRow[];
      results?: SharedRow[];
    };
    const rows = payload.data ?? payload.contents ?? payload.results ?? [];
    const newestByKey = new Map<string, string>();

    for (const row of rows) {
      const content = decodeContent(row);
      const key = content?.storageKey;
      const value = content?.value;
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
