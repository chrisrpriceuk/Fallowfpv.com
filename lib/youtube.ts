import { XMLParser } from "fast-xml-parser";
import { abortSignalAfter } from "@/lib/abort-signal-after";

export type ChannelVideo = {
  id: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
  watchUrl: string;
};

const DEFAULT_CHANNEL_ID = "UCiGoENRCcmKv6QL-e9FmupA";

function getChannelId(): string {
  return process.env.YOUTUBE_CHANNEL_ID?.trim() || DEFAULT_CHANNEL_ID;
}

/** Full feed URL, or built from `YOUTUBE_CHANNEL_ID` (YouTube’s public Atom feed). */
function getYouTubeFeedUrl(): string {
  const custom =
    process.env.YOUTUBE_RSS_URL?.trim() || process.env.YOUTUBE_FEED_URL?.trim();
  if (custom) return custom;
  const channelId = getChannelId();
  return `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
}

function pickThumbnail(entry: Record<string, unknown>): string | undefined {
  const group = entry["media:group"] as Record<string, unknown> | undefined;
  const thumb = group?.["media:thumbnail"];
  if (Array.isArray(thumb)) {
    const best = thumb.reduce(
      (a: { "@_width"?: string }, b: { "@_width"?: string }) =>
        Number(b["@_width"] ?? 0) > Number(a["@_width"] ?? 0) ? b : a,
      thumb[0] as { "@_url"?: string }
    );
    return best?.["@_url"];
  }
  if (thumb && typeof thumb === "object") {
    return (thumb as { "@_url"?: string })["@_url"];
  }
  return undefined;
}

function getAlternateHref(entry: Record<string, unknown>): string | undefined {
  const raw = entry.link;
  const links = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const alt = links.find(
    (l) => (l as { "@_rel"?: string })["@_rel"] === "alternate"
  ) as { "@_href"?: string } | undefined;
  return alt?.["@_href"];
}

function videoIdFromEntry(entry: Record<string, unknown>): string {
  const direct =
    entry["yt:videoId"] ??
    entry["videoId"] ??
    (entry as { videoId?: string }).videoId;
  if (typeof direct === "string" && direct.length > 0) return direct;

  const idField = String(entry.id ?? "");
  const m = idField.match(/yt:video:([A-Za-z0-9_-]+)/);
  return m?.[1] ?? "";
}

function normalizeEntries(raw: unknown): Record<string, unknown>[] {
  if (!raw) return [];
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [raw as Record<string, unknown>];
}

export async function fetchChannelVideos(): Promise<{
  channelTitle: string;
  videos: ChannelVideo[];
}> {
  const url = getYouTubeFeedUrl();

  const res = await fetch(url, {
    next: { revalidate: 1800 },
    headers: { Accept: "application/atom+xml, application/xml, text/xml" },
    signal: abortSignalAfter(15_000),
  });

  if (!res.ok) {
    throw new Error(`YouTube feed error: ${res.status}`);
  }

  const xml = await res.text();
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    isArray: (name) => name === "entry",
  });

  const doc = parser.parse(xml) as {
    feed?: {
      title?: string;
      entry?: Record<string, unknown> | Record<string, unknown>[];
    };
  };

  const feed = doc.feed;
  const rawTitle = feed?.title;
  const channelTitle =
    typeof rawTitle === "string"
      ? rawTitle
      : typeof rawTitle === "object" && rawTitle !== null && "#text" in rawTitle
        ? String((rawTitle as { "#text": string })["#text"])
        : "Fallow FPV";
  const entries = normalizeEntries(feed?.entry);

  const videos: ChannelVideo[] = entries.map((entry) => {
    const videoId = videoIdFromEntry(entry);
    const rawEntryTitle = entry.title;
    const title =
      typeof rawEntryTitle === "string"
        ? rawEntryTitle
        : typeof rawEntryTitle === "object" &&
            rawEntryTitle !== null &&
            "#text" in rawEntryTitle
          ? String((rawEntryTitle as { "#text": string })["#text"])
          : "Untitled";
    const publishedAt = String(entry.published ?? entry.updated ?? "");
    const alternate = getAlternateHref(entry);
    const watchUrl =
      typeof alternate === "string" && alternate.length > 0
        ? alternate
        : `https://www.youtube.com/watch?v=${videoId}`;

    const thumbnailUrl =
      pickThumbnail(entry) ??
      (videoId
        ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
        : "");

    return {
      id: videoId,
      title,
      publishedAt,
      thumbnailUrl,
      watchUrl,
    };
  }).filter((v) => v.id.length > 0);

  return { channelTitle, videos };
}
