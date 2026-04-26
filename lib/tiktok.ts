import { XMLParser } from "fast-xml-parser";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { abortSignalAfter } from "@/lib/abort-signal-after";
import type { ShowcaseVideo } from "@/lib/types";
import {
  DEFAULT_TIKTOK_GENERATED_JSON_URL,
  DEFAULT_TIKTOK_FALLBACK_VIDEO_IDS,
  TIKTOK_HANDLE,
} from "@/lib/site";

const DEFAULT_USERNAME = TIKTOK_HANDLE;

function getTikTokUsername(): string {
  const u = process.env.TIKTOK_USERNAME?.trim();
  return u?.replace(/^@/, "") || DEFAULT_USERNAME;
}

function getRssUrl(): string | null {
  const disabled =
    process.env.TIKTOK_DISABLE === "1" ||
    process.env.TIKTOK_DISABLE === "true";
  if (disabled) return null;

  const u =
    process.env.TIKTOK_RSS_URL?.trim() ||
    process.env.TIKTOK_RSS?.trim() ||
    process.env.TIKTOK_FEED_URL?.trim();
  return u && u.length > 0 ? u : null;
}

function getManualVideoIds(): string[] {
  const raw = process.env.TIKTOK_VIDEO_IDS?.trim();
  if (!raw) return [...DEFAULT_TIKTOK_FALLBACK_VIDEO_IDS];
  return raw
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter((s) => /^\d+$/.test(s));
}

async function fetchTikTokFromGeneratedFile(): Promise<ShowcaseVideo[]> {
  const dataPath = resolve(process.cwd(), "data", "tiktok-feed.json");
  try {
    const raw = await readFile(dataPath, "utf8");
    const parsed = JSON.parse(raw) as {
      videos?: Array<Partial<ShowcaseVideo>>;
    };
    const videos = Array.isArray(parsed.videos) ? parsed.videos : [];
    return dedupeById(
      videos
        .map((v) => ({
          platform: "tiktok" as const,
          id: String(v.id || "").trim(),
          title: String(v.title || "TikTok").trim(),
          publishedAt: String(v.publishedAt || "").trim(),
          thumbnailUrl: String(v.thumbnailUrl || "").trim(),
          watchUrl: String(v.watchUrl || "").trim(),
        }))
        .filter((v) => v.id.length > 0 && v.watchUrl.length > 0)
    );
  } catch {
    return [];
  }
}

function getGeneratedJsonUrl(): string {
  return (
    process.env.TIKTOK_GENERATED_JSON_URL?.trim() ||
    DEFAULT_TIKTOK_GENERATED_JSON_URL
  );
}

async function fetchTikTokFromGeneratedUrl(): Promise<ShowcaseVideo[]> {
  const url = getGeneratedJsonUrl();
  if (!url) return [];
  try {
    const res = await fetch(url, {
      next: { revalidate: 1800 },
      headers: { Accept: "application/json, text/plain, */*" },
      signal: abortSignalAfter(15_000),
    });
    if (!res.ok) return [];
    const parsed = (await res.json()) as {
      videos?: Array<Partial<ShowcaseVideo>>;
    };
    const videos = Array.isArray(parsed.videos) ? parsed.videos : [];
    return dedupeById(
      videos
        .map((v) => ({
          platform: "tiktok" as const,
          id: String(v.id || "").trim(),
          title: String(v.title || "TikTok").trim(),
          publishedAt: String(v.publishedAt || "").trim(),
          thumbnailUrl: String(v.thumbnailUrl || "").trim(),
          watchUrl: String(v.watchUrl || "").trim(),
        }))
        .filter((v) => v.id.length > 0 && v.watchUrl.length > 0)
    );
  } catch {
    return [];
  }
}

function videoIdFromTikTokUrl(link: string): string | null {
  const m = link.match(/\/video\/(\d+)/);
  return m?.[1] ?? null;
}

/** RSS dates can be malformed; `Invalid Date` throws on `.toISOString()`. */
function rssDateToIso(pub: string): string {
  const s = String(pub ?? "").trim();
  if (!s) return "";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

function normalizeRssItems(raw: unknown): Record<string, unknown>[] {
  if (!raw) return [];
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [raw as Record<string, unknown>];
}

function rssItemLinkHref(item: Record<string, unknown>): string {
  const linkRaw = item.link;
  if (typeof linkRaw === "string") return linkRaw;
  if (linkRaw && typeof linkRaw === "object" && !Array.isArray(linkRaw) && "@_href" in linkRaw) {
    return String((linkRaw as { "@_href": string })["@_href"]);
  }
  if (Array.isArray(linkRaw)) {
    for (const l of linkRaw) {
      if (l && typeof l === "object" && "@_href" in l) {
        const rel = (l as { "@_rel"?: string })["@_rel"];
        if (rel === "alternate" || rel === undefined) {
          return String((l as { "@_href": string })["@_href"]);
        }
      }
    }
    const first = linkRaw[0];
    if (first && typeof first === "object" && "@_href" in first) {
      return String((first as { "@_href": string })["@_href"]);
    }
  }
  return "";
}

function textContent(
  v: unknown
): string {
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && "#text" in v) {
    return String((v as { "#text": string })["#text"]);
  }
  return "";
}

function thumbFromHtmlDescription(html: string): string | undefined {
  const m = html.match(/<img[^>]+src\s*=\s*["']([^"']+)["']/i);
  return m?.[1]?.replace(/&amp;/g, "&");
}

function pickThumbFromItem(item: Record<string, unknown>): string | undefined {
  type MediaRef = {
    "@_url"?: string;
    "@_width"?: string;
    "@_medium"?: string;
    "@_type"?: string;
  };
  const thumbs = item["media:thumbnail"] as MediaRef | MediaRef[] | undefined;
  if (Array.isArray(thumbs) && thumbs.length > 0) {
    const best = thumbs.reduce((a, b) =>
      Number(b["@_width"] ?? 0) > Number(a["@_width"] ?? 0) ? b : a
    );
    if (best["@_url"]) return best["@_url"];
  }
  if (thumbs && !Array.isArray(thumbs) && thumbs["@_url"]) return thumbs["@_url"];

  const contents = item["media:content"] as MediaRef | MediaRef[] | undefined;
  const contentList = Array.isArray(contents)
    ? contents
    : contents
      ? [contents]
      : [];
  const imageContent = contentList.find((c) => {
    const url = c["@_url"] ?? "";
    const type = (c["@_type"] ?? "").toLowerCase();
    const medium = c["@_medium"];
    if (type.startsWith("video/")) return false;
    if (medium === "image") return true;
    if (/\.(jpe?g|png|webp|gif)(\?|$)/i.test(url)) return true;
    if (medium === undefined && url && !/\/video\//i.test(url)) return true;
    return false;
  });
  if (imageContent?.["@_url"]) return imageContent["@_url"];

  const enc = item.enclosure as { "@_url"?: string } | undefined;
  if (enc?.["@_url"]) return enc["@_url"];

  const descRaw =
    item.description ?? item["content:encoded"] ?? item["content"] ?? "";
  const descStr =
    typeof descRaw === "string"
      ? descRaw
      : descRaw && typeof descRaw === "object" && "#text" in descRaw
        ? String((descRaw as { "#text": string })["#text"])
        : "";
  if (descStr.includes("<img")) {
    const fromHtml = thumbFromHtmlDescription(descStr);
    if (fromHtml) return fromHtml;
  }
  return undefined;
}

async function fetchTikTokFromRss(rssUrl: string): Promise<ShowcaseVideo[]> {
  const res = await fetch(rssUrl, {
    next: { revalidate: 1800 },
    headers: { Accept: "application/rss+xml, application/xml, application/atom+xml, text/xml, */*" },
    signal: abortSignalAfter(15_000),
  });
  if (!res.ok) {
    throw new Error(`TikTok RSS error: ${res.status}`);
  }
  const xml = await res.text();
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    isArray: (name) =>
      name === "item" ||
      name === "entry" ||
      name === "media:content" ||
      name === "media:thumbnail",
  });
  const doc = parser.parse(xml) as Record<string, unknown>;
  const rss = doc.rss as { channel?: { item?: unknown } } | undefined;
  const feed = doc.feed as { entry?: unknown } | undefined;
  const items = rss?.channel?.item
    ? normalizeRssItems(rss.channel.item)
    : feed?.entry
      ? normalizeRssItems(feed.entry)
      : [];

  const username = getTikTokUsername();
  const out: ShowcaseVideo[] = [];

  for (const item of items) {
    const link = rssItemLinkHref(item);
    if (!link.includes("tiktok.com")) continue;

    const id = videoIdFromTikTokUrl(link);
    if (!id) continue;

    const title = textContent(item.title) || "TikTok";
    const pub =
      String(item.pubDate ?? item.published ?? item.updated ?? "") || "";
    const thumb = pickThumbFromItem(item) ?? "";

    out.push({
      platform: "tiktok",
      id,
      title,
      publishedAt: rssDateToIso(pub),
      thumbnailUrl: thumb || "",
      watchUrl: link.startsWith("http")
        ? link
        : `https://www.tiktok.com/@${username}/video/${id}`,
    });
  }

  return dedupeById(out);
}

type OEmbedResponse = {
  title?: string;
  thumbnail_url?: string;
  author_name?: string;
};

async function enrichWithOembed(v: ShowcaseVideo): Promise<ShowcaseVideo> {
  try {
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(v.watchUrl)}`;
    const res = await fetch(oembedUrl, {
      next: { revalidate: 3600 },
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (compatible; FallowFPV/1.0; +https://fallowfpv.com)",
      },
      signal: abortSignalAfter(6_000),
    });
    if (!res.ok) return v;
    const data = (await res.json()) as OEmbedResponse;
    return {
      ...v,
      title: typeof data.title === "string" && data.title ? data.title : v.title,
      thumbnailUrl:
        typeof data.thumbnail_url === "string" && data.thumbnail_url
          ? data.thumbnail_url
          : v.thumbnailUrl,
    };
  } catch {
    return v;
  }
}

/**
 * RSS often omits cover art; fill from oEmbed with a hard cap so serverless
 * (e.g. Vercel ~10s) does not 500 when many tiles are missing.
 */
async function enrichMissingThumbnails(videos: ShowcaseVideo[]): Promise<ShowcaseVideo[]> {
  const MAX_OEMBED = 20;
  let spent = 0;
  const result: ShowcaseVideo[] = [];
  for (const v of videos) {
    if (v.thumbnailUrl?.trim()) {
      result.push(v);
      continue;
    }
    if (spent >= MAX_OEMBED) {
      result.push(v);
      continue;
    }
    spent += 1;
    result.push(await enrichWithOembed(v));
  }
  return result;
}

async function fetchTikTokFromManualIds(ids: string[]): Promise<ShowcaseVideo[]> {
  const username = getTikTokUsername();
  const base: ShowcaseVideo[] = ids.map((id) => ({
    platform: "tiktok",
    id,
    title: "TikTok",
    publishedAt: "",
    thumbnailUrl: "",
    watchUrl: `https://www.tiktok.com/@${username}/video/${id}`,
  }));

  const enriched = await enrichMissingThumbnails(base);
  return dedupeById(enriched);
}

function dedupeById(videos: ShowcaseVideo[]): ShowcaseVideo[] {
  const seen = new Set<string>();
  return videos.filter((v) => {
    if (seen.has(v.id)) return false;
    seen.add(v.id);
    return true;
  });
}

/** Strip broken placeholder thumbs so the UI can show a neutral tile. */
function cleanThumbnails(videos: ShowcaseVideo[]): ShowcaseVideo[] {
  return videos.map((v) => {
    if (v.platform !== "tiktok") return v;
    if (!v.thumbnailUrl || v.thumbnailUrl.includes("placeholder")) {
      return { ...v, thumbnailUrl: "" };
    }
    return v;
  });
}

/**
 * TikTok list sources (in order):
 * 1) data/tiktok-feed.json (generated by scheduled workflow, preferred)
 * 2) Optional RSS feed via TIKTOK_RSS_URL / TIKTOK_RSS / TIKTOK_FEED_URL
 * 3) Fallback IDs (env TIKTOK_VIDEO_IDS or built-in defaults) + oEmbed
 */
export async function fetchTikTokVideos(): Promise<ShowcaseVideo[]> {
  try {
    const fromRemote = await fetchTikTokFromGeneratedUrl();
    if (fromRemote.length > 0) {
      const withThumbs = await enrichMissingThumbnails(fromRemote);
      return cleanThumbnails(withThumbs);
    }

    const fromFile = await fetchTikTokFromGeneratedFile();
    if (fromFile.length > 0) {
      const withThumbs = await enrichMissingThumbnails(fromFile);
      return cleanThumbnails(withThumbs);
    }

    const rssUrl = getRssUrl();
    if (rssUrl) {
      try {
        const fromRss = await fetchTikTokFromRss(rssUrl);
        const withThumbs = await enrichMissingThumbnails(fromRss);
        if (withThumbs.length > 0) return cleanThumbnails(withThumbs);
      } catch {
        // fall through to manual fallback IDs
      }
    }

    const manual = getManualVideoIds();
    if (manual.length === 0) {
      return [];
    }

    const fromManual = await fetchTikTokFromManualIds(manual);
    return cleanThumbnails(fromManual);
  } catch {
    return [];
  }
}
