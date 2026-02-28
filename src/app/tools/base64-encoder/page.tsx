"use client";

import { useState, useRef } from "react";
import ToolLayout, { FAQ, RelatedTool } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

type Mode = "encode" | "decode";

export default function Base64EncoderPage() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConvert = (text: string, m: Mode) => {
    if (!text.trim()) {
      setOutput("");
      setError("");
      return;
    }
    try {
      if (m === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(text))));
      } else {
        setOutput(decodeURIComponent(escape(atob(text.replace(/\s/g, "")))));
      }
      setError("");
    } catch {
      setError(m === "encode" ? "Failed to encode input" : "Invalid Base64 string");
      setOutput("");
    }
  };

  const handleInputChange = (text: string) => {
    setInput(text);
    setImagePreview("");
    handleConvert(text, mode);
  };

  const handleModeChange = (m: Mode) => {
    setMode(m);
    setImagePreview("");
    handleConvert(input, m);
  };

  const handleFileRead = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (file.type.startsWith("image/")) {
        setImagePreview(dataUrl);
      }
      // Extract base64 portion or show full data URL
      setInput(file.name);
      setOutput(dataUrl);
      setError("");
      setMode("encode");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileRead(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileRead(file);
  };

  return (
    <ToolLayout
      title="Base64 Encoder / Decoder"
      description="Encode and decode text and files to and from Base64. Supports drag-and-drop file upload."
      category="Developer"
      slug="base64-encoder"
      keywords={[
        "base64 encoder",
        "base64 decoder",
        "base64 encode online",
        "decode base64 string",
        "image to base64",
        "file to base64",
        "base64 converter",
        "base64 text encoder",
      ]}
      relatedTools={[
        { name: "JSON Formatter", href: "/tools/json-formatter" },
        { name: "UUID Generator", href: "/tools/uuid-generator" },
        { name: "Password Generator", href: "/tools/password-generator" },
        { name: "Regex Tester", href: "/tools/regex-tester" },
      ]}
      faqs={[
        {
          question: "What is Base64 encoding?",
          answer: "Base64 encoding converts binary data into a text format using 64 ASCII characters. It is commonly used to embed images in HTML or CSS, transmit binary data over text-based protocols like email, and store data in JSON or XML.",
        },
        {
          question: "How do I encode text to Base64?",
          answer: "Select the Encode mode, type or paste your text into the input field, and the Base64-encoded output appears instantly. Click the copy button to grab the result for use in your project.",
        },
        {
          question: "How do I decode a Base64 string?",
          answer: "Switch to Decode mode and paste your Base64 string into the input field. The tool automatically converts it back to readable text. If the string is invalid Base64, an error message is displayed.",
        },
        {
          question: "Can I convert an image to Base64?",
          answer: "Yes. Drag and drop an image file onto the upload area, or click to select a file. The tool generates a data URL with the Base64-encoded image, and shows a preview if it is an image file.",
        },
        {
          question: "Does Base64 encoding encrypt my data?",
          answer: "No. Base64 is an encoding scheme, not encryption. Anyone can decode a Base64 string to view the original data. Do not use Base64 as a security measure for sensitive information.",
        },
        {
          question: "Why is my Base64 output larger than the original?",
          answer: "Base64 encoding increases data size by approximately 33%. Every three bytes of input become four characters of Base64 output. This overhead is the tradeoff for safe text-based transmission of binary data.",
        },
      ]}
      guide={
        <>
          <h2>What Is the Base64 Encoder / Decoder?</h2>
          <p>
            This tool encodes text and files into Base64 format and decodes Base64 strings back into readable content. Base64 is a binary-to-text encoding scheme used widely in web development, email systems, and APIs. Everything runs in your browser with no data sent to any server.
          </p>

          <h3>How to Encode Text to Base64</h3>
          <p>
            Make sure the mode is set to Encode. Type or paste your text into the input area. The Base64-encoded result appears instantly in the output panel. Click the copy button to copy the output to your clipboard.
          </p>

          <h3>How to Decode Base64 to Text</h3>
          <p>
            Switch the mode to Decode. Paste your Base64 string into the input area. The decoded plain text appears in the output. If the input is not valid Base64, an error message lets you know.
          </p>

          <h3>Encoding Files and Images</h3>
          <p>
            Drag and drop any file onto the upload area, or click to open a file picker. The tool reads the file and produces a data URL containing the Base64-encoded content. For image files, a visual preview is displayed so you can verify the result.
          </p>
          <ul>
            <li>Supports all file types including images, PDFs, and documents.</li>
            <li>Image files display an inline preview below the upload area.</li>
            <li>The full data URL is shown in the output and can be copied.</li>
          </ul>

          <h3>Common Use Cases</h3>
          <ul>
            <li>Embedding small images directly in HTML or CSS as data URLs.</li>
            <li>Encoding binary data for safe transmission in JSON APIs.</li>
            <li>Preparing file attachments for email protocols.</li>
            <li>Debugging encoded strings in authentication tokens or cookies.</li>
            <li>Converting configuration files for use in environment variables.</li>
          </ul>

          <h3>Tips for Working with Base64</h3>
          <p>
            Keep in mind that Base64 increases data size by about a third. For large files, it is usually better to serve them as separate resources rather than embedding them inline. Base64 is ideal for small assets like icons and thumbnails where reducing HTTP requests matters more than payload size.
          </p>
        </>
      }
    >
      <div className="space-y-4">
        {/* Mode toggle */}
        <div className="flex gap-2">
          {(["encode", "decode"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                mode === m ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {m}
            </button>
          ))}
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
            <label className="mb-1 block text-sm font-medium text-zinc-300">
              {mode === "encode" ? "Text to Encode" : "Base64 to Decode"}
            </label>
            <textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={mode === "encode" ? "Enter text to encode..." : "Paste Base64 string..."}
              rows={10}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 font-mono text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 resize-y"
            />
          </div>

          {/* Output */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-300">Output</label>
              {output && <CopyButton text={output} className="text-xs px-2 py-1" />}
            </div>
            <textarea
              value={output}
              readOnly
              rows={10}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 font-mono text-sm text-zinc-300 outline-none resize-y"
            />
          </div>
        </div>

        {/* File upload */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-500/10"
              : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
          }`}
        >
          <p className="text-sm text-zinc-400">
            Drag &amp; drop a file here, or click to select
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Images will show a preview with their data URL
          </p>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {/* Image preview */}
        {imagePreview && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <h3 className="mb-2 text-sm font-medium text-zinc-300">Image Preview</h3>
            <img src={imagePreview} alt="Preview" className="max-h-64 rounded-lg" />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
