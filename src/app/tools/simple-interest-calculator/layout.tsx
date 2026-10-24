import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simple Interest Calculator - Free Online Tool",
  description: "Calculate simple interest on a principal amount. See total interest, monthly interest, and compare with compound interest.",
  alternates: {
    canonical: "https://toolpile.app/tools/simple-interest-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
