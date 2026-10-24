import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pace Calculator - Free Online Tool",
  description: "Calculate running pace, finish time, or distance. Supports miles and kilometers with race distance presets.",
  alternates: {
    canonical: "https://toolpile.app/tools/pace-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
