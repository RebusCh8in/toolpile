import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Net Worth Calculator - Free Online Tool",
  description: "Calculate your net worth by adding up assets and subtracting liabilities. Track your financial health.",
  alternates: {
    canonical: "https://toolpile.app/tools/net-worth-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
