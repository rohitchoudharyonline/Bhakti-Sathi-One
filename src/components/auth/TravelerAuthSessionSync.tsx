import { useEffect, useRef } from 'react';
import { useTours } from '../../context/TourContext';

/** Rehydrates the UI from the server-side HttpOnly session cookie. */
export function TravelerAuthSessionSync() {
  const { travelerUser, setTravelerUser } = useTours();
  const bootstrapped = useRef(false);
  const previousUser = useRef(travelerUser);

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
        } else {
          const data = await response.json().catch(() => null);
          if (data?.authenticated && data.user) {
            setTravelerUser(data.user);
            try {
              localStorage.removeItem('hh_google_oauth_token');
            } catch {}
          }
        }
      } catch {
        // Keep the current UI state during a transient network failure.
      } finally {
        if (!cancelled) bootstrapped.current = true;
      }
    };

    void sync();
    return () => {
      cancelled = true;
    };
    // One-time server-session bootstrap.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // TourContext's legacy logout clears UI/localStorage state. Bridge that event
  // to the server so the HttpOnly session cookie is revoked too.
  useEffect(() => {
    const wasAuthenticated = !!previousUser.current;
    previousUser.current = travelerUser;
    if (!bootstrapped.current || !wasAuthenticated || travelerUser) return;

    void fetch('/api/auth/traveler/logout', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
    }).catch(() => undefined);
  }, [travelerUser]);

  return null;
}
