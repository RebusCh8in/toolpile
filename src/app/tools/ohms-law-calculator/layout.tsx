import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ohm's Law Calculator - Free Online Tool",
  description: "Calculate voltage, current, resistance, and power using Ohm's Law. Enter any two values to find the other two instantly. Includes unit converter, series/parallel resistance calculator, and AWG wire reference.",
  alternates: {
    canonical: "https://toolpile.app/tools/ohms-law-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
