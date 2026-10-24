"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function Page() {
  const [invested, setInvested] = useState(10000);
  const [returned, setReturned] = useState(15000);
  const [years, setYears] = useState(3);

  const result = useMemo(() => {
    const gain = returned - invested;
    const roi = invested > 0 ? (gain / invested) * 100 : 0;
    const annualized = invested > 0 && years > 0
      ? (Math.pow(returned / invested, 1 / years) - 1) * 100
      : 0;

    return { gain, roi, annualized };
  }, [invested, returned, years]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const isPositive = result.gain >= 0;

  return (
    <ToolLayout
      title="ROI Calculator"
      description="Calculate Return on Investment (ROI) and annualized return from initial investment and final value."
      slug="roi-calculator"
      category="Finance"
      keywords={["roi calculator", "return on investment calculator", "investment return calculator", "roi percentage calculator"]}
      faqs={[
        { question: "How is ROI calculated?", answer: "ROI = ((Final Value - Initial Investment) / Initial Investment) × 100. If you invest $10,000 and get back $15,000: ((15,000 - 10,000) / 10,000) × 100 = 50% ROI." },
        { question: "What is annualized ROI?", answer: "Annualized ROI accounts for the time period. A 50% return over 3 years is ~14.5% annualized. Formula: ((Final / Initial)^(1/years) - 1) × 100. This lets you compare investments of different durations." },
        { question: "What is a good ROI?", answer: "It depends on the investment type and risk. S&P 500 averages ~10% annually. Real estate averages 8-12%. A 'good' ROI beats the risk-free rate (Treasury bonds, ~4-5%) by enough to compensate for risk." },
      ]}
      relatedTools={[
        { name: "Investment Calculator", href: "/tools/investment-calculator" },
        { name: "Compound Interest Calculator", href: "/tools/compound-interest-calculator" },
        { name: "Profit Margin Calculator", href: "/tools/profit-margin-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div><label className={labelCls}>Amount Invested ($)</label><input type="number" value={invested} onChange={e => setInvested(+e.target.value)} className={inputCls} min={0} step={100} /></div>
          <div><label className={labelCls}>Amount Returned ($)</label><input type="number" value={returned} onChange={e => setReturned(+e.target.value)} className={inputCls} min={0} step={100} /></div>
          <div><label className={labelCls}>Investment Period (years)</label><input type="number" value={years} onChange={e => setYears(+e.target.value)} className={inputCls} min={0.1} max={100} step={0.5} /></div>
        </div>
        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">ROI</p>
            <p className={`text-5xl font-bold ${isPositive ? "text-green-400" : "text-red-400"}`}>{isPositive ? "+" : ""}{result.roi.toFixed(1)}%</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500">{isPositive ? "Gain" : "Loss"}</p>
              <p className={`text-lg font-semibold ${isPositive ? "text-green-400" : "text-red-400"}`}>{fmtC(result.gain)}</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Annualized</p>
              <p className={`text-lg font-semibold ${result.annualized >= 0 ? "text-green-400" : "text-red-400"}`}>{result.annualized.toFixed(1)}%/yr</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Period</p>
              <p className="text-lg font-semibold text-zinc-100">{years} yr{years !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
