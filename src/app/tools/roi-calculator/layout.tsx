import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ROI Calculator - Free Online Tool",
  description: "Calculate Return on Investment (ROI) and annualized return from initial investment and final value.",
  alternates: {
    canonical: "https://toolpile.app/tools/roi-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
