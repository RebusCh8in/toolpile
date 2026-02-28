import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

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
    default: "ToolPile - Free Developer & Design Tools | No Signup Required",
    template: "%s | ToolPile",
  },
  description:
    "17 free browser-based tools for developers and designers. QR codes, watermark removal, JSON formatting, password generation, color palettes, and more. No signup, no data stored.",
  keywords: [
    "free online tools",
    "developer tools",
    "design tools",
    "QR code generator",
    "watermark remover",
    "JSON formatter",
    "password generator",
    "color palette generator",
    "base64 encoder",
    "regex tester",
    "no signup tools",
  ],
  openGraph: {
    title: "ToolPile - Free Developer & Design Tools",
    description: "17 free browser-based tools. No signup, no data stored. Everything runs locally.",
    type: "website",
    url: "https://toolpile.app",
    siteName: "ToolPile",
  },
  twitter: {
    card: "summary_large_image",
    title: "ToolPile - Free Developer & Design Tools",
    description: "17 free browser-based tools. No signup required.",
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
      <head>
        {/*
          Google AdSense — uncomment and replace ca-pub-XXXXXXX with your publisher ID after approval:
          <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXX" crossOrigin="anonymous"></script>
        */}
      </head>
      <body className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 antialiased">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />

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
              description: "Free developer and design tools. No signup required.",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://toolpile.app/?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
