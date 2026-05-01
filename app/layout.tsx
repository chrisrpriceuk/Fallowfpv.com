import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600"],
});

const publicBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() || "";
const publicAsset = (path: string) => `${publicBasePath}${path}`;

export const metadata: Metadata = {
  title: "Fallow FPV — Drone pilot, UK",
  description:
    "FPV drone pilot and aerial filmmaker. Watch the latest flights and get in touch for commercial work.",
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
    title: "Fallow FPV",
    description: "FPV drone pilot and aerial filmmaker — UK.",
    url: "https://www.fallowfpv.com",
    siteName: "Fallow FPV",
    locale: "en_GB",
    type: "website",
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
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
