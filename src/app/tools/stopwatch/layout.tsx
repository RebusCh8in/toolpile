import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stopwatch - Free Online Tool",
  description: "Free online stopwatch with lap times. Accurate to centiseconds with start, stop, lap, and reset controls.",
  alternates: {
    canonical: "https://toolpile.app/tools/stopwatch",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
