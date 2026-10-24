import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Down Payment Calculator - Free Online Tool",
  description: "Calculate your down payment amount and see how it affects your mortgage payment, interest, and PMI requirements.",
  alternates: {
    canonical: "https://toolpile.app/tools/down-payment-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
