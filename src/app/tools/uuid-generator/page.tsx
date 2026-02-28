"use client";

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import ToolLayout, { FAQ, RelatedTool } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

export default function UUIDGeneratorPage() {
  const [uuids, setUuids] = useState<string[]>([uuidv4()]);
  const [bulkCount, setBulkCount] = useState(10);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);

  const formatUuid = useCallback(
    (id: string): string => {
      let result = hyphens ? id : id.replace(/-/g, "");
      return uppercase ? result.toUpperCase() : result.toLowerCase();
    },
    [uppercase, hyphens]
  );

  const generateOne = () => {
    setUuids([uuidv4()]);
  };

  const generateBulk = () => {
    const count = Math.min(100, Math.max(1, bulkCount));
    setUuids(Array.from({ length: count }, () => uuidv4()));
  };

  const allFormatted = uuids.map(formatUuid);

  return (
    <ToolLayout
      title="UUID Generator"
      description="Generate random UUID v4 identifiers. Single or bulk generation with formatting options."
      category="Developer"
      slug="uuid-generator"
      keywords={[
        "uuid generator",
        "uuid v4 generator",
        "random uuid online",
        "generate guid",
        "bulk uuid generator",
        "unique identifier generator",
        "uuid creator",
        "guid generator online",
      ]}
      relatedTools={[
        { name: "Password Generator", href: "/tools/password-generator" },
        { name: "Base64 Encoder", href: "/tools/base64-encoder" },
        { name: "JSON Formatter", href: "/tools/json-formatter" },
        { name: "Regex Tester", href: "/tools/regex-tester" },
      ]}
      faqs={[
        {
          question: "What is a UUID?",
          answer: "A UUID (Universally Unique Identifier) is a 128-bit identifier formatted as a 32-character hexadecimal string with hyphens. UUID v4, which this tool generates, uses random values, making collisions virtually impossible across systems without coordination.",
        },
        {
          question: "What is the difference between UUID and GUID?",
          answer: "UUID and GUID (Globally Unique Identifier) are the same concept. UUID is the standard term used by the IETF and in most programming languages, while GUID is the term commonly used in Microsoft technologies. The format and purpose are identical.",
        },
        {
          question: "Can I generate multiple UUIDs at once?",
          answer: "Yes. Enter the quantity you need (up to 100) and click Bulk Generate. All UUIDs appear in a scrollable list. You can copy individual UUIDs or click Copy All to grab the entire list at once.",
        },
        {
          question: "Are generated UUIDs truly unique?",
          answer: "UUID v4 uses cryptographically random values, providing 122 bits of randomness. The probability of generating a duplicate is astronomically low, effectively making each UUID unique for all practical purposes.",
        },
        {
          question: "Can I remove hyphens from generated UUIDs?",
          answer: "Yes. Uncheck the Hyphens option to generate UUIDs without dashes. This produces a continuous 32-character hexadecimal string, which some systems and databases prefer.",
        },
        {
          question: "When should I use UUIDs instead of auto-increment IDs?",
          answer: "Use UUIDs when you need identifiers that are unique across distributed systems without a central authority. They are ideal for microservices, client-side ID generation, database merging, and scenarios where sequential IDs would reveal record counts.",
        },
      ]}
      guide={
        <>
          <h2>What Is the UUID Generator?</h2>
          <p>
            The UUID Generator creates random version 4 UUIDs (Universally Unique Identifiers) directly in your browser. UUIDs are 128-bit identifiers used across software development for database primary keys, API request tracking, session tokens, and anywhere a unique identifier is needed without central coordination.
          </p>

          <h3>How to Generate UUIDs</h3>
          <p>
            Click the Generate UUID button for a single UUID, or use the bulk feature to create many at once.
          </p>
          <ul>
            <li>Click "Generate UUID" for a single new identifier.</li>
            <li>Set a quantity (1 to 100) and click "Bulk Generate" for multiple UUIDs at once.</li>
            <li>Toggle Uppercase to switch between lowercase and uppercase hexadecimal output.</li>
            <li>Toggle Hyphens to include or remove the standard dash separators.</li>
            <li>Copy individual UUIDs or use "Copy All" to grab the full list.</li>
          </ul>

          <h3>Formatting Options</h3>
          <p>
            By default, UUIDs are generated in the standard lowercase format with hyphens, such as <code>550e8400-e29b-41d4-a716-446655440000</code>. Enable the Uppercase option for capital letters. Disable Hyphens for a compact 32-character string. These options let you match whatever format your database or API expects.
          </p>

          <h3>Common Use Cases</h3>
          <ul>
            <li>Database primary keys in distributed systems and microservices.</li>
            <li>Unique file names for uploads to prevent conflicts.</li>
            <li>API request IDs for tracing and logging.</li>
            <li>Session and transaction identifiers.</li>
            <li>Test data generation for development and QA.</li>
          </ul>

          <h3>UUID v4 Explained</h3>
          <p>
            UUID version 4 generates identifiers using random or pseudo-random numbers. Of the 128 bits, 122 are random and 6 are fixed to indicate the version and variant. This produces over 5.3 undecillion possible combinations, making the chance of a collision negligibly small even at massive scale.
          </p>
          <p>
            All generation happens client-side in your browser. No UUIDs are sent to or stored on any server, so you can safely generate identifiers for any project without privacy concerns.
          </p>
        </>
      }
    >
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-end gap-4">
          <button
            onClick={generateOne}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
          >
            Generate UUID
          </button>

          <div className="flex items-end gap-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-300">Quantity</label>
              <input
                type="number"
                min={1}
                max={100}
                value={bulkCount}
                onChange={(e) => setBulkCount(Number(e.target.value))}
                className="w-20 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={generateBulk}
              className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-600 transition-colors"
            >
              Bulk Generate
            </button>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="accent-blue-500"
              />
              <span className="text-sm text-zinc-300">Uppercase</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hyphens}
                onChange={(e) => setHyphens(e.target.checked)}
                className="accent-blue-500"
              />
              <span className="text-sm text-zinc-300">Hyphens</span>
            </label>
          </div>
        </div>

        {/* UUID list */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-zinc-400">{allFormatted.length} UUID(s)</span>
            <CopyButton text={allFormatted.join("\n")} label="Copy All" />
          </div>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {allFormatted.map((id, i) => (
              <div key={i} className="flex items-center gap-2 rounded bg-zinc-800 px-3 py-2">
                <code className="flex-1 font-mono text-sm text-zinc-200">{id}</code>
                <CopyButton text={id} label="Copy" className="text-xs px-2 py-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
