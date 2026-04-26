import type { ShowcaseVideo } from "@/lib/types";
import { fetchChannelVideos } from "@/lib/youtube";
import { fetchTikTokVideos } from "@/lib/tiktok";

function sortNewestFirst(videos: ShowcaseVideo[]): ShowcaseVideo[] {
  return videos
    .map((video, index) => ({ video, index }))
    .sort((a, b) => {
      const ta = a.video.publishedAt ? Date.parse(a.video.publishedAt) : NaN;
      const tb = b.video.publishedAt ? Date.parse(b.video.publishedAt) : NaN;
      const aHasDate = Number.isFinite(ta);
      const bHasDate = Number.isFinite(tb);

      if (aHasDate && bHasDate) {
        if (tb > ta) return -1;
        if (tb < ta) return 1;
        return a.index - b.index;
      }
      if (aHasDate && !bHasDate) return -1;
      if (!aHasDate && bHasDate) return 1;

      // Keep original order when dates are missing/equal (important for fallback TikTok IDs).
      return a.index - b.index;
    })
    .map((x) => x.video);
}

export async function fetchAllShowcaseVideos(): Promise<{
  channelTitle: string;
  youtube: ShowcaseVideo[];
  tiktok: ShowcaseVideo[];
}> {
  try {
    let channelTitle = "Fallow FPV";
    let youtubeVideos: ShowcaseVideo[] = [];

    try {
      const yt = await fetchChannelVideos();
      channelTitle = yt.channelTitle;
      youtubeVideos = yt.videos.map((v) => ({
        platform: "youtube" as const,
        ...v,
      }));
    } catch {
      // Feed fetch can fail on deploy (network, timeout, parse). Keep page up.
    }

    let tiktokVideos: ShowcaseVideo[] = [];
    try {
      tiktokVideos = await fetchTikTokVideos();
    } catch {
      tiktokVideos = [];
    }

    try {
      return {
        channelTitle,
        youtube: sortNewestFirst(youtubeVideos),
        tiktok: sortNewestFirst(tiktokVideos),
      };
    } catch {
      return { channelTitle, youtube: [], tiktok: [] };
    }
  } catch {
    return { channelTitle: "Fallow FPV", youtube: [], tiktok: [] };
  }
}
