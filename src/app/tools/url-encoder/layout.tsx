import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "URL Encoder / Decoder - Free Online Tool",
  description: "Encode and decode URLs online for free. Supports both encodeURI and encodeURIComponent modes. No upload — runs in your browser.",
  alternates: {
    canonical: "https://toolpile.app/tools/url-encoder",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
