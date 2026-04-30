/** Shared embed URL + date helpers (safe for server and client imports). */

export function formatPublishedDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function youtubeEmbedSrc(
  videoId: string,
  autoplay: boolean,
  muted: boolean
): string {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    ...(autoplay ? { autoplay: "1" } : {}),
    ...(autoplay && muted ? { mute: "1" } : {}),
  });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

export function tiktokEmbedSrc(videoId: string, autoplay: boolean): string {
  const params = new URLSearchParams();
  if (autoplay) params.set("autoplay", "1");
  params.set("music_info", "1");
  params.set("description", "1");
  params.set("native_context_menu", "1");
  const q = params.toString();
  return `https://www.tiktok.com/player/v1/${videoId}${q ? `?${q}` : ""}`;
}
