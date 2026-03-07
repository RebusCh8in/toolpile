import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Screen Recorder - Free Online Tool",
  description: "Record your screen, webcam, or browser tab with audio. No watermark, no upload, no time limit. Runs in your browser.",
  alternates: {
    canonical: "https://toolpile.app/tools/screen-recorder",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
