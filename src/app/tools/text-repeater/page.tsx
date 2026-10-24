"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function Page() {
  const [text, setText] = useState("Hello World");
  const [count, setCount] = useState(10);
  const [separator, setSeparator] = useState<"newline" | "space" | "comma" | "none" | "custom">("newline");
  const [customSep, setCustomSep] = useState(" - ");
  const [copied, setCopied] = useState(false);

  const sep = separator === "newline" ? "\n" : separator === "space" ? " " : separator === "comma" ? ", " : separator === "none" ? "" : customSep;
  const result = useMemo(() => Array(Math.min(count, 10000)).fill(text).join(sep), [text, count, sep]);

  const copy = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Text Repeater"
      description="Repeat any text multiple times with custom separators. Copy repeated text for pasting anywhere."
      slug="text-repeater"
      category="Text"
      keywords={["text repeater", "repeat text", "text multiplier", "copy paste text repeater", "repeat word generator"]}
      faqs={[
        { question: "What is this tool for?", answer: "Repeat any text, word, or phrase a specified number of times. Useful for testing, filling form fields, social media, generating test data, or creating patterns." },
        { question: "Is there a maximum number of repetitions?", answer: "The tool limits to 10,000 repetitions to prevent browser slowdown. For most use cases, this is more than sufficient." },
      ]}
      relatedTools={[
        { name: "Lorem Ipsum Generator", href: "/tools/lorem-ipsum-generator" },
        { name: "Word Counter", href: "/tools/word-counter" },
        { name: "Character Counter", href: "/tools/character-counter" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div><label className={labelCls}>Text to Repeat</label><input type="text" value={text} onChange={e => setText(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Repeat Count</label><input type="number" value={count} onChange={e => setCount(Math.max(1, +e.target.value))} className={inputCls} min={1} max={10000} /></div>
          <div>
            <label className={labelCls}>Separator</label>
            <div className="flex flex-wrap gap-2">
              {([["newline", "New Line"], ["space", "Space"], ["comma", "Comma"], ["none", "None"], ["custom", "Custom"]] as const).map(([val, label]) => (
                <button key={val} onClick={() => setSeparator(val)} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${separator === val ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{label}</button>
              ))}
            </div>
            {separator === "custom" && <input type="text" value={customSep} onChange={e => setCustomSep(e.target.value)} className={`${inputCls} mt-2`} placeholder="Custom separator" />}
          </div>
          <div className="text-sm text-zinc-500">Output: {result.length.toLocaleString()} characters</div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className={labelCls}>Result</label>
            <button onClick={copy} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded transition-colors">{copied ? "Copied!" : "Copy"}</button>
          </div>
          <textarea value={result} readOnly className="w-full h-72 bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-zinc-100 text-sm resize-none focus:outline-none" />
        </div>
      </div>
    </ToolLayout>
  );
}
