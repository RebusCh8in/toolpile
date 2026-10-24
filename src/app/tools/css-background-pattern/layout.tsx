import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSS Background Pattern Generator - Free Online Tool",
  description: "Generate pure CSS background patterns — dots, grids, stripes, checkerboards, and more. No images needed.",
  alternates: {
    canonical: "https://toolpile.app/tools/css-background-pattern",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
