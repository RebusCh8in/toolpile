import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Percentage Calculator - Free Online Tool",
  description: "Calculate percentages instantly. Find what percent of a number, percentage change, increase, decrease, and more.",
  alternates: {
    canonical: "https://toolpile.app/tools/percentage-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
