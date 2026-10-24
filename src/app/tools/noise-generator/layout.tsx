import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Noise Texture Generator - Free Online Tool",
  description: "Generate seamless noise and grain textures for web backgrounds. Customize density, opacity, color, and size. Download PNG or copy CSS.",
  alternates: {
    canonical: "https://toolpile.app/tools/noise-generator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
