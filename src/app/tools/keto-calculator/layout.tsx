import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Keto Calculator - Free Online Tool",
  description: "Calculate your keto macros — fat, protein, and net carbs for a ketogenic diet.",
  alternates: {
    canonical: "https://toolpile.app/tools/keto-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
