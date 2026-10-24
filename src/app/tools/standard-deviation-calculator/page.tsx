"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function Page() {
  const [input, setInput] = useState("85, 90, 78, 92, 88, 76, 95, 82, 89, 91");
  const [type, setType] = useState<"population" | "sample">("population");

  const result = useMemo(() => {
    const nums = input
      .split(/[\s,;]+/)
      .map(s => parseFloat(s.trim()))
      .filter(n => !isNaN(n));

    if (nums.length < 2) return null;

    const n = nums.length;
    const mean = nums.reduce((a, b) => a + b, 0) / n;
    const sumSquaredDiffs = nums.reduce((acc, v) => acc + (v - mean) ** 2, 0);

    const variance = type === "population" ? sumSquaredDiffs / n : sumSquaredDiffs / (n - 1);
    const stdDev = Math.sqrt(variance);
    const coeffVar = (stdDev / mean) * 100;
    const stdError = stdDev / Math.sqrt(n);

    // Z-scores
    const zScores = nums.map(v => ({ value: v, z: (v - mean) / stdDev }));

    // Confidence intervals (95%)
    const ci95 = 1.96 * stdError;
    const ciLow = mean - ci95;
    const ciHigh = mean + ci95;

    return { mean, variance, stdDev, coeffVar, stdError, n, sumSquaredDiffs, zScores, ciLow, ciHigh };
  }, [input, type]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Standard Deviation Calculator"
      description="Calculate standard deviation, variance, z-scores, and confidence intervals for any dataset."
      slug="standard-deviation-calculator"
      category="Utility"
      keywords={["standard deviation calculator", "variance calculator", "statistics calculator", "std dev calculator", "z score calculator"]}
      faqs={[
        { question: "What is standard deviation?", answer: "Standard deviation measures how spread out data is from the mean. A low SD means data points cluster near the average. A high SD means they're widely spread. It's expressed in the same units as the data." },
        { question: "Population vs sample standard deviation?", answer: "Population SD (σ) divides by N — use when you have ALL data points. Sample SD (s) divides by N-1 — use when you have a sample from a larger population. The N-1 correction (Bessel's) makes sample SD an unbiased estimator." },
        { question: "What is a z-score?", answer: "A z-score tells you how many standard deviations a value is from the mean. Z=0 means at the mean. Z=1 means 1 SD above. Z=-2 means 2 SDs below. About 68% of data falls within ±1 SD, 95% within ±2 SD." },
      ]}
      relatedTools={[
        { name: "Mean/Median/Mode Calculator", href: "/tools/mean-median-mode-calculator" },
        { name: "Percentage Calculator", href: "/tools/percentage-calculator" },
        { name: "Scientific Calculator", href: "/tools/scientific-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Enter Numbers (comma, space, or newline separated)</label>
            <textarea value={input} onChange={e => setInput(e.target.value)} className={`${inputCls} h-32 resize-y`} placeholder="85, 90, 78, 92, 88..." />
          </div>
          <div className="flex gap-2">
            {(["population", "sample"] as const).map(t => (
              <button key={t} onClick={() => setType(t)} className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${type === t ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{t} (÷{t === "population" ? "N" : "N-1"})</button>
            ))}
          </div>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
              <p className="text-sm text-zinc-400 mb-1">Standard Deviation ({type === "population" ? "σ" : "s"})</p>
              <p className="text-5xl font-bold text-blue-400">{result.stdDev.toFixed(4)}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Variance ({type === "population" ? "σ²" : "s²"})</p><p className="text-lg font-semibold text-zinc-100">{result.variance.toFixed(4)}</p></div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Mean (x̄)</p><p className="text-lg font-semibold text-zinc-100">{result.mean.toFixed(2)}</p></div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Coeff. of Variation</p><p className="text-lg font-semibold text-zinc-100">{result.coeffVar.toFixed(2)}%</p></div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Std Error</p><p className="text-lg font-semibold text-zinc-100">{result.stdError.toFixed(4)}</p></div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Count (N)</p><p className="text-lg font-semibold text-zinc-100">{result.n}</p></div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">95% CI</p><p className="text-lg font-semibold text-zinc-100">{result.ciLow.toFixed(2)} - {result.ciHigh.toFixed(2)}</p></div>
            </div>

            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500 mb-2">Z-Scores</p>
              <div className="grid grid-cols-2 gap-1 text-sm max-h-40 overflow-y-auto">
                {result.zScores.map((z, i) => (
                  <div key={i} className="flex justify-between px-2">
                    <span className="text-zinc-400">{z.value}</span>
                    <span className={`font-mono ${Math.abs(z.z) > 2 ? "text-red-400" : Math.abs(z.z) > 1 ? "text-yellow-400" : "text-green-400"}`}>{z.z >= 0 ? "+" : ""}{z.z.toFixed(3)}</span>
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
