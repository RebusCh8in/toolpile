import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sleep Calculator - Free Online Tool",
  description: "Calculate the best times to sleep and wake up based on 90-minute sleep cycles. Wake up refreshed, not groggy.",
  alternates: {
    canonical: "https://toolpile.app/tools/sleep-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
