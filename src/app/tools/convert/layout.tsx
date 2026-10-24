import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Format Converter - Free Online Tool",
  description: "Convert between 20+ image formats instantly in your browser. Free, no upload, no signup. JPG, PNG, WebP, SVG, HEIC, GIF, BMP, TIFF, ICO and more.",
  alternates: {
    canonical: "https://toolpile.app/tools/convert",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
