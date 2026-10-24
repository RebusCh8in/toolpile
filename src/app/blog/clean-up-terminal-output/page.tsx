import type { Metadata } from "next";
import BlogLayout, { ToolCTA } from "@/components/BlogLayout";
import Link from "next/link";

const post = {
  title: "How to Clean Up Messy Terminal & Claude Code Output (2026)",
  slug: "clean-up-terminal-output",
  description: "Copying text from a terminal often brings invisible ANSI color codes, line-number gutters, and control characters. Here is what causes the mess and how to strip it for clean, paste-ready text.",
  datePublished: "2026-06-28",
  dateModified: "2026-06-28",
  tags: ["Terminal", "Claude Code", "ANSI Codes", "Developer Tools", "CLI"],
  faqs: [
    { question: "Why does text I copy from the terminal have weird symbols like [0;32m?", answer: "Those are ANSI escape codes. Terminals use them to add color and formatting, but they are invisible while displayed. When you copy colored output into a plain-text field that does not understand them, the raw codes show up as garbage like [0;32m or ^[[1m. Stripping the ANSI codes restores clean text." },
    { question: "How do I remove line numbers from copied code?", answer: "Code shown in tools like Claude Code, 'cat -n', or 'grep -n' includes a line-number gutter — a number followed by a tab, an arrow, or a pipe before each line. To paste the code back into an editor, you need to strip that gutter. A formatter that removes leading 'number + separator' patterns does this in one step while preserving the code's real indentation." },
    { question: "What are zero-width and control characters?", answer: "Control characters are non-printing bytes (like the ESC character or a vertical tab) that instruct the terminal rather than display text. Zero-width characters (such as U+200B) are invisible spacing characters that sometimes hide inside copied text. Both can break diffs, search, and code without you seeing them, so it helps to remove them." },
    { question: "Is it safe to paste sensitive terminal output into an online formatter?", answer: "Only if the tool processes everything locally in your browser and never uploads your text. ToolPile's formatter runs entirely client-side — your text never leaves your device and nothing is stored. Always confirm a tool is browser-based before pasting anything sensitive like logs or config output." },
    { question: "Will cleaning the text remove my code's indentation?", answer: "A good formatter only strips leading line-number gutters and trailing whitespace. Meaningful indentation — the spaces and tabs that are part of your code structure — is preserved, so your formatting stays intact when you paste it back." },
  ],
  relatedTools: [
    { name: "Claude Code Text Formatter", href: "/tools/claude-code-text-formatter" },
    { name: "Diff Checker", href: "/tools/diff-checker" },
    { name: "Word Counter", href: "/tools/word-counter" },
    { name: "Text Case Converter", href: "/tools/text-case-converter" },
    { name: "JSON Formatter", href: "/tools/json-formatter" },
  ],
  relatedArticles: [
    { title: "The Best CSS Generators for Developers", href: "/blog/best-css-generators" },
  ] as { title: string; href: string }[],
};

export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  alternates: { canonical: `https://toolpile.app/blog/${post.slug}` },
  openGraph: { title: post.title, description: post.description, url: `https://toolpile.app/blog/${post.slug}`, siteName: "ToolPile", type: "article", publishedTime: post.datePublished, modifiedTime: post.dateModified, tags: post.tags },
  twitter: { card: "summary_large_image", title: post.title, description: post.description },
};

export default function Page() {
  return (
    <BlogLayout post={post}>
      <p className="text-lg text-zinc-300 mb-8">
        You run a command, get a perfect result on screen, copy it, and paste it into a document, a
        bug report, or an AI prompt — and suddenly it is full of strange brackets, the indentation is
        off, and there are line numbers stuck to every row. The terminal looked clean, so where did
        the mess come from? The answer is that a lot of what a terminal displays is made of invisible
        instructions, not text. This guide explains what those hidden characters are and how to strip
        them so your copied output is clean and paste-ready. If you just want the quick fix,{" "}
        <Link href="/tools/claude-code-text-formatter" className="text-blue-400 hover:text-blue-300">paste your text into the Claude Code Text Formatter</Link>{" "}
        and copy the cleaned result.
      </p>

      <section id="why-terminal-output-is-messy">
        <h2>Why Terminal Output Gets Messy When You Copy It</h2>
        <p>
          A terminal does two things at once: it shows you text, and it interprets hidden control
          instructions that change how that text looks and where the cursor goes. While you are
          looking at the terminal, those instructions are invisible — they have already done their
          job. But when you select and copy, you copy <strong>everything</strong>, including the
          hidden parts. Paste that into a place that does not understand terminal instructions and the
          hidden parts become visible garbage.
        </p>
        <p>
          There are five common culprits. Here is what each looks like and why it appears.
        </p>
        <table>
          <thead>
            <tr><th>Culprit</th><th>What it looks like when pasted</th><th>Where it comes from</th></tr>
          </thead>
          <tbody>
            <tr><td>ANSI escape codes</td><td><code>[0;32m</code>, <code>^[[1m</code></td><td>Colors, bold, and cursor moves</td></tr>
            <tr><td>Line-number gutters</td><td><code>123→</code>, <code>123|</code></td><td>File readers, <code>cat -n</code>, <code>grep -n</code></td></tr>
            <tr><td>Control characters</td><td>Invisible / odd spacing</td><td>ESC, vertical tab, null bytes</td></tr>
            <tr><td>Box-drawing characters</td><td>─ │ ┌ └ ┤ ┬</td><td>Tables, tree views, frames</td></tr>
            <tr><td>Carriage returns</td><td>Doubled or broken lines</td><td>Windows CRLF, progress bars</td></tr>
          </tbody>
        </table>
      </section>

      <section id="ansi-escape-codes">
        <h2>ANSI Escape Codes: The Color Problem</h2>
        <p>
          The most common source of garbage is <strong>ANSI escape codes</strong>. These are sequences
          that begin with the ESC character (often written as <code>\x1b</code>, <code>\033</code>, or
          shown as <code>^[</code>) followed by a bracket and some numbers ending in a letter. Your
          terminal reads <code>\x1b[32m</code> as &quot;switch the text color to green&quot; and
          <code> \x1b[0m</code> as &quot;reset formatting.&quot; You never see the codes themselves —
          only the green text.
        </p>
        <p>
          The trouble starts when the destination does not speak ANSI. A plain text field, a Markdown
          editor, or a chat box just prints the raw codes. A line that showed as a tidy green
          <code> Success</code> in your terminal can paste as:
        </p>
        <ul>
          <li><code>[0;32mSuccess[0m</code></li>
        </ul>
        <p>
          Multiply that across a long log and the output becomes unreadable. Removing ANSI codes is
          almost always the first cleanup step. On the command line you can strip them with a tool
          like <code>sed</code>:
        </p>
        <ul>
          <li><code>sed &apos;s/\x1b\[[0-9;]*m//g&apos; input.txt</code></li>
        </ul>
        <p>
          That works for color codes, but real terminal output also contains cursor-movement and
          clear-screen sequences that the simple pattern above misses. A dedicated formatter handles
          the full range of escape sequences in one pass, which is why it is more reliable than a
          quick regex for anything beyond plain colors.
        </p>
      </section>

      <section id="line-number-gutters">
        <h2>Line-Number Gutters from Claude Code and CLI Tools</h2>
        <p>
          When an AI coding assistant like Claude Code reads a file, or when you run <code>cat -n</code>{" "}
          or <code>grep -n</code>, each line is prefixed with its line number. This is great for
          reference — you can say &quot;the bug is on line 42&quot; — but it ruins the text the moment
          you try to paste the code back into an editor, because now every line starts with a number
          and a separator that is not part of your code.
        </p>
        <p>
          The gutter usually takes one of three forms:
        </p>
        <ul>
          <li><strong>Arrow style:</strong> <code>  42→const x = 1</code> (used by Claude Code file reads)</li>
          <li><strong>Tab style:</strong> <code>  42	const x = 1</code> (used by <code>cat -n</code>)</li>
          <li><strong>Pipe style:</strong> <code>42 | const x = 1</code> (used by many code viewers)</li>
        </ul>
        <p>
          The key when stripping these is to remove only the <strong>leading</strong> number and its
          separator, not any numbers inside your actual code, and to keep the real indentation that
          follows. A careful formatter matches the gutter pattern at the start of each line and leaves
          everything else untouched, so <code>  42→    return value</code> becomes{" "}
          <code>    return value</code> with its four-space indent intact.
        </p>

        <ToolCTA
          name="Claude Code Text Formatter"
          href="/tools/claude-code-text-formatter"
          description="Paste output with line numbers, ANSI codes, or control characters and get clean text back. Runs entirely in your browser."
        />
      </section>

      <section id="control-and-zero-width-characters">
        <h2>Control and Zero-Width Characters: The Invisible Mess</h2>
        <p>
          Some of the worst problems are the ones you cannot see at all. <strong>Control characters</strong>{" "}
          are non-printing bytes such as the ESC character, the vertical tab, the form feed, and null
          bytes. <strong>Zero-width characters</strong> like the zero-width space (U+200B) and the
          byte-order mark (U+FEFF) take up no visible room but are still really there in the text.
        </p>
        <p>
          These cause subtle, maddening bugs. A password copied from a terminal might fail to
          authenticate because a zero-width character rode along. A diff might show two identical-looking
          lines as different. A search for a function name might come up empty because an invisible
          character is wedged in the middle. Because you cannot see them, you can waste a long time
          chasing the cause. Stripping all non-printing and zero-width characters — while keeping
          ordinary tabs and newlines — eliminates this entire class of problem.
        </p>
      </section>

      <section id="box-drawing-and-carriage-returns">
        <h2>Box-Drawing Characters and Carriage Returns</h2>
        <h3>Box-drawing characters</h3>
        <p>
          Command-line tools love to draw boxes. Tables, dependency trees, and framed status panels
          use characters like <code>─</code>, <code>│</code>, <code>┌</code>, and <code>└</code> to
          create borders. When you only want the data inside a table — not the frame around it —
          those characters are noise. Removing the box-drawing range leaves just the content, which is
          much easier to reuse in a spreadsheet or a document. Keep in mind this is optional: sometimes
          the box layout is exactly what you want to preserve.
        </p>
        <h3>Carriage returns and progress bars</h3>
        <p>
          Windows systems end lines with a carriage return plus a line feed (<code>\r\n</code>), while
          macOS and Linux use just a line feed (<code>\n</code>). Paste Windows output into a
          Unix-oriented tool and you can get doubled or broken line breaks. Progress bars are worse:
          they use a lone carriage return to overwrite the same line repeatedly, so a copied progress
          bar can paste as a pile of half-finished lines. Normalizing line endings to a single
          standard fixes both.
        </p>
      </section>

      <section id="when-you-need-clean-output">
        <h2>When Clean Output Actually Matters</h2>
        <p>
          You do not need to clean every snippet, but several situations make it essential:
        </p>
        <ul>
          <li><strong>Pasting into AI prompts:</strong> ANSI codes and gutters waste tokens and can confuse a model. Clean code in, better answers out.</li>
          <li><strong>Filing bug reports and tickets:</strong> Reviewers should read your logs, not decode escape sequences. Clean output looks professional and is searchable.</li>
          <li><strong>Writing documentation:</strong> Code blocks in docs need to be copy-paste-ready for your readers, with no stray line numbers.</li>
          <li><strong>Commit messages and code review:</strong> Pasting terminal output into a description is common; invisible characters there can break formatting downstream.</li>
          <li><strong>Reusing data from tables:</strong> Pulling values out of a CLI table into a spreadsheet is far easier without the border characters.</li>
        </ul>
      </section>

      <section id="how-to-clean-it">
        <h2>How to Clean It: Tool vs Command Line</h2>
        <p>
          You have two practical options. On the command line, you can chain tools — <code>sed</code>{" "}
          to strip ANSI codes, <code>tr</code> to delete control characters, and{" "}
          <code>awk</code> or <code>cut</code> to remove gutters. This works well in scripts and
          pipelines where you want repeatable automation.
        </p>
        <p>
          For a quick one-off — you have text on your clipboard right now and just want it clean — a
          browser tool is faster and you can see the result instantly. The{" "}
          <Link href="/tools/claude-code-text-formatter" className="text-blue-400 hover:text-blue-300">Claude Code Text Formatter</Link>{" "}
          does all of the above with toggles for each cleanup step, runs entirely in your browser, and
          never uploads your text. Paste, pick what to strip, and copy. If you also need to compare two
          versions of cleaned output, the{" "}
          <Link href="/tools/diff-checker" className="text-blue-400 hover:text-blue-300">Diff Checker</Link>{" "}
          pairs well with it.
        </p>
      </section>

      <section id="key-takeaways">
        <h2>Key Takeaways</h2>
        <ul>
          <li>Terminals display text and hidden instructions together; copying grabs both, so the hidden parts can become visible garbage.</li>
          <li>ANSI escape codes (like <code>[0;32m</code>) carry color and formatting and are the most common source of mess.</li>
          <li>Line-number gutters from Claude Code, <code>cat -n</code>, and <code>grep -n</code> must be stripped before pasting code back — while keeping real indentation.</li>
          <li>Invisible control and zero-width characters cause silent failures in passwords, diffs, and searches.</li>
          <li>Box-drawing characters and mixed carriage returns add visual noise and broken line breaks.</li>
          <li>For one-off cleanup, a browser-based formatter that runs locally is the fastest and safest option.</li>
        </ul>

        <ToolCTA
          name="Claude Code Text Formatter"
          href="/tools/claude-code-text-formatter"
          description="Strip ANSI codes, line numbers, and invisible characters from any terminal output in one click. Free, no signup, runs in your browser."
        />
      </section>
    </BlogLayout>
  );
}
