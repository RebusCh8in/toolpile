import type { Metadata } from "next";
import BlogLayout, { ToolCTA } from "@/components/BlogLayout";
import Link from "next/link";

const post = {
  title: "The Complete Guide to Image Sizes for Every Social Media Platform (2026)",
  slug: "resize-images-social-media",
  description: "Every social media image size you need in 2026. Instagram, YouTube, Facebook, Twitter, LinkedIn, TikTok, and Pinterest dimensions with free resize tools.",
  datePublished: "2026-03-02",
  dateModified: "2026-03-02",
  tags: ["Social Media", "Image Optimization", "Instagram", "Design"],
  faqs: [
    { question: "What size should Instagram posts be?", answer: "Instagram supports square (1080×1080), portrait (1080×1350), and landscape (1080×566). Portrait 1080×1350 performs best because it takes up the most screen space in the feed. Stories and Reels use 1080×1920 (9:16)." },
    { question: "What size should YouTube thumbnails be?", answer: "YouTube recommends 1280×720 pixels (16:9 aspect ratio) with a minimum width of 640 pixels. Keep file size under 2MB. Use JPG, PNG, or GIF format. High-contrast thumbnails with faces and text overlays get the most clicks." },
    { question: "Does image size affect social media reach?", answer: "Yes. Incorrectly sized images get cropped awkwardly, cutting off text or faces. Platforms also favor properly formatted content in their algorithms. Blurry, low-resolution images signal low-quality content and reduce engagement." },
    { question: "Can I resize images without losing quality?", answer: "Downscaling (making smaller) preserves quality. Upscaling (making larger) can cause blur. Always start with the highest resolution source image and resize down to the target dimensions. Use tools that maintain aspect ratio to avoid distortion." },
  ],
  relatedTools: [
    { name: "Image Resizer", href: "/tools/image-resizer" },
    { name: "Image Compressor", href: "/tools/image-compressor" },
    { name: "Image Crop Tool", href: "/tools/image-crop" },
    { name: "Image Format Converter", href: "/tools/convert" },
  ],
  relatedArticles: [
    { title: "How to Optimize Images for Shopify", href: "/blog/optimize-images-shopify" },
    { title: "How to Convert HEIC to JPG on Any Device", href: "/blog/convert-heic-to-jpg" },
  ],
};

export const metadata: Metadata = {
  title: `${post.title} — ToolPile`,
  description: post.description,
  alternates: { canonical: `https://toolpile.app/blog/${post.slug}` },
  openGraph: { title: post.title, description: post.description, url: `https://toolpile.app/blog/${post.slug}`, siteName: "ToolPile", type: "article", publishedTime: post.datePublished, modifiedTime: post.dateModified, tags: post.tags },
  twitter: { card: "summary_large_image", title: post.title, description: post.description },
};

export default function Page() {
  return (
    <BlogLayout post={post}>
      <aside aria-label="Summary" className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 mb-8">
        <p><strong>TL;DR:</strong> Every social platform has different image size requirements. Using the wrong dimensions means awkward cropping, blurry images, and lost engagement. This guide covers the exact pixel dimensions for Instagram, YouTube, Facebook, Twitter/X, LinkedIn, TikTok, and Pinterest in 2026 — plus free tools to resize instantly.</p>
      </aside>

      <nav aria-label="Table of contents" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-8">
        <h2 className="text-lg font-semibold text-zinc-200 mb-3">Table of Contents</h2>
        <ol className="space-y-1.5 text-sm">
          <li><Link href="#why-sizes-matter" className="text-blue-400 hover:text-blue-300">Why Image Sizes Matter</Link></li>
          <li><Link href="#instagram" className="text-blue-400 hover:text-blue-300">Instagram Image Sizes</Link></li>
          <li><Link href="#youtube" className="text-blue-400 hover:text-blue-300">YouTube Image Sizes</Link></li>
          <li><Link href="#facebook" className="text-blue-400 hover:text-blue-300">Facebook Image Sizes</Link></li>
          <li><Link href="#twitter" className="text-blue-400 hover:text-blue-300">Twitter / X Image Sizes</Link></li>
          <li><Link href="#linkedin" className="text-blue-400 hover:text-blue-300">LinkedIn Image Sizes</Link></li>
          <li><Link href="#tiktok" className="text-blue-400 hover:text-blue-300">TikTok Image Sizes</Link></li>
          <li><Link href="#pinterest" className="text-blue-400 hover:text-blue-300">Pinterest Image Sizes</Link></li>
          <li><Link href="#quick-reference" className="text-blue-400 hover:text-blue-300">Quick Reference Table</Link></li>
          <li><Link href="#key-takeaways" className="text-blue-400 hover:text-blue-300">Key Takeaways</Link></li>
          <li><Link href="#faq" className="text-blue-400 hover:text-blue-300">FAQ</Link></li>
        </ol>
      </nav>

      <section id="why-sizes-matter">
        <h2>Why Image Sizes Matter</h2>
        <p>
          <strong>Incorrectly sized images hurt engagement, brand perception, and reach.</strong> When your image doesn&apos;t match a platform&apos;s expected dimensions, it gets cropped automatically — often cutting off text, logos, or faces.
        </p>
        <p>
          Low-resolution images appear blurry on high-DPI screens (which most phones have). Oversized images waste bandwidth and slow load times. Getting the exact dimensions right ensures your content looks professional everywhere.
        </p>
      </section>

      <ToolCTA
        name="Image Resizer"
        href="/tools/image-resizer"
        description="Resize images to exact dimensions with presets for Instagram, YouTube, Facebook, and more. Lock aspect ratio, batch process, and download instantly."
      />

      <section id="instagram">
        <h2>Instagram Image Sizes</h2>
        <p><strong>Instagram supports multiple aspect ratios, but portrait (4:5) performs best for feed posts because it takes up the most screen real estate.</strong></p>
        <ul>
          <li><strong>Feed Post (Square):</strong> 1080 × 1080 px (1:1)</li>
          <li><strong>Feed Post (Portrait):</strong> 1080 × 1350 px (4:5) — recommended</li>
          <li><strong>Feed Post (Landscape):</strong> 1080 × 566 px (1.91:1)</li>
          <li><strong>Stories &amp; Reels:</strong> 1080 × 1920 px (9:16)</li>
          <li><strong>Profile Photo:</strong> 320 × 320 px (displayed as circle)</li>
          <li><strong>Carousel:</strong> Same as feed post — stay consistent within a carousel</li>
        </ul>
      </section>

      <section id="youtube">
        <h2>YouTube Image Sizes</h2>
        <p><strong>YouTube thumbnails are critical for click-through rate — they&apos;re effectively your video&apos;s billboard.</strong></p>
        <ul>
          <li><strong>Thumbnail:</strong> 1280 × 720 px (16:9) — under 2MB</li>
          <li><strong>Channel Banner:</strong> 2560 × 1440 px (safe area: 1546 × 423 px center)</li>
          <li><strong>Profile Photo:</strong> 800 × 800 px</li>
          <li><strong>Community Post Image:</strong> 1200 × 675 px</li>
        </ul>
      </section>

      <section id="facebook">
        <h2>Facebook Image Sizes</h2>
        <p><strong>Facebook compresses images aggressively — upload at the recommended sizes to minimize quality loss.</strong></p>
        <ul>
          <li><strong>Feed Post:</strong> 1200 × 630 px (1.91:1)</li>
          <li><strong>Cover Photo:</strong> 820 × 312 px (desktop) / 640 × 360 px (mobile)</li>
          <li><strong>Profile Photo:</strong> 170 × 170 px (displayed as circle)</li>
          <li><strong>Event Cover:</strong> 1200 × 628 px</li>
          <li><strong>Stories:</strong> 1080 × 1920 px (9:16)</li>
        </ul>
      </section>

      <section id="twitter">
        <h2>Twitter / X Image Sizes</h2>
        <p><strong>Twitter displays images in a 16:9 crop by default in the feed. Images outside this ratio get center-cropped.</strong></p>
        <ul>
          <li><strong>In-Feed Image:</strong> 1200 × 675 px (16:9) or 1200 × 1200 px (1:1)</li>
          <li><strong>Header Photo:</strong> 1500 × 500 px (3:1)</li>
          <li><strong>Profile Photo:</strong> 400 × 400 px</li>
          <li><strong>Card Image:</strong> 1200 × 628 px</li>
        </ul>
      </section>

      <section id="linkedin">
        <h2>LinkedIn Image Sizes</h2>
        <p><strong>LinkedIn favors professional, high-quality images. Post images with a 1.91:1 ratio perform best.</strong></p>
        <ul>
          <li><strong>Feed Post:</strong> 1200 × 627 px (1.91:1) or 1080 × 1080 px (1:1)</li>
          <li><strong>Banner:</strong> 1584 × 396 px (4:1)</li>
          <li><strong>Profile Photo:</strong> 400 × 400 px</li>
          <li><strong>Company Logo:</strong> 300 × 300 px</li>
          <li><strong>Article Cover:</strong> 1200 × 644 px</li>
        </ul>
      </section>

      <section id="tiktok">
        <h2>TikTok Image Sizes</h2>
        <ul>
          <li><strong>Video/Photo Post:</strong> 1080 × 1920 px (9:16)</li>
          <li><strong>Profile Photo:</strong> 200 × 200 px</li>
        </ul>
      </section>

      <section id="pinterest">
        <h2>Pinterest Image Sizes</h2>
        <p><strong>Pinterest favors tall, vertical images. A 2:3 ratio performs best and gets the most real estate in the feed.</strong></p>
        <ul>
          <li><strong>Standard Pin:</strong> 1000 × 1500 px (2:3) — recommended</li>
          <li><strong>Square Pin:</strong> 1000 × 1000 px (1:1)</li>
          <li><strong>Long Pin:</strong> 1000 × 2100 px (max 1:2.1)</li>
          <li><strong>Profile Photo:</strong> 165 × 165 px</li>
          <li><strong>Board Cover:</strong> 222 × 150 px</li>
        </ul>
      </section>

      <ToolCTA
        name="Image Crop Tool"
        href="/tools/image-crop"
        description="Crop images to exact aspect ratios with presets for Instagram, YouTube, Facebook, Twitter, and LinkedIn. Free, private, no upload."
      />

      <section id="quick-reference">
        <h2>Quick Reference Table</h2>
        <table>
          <thead>
            <tr><th>Platform</th><th>Post Image</th><th>Stories/Reels</th><th>Profile</th></tr>
          </thead>
          <tbody>
            <tr><td>Instagram</td><td>1080×1350</td><td>1080×1920</td><td>320×320</td></tr>
            <tr><td>YouTube</td><td>1280×720 (thumb)</td><td>—</td><td>800×800</td></tr>
            <tr><td>Facebook</td><td>1200×630</td><td>1080×1920</td><td>170×170</td></tr>
            <tr><td>Twitter/X</td><td>1200×675</td><td>—</td><td>400×400</td></tr>
            <tr><td>LinkedIn</td><td>1200×627</td><td>—</td><td>400×400</td></tr>
            <tr><td>TikTok</td><td>1080×1920</td><td>1080×1920</td><td>200×200</td></tr>
            <tr><td>Pinterest</td><td>1000×1500</td><td>—</td><td>165×165</td></tr>
          </tbody>
        </table>
      </section>

      <section id="key-takeaways">
        <h2>Key Takeaways</h2>
        <ul>
          <li>Portrait (4:5) images perform best on Instagram because they take up the most feed space</li>
          <li>YouTube thumbnails at 1280×720 are critical for click-through rate</li>
          <li>Always upload at the recommended dimensions — platforms compress aggressively</li>
          <li>Use a consistent aspect ratio within carousels and galleries</li>
          <li>Start with the highest resolution source and resize down to avoid blur</li>
          <li>Use browser-based tools to resize privately without uploading sensitive content</li>
        </ul>
      </section>
    </BlogLayout>
  );
}
