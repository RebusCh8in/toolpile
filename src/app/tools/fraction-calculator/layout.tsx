import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fraction Calculator - Free Online Tool",
  description: "Add, subtract, multiply, and divide fractions. Simplify fractions and convert between decimals and fractions.",
  alternates: {
    canonical: "https://toolpile.app/tools/fraction-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
