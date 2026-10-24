import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Credit Card Payoff Calculator - Free Online Tool",
  description: "Calculate how long to pay off your credit card or what monthly payment hits your target date. See total interest cost.",
  alternates: {
    canonical: "https://toolpile.app/tools/credit-card-payoff-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
