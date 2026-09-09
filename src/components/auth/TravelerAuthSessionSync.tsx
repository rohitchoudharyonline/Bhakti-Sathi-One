import { useEffect } from 'react';
import { useTours } from '../../context/TourContext';

/** Rehydrates the UI from the server-side HttpOnly session cookie. */
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
            localStorage.removeItem('hh_google_oauth_token');
          } catch {}
        }
      } catch {
        // Keep the current UI state during a transient network failure.
      }
    };

    void sync();
    return () => {
      cancelled = true;
    };
    // This is intentionally a one-time session bootstrap. setTravelerUser is
    // a context function whose identity changes with provider renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
