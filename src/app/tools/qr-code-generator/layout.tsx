import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR Code Generator - Free Online Tool",
  description: "Generate customizable QR codes from any text or URL. Adjust size, colors, and error correction level.",
  alternates: {
    canonical: "https://toolpile.app/tools/qr-code-generator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
