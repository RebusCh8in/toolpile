import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "401(k) Calculator - Free Online Tool",
  description: "Calculate how much your 401(k) will be worth at retirement. Includes employer match, annual contributions, and investment growth.",
  alternates: {
    canonical: "https://toolpile.app/tools/401k-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
