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

const A2COFC_BADGE_HREF = "https://uavhub.com/";
const A2COFC_BADGE_ASSET = "/a2cofc-badge.png";
const FALLOW_BRAND_LOGO_ASSET = "/fallowfpv-brand-logo.png";

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
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

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

  useEffect(() => {
    if (!isContactModalOpen && !isArticleModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsContactModalOpen(false);
        setIsArticleModalOpen(false);
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isContactModalOpen, isArticleModalOpen]);

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
              <button
                type="button"
                className="transition-opacity duration-180 hover:opacity-70"
                onClick={() => setIsContactModalOpen(true)}
              >
                Contact
              </button>
              <button
                type="button"
                className="transition-opacity duration-180 hover:opacity-70"
                onClick={() => setIsArticleModalOpen(true)}
              >
                Behind the Name
              </button>
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
                Aerial vision, simply shown
              </h1>
              <p className="mx-auto mt-6 max-w-[36rem] text-[19px] font-normal leading-[1.55] tracking-[-0.015em] text-ink-muted sm:text-[21px]">
                FPV and drone filming for events, venues, brands, and private clients — CAA certified
              </p>
            </div>
          </section>

          <div className="mx-auto max-w-[84rem] px-5 pb-20 sm:px-10">
            <VideoShowcase youtube={feed.youtube} tiktok={feed.tiktok} />
          </div>

          <ContactForm />
        </main>

        {isContactModalOpen ? (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label="Contact form"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/40 backdrop-blur-[3px] transition-colors duration-180 hover:bg-black/45"
              onClick={() => setIsContactModalOpen(false)}
              aria-label="Close contact form"
            />
            <div className="relative z-10 w-full max-w-[min(100%,980px)]">
              <button
                type="button"
                onClick={() => setIsContactModalOpen(false)}
                className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-[18px] leading-none text-white backdrop-blur-md transition-colors duration-180 hover:bg-black/30"
                aria-label="Close"
              >
                ×
              </button>
              <ContactForm variant="modal" />
            </div>
          </div>
        ) : null}

        {isArticleModalOpen ? (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label="FPV pilot names article"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/40 backdrop-blur-[3px] transition-colors duration-180 hover:bg-black/45"
              onClick={() => setIsArticleModalOpen(false)}
              aria-label="Close article"
            />
            <div className="relative z-10 max-h-[92vh] w-full max-w-[min(100%,980px)] overflow-auto rounded-[1.35rem] border border-white/40 bg-canvas/95 p-7 shadow-lift backdrop-blur-xl sm:p-10">
              <button
                type="button"
                onClick={() => setIsArticleModalOpen(false)}
                className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-[18px] leading-none text-white backdrop-blur-md transition-colors duration-180 hover:bg-black/30"
                aria-label="Close"
              >
                ×
              </button>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
                Behind the Name
              </p>
              <h2 className="mt-3 max-w-[50rem] text-[1.85rem] font-semibold leading-[1.12] tracking-[-0.03em] text-ink sm:text-[2.25rem]">
                The Impact of FPV Pilot Names: Meet Fallow FPV and Others
              </h2>

              <div className="mt-6 space-y-4 text-[16px] leading-[1.65] text-ink-muted">
                <p>
                  Fallow FPV is a pilot name. An FPV (First-Person View) pilot
                  name is often a unique nickname or handle that a person uses
                  when flying FPV drones. These names are usually chosen by the
                  pilots themselves and can reflect their personality, interests,
                  or flying style.
                </p>
                <p>
                  They are commonly used in the FPV drone community for
                  identification in races, online forums, social media, and
                  video channels.
                </p>
              </div>

              <div className="mt-6 grid items-center gap-5 rounded-2xl border border-black/[0.06] bg-white/55 p-5 sm:grid-cols-2 sm:p-6">
                <div>
                  <p className="text-[14px] font-medium text-ink">
                    Examples of FPV pilot names:
                  </p>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[15px] leading-[1.45] text-ink-muted">
                    <li>Johnny FPV</li>
                    <li>Mr. Steele</li>
                    <li>Le Drib</li>
                    <li>Charpu</li>
                    <li>Fallow FPV</li>
                  </ul>
                </div>
                <div className="flex items-center justify-start pl-2 sm:pl-4">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local logo shown in article modal */}
                  <img
                    src={publicAsset(FALLOW_BRAND_LOGO_ASSET)}
                    alt="Fallow FPV logo"
                    className="h-[176px] w-[176px] object-contain"
                    width={176}
                    height={176}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4 text-[16px] leading-[1.65] text-ink-muted">
                <p>
                  These names become the pilot&apos;s identity within the FPV
                  community, much like gamer tags in the gaming community.
                </p>
                <p>
                  Who is Fallow FPV? Chris stands as the pilot behind Fallow
                  FPV. This chosen pilot name, &quot;Fallow FPV,&quot; pays homage
                  to the graceful Fallow Deer, a creature that has long
                  captivated Chris with its majestic presence. His aspiration is
                  for his flights to mirror the elegance of these creatures.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mx-auto flex max-w-[84rem] items-end justify-center gap-6 px-5 pb-4 sm:px-10">
          {/* eslint-disable-next-line @next/next/no-img-element -- local brand logo image */}
          <img
            src={publicAsset(FALLOW_BRAND_LOGO_ASSET)}
            alt="Fallow FPV logo"
            className="h-[176px] w-[176px] object-contain"
            width={176}
            height={176}
            loading="lazy"
            decoding="async"
          />
          <a
            href={A2COFC_BADGE_HREF}
            target="_blank"
            rel="noreferrer noopener"
            className="transition-opacity duration-180 hover:opacity-80"
            aria-label="View A2 CofC certificate badge"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- local certification badge image */}
            <img
              src={publicAsset(A2COFC_BADGE_ASSET)}
              alt="A2 CofC certified remote pilot badge"
              className="h-[156px] w-[156px] rounded-full object-cover ring-1 ring-black/[0.12]"
              width={156}
              height={156}
              loading="lazy"
              decoding="async"
            />
          </a>
        </div>

        <footer className="mt-2 border-t border-black/[0.045] bg-canvas/65 backdrop-blur-md">
          <div className="mx-auto flex max-w-[84rem] flex-col items-center gap-4 px-5 py-12 text-[14px] tracking-[-0.006em] text-ink-faint sm:flex-row sm:justify-between sm:px-10">
            <span>© {new Date().getFullYear()} Fallow FPV</span>
            <span className="tabular-nums-date sm:text-right">
              Professional Drone and FPV Pilot · United Kingdom
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
