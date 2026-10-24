import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Amortization Calculator - Free Online Tool",
  description: "Generate a full amortization schedule showing principal and interest breakdown for each payment. See how extra payments save money.",
  alternates: {
    canonical: "https://toolpile.app/tools/amortization-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
