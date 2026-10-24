import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ovulation Calculator - Free Online Tool",
  description: "Calculate your estimated ovulation date, fertile window, and next period based on your menstrual cycle. Visualize cycle phases with a color-coded calendar timeline.",
  alternates: {
    canonical: "https://toolpile.app/tools/ovulation-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
