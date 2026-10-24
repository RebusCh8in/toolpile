import type { Metadata } from "next";
import BlogLayout, { ToolCTA } from "@/components/BlogLayout";
import Link from "next/link";

const post = {
  title: "How to Optimize Images for Shopify: Complete Speed Guide",
  slug: "optimize-images-shopify",
  description: "Reduce Shopify page load times by 50%+ with proper image optimization. Covers compression, format selection, lazy loading, and free tools.",
  datePublished: "2026-03-02",
  dateModified: "2026-03-02",
  tags: ["Shopify", "Image Optimization", "Page Speed", "E-commerce"],
  faqs: [
    { question: "What is the best image format for Shopify?", answer: "WebP is the best format for Shopify product images. It delivers 25-35% smaller files than JPEG at the same quality, and all modern browsers support it. Shopify's CDN can serve WebP automatically, but uploading pre-optimized WebP images gives you more control over quality." },
    { question: "What size should Shopify product images be?", answer: "Shopify recommends 2048x2048 pixels for product images. This provides enough resolution for zoom functionality while being manageable in file size. For collection pages and thumbnails, images are automatically resized by Shopify's CDN." },
    { question: "Does image optimization affect Shopify SEO?", answer: "Yes. Page speed is a confirmed Google ranking factor. Google's Core Web Vitals measure loading performance (LCP), and large unoptimized images are the most common cause of slow LCP scores. Faster pages rank higher and convert better." },
    { question: "How much can I reduce image file sizes?", answer: "Typical JPEG product photos can be compressed by 50-80% with no visible quality loss. A 2MB product photo can usually be reduced to 200-400KB while looking identical. This directly translates to faster page loads." },
    { question: "Can I optimize images without uploading to a server?", answer: "Yes. Browser-based tools like ToolPile's Image Compressor process images entirely on your device. Your product photos never leave your computer, which is ideal for unreleased products or sensitive business images." },
  ],
  relatedTools: [
    { name: "Image Compressor", href: "/tools/image-compressor" },
    { name: "Image Resizer", href: "/tools/image-resizer" },
    { name: "Image Format Converter", href: "/tools/convert" },
    { name: "HEIC to JPG Converter", href: "/tools/convert/heic-to-jpg" },
  ],
  relatedArticles: [
    { title: "How to Make Your Website WCAG Accessible", href: "/blog/wcag-accessibility-checklist" },
    { title: "How to Convert HEIC to JPG on Any Device", href: "/blog/convert-heic-to-jpg" },
  ],
};

export const metadata: Metadata = {
  title: `${post.title} — ToolPile`,
  description: post.description,
  alternates: { canonical: `https://toolpile.app/blog/${post.slug}` },
  openGraph: {
    title: post.title,
    description: post.description,
    url: `https://toolpile.app/blog/${post.slug}`,
    siteName: "ToolPile",
    type: "article",
    publishedTime: post.datePublished,
    modifiedTime: post.dateModified,
    tags: post.tags,
  },
  twitter: { card: "summary_large_image", title: post.title, description: post.description },
};

export default function Page() {
  return (
    <BlogLayout post={post}>
      <aside aria-label="Summary" className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 mb-8">
        <p><strong>TL;DR:</strong> Unoptimized images are the #1 cause of slow Shopify stores. Compress product photos to WebP format at 80% quality, resize to 2048px max width, and enable lazy loading. This alone can cut page load times by 50% or more — which directly improves your Google rankings and conversion rate.</p>
      </aside>

      <nav aria-label="Table of contents" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-8">
        <h2 className="text-lg font-semibold text-zinc-200 mb-3">Table of Contents</h2>
        <ol className="space-y-1.5 text-sm">
          <li><Link href="#why-images-matter" className="text-blue-400 hover:text-blue-300">Why Image Optimization Matters for Shopify</Link></li>
          <li><Link href="#best-formats" className="text-blue-400 hover:text-blue-300">Best Image Formats for Shopify</Link></li>
          <li><Link href="#compression" className="text-blue-400 hover:text-blue-300">How to Compress Shopify Product Images</Link></li>
          <li><Link href="#sizing" className="text-blue-400 hover:text-blue-300">Optimal Image Sizes and Dimensions</Link></li>
          <li><Link href="#step-by-step" className="text-blue-400 hover:text-blue-300">Step-by-Step Optimization Workflow</Link></li>
          <li><Link href="#common-mistakes" className="text-blue-400 hover:text-blue-300">Common Mistakes to Avoid</Link></li>
          <li><Link href="#key-takeaways" className="text-blue-400 hover:text-blue-300">Key Takeaways</Link></li>
          <li><Link href="#faq" className="text-blue-400 hover:text-blue-300">FAQ</Link></li>
        </ol>
      </nav>

      <section id="why-images-matter">
        <h2>Why Image Optimization Matters for Shopify</h2>
        <p>
          <strong>Page speed is a confirmed Google ranking factor and a major driver of conversion rates.</strong> Google reports that as page load time increases from 1 to 3 seconds, the probability of a visitor bouncing increases by 32%. At 5 seconds, that jumps to 90%.
        </p>
        <p>
          For Shopify stores, images account for 60-80% of total page weight. A single unoptimized product photo can be 3-5MB — meaning a collection page with 20 products could load 60-100MB of images. That&apos;s a guaranteed slow experience on mobile.
        </p>
        <p>
          Google&apos;s Core Web Vitals specifically measure Largest Contentful Paint (LCP) — the time it takes for the largest visible element (usually a hero image or product photo) to finish loading. The target is under 2.5 seconds. Unoptimized images are the most common reason Shopify stores fail this metric.
        </p>
      </section>

      <section id="best-formats">
        <h2>Best Image Formats for Shopify</h2>
        <p>
          <strong>WebP is the best image format for Shopify product photos in 2026.</strong> It delivers 25-35% smaller files than JPEG at equivalent visual quality, with universal browser support.
        </p>

        <table>
          <thead>
            <tr><th>Format</th><th>Best For</th><th>Compression</th><th>Transparency</th></tr>
          </thead>
          <tbody>
            <tr><td>WebP</td><td>Product photos, hero images</td><td>25-35% smaller than JPEG</td><td>Yes</td></tr>
            <tr><td>JPEG</td><td>Fallback for older systems</td><td>Good, adjustable quality</td><td>No</td></tr>
            <tr><td>PNG</td><td>Logos, graphics with transparency</td><td>Larger files, lossless</td><td>Yes</td></tr>
            <tr><td>AVIF</td><td>Future-proofing (growing support)</td><td>50% smaller than JPEG</td><td>Yes</td></tr>
          </tbody>
        </table>

        <p>
          Shopify&apos;s CDN automatically serves images in WebP format to browsers that support it. However, you can further optimize by uploading pre-compressed images and converting formats yourself before upload.
        </p>
      </section>

      <ToolCTA
        name="Image Format Converter"
        href="/tools/convert"
        description="Convert your product photos between JPG, PNG, WebP, and 17 other formats. No upload to any server — runs entirely in your browser."
      />

      <section id="compression">
        <h2>How to Compress Shopify Product Images</h2>
        <p>
          <strong>Most product photos can be compressed by 50-80% with no visible quality loss.</strong> A 2MB product photo typically compresses to 200-400KB while looking identical to customers.
        </p>
        <p>
          The key is finding the right quality setting. For product photos, 75-85% JPEG/WebP quality is the sweet spot — below 75% you may notice artifacts, above 85% the file savings become negligible.
        </p>
        <h3>Compression Quality Guidelines</h3>
        <ul>
          <li><strong>Hero images and banners:</strong> 80-85% quality (visible quality matters most)</li>
          <li><strong>Product photos:</strong> 75-82% quality (balance of quality and speed)</li>
          <li><strong>Thumbnails and collection images:</strong> 70-75% quality (small display size hides artifacts)</li>
          <li><strong>Logos and icons:</strong> Use PNG or SVG (lossless formats preserve sharp edges)</li>
        </ul>
      </section>

      <ToolCTA
        name="Image Compressor"
        href="/tools/image-compressor"
        description="Compress product images by up to 90% with an adjustable quality slider. See before/after comparison with file size reduction. 100% private — your images stay on your device."
      />

      <section id="sizing">
        <h2>Optimal Image Sizes and Dimensions</h2>
        <p>
          <strong>Upload product images at 2048x2048 pixels maximum.</strong> This is Shopify&apos;s recommended size and provides enough resolution for product zoom functionality without unnecessary file weight.
        </p>
        <h3>Recommended Dimensions by Use</h3>
        <ul>
          <li><strong>Product images:</strong> 2048x2048px (square, consistent ratio)</li>
          <li><strong>Collection banners:</strong> 1920x600px</li>
          <li><strong>Slideshow/hero images:</strong> 1920x1080px</li>
          <li><strong>Blog post featured images:</strong> 1200x630px (also optimal for social sharing)</li>
          <li><strong>Favicon:</strong> 32x32px</li>
        </ul>
        <p>
          Consistency matters. Use the same aspect ratio for all product images in a collection. Square (1:1) is the most common for products. Inconsistent dimensions cause layout shifts, which hurts your CLS Core Web Vital score.
        </p>
      </section>

      <ToolCTA
        name="Image Resizer"
        href="/tools/image-resizer"
        description="Resize product images to exact dimensions with social media presets for Instagram, Facebook, and more. Lock aspect ratio to maintain consistency."
      />

      <section id="step-by-step">
        <h2>Step-by-Step Optimization Workflow</h2>
        <p>Follow this process for every batch of product images before uploading to Shopify:</p>
        <ol>
          <li><strong>Resize</strong> images to 2048px maximum width using <Link href="/tools/image-resizer">Image Resizer</Link></li>
          <li><strong>Compress</strong> at 80% quality using <Link href="/tools/image-compressor">Image Compressor</Link></li>
          <li><strong>Convert</strong> to WebP format using <Link href="/tools/convert/jpg-to-webp">JPG to WebP Converter</Link></li>
          <li><strong>Verify</strong> file sizes — aim for under 500KB per product image</li>
          <li><strong>Name files descriptively</strong> — use <code>blue-running-shoes-side-view.webp</code> not <code>IMG_4523.webp</code></li>
          <li><strong>Upload to Shopify</strong> and add descriptive alt text for each image</li>
        </ol>
      </section>

      <section id="common-mistakes">
        <h2>Common Mistakes to Avoid</h2>
        <ul>
          <li><strong>Uploading raw camera files.</strong> DSLR photos are often 5-20MB. Always compress before uploading.</li>
          <li><strong>Using PNG for photos.</strong> PNG is lossless and creates much larger files for photographic content. Use WebP or JPEG instead.</li>
          <li><strong>Inconsistent dimensions.</strong> Mixed image sizes cause layout shifts and look unprofessional in collection grids.</li>
          <li><strong>Missing alt text.</strong> Every product image needs descriptive alt text for accessibility and SEO. Describe what the image shows, not just the product name.</li>
          <li><strong>Over-compression.</strong> Going below 65% quality creates visible artifacts. The few extra KB saved aren&apos;t worth the quality loss.</li>
        </ul>
      </section>

      <section id="key-takeaways">
        <h2>Key Takeaways</h2>
        <ul>
          <li>Images account for 60-80% of Shopify page weight — optimizing them has the biggest impact on speed</li>
          <li>WebP format delivers 25-35% smaller files than JPEG with no quality loss</li>
          <li>Compress product photos to 75-85% quality — most can be reduced by 50-80%</li>
          <li>Resize to 2048x2048px maximum before uploading</li>
          <li>Use consistent dimensions across all product images in a collection</li>
          <li>Always add descriptive alt text for SEO and accessibility</li>
          <li>Use free browser-based tools to avoid uploading sensitive product images to third-party servers</li>
        </ul>
      </section>
    </BlogLayout>
  );
}
