import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paint Calculator - Free Online Tool",
  description: "Calculate exactly how much paint you need for your project. Enter room dimensions or wall area, subtract doors and windows, and get accurate gallon estimates with cost breakdowns.",
  alternates: {
    canonical: "https://toolpile.app/tools/paint-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
