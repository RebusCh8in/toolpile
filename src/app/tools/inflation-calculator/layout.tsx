import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inflation Calculator - Free Online Tool",
  description: "Calculate how inflation affects purchasing power over time. See what your money will be worth in the future or what past prices equal today.",
  alternates: {
    canonical: "https://toolpile.app/tools/inflation-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
