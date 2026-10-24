import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Savings Calculator - Free Online Tool",
  description: "Calculate how your savings will grow over time with regular deposits and compound interest. See year-by-year breakdown.",
  alternates: {
    canonical: "https://toolpile.app/tools/savings-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
