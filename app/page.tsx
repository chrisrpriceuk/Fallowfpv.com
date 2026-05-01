"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AmbientYouTubeBackground } from "@/components/ambient-youtube-background";
import { ContactForm } from "@/components/contact-form";
import { VideoShowcase } from "@/components/video-showcase";
import { trackEvent } from "@/lib/analytics";
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
  const [isFeedLoading, setIsFeedLoading] = useState(true);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

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
      } finally {
        if (!cancelled) setIsFeedLoading(false);
      }
    }

    loadFeed();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setIsDarkMode(localStorage.getItem("fallow-theme") === "dark");
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

  const toggleTheme = () => {
    setIsDarkMode((current) => {
      const next = !current;
      localStorage.setItem("fallow-theme", next ? "dark" : "light");
      trackEvent("theme_toggle", { mode: next ? "dark" : "light" });
      return next;
    });
  };

  return (
    <div className={`site-root relative min-h-screen ${isDarkMode ? "theme-dark" : ""}`}>
      {ambientVideoId ? (
        <AmbientYouTubeBackground videoId={ambientVideoId} isDark={isDarkMode} />
      ) : null}

      <div className="site-layer relative z-10">
        <header className="sticky top-0 z-20 border-b border-ink/10 bg-canvas/80 backdrop-blur-2xl backdrop-saturate-150">
          <div className="mx-auto flex max-w-[84rem] flex-col gap-3 px-5 py-4 xl:flex-row xl:items-end xl:justify-between xl:gap-8 sm:px-10">
            <Link
              href="/"
              className="inline-flex items-end justify-center gap-3 whitespace-nowrap text-[26px] font-semibold tracking-[-0.04em] text-ink transition-opacity duration-180 hover:opacity-70 sm:text-[30px] lg:text-[34px] xl:justify-start"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- static exported site logo from /public */}
              <img
                src={publicAsset(FALLOW_BRAND_LOGO_ASSET)}
                alt=""
                aria-hidden
                className="h-[68px] w-[68px] rounded-[8px] object-contain"
                width={68}
                height={68}
                loading="eager"
                decoding="async"
              />
              <span className="pb-1 leading-none">Chris - Fallow FPV</span>
            </Link>
            <nav className="grid grid-cols-2 items-center gap-x-5 gap-y-2 text-center text-[14px] font-medium tracking-[-0.012em] text-ink-muted sm:grid-cols-3 sm:text-[15px] xl:flex xl:flex-wrap xl:justify-end xl:gap-x-8">
              <button
                type="button"
                className="transition-opacity duration-180 hover:opacity-70"
                onClick={() => {
                  trackEvent("open_contact_modal", { source: "header" });
                  setIsContactModalOpen(true);
                }}
              >
                Contact
              </button>
              <button
                type="button"
                className="transition-opacity duration-180 hover:opacity-70"
                onClick={() => {
                  trackEvent("open_behind_the_name_modal", { source: "header" });
                  setIsArticleModalOpen(true);
                }}
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
                  onClick={() =>
                    trackEvent("social_link_click", {
                      platform: s.label.toLowerCase(),
                      location: "header",
                    })
                  }
                >
                  {s.label}
                </a>
              ))}
              <button
                type="button"
                className="relative mx-auto inline-flex h-8 w-[5.25rem] items-center rounded-full border border-ink/10 bg-canvas/75 p-1 text-[11px] font-semibold text-ink shadow-soft transition duration-180 hover:bg-canvas-subtle xl:mx-0"
                onClick={toggleTheme}
                aria-pressed={isDarkMode}
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                <span
                  className={`absolute left-2.5 z-10 transition-colors duration-180 ${
                    isDarkMode ? "text-ink-muted" : "text-canvas"
                  }`}
                >
                  Light
                </span>
                <span
                  className={`absolute right-2.5 z-10 transition-colors duration-180 ${
                    isDarkMode ? "text-canvas" : "text-ink-muted"
                  }`}
                >
                  Dark
                </span>
                <span
                  aria-hidden
                  className={`relative z-0 h-6 w-[2.35rem] rounded-full bg-ink transition-transform duration-180 ${
                    isDarkMode ? "translate-x-[2.15rem]" : "translate-x-0"
                  }`}
                />
              </button>
            </nav>
          </div>
        </header>

        <main>
          <section className="mx-auto max-w-[84rem] px-5 pb-8 pt-16 sm:px-10 sm:pt-24 sm:pb-10">
            <div className="mx-auto max-w-[44rem] text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink-faint">
                Professional Drone and FPV Pilot · United Kingdom
              </p>
              <h1 className="mt-5 text-[2.35rem] font-semibold leading-[1.07] tracking-[-0.036em] text-ink sm:text-[3.4rem] sm:leading-[1.04]">
                Aerial vision, simply shown
              </h1>
              <p className="mx-auto mt-6 max-w-[36rem] text-[19px] font-normal leading-[1.55] tracking-[-0.015em] text-ink-muted sm:text-[21px]">
                FPV and drone filming for events, venues, brands,{" "}
                <span className="whitespace-nowrap">
                  and private clients — CAA certified
                </span>
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    trackEvent("open_contact_modal", { source: "hero_cta" });
                    setIsContactModalOpen(true);
                  }}
                  className="rounded-full border border-ink/15 bg-canvas/70 px-5 py-2.5 text-[14px] font-semibold text-ink backdrop-blur-md transition hover:bg-canvas-subtle"
                >
                  Plan a shoot
                </button>
              </div>
            </div>
          </section>

          <div id="work" className="mx-auto max-w-[84rem] px-5 pb-20 sm:px-10">
            <VideoShowcase
              youtube={feed.youtube}
              tiktok={feed.tiktok}
              isLoading={isFeedLoading}
            />
          </div>

          <ContactForm />
        </main>

        {isContactModalOpen ? (
          <div
            className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto p-3 py-5 sm:p-8"
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
            <div className="relative z-10 w-full max-w-[min(100%,980px)] pb-6">
              <button
                type="button"
                onClick={() => setIsContactModalOpen(false)}
                className="sticky left-full top-3 z-[120] -mb-8 mr-3 flex h-8 w-8 -translate-x-3 items-center justify-center rounded-full bg-black/30 text-[18px] leading-none text-white backdrop-blur-md transition-colors duration-180 hover:bg-black/45"
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
            className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto p-3 py-5 sm:p-8"
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
            <div className="relative z-10 w-full max-w-[min(100%,980px)] pb-6">
              <button
                type="button"
                onClick={() => setIsArticleModalOpen(false)}
                className="sticky left-full top-3 z-[120] -mb-8 mr-3 flex h-8 w-8 -translate-x-3 items-center justify-center rounded-full bg-black/30 text-[18px] leading-none text-white backdrop-blur-md transition-colors duration-180 hover:bg-black/45"
                aria-label="Close"
              >
                ×
              </button>
              <div className="rounded-[1.35rem] border border-ink/10 bg-canvas/95 p-7 shadow-lift backdrop-blur-xl sm:p-10">
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

              <div className="mt-6 grid items-center gap-5 rounded-2xl border border-ink/10 bg-canvas-subtle/65 p-5 sm:grid-cols-2 sm:p-6">
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
            onClick={(e) => {
              e.preventDefault();
              trackEvent("outbound_link_click", {
                destination: "uavhub",
                location: "footer_badge",
              });
              window.open(A2COFC_BADGE_HREF, "_blank", "noopener,noreferrer");
            }}
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

        <footer className="mt-2 border-t border-ink/10 bg-canvas/65 backdrop-blur-md">
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
