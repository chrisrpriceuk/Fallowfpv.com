"use client";

import Link from "next/link";
import { PublicPicture } from "@/components/public-picture";
import { ThemeTogglePill } from "@/components/theme-toggle";
import { trackEvent } from "@/lib/analytics";
import {
  FACEBOOK_URL,
  TIKTOK_PROFILE_URL,
  YOUTUBE_CHANNEL_URL,
} from "@/lib/site";

const FALLOW_BRAND_LOGO_ASSET = "/fallowfpv-brand-logo.png";
const FALLOW_BRAND_LOGO_WEBP = "/fallowfpv-brand-logo.webp";

const social = [
  { label: "YouTube", href: YOUTUBE_CHANNEL_URL },
  { label: "TikTok", href: TIKTOK_PROFILE_URL },
  { label: "Facebook", href: FACEBOOK_URL },
] as const;

const navBtnClass = "transition-opacity duration-180 hover:opacity-70";
const linkClass = "transition-opacity duration-180 hover:opacity-70";

type SiteHeaderProps = {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  contactMode: "modal" | "link";
  onOpenContact?: () => void;
  behindTheNameMode: "modal" | "link";
  onOpenBehindTheName?: () => void;
  onOpenServices?: () => void;
};

export function SiteHeader({
  isDarkMode,
  onToggleTheme,
  contactMode,
  onOpenContact,
  behindTheNameMode,
  onOpenBehindTheName,
  onOpenServices,
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-ink/10 bg-canvas/80 backdrop-blur-2xl backdrop-saturate-150">
      <div className="mx-auto max-w-[84rem] px-5 py-3 sm:px-10 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <Link
            href="/"
            className="flex min-w-0 flex-1 items-center gap-2 text-[22px] font-semibold tracking-[-0.04em] text-ink transition-opacity duration-180 hover:opacity-70 sm:gap-3 sm:text-[30px] lg:text-[34px]"
          >
            <PublicPicture
              webpSrc={FALLOW_BRAND_LOGO_WEBP}
              fallbackSrc={FALLOW_BRAND_LOGO_ASSET}
              alt=""
              ariaHidden
              className="h-11 w-11 shrink-0 rounded-[8px] object-contain sm:h-[68px] sm:w-[68px]"
              width={68}
              height={68}
              loading="eager"
              decoding="async"
            />
            <span className="min-w-0 truncate leading-none">
              Chris - Fallow FPV
            </span>
          </Link>
          <ThemeTogglePill isDarkMode={isDarkMode} onToggle={onToggleTheme} />
        </div>

        <nav className="mt-3 grid grid-cols-2 items-center gap-x-5 gap-y-2 text-center text-[14px] font-medium tracking-[-0.012em] text-ink-muted sm:grid-cols-3 sm:text-[15px] xl:flex xl:flex-wrap xl:justify-end xl:gap-x-8">
          {contactMode === "modal" ? (
            <button
              type="button"
              className={navBtnClass}
              onClick={() => {
                trackEvent("open_contact_modal", { source: "header" });
                onOpenContact?.();
              }}
            >
              Contact
            </button>
          ) : (
            <Link
              href="/#contact"
              className={linkClass}
              onClick={() =>
                trackEvent("nav_contact_link_click", { location: "header" })
              }
            >
              Contact
            </Link>
          )}
          {behindTheNameMode === "modal" ? (
            <button
              type="button"
              className={navBtnClass}
              onClick={() => {
                trackEvent("open_behind_the_name_modal", { source: "header" });
                onOpenBehindTheName?.();
              }}
            >
              Behind the Name
            </button>
          ) : (
            <Link
              href="/"
              className={linkClass}
              onClick={() =>
                trackEvent("nav_behind_the_name_link_click", {
                  location: "header",
                })
              }
            >
              Behind the Name
            </Link>
          )}
          <button
            type="button"
            className={navBtnClass}
            onClick={() => {
              trackEvent("open_services_modal", { source: "header" });
              onOpenServices?.();
            }}
          >
            Services
          </button>
          {social.map((s) => (
            <a
              key={s.href}
              className={linkClass}
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
        </nav>
      </div>
    </header>
  );
}
