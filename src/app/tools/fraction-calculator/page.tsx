"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function gcd(a: number, b: number): number { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; }

function simplify(num: number, den: number): [number, number] {
  if (den === 0) return [num, den];
  const g = gcd(num, den);
  const sign = den < 0 ? -1 : 1;
  return [(num / g) * sign, (den / g) * sign];
}

export default function Page() {
  const [n1, setN1] = useState(3);
  const [d1, setD1] = useState(4);
  const [op, setOp] = useState<"+" | "-" | "×" | "÷">("+");
  const [n2, setN2] = useState(1);
  const [d2, setD2] = useState(2);

  const result = useMemo(() => {
    if (d1 === 0 || d2 === 0) return null;
    let rn: number, rd: number;
    switch (op) {
      case "+": rn = n1 * d2 + n2 * d1; rd = d1 * d2; break;
      case "-": rn = n1 * d2 - n2 * d1; rd = d1 * d2; break;
      case "×": rn = n1 * n2; rd = d1 * d2; break;
      case "÷":
        if (n2 === 0) return null;
        rn = n1 * d2; rd = d1 * n2; break;
      default: return null;
    }
    const [sn, sd] = simplify(rn, rd);
    const decimal = sd !== 0 ? sn / sd : 0;
    const whole = Math.floor(Math.abs(sn) / sd);
    const remN = Math.abs(sn) % sd;
    const mixed = whole > 0 ? { whole: sn < 0 ? -whole : whole, num: remN, den: sd } : null;

    return { num: sn, den: sd, decimal, mixed, originalNum: rn, originalDen: rd };
  }, [n1, d1, n2, d2, op]);

  // Simplify single fraction
  const [simpN, setSimpN] = useState(12);
  const [simpD, setSimpD] = useState(18);
  const [sNum, sDen] = simplify(simpN, simpD);

  // Decimal to fraction
  const [decInput, setDecInput] = useState("0.75");
  const decFraction = useMemo(() => {
    const num = parseFloat(decInput);
    if (isNaN(num)) return null;
    const str = num.toString();
    const decimalPlaces = str.includes(".") ? str.split(".")[1].length : 0;
    const denominator = Math.pow(10, decimalPlaces);
    const numerator = Math.round(num * denominator);
    return simplify(numerator, denominator);
  }, [decInput]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 text-center text-xl";
  const smallInput = "bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 w-20 text-center";

  return (
    <ToolLayout
      title="Fraction Calculator"
      description="Add, subtract, multiply, and divide fractions. Simplify fractions and convert between decimals and fractions."
      slug="fraction-calculator"
      category="Utility"
      keywords={["fraction calculator", "add fractions", "fraction simplifier", "mixed number calculator", "decimal to fraction"]}
      faqs={[
        { question: "How do I add fractions?", answer: "Find a common denominator, add the numerators: a/b + c/d = (ad + bc) / bd. Then simplify. Example: 3/4 + 1/2 = (3×2 + 1×4) / (4×2) = 10/8 = 5/4 = 1¼." },
        { question: "How do I multiply fractions?", answer: "Multiply numerators together and denominators together: a/b × c/d = (a×c) / (b×d). Then simplify. Example: 3/4 × 1/2 = 3/8." },
        { question: "How do I divide fractions?", answer: "Multiply by the reciprocal: a/b ÷ c/d = a/b × d/c = (a×d) / (b×c). Example: 3/4 ÷ 1/2 = 3/4 × 2/1 = 6/4 = 3/2 = 1½." },
      ]}
      relatedTools={[
        { name: "Percentage Calculator", href: "/tools/percentage-calculator" },
        { name: "Scientific Calculator", href: "/tools/scientific-calculator" },
      ]}
    >
      <div className="space-y-8">
        {/* Main calculator */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-zinc-200 mb-4">Fraction Calculator</h3>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="text-center">
              <input type="number" value={n1} onChange={e => setN1(+e.target.value)} className={inputCls} style={{ width: 80 }} />
              <div className="border-t-2 border-zinc-400 my-1 mx-2" />
              <input type="number" value={d1} onChange={e => setD1(+e.target.value)} className={inputCls} style={{ width: 80 }} />
            </div>
            <div className="flex gap-1">
              {(["+", "-", "×", "÷"] as const).map(o => (
                <button key={o} onClick={() => setOp(o)} className={`w-10 h-10 rounded-lg text-lg font-bold transition-colors ${op === o ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{o}</button>
              ))}
            </div>
            <div className="text-center">
              <input type="number" value={n2} onChange={e => setN2(+e.target.value)} className={inputCls} style={{ width: 80 }} />
              <div className="border-t-2 border-zinc-400 my-1 mx-2" />
              <input type="number" value={d2} onChange={e => setD2(+e.target.value)} className={inputCls} style={{ width: 80 }} />
            </div>
            <span className="text-2xl text-zinc-400">=</span>
            {result ? (
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{result.num}</p>
                <div className="border-t-2 border-blue-400 my-1 mx-2" />
                <p className="text-2xl font-bold text-blue-400">{result.den}</p>
              </div>
            ) : (
              <span className="text-2xl text-red-400">Error</span>
            )}
          </div>
          {result && (
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <span className="text-zinc-400">Decimal: <span className="text-zinc-100">{result.decimal.toFixed(6).replace(/0+$/, "").replace(/\.$/, "")}</span></span>
              {result.mixed && <span className="text-zinc-400">Mixed: <span className="text-zinc-100">{result.mixed.whole} {result.mixed.num}/{result.mixed.den}</span></span>}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Simplify */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-zinc-200 mb-3">Simplify Fraction</h3>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <input type="number" value={simpN} onChange={e => setSimpN(+e.target.value)} className={smallInput} />
                <div className="border-t border-zinc-500 my-1" />
                <input type="number" value={simpD} onChange={e => setSimpD(+e.target.value)} className={smallInput} />
              </div>
              <span className="text-zinc-400">=</span>
              <div className="text-center">
                <p className="text-lg font-bold text-blue-400">{sNum}</p>
                <div className="border-t border-blue-400 my-1" />
                <p className="text-lg font-bold text-blue-400">{sDen}</p>
              </div>
              <span className="text-xs text-zinc-500 ml-2">GCD: {gcd(simpN, simpD)}</span>
            </div>
          </div>

          {/* Decimal to fraction */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-zinc-200 mb-3">Decimal to Fraction</h3>
            <div className="flex items-center gap-3">
              <input type="text" value={decInput} onChange={e => setDecInput(e.target.value)} className={smallInput} />
              <span className="text-zinc-400">=</span>
              {decFraction ? (
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-400">{decFraction[0]}</p>
                  <div className="border-t border-blue-400 my-1" />
                  <p className="text-lg font-bold text-blue-400">{decFraction[1]}</p>
                </div>
              ) : (
                <span className="text-red-400">Invalid</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
