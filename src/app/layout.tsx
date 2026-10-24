import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import EzoicAds from "@/components/EzoicAds";
import BuyMeCoffee from "@/components/BuyMeCoffee";

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const heading = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const code = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-code",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://toolpile.app"),
  title: {
    default: "ToolPile - Free Online Tools & Calculators | No Signup Required",
    template: "%s | ToolPile",
  },
  description:
    "140+ free browser-based tools and calculators. Finance, health, developer, design, math, and more. No signup, no data stored — everything runs locally.",
  keywords: [
    "free online tools",
    "free calculators",
    "online calculator",
    "developer tools",
    "design tools",
    "finance calculators",
    "health calculators",
    "no signup tools",
    "browser-based tools",
  ],
  openGraph: {
    title: "ToolPile - Free Online Tools & Calculators",
    description: "140+ free browser-based tools and calculators. No signup, no data stored. Everything runs locally.",
    type: "website",
    url: "https://toolpile.app",
    siteName: "ToolPile",
  },
  twitter: {
    card: "summary_large_image",
    title: "ToolPile - Free Online Tools & Calculators",
    description: "140+ free browser-based tools and calculators. No signup required.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://toolpile.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${body.variable} ${heading.variable} ${code.variable}`}>
      <head />
      <body className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 antialiased">
        {/* Ezoic integration — must load before interactive, privacy scripts first */}
        <Script data-cfasync="false" src="https://cmp.gatekeeperconsent.com/min.js" strategy="beforeInteractive" />
        <Script data-cfasync="false" src="https://the.gatekeeperconsent.com/cmp.min.js" strategy="beforeInteractive" />
        <Script src="//www.ezojs.com/ezoic/sa.min.js" strategy="beforeInteractive" />
        <Script id="ezstandalone-init" strategy="beforeInteractive">
          {`window.ezstandalone = window.ezstandalone || {}; ezstandalone.cmd = ezstandalone.cmd || [];`}
        </Script>
        <Script src="//ezoicanalytics.com/analytics.js" strategy="beforeInteractive" />

        {/* Refresh Ezoic ads on client-side route changes (App Router SPA) */}
        <EzoicAds />

        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />

        {/* Analytics — lazyOnload so it never blocks rendering */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-XM8ZLLYBHD" strategy="lazyOnload" />
        <Script id="ga4-init" strategy="lazyOnload">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-XM8ZLLYBHD');`}</Script>

        {/* Organization schema */}
        <Script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "ToolPile",
              url: "https://toolpile.app",
              description: "140+ free online tools and calculators. No signup required.",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://toolpile.app/?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />

        {/* Buy Me a Coffee floating widget (client component handles init timing) */}
        <BuyMeCoffee />
      </body>
    </html>
  );
}
