import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weight Loss Calculator - Free Online Tool",
  description: "Calculate how long it will take to reach your goal weight. Get personalized calorie targets, macro breakdowns, and a visual timeline based on your BMR, TDEE, and activity level.",
  alternates: {
    canonical: "https://toolpile.app/tools/weight-loss-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
