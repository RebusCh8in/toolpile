import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Age Calculator - Free Online Tool",
  description: "Calculate your exact age in years, months, days, hours, and minutes. See your zodiac sign, birth day, and days until next birthday.",
  alternates: {
    canonical: "https://toolpile.app/tools/age-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
