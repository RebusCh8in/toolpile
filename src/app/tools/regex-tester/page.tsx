"use client";

import { useState, useMemo } from "react";
import ToolLayout, { FAQ, RelatedTool } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

interface MatchInfo {
  match: string;
  index: number;
  groups: string[];
}

const commonPatterns = [
  { name: "Email", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" },
  { name: "URL", pattern: "https?://[\\w\\-._~:/?#\\[\\]@!$&'()*+,;=%]+" },
  { name: "Phone", pattern: "\\+?\\d{1,4}[-.\\s]?\\(?\\d{1,3}\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}" },
  { name: "IPv4", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b" },
  { name: "Date (YYYY-MM-DD)", pattern: "\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])" },
  { name: "Hex Color", pattern: "#(?:[0-9a-fA-F]{3}){1,2}\\b" },
];

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false, u: false });
  const [testString, setTestString] = useState("");
  const [showReplace, setShowReplace] = useState(false);
  const [replacement, setReplacement] = useState("");

  const flagString = Object.entries(flags)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join("");

  const { matches, error, highlightedHtml, replaceResult } = useMemo(() => {
    if (!pattern) return { matches: [] as MatchInfo[], error: "", highlightedHtml: "", replaceResult: "" };
    try {
      const regex = new RegExp(pattern, flagString);
      const matchList: MatchInfo[] = [];
      let match: RegExpExecArray | null;

      if (flags.g) {
        while ((match = regex.exec(testString)) !== null) {
          matchList.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });
          if (match[0].length === 0) regex.lastIndex++;
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          matchList.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });
        }
      }

      // Build highlighted HTML
      let html = "";
      let lastIndex = 0;
      let colorToggle = false;
      const sortedMatches = [...matchList].sort((a, b) => a.index - b.index);
      for (const m of sortedMatches) {
        const before = testString.slice(lastIndex, m.index);
        html += escapeHtml(before);
        const cls = colorToggle ? "regex-match-alt" : "regex-match";
        html += `<span class="${cls}">${escapeHtml(m.match)}</span>`;
        lastIndex = m.index + m.match.length;
        colorToggle = !colorToggle;
      }
      html += escapeHtml(testString.slice(lastIndex));

      // Replace result
      let rr = "";
      if (showReplace && replacement !== undefined) {
        try {
          rr = testString.replace(new RegExp(pattern, flagString), replacement);
        } catch {
          rr = "";
        }
      }

      return { matches: matchList, error: "", highlightedHtml: html, replaceResult: rr };
    } catch (e: unknown) {
      return {
        matches: [] as MatchInfo[],
        error: e instanceof Error ? e.message : "Invalid regex",
        highlightedHtml: "",
        replaceResult: "",
      };
    }
  }, [pattern, flagString, testString, flags.g, showReplace, replacement]);

  function escapeHtml(str: string): string {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  return (
    <ToolLayout
      title="Regex Tester"
      description="Test regular expressions with live highlighting, match info, and replace mode."
      category="Developer"
      slug="regex-tester"
      keywords={[
        "regex tester",
        "regex tester online",
        "regular expression tester",
        "test regex pattern",
        "regex match highlighter",
        "regex replace tool",
        "JavaScript regex tester",
      ]}
      guide={
        <>
          <h2>What Is the Regex Tester?</h2>
          <p>
            The Regex Tester is an online tool for writing, testing, and debugging regular expressions in real time. Type a pattern and a test string, and the tool instantly highlights all matches, shows match details including capture groups, and lets you test find-and-replace operations.
          </p>
          <p>
            This tool uses the JavaScript regular expression engine, so your patterns behave exactly as they would in JavaScript, TypeScript, or Node.js code. It is ideal for developers building validation rules, parsing logic, or text transformations.
          </p>

          <h3>How to Use the Regex Tester</h3>
          <ul>
            <li>Enter your regular expression pattern in the Pattern field. The tool wraps it in forward slashes automatically.</li>
            <li>Toggle flags using the checkboxes: g (global), i (case-insensitive), m (multiline), s (dotAll), and u (unicode).</li>
            <li>Paste or type your test string in the text area below. Matches are highlighted instantly in the Highlighted Matches section.</li>
            <li>Scroll down to see a numbered list of every match, its position in the string, and any captured groups.</li>
            <li>Click Show Replace Mode to enter a replacement pattern. The tool shows the result of applying your regex replacement to the entire test string.</li>
            <li>Use the Common Patterns sidebar to load pre-built patterns for emails, URLs, phone numbers, IP addresses, dates, and hex colors.</li>
          </ul>

          <h3>Understanding Regex Flags</h3>
          <p>
            The global flag (g) finds all matches instead of stopping at the first one. Case-insensitive (i) ignores letter casing. Multiline (m) makes ^ and $ match line boundaries. DotAll (s) makes the dot character match newlines. Unicode (u) enables full Unicode matching for characters outside the basic Latin set.
          </p>

          <h3>Tips for Writing Better Regular Expressions</h3>
          <ul>
            <li>Start with a simple pattern and refine it incrementally while watching the matches update</li>
            <li>Use capture groups with parentheses to extract specific parts of a match</li>
            <li>Test edge cases by including unusual input in your test string</li>
            <li>Use the replace mode to verify that your regex-based transformations produce correct output</li>
            <li>Check the error message area if your pattern is invalid, as it shows the exact JavaScript error</li>
          </ul>

          <h3>Common Use Cases</h3>
          <ul>
            <li>Validating email addresses, URLs, or phone numbers in form input</li>
            <li>Extracting data from log files or structured text</li>
            <li>Building search-and-replace operations for code refactoring</li>
            <li>Learning regular expression syntax with instant visual feedback</li>
          </ul>
        </>
      }
      faqs={[
        {
          question: "How do I test a regex pattern online?",
          answer: "Enter your pattern in the Pattern field and paste your test text below it. The tool highlights all matches in real time and shows detailed match information including index positions and capture groups."
        },
        {
          question: "What regex engine does this tester use?",
          answer: "This tool uses the native JavaScript RegExp engine. Patterns behave identically to how they run in JavaScript, TypeScript, and Node.js, making it ideal for web development testing."
        },
        {
          question: "How do I use capture groups in regex?",
          answer: "Wrap part of your pattern in parentheses to create a capture group. For example, (\\d{4})-(\\d{2}) captures a year and month separately. The tool displays captured groups for each match below the highlighted results."
        },
        {
          question: "Can I do regex find and replace with this tool?",
          answer: "Yes. Click Show Replace Mode, enter your replacement pattern using $1, $2 for group references, and the tool shows the replaced output in real time. You can copy the result with one click."
        },
        {
          question: "What does the global flag (g) do in regex?",
          answer: "The global flag tells the regex engine to find all matches in the string instead of stopping after the first one. Without it, only the first match is returned."
        },
        {
          question: "How do I match an email address with regex?",
          answer: "Click the Email button in the Common Patterns sidebar to load a standard email-matching pattern. You can then modify it to fit your specific validation needs and test it against sample email addresses."
        },
      ] as FAQ[]}
      relatedTools={[
        { name: "JSON Formatter", href: "/tools/json-formatter" },
        { name: "Base64 Encoder", href: "/tools/base64-encoder" },
        { name: "Markdown Preview", href: "/tools/markdown-preview" },
        { name: "Word Counter", href: "/tools/word-counter" },
      ] as RelatedTool[]}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Pattern */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">Pattern</label>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern..."
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
              />
              <span className="text-zinc-500">/{flagString}</span>
            </div>
          </div>

          {/* Flags */}
          <div className="flex flex-wrap items-center gap-3">
            {(["g", "i", "m", "s", "u"] as const).map((f) => (
              <label key={f} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flags[f]}
                  onChange={(e) => setFlags((prev) => ({ ...prev, [f]: e.target.checked }))}
                  className="accent-blue-500"
                />
                <span className="text-sm text-zinc-300 font-mono">{f}</span>
                <span className="text-xs text-zinc-500">
                  ({f === "g" ? "global" : f === "i" ? "case-insensitive" : f === "m" ? "multiline" : f === "s" ? "dotAll" : "unicode"})
                </span>
              </label>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Test string */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">Test String</label>
            <textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              rows={6}
              placeholder="Enter text to test against..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 font-mono text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 resize-y"
            />
          </div>

          {/* Highlighted result */}
          {highlightedHtml && (
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-300">Highlighted Matches</label>
              <div
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 font-mono text-sm text-zinc-100 whitespace-pre-wrap break-all"
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              />
            </div>
          )}

          {/* Replace mode */}
          <div>
            <button
              onClick={() => setShowReplace(!showReplace)}
              className="mb-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              {showReplace ? "Hide" : "Show"} Replace Mode
            </button>
            {showReplace && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={replacement}
                  onChange={(e) => setReplacement(e.target.value)}
                  placeholder="Replacement pattern (e.g., $1-$2)"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500"
                />
                {replaceResult && (
                  <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-zinc-400">Result</label>
                      <CopyButton text={replaceResult} label="Copy" className="text-xs px-2 py-0.5" />
                    </div>
                    <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap">{replaceResult}</pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Matches list */}
          {matches.length > 0 && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <h3 className="mb-2 text-sm font-semibold text-zinc-300">
                {matches.length} Match{matches.length !== 1 ? "es" : ""}
              </h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {matches.map((m, i) => (
                  <div key={i} className="rounded bg-zinc-800 px-3 py-2 text-sm">
                    <span className="text-zinc-400">#{i + 1}</span>{" "}
                    <code className="text-blue-300">&quot;{m.match}&quot;</code>{" "}
                    <span className="text-zinc-500">at index {m.index}</span>
                    {m.groups.length > 0 && (
                      <div className="mt-1 text-xs text-zinc-500">
                        Groups: {m.groups.map((g, gi) => (
                          <span key={gi} className="mr-2">
                            ${gi + 1}=&quot;<span className="text-purple-300">{g}</span>&quot;
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - common patterns */}
        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <h3 className="mb-3 text-sm font-semibold text-zinc-300">Common Patterns</h3>
            <div className="space-y-2">
              {commonPatterns.map((cp) => (
                <button
                  key={cp.name}
                  onClick={() => setPattern(cp.pattern)}
                  className="w-full rounded bg-zinc-800 px-3 py-2 text-left transition-colors hover:bg-zinc-700"
                >
                  <div className="text-sm font-medium text-zinc-300">{cp.name}</div>
                  <code className="text-xs text-zinc-500 break-all">{cp.pattern}</code>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
