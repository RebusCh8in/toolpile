"use client";
import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmt(n: number) {
  if (isNaN(n) || !isFinite(n)) return "—";
  return n % 1 === 0 ? n.toLocaleString() : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

export default function Page() {
  // What is X% of Y?
  const [p1, setP1] = useState("25");
  const [v1, setV1] = useState("200");

  // X is what % of Y?
  const [v2, setV2] = useState("50");
  const [v3, setV3] = useState("200");

  // % change from X to Y
  const [from, setFrom] = useState("80");
  const [to, setTo] = useState("100");

  // % increase/decrease
  const [v4, setV4] = useState("100");
  const [p2, setP2] = useState("15");
  const [mode, setMode] = useState<"increase" | "decrease">("increase");

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "text-sm text-zinc-400";

  return (
    <ToolLayout
      title="Percentage Calculator"
      description="Calculate percentages instantly. Find what percent of a number, percentage change, increase, decrease, and more."
      slug="percentage-calculator"
      category="Math"
      keywords={["percentage calculator", "percent calculator", "percentage change calculator", "percent of number", "percentage increase calculator"]}
      faqs={[
        { question: "How do I calculate a percentage of a number?", answer: "Multiply the number by the percentage divided by 100. For example, 25% of 200 = 200 × (25/100) = 50." },
        { question: "How do I calculate percentage change?", answer: "Percentage change = ((New Value - Old Value) / Old Value) × 100. A change from 80 to 100 is ((100-80)/80) × 100 = 25% increase." },
        { question: "What is the difference between percentage and percentage points?", answer: "A change from 10% to 15% is a 5 percentage point increase but a 50% percentage increase. Percentage points measure the absolute difference; percentage measures the relative change." },
      ]}
      relatedTools={[
        { name: "Tip Calculator", href: "/tools/tip-calculator" },
        { name: "Discount Calculator", href: "/tools/discount-calculator" },
        { name: "Profit Margin Calculator", href: "/tools/profit-margin-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        {/* What is X% of Y? */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-3">
          <h3 className="text-lg font-semibold text-zinc-100">What is X% of Y?</h3>
          <div className="flex items-center gap-2">
            <span className={labelCls}>What is</span>
            <input type="number" value={p1} onChange={e => setP1(e.target.value)} className={inputCls + " !w-24"} />
            <span className={labelCls}>% of</span>
            <input type="number" value={v1} onChange={e => setV1(e.target.value)} className={inputCls + " !w-28"} />
            <span className={labelCls}>?</span>
          </div>
          <div className="bg-zinc-900 rounded-lg px-4 py-3">
            <p className="text-2xl font-bold text-blue-400">{fmt((+p1 / 100) * +v1)}</p>
          </div>
        </div>

        {/* X is what % of Y? */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-3">
          <h3 className="text-lg font-semibold text-zinc-100">X is what % of Y?</h3>
          <div className="flex items-center gap-2">
            <input type="number" value={v2} onChange={e => setV2(e.target.value)} className={inputCls + " !w-24"} />
            <span className={labelCls}>is what % of</span>
            <input type="number" value={v3} onChange={e => setV3(e.target.value)} className={inputCls + " !w-28"} />
            <span className={labelCls}>?</span>
          </div>
          <div className="bg-zinc-900 rounded-lg px-4 py-3">
            <p className="text-2xl font-bold text-blue-400">{fmt((+v2 / +v3) * 100)}%</p>
          </div>
        </div>

        {/* Percentage change */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-3">
          <h3 className="text-lg font-semibold text-zinc-100">Percentage Change</h3>
          <div className="flex items-center gap-2">
            <span className={labelCls}>From</span>
            <input type="number" value={from} onChange={e => setFrom(e.target.value)} className={inputCls + " !w-28"} />
            <span className={labelCls}>to</span>
            <input type="number" value={to} onChange={e => setTo(e.target.value)} className={inputCls + " !w-28"} />
          </div>
          {(() => {
            const change = ((+to - +from) / Math.abs(+from)) * 100;
            const isUp = change >= 0;
            return (
              <div className="bg-zinc-900 rounded-lg px-4 py-3">
                <p className={`text-2xl font-bold ${isUp ? "text-green-400" : "text-red-400"}`}>
                  {isUp ? "+" : ""}{fmt(change)}%
                </p>
                <p className="text-xs text-zinc-500">{isUp ? "Increase" : "Decrease"} of {fmt(Math.abs(+to - +from))}</p>
              </div>
            );
          })()}
        </div>

        {/* Increase / Decrease */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-3">
          <h3 className="text-lg font-semibold text-zinc-100">Percentage Increase / Decrease</h3>
          <div className="flex gap-2 mb-2">
            <button onClick={() => setMode("increase")} className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === "increase" ? "bg-green-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>Increase</button>
            <button onClick={() => setMode("decrease")} className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === "decrease" ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>Decrease</button>
          </div>
          <div className="flex items-center gap-2">
            <input type="number" value={v4} onChange={e => setV4(e.target.value)} className={inputCls + " !w-28"} />
            <span className={labelCls}>{mode === "increase" ? "+" : "−"}</span>
            <input type="number" value={p2} onChange={e => setP2(e.target.value)} className={inputCls + " !w-24"} />
            <span className={labelCls}>%</span>
          </div>
          <div className="bg-zinc-900 rounded-lg px-4 py-3">
            <p className="text-2xl font-bold text-blue-400">
              {fmt(mode === "increase" ? +v4 * (1 + +p2 / 100) : +v4 * (1 - +p2 / 100))}
            </p>
          </div>
        </div>
      </div>

      {/* Common percentages reference */}
      <div className="mt-8 bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-zinc-100 mb-3">Quick Reference</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 text-sm">
          {[5, 10, 15, 20, 25, 33.33, 50, 66.67, 75, 100].map(p => (
            <div key={p} className="bg-zinc-900 rounded-lg px-3 py-2 text-center">
              <p className="text-zinc-500">{p}% of {v1}</p>
              <p className="text-zinc-100 font-medium">{fmt((p / 100) * +v1)}</p>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
