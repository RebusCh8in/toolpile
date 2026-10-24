"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function Page() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = text.trim() ? (text.match(/[.!?]+/g) || []).length || (text.trim() ? 1 : 0) : 0;
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
    const lines = text ? text.split("\n").length : 0;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    const speakingTime = Math.max(1, Math.ceil(words / 130));

    // Character frequency
    const freq: Record<string, number> = {};
    for (const c of text.toLowerCase()) {
      if (/[a-z]/.test(c)) freq[c] = (freq[c] || 0) + 1;
    }
    const topChars = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);

    // Social media limits
    const limits = [
      { name: "Twitter/X", max: 280, used: chars },
      { name: "Instagram Bio", max: 150, used: chars },
      { name: "LinkedIn Post", max: 3000, used: chars },
      { name: "YouTube Title", max: 100, used: chars },
      { name: "TikTok Caption", max: 2200, used: chars },
      { name: "Meta Title (SEO)", max: 60, used: chars },
      { name: "Meta Description", max: 160, used: chars },
    ];

    return { chars, charsNoSpace, words, sentences, paragraphs, lines, readingTime, speakingTime, topChars, limits };
  }, [text]);

  return (
    <ToolLayout
      title="Character Counter"
      description="Count characters, words, sentences, paragraphs, and lines. Social media character limits and reading time."
      slug="character-counter"
      category="Text"
      keywords={["character counter", "character count", "letter counter", "word counter online", "text length counter"]}
      faqs={[
        { question: "How are words counted?", answer: "Words are counted by splitting text on whitespace (spaces, tabs, newlines). Multiple consecutive spaces count as one separator. Empty text has 0 words." },
        { question: "What social media character limits does this track?", answer: "Twitter/X (280), Instagram Bio (150), LinkedIn Post (3,000), YouTube Title (100), TikTok Caption (2,200), SEO Meta Title (60), and Meta Description (160)." },
        { question: "How is reading time calculated?", answer: "Based on average reading speed of 200 words per minute. Speaking time uses 130 words per minute (average speaking pace)." },
      ]}
      relatedTools={[
        { name: "Word Counter", href: "/tools/word-counter" },
        { name: "Text Case Converter", href: "/tools/text-case-converter" },
        { name: "Lorem Ipsum Generator", href: "/tools/lorem-ipsum-generator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Start typing or paste your text here..." className="w-full h-72 bg-zinc-800 border border-zinc-700 rounded-lg p-4 text-zinc-100 text-sm resize-none focus:outline-none focus:border-blue-500" />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Characters", stats.chars.toLocaleString()],
              ["No Spaces", stats.charsNoSpace.toLocaleString()],
              ["Words", stats.words.toLocaleString()],
              ["Sentences", stats.sentences.toLocaleString()],
              ["Paragraphs", stats.paragraphs.toLocaleString()],
              ["Lines", stats.lines.toLocaleString()],
              ["Reading Time", `${stats.readingTime} min`],
              ["Speaking Time", `${stats.speakingTime} min`],
            ].map(([label, val]) => (
              <div key={label} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">{label}</p>
                <p className="text-lg font-semibold text-zinc-100">{val}</p>
              </div>
            ))}
          </div>

          {/* Social media limits */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">Character Limits</p>
            <div className="space-y-1.5">
              {stats.limits.map(l => {
                const pct = Math.min(100, (l.used / l.max) * 100);
                const over = l.used > l.max;
                return (
                  <div key={l.name}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-zinc-400">{l.name}</span>
                      <span className={over ? "text-red-400" : "text-zinc-300"}>{l.used}/{l.max}</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-1.5">
                      <div className={`rounded-full h-1.5 transition-all ${over ? "bg-red-500" : pct > 80 ? "bg-yellow-500" : "bg-blue-500"}`} style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
