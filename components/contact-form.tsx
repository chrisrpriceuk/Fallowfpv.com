"use client";

import { useState } from "react";
import { normalizeContactPayload, type ContactFormPayload } from "@/lib/contact";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm({
  variant = "inline",
}: {
  variant?: "inline" | "modal";
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL?.trim() || "";
  const isModal = variant === "modal";

  return (
    <section
      id={isModal ? undefined : "contact"}
      className={
        isModal
          ? "w-full"
          : "mx-auto max-w-[84rem] px-5 pb-16 sm:px-10 sm:pb-20"
      }
    >
      <div className="grid gap-8 rounded-[1.75rem] border border-ink/10 bg-canvas/75 p-5 shadow-card backdrop-blur-2xl sm:p-10 lg:grid-cols-2 lg:gap-12">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
            Contact
          </p>
          <h2 className="mt-3 text-[2rem] font-semibold leading-[1.08] tracking-[-0.03em] text-ink sm:text-[2.4rem]">
            Start your next aerial project
          </h2>
          <p className="mt-5 max-w-[32rem] text-[17px] leading-[1.55] text-ink-muted">
            Share a few details and I will get back to you.
          </p>
          <div className="mt-6 space-y-2">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
              Need ideas?
            </p>
            <ul className="space-y-1.5 text-[13px] leading-[1.3] text-ink-muted">
              <li className="rounded-md border border-ink/10 bg-canvas-subtle/70 px-2 py-1.5">
                Venue fly-throughs for websites and social media
              </li>
              <li className="rounded-md border border-ink/10 bg-canvas-subtle/70 px-2 py-1.5">
                Event highlight reels (festivals, weddings, launches)
              </li>
              <li className="rounded-md border border-ink/10 bg-canvas-subtle/70 px-2 py-1.5">
                Cinematic FPV tours of homes, hospitality, and gyms
              </li>
              <li className="rounded-md border border-ink/10 bg-canvas-subtle/70 px-2 py-1.5">
                Branded drone clips for ads, campaigns, and promos
              </li>
              <li className="rounded-md border border-ink/10 bg-canvas-subtle/70 px-2 py-1.5">
                Action footage for sport, automotive, and outdoor content
              </li>
              <li className="rounded-md border border-ink/10 bg-canvas-subtle/70 px-2 py-1.5">
                Aerial photography for listings, press, and print
              </li>
            </ul>
          </div>
        </div>

        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setStatus("submitting");
            setError("");

            const form = e.currentTarget;
            const fd = new FormData(form);
            const payload = normalizeContactPayload({
              name: fd.get("name"),
              email: fd.get("email"),
              project: fd.get("project"),
              date: fd.get("date"),
              message: fd.get("message"),
              company: fd.get("company"),
            } as Partial<ContactFormPayload>);

            if (!webhookUrl) {
              setStatus("error");
              setError("Contact endpoint is not configured yet.");
              return;
            }

            try {
              const res = await fetch(webhookUrl, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  source: "fallow-fpv-site",
                  submittedAt: new Date().toISOString(),
                  contact: payload,
                  meta: {
                    userAgent: navigator.userAgent,
                    referer: document.referrer,
                  },
                }),
                mode: "cors",
              });
              if (!res.ok) {
                setStatus("error");
                setError("Could not send your message.");
                return;
              }

              form.reset();
              setStatus("success");
            } catch {
              setStatus("error");
              setError("Could not send your message.");
            }
          }}
        >
          {/* Honeypot field (hidden from real users). */}
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-ink-muted">
                Name
              </span>
              <input
                required
                name="name"
                autoComplete="name"
                className="block w-full min-w-0 rounded-xl border border-ink/10 bg-canvas/85 px-4 py-3 text-[15px] text-ink outline-none transition placeholder:text-ink-faint focus:border-ink/25 focus:ring-2 focus:ring-ink/10"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-ink-muted">
                Email
              </span>
              <input
                required
                type="email"
                name="email"
                autoComplete="email"
                className="block w-full min-w-0 rounded-xl border border-ink/10 bg-canvas/85 px-4 py-3 text-[15px] text-ink outline-none transition placeholder:text-ink-faint focus:border-ink/25 focus:ring-2 focus:ring-ink/10"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink-muted">
              Project type
            </span>
            <input
              name="project"
              placeholder="Commercial shoot, event coverage, etc."
              className="block w-full min-w-0 rounded-xl border border-ink/10 bg-canvas/85 px-4 py-3 text-[15px] text-ink outline-none transition placeholder:text-ink-faint focus:border-ink/25 focus:ring-2 focus:ring-ink/10"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink-muted">
              Preferred date
            </span>
            <input
              type="date"
              name="date"
              className="block w-full min-w-0 max-w-full rounded-xl border border-ink/10 bg-canvas/85 px-4 py-3 text-[15px] text-ink outline-none transition placeholder:text-ink-faint focus:border-ink/25 focus:ring-2 focus:ring-ink/10"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink-muted">
              Message
            </span>
            <textarea
              required
              name="message"
              rows={5}
              className="block w-full min-w-0 resize-y rounded-xl border border-ink/10 bg-canvas/85 px-4 py-3 text-[15px] leading-relaxed text-ink outline-none transition placeholder:text-ink-faint focus:border-ink/25 focus:ring-2 focus:ring-ink/10"
              placeholder="Tell me about location, timeline, and what you need filmed."
            />
          </label>

          <div className="flex flex-wrap items-center justify-end gap-4 pt-1">
            <button
              type="submit"
              disabled={status === "submitting"}
              className="rounded-full bg-ink px-5 py-2.5 text-[14px] font-semibold text-canvas transition hover:opacity-85"
            >
              {status === "submitting" ? "Sending..." : "Bring your vision to life"}
            </button>
            {status === "success" ? (
              <p className="text-[14px] text-ink-muted">
                Thanks - your message has been sent.
              </p>
            ) : null}
            {status === "error" ? (
              <p className="text-[14px] text-red-700">{error}</p>
            ) : null}
          </div>
        </form>
      </div>
    </section>
  );
}
