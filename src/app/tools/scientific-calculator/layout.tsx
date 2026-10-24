import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scientific Calculator - Free Online Tool",
  description: "Free online scientific calculator with trig, logarithms, powers, memory, and degree/radian modes.",
  alternates: {
    canonical: "https://toolpile.app/tools/scientific-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
