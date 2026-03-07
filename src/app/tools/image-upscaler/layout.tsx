import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Upscaler - Free Online Tool",
  description: "Upscale and enlarge images for free. 2x and 4x scaling with smooth, sharp, and pixel art modes. No upload, no signup — runs in your browser.",
  alternates: { canonical: "https://toolpile.app/tools/image-upscaler" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
