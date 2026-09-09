import { useEffect } from 'react';
import { useTours } from '../../context/TourContext';

/**
 * Rehydrates the UI from the server-side HttpOnly session cookie.
 * The browser must never treat localStorage as proof of authentication.
 */
export function TravelerAuthSessionSync() {
  const { setTravelerUser } = useTours();

  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      try {
        const response = await fetch('/api/auth/traveler/session', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });

        if (cancelled) return;

        if (!response.ok) {
          setTravelerUser(null);
          try {
            localStorage.removeItem('hh_direct_traveler_profile');
            localStorage.removeItem('hh_google_oauth_token');
          } catch {}
          return;
        }

        const data = await response.json().catch(() => null);
        if (data?.authenticated && data.user) {
          setTravelerUser(data.user);
          try {
            // Profile data is only a UI cache. The HttpOnly cookie remains the
            // actual authentication credential.
            localStorage.removeItem('hh_google_oauth_token');
          } catch {}
        }
      } catch {
        // Keep an existing UI state during transient offline/network failures.
      }
    };

    void sync();
    return () => {
      cancelled = true;
    };
  }, [setTravelerUser]);

  return null;
}
