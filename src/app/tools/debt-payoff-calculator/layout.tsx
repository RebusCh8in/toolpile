import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Debt Payoff Calculator - Free Online Tool",
  description: "See how long it takes to pay off debt and how much interest you'll pay. Compare with extra payments to save money.",
  alternates: {
    canonical: "https://toolpile.app/tools/debt-payoff-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
