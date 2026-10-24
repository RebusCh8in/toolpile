import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Protein Calculator - Free Online Tool",
  description: "Calculate your daily protein needs based on weight, fitness goal, and activity level.",
  alternates: {
    canonical: "https://toolpile.app/tools/protein-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
