"use client";
import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function Page() {
  const [mode, setMode] = useState<"add" | "extract">("add");
  const [amount, setAmount] = useState(49.99);
  const [taxRate, setTaxRate] = useState(8.25);

  // Add tax
  const taxAmount = amount * (taxRate / 100);
  const totalWithTax = amount + taxAmount;

  // Extract tax (amount includes tax)
  const preTax = amount / (1 + taxRate / 100);
  const extractedTax = amount - preTax;

  const stateRates: [string, number][] = [
    ["CA", 7.25], ["TX", 6.25], ["FL", 6.00], ["NY", 4.00], ["IL", 6.25],
    ["PA", 6.00], ["OH", 5.75], ["GA", 4.00], ["NC", 4.75], ["MI", 6.00],
    ["NJ", 6.625], ["VA", 5.3], ["WA", 6.5], ["AZ", 5.6], ["MA", 6.25],
    ["TN", 7.00], ["IN", 7.00], ["MO", 4.225], ["WI", 5.00], ["CO", 2.9],
  ];

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Sales Tax Calculator"
      description="Calculate sales tax on any purchase. Add tax to a price or extract tax from a total. Quick state rate presets included."
      slug="sales-tax-calculator"
      category="Finance"
      keywords={["sales tax calculator", "tax calculator", "sales tax", "calculate sales tax", "tax amount calculator"]}
      faqs={[
        { question: "How is sales tax calculated?", answer: "Sales tax = Price × (Tax Rate / 100). For an $49.99 item at 8.25% tax: $49.99 × 0.0825 = $4.12 tax, total = $54.11." },
        { question: "What states have no sales tax?", answer: "Five states have no state sales tax: Alaska, Delaware, Montana, New Hampshire, and Oregon. However, Alaska allows local municipalities to charge sales tax." },
        { question: "How do I extract tax from a total?", answer: "To find the pre-tax price from a total that includes tax: Pre-tax = Total ÷ (1 + Tax Rate). For $54.11 with 8.25% tax: $54.11 ÷ 1.0825 = $49.99." },
      ]}
      relatedTools={[
        { name: "Tip Calculator", href: "/tools/tip-calculator" },
        { name: "Discount Calculator", href: "/tools/discount-calculator" },
        { name: "Percentage Calculator", href: "/tools/percentage-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            <button onClick={() => setMode("add")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "add" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>Add Tax to Price</button>
            <button onClick={() => setMode("extract")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "extract" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>Extract Tax from Total</button>
          </div>
          <div>
            <label className={labelCls}>{mode === "add" ? "Price Before Tax ($)" : "Total Including Tax ($)"}</label>
            <input type="number" value={amount} onChange={e => setAmount(+e.target.value)} className={inputCls} min={0} step={0.01} />
          </div>
          <div>
            <label className={labelCls}>Tax Rate (%)</label>
            <input type="number" value={taxRate} onChange={e => setTaxRate(+e.target.value)} className={inputCls} min={0} max={30} step={0.125} />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Quick State Rates</p>
            <div className="flex flex-wrap gap-1.5">
              {stateRates.map(([state, rate]) => (
                <button key={state} onClick={() => setTaxRate(rate)} className={`px-2 py-1 rounded text-xs transition-colors ${Math.abs(taxRate - rate) < 0.01 ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
                  {state} {rate}%
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {mode === "add" ? (
            <>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
                <p className="text-sm text-zinc-400 mb-1">Total with Tax</p>
                <p className="text-4xl font-bold text-blue-400">{fmtC(totalWithTax)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Price</p><p className="text-lg font-semibold text-zinc-100">{fmtC(amount)}</p></div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Tax Amount</p><p className="text-lg font-semibold text-red-400">+{fmtC(taxAmount)}</p></div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
                <p className="text-sm text-zinc-400 mb-1">Pre-Tax Price</p>
                <p className="text-4xl font-bold text-blue-400">{fmtC(preTax)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Tax Included</p><p className="text-lg font-semibold text-red-400">{fmtC(extractedTax)}</p></div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Total Paid</p><p className="text-lg font-semibold text-zinc-100">{fmtC(amount)}</p></div>
              </div>
            </>
          )}

          {/* Quick calculation table */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">Tax at Different Rates</p>
            <div className="space-y-1">
              {[5, 6, 7, 8, 8.25, 9, 10].map(r => {
                const t = amount * (r / 100);
                const isActive = Math.abs(r - taxRate) < 0.01;
                return (
                  <div key={r} className={`flex justify-between text-sm px-2 py-1 rounded ${isActive ? "bg-blue-600/20 text-blue-300" : "text-zinc-400"}`}>
                    <span>{r}%</span>
                    <span>Tax: {fmtC(t)}</span>
                    <span>Total: {fmtC(amount + t)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
