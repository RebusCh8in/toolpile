import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mortgage Calculator - Free Online Tool",
  description: "Calculate your monthly mortgage payment, total interest, and see a full amortization schedule. Includes property tax, insurance, and PMI.",
  alternates: {
    canonical: "https://toolpile.app/tools/mortgage-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
