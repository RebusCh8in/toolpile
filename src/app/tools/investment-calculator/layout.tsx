import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Investment Calculator - Free Online Tool",
  description: "Project your investment growth over time with regular contributions. See nominal and inflation-adjusted returns side by side.",
  alternates: {
    canonical: "https://toolpile.app/tools/investment-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
