import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Period Calculator - Free Online Tool",
  description: "Track and predict your menstrual cycle with our free period calculator. View upcoming periods, fertile windows, and ovulation dates on a visual calendar.",
  alternates: {
    canonical: "https://toolpile.app/tools/period-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
