import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refinance Calculator - Free Online Tool",
  description: "Compare your current mortgage with a refinanced loan. Calculate monthly savings, total interest saved, break-even point, and view a side-by-side amortization comparison to decide if refinancing is right for you.",
  alternates: {
    canonical: "https://toolpile.app/tools/refinance-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
