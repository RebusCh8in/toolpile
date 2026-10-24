import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BMR Calculator - Free Online Tool",
  description: "Calculate your Basal Metabolic Rate — calories your body burns at rest. Three formulas with activity level multipliers.",
  alternates: {
    canonical: "https://toolpile.app/tools/bmr-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
