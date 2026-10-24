import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overtime Calculator - Free Online Tool",
  description: "Calculate overtime pay, total weekly earnings, and annual projections. Includes daily hour breakdown, pay period options, and a comparison table for different overtime levels.",
  alternates: {
    canonical: "https://toolpile.app/tools/overtime-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
