"use client";
import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function Page() {
  const [mode, setMode] = useState<"add" | "extract">("add");
  const [amount, setAmount] = useState(100);
  const [vatRate, setVatRate] = useState(20);

  const vatAmount = mode === "add" ? amount * (vatRate / 100) : amount - amount / (1 + vatRate / 100);
  const netAmount = mode === "add" ? amount : amount / (1 + vatRate / 100);
  const grossAmount = mode === "add" ? amount + vatAmount : amount;

  const countryRates: [string, number][] = [
    ["UK", 20], ["Germany", 19], ["France", 20], ["Italy", 22], ["Spain", 21],
    ["Netherlands", 21], ["Sweden", 25], ["Norway", 25], ["Denmark", 25], ["Poland", 23],
    ["Ireland", 23], ["Portugal", 23], ["Belgium", 21], ["Austria", 20], ["Switzerland", 8.1],
    ["Japan", 10], ["Australia", 10], ["Canada", 5], ["India", 18], ["Brazil", 17],
  ];

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="VAT Calculator"
      description="Calculate Value Added Tax (VAT). Add VAT to a net price or extract VAT from a gross price. Country rate presets included."
      slug="vat-calculator"
      category="Finance"
      keywords={["vat calculator", "value added tax calculator", "vat calculator uk", "vat calculator online", "calculate vat"]}
      faqs={[
        { question: "How is VAT calculated?", answer: "To add VAT: VAT = Net Price × (Rate / 100). Gross = Net + VAT. For £100 at 20%: VAT = £20, Gross = £120. To extract VAT from gross: Net = Gross ÷ (1 + Rate/100). £120 ÷ 1.20 = £100 net." },
        { question: "What is the difference between VAT and sales tax?", answer: "VAT is collected at each stage of production/distribution. Sales tax is collected only at the final point of sale. VAT is used in 170+ countries; the US uses sales tax instead." },
        { question: "What are common VAT rates?", answer: "EU countries range from 17-27%. UK: 20%. Germany: 19%. France: 20%. Many countries have reduced rates for essentials (food, medicine) and zero-rated items (exports)." },
      ]}
      relatedTools={[
        { name: "Sales Tax Calculator", href: "/tools/sales-tax-calculator" },
        { name: "Discount Calculator", href: "/tools/discount-calculator" },
        { name: "Percentage Calculator", href: "/tools/percentage-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            <button onClick={() => setMode("add")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "add" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>Add VAT</button>
            <button onClick={() => setMode("extract")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "extract" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>Extract VAT</button>
          </div>
          <div>
            <label className={labelCls}>{mode === "add" ? "Net Amount (excl. VAT)" : "Gross Amount (incl. VAT)"}</label>
            <input type="number" value={amount} onChange={e => setAmount(+e.target.value)} className={inputCls} min={0} step={0.01} />
          </div>
          <div>
            <label className={labelCls}>VAT Rate (%)</label>
            <input type="number" value={vatRate} onChange={e => setVatRate(+e.target.value)} className={inputCls} min={0} max={50} step={0.1} />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Country VAT Rates</p>
            <div className="flex flex-wrap gap-1.5">
              {countryRates.map(([country, rate]) => (
                <button key={country} onClick={() => setVatRate(rate)} className={`px-2 py-1 rounded text-xs transition-colors ${Math.abs(vatRate - rate) < 0.05 ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
                  {country} {rate}%
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
            <p className="text-sm text-zinc-400 mb-1">{mode === "add" ? "Gross Amount (incl. VAT)" : "Net Amount (excl. VAT)"}</p>
            <p className="text-4xl font-bold text-blue-400">{fmtC(mode === "add" ? grossAmount : netAmount)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Net (excl. VAT)</p><p className="text-lg font-semibold text-zinc-100">{fmtC(netAmount)}</p></div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3"><p className="text-xs text-red-300">VAT Amount</p><p className="text-lg font-semibold text-red-400">{fmtC(vatAmount)}</p></div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">VAT at Different Rates</p>
            <div className="space-y-1">
              {[5, 10, 15, 19, 20, 21, 23, 25].map(r => {
                const v = mode === "add" ? amount * (r / 100) : amount - amount / (1 + r / 100);
                const g = mode === "add" ? amount + amount * (r / 100) : amount;
                const n = mode === "add" ? amount : amount / (1 + r / 100);
                const isActive = Math.abs(r - vatRate) < 0.05;
                return (
                  <div key={r} className={`flex justify-between text-sm px-2 py-1 rounded ${isActive ? "bg-blue-600/20 text-blue-300" : "text-zinc-400"}`}>
                    <span>{r}%</span>
                    <span>VAT: {fmtC(v)}</span>
                    <span>{mode === "add" ? `Gross: ${fmtC(g)}` : `Net: ${fmtC(n)}`}</span>
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
