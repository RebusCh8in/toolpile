import type { Metadata } from "next";

const CONVERSIONS: Record<string, { from: string; to: string }> = {
  "jpg-to-png": { from: "JPG", to: "PNG" },
  "png-to-jpg": { from: "PNG", to: "JPG" },
  "webp-to-png": { from: "WebP", to: "PNG" },
  "webp-to-jpg": { from: "WebP", to: "JPG" },
  "png-to-webp": { from: "PNG", to: "WebP" },
  "jpg-to-webp": { from: "JPG", to: "WebP" },
  "svg-to-png": { from: "SVG", to: "PNG" },
  "svg-to-jpg": { from: "SVG", to: "JPG" },
  "bmp-to-png": { from: "BMP", to: "PNG" },
  "bmp-to-jpg": { from: "BMP", to: "JPG" },
  "gif-to-png": { from: "GIF", to: "PNG" },
  "gif-to-jpg": { from: "GIF", to: "JPG" },
  "png-to-ico": { from: "PNG", to: "ICO" },
  "jpg-to-bmp": { from: "JPG", to: "BMP" },
  "heic-to-jpg": { from: "HEIC", to: "JPG" },
  "heic-to-png": { from: "HEIC", to: "PNG" },
  "tiff-to-jpg": { from: "TIFF", to: "JPG" },
  "tiff-to-png": { from: "TIFF", to: "PNG" },
  "webp-to-gif": { from: "WebP", to: "GIF" },
  "png-to-gif": { from: "PNG", to: "GIF" },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const conv = CONVERSIONS[slug];
  if (!conv) {
    return { title: "Image Converter - Free Online Tool" };
  }
  return {
    title: `Convert ${conv.from} to ${conv.to} - Free Online Converter`,
    description: `Convert ${conv.from} to ${conv.to} online for free. No upload to any server — runs entirely in your browser. Fast, private, and no signup required.`,
    alternates: {
      canonical: `https://toolpile.app/tools/convert/${slug}`,
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
