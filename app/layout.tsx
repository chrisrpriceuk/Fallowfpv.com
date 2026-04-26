import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Fallow FPV — Drone pilot, UK",
  description:
    "FPV drone pilot and aerial filmmaker. Watch the latest flights and get in touch for commercial work.",
  openGraph: {
    title: "Fallow FPV",
    description: "FPV drone pilot and aerial filmmaker — UK.",
    url: "https://fallowfpv.com",
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
        {children}
      </body>
    </html>
  );
}
