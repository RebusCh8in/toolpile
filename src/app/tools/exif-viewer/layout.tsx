import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EXIF Data Viewer - Free Online Tool",
  description: "View photo metadata including camera settings, date, GPS location, and device info. 100% private — runs in your browser.",
  alternates: {
    canonical: "https://toolpile.app/tools/exif-viewer",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
