import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auto Loan Calculator - Free Online Tool",
  description: "Calculate your monthly car payment with down payment, trade-in, sales tax, and loan term. See total interest and true cost of ownership.",
  alternates: {
    canonical: "https://toolpile.app/tools/auto-loan-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
