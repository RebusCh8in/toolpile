import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paycheck Calculator - Free Online Tool",
  description: "Estimate your take-home pay per paycheck. Includes federal tax, FICA, state tax, and 401k contributions.",
  alternates: {
    canonical: "https://toolpile.app/tools/paycheck-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
