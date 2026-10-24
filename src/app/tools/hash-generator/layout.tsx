import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hash Generator - Free Online Tool",
  description: "Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes instantly. Uses native Web Crypto API. Free and private.",
  alternates: {
    canonical: "https://toolpile.app/tools/hash-generator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
