import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Heart Rate Zone Calculator - Free Online Tool",
  description: "Calculate your five heart rate training zones. Uses Karvonen or percentage-of-max methods.",
  alternates: {
    canonical: "https://toolpile.app/tools/heart-rate-zone-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
