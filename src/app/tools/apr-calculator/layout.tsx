import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "APR Calculator - Free Online Tool",
  description: "Calculate the true Annual Percentage Rate (APR) of a loan including fees. Compare APR vs stated interest rate.",
  alternates: {
    canonical: "https://toolpile.app/tools/apr-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
