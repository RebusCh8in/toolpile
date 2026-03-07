import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Digital Signature Creator - Free Online Tool",
  description: "Create a digital signature by drawing, typing, or uploading. Download as PNG or SVG. Free, no signup, 100% private.",
  alternates: {
    canonical: "https://toolpile.app/tools/digital-signature",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
