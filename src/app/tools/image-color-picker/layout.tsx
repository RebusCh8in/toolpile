import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Color Picker - Free Online Tool",
  description: "Upload an image and click anywhere to pick colors. View hex, RGB, and HSL values.",
  alternates: {
    canonical: "https://toolpile.app/tools/image-color-picker",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
