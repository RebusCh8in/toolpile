import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video Compressor - Free Online Tool",
  description: "Compress video files for free in your browser. Reduce MP4, WebM, and MOV file size with adjustable quality. No upload, no signup — powered by FFmpeg WebAssembly.",
  alternates: { canonical: "https://toolpile.app/tools/video-compressor" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
