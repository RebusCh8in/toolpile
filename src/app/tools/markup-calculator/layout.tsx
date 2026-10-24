import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Markup Calculator - Free Online Tool",
  description: "Calculate markup percentage, selling price, cost, and profit margin. Compare markup vs margin, use batch mode for multiple products, and reference common markup-to-margin conversions.",
  alternates: {
    canonical: "https://toolpile.app/tools/markup-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
