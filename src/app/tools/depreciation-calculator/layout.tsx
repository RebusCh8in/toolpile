import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Depreciation Calculator - Free Online Tool",
  description: "Calculate asset depreciation using straight-line, double declining balance, sum of years' digits, or units of production methods. View full schedules, compare methods side by side, and visualize book value decline over time.",
  alternates: {
    canonical: "https://toolpile.app/tools/depreciation-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
