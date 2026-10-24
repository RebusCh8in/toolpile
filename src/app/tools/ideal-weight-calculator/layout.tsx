import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ideal Weight Calculator - Free Online Tool",
  description: "Calculate your ideal body weight using four scientific formulas. Adjusted for frame size.",
  alternates: {
    canonical: "https://toolpile.app/tools/ideal-weight-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
