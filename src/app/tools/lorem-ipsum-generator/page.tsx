"use client";

import { useState, useCallback } from "react";
import ToolLayout, { FAQ, RelatedTool } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum", "perspiciatis", "unde",
  "omnis", "iste", "natus", "error", "voluptatem", "accusantium", "doloremque",
  "laudantium", "totam", "rem", "aperiam", "eaque", "ipsa", "quae", "ab", "illo",
  "inventore", "veritatis", "quasi", "architecto", "beatae", "vitae", "dicta",
  "explicabo", "nemo", "ipsam", "voluptas", "aspernatur", "aut", "odit",
  "fugit", "consequuntur", "magni", "dolores", "eos", "ratione", "sequi",
  "nesciunt", "neque", "porro", "quisquam", "dolorem", "adipisci",
  "numquam", "eius", "modi", "tempora", "incidunt", "magnam", "aliquam",
  "quaerat",
];

const LOREM_START = "Lorem ipsum dolor sit amet, consectetur adipiscing elit";

type GenerateType = "paragraphs" | "sentences" | "words";

function randomWord(): string {
  return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
}

function generateSentence(minWords = 6, maxWords = 14): string {
  const count = minWords + Math.floor(Math.random() * (maxWords - minWords + 1));
  const words = Array.from({ length: count }, () => randomWord());
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(" ") + ".";
}

function generateParagraph(minSentences = 3, maxSentences = 7): string {
  const count = minSentences + Math.floor(Math.random() * (maxSentences - minSentences + 1));
  return Array.from({ length: count }, () => generateSentence()).join(" ");
}

export default function LoremIpsumGeneratorPage() {
  const [type, setType] = useState<GenerateType>("paragraphs");
  const [quantity, setQuantity] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [generated, setGenerated] = useState("");

  const generate = useCallback(() => {
    let result = "";
    switch (type) {
      case "paragraphs": {
        const paras = Array.from({ length: quantity }, () => generateParagraph());
        if (startWithLorem && paras.length > 0) {
          paras[0] = LOREM_START + ". " + paras[0];
        }
        result = paras.join("\n\n");
        break;
      }
      case "sentences": {
        const sents = Array.from({ length: quantity }, () => generateSentence());
        if (startWithLorem && sents.length > 0) {
          sents[0] = LOREM_START + ".";
        }
        result = sents.join(" ");
        break;
      }
      case "words": {
        const words = Array.from({ length: quantity }, () => randomWord());
        if (startWithLorem && words.length >= 2) {
          words[0] = "lorem";
          words[1] = words.length > 1 ? "ipsum" : words[1];
        }
        result = words.join(" ");
        break;
      }
    }
    setGenerated(result);
  }, [type, quantity, startWithLorem]);

  const wordCount = generated ? generated.split(/\s+/).filter(Boolean).length : 0;
  const charCount = generated.length;

  return (
    <ToolLayout
      title="Lorem Ipsum Generator"
      description="Generate placeholder text in paragraphs, sentences, or words."
      category="Text"
      slug="lorem-ipsum-generator"
      keywords={[
        "lorem ipsum generator",
        "placeholder text generator",
        "dummy text generator",
        "lorem ipsum paragraphs",
        "filler text online",
        "generate lorem ipsum",
        "random text generator",
      ]}
      relatedTools={[
        { name: "Word Counter", href: "/tools/word-counter" },
        { name: "Markdown Preview", href: "/tools/markdown-preview" },
        { name: "JSON Formatter", href: "/tools/json-formatter" },
        { name: "Password Generator", href: "/tools/password-generator" },
      ]}
      faqs={[
        {
          question: "What is Lorem Ipsum?",
          answer: "Lorem Ipsum is placeholder text derived from a 1st-century BC Latin work by Cicero. Designers and developers use it to fill layouts before real content is available, allowing them to evaluate visual design without being distracted by readable text.",
        },
        {
          question: "How do I generate Lorem Ipsum text?",
          answer: "Choose a type (paragraphs, sentences, or words), set the quantity you need, and click Generate. The placeholder text is created instantly and can be copied to your clipboard with one click.",
        },
        {
          question: "Can I generate a specific number of paragraphs?",
          answer: "Yes. Set the type to Paragraphs and enter the number you need, from 1 to 100. Each generated paragraph contains a randomized mix of 3 to 7 Latin-style sentences.",
        },
        {
          question: "What does the 'Start with Lorem ipsum' option do?",
          answer: "When enabled, the generated text begins with the traditional 'Lorem ipsum dolor sit amet, consectetur adipiscing elit' opening. Disable it if you want fully randomized placeholder text from the start.",
        },
        {
          question: "Is Lorem Ipsum good for SEO testing?",
          answer: "Lorem Ipsum is useful for testing page layouts and typography but should never appear on a production site. Search engines may flag pages with Latin placeholder text as low-quality or incomplete content.",
        },
        {
          question: "Can I use this generated text commercially?",
          answer: "Yes. Lorem Ipsum text is not copyrighted and can be used freely in mockups, wireframes, prototypes, and design presentations. It is intended solely as placeholder content and should be replaced before launch.",
        },
      ]}
      guide={
        <>
          <h2>What Is the Lorem Ipsum Generator?</h2>
          <p>
            The Lorem Ipsum Generator creates placeholder text for design mockups, wireframes, and development prototypes. It produces realistic-looking Latin text in paragraphs, sentences, or individual words so you can focus on layout and typography without waiting for real content.
          </p>

          <h3>How to Use the Lorem Ipsum Generator</h3>
          <p>
            Generating placeholder text takes just a few clicks. Choose your output format, set the quantity, and hit Generate.
          </p>
          <ul>
            <li>Select a type: Paragraphs for body text blocks, Sentences for shorter fills, or Words for inline placeholders.</li>
            <li>Enter the quantity you need, from 1 to 100 units.</li>
            <li>Toggle "Start with Lorem ipsum..." to begin with the classic opening phrase or leave it off for random text.</li>
            <li>Click Generate to produce the text.</li>
            <li>Copy the result to your clipboard with the copy button.</li>
          </ul>

          <h3>When to Use Placeholder Text</h3>
          <p>
            Placeholder text is essential during early design phases when real copy is not yet available. It lets you evaluate font sizes, line heights, spacing, and overall page balance. Developers use it to test dynamic content rendering, text overflow behavior, and responsive layouts.
          </p>

          <h3>Common Use Cases</h3>
          <ul>
            <li>Filling website mockups and wireframes during the design phase.</li>
            <li>Testing typography, font sizes, and line spacing in CSS.</li>
            <li>Populating prototype pages for client presentations.</li>
            <li>Checking text wrapping and overflow in responsive layouts.</li>
            <li>Generating sample content for CMS templates and themes.</li>
          </ul>

          <h3>Tips for Better Mockups</h3>
          <p>
            Match the placeholder quantity to realistic content lengths. If a blog post is typically 500 words, generate roughly that amount so the mockup reflects the real experience. Use paragraphs for body sections and individual words or sentences for headings, captions, and UI labels.
          </p>
          <p>
            The built-in word and character counts help you verify that the generated text matches your target length before pasting it into your project.
          </p>
        </>
      }
    >
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">Type</label>
            <div className="flex gap-2">
              {(["paragraphs", "sentences", "words"] as GenerateType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium capitalize transition-colors ${
                    type === t ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">Quantity</label>
            <input
              type="number"
              min={1}
              max={100}
              value={quantity}
              onChange={(e) => setQuantity(Math.min(100, Math.max(1, Number(e.target.value))))}
              className="w-24 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pb-1">
            <input
              type="checkbox"
              checked={startWithLorem}
              onChange={(e) => setStartWithLorem(e.target.checked)}
              className="accent-blue-500"
            />
            <span className="text-sm text-zinc-300">Start with &quot;Lorem ipsum...&quot;</span>
          </label>

          <button
            onClick={generate}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
          >
            Generate
          </button>
        </div>

        {/* Output */}
        {generated && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex gap-4 text-xs text-zinc-500">
                <span>{wordCount} words</span>
                <span>{charCount} characters</span>
              </div>
              <CopyButton text={generated} />
            </div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
              {generated}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
