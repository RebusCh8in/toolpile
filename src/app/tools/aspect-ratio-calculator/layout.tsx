import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aspect Ratio Calculator - Free Online Tool",
  description: "Calculate and visualize aspect ratios. Lock a ratio and auto-calculate dimensions.",
  alternates: {
    canonical: "https://toolpile.app/tools/aspect-ratio-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
