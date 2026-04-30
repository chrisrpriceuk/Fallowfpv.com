"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AmbientYouTubeBackground } from "@/components/ambient-youtube-background";
import { ContactForm } from "@/components/contact-form";
import { VideoShowcase } from "@/components/video-showcase";
import type { ShowcaseVideo } from "@/lib/types";
import {
  AMBIENT_YOUTUBE_VIDEO_ID,
  FACEBOOK_URL,
  TIKTOK_PROFILE_URL,
  YOUTUBE_CHANNEL_URL,
} from "@/lib/site";

const social = [
  { label: "YouTube", href: YOUTUBE_CHANNEL_URL },
  { label: "TikTok", href: TIKTOK_PROFILE_URL },
  { label: "Facebook", href: FACEBOOK_URL },
] as const;

const publicBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() || "";
const publicAsset = (path: string) => `${publicBasePath}${path}`;

type ClientFeed = {
  youtube: ShowcaseVideo[];
  tiktok: ShowcaseVideo[];
};

function normalizeFeedVideos(
  input: unknown,
  platform: "youtube" | "tiktok"
): ShowcaseVideo[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((raw) => {
      const item = raw as Partial<ShowcaseVideo>;
      const id = String(item.id ?? "").trim();
      const watchUrl = String(item.watchUrl ?? "").trim();
      if (!id || !watchUrl) return null;
      return {
        platform,
        id,
        title: String(item.title ?? "Untitled").trim() || "Untitled",
        publishedAt: String(item.publishedAt ?? "").trim(),
        thumbnailUrl: String(item.thumbnailUrl ?? "").trim(),
        watchUrl,
      } satisfies ShowcaseVideo;
    })
    .filter((v): v is ShowcaseVideo => Boolean(v));
}

export default function HomePage() {
  const [feed, setFeed] = useState<ClientFeed>({ youtube: [], tiktok: [] });

  useEffect(() => {
    let cancelled = false;

    async function loadFeed() {
      const feedUrl =
        process.env.NEXT_PUBLIC_SHOWCASE_FEED_URL?.trim() || "showcase-feed.json";
      try {
        const res = await fetch(feedUrl, {
          cache: "no-store",
          headers: { Accept: "application/json, text/plain, */*" },
        });
        if (!res.ok) return;
        const json = (await res.json()) as {
          youtube?: unknown;
          tiktok?: unknown;
        };
        if (cancelled) return;
        setFeed({
          youtube: normalizeFeedVideos(json.youtube, "youtube"),
          tiktok: normalizeFeedVideos(json.tiktok, "tiktok"),
        });
      } catch {
        if (!cancelled) setFeed({ youtube: [], tiktok: [] });
      }
    }

    loadFeed();
    return () => {
      cancelled = true;
    };
  }, []);

  const ambientVideoId = useMemo(() => {
    const pinned = feed.youtube.find((v) => v.id === AMBIENT_YOUTUBE_VIDEO_ID)?.id;
    return pinned ?? AMBIENT_YOUTUBE_VIDEO_ID;
  }, [feed.youtube]);

  return (
    <div className="site-root relative min-h-screen">
      {ambientVideoId ? (
        <AmbientYouTubeBackground videoId={ambientVideoId} />
      ) : null}

      <div className="site-layer relative z-10">
        <header className="sticky top-0 z-20 border-b border-black/[0.045] bg-canvas/80 backdrop-blur-2xl backdrop-saturate-150">
          <div className="mx-auto flex max-w-[84rem] items-center justify-between gap-8 px-5 py-4 sm:px-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[17px] font-semibold tracking-[-0.022em] text-ink transition-opacity duration-180 hover:opacity-70"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- static exported site logo from /public */}
              <img
                src={publicAsset("/fallow-favicon-32.png")}
                alt=""
                aria-hidden
                className="h-[1em] w-[1em] rounded-[3px] object-contain"
                width={17}
                height={17}
                loading="eager"
                decoding="async"
              />
              <span>Chris - Fallow FPV</span>
            </Link>
            <nav className="flex flex-wrap items-center justify-end gap-x-8 gap-y-2 text-[15px] font-medium tracking-[-0.012em] text-ink-muted">
              <a
                className="transition-opacity duration-180 hover:opacity-70"
                href="#contact"
              >
                Contact
              </a>
              {social.map((s) => (
                <a
                  key={s.href}
                  className="transition-opacity duration-180 hover:opacity-70"
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {s.label}
                </a>
              ))}
            </nav>
          </div>
        </header>

        <main>
          <section className="mx-auto max-w-[84rem] px-5 pb-14 pt-16 sm:px-10 sm:pt-24 sm:pb-20">
            <div className="mx-auto max-w-[44rem] text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink-faint">
                Professional Drone and FPV Pilot · United Kingdom
              </p>
              <h1 className="mt-5 text-[2.35rem] font-semibold leading-[1.07] tracking-[-0.036em] text-ink sm:text-[3.4rem] sm:leading-[1.04]">
                Aerial vision, simply shown.
              </h1>
              <p className="mx-auto mt-6 max-w-[36rem] text-[19px] font-normal leading-[1.55] tracking-[-0.015em] text-ink-muted sm:text-[21px]">
                FPV and drone filming for events, venues, brands, and private clients — CAA certified.
              </p>
            </div>
          </section>

          <div className="mx-auto max-w-[84rem] px-5 pb-20 sm:px-10">
            <VideoShowcase youtube={feed.youtube} tiktok={feed.tiktok} />
          </div>

          <ContactForm />
        </main>

        <footer className="mt-8 border-t border-black/[0.045] bg-canvas/65 backdrop-blur-md">
          <div className="mx-auto flex max-w-[84rem] flex-col gap-4 px-5 py-12 text-[14px] tracking-[-0.006em] text-ink-faint sm:flex-row sm:items-center sm:justify-between sm:px-10">
            <span>© {new Date().getFullYear()} Fallow FPV</span>
            <span className="tabular-nums-date sm:text-right">Drone pilot, UK</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
