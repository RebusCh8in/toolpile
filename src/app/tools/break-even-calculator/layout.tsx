import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Break Even Calculator - Free Online Tool",
  description: "Calculate the break-even point for your business. See how many units you need to sell to cover fixed and variable costs.",
  alternates: {
    canonical: "https://toolpile.app/tools/break-even-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
