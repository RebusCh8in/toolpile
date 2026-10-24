import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Number Base Converter - Free Online Tool",
  description: "Convert numbers between decimal, binary, octal, and hexadecimal. Instant conversion with copy buttons.",
  alternates: {
    canonical: "https://toolpile.app/tools/binary-converter",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
