import type { Metadata } from "next";
import BlogLayout, { ToolCTA } from "@/components/BlogLayout";
import Link from "next/link";

const post = {
  title: "How to Convert Video to GIF for Free (2026 Guide)",
  slug: "how-to-convert-video-to-gif",
  description: "Learn how to convert video clips to animated GIFs. Covers trimming, sizing, frame rate, optimization, and free browser-based tools.",
  datePublished: "2026-03-07",
  dateModified: "2026-03-07",
  tags: ["GIF", "Video", "Converter", "Social Media"],
  faqs: [
    { question: "What is the best video format to convert to GIF?", answer: "MP4 (H.264) works best because all browsers can decode it efficiently. WebM and MOV also work. The source format matters less than the content — short clips with simple motion convert best." },
    { question: "How do I make the GIF file smaller?", answer: "Three levers: reduce width (480px is good for most uses), lower FPS (10fps looks smooth enough), and shorten the duration. A 3-second, 480px, 10fps GIF is typically under 2MB." },
    { question: "Why does my GIF look grainy or banded?", answer: "GIFs are limited to 256 colors per frame. Scenes with smooth gradients (like sky or skin tones) show color banding. Simple graphics and high-contrast scenes convert much better." },
    { question: "Is there a size limit?", answer: "Most platforms have GIF size limits: Twitter (15MB), Discord (8MB free), Slack (varies). Keep GIFs under 5MB for reliable sharing everywhere." },
  ],
  relatedTools: [
    { name: "Video to GIF Converter", href: "/tools/video-to-gif" },
  ],
  relatedArticles: [
    { title: "How to Compress Video", href: "/blog/how-to-compress-video" },
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
        <p><strong>TL;DR:</strong> Video to GIF conversion extracts frames from a video clip and encodes them as an animated GIF. Keep clips short (2-5 seconds), use 480px width, 10fps, and aim for under 5MB. GIFs work everywhere — no video player needed — making them perfect for reactions, tutorials, and social media.</p>
      </aside>

      <section>
        <h2>Why Use GIFs Instead of Video</h2>
        <p>GIFs autoplay everywhere without a video player. They work in emails, chat apps, forums, GitHub issues, and any platform that supports images. A short GIF of a bug, a UI interaction, or a reaction communicates instantly without the recipient needing to click play.</p>
        <p>The tradeoff is file size and quality. GIFs are larger than equivalent video and limited to 256 colors. They&apos;re best for short clips, not full videos.</p>
      </section>

      <section>
        <h2>Optimal Settings for Different Uses</h2>
        <ul>
          <li><strong>Social media reactions:</strong> 320px wide, 10fps, 1-3 seconds. Keep under 3MB.</li>
          <li><strong>Tutorial demos:</strong> 640px wide, 15fps, 3-10 seconds. Keep under 10MB.</li>
          <li><strong>Bug reports:</strong> 480px wide, 10fps, 2-5 seconds. Keep under 5MB for GitHub/Jira.</li>
          <li><strong>Email:</strong> 320px wide, 8fps, 2-3 seconds. Keep under 1MB for reliable delivery.</li>
        </ul>
      </section>

      <section>
        <h2>Tips for Better GIFs</h2>
        <ul>
          <li><strong>Trim precisely:</strong> Every extra second adds significant file size. Cut to exactly the moment that matters.</li>
          <li><strong>Simple backgrounds help:</strong> Scenes with solid or simple backgrounds compress much better than busy, detailed scenes.</li>
          <li><strong>Loop cleanly:</strong> The best GIFs loop seamlessly. Try to trim so the last frame transitions naturally to the first.</li>
          <li><strong>Lower FPS is fine:</strong> 10fps looks smooth for most content. You rarely need more than 15fps.</li>
        </ul>
      </section>

      <section>
        <h2>Convert Video to GIF for Free</h2>
        <p>Our <Link href="/tools/video-to-gif" className="text-blue-400 hover:text-blue-300">free Video to GIF Converter</Link> lets you trim, resize, and convert any video to an animated GIF. Adjust width and frame rate to control file size. Everything runs in your browser — no upload required.</p>
        <ToolCTA name="Video to GIF Converter" href="/tools/video-to-gif" description="Convert any video to an animated GIF. Trim, resize, adjust frame rate. No upload, runs entirely in your browser." />
      </section>
    </BlogLayout>
  );
}
