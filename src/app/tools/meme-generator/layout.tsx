import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meme Generator - Free Online Tool",
  description: "Create memes with custom text, fonts, and colors. No watermark, no signup, runs entirely in your browser.",
  alternates: {
    canonical: "https://toolpile.app/tools/meme-generator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
