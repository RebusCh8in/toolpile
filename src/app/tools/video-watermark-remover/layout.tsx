import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video Watermark Remover - Free Online Tool",
  description: "Remove watermarks from any video for free. Smart Remove and Blur modes. No upload, no signup, runs entirely in your browser.",
  alternates: {
    canonical: "https://toolpile.app/tools/video-watermark-remover",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
