"use client";

import { useEffect } from "react";
import type { ShowcaseVideo } from "@/lib/types";
import {
  formatPublishedDate,
  tiktokEmbedSrc,
  youtubeEmbedSrc,
} from "@/lib/video-embed";

export function VideoLightbox({
  video,
  onClose,
}: {
  video: ShowcaseVideo | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!video) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [video, onClose]);

  if (!video) return null;

  const isYt = video.platform === "youtube";
  const openLabel = isYt ? "Open in YouTube" : "Open in TikTok";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-lightbox-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[3px] transition-colors duration-180 hover:bg-black/45"
        onClick={onClose}
        aria-label="Close video"
      />
      <div
        className="relative z-10 flex max-h-[min(92vh,900px)] w-full max-w-[min(100%,920px)] flex-col overflow-hidden rounded-[1.35rem] bg-canvas/95 shadow-lift ring-1 ring-black/[0.06] backdrop-blur-xl"
      >
        <div
          className={`relative bg-black ${
            isYt ? "aspect-video w-full" : "flex justify-center py-2 sm:py-4"
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-[18px] leading-none text-white backdrop-blur-md transition-colors duration-180 hover:bg-white/25"
            aria-label="Close"
          >
            ×
          </button>
          {isYt ? (
            <iframe
              key={video.id}
              title={video.title}
              src={youtubeEmbedSrc(video.id, true, false)}
              className="absolute inset-0 h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="relative aspect-[9/16] h-[min(78vh,680px)] w-[min(100%,340px)]">
              <iframe
                key={video.id}
                title={video.title}
                src={tiktokEmbedSrc(video.id, true)}
                className="absolute inset-0 h-full w-full rounded-[0.65rem] border-0"
                allow="encrypted-media; fullscreen; autoplay; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
        <div className="border-t border-black/[0.045] px-5 py-4 sm:px-7 sm:py-5">
          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-faint">
            {isYt ? "YouTube" : "TikTok"}
          </span>
          <h2
            id="video-lightbox-title"
            className="mt-2 text-[19px] font-semibold leading-snug tracking-[-0.02em] text-ink sm:text-[22px]"
          >
            {video.title}
          </h2>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-ink-muted">
            {video.publishedAt ? (
              <span className="tabular-nums-date">
                {formatPublishedDate(video.publishedAt)}
              </span>
            ) : null}
            <a
              href={video.watchUrl}
              className="text-link transition-colors duration-180 hover:text-link-hover hover:underline hover:underline-offset-[3px]"
              target="_blank"
              rel="noreferrer noopener"
            >
              {openLabel}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
