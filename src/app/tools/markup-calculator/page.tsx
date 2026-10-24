"use client";
import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function pct(n: number) {
  return isFinite(n) ? n.toFixed(2) + "%" : "\u2014";
}

type Mode = "sellingPrice" | "markupPct" | "cost";

interface BatchItem {
  id: number;
  name: string;
  cost: number;
  markupPct: number;
}

let nextBatchId = 3;

const REFERENCE_PAIRS: { markup: number; margin: number }[] = [
  { markup: 10, margin: 9.09 },
  { markup: 15, margin: 13.04 },
  { markup: 20, margin: 16.67 },
  { markup: 25, margin: 20 },
  { markup: 30, margin: 23.08 },
  { markup: 33.33, margin: 25 },
  { markup: 40, margin: 28.57 },
  { markup: 50, margin: 33.33 },
  { markup: 75, margin: 42.86 },
  { markup: 100, margin: 50 },
  { markup: 150, margin: 60 },
  { markup: 200, margin: 66.67 },
  { markup: 300, margin: 75 },
  { markup: 400, margin: 80 },
];

export default function Page() {
  const [mode, setMode] = useState<Mode>("sellingPrice");

  // Find Selling Price inputs
  const [spCost, setSpCost] = useState(50);
  const [spMarkup, setSpMarkup] = useState(60);

  // Find Markup % inputs
  const [muCost, setMuCost] = useState(50);
  const [muSelling, setMuSelling] = useState(80);

  // Find Cost inputs
  const [fcSelling, setFcSelling] = useState(100);
  const [fcMarkup, setFcMarkup] = useState(100);

  // Batch mode
  const [batchItems, setBatchItems] = useState<BatchItem[]>([
    { id: 1, name: "Product A", cost: 25, markupPct: 50 },
    { id: 2, name: "Product B", cost: 40, markupPct: 75 },
  ]);

  // --- Calculations ---

  // Mode 1: Find Selling Price (cost + markup %)
  const sp_sellingPrice = spCost * (1 + spMarkup / 100);
  const sp_profit = sp_sellingPrice - spCost;
  const sp_margin = sp_sellingPrice > 0 ? (sp_profit / sp_sellingPrice) * 100 : 0;

  // Mode 2: Find Markup % (cost + selling price)
  const mu_profit = muSelling - muCost;
  const mu_markup = muCost > 0 ? (mu_profit / muCost) * 100 : 0;
  const mu_margin = muSelling > 0 ? (mu_profit / muSelling) * 100 : 0;

  // Mode 3: Find Cost (selling price + markup %)
  const fc_cost = fcSelling / (1 + fcMarkup / 100);
  const fc_profit = fcSelling - fc_cost;
  const fc_margin = fcSelling > 0 ? (fc_profit / fcSelling) * 100 : 0;

  // Current values for the comparison panel
  let cmpCost: number, cmpSelling: number, cmpMarkup: number, cmpMargin: number, cmpProfit: number;
  if (mode === "sellingPrice") {
    cmpCost = spCost; cmpSelling = sp_sellingPrice; cmpMarkup = spMarkup; cmpMargin = sp_margin; cmpProfit = sp_profit;
  } else if (mode === "markupPct") {
    cmpCost = muCost; cmpSelling = muSelling; cmpMarkup = mu_markup; cmpMargin = mu_margin; cmpProfit = mu_profit;
  } else {
    cmpCost = fc_cost; cmpSelling = fcSelling; cmpMarkup = fcMarkup; cmpMargin = fc_margin; cmpProfit = fc_profit;
  }

  // Batch calculations
  function batchCalc(item: BatchItem) {
    const selling = item.cost * (1 + item.markupPct / 100);
    const profit = selling - item.cost;
    const margin = selling > 0 ? (profit / selling) * 100 : 0;
    return { selling, profit, margin };
  }

  function addBatchItem() {
    setBatchItems(prev => [...prev, { id: nextBatchId++, name: `Product ${String.fromCharCode(65 + prev.length)}`, cost: 0, markupPct: 50 }]);
  }

  function removeBatchItem(id: number) {
    setBatchItems(prev => prev.filter(item => item.id !== id));
  }

  function updateBatchItem(id: number, field: keyof Omit<BatchItem, "id">, value: string | number) {
    setBatchItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  }

  const batchTotalCost = batchItems.reduce((s, item) => s + item.cost, 0);
  const batchTotalRevenue = batchItems.reduce((s, item) => s + batchCalc(item).selling, 0);
  const batchTotalProfit = batchTotalRevenue - batchTotalCost;
  const batchAvgMargin = batchTotalRevenue > 0 ? (batchTotalProfit / batchTotalRevenue) * 100 : 0;
  const batchAvgMarkup = batchTotalCost > 0 ? (batchTotalProfit / batchTotalCost) * 100 : 0;

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  const modeLabels: Record<Mode, string> = {
    sellingPrice: "Find Selling Price",
    markupPct: "Find Markup %",
    cost: "Find Cost",
  };

  return (
    <ToolLayout
      title="Markup Calculator"
      description="Calculate markup percentage, selling price, cost, and profit margin. Compare markup vs margin, use batch mode for multiple products, and reference common markup-to-margin conversions."
      slug="markup-calculator"
      category="Finance"
      keywords={[
        "markup calculator",
        "markup percentage calculator",
        "selling price calculator",
        "markup vs margin",
        "cost markup calculator",
        "price markup calculator",
        "gross profit calculator",
        "retail markup calculator",
        "markup to margin converter",
        "product pricing calculator",
      ]}
      faqs={[
        {
          question: "What is markup and how is it calculated?",
          answer:
            "Markup is the percentage added to the cost of a product to determine its selling price. The formula is: Markup % = ((Selling Price - Cost) / Cost) x 100. For example, if a product costs $50 and you sell it for $80, the markup is ((80 - 50) / 50) x 100 = 60%.",
        },
        {
          question: "What is the difference between markup and profit margin?",
          answer:
            "Markup is calculated as a percentage of cost, while profit margin is calculated as a percentage of the selling price (revenue). A 100% markup equals a 50% profit margin. Markup is always higher than margin for the same transaction because cost is a smaller base than revenue. Both measure profitability but from different perspectives.",
        },
        {
          question: "How do I convert markup to margin?",
          answer:
            "To convert markup to margin, use the formula: Margin % = (Markup % / (100 + Markup %)) x 100. For example, a 50% markup converts to (50 / 150) x 100 = 33.33% margin. To convert margin to markup: Markup % = (Margin % / (100 - Margin %)) x 100.",
        },
        {
          question: "What is a typical markup percentage for retail?",
          answer:
            "Markup varies widely by industry. Grocery stores typically use 10-30% markup, clothing retail 100-300%, electronics 30-50%, restaurants 200-400% on food, and jewelry 100-400%. The ideal markup depends on operating costs, competition, perceived value, and demand elasticity.",
        },
        {
          question: "How do I calculate selling price from cost and markup?",
          answer:
            "Multiply the cost by (1 + markup percentage / 100). For example, if your cost is $40 and you want a 75% markup: $40 x (1 + 0.75) = $40 x 1.75 = $70 selling price. The gross profit would be $70 - $40 = $30.",
        },
        {
          question: "Can markup percentage be over 100%?",
          answer:
            "Yes, a markup over 100% is common in many industries. A 100% markup means you sell an item for double its cost. A 200% markup means the selling price is three times the cost. Restaurants, for example, often apply 200-400% markup on beverages and food items.",
        },
        {
          question: "How do I find cost from selling price and markup?",
          answer:
            "Divide the selling price by (1 + markup percentage / 100). For example, if the selling price is $120 and the markup is 50%: $120 / (1 + 0.50) = $120 / 1.50 = $80 cost. This is useful for reverse-engineering competitor pricing.",
        },
      ]}
      relatedTools={[
        { name: "Profit Margin Calculator", href: "/tools/profit-margin-calculator" },
        { name: "Discount Calculator", href: "/tools/discount-calculator" },
        { name: "Sales Tax Calculator", href: "/tools/sales-tax-calculator" },
        { name: "Percentage Calculator", href: "/tools/percentage-calculator" },
        { name: "Break Even Calculator", href: "/tools/break-even-calculator" },
        { name: "ROI Calculator", href: "/tools/roi-calculator" },
      ]}
      guide={
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-zinc-100">How to Use the Markup Calculator</h2>
          <p className="text-zinc-400 leading-relaxed">
            This markup calculator helps you determine selling prices, markup percentages, and costs for your
            products. Choose one of three calculation modes depending on what values you already know, and the
            calculator will instantly compute the missing values along with gross profit and margin.
          </p>
          <h3 className="text-xl font-semibold text-zinc-200">Find Selling Price Mode</h3>
          <p className="text-zinc-400 leading-relaxed">
            When you know your product cost and desired markup percentage, this mode calculates the selling
            price you should set. Enter your cost and markup percentage, and the calculator will show the
            selling price, gross profit amount, and equivalent profit margin percentage.
          </p>
          <h3 className="text-xl font-semibold text-zinc-200">Find Markup % Mode</h3>
          <p className="text-zinc-400 leading-relaxed">
            When you know both the cost and selling price, this mode reveals the actual markup percentage
            being applied. This is useful for analyzing competitor pricing or verifying that your existing
            prices meet your target markup.
          </p>
          <h3 className="text-xl font-semibold text-zinc-200">Find Cost Mode</h3>
          <p className="text-zinc-400 leading-relaxed">
            When you know the selling price and desired markup, this mode calculates the maximum cost you
            can pay for a product. This is valuable for procurement decisions and setting cost targets
            with suppliers.
          </p>
          <h3 className="text-xl font-semibold text-zinc-200">Markup vs Margin Comparison</h3>
          <p className="text-zinc-400 leading-relaxed">
            The comparison panel shows how markup and margin differ for the same transaction. Markup is
            based on cost while margin is based on selling price. Understanding both is essential for
            accurate pricing and financial reporting.
          </p>
          <h3 className="text-xl font-semibold text-zinc-200">Batch Mode</h3>
          <p className="text-zinc-400 leading-relaxed">
            Use batch mode to calculate selling prices for multiple products at once. Enter each product name,
            cost, and markup percentage to see individual and aggregate profitability metrics. This is ideal
            for creating or reviewing an entire product price list.
          </p>
        </div>
      }
    >
      {/* Mode Selector */}
      <div className="flex gap-2 mb-6">
        {(["sellingPrice", "markupPct", "cost"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === m
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {modeLabels[m]}
          </button>
        ))}
      </div>

      {/* Main Calculator */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {mode === "sellingPrice" && (
            <>
              <div>
                <label className={labelCls}>Cost ($)</label>
                <input type="number" value={spCost} onChange={(e) => setSpCost(+e.target.value)} className={inputCls} min={0} step={0.01} />
              </div>
              <div>
                <label className={labelCls}>Markup (%)</label>
                <input type="number" value={spMarkup} onChange={(e) => setSpMarkup(+e.target.value)} className={inputCls} min={0} step={1} />
              </div>
            </>
          )}
          {mode === "markupPct" && (
            <>
              <div>
                <label className={labelCls}>Cost ($)</label>
                <input type="number" value={muCost} onChange={(e) => setMuCost(+e.target.value)} className={inputCls} min={0} step={0.01} />
              </div>
              <div>
                <label className={labelCls}>Selling Price ($)</label>
                <input type="number" value={muSelling} onChange={(e) => setMuSelling(+e.target.value)} className={inputCls} min={0} step={0.01} />
              </div>
            </>
          )}
          {mode === "cost" && (
            <>
              <div>
                <label className={labelCls}>Selling Price ($)</label>
                <input type="number" value={fcSelling} onChange={(e) => setFcSelling(+e.target.value)} className={inputCls} min={0} step={0.01} />
              </div>
              <div>
                <label className={labelCls}>Markup (%)</label>
                <input type="number" value={fcMarkup} onChange={(e) => setFcMarkup(+e.target.value)} className={inputCls} min={0} step={1} />
              </div>
            </>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {mode === "sellingPrice" && (
            <>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
                <p className="text-sm text-zinc-400 mb-1">Selling Price</p>
                <p className="text-4xl font-bold text-blue-400">{fmtC(sp_sellingPrice)}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Gross Profit</p>
                  <p className="text-lg font-semibold text-green-400">{fmtC(sp_profit)}</p>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Markup %</p>
                  <p className="text-lg font-semibold text-yellow-400">{pct(spMarkup)}</p>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Margin %</p>
                  <p className="text-lg font-semibold text-purple-400">{pct(sp_margin)}</p>
                </div>
              </div>
            </>
          )}
          {mode === "markupPct" && (
            <>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
                <p className="text-sm text-zinc-400 mb-1">Markup Percentage</p>
                <p className="text-4xl font-bold text-blue-400">{pct(mu_markup)}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Gross Profit</p>
                  <p className="text-lg font-semibold text-green-400">{fmtC(mu_profit)}</p>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Margin %</p>
                  <p className="text-lg font-semibold text-purple-400">{pct(mu_margin)}</p>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Revenue</p>
                  <p className="text-lg font-semibold text-zinc-100">{fmtC(muSelling)}</p>
                </div>
              </div>
            </>
          )}
          {mode === "cost" && (
            <>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
                <p className="text-sm text-zinc-400 mb-1">Cost</p>
                <p className="text-4xl font-bold text-blue-400">{fmtC(fc_cost)}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Gross Profit</p>
                  <p className="text-lg font-semibold text-green-400">{fmtC(fc_profit)}</p>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Markup %</p>
                  <p className="text-lg font-semibold text-yellow-400">{pct(fcMarkup)}</p>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Margin %</p>
                  <p className="text-lg font-semibold text-purple-400">{pct(fc_margin)}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Markup vs Margin Comparison */}
      <div className="mt-8 bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Markup vs Margin Comparison</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <h4 className="text-sm font-medium text-zinc-200">Markup</h4>
            </div>
            <p className="text-3xl font-bold text-yellow-400 mb-2">{pct(cmpMarkup)}</p>
            <p className="text-xs text-zinc-500 mb-3">Percentage of <span className="text-zinc-300">cost</span></p>
            <div className="text-xs text-zinc-400 space-y-1">
              <div className="flex justify-between"><span>Formula</span><span className="text-zinc-300">(Profit / Cost) x 100</span></div>
              <div className="flex justify-between"><span>Profit</span><span className="text-green-400">{fmtC(cmpProfit)}</span></div>
              <div className="flex justify-between"><span>Base (Cost)</span><span className="text-zinc-300">{fmtC(cmpCost)}</span></div>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-purple-400" />
              <h4 className="text-sm font-medium text-zinc-200">Margin</h4>
            </div>
            <p className="text-3xl font-bold text-purple-400 mb-2">{pct(cmpMargin)}</p>
            <p className="text-xs text-zinc-500 mb-3">Percentage of <span className="text-zinc-300">selling price</span></p>
            <div className="text-xs text-zinc-400 space-y-1">
              <div className="flex justify-between"><span>Formula</span><span className="text-zinc-300">(Profit / Revenue) x 100</span></div>
              <div className="flex justify-between"><span>Profit</span><span className="text-green-400">{fmtC(cmpProfit)}</span></div>
              <div className="flex justify-between"><span>Base (Revenue)</span><span className="text-zinc-300">{fmtC(cmpSelling)}</span></div>
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-zinc-500 text-center">
          Same profit of {fmtC(cmpProfit)} — markup is always {cmpMargin > 0 ? "higher" : "equal"} because cost is a smaller base than revenue.
        </p>
      </div>

      {/* Quick Reference Table */}
      <div className="mt-8 bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Markup / Margin Quick Reference</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-700">
                <th className="text-left py-2 pr-4 font-medium">Markup %</th>
                <th className="text-left py-2 pr-4 font-medium">Margin %</th>
                <th className="text-left py-2 pr-4 font-medium">Multiplier</th>
                <th className="text-right py-2 font-medium">Example ($100 cost)</th>
              </tr>
            </thead>
            <tbody>
              {REFERENCE_PAIRS.map(({ markup, margin }) => (
                <tr key={markup} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                  <td className="py-2 pr-4 text-yellow-400 font-medium">{markup}%</td>
                  <td className="py-2 pr-4 text-purple-400">{margin}%</td>
                  <td className="py-2 pr-4 text-zinc-300">{(1 + markup / 100).toFixed(2)}x</td>
                  <td className="py-2 text-right text-zinc-300">{fmtC(100 * (1 + markup / 100))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Mode */}
      <div className="mt-8 bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-zinc-200">Batch Mode — Multiple Products</h3>
          <button
            onClick={addBatchItem}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
          >
            + Add Product
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-700">
                <th className="text-left py-2 pr-2 font-medium">Product</th>
                <th className="text-left py-2 pr-2 font-medium">Cost</th>
                <th className="text-left py-2 pr-2 font-medium">Markup %</th>
                <th className="text-right py-2 pr-2 font-medium">Selling Price</th>
                <th className="text-right py-2 pr-2 font-medium">Profit</th>
                <th className="text-right py-2 pr-2 font-medium">Margin %</th>
                <th className="text-right py-2 font-medium w-8"></th>
              </tr>
            </thead>
            <tbody>
              {batchItems.map((item) => {
                const calc = batchCalc(item);
                return (
                  <tr key={item.id} className="border-b border-zinc-800">
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateBatchItem(item.id, "name", e.target.value)}
                        className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-zinc-100 text-sm w-full min-w-[80px] focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        value={item.cost}
                        onChange={(e) => updateBatchItem(item.id, "cost", +e.target.value)}
                        className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-zinc-100 text-sm w-24 focus:outline-none focus:border-blue-500"
                        min={0}
                        step={0.01}
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        value={item.markupPct}
                        onChange={(e) => updateBatchItem(item.id, "markupPct", +e.target.value)}
                        className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-zinc-100 text-sm w-20 focus:outline-none focus:border-blue-500"
                        min={0}
                        step={1}
                      />
                    </td>
                    <td className="py-2 pr-2 text-right text-zinc-100">{fmtC(calc.selling)}</td>
                    <td className="py-2 pr-2 text-right text-green-400">{fmtC(calc.profit)}</td>
                    <td className="py-2 pr-2 text-right text-purple-400">{pct(calc.margin)}</td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => removeBatchItem(item.id)}
                        className="text-zinc-600 hover:text-red-400 transition-colors text-lg leading-none"
                        title="Remove product"
                      >
                        &times;
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {batchItems.length > 0 && (
              <tfoot>
                <tr className="border-t border-zinc-600 font-medium">
                  <td className="py-3 pr-2 text-zinc-300">Totals</td>
                  <td className="py-3 pr-2 text-zinc-300">{fmtC(batchTotalCost)}</td>
                  <td className="py-3 pr-2 text-yellow-400">{pct(batchAvgMarkup)} avg</td>
                  <td className="py-3 pr-2 text-right text-zinc-100">{fmtC(batchTotalRevenue)}</td>
                  <td className="py-3 pr-2 text-right text-green-400">{fmtC(batchTotalProfit)}</td>
                  <td className="py-3 pr-2 text-right text-purple-400">{pct(batchAvgMargin)} avg</td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        {batchItems.length === 0 && (
          <p className="text-center text-zinc-500 text-sm py-4">No products added. Click &quot;+ Add Product&quot; to get started.</p>
        )}
      </div>
    </ToolLayout>
  );
}
