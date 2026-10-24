import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Income Tax Calculator - Free Online Tool",
  description: "Estimate your federal income tax using 2026 brackets. See marginal and effective rates with a bracket-by-bracket breakdown.",
  alternates: {
    canonical: "https://toolpile.app/tools/income-tax-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
