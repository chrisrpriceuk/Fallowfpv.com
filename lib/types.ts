export type VideoPlatform = "youtube" | "tiktok";

export type ShowcaseVideo = {
  platform: VideoPlatform;
  id: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
  watchUrl: string;
};

export function videoKey(v: ShowcaseVideo): string {
  return `${v.platform}:${v.id}`;
}
