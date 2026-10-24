import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Countdown Timer - Free Online Tool",
  description: "Free online countdown timer with preset durations. Set hours, minutes, seconds and start counting down.",
  alternates: {
    canonical: "https://toolpile.app/tools/countdown-timer",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
