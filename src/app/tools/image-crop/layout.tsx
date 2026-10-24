import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Crop Tool - Free Online Tool",
  description: "Crop images to any size or aspect ratio. Presets for Instagram, YouTube, Facebook, Twitter, and LinkedIn. Free, private, no upload.",
  alternates: {
    canonical: "https://toolpile.app/tools/image-crop",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
