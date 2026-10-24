import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Compressor - Free Online Tool",
  description: "Compress images online for free. Reduce file size by up to 90% with adjustable quality. No upload — everything runs in your browser.",
  alternates: {
    canonical: "https://toolpile.app/tools/image-compressor",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
