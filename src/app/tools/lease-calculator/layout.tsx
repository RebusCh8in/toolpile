import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Car Lease Calculator - Free Online Tool",
  description: "Calculate your monthly car lease payment, total lease cost, and compare leasing vs buying. Includes money factor to APR conversion, multi-term comparison, and full payment breakdown.",
  alternates: {
    canonical: "https://toolpile.app/tools/lease-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
