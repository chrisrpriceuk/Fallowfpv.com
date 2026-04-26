# Feed Repo Setup (`chrisrpriceuk/feed`)

This repo should host one file: `tiktok-feed.json` that updates automatically.
Your site already reads this by default from:

`https://raw.githubusercontent.com/chrisrpriceuk/feed/main/tiktok-feed.json`

## 1) Add files to `chrisrpriceuk/feed`

### `scripts/update-tiktok-feed.mjs`

Use the same script from this project:

- `scripts/update-tiktok-feed.mjs`

### `.github/workflows/update-tiktok-feed.yml`

Use the same workflow from this project:

- `.github/workflows/update-tiktok-feed.yml`

## 2) Enable automation in GitHub

In `chrisrpriceuk/feed`:

1. Enable **Actions**
2. In Settings -> Actions -> Workflow permissions, select **Read and write permissions**
3. Run the workflow once manually (`workflow_dispatch`)

After first run, `tiktok-feed.json` should exist in the repo root and keep updating every 4 hours.

## 3) Optional overrides in website

If you ever move feed location, set:

- `TIKTOK_GENERATED_JSON_URL=<new raw json url>`

## Notes

- This avoids paid third-party RSS dependencies.
- If TikTok extraction fails temporarily, site still has fallback IDs.
