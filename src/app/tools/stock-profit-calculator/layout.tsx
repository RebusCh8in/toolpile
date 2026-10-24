import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stock Profit Calculator - Free Online Tool",
  description: "Calculate stock trading profit or loss. Enter buy/sell prices and shares to see total return, ROI, and break-even price.",
  alternates: {
    canonical: "https://toolpile.app/tools/stock-profit-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
