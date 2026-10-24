import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CD Calculator - Free Online Tool",
  description: "Calculate Certificate of Deposit earnings, compare CD rates from multiple banks, plan a CD ladder strategy, and estimate early withdrawal penalties. Free and instant.",
  alternates: {
    canonical: "https://toolpile.app/tools/cd-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
