import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Debt-to-Income Ratio Calculator - Free Online Tool",
  description: "Calculate your front-end and back-end DTI ratios. See where you stand for mortgage qualification, and find out how much debt to reduce to hit your target ratio.",
  alternates: {
    canonical: "https://toolpile.app/tools/debt-to-income-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
