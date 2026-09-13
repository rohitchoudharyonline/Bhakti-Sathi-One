import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx';
import './index.css';

// The legacy CMS state is kept in localStorage. Mirror the three public
// content registries to D1 and hydrate them before React mounts so a fresh
// browser receives the same temples, destinations and tour packages.
const SHARED_KEYS = new Set([
  'hh_tour_packages_v2',
  'hh_destinations_registry_v2',
  'hh_temples_places_v1',
]);
const API_PATH = '/api/contents';

type SharedWindow = Window & { __bhaktiSharedBridge?: boolean };

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
    void fetch(API_PATH, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: `local-${key}`,
        content_type: 'shared_local_state',
        title: key,
        slug: key,
        status: 'published',
        structured_content: { storageKey: key, value },
      }),
    }).catch(() => undefined);
  }) as typeof storage.setItem;

  try {
    const response = await fetch(`${API_PATH}?type=shared_local_state`, {
      credentials: 'include',
      cache: 'no-store',
    });
    if (!response.ok) return;
    const payload = await response.json() as {
      data?: Array<{ structured_content?: { storageKey?: string; value?: string } }>;
    };
    for (const row of payload.data || []) {
      const key = row.structured_content?.storageKey;
      const value = row.structured_content?.value;
      if (key && SHARED_KEYS.has(key) && typeof value === 'string') {
        hydrating = true;
        try { originalSetItem(key, value); } finally { hydrating = false; }
      }
    }
  } catch {
    // Offline or older deployments continue using the existing local cache.
  }
};

const mountApp = () => {
  // OAuth client IDs are public identifiers, but keeping the production value
  // in the build environment avoids coupling the frontend to an obsolete client.
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
