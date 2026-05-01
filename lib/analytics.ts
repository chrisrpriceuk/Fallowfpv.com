type AnalyticsParams = Record<string, string | number | boolean | undefined>;

export const GA_MEASUREMENT_ID = "G-XSN85WVSBG";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (
      command: "js" | "config" | "event",
      target: string | Date,
      params?: AnalyticsParams
    ) => void;
  }
}

export function trackEvent(eventName: string, params: AnalyticsParams = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
}
