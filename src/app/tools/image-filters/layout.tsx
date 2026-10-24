import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Filter Effects - Free Online Tool",
  description: "Apply Instagram-style filters to your photos. Vintage, sepia, noir, and 13 more effects. Free, private, no upload.",
  alternates: {
    canonical: "https://toolpile.app/tools/image-filters",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
