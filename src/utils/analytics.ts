/**
 * Google Analytics 4 tracking for Holidays Hunt.
 * Uses the existing website Measurement ID from index.html.
 * No personally identifiable information is sent.
 */
export const GA_MEASUREMENT_ID = 'G-PDMC6D7WSL';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: any[]) => void;
  }
}

let initialized = false;

export const initAnalytics = (): void => {
  if (initialized || typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function (...args: any[]) {
    window.dataLayer?.push(args);
  };

  const hasGoogleTag = Boolean(document.querySelector(`script[data-hh-ga4="${GA_MEASUREMENT_ID}"], script[src*="googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`));

  if (!hasGoogleTag) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.setAttribute('data-hh-ga4', GA_MEASUREMENT_ID);
    document.head.appendChild(script);
  }

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
    anonymize_ip: true,
  });

  initialized = true;
};

export const trackPageView = (path?: string): void => {
  if (typeof window === 'undefined') return;
  initAnalytics();
  window.gtag?.('event', 'page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_path: path || window.location.pathname,
  });
};

export const trackEvent = (
  eventName: string,
  parameters: Record<string, string | number | boolean | undefined> = {},
): void => {
  if (typeof window === 'undefined') return;
  initAnalytics();
  const cleanParameters = Object.fromEntries(
    Object.entries(parameters).filter(([, value]) => value !== undefined),
  );
  window.gtag?.('event', eventName, cleanParameters);
};
