import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Child Support Calculator by State (2026) | Toolpile",
  description:
    "Free child support calculator for all 50 states. Estimate monthly payments based on income, custody split, and your state's guidelines. Income shares, percentage of income, and California formulas.",
  alternates: { canonical: "https://toolpile.app/tools/child-support-calculator" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
