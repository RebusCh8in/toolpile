import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Walking Calorie Calculator - Free Online Tool",
  description: "Calculate how many calories you burn walking based on your weight, speed, duration, distance, and incline. Uses MET-based formulas for accurate estimates.",
  alternates: {
    canonical: "https://toolpile.app/tools/walking-calorie-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
