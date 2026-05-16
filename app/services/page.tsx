"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Legacy /services URLs (bookmarks, old links) redirect home.
 * Services content lives in the home page modal, like “Behind the Name”.
 */
export default function ServicesLegacyRedirect() {
  const router = useRouter();

  useEffect(() => {
    // One-shot redirect only. `useRouter()`'s identity can change between renders; listing
    // `router` in deps can re-fire this effect repeatedly and cause a navigation + flash loop.
    router.replace("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: run once on mount
  }, []);

  return (
    <p className="p-8 text-center text-[15px] text-ink-muted">Returning to home…</p>
  );
}
