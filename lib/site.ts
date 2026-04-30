/** Canonical profile links for Fallow FPV. */
export const TIKTOK_HANDLE = "fallowfpv";
export const TIKTOK_PROFILE_URL = `https://www.tiktok.com/@${TIKTOK_HANDLE}`;

/**
 * Generated JSON feed URL (recommended: separate repo like chrisrpriceuk/feed).
 */
export const DEFAULT_TIKTOK_GENERATED_JSON_URL =
  "https://raw.githubusercontent.com/chrisrpriceuk/feed/main/tiktok-feed.json";

/**
 * Safety fallback when RSS provider is unavailable (e.g. plan limit / HTTP 402).
 * Keep newest-first.
 */
export const DEFAULT_TIKTOK_FALLBACK_VIDEO_IDS = [
  "7612251653630184726",
  "7609663117848497430",
  "7596433497506549014",
  "7591657312838880534",
  "7583524593864822038",
  "7560345552676785430",
  "7550045582941850902",
  "7505841842169187606",
  "7500532706875575554",
  "7492489411553201430",
] as const;

// Pinned ambient background clip: "Treveth Lowen FPV Drone Flythrough".
export const AMBIENT_YOUTUBE_VIDEO_ID = "edPQxfS2U28";

export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@fallow_fpv";
export const FACEBOOK_URL = "https://www.facebook.com/FallowFPV";
