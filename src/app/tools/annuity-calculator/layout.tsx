import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Annuity Calculator - Free Online Tool",
  description: "Calculate annuity growth during accumulation or income payouts during distribution. Compare fixed vs variable annuities and see the tax-deferred growth advantage.",
  alternates: {
    canonical: "https://toolpile.app/tools/annuity-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
