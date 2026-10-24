import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dividend Calculator - Free Online Tool",
  description: "Calculate dividend income from your investments. Project growth with reinvestment and monthly contributions over time.",
  alternates: {
    canonical: "https://toolpile.app/tools/dividend-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
