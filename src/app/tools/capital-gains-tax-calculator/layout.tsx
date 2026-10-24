import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Capital Gains Tax Calculator - Free Online Tool",
  description: "Calculate capital gains tax on investments. Compare short-term vs long-term rates based on income and filing status.",
  alternates: {
    canonical: "https://toolpile.app/tools/capital-gains-tax-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
