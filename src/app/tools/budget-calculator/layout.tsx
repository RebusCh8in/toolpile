import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Budget Calculator - Free Online Tool",
  description: "Plan your monthly budget with income and expense categories. See where your money goes and compare with the 50/30/20 rule.",
  alternates: {
    canonical: "https://toolpile.app/tools/budget-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
