import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favicon Generator - Free Online Tool",
  description: "Generate favicons from text, emoji, or image. All standard sizes included. Free, no upload — runs in your browser.",
  alternates: {
    canonical: "https://toolpile.app/tools/favicon-generator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
