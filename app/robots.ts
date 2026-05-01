import type { MetadataRoute } from "next";

const siteUrl = "https://www.fallowfpv.com";
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: "www.fallowfpv.com",
  };
}
