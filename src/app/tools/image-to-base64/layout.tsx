import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image to Base64 Converter - Free Online Tool",
  description: "Convert images to Base64 encoding for embedding in HTML, CSS, or JSON. Free, no upload — runs in your browser.",
  alternates: {
    canonical: "https://toolpile.app/tools/image-to-base64",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
