"use client";
import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function pct(n: number) { return isFinite(n) ? n.toFixed(2) + "%" : "—"; }

export default function Page() {
  const [mode, setMode] = useState<"margin" | "markup" | "revenue">("margin");
  const [cost, setCost] = useState(40);
  const [revenue, setRevenue] = useState(100);
  const [marginPct, setMarginPct] = useState(60);
  const [markupPct, setMarkupPct] = useState(150);

  // Mode: margin — given cost + revenue
  const marginProfit = revenue - cost;
  const marginGross = revenue > 0 ? (marginProfit / revenue) * 100 : 0;
  const marginMarkup = cost > 0 ? (marginProfit / cost) * 100 : 0;

  // Mode: markup — given cost + markup %
  const markupRevenue = cost * (1 + markupPct / 100);
  const markupProfit = markupRevenue - cost;
  const markupMargin = markupRevenue > 0 ? (markupProfit / markupRevenue) * 100 : 0;

  // Mode: revenue — given revenue + desired margin %
  const revCost = revenue * (1 - marginPct / 100);
  const revProfit = revenue - revCost;
  const revMarkup = revCost > 0 ? (revProfit / revCost) * 100 : 0;

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Profit Margin Calculator"
      description="Calculate profit margin, markup percentage, and profit from cost and revenue. Switch between margin, markup, and revenue modes."
      slug="profit-margin-calculator"
      category="Finance"
      keywords={["profit margin calculator", "markup calculator", "margin calculator", "gross profit calculator", "profit percentage calculator"]}
      faqs={[
        { question: "What is the difference between margin and markup?", answer: "Margin is profit as a percentage of revenue (selling price). Markup is profit as a percentage of cost. A $60 profit on $100 revenue is a 60% margin but a 150% markup on $40 cost." },
        { question: "How do I calculate profit margin?", answer: "Profit Margin = ((Revenue - Cost) / Revenue) × 100. For example, selling at $100 with $40 cost: ((100-40)/100) × 100 = 60% margin." },
        { question: "What is a good profit margin?", answer: "It varies by industry. Software: 70-90%. Retail: 2-5%. Restaurants: 3-9%. Services: 15-30%. Manufacturing: 5-10%. Compare against your industry average." },
      ]}
      relatedTools={[
        { name: "Percentage Calculator", href: "/tools/percentage-calculator" },
        { name: "Discount Calculator", href: "/tools/discount-calculator" },
        { name: "Sales Tax Calculator", href: "/tools/sales-tax-calculator" },
      ]}
    >
      <div className="flex gap-2 mb-6">
        {(["margin", "markup", "revenue"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${mode === m ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
            {m === "margin" ? "Cost & Revenue" : m === "markup" ? "Cost & Markup" : "Revenue & Margin"}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {mode === "margin" && (
            <>
              <div><label className={labelCls}>Cost ($)</label><input type="number" value={cost} onChange={e => setCost(+e.target.value)} className={inputCls} min={0} step={0.01} /></div>
              <div><label className={labelCls}>Revenue / Selling Price ($)</label><input type="number" value={revenue} onChange={e => setRevenue(+e.target.value)} className={inputCls} min={0} step={0.01} /></div>
            </>
          )}
          {mode === "markup" && (
            <>
              <div><label className={labelCls}>Cost ($)</label><input type="number" value={cost} onChange={e => setCost(+e.target.value)} className={inputCls} min={0} step={0.01} /></div>
              <div><label className={labelCls}>Markup (%)</label><input type="number" value={markupPct} onChange={e => setMarkupPct(+e.target.value)} className={inputCls} min={0} step={1} /></div>
            </>
          )}
          {mode === "revenue" && (
            <>
              <div><label className={labelCls}>Revenue / Selling Price ($)</label><input type="number" value={revenue} onChange={e => setRevenue(+e.target.value)} className={inputCls} min={0} step={0.01} /></div>
              <div><label className={labelCls}>Desired Margin (%)</label><input type="number" value={marginPct} onChange={e => setMarginPct(+e.target.value)} className={inputCls} min={0} max={100} step={1} /></div>
            </>
          )}
        </div>

        <div className="space-y-4">
          {mode === "margin" && (
            <>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
                <p className="text-sm text-zinc-400 mb-1">Profit Margin</p>
                <p className="text-4xl font-bold text-blue-400">{pct(marginGross)}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Profit</p><p className="text-lg font-semibold text-green-400">{fmtC(marginProfit)}</p></div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Markup</p><p className="text-lg font-semibold text-yellow-400">{pct(marginMarkup)}</p></div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Cost</p><p className="text-lg font-semibold text-zinc-100">{fmtC(cost)}</p></div>
              </div>
            </>
          )}
          {mode === "markup" && (
            <>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
                <p className="text-sm text-zinc-400 mb-1">Selling Price</p>
                <p className="text-4xl font-bold text-blue-400">{fmtC(markupRevenue)}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Profit</p><p className="text-lg font-semibold text-green-400">{fmtC(markupProfit)}</p></div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Margin</p><p className="text-lg font-semibold text-yellow-400">{pct(markupMargin)}</p></div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Cost</p><p className="text-lg font-semibold text-zinc-100">{fmtC(cost)}</p></div>
              </div>
            </>
          )}
          {mode === "revenue" && (
            <>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
                <p className="text-sm text-zinc-400 mb-1">Max Cost to Hit Margin</p>
                <p className="text-4xl font-bold text-blue-400">{fmtC(revCost)}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Profit</p><p className="text-lg font-semibold text-green-400">{fmtC(revProfit)}</p></div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Markup</p><p className="text-lg font-semibold text-yellow-400">{pct(revMarkup)}</p></div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Revenue</p><p className="text-lg font-semibold text-zinc-100">{fmtC(revenue)}</p></div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Margin/Markup reference */}
      <div className="mt-8 bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Margin ↔ Markup Conversion</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm text-center">
          {[[15, 17.6], [20, 25], [25, 33.3], [30, 42.9], [33, 49.3], [40, 66.7], [50, 100], [60, 150], [75, 300], [80, 400]].map(([m, mk]) => (
            <div key={m} className="bg-zinc-900 rounded-lg px-2 py-2">
              <p className="text-zinc-500">{m}% margin</p>
              <p className="text-zinc-200">{mk}% markup</p>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
