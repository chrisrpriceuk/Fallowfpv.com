#!/usr/bin/env node
import { XMLParser } from "fast-xml-parser";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const YOUTUBE_CHANNEL_ID =
  process.env.YOUTUBE_CHANNEL_ID?.trim() || "UCiGoENRCcmKv6QL-e9FmupA";
const YOUTUBE_FEED_URL =
  process.env.YOUTUBE_FEED_URL?.trim() ||
  `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(YOUTUBE_CHANNEL_ID)}`;
const TIKTOK_JSON_URL =
  process.env.TIKTOK_GENERATED_JSON_URL?.trim() ||
  "https://raw.githubusercontent.com/chrisrpriceuk/feed/main/tiktok-feed.json";
const MAX_ITEMS = Number(process.env.SHOWCASE_MAX_ITEMS || "24");
const OUT_PATH = resolve(process.cwd(), "public", "showcase-feed.json");
const OEMBED_BATCH_LIMIT = Number(process.env.TIKTOK_OEMBED_MAX || "24");

function normalizeArray(v) {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function parseDate(input) {
  const d = new Date(String(input ?? "").trim());
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

function thumbnailExpiresAtEpoch(thumbnailUrl) {
  if (!thumbnailUrl) return 0;
  try {
    const u = new URL(thumbnailUrl);
    const exp = Number(u.searchParams.get("x-expires") || "0");
    return Number.isFinite(exp) ? exp : 0;
  } catch {
    return 0;
  }
}

function isThumbnailLikelyExpiredOrNearExpiry(thumbnailUrl) {
  const expEpoch = thumbnailExpiresAtEpoch(thumbnailUrl);
  if (!expEpoch) return false;
  const nowEpoch = Math.floor(Date.now() / 1000);
  // Refresh if already expired or will expire in under 3 days.
  return expEpoch - nowEpoch < 3 * 24 * 60 * 60;
}

async function enrichTikTokThumbnail(video) {
  try {
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(video.watchUrl)}`;
    const res = await fetch(oembedUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (compatible; FallowFPV/1.0; +https://fallowfpv.com)",
      },
    });
    if (!res.ok) return video;
    const data = await res.json();
    const nextThumb = String(data?.thumbnail_url || "").trim();
    if (!nextThumb) return video;
    return { ...video, thumbnailUrl: nextThumb };
  } catch {
    return video;
  }
}

async function refreshTikTokThumbnails(videos) {
  const out = [];
  let refreshed = 0;
  for (const video of videos) {
    if (
      refreshed < OEMBED_BATCH_LIMIT &&
      (isThumbnailLikelyExpiredOrNearExpiry(video.thumbnailUrl) || !video.thumbnailUrl)
    ) {
      out.push(await enrichTikTokThumbnail(video));
      refreshed += 1;
      continue;
    }
    out.push(video);
  }
  return out;
}

function pickYoutubeThumb(entry, videoId) {
  const group = entry?.["media:group"];
  const thumbs = normalizeArray(group?.["media:thumbnail"]);
  const withUrl = thumbs
    .map((x) => ({ width: Number(x?.["@_width"] || 0), url: String(x?.["@_url"] || "") }))
    .filter((x) => x.url);
  if (withUrl.length > 0) {
    withUrl.sort((a, b) => b.width - a.width);
    return withUrl[0].url;
  }
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "";
}

function getYoutubeWatchUrl(entry, videoId) {
  const links = normalizeArray(entry?.link);
  const alt = links.find((x) => x?.["@_rel"] === "alternate");
  if (typeof alt?.["@_href"] === "string" && alt["@_href"]) return alt["@_href"];
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : "";
}

function getYoutubeId(entry) {
  const direct = entry?.["yt:videoId"] ?? entry?.videoId;
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  const idText = String(entry?.id || "");
  const match = idText.match(/yt:video:([A-Za-z0-9_-]+)/);
  return match?.[1] ?? "";
}

async function fetchYoutubeVideos() {
  try {
    const res = await fetch(YOUTUBE_FEED_URL, {
      headers: { Accept: "application/atom+xml, application/xml, text/xml, */*" },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      isArray: (name) => name === "entry" || name === "media:thumbnail",
    });
    const doc = parser.parse(xml);
    const entries = normalizeArray(doc?.feed?.entry);
    return entries
      .map((entry) => {
        const id = getYoutubeId(entry);
        if (!id) return null;
        const titleRaw = entry?.title;
        const title =
          typeof titleRaw === "string"
            ? titleRaw.trim()
            : String(titleRaw?.["#text"] || "").trim() || "Untitled";
        return {
          platform: "youtube",
          id,
          title,
          publishedAt: parseDate(entry?.published ?? entry?.updated),
          thumbnailUrl: pickYoutubeThumb(entry, id),
          watchUrl: getYoutubeWatchUrl(entry, id),
        };
      })
      .filter(Boolean)
      .slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

async function fetchTiktokVideos() {
  try {
    const remote = await fetch(TIKTOK_JSON_URL, {
      headers: { Accept: "application/json, text/plain, */*" },
    });
    if (remote.ok) {
      const parsed = await remote.json();
      const videos = normalizeArray(parsed?.videos);
      if (videos.length > 0) {
        const normalized = videos
          .map((v) => ({
            platform: "tiktok",
            id: String(v?.id || "").trim(),
            title: String(v?.title || "TikTok").trim() || "TikTok",
            publishedAt: parseDate(v?.publishedAt),
            thumbnailUrl: String(v?.thumbnailUrl || "").trim(),
            watchUrl: String(v?.watchUrl || "").trim(),
          }))
          .filter((v) => v.id && v.watchUrl)
          .slice(0, MAX_ITEMS);
        return refreshTikTokThumbnails(normalized);
      }
    }
  } catch {
    // fallback to local file below
  }

  try {
    const localPath = resolve(process.cwd(), "data", "tiktok-feed.json");
    const raw = await readFile(localPath, "utf8");
    const parsed = JSON.parse(raw);
    const videos = normalizeArray(parsed?.videos);
    const normalized = videos
      .map((v) => ({
        platform: "tiktok",
        id: String(v?.id || "").trim(),
        title: String(v?.title || "TikTok").trim() || "TikTok",
        publishedAt: parseDate(v?.publishedAt),
        thumbnailUrl: String(v?.thumbnailUrl || "").trim(),
        watchUrl: String(v?.watchUrl || "").trim(),
      }))
      .filter((v) => v.id && v.watchUrl)
      .slice(0, MAX_ITEMS);
    return refreshTikTokThumbnails(normalized);
  } catch {
    return [];
  }
}

async function run() {
  const [youtube, tiktok] = await Promise.all([
    fetchYoutubeVideos(),
    fetchTiktokVideos(),
  ]);

  const payload = {
    updatedAt: new Date().toISOString(),
    source: "github-action",
    youtube,
    tiktok,
  };

  await mkdir(dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(payload, null, 2) + "\n", "utf8");
  process.stdout.write(
    `Wrote ${youtube.length} YouTube and ${tiktok.length} TikTok items to ${OUT_PATH}\n`
  );
}

run().catch((err) => {
  process.stderr.write(String(err?.stack || err) + "\n");
  process.exit(1);
});
