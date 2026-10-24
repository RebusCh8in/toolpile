import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Calculator - Free Online Tool",
  description: "Calculate monthly loan payments for any amount, interest rate, and term. See total interest and total cost.",
  alternates: {
    canonical: "https://toolpile.app/tools/payment-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
