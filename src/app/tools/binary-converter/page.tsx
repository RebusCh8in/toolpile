"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function Page() {
  const [input, setInput] = useState("42");
  const [inputBase, setInputBase] = useState<"decimal" | "binary" | "octal" | "hex">("decimal");
  const [copied, setCopied] = useState("");

  const result = useMemo(() => {
    try {
      let decimal: number;
      const clean = input.trim().toLowerCase();
      if (!clean) return null;
      switch (inputBase) {
        case "decimal": decimal = parseInt(clean, 10); break;
        case "binary": decimal = parseInt(clean, 2); break;
        case "octal": decimal = parseInt(clean, 8); break;
        case "hex": decimal = parseInt(clean, 16); break;
      }
      if (isNaN(decimal)) return null;
      return {
        decimal: decimal.toString(10),
        binary: decimal.toString(2),
        octal: decimal.toString(8),
        hex: decimal.toString(16).toUpperCase(),
      };
    } catch { return null; }
  }, [input, inputBase]);

  const copy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 font-mono";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  const bases = [
    { key: "decimal" as const, label: "Decimal (Base 10)", prefix: "" },
    { key: "binary" as const, label: "Binary (Base 2)", prefix: "0b" },
    { key: "octal" as const, label: "Octal (Base 8)", prefix: "0o" },
    { key: "hex" as const, label: "Hexadecimal (Base 16)", prefix: "0x" },
  ];

  return (
    <ToolLayout
      title="Number Base Converter"
      description="Convert numbers between decimal, binary, octal, and hexadecimal. Instant conversion with copy buttons."
      slug="binary-converter"
      category="Developer"
      keywords={["binary converter", "decimal to binary", "hex converter", "number base converter", "binary to decimal", "octal converter"]}
      faqs={[
        { question: "How do number bases work?", answer: "Decimal (base 10) uses digits 0-9. Binary (base 2) uses 0-1. Octal (base 8) uses 0-7. Hexadecimal (base 16) uses 0-9 and A-F. Each position represents a power of the base." },
        { question: "How to convert decimal to binary?", answer: "Divide by 2 repeatedly, tracking remainders. 42 → 42/2=21r0, 21/2=10r1, 10/2=5r0, 5/2=2r1, 2/2=1r0, 1/2=0r1. Read remainders bottom to top: 101010." },
        { question: "Why is hexadecimal used in programming?", answer: "Hex is compact — each hex digit maps to exactly 4 binary bits. So a byte (8 bits) is always 2 hex digits. Color codes like #FF0000 are hex: FF=255 red, 00=0 green, 00=0 blue." },
      ]}
      relatedTools={[
        { name: "Base64 Encoder", href: "/tools/base64-encoder" },
        { name: "Hash Generator", href: "/tools/hash-generator" },
        { name: "Color Converter", href: "/tools/color-converter" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Input Base</label>
            <div className="grid grid-cols-2 gap-2">
              {bases.map(b => (
                <button key={b.key} onClick={() => setInputBase(b.key)} className={`py-2 rounded-lg text-sm font-medium transition-colors ${inputBase === b.key ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{b.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Enter {inputBase} number</label>
            <input type="text" value={input} onChange={e => setInput(e.target.value)} className={inputCls} placeholder={inputBase === "binary" ? "101010" : inputBase === "hex" ? "2A" : inputBase === "octal" ? "52" : "42"} />
          </div>

          {/* Quick examples */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">Common Values</p>
            <div className="grid grid-cols-4 gap-1 text-xs text-center">
              <span className="text-zinc-500">Dec</span><span className="text-zinc-500">Bin</span><span className="text-zinc-500">Oct</span><span className="text-zinc-500">Hex</span>
              {[0, 1, 8, 10, 16, 32, 64, 128, 255, 256, 1024].map(n => (
                <button key={n} onClick={() => { setInput(n.toString()); setInputBase("decimal"); }} className="contents text-zinc-400 hover:text-blue-300 cursor-pointer">
                  <span>{n}</span><span>{n.toString(2)}</span><span>{n.toString(8)}</span><span>{n.toString(16).toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {result ? (
            <>
              {bases.map(b => (
                <div key={b.key} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs text-zinc-500">{b.label}</p>
                    <button onClick={() => copy(result[b.key], b.key)} className="text-xs text-blue-400 hover:text-blue-300">{copied === b.key ? "Copied!" : "Copy"}</button>
                  </div>
                  <p className={`text-lg font-mono font-semibold ${inputBase === b.key ? "text-blue-400" : "text-zinc-100"} break-all`}>
                    <span className="text-zinc-500">{b.prefix}</span>{result[b.key]}
                  </p>
                </div>
              ))}
            </>
          ) : (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
              <p className="text-zinc-500">Enter a valid {inputBase} number</p>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
