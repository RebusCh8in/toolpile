"use client";

import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ToolLayout, { FAQ, RelatedTool } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const DEFAULT_MARKDOWN = `# Welcome to the Markdown Preview

This is a **live preview** editor. Start typing on the left to see the rendered output on the right.

## Features

- **Bold**, *italic*, and ~~strikethrough~~ text
- [Links](https://example.com) and images
- Code blocks with syntax highlighting

### Code Example

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
greet("World");
\`\`\`

### Table Example

| Feature | Status |
|---------|--------|
| GFM Tables | Supported |
| Task Lists | Supported |
| Strikethrough | Supported |

### Task List

- [x] Write Markdown
- [x] Preview output
- [ ] Export to HTML

> Blockquotes are also supported and look great in dark mode.

---

Enjoy writing Markdown!
`;

const toolbarActions = [
  { label: "B", title: "Bold", before: "**", after: "**", placeholder: "bold text" },
  { label: "I", title: "Italic", before: "*", after: "*", placeholder: "italic text" },
  { label: "H1", title: "Heading 1", before: "# ", after: "", placeholder: "heading" },
  { label: "H2", title: "Heading 2", before: "## ", after: "", placeholder: "heading" },
  { label: "H3", title: "Heading 3", before: "### ", after: "", placeholder: "heading" },
  { label: "Link", title: "Link", before: "[", after: "](url)", placeholder: "link text" },
  { label: "Img", title: "Image", before: "![", after: "](url)", placeholder: "alt text" },
  { label: "Code", title: "Inline Code", before: "`", after: "`", placeholder: "code" },
  { label: "```", title: "Code Block", before: "```\n", after: "\n```", placeholder: "code block" },
  { label: "List", title: "Unordered List", before: "- ", after: "", placeholder: "list item" },
  { label: "1.", title: "Ordered List", before: "1. ", after: "", placeholder: "list item" },
];

export default function MarkdownPreviewPage() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);

  const insertText = useCallback(
    (before: string, after: string, placeholder: string) => {
      const textarea = document.getElementById("md-editor") as HTMLTextAreaElement;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = markdown.substring(start, end);
      const text = selected || placeholder;
      const newText = markdown.substring(0, start) + before + text + after + markdown.substring(end);
      setMarkdown(newText);
      // Set cursor position after React re-render
      setTimeout(() => {
        textarea.focus();
        const newPos = start + before.length + text.length;
        textarea.setSelectionRange(
          start + before.length,
          newPos
        );
      }, 0);
    },
    [markdown]
  );

  const exportHtml = () => {
    // Create a temporary container to get rendered HTML
    const previewEl = document.getElementById("md-preview");
    if (!previewEl) return;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Markdown Export</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
code { background: #f4f4f5; padding: 2px 6px; border-radius: 4px; font-size: 0.875em; }
pre { background: #f4f4f5; padding: 1rem; border-radius: 8px; overflow-x: auto; }
pre code { background: none; padding: 0; }
blockquote { border-left: 3px solid #3b82f6; padding-left: 1rem; color: #6b7280; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #e5e7eb; padding: 0.5rem; text-align: left; }
th { background: #f9fafb; }
img { max-width: 100%; }
</style>
</head>
<body>
${previewEl.innerHTML}
</body>
</html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "markdown-export.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout
      title="Markdown Preview"
      description="Write and preview Markdown with a live split-pane editor. Supports GFM (GitHub Flavored Markdown)."
      category="Text"
      slug="markdown-preview"
      keywords={[
        "markdown preview",
        "markdown editor online",
        "markdown to HTML",
        "live markdown preview",
        "GitHub flavored markdown editor",
        "markdown renderer",
        "GFM preview tool",
      ]}
      guide={
        <>
          <h2>What Is the Markdown Preview Tool?</h2>
          <p>
            The Markdown Preview tool is a free online split-pane editor that lets you write Markdown on the left and see the rendered output on the right in real time. It supports GitHub Flavored Markdown (GFM), including tables, task lists, strikethrough, and fenced code blocks.
          </p>
          <p>
            Whether you are drafting a README for a GitHub repository, writing documentation, composing a blog post, or learning Markdown syntax, this tool gives you instant visual feedback as you type.
          </p>

          <h3>How to Use the Markdown Preview Editor</h3>
          <ul>
            <li>Type or paste your Markdown content in the editor pane on the left. The preview pane on the right updates automatically as you type.</li>
            <li>Use the formatting toolbar at the top to insert bold, italic, headings, links, images, code blocks, and lists without memorizing syntax.</li>
            <li>Click Export HTML to download the rendered output as a standalone HTML file with clean styling.</li>
            <li>Click Copy MD to copy your raw Markdown text to the clipboard.</li>
            <li>Expand the Markdown Cheat Sheet at the bottom for a quick reference of all supported syntax.</li>
          </ul>

          <h3>Supported Markdown Features</h3>
          <p>
            This editor supports the full CommonMark specification plus GitHub Flavored Markdown extensions. You can use headings (h1 through h6), bold, italic, and strikethrough text, ordered and unordered lists, blockquotes, horizontal rules, inline code and fenced code blocks, links, images, tables with alignment, and task list checkboxes.
          </p>

          <h3>Tips for Writing Better Markdown</h3>
          <ul>
            <li>Use headings hierarchically: start with h1 for the title, h2 for sections, h3 for subsections</li>
            <li>Leave a blank line between paragraphs and before/after lists for proper rendering</li>
            <li>Use fenced code blocks with a language identifier for syntax highlighting in supported renderers</li>
            <li>Preview your content frequently to catch formatting issues early</li>
            <li>Use the toolbar buttons to learn the syntax for elements you use less often</li>
          </ul>

          <h3>Common Use Cases</h3>
          <ul>
            <li>Writing and previewing GitHub README files before committing</li>
            <li>Drafting documentation or technical writing in Markdown</li>
            <li>Composing blog posts for static site generators like Hugo, Jekyll, or Astro</li>
            <li>Learning Markdown syntax with instant visual feedback</li>
            <li>Converting Markdown to HTML for embedding in websites or emails</li>
          </ul>
        </>
      }
      faqs={[
        {
          question: "How do I preview Markdown online?",
          answer: "Paste or type your Markdown in the editor pane on the left side of this tool. The rendered preview appears instantly on the right side, updating in real time as you make changes."
        },
        {
          question: "Does this tool support GitHub Flavored Markdown?",
          answer: "Yes. The editor fully supports GFM extensions including tables, task lists with checkboxes, strikethrough text, and fenced code blocks. It uses the remark-gfm parser for accurate rendering."
        },
        {
          question: "Can I export Markdown as HTML?",
          answer: "Yes. Click the Export HTML button in the toolbar to download a standalone HTML file with embedded CSS styling. The file is ready to open in any browser or embed in a website."
        },
        {
          question: "How do I create a table in Markdown?",
          answer: "Use pipes (|) to separate columns and hyphens (-) to create the header row divider. For example: | Column 1 | Column 2 | followed by |----------|----------| and then your data rows. The preview pane shows the rendered table instantly."
        },
        {
          question: "What is the difference between Markdown and HTML?",
          answer: "Markdown is a lightweight text formatting syntax that is easier to read and write than HTML. It gets converted to HTML for display. This tool lets you write in Markdown and see the resulting HTML output side by side."
        },
        {
          question: "Can I use this editor for GitHub README files?",
          answer: "Absolutely. This editor supports the same GFM syntax that GitHub uses, so your README will render the same way. Write your content here, preview it, and then copy the Markdown into your repository."
        },
      ] as FAQ[]}
      relatedTools={[
        { name: "Word Counter", href: "/tools/word-counter" },
        { name: "Lorem Ipsum Generator", href: "/tools/lorem-ipsum-generator" },
        { name: "JSON Formatter", href: "/tools/json-formatter" },
        { name: "Regex Tester", href: "/tools/regex-tester" },
      ] as RelatedTool[]}
    >
      <div className="space-y-3">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5">
          {toolbarActions.map((action) => (
            <button
              key={action.label}
              onClick={() => insertText(action.before, action.after, action.placeholder)}
              title={action.title}
              className="rounded px-2 py-1 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            >
              {action.label}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            <button
              onClick={exportHtml}
              className="rounded-lg bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              Export HTML
            </button>
            <CopyButton text={markdown} label="Copy MD" className="text-xs px-2 py-1" />
          </div>
        </div>

        {/* Split pane */}
        <div className="grid gap-4 lg:grid-cols-2" style={{ minHeight: "500px" }}>
          {/* Editor */}
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium text-zinc-500 uppercase tracking-wider">Editor</label>
            <textarea
              id="md-editor"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 font-mono text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 resize-none"
              spellCheck={false}
            />
          </div>

          {/* Preview */}
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium text-zinc-500 uppercase tracking-wider">Preview</label>
            <div
              id="md-preview"
              className="markdown-preview flex-1 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-800 px-6 py-4 text-zinc-200"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Cheat sheet */}
        <details className="rounded-lg border border-zinc-800 bg-zinc-900">
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-zinc-300 hover:text-zinc-100">
            Markdown Cheat Sheet
          </summary>
          <div className="grid gap-2 px-4 pb-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { syntax: "**bold**", desc: "Bold text" },
              { syntax: "*italic*", desc: "Italic text" },
              { syntax: "~~strike~~", desc: "Strikethrough" },
              { syntax: "# Heading", desc: "Heading (1-6)" },
              { syntax: "[text](url)", desc: "Link" },
              { syntax: "![alt](url)", desc: "Image" },
              { syntax: "`code`", desc: "Inline code" },
              { syntax: "```lang```", desc: "Code block" },
              { syntax: "> quote", desc: "Blockquote" },
              { syntax: "- item", desc: "Unordered list" },
              { syntax: "1. item", desc: "Ordered list" },
              { syntax: "---", desc: "Horizontal rule" },
              { syntax: "| a | b |", desc: "Table" },
              { syntax: "- [x] task", desc: "Task list" },
            ].map((item) => (
              <div key={item.syntax} className="flex items-center gap-2 rounded bg-zinc-800 px-3 py-2">
                <code className="text-xs text-blue-300">{item.syntax}</code>
                <span className="text-xs text-zinc-500">{item.desc}</span>
              </div>
            ))}
          </div>
        </details>
      </div>
    </ToolLayout>
  );
}
