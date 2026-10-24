import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rent vs Buy Calculator - Free Online Tool",
  description: "Compare the true cost of renting versus buying a home. See break-even points, equity buildup, net worth projections, and cumulative costs over time with interactive charts.",
  alternates: {
    canonical: "https://toolpile.app/tools/rent-vs-buy-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
