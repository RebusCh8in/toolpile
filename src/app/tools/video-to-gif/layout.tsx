import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video to GIF Converter - Free Online Tool",
  description: "Convert any video to an animated GIF. Trim, resize, adjust frame rate. No upload, runs entirely in your browser.",
  alternates: {
    canonical: "https://toolpile.app/tools/video-to-gif",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
