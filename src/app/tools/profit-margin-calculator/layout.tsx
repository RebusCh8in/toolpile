import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profit Margin Calculator - Free Online Tool",
  description: "Calculate profit margin, markup percentage, and profit from cost and revenue. Switch between margin, markup, and revenue modes.",
  alternates: {
    canonical: "https://toolpile.app/tools/profit-margin-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
