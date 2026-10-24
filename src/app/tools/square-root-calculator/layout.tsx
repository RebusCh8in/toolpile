import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Square Root Calculator - Free Online Tool",
  description: "Calculate square roots, cube roots, and nth roots. Shows simplified radical form and perfect square check.",
  alternates: {
    canonical: "https://toolpile.app/tools/square-root-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
