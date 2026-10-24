import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Standard Deviation Calculator - Free Online Tool",
  description: "Calculate standard deviation, variance, z-scores, and confidence intervals for any dataset.",
  alternates: {
    canonical: "https://toolpile.app/tools/standard-deviation-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
