import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Photo Watermark Remover - Free Online Tool",
  description: "Remove watermarks from photos completely free. No signup, no limits. Your image never leaves your browser — all processing happens locally.",
  alternates: {
    canonical: "https://toolpile.app/tools/photo-watermark-remover",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
