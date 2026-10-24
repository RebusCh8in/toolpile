import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tile Calculator - Free Online Tool",
  description: "Calculate how many tiles you need for your floor, wall, or backsplash project. Includes grout spacing, waste percentage, layout patterns, cost estimates, and a visual pattern preview.",
  alternates: {
    canonical: "https://toolpile.app/tools/tile-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
