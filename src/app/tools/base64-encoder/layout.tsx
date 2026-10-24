import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Base64 Encoder / Decoder - Free Online Tool",
  description: "Encode and decode text and files to and from Base64. Supports drag-and-drop file upload.",
  alternates: {
    canonical: "https://toolpile.app/tools/base64-encoder",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
