import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discount Calculator - Free Online Tool",
  description: "Calculate the final price after discount. Supports double discounts, sales tax, and shows total savings.",
  alternates: {
    canonical: "https://toolpile.app/tools/discount-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
