import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invoice Generator - Free Online Tool",
  description: "Create professional invoices for free. No signup, no watermark. Print or save as PDF directly from your browser.",
  alternates: {
    canonical: "https://toolpile.app/tools/invoice-generator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
