import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compound Interest Calculator - Free Online Tool",
  description: "Calculate how your money grows with compound interest. See the power of compounding with regular contributions over time.",
  alternates: {
    canonical: "https://toolpile.app/tools/compound-interest-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
