"use client";
import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function Page() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [allowDuplicates, setAllowDuplicates] = useState(true);
  const [results, setResults] = useState<number[]>([]);
  const [history, setHistory] = useState<number[][]>([]);

  const generate = useCallback(() => {
    const nums: number[] = [];
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    const range = hi - lo + 1;
    const qty = allowDuplicates ? count : Math.min(count, range);

    if (allowDuplicates) {
      for (let i = 0; i < qty; i++) {
        nums.push(Math.floor(Math.random() * range) + lo);
      }
    } else {
      const pool = Array.from({ length: range }, (_, i) => i + lo);
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      nums.push(...pool.slice(0, qty));
    }

    setResults(nums);
    setHistory(prev => [nums, ...prev].slice(0, 10));
  }, [min, max, count, allowDuplicates]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Random Number Generator"
      description="Generate random numbers within a range. Single or multiple numbers, with or without duplicates."
      slug="random-number-generator"
      category="Utility"
      keywords={["random number generator", "random number", "rng", "random number picker", "random integer generator"]}
      faqs={[
        { question: "Are these truly random numbers?", answer: "These use JavaScript's Math.random(), which is a pseudo-random number generator (PRNG). It's suitable for games, simulations, and general use. For cryptographic purposes, use our Password Generator which uses the Web Crypto API." },
        { question: "Can I generate unique numbers?", answer: "Yes! Uncheck 'Allow Duplicates' to generate unique numbers. This uses Fisher-Yates shuffle for unbiased selection. The count is limited to the range size when duplicates are disabled." },
        { question: "What is the maximum range?", answer: "JavaScript safely handles integers up to 9,007,199,254,740,991. For practical purposes, any range within ±1 billion works perfectly." },
      ]}
      relatedTools={[
        { name: "Password Generator", href: "/tools/password-generator" },
        { name: "UUID Generator", href: "/tools/uuid-generator" },
        { name: "Lorem Ipsum Generator", href: "/tools/lorem-ipsum-generator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Minimum</label><input type="number" value={min} onChange={e => setMin(+e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Maximum</label><input type="number" value={max} onChange={e => setMax(+e.target.value)} className={inputCls} /></div>
          </div>
          <div><label className={labelCls}>How Many</label><input type="number" value={count} onChange={e => setCount(Math.max(1, +e.target.value))} className={inputCls} min={1} max={1000} /></div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={allowDuplicates} onChange={e => setAllowDuplicates(e.target.checked)} className="accent-blue-500" />
            <span className="text-sm text-zinc-300">Allow Duplicates</span>
          </label>
          <div className="flex gap-2">
            {[[1, 10], [1, 100], [1, 1000], [0, 1]].map(([lo, hi]) => (
              <button key={`${lo}-${hi}`} onClick={() => { setMin(lo); setMax(hi); }} className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${min === lo && max === hi ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{lo}-{hi}</button>
            ))}
          </div>
          <button onClick={generate} className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-3 font-semibold transition-colors">Generate</button>
        </div>

        <div className="space-y-4">
          {results.length > 0 && (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
              <p className="text-sm text-zinc-400 mb-2">Result{results.length > 1 ? "s" : ""}</p>
              {results.length === 1 ? (
                <p className="text-6xl font-bold text-blue-400">{results[0]}</p>
              ) : (
                <div className="flex flex-wrap gap-2 justify-center">
                  {results.map((n, i) => (
                    <span key={i} className="bg-zinc-700 text-zinc-100 px-3 py-1.5 rounded-lg text-lg font-semibold">{n}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {history.length > 1 && (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500 mb-2">History</p>
              <div className="space-y-1">
                {history.slice(1).map((h, i) => (
                  <div key={i} className="text-sm text-zinc-400">{h.join(", ")}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
