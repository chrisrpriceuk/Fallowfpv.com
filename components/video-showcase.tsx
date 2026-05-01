"use client";

import { useCallback, useEffect, useState } from "react";
import { VideoLightbox } from "@/components/video-lightbox";
import { trackEvent } from "@/lib/analytics";
import { AMBIENT_YOUTUBE_VIDEO_ID } from "@/lib/site";
import type { ShowcaseVideo } from "@/lib/types";
import {
  formatPublishedDate,
  tiktokEmbedSrc,
  youtubeThumbnailDisplayUrl,
} from "@/lib/video-embed";

type Props = {
  youtube: ShowcaseVideo[];
  tiktok: ShowcaseVideo[];
  isLoading?: boolean;
};

const sectionLabel =
  "text-[12px] font-semibold uppercase tracking-[0.2em] text-ink-muted";

/** Rows below the TikTok preview: keep balance with YouTube without truncating too hard. */
const INITIAL_VISIBLE_MAX = 6;
const TIKTOK_LIST_PAGE_STEP = 8;

/** Two columns at `lg`: each stack flows independently (no shared-row spacer). */
export function VideoShowcase({ youtube, tiktok, isLoading = false }: Props) {
  const safeYoutube = Array.isArray(youtube) ? youtube : [];
  const safeTiktok = Array.isArray(tiktok) ? tiktok : [];

  const [lightboxVideo, setLightboxVideo] = useState<ShowcaseVideo | null>(
    null
  );
  const [lightboxQueue, setLightboxQueue] = useState<ShowcaseVideo[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [youtubeExtraPages, setYoutubeExtraPages] = useState(0);
  const [tiktokExtraPages, setTiktokExtraPages] = useState(0);
  const [shouldLoadTiktokPreview, setShouldLoadTiktokPreview] = useState(false);
  const [tiktokPreviewHost, setTiktokPreviewHost] = useState<HTMLDivElement | null>(
    null
  );

  const closeLightbox = useCallback(() => {
    setLightboxVideo(null);
    setLightboxQueue([]);
    setLightboxIndex(0);
  }, []);

  const tiktokPreview = safeTiktok[0];
  const tiktokList = tiktokPreview ? safeTiktok.slice(1) : safeTiktok;
  const hasBothLists = safeYoutube.length > 0 && safeTiktok.length > 0;
  const baseVisibleCount = hasBothLists
    ? tiktokList.length === 0
      ? safeYoutube.length
      : Math.min(safeYoutube.length, tiktokList.length)
    : 0;
  const pageSize = INITIAL_VISIBLE_MAX;

  useEffect(() => {
    setYoutubeExtraPages(0);
    setTiktokExtraPages(0);
  }, [safeYoutube.length, safeTiktok.length]);

  useEffect(() => {
    if (!tiktokPreviewHost || shouldLoadTiktokPreview) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadTiktokPreview(true);
          observer.disconnect();
        }
      },
      { rootMargin: "180px 0px" }
    );
    observer.observe(tiktokPreviewHost);
    return () => observer.disconnect();
  }, [tiktokPreviewHost, shouldLoadTiktokPreview]);

  const youtubeInitialCap = hasBothLists
    ? Math.min(INITIAL_VISIBLE_MAX, baseVisibleCount)
    : Math.min(INITIAL_VISIBLE_MAX, safeYoutube.length);
  const youtubeVisibleCount = hasBothLists
    ? Math.min(
        safeYoutube.length,
        youtubeInitialCap + youtubeExtraPages * pageSize
      )
    : Math.min(safeYoutube.length, youtubeInitialCap + youtubeExtraPages * pageSize);

  const tiktokInitialCap = hasBothLists
    ? Math.min(
        INITIAL_VISIBLE_MAX,
        baseVisibleCount,
        tiktokList.length
      )
    : Math.min(INITIAL_VISIBLE_MAX, tiktokList.length);
  const tiktokVisibleCount = Math.min(
    tiktokList.length,
    tiktokInitialCap + tiktokExtraPages * TIKTOK_LIST_PAGE_STEP
  );

  const hasYoutube = safeYoutube.length > 0;
  const hasTiktok = safeTiktok.length > 0;
  const bothFeeds = hasYoutube && hasTiktok;
  const stretchLg = bothFeeds ? "lg:h-full lg:min-h-0" : "";
  const listStackLg = bothFeeds
    ? "mt-6 flex min-h-0 flex-1 flex-col lg:min-h-0"
    : "mt-6 flex flex-col";
  const moreWrapClass = bothFeeds ? "mt-auto self-start pt-4" : "self-start pt-4";
  const canGoPrev = lightboxVideo !== null && lightboxIndex > 0;
  const canGoNext =
    lightboxVideo !== null && lightboxIndex < lightboxQueue.length - 1;

  const openLightboxFromQueue = useCallback(
    (queue: ShowcaseVideo[], index: number) => {
      if (!Array.isArray(queue) || queue.length === 0) return;
      const bounded = Math.max(0, Math.min(index, queue.length - 1));
      setLightboxQueue(queue);
      setLightboxIndex(bounded);
      setLightboxVideo(queue[bounded] ?? null);
    },
    []
  );

  const goPrevLightbox = useCallback(() => {
    if (!canGoPrev) return;
    const nextIndex = lightboxIndex - 1;
    setLightboxIndex(nextIndex);
    setLightboxVideo(lightboxQueue[nextIndex] ?? null);
  }, [canGoPrev, lightboxIndex, lightboxQueue]);

  const goNextLightbox = useCallback(() => {
    if (!canGoNext) return;
    const nextIndex = lightboxIndex + 1;
    setLightboxIndex(nextIndex);
    setLightboxVideo(lightboxQueue[nextIndex] ?? null);
  }, [canGoNext, lightboxIndex, lightboxQueue]);

  if (isLoading && !safeYoutube.length && !safeTiktok.length) {
    return (
      <section
        className="showcase-shell grid content-start items-start gap-12 rounded-[1.75rem] border border-ink/10 bg-canvas/70 p-7 shadow-card backdrop-blur-2xl sm:gap-14 sm:p-10 lg:grid-cols-2 lg:items-stretch lg:gap-x-14 lg:gap-y-0"
        aria-label="Video library loading"
      >
        <div className="flex min-w-0 flex-col">
          <h3 className={sectionLabel}>YouTube</h3>
          <div className="mt-6 space-y-3">
            <div className="h-[102px] animate-pulse rounded-2xl bg-ink/6" />
            <div className="h-[102px] animate-pulse rounded-2xl bg-ink/6" />
            <div className="h-[102px] animate-pulse rounded-2xl bg-ink/6" />
            <div className="h-[102px] animate-pulse rounded-2xl bg-ink/6" />
          </div>
        </div>
        <div className="flex min-w-0 flex-col">
          <h3 className={sectionLabel}>TikTok</h3>
          <div className="mt-6 mx-auto h-[420px] w-full max-w-[300px] animate-pulse rounded-[1.35rem] bg-ink/8" />
          <div className="mt-8 space-y-3">
            <div className="h-[82px] animate-pulse rounded-2xl bg-ink/6" />
            <div className="h-[82px] animate-pulse rounded-2xl bg-ink/6" />
            <div className="h-[82px] animate-pulse rounded-2xl bg-ink/6" />
          </div>
        </div>
      </section>
    );
  }

  if (!safeYoutube.length && !safeTiktok.length) {
    return (
      <p className="text-center text-[15px] text-ink-muted">
        Videos are unavailable right now. Please try again shortly.
      </p>
    );
  }

  return (
    <div className="space-y-0">
      <VideoLightbox
        video={lightboxVideo}
        onClose={closeLightbox}
        onPrev={goPrevLightbox}
        onNext={goNextLightbox}
        canPrev={canGoPrev}
        canNext={canGoNext}
        currentIndex={lightboxIndex}
        totalCount={lightboxQueue.length}
      />

      {(hasYoutube || hasTiktok) && (
        <section
          className={`showcase-shell grid content-start items-start gap-12 rounded-[1.75rem] border border-ink/10 bg-canvas/70 p-7 shadow-card backdrop-blur-2xl sm:gap-14 sm:p-10 ${
            bothFeeds
              ? "lg:grid-cols-2 lg:items-stretch lg:gap-x-14 lg:gap-y-0"
              : "lg:grid-cols-1"
          }`}
          aria-label="Video library"
        >
          {hasYoutube ? (
          <div className={`showcase-col flex min-w-0 flex-col ${stretchLg}`}>
            <h3 className={sectionLabel}>YouTube</h3>
            <div className={listStackLg}>
              {safeYoutube.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {safeYoutube.slice(0, youtubeVisibleCount).map((v, idx) => {
                    const isBackgroundClip = v.id === AMBIENT_YOUTUBE_VIDEO_ID;
                    return (
                    <li
                      key={v.id}
                      className={
                        isBackgroundClip
                          ? "mb-1 border-b border-ink/10 pb-3"
                          : ""
                      }
                    >
                      <button
                        type="button"
                        title={v.title}
                        onClick={() => {
                          trackEvent("video_lightbox_open", {
                            platform: "youtube",
                            source: "youtube_list",
                            video_id: v.id,
                          });
                          openLightboxFromQueue(
                            safeYoutube.slice(0, youtubeVisibleCount),
                            idx
                          );
                        }}
                        className={`showcase-row-btn group flex w-full gap-4 rounded-2xl p-2.5 text-left transition-colors duration-180 sm:gap-5 sm:p-3 ${
                          isBackgroundClip
                            ? "showcase-row-btn--featured bg-ink/5 ring-1 ring-ink/10 hover:bg-ink/[0.07]"
                            : "hover:bg-ink/5"
                        }`}
                      >
                        <div className="showcase-thumb-yt relative h-[76px] w-[134px] shrink-0 overflow-hidden rounded-[0.65rem] bg-canvas-subtle ring-1 ring-ink/10 sm:h-[86px] sm:w-[152px]">
                          {v.thumbnailUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element -- avoid /_next/image; explicit dimensions in CSS
                            <img
                              src={youtubeThumbnailDisplayUrl(v.thumbnailUrl)}
                              alt=""
                              className="h-full w-full object-cover transition duration-300 ease-out group-hover:scale-[1.02]"
                              width={152}
                              height={86}
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-canvas-subtle text-[10px] text-ink-faint">
                              —
                            </div>
                          )}
                          <span className="pointer-events-none absolute inset-0 bg-black/0 transition duration-180 group-hover:bg-black/[0.08]" />
                        </div>
                        <div className="min-w-0 flex-1 py-0.5">
                          {isBackgroundClip ? (
                            <div className="mb-1.5 flex items-center gap-2">
                              <span className="inline-flex rounded-full bg-ink/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                                Background clip
                              </span>
                              <span
                                aria-hidden
                                className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-ink/10 text-[10px] text-ink-muted"
                                title="Now in background"
                              >
                                ◌
                              </span>
                            </div>
                          ) : null}
                          <p className="line-clamp-5 text-[16px] font-medium leading-[1.42] tracking-[-0.012em] text-ink sm:line-clamp-6 sm:text-[17px] sm:leading-[1.4]">
                            {v.title}
                          </p>
                          {v.publishedAt ? (
                            <p className="mt-1.5 text-[14px] tabular-nums-date text-ink-muted sm:text-[15px]">
                              {formatPublishedDate(v.publishedAt)}
                            </p>
                          ) : null}
                        </div>
                      </button>
                    </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-[15px] leading-relaxed text-ink-muted">
                  No YouTube videos yet.
                </p>
              )}
              {youtubeVisibleCount < safeYoutube.length ? (
                <div className={moreWrapClass}>
                  <button
                    type="button"
                    onClick={() => {
                      trackEvent("video_list_expand", {
                        platform: "youtube",
                        remaining: safeYoutube.length - youtubeVisibleCount,
                      });
                      setYoutubeExtraPages((p) => p + 1);
                    }}
                    className="rounded-full border border-ink/15 bg-canvas-subtle/70 px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-canvas-subtle"
                  >
                    More ({safeYoutube.length - youtubeVisibleCount} remaining)
                  </button>
                </div>
              ) : bothFeeds ? (
                <div className="min-h-0 flex-1" aria-hidden />
              ) : null}
            </div>
          </div>
          ) : null}

          {hasTiktok ? (
          <div className={`showcase-col flex min-w-0 flex-col ${stretchLg}`}>
            <h3 className={sectionLabel}>TikTok</h3>

            {tiktokPreview ? (
              <div className="mt-6">
                <div className="mx-auto max-w-[min(100%,300px)] overflow-hidden rounded-[1.35rem] bg-black shadow-soft ring-1 ring-ink/10">
                  <div
                    ref={setTiktokPreviewHost}
                    className="relative aspect-[9/16] w-full"
                  >
                    {shouldLoadTiktokPreview ? (
                      <iframe
                        key={tiktokPreview.id}
                        title={tiktokPreview.title}
                        src={tiktokEmbedSrc(tiktokPreview.id, false)}
                        className="absolute inset-0 h-full w-full border-0"
                        allow="encrypted-media; fullscreen; autoplay; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-black text-[13px] text-white/75">
                        Loading preview...
                      </div>
                    )}
                  </div>
                </div>
                <div className="mx-auto mt-5 max-w-[min(100%,300px)]">
                  <p className="line-clamp-5 text-[16px] font-medium leading-[1.45] tracking-[-0.012em] text-ink sm:line-clamp-6 sm:text-[17px]">
                    {tiktokPreview.title}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-ink-muted sm:text-[15px]">
                    {tiktokPreview.publishedAt ? (
                      <span className="tabular-nums-date">
                        {formatPublishedDate(tiktokPreview.publishedAt)}
                      </span>
                    ) : null}
                    <a
                      href={tiktokPreview.watchUrl}
                      className="text-link transition-colors duration-180 hover:text-link-hover hover:underline hover:underline-offset-[3px]"
                      target="_blank"
                      rel="noreferrer noopener"
                      onClick={() =>
                        trackEvent("outbound_link_click", {
                          destination: "tiktok",
                          location: "tiktok_featured_preview",
                          video_id: tiktokPreview.id,
                        })
                      }
                    >
                      Open in TikTok
                    </a>
                  </div>
                </div>
              </div>
            ) : null}

            <div
              className={`${bothFeeds ? "flex min-h-0 flex-1 flex-col lg:min-h-0" : "flex flex-col"} ${tiktokPreview ? "mt-8" : "mt-6"}`}
            >
              {tiktokList.length > 0 ? (
                <ul className="flex flex-col gap-3">
                  {tiktokList.slice(0, tiktokVisibleCount).map((v, idx) => (
                    <li key={v.id}>
                      <button
                        type="button"
                        title={v.title}
                        onClick={() => {
                          trackEvent("video_lightbox_open", {
                            platform: "tiktok",
                            source: "tiktok_list",
                            video_id: v.id,
                          });
                          openLightboxFromQueue(
                            tiktokList.slice(0, tiktokVisibleCount),
                            idx
                          );
                        }}
                        className="showcase-row-btn group flex w-full gap-3 rounded-2xl p-2 text-left transition-colors duration-180 hover:bg-ink/5 sm:gap-3.5 sm:p-2.5"
                      >
                        <div className="showcase-thumb-tt relative h-[90px] w-[52px] shrink-0 overflow-hidden rounded-[0.5rem] bg-canvas-subtle ring-1 ring-ink/10">
                          {v.thumbnailUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element -- TikTok CDN hosts vary
                            <img
                              src={v.thumbnailUrl}
                              alt=""
                              className="h-full w-full object-cover transition duration-300 ease-out group-hover:scale-[1.02]"
                              width={52}
                              height={90}
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-canvas-subtle text-[9px] text-ink-faint">
                              —
                            </div>
                          )}
                          <span className="pointer-events-none absolute inset-0 bg-black/0 transition duration-180 group-hover:bg-black/[0.08]" />
                        </div>
                        <div className="min-w-0 flex-1 py-0.5">
                          <p className="line-clamp-5 text-[15px] font-medium leading-[1.42] tracking-[-0.01em] text-ink sm:line-clamp-6 sm:text-[16px]">
                            {v.title}
                          </p>
                          {v.publishedAt ? (
                            <p className="mt-1 text-[13px] tabular-nums-date text-ink-muted sm:text-[14px]">
                              {formatPublishedDate(v.publishedAt)}
                            </p>
                          ) : null}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[15px] leading-relaxed text-ink-muted">
                  No TikTok videos yet.
                </p>
              )}
              {tiktokVisibleCount < tiktokList.length ? (
                <div className={moreWrapClass}>
                  <button
                    type="button"
                    onClick={() => {
                      trackEvent("video_list_expand", {
                        platform: "tiktok",
                        remaining: tiktokList.length - tiktokVisibleCount,
                      });
                      setTiktokExtraPages((p) => p + 1);
                    }}
                    className="rounded-full border border-ink/15 bg-canvas-subtle/70 px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-canvas-subtle"
                  >
                    More ({tiktokList.length - tiktokVisibleCount} remaining)
                  </button>
                </div>
              ) : bothFeeds ? (
                <div className="min-h-0 flex-1" aria-hidden />
              ) : null}
            </div>
          </div>
          ) : null}
        </section>
      )}
    </div>
  );
}
