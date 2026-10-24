import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calorie Burn Calculator - Free Online Tool",
  description: "Calculate how many calories you burn during exercise and daily activities. Select from 30+ activities with MET-based calculations, compare food equivalents, and track multiple activities.",
  alternates: {
    canonical: "https://toolpile.app/tools/calorie-burn-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
