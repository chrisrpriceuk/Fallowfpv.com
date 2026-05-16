"use client";

import { trackEvent } from "@/lib/analytics";

const planShootButtonClass =
  "rounded-full border border-ink/15 bg-canvas/70 px-5 py-2.5 text-[14px] font-semibold text-ink backdrop-blur-md transition hover:bg-canvas-subtle";

type Props = {
  onPlanShoot: () => void;
};

export function ServicesModalPanel({ onPlanShoot }: Props) {
  return (
    <div className="rounded-[1.35rem] border border-ink/10 bg-canvas/95 p-7 shadow-lift backdrop-blur-xl sm:p-10">
      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
        Services
      </p>
      <h2 className="mt-3 max-w-[50rem] text-[1.85rem] font-semibold leading-[1.12] tracking-[-0.03em] text-ink sm:text-[2.25rem]">
        Drone and FPV filming for your project
      </h2>

      <div className="mt-6 space-y-4 text-[16px] leading-[1.65] text-ink-muted">
        <p>
          Practical aerial coverage for when you need smooth fly-throughs,
          dynamic FPV, or stable drone photography.
        </p>
      </div>

      <div className="mt-8 space-y-6">
        <section>
          <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
            Venue & property
          </h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-[1.5] text-ink-muted">
            <li>Fly-throughs for websites, social media, and launches</li>
            <li>Cinematic FPV tours of homes, hospitality, gyms, and venues</li>
            <li>Aerial stills for listings, press, and marketing</li>
          </ul>
        </section>
        <section>
          <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
            Events & experiences
          </h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-[1.5] text-ink-muted">
            <li>Highlight reels for festivals, weddings, and corporate events</li>
            <li>Action and immersive angles for sport and outdoor content</li>
          </ul>
        </section>
        <section>
          <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
            Brands & campaigns
          </h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-[1.5] text-ink-muted">
            <li>Short branded clips for ads, promos, and social campaigns</li>
            <li>Coordinated look with your creative team and timelines</li>
          </ul>
        </section>
      </div>

      <div className="mt-8 rounded-2xl border border-ink/10 bg-canvas-subtle/65 p-5 sm:p-6">
        <p className="text-[15px] font-medium text-ink">
          Ready to talk dates, location, and the story you want to capture?
        </p>
        <div className="mt-4">
          <button
            type="button"
            className={planShootButtonClass}
            onClick={() => {
              trackEvent("open_contact_modal", { source: "services_modal" });
              onPlanShoot();
            }}
          >
            Get in touch
          </button>
        </div>
      </div>
    </div>
  );
}
