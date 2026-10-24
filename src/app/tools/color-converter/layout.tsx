import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Color Converter - Free Online Tool",
  description: "Convert colors between HEX, RGB, HSL, HSV, and CMYK. Enter any format and get all others instantly.",
  alternates: {
    canonical: "https://toolpile.app/tools/color-converter",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
