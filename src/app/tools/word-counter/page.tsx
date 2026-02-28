"use client";

import { useState, useMemo } from "react";
import ToolLayout, { FAQ, RelatedTool } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

export default function WordCounterPage() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/) : [];
    const wordCount = words.length;
    const charCount = text.length;
    const charNoSpaces = text.replace(/\s/g, "").length;
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length || (text.trim() ? 1 : 0);
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    // Word frequency
    const freq: Record<string, number> = {};
    words.forEach((w) => {
      const clean = w.toLowerCase().replace(/[^a-z0-9'-]/g, "");
      if (clean && clean.length > 1) {
        freq[clean] = (freq[clean] || 0) + 1;
      }
    });
    const topWords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return { wordCount, charCount, charNoSpaces, sentences, paragraphs, readingTime, topWords };
  }, [text]);

  return (
    <ToolLayout
      title="Word Counter"
      description="Count words, characters, sentences, and paragraphs. Analyze reading time and word frequency."
      category="Text"
      slug="word-counter"
      keywords={[
        "word counter",
        "character counter",
        "word count tool",
        "online word counter",
        "count characters in text",
        "sentence counter",
        "reading time calculator",
        "word frequency analyzer",
      ]}
      relatedTools={[
        { name: "Lorem Ipsum Generator", href: "/tools/lorem-ipsum-generator" },
        { name: "Markdown Preview", href: "/tools/markdown-preview" },
        { name: "JSON Formatter", href: "/tools/json-formatter" },
        { name: "Regex Tester", href: "/tools/regex-tester" },
      ]}
      faqs={[
        {
          question: "How do I count words in my text?",
          answer: "Paste or type your text into the input area. The word count updates instantly in the statistics panel on the right. The tool also shows character count, sentence count, paragraph count, and estimated reading time.",
        },
        {
          question: "Does the word counter include spaces in the character count?",
          answer: "The tool provides both counts. The Characters stat includes spaces, while the Characters (no spaces) stat excludes them. This is useful for platforms that count characters differently.",
        },
        {
          question: "How is reading time calculated?",
          answer: "Reading time is estimated at an average rate of 200 words per minute, which is the standard for adult reading speed. The result is rounded up to the nearest minute to give a practical estimate.",
        },
        {
          question: "What does the word frequency feature show?",
          answer: "The Top Words section displays the 10 most frequently used words in your text along with their occurrence count and a visual bar chart. Single-letter words are excluded to focus on meaningful terms.",
        },
        {
          question: "Can I use this to check essay word limits?",
          answer: "Yes. Paste your essay or assignment text and instantly see the word count, character count, and paragraph count. This helps you stay within submission requirements for school, college, or professional writing.",
        },
        {
          question: "Does this tool work for languages other than English?",
          answer: "The word counter works with any language that separates words with spaces. It counts words by splitting on whitespace. Character counting works for all languages and Unicode text.",
        },
      ]}
      guide={
        <>
          <h2>What Is the Word Counter?</h2>
          <p>
            The Word Counter is an online text analysis tool that instantly counts words, characters, sentences, and paragraphs in any text you enter. It also estimates reading time and reveals your most frequently used words. Whether you are writing an essay, blog post, or social media caption, this tool helps you hit your targets.
          </p>

          <h3>How to Use the Word Counter</h3>
          <p>
            Using the tool is straightforward. Paste or type your text and all statistics update in real time.
          </p>
          <ul>
            <li>Paste your text into the large input area, or start typing directly.</li>
            <li>View word count, character count, and more in the Statistics panel.</li>
            <li>Check the Characters (no spaces) stat for platforms with strict character limits.</li>
            <li>See the estimated reading time based on 200 words per minute.</li>
            <li>Review the Top Words section to identify overused terms.</li>
            <li>Use the copy button to copy your text after reviewing the stats.</li>
          </ul>

          <h3>Understanding the Statistics</h3>
          <p>
            The tool provides five core metrics: word count, total characters, characters without spaces, sentence count, and paragraph count. Sentences are detected by periods, exclamation marks, and question marks. Paragraphs are split by blank lines.
          </p>
          <p>
            Reading time is calculated at 200 words per minute, which is a widely accepted average for adult reading speed. The word frequency chart highlights your top 10 most-used words, helping you spot repetition in your writing.
          </p>

          <h3>Common Use Cases</h3>
          <ul>
            <li>Meeting word count requirements for essays, articles, and assignments.</li>
            <li>Checking character limits for tweets, meta descriptions, and SMS.</li>
            <li>Estimating reading time for blog posts and newsletters.</li>
            <li>Identifying overused words to improve writing quality.</li>
            <li>Verifying paragraph and sentence counts for structured writing.</li>
          </ul>

          <h3>Tips for Better Writing</h3>
          <p>
            Use the word frequency analysis to spot words you repeat too often. If a non-essential word appears at the top of the list, consider replacing some instances with synonyms or restructuring your sentences. Aim for variety to keep your writing engaging and clear.
          </p>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Text input */}
        <div className="lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-300">Enter your text</label>
            {text && <CopyButton text={text} className="text-xs px-2 py-1" />}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start typing or paste your text here..."
            rows={16}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 resize-y"
          />
        </div>

        {/* Stats sidebar */}
        <div className="space-y-4">
          {/* Counts */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <h3 className="mb-3 text-sm font-semibold text-zinc-300">Statistics</h3>
            <div className="space-y-2">
              {[
                { label: "Words", value: stats.wordCount },
                { label: "Characters", value: stats.charCount },
                { label: "Characters (no spaces)", value: stats.charNoSpaces },
                { label: "Sentences", value: stats.sentences },
                { label: "Paragraphs", value: stats.paragraphs },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">{s.label}</span>
                  <span className="font-mono text-sm font-medium text-zinc-200">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reading time */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <h3 className="mb-1 text-sm font-semibold text-zinc-300">Reading Time</h3>
            <p className="text-2xl font-bold text-blue-400">
              {stats.wordCount === 0 ? "0" : stats.readingTime} min
            </p>
            <p className="text-xs text-zinc-500">~200 words per minute</p>
          </div>

          {/* Word frequency */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <h3 className="mb-3 text-sm font-semibold text-zinc-300">Top Words</h3>
            {stats.topWords.length === 0 ? (
              <p className="text-xs text-zinc-500">Start typing to see word frequency</p>
            ) : (
              <div className="space-y-1.5">
                {stats.topWords.map(([word, count]) => (
                  <div key={word} className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs text-zinc-300">{word}</span>
                        <span className="text-xs text-zinc-500">{count}</span>
                      </div>
                      <div className="h-1 w-full rounded-full bg-zinc-800">
                        <div
                          className="h-1 rounded-full bg-blue-500"
                          style={{
                            width: `${(count / (stats.topWords[0]?.[1] || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
