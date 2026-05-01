"use client";

import { useEffect, useState } from "react";
import { youtubeEmbedSrc } from "@/lib/video-embed";

/**
 * Full-viewport YouTube embed as a soft backdrop (muted autoplay, non-interactive).
 */
export function AmbientYouTubeBackground({
  videoId,
  isDark = false,
}: {
  videoId: string;
  isDark?: boolean;
}) {
  const [loadEmbed, setLoadEmbed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const arm = () => {
      if (!cancelled) setLoadEmbed(true);
    };
    const t = window.setTimeout(arm, 1800);
    const idle =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(arm, { timeout: 5000 })
        : undefined;
    return () => {
      cancelled = true;
      window.clearTimeout(t);
      if (idle !== undefined && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idle);
      }
    };
  }, []);

  const base = youtubeEmbedSrc(videoId, true, true);
  const src = `${base}${base.includes("?") ? "&" : "?"}controls=0&disablekb=1&fs=0&iv_load_policy=3&loop=1&playlist=${encodeURIComponent(videoId)}`;
  const videoOpacity = isDark ? 0.34 : 0.52;
  const wash = isDark
    ? "linear-gradient(to bottom, rgba(13,14,18,0.86) 0%, rgba(13,14,18,0.62) 45%, rgba(13,14,18,0.9) 100%)"
    : "linear-gradient(to bottom, rgba(250,250,252,0.64) 0%, rgba(250,250,252,0.42) 45%, rgba(250,250,252,0.76) 100%)";

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div
        className="absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "177.78vh",
          height: "100vh",
          minWidth: "100%",
          minHeight: "56.25vw",
          opacity: videoOpacity,
        }}
      >
        {loadEmbed ? (
          <iframe
            title=""
            src={src}
            className="pointer-events-none absolute inset-0 h-full w-full border-0"
            allow="autoplay; encrypted-media"
            tabIndex={-1}
          />
        ) : null}
      </div>
      <div
        className="absolute inset-0"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: wash,
        }}
      />
      <div
        className="absolute left-1/2 top-[56%] h-24 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
        style={{
          backgroundColor: isDark
            ? "rgba(13,14,18,0.72)"
            : "rgba(250,250,252,0.66)",
        }}
      />
    </div>
  );
}
