import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Placeholder Image Generator - Free Online Tool",
  description: "Generate custom placeholder images for web development and design mockups. Set any size, color, and text. Download as PNG.",
  alternates: {
    canonical: "https://toolpile.app/tools/placeholder-image",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
