"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function Page() {
  const [number, setNumber] = useState(144);
  const [nthRoot, setNthRoot] = useState(2);

  const result = useMemo(() => {
    if (number < 0 && nthRoot % 2 === 0) return null;

    const root = nthRoot === 2
      ? Math.sqrt(Math.abs(number)) * (number < 0 ? -1 : 1)
      : Math.sign(number) * Math.pow(Math.abs(number), 1 / nthRoot);

    const isPerfect = nthRoot === 2 && number >= 0 && Number.isInteger(Math.sqrt(number));
    const squared = number * number;
    const cubed = number * number * number;

    // Simplify radical (for square root)
    let outsideRoot = 1;
    let insideRoot = Math.abs(number);
    if (nthRoot === 2 && number > 0 && !isPerfect) {
      let n = Math.abs(number);
      let outside = 1;
      for (let i = 2; i * i <= n; i++) {
        while (n % (i * i) === 0) {
          n /= (i * i);
          outside *= i;
        }
      }
      outsideRoot = outside;
      insideRoot = n;
    }

    return { root, isPerfect, squared, cubed, outsideRoot, insideRoot, simplified: outsideRoot > 1 };
  }, [number, nthRoot]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  // Perfect squares reference
  const perfectSquares = Array.from({ length: 15 }, (_, i) => ({ n: i + 1, sq: (i + 1) ** 2 }));

  return (
    <ToolLayout
      title="Square Root Calculator"
      description="Calculate square roots, cube roots, and nth roots. Shows simplified radical form and perfect square check."
      slug="square-root-calculator"
      category="Utility"
      keywords={["square root calculator", "sqrt calculator", "cube root calculator", "radical calculator", "nth root calculator"]}
      faqs={[
        { question: "How do you calculate a square root?", answer: "The square root of a number x is the value that, when multiplied by itself, gives x. For example, √144 = 12 because 12 × 12 = 144. This calculator handles any positive number and simplifies radicals." },
        { question: "What is a perfect square?", answer: "A perfect square is a number whose square root is a whole number. Examples: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225." },
        { question: "How do you simplify a radical?", answer: "Factor out perfect squares from under the radical. Example: √72 = √(36 × 2) = 6√2. Find the largest perfect square factor and move its root outside." },
      ]}
      relatedTools={[
        { name: "Scientific Calculator", href: "/tools/scientific-calculator" },
        { name: "Percentage Calculator", href: "/tools/percentage-calculator" },
        { name: "Fraction Calculator", href: "/tools/fraction-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div><label className={labelCls}>Number</label><input type="number" value={number} onChange={e => setNumber(+e.target.value)} className={inputCls} /></div>
          <div>
            <label className={labelCls}>Root Type</label>
            <div className="flex gap-2">
              {([2, 3, 4] as const).map(n => (
                <button key={n} onClick={() => setNthRoot(n)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${nthRoot === n ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
                  {n === 2 ? "√ Square" : n === 3 ? "∛ Cube" : "∜ 4th"}
                </button>
              ))}
            </div>
          </div>
          <div><label className={labelCls}>Custom nth Root</label><input type="number" value={nthRoot} onChange={e => setNthRoot(+e.target.value)} className={inputCls} min={2} max={20} /></div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">Perfect Squares Reference</p>
            <div className="grid grid-cols-5 gap-1 text-sm text-center">
              {perfectSquares.map(p => (
                <div key={p.n} className={`py-1 rounded ${p.sq === number ? "bg-blue-600/20 text-blue-300" : "text-zinc-400"}`}>
                  {p.n}²={p.sq}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {result ? (
            <>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
                <p className="text-sm text-zinc-400 mb-1">{nthRoot === 2 ? "Square Root" : nthRoot === 3 ? "Cube Root" : `${nthRoot}th Root`} of {number}</p>
                <p className="text-5xl font-bold text-blue-400">{result.root % 1 === 0 ? result.root : result.root.toFixed(8)}</p>
                {result.isPerfect && <p className="text-sm text-green-400 mt-1">Perfect Square</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">{number}²</p><p className="text-lg font-semibold text-zinc-100">{result.squared.toLocaleString()}</p></div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">{number}³</p><p className="text-lg font-semibold text-zinc-100">{result.cubed.toLocaleString()}</p></div>
              </div>

              {nthRoot === 2 && result.simplified && (
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500 mb-1">Simplified Radical</p>
                  <p className="text-lg font-semibold text-zinc-100">√{number} = {result.outsideRoot}√{result.insideRoot}</p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-sm text-red-300">
              Cannot calculate an even root of a negative number.
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
