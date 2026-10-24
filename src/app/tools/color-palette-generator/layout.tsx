import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Color Palette Generator - Free Online Tool",
  description: "Generate beautiful 5-color palettes. Lock colors you like, press spacebar to regenerate.",
  alternates: {
    canonical: "https://toolpile.app/tools/color-palette-generator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
