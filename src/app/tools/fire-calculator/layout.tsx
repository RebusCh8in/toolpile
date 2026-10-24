import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FIRE Calculator - Free Online Tool",
  description: "Calculate your Financial Independence, Retire Early (FIRE) number. See how long until you can retire based on savings rate and investments.",
  alternates: {
    canonical: "https://toolpile.app/tools/fire-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
