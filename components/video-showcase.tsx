"use client";

import { useCallback, useEffect, useState } from "react";
import { VideoLightbox } from "@/components/video-lightbox";
import type { ShowcaseVideo } from "@/lib/types";
import { formatPublishedDate, tiktokEmbedSrc } from "@/lib/video-embed";

type Props = {
  youtube: ShowcaseVideo[];
  tiktok: ShowcaseVideo[];
};

const sectionLabel =
  "text-[12px] font-semibold uppercase tracking-[0.2em] text-ink-muted";

/** Rows below the TikTok preview: keep the column short; "More" adds this many each time. */
const TIKTOK_LIST_INITIAL_MAX = 4;
const TIKTOK_LIST_PAGE_STEP = 4;

/** Two columns at `lg`: each stack flows independently (no shared-row spacer). */
export function VideoShowcase({ youtube, tiktok }: Props) {
  const safeYoutube = Array.isArray(youtube) ? youtube : [];
  const safeTiktok = Array.isArray(tiktok) ? tiktok : [];

  const [lightboxVideo, setLightboxVideo] = useState<ShowcaseVideo | null>(
    null
  );
  const [youtubeExtraPages, setYoutubeExtraPages] = useState(0);
  const [tiktokExtraPages, setTiktokExtraPages] = useState(0);

  const closeLightbox = useCallback(() => setLightboxVideo(null), []);

  const tiktokPreview = safeTiktok[0];
  const tiktokList = tiktokPreview ? safeTiktok.slice(1) : safeTiktok;
  const hasBothLists = safeYoutube.length > 0 && safeTiktok.length > 0;
  const baseVisibleCount = hasBothLists
    ? tiktokList.length === 0
      ? safeYoutube.length
      : Math.min(safeYoutube.length, tiktokList.length)
    : 0;
  const pageSize = Math.max(baseVisibleCount, 6);

  useEffect(() => {
    setYoutubeExtraPages(0);
    setTiktokExtraPages(0);
  }, [safeYoutube.length, safeTiktok.length]);

  const youtubeVisibleCount = hasBothLists
    ? Math.min(
        safeYoutube.length,
        baseVisibleCount + youtubeExtraPages * pageSize
      )
    : safeYoutube.length;

  const tiktokInitialCap = hasBothLists
    ? Math.min(
        TIKTOK_LIST_INITIAL_MAX,
        baseVisibleCount,
        tiktokList.length
      )
    : Math.min(TIKTOK_LIST_INITIAL_MAX, tiktokList.length);
  const tiktokVisibleCount = Math.min(
    tiktokList.length,
    tiktokInitialCap + tiktokExtraPages * TIKTOK_LIST_PAGE_STEP
  );

  if (!safeYoutube.length && !safeTiktok.length) {
    return (
      <p className="text-center text-[15px] text-ink-muted">
        Videos are unavailable right now. Please try again shortly.
      </p>
    );
  }

  const hasYoutube = safeYoutube.length > 0;
  const hasTiktok = safeTiktok.length > 0;
  const bothFeeds = hasYoutube && hasTiktok;
  const stretchLg = bothFeeds ? "lg:h-full lg:min-h-0" : "";
  const listStackLg = bothFeeds
    ? "mt-6 flex min-h-0 flex-1 flex-col lg:min-h-0"
    : "mt-6 flex flex-col";
  const moreWrapClass = bothFeeds ? "mt-auto self-start pt-4" : "self-start pt-4";

  return (
    <div className="space-y-0">
      <VideoLightbox video={lightboxVideo} onClose={closeLightbox} />

      {(hasYoutube || hasTiktok) && (
        <section
          className={`showcase-shell grid content-start items-start gap-12 rounded-[1.75rem] border border-white/50 bg-white/55 p-7 shadow-card backdrop-blur-2xl sm:gap-14 sm:p-10 ${
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
                  {safeYoutube.slice(0, youtubeVisibleCount).map((v, idx) => (
                    <li
                      key={v.id}
                      className={
                        idx === 0 ? "mb-1 border-b border-black/[0.08] pb-3" : ""
                      }
                    >
                      <button
                        type="button"
                        title={v.title}
                        onClick={() => setLightboxVideo(v)}
                        className={`showcase-row-btn group flex w-full gap-4 rounded-2xl p-2.5 text-left transition-colors duration-180 sm:gap-5 sm:p-3 ${
                          idx === 0
                            ? "showcase-row-btn--featured bg-black/[0.04] ring-1 ring-black/[0.08] hover:bg-black/[0.055]"
                            : "hover:bg-black/[0.035]"
                        }`}
                      >
                        <div className="showcase-thumb-yt relative h-[76px] w-[134px] shrink-0 overflow-hidden rounded-[0.65rem] bg-canvas-subtle ring-1 ring-black/[0.04] sm:h-[86px] sm:w-[152px]">
                          {v.thumbnailUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element -- avoid /_next/image; explicit dimensions in CSS
                            <img
                              src={v.thumbnailUrl}
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
                          {idx === 0 ? (
                            <div className="mb-1.5 flex items-center gap-2">
                              <span className="inline-flex rounded-full bg-black/[0.06] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                                Background clip
                              </span>
                              <span
                                aria-hidden
                                className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/[0.07] text-[10px] text-ink-muted"
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
                  ))}
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
                    onClick={() => setYoutubeExtraPages((p) => p + 1)}
                    className="rounded-full border border-black/[0.12] bg-white/70 px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-white"
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
                <div className="mx-auto max-w-[min(100%,300px)] overflow-hidden rounded-[1.35rem] bg-black shadow-soft ring-1 ring-black/[0.05]">
                  <div className="relative aspect-[9/16] w-full">
                    <iframe
                      key={tiktokPreview.id}
                      title={tiktokPreview.title}
                      src={tiktokEmbedSrc(tiktokPreview.id, true)}
                      className="absolute inset-0 h-full w-full border-0"
                      allow="encrypted-media; fullscreen; autoplay; picture-in-picture"
                      allowFullScreen
                    />
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
                  {tiktokList.slice(0, tiktokVisibleCount).map((v) => (
                    <li key={v.id}>
                      <button
                        type="button"
                        title={v.title}
                        onClick={() => setLightboxVideo(v)}
                        className="showcase-row-btn group flex w-full gap-3 rounded-2xl p-2 text-left transition-colors duration-180 hover:bg-black/[0.035] sm:gap-3.5 sm:p-2.5"
                      >
                        <div className="showcase-thumb-tt relative h-[90px] w-[52px] shrink-0 overflow-hidden rounded-[0.5rem] bg-canvas-subtle ring-1 ring-black/[0.04]">
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
                    onClick={() => setTiktokExtraPages((p) => p + 1)}
                    className="rounded-full border border-black/[0.12] bg-white/70 px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-white"
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
