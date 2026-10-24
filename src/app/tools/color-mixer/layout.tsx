import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Color Mixer - Free Online Tool",
  description: "Mix two colors together at any ratio. Generate smooth color gradients with adjustable steps.",
  alternates: {
    canonical: "https://toolpile.app/tools/color-mixer",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
