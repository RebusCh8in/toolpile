"use client";

import { useState, useCallback } from "react";
import ToolLayout, { FAQ, RelatedTool } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const faqs: FAQ[] = [
  {
    question: "How do I format JSON online?",
    answer: "Paste your raw or minified JSON into the input field and click Format. The tool parses and pretty-prints it with your chosen indentation (2 spaces, 4 spaces, or tabs) and applies syntax highlighting for easy reading."
  },
  {
    question: "How do I validate if my JSON is correct?",
    answer: "Click the Validate button after pasting your JSON. The tool will tell you whether the JSON is valid or display the exact parsing error with a description of what went wrong and where."
  },
  {
    question: "What is the difference between formatting and minifying JSON?",
    answer: "Formatting adds whitespace and line breaks to make JSON human-readable. Minifying removes all unnecessary whitespace to produce the smallest possible output, which is useful for reducing payload size in APIs and config files."
  },
  {
    question: "Can I format large JSON files in this tool?",
    answer: "Yes. Since the tool runs entirely in your browser, it can handle large JSON payloads. For files over 10 MB, you may experience a brief delay while parsing. There is no server-side limit."
  },
  {
    question: "Is my JSON data sent to a server?",
    answer: "No. All formatting, minifying, and validation happens locally in your browser. Your data never leaves your device, making this tool safe for sensitive API responses and configuration files."
  },
  {
    question: "Does the formatter support JSON with comments?",
    answer: "No. The tool uses the standard JSON parser which does not allow comments. If your JSON contains comments (JSONC), you will need to remove them before pasting. Consider using a JSONC-aware editor for commented files."
  }
]

const relatedTools: RelatedTool[] = [
  { name: "Base64 Encoder", href: "/tools/base64-encoder" },
  { name: "Regex Tester", href: "/tools/regex-tester" },
  { name: "Markdown Preview", href: "/tools/markdown-preview" },
  { name: "UUID Generator", href: "/tools/uuid-generator" }
]

function syntaxHighlight(json: string): string {
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = "json-number";
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "json-key";
        } else {
          cls = "json-string";
        }
      } else if (/true|false/.test(match)) {
        cls = "json-boolean";
      } else if (/null/.test(match)) {
        cls = "json-null";
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

type IndentType = "2" | "4" | "tab";

export default function JSONFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [highlighted, setHighlighted] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState<IndentType>("2");

  const getIndent = (): string | number => {
    switch (indent) {
      case "2": return 2;
      case "4": return 4;
      case "tab": return "\t";
    }
  };

  const format = useCallback(() => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, getIndent());
      setOutput(formatted);
      setHighlighted(syntaxHighlight(formatted));
      setError("");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Invalid JSON";
      setError(msg);
      setOutput("");
      setHighlighted("");
    }
  }, [input, indent]);

  const minify = useCallback(() => {
    try {
      const parsed = JSON.parse(input);
      const mini = JSON.stringify(parsed);
      setOutput(mini);
      setHighlighted(syntaxHighlight(mini));
      setError("");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Invalid JSON";
      setError(msg);
      setOutput("");
      setHighlighted("");
    }
  }, [input]);

  const validate = useCallback(() => {
    try {
      JSON.parse(input);
      setError("");
      setOutput("Valid JSON!");
      setHighlighted("<span class='json-boolean'>Valid JSON!</span>");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Invalid JSON";
      setError(msg);
    }
  }, [input]);

  const clear = () => {
    setInput("");
    setOutput("");
    setHighlighted("");
    setError("");
  };

  return (
    <ToolLayout
      title="JSON Formatter"
      description="Prettify, minify, and validate JSON with syntax highlighting."
      category="Developer"
      slug="json-formatter"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={[
        "json formatter",
        "json beautifier",
        "json validator online",
        "json pretty print",
        "format json online",
        "minify json",
        "json syntax checker",
        "json formatter with highlighting"
      ]}
      guide={
        <>
          <h2>What Is the JSON Formatter?</h2>
          <p>
            The JSON Formatter is a free online tool for formatting, minifying, and validating JSON data. It features syntax highlighting that color-codes keys, strings, numbers, booleans, and null values so you can read and debug JSON at a glance.
          </p>
          <p>
            All processing runs in your browser. Your data is never sent to a server, making this tool safe for working with API responses, configuration files, and any JSON that contains sensitive information.
          </p>

          <h3>How to Format JSON</h3>
          <p>Getting nicely formatted JSON takes just a couple of clicks:</p>
          <ul>
            <li>Paste your raw or minified JSON into the Input text area on the left.</li>
            <li>Click Format to pretty-print with your chosen indentation (2 spaces, 4 spaces, or tabs).</li>
            <li>The formatted output appears on the right with syntax highlighting.</li>
            <li>Click Copy to copy the formatted JSON to your clipboard.</li>
          </ul>

          <h3>Minifying JSON</h3>
          <p>
            Click the Minify button to strip all whitespace and line breaks from your JSON, producing the most compact representation. This is useful when you need to reduce payload size for APIs, embed JSON in URL parameters, or store JSON in space-constrained environments.
          </p>

          <h3>Validating JSON</h3>
          <p>
            Click Validate to check whether your input is valid JSON. If there is a syntax error, the tool displays the error message with details about what went wrong — such as unexpected tokens, missing commas, or unclosed brackets — so you can find and fix the problem quickly.
          </p>

          <h3>Tips for Working with JSON</h3>
          <ul>
            <li>JSON keys must be double-quoted strings. Single quotes will cause a parse error.</li>
            <li>Trailing commas after the last item in an array or object are not valid JSON.</li>
            <li>Use 2-space indentation for compact readability, or 4-space for codebases that follow that convention.</li>
            <li>If you are debugging a large API response, format first, then use your browser's find function to search within the output.</li>
          </ul>

          <h3>Common Use Cases</h3>
          <ul>
            <li>Formatting API responses for debugging and documentation.</li>
            <li>Validating configuration files before deployment.</li>
            <li>Minifying JSON payloads for production environments.</li>
            <li>Inspecting webhook payloads and event data.</li>
            <li>Converting between compact and readable JSON during development.</li>
          </ul>
        </>
      }
    >
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={format} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors">
            Format
          </button>
          <button onClick={minify} className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-600 transition-colors">
            Minify
          </button>
          <button onClick={validate} className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-600 transition-colors">
            Validate
          </button>
          <button onClick={clear} className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-700 transition-colors">
            Clear
          </button>
          <div className="ml-auto flex items-center gap-2">
            <label className="text-sm text-zinc-400">Indent:</label>
            <select
              value={indent}
              onChange={(e) => setIndent(e.target.value as IndentType)}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-100 outline-none focus:border-blue-500"
            >
              <option value="2">2 Spaces</option>
              <option value="4">4 Spaces</option>
              <option value="tab">Tab</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Input */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">Input</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Paste JSON here... e.g. {"key": "value"}'
              rows={20}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 font-mono text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 resize-y"
              spellCheck={false}
            />
          </div>

          {/* Output */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-300">Output</label>
              {output && <CopyButton text={output} className="text-xs px-2 py-1" />}
            </div>
            <div className="min-h-[480px] overflow-auto rounded-lg border border-zinc-700 bg-zinc-800 p-4">
              {highlighted ? (
                <pre
                  className="whitespace-pre-wrap font-mono text-sm"
                  dangerouslySetInnerHTML={{ __html: highlighted }}
                />
              ) : (
                <p className="text-zinc-500 text-sm">Formatted output will appear here...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
