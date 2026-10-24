import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commission Calculator - Free Online Tool",
  description: "Calculate sales commission earnings with flat rate, tiered/graduated, or base salary + commission structures. Project monthly and annual income from your sales volume.",
  alternates: {
    canonical: "https://toolpile.app/tools/commission-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
