import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BMI Calculator - Free Online Tool",
  description: "Calculate your Body Mass Index (BMI) using height and weight. Supports imperial and metric units with BMI category classification.",
  alternates: {
    canonical: "https://toolpile.app/tools/bmi-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
