import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video Watermark Remover - Free Online Tool",
  description: "Remove watermarks from video for free with automatic on-device repair. No upload, no signup, runs entirely in your browser.",
  alternates: {
    canonical: "https://toolpile.app/tools/video-watermark-remover",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
