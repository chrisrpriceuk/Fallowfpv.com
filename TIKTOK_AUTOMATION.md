# TikTok Automation (No Paid RSS)

This project now supports fully automated TikTok updates without paid third-party RSS services.

## How it works

1. A GitHub Action (`.github/workflows/update-tiktok-feed.yml`) runs every 4 hours.
2. It uses `yt-dlp` to fetch latest videos from `@fallowfpv`.
3. It writes `data/tiktok-feed.json` and commits changes.
4. The site reads `data/tiktok-feed.json` first, so new TikToks appear automatically.

## One-time setup

1. Push this project to GitHub.
2. In GitHub repository settings:
   - Enable **Actions**
   - Allow workflow permissions to **Read and write** repository contents
3. Run workflow once manually: **Actions -> Update TikTok Feed -> Run workflow**.

## Optional customization

- Change username by editing workflow env:
  - `TIKTOK_USERNAME`
- Change number of videos fetched:
  - `TIKTOK_MAX_ITEMS`

## Notes

- If TikTok blocks extraction temporarily, the app still falls back to configured IDs/oEmbed.
- You can still set `TIKTOK_RSS_URL` if you want to use an RSS source as secondary fallback.
