import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Water Intake Calculator - Free Online Tool",
  description: "Calculate how much water you should drink daily based on weight, activity level, and climate.",
  alternates: {
    canonical: "https://toolpile.app/tools/water-intake-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
