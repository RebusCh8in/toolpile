import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calorie Deficit Calculator - Free Online Tool",
  description: "Calculate how many calories to eat for weight loss. Based on your TDEE with adjustable deficit levels.",
  alternates: {
    canonical: "https://toolpile.app/tools/calorie-deficit-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
