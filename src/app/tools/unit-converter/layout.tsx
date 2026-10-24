import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unit Converter - Free Online Tool",
  description: "Convert between length, weight, temperature, data, and time units instantly.",
  alternates: {
    canonical: "https://toolpile.app/tools/unit-converter",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
