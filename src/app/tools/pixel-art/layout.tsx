import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pixel Art Converter - Free Online Tool",
  description: "Convert any image to pixel art. Adjustable pixel size and color palette. Download at full resolution. Free and private.",
  alternates: {
    canonical: "https://toolpile.app/tools/pixel-art",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
