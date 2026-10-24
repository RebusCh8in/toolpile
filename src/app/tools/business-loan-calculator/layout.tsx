import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business Loan Calculator - Estimate Payments & Compare Loans (2026)",
  description: "Calculate business loan payments, total interest, and compare SBA, term, and line of credit options. See amortization schedule and true cost of borrowing.",
  alternates: {
    canonical: "https://toolpile.app/tools/business-loan-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
