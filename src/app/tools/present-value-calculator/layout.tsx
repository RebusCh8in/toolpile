import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Present Value Calculator - Free Online Tool",
  description: "Calculate the present value of a future sum, annuity, or growing annuity. Understand how much future money is worth today using time value of money principles.",
  alternates: {
    canonical: "https://toolpile.app/tools/present-value-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
