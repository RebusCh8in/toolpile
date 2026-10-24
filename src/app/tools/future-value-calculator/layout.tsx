import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Future Value Calculator - Free Online Tool",
  description: "Calculate the future value of investments with lump sums, regular contributions, or both. Compare ordinary annuities vs annuity due, adjust for inflation, and visualize year-by-year growth.",
  alternates: {
    canonical: "https://toolpile.app/tools/future-value-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
