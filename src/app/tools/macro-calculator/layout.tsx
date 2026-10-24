import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Macro Calculator - Free Online Tool",
  description: "Calculate your daily protein, carb, and fat targets based on your TDEE and fitness goals. Multiple diet splits available.",
  alternates: {
    canonical: "https://toolpile.app/tools/macro-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
