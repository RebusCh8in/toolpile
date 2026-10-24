import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calorie Calculator - Free Online Tool",
  description: "Calculate your daily calorie needs based on age, sex, height, weight, and activity level. Uses the Mifflin-St Jeor equation.",
  alternates: {
    canonical: "https://toolpile.app/tools/calorie-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
