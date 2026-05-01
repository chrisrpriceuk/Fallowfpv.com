"use client";

import { youtubeEmbedSrc } from "@/lib/video-embed";

/**
 * Full-viewport YouTube embed as a soft backdrop (muted autoplay, non-interactive).
 */
export function AmbientYouTubeBackground({ videoId }: { videoId: string }) {
  const base = youtubeEmbedSrc(videoId, true, true);
  const src = `${base}${base.includes("?") ? "&" : "?"}controls=0&loop=1&playlist=${encodeURIComponent(videoId)}`;

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
        className="absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 opacity-[0.52]"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "177.78vh",
          height: "100vh",
          minWidth: "100%",
          minHeight: "56.25vw",
          opacity: 0.52,
        }}
      >
        <iframe
          title=""
          src={src}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
      <div
        className="absolute inset-0 bg-gradient-to-b from-canvas/[0.64] via-canvas/[0.42] to-canvas/[0.76]"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(to bottom, rgba(250,250,252,0.64) 0%, rgba(250,250,252,0.42) 45%, rgba(250,250,252,0.76) 100%)",
        }}
      />
    </div>
  );
}
