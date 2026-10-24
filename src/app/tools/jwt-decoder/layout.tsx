import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JWT Decoder - Free Online Tool",
  description: "Decode JSON Web Tokens instantly. View header, payload, and expiration status. Free, no upload — runs in your browser.",
  alternates: {
    canonical: "https://toolpile.app/tools/jwt-decoder",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
