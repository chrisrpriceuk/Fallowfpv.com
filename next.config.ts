import type { NextConfig } from "next";
import { existsSync } from "node:fs";

const isGitHubActions = process.env.GITHUB_ACTIONS === "true";
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isUserSite = repoName.toLowerCase().endsWith(".github.io");
const hasCustomDomain = existsSync("public/CNAME");
const basePath =
  isGitHubActions && repoName && !isUserSite && !hasCustomDomain
    ? `/${repoName}`
    : "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/**" },
      { protocol: "https", hostname: "i1.ytimg.com", pathname: "/**" },
      { protocol: "https", hostname: "i2.ytimg.com", pathname: "/**" },
      { protocol: "https", hostname: "i3.ytimg.com", pathname: "/**" },
      { protocol: "https", hostname: "i4.ytimg.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
