import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loan Calculator - Free Online Tool",
  description: "Calculate monthly loan payments, total interest, and see a full payment schedule for any loan amount, rate, and term.",
  alternates: {
    canonical: "https://toolpile.app/tools/loan-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
