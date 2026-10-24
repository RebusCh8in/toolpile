import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TDEE Calculator - Free Online Tool",
  description: "Calculate your Total Daily Energy Expenditure (TDEE) using multiple formulas. See BMR, maintenance calories, and suggested macro splits.",
  alternates: {
    canonical: "https://toolpile.app/tools/tdee-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
