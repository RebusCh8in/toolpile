import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "One Rep Max (1RM) Calculator - Free Online Tool",
  description: "Calculate your estimated one rep max from any weight and rep count. Uses four proven formulas.",
  alternates: {
    canonical: "https://toolpile.app/tools/one-rep-max-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
