"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function Page() {
  const [input, setInput] = useState("12, 15, 18, 22, 22, 25, 30, 35, 22, 18");

  const result = useMemo(() => {
    const nums = input
      .split(/[\s,;]+/)
      .map(s => parseFloat(s.trim()))
      .filter(n => !isNaN(n));

    if (nums.length === 0) return null;

    const sorted = [...nums].sort((a, b) => a - b);
    const n = sorted.length;

    // Mean
    const sum = sorted.reduce((a, b) => a + b, 0);
    const mean = sum / n;

    // Median
    const median = n % 2 === 1
      ? sorted[Math.floor(n / 2)]
      : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;

    // Mode
    const freq: Record<number, number> = {};
    sorted.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
    const maxFreq = Math.max(...Object.values(freq));
    const modes = Object.entries(freq).filter(([, f]) => f === maxFreq).map(([v]) => +v);
    const modeStr = maxFreq === 1 ? "No mode" : modes.join(", ");

    // Range
    const range = sorted[n - 1] - sorted[0];

    // Variance & Standard Deviation
    const variance = sorted.reduce((acc, v) => acc + (v - mean) ** 2, 0) / n;
    const stdDev = Math.sqrt(variance);

    // Quartiles
    const q1Idx = Math.floor(n / 4);
    const q3Idx = Math.floor((3 * n) / 4);
    const q1 = sorted[q1Idx];
    const q3 = sorted[q3Idx];
    const iqr = q3 - q1;

    return { mean, median, modes: modeStr, maxFreq, range, sum, count: n, min: sorted[0], max: sorted[n - 1], variance, stdDev, q1, q3, iqr, sorted };
  }, [input]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Mean, Median, Mode Calculator"
      description="Calculate mean, median, mode, range, standard deviation, and more from any dataset."
      slug="mean-median-mode-calculator"
      category="Utility"
      keywords={["mean median mode calculator", "average calculator", "statistics calculator", "mean calculator", "median calculator"]}
      faqs={[
        { question: "What is the difference between mean, median, and mode?", answer: "Mean is the average (sum ÷ count). Median is the middle value when sorted. Mode is the most frequent value. For symmetric data they're similar, but for skewed data they can differ significantly." },
        { question: "When should I use median instead of mean?", answer: "Use median when data has outliers or is skewed (like income data). Median is resistant to extreme values. For example, if most people earn $50K but one earns $10M, the median better represents the typical value." },
        { question: "Can there be multiple modes?", answer: "Yes. If two values tie for most frequent, the data is bimodal. If all values appear equally often, there is no mode." },
      ]}
      relatedTools={[
        { name: "Standard Deviation Calculator", href: "/tools/standard-deviation-calculator" },
        { name: "Percentage Calculator", href: "/tools/percentage-calculator" },
        { name: "Scientific Calculator", href: "/tools/scientific-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Enter Numbers (comma, space, or newline separated)</label>
            <textarea value={input} onChange={e => setInput(e.target.value)} className={`${inputCls} h-32 resize-y`} placeholder="12, 15, 18, 22, 25..." />
          </div>
          {result && (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500 mb-1">Sorted Data ({result.count} values)</p>
              <p className="text-sm text-zinc-300 break-all">{result.sorted.join(", ")}</p>
            </div>
          )}
        </div>

        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 text-center">
                <p className="text-xs text-zinc-500">Mean</p>
                <p className="text-2xl font-bold text-blue-400">{result.mean % 1 === 0 ? result.mean : result.mean.toFixed(2)}</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 text-center">
                <p className="text-xs text-zinc-500">Median</p>
                <p className="text-2xl font-bold text-green-400">{result.median % 1 === 0 ? result.median : result.median.toFixed(2)}</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 text-center">
                <p className="text-xs text-zinc-500">Mode</p>
                <p className="text-2xl font-bold text-yellow-400">{result.modes}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Range</p><p className="text-lg font-semibold text-zinc-100">{result.range}</p></div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Sum</p><p className="text-lg font-semibold text-zinc-100">{result.sum}</p></div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Std Deviation</p><p className="text-lg font-semibold text-zinc-100">{result.stdDev.toFixed(4)}</p></div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Variance</p><p className="text-lg font-semibold text-zinc-100">{result.variance.toFixed(4)}</p></div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Min / Max</p><p className="text-lg font-semibold text-zinc-100">{result.min} / {result.max}</p></div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Count</p><p className="text-lg font-semibold text-zinc-100">{result.count}</p></div>
            </div>

            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500 mb-2">Five-Number Summary</p>
              <div className="space-y-1 text-sm">
                {[
                  ["Minimum", result.min],
                  ["Q1 (25th percentile)", result.q1],
                  ["Median (50th)", result.median],
                  ["Q3 (75th percentile)", result.q3],
                  ["Maximum", result.max],
                  ["IQR (Q3 - Q1)", result.iqr],
                ].map(([label, val]) => (
                  <div key={label as string} className="flex justify-between">
                    <span className="text-zinc-400">{label}</span>
                    <span className="text-zinc-100 font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
