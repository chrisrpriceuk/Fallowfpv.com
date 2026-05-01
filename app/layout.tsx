import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import { FACEBOOK_URL, TIKTOK_PROFILE_URL, YOUTUBE_CHANNEL_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600"],
});

const publicBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() || "";
const publicAsset = (path: string) => `${publicBasePath}${path}`;
const siteUrl = "https://www.fallowfpv.com";
const siteName = "Fallow FPV";
const siteTitle = "Fallow FPV — FPV Drone Pilot and Aerial Filmmaker UK";
const siteDescription =
  "Professional FPV drone pilot and aerial filmmaker based in the United Kingdom. FPV and drone filming for events, venues, brands, and private clients.";
const socialProfiles = [YOUTUBE_CHANNEL_URL, TIKTOK_PROFILE_URL, FACEBOOK_URL];
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: siteName,
  url: siteUrl,
  image: `${siteUrl}/fallow-logo-180.webp`,
  description: siteDescription,
  areaServed: "United Kingdom",
  serviceType: [
    "FPV Drone Filming",
    "Aerial Videography",
    "Drone Photography",
    "Event Filming",
  ],
  sameAs: socialProfiles,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "FPV pilot UK",
    "drone filming UK",
    "aerial videography UK",
    "FPV drone pilot",
    "drone photography UK",
  ],
  alternates: {
    canonical: "/",
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  icons: {
    icon: [
      {
        url: publicAsset("/fallow-favicon-32.png"),
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: publicAsset("/fallow-logo-180.png"),
        type: "image/png",
        sizes: "180x180",
      },
    ],
    apple: [{ url: publicAsset("/fallow-logo-180.png"), sizes: "180x180" }],
    shortcut: [publicAsset("/fallow-favicon-32.png")],
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName,
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: "/fallow-logo-180.webp",
        width: 180,
        height: 180,
        alt: "Fallow FPV logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/fallow-logo-180.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={inter.variable}>
      <body
        className="font-sans font-normal"
        style={{
          /* Fallback if the bundled stylesheet fails to load (stale .next / chunk mismatch). */
          backgroundColor: "#fafafc",
          color: "#1b1b1d",
        }}
      >
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              anonymize_ip: true
            });
          `}
        </Script>
        <Script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token":"d90f7074edf441f18b2955898f6b0d3e"}'
          strategy="lazyOnload"
        />
        <Script
          id="jsonld-organization"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
