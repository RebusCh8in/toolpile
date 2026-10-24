import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VAT Calculator - Free Online Tool",
  description: "Calculate Value Added Tax (VAT). Add VAT to a net price or extract VAT from a gross price. Country rate presets included.",
  alternates: {
    canonical: "https://toolpile.app/tools/vat-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
