import type { MetadataRoute } from "next";

const tools = [
  "video-watermark-remover",
  "photo-watermark-remover",
  "qr-code-generator",
  "color-palette-generator",
  "css-gradient-generator",
  "box-shadow-generator",
  "password-generator",
  "json-formatter",
  "base64-encoder",
  "lorem-ipsum-generator",
  "uuid-generator",
  "word-counter",
  "image-color-picker",
  "aspect-ratio-calculator",
  "unit-converter",
  "regex-tester",
  "markdown-preview",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://toolpile.io";

  const toolPages = tools.map((slug) => ({
    url: `${base}/tools/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...toolPages,
    {
      url: `${base}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
