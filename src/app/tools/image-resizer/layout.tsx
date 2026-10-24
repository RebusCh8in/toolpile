import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Resizer - Free Online Tool",
  description: "Resize images online for free. Preset sizes for Instagram, YouTube, Facebook, Twitter, and more. No upload — runs in your browser.",
  alternates: {
    canonical: "https://toolpile.app/tools/image-resizer",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
