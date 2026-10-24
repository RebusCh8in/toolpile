import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sales Tax Calculator - Free Online Tool",
  description: "Calculate sales tax on any purchase. Add tax to a price or extract tax from a total. Quick state rate presets included.",
  alternates: {
    canonical: "https://toolpile.app/tools/sales-tax-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
