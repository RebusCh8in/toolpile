import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EMI Calculator - Free Online Tool",
  description: "Calculate your Equated Monthly Installment (EMI) for home loans, car loans, or personal loans. View amortization schedules, compare loan offers, and see how prepayments reduce your interest burden.",
  alternates: {
    canonical: "https://toolpile.app/tools/emi-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
