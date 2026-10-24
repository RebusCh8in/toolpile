"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function Page() {
  const [purchasePrice, setPurchasePrice] = useState(50000);
  const [salePrice, setSalePrice] = useState(80000);
  const [holdingPeriod, setHoldingPeriod] = useState<"short" | "long">("long");
  const [taxableIncome, setTaxableIncome] = useState(85000);
  const [filing, setFiling] = useState<"single" | "married">("single");

  const result = useMemo(() => {
    const gain = salePrice - purchasePrice;
    const isLoss = gain < 0;

    let taxRate = 0;
    if (!isLoss) {
      if (holdingPeriod === "short") {
        // Short-term: taxed as ordinary income
        const totalIncome = taxableIncome + gain;
        if (filing === "single") {
          if (totalIncome <= 48475) taxRate = 12;
          else if (totalIncome <= 103350) taxRate = 22;
          else if (totalIncome <= 197300) taxRate = 24;
          else if (totalIncome <= 250525) taxRate = 32;
          else if (totalIncome <= 626350) taxRate = 35;
          else taxRate = 37;
        } else {
          if (totalIncome <= 96950) taxRate = 12;
          else if (totalIncome <= 206700) taxRate = 22;
          else if (totalIncome <= 394600) taxRate = 24;
          else if (totalIncome <= 501050) taxRate = 32;
          else if (totalIncome <= 751600) taxRate = 35;
          else taxRate = 37;
        }
      } else {
        // Long-term capital gains rates
        if (filing === "single") {
          if (taxableIncome <= 47025) taxRate = 0;
          else if (taxableIncome <= 518900) taxRate = 15;
          else taxRate = 20;
        } else {
          if (taxableIncome <= 94050) taxRate = 0;
          else if (taxableIncome <= 583750) taxRate = 15;
          else taxRate = 20;
        }
      }
    }

    const taxOwed = isLoss ? 0 : gain * (taxRate / 100);
    const netProfit = gain - taxOwed;
    // NIIT (Net Investment Income Tax) for high earners
    const niitThreshold = filing === "single" ? 200000 : 250000;
    const niit = taxableIncome > niitThreshold && !isLoss ? gain * 0.038 : 0;
    const totalTax = taxOwed + niit;
    const effectiveRate = gain > 0 ? (totalTax / gain) * 100 : 0;

    return { gain, isLoss, taxRate, taxOwed, niit, totalTax, netProfit: gain - totalTax, effectiveRate };
  }, [purchasePrice, salePrice, holdingPeriod, taxableIncome, filing]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Capital Gains Tax Calculator"
      description="Calculate capital gains tax on investments. Compare short-term vs long-term rates based on income and filing status."
      slug="capital-gains-tax-calculator"
      category="Finance"
      keywords={["capital gains tax calculator", "capital gains calculator", "stock tax calculator", "investment tax calculator", "long term capital gains tax calculator"]}
      faqs={[
        { question: "What are capital gains tax rates?", answer: "Long-term (held >1 year): 0%, 15%, or 20% based on income. Short-term (held <1 year): taxed as ordinary income at your marginal rate (10-37%). Long-term rates are significantly lower for most people." },
        { question: "What is NIIT?", answer: "Net Investment Income Tax is an additional 3.8% tax on investment income for singles earning over $200K or married couples over $250K. It applies on top of regular capital gains tax." },
        { question: "Can I offset gains with losses?", answer: "Yes. Capital losses offset capital gains dollar for dollar. If you have more losses than gains, you can deduct up to $3,000 of excess losses from ordinary income per year, with remaining losses carried forward." },
      ]}
      relatedTools={[
        { name: "Stock Profit Calculator", href: "/tools/stock-profit-calculator" },
        { name: "Income Tax Calculator", href: "/tools/income-tax-calculator" },
        { name: "ROI Calculator", href: "/tools/roi-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div><label className={labelCls}>Purchase Price ($)</label><input type="number" value={purchasePrice} onChange={e => setPurchasePrice(+e.target.value)} className={inputCls} min={0} step={1000} /></div>
          <div><label className={labelCls}>Sale Price ($)</label><input type="number" value={salePrice} onChange={e => setSalePrice(+e.target.value)} className={inputCls} min={0} step={1000} /></div>
          <div>
            <label className={labelCls}>Holding Period</label>
            <div className="flex gap-2">
              {(["short", "long"] as const).map(h => (
                <button key={h} onClick={() => setHoldingPeriod(h)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${holdingPeriod === h ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
                  {h === "short" ? "Short-Term (<1 yr)" : "Long-Term (>1 yr)"}
                </button>
              ))}
            </div>
          </div>
          <div><label className={labelCls}>Taxable Income ($)</label><input type="number" value={taxableIncome} onChange={e => setTaxableIncome(+e.target.value)} className={inputCls} min={0} step={1000} /></div>
          <div>
            <label className={labelCls}>Filing Status</label>
            <div className="flex gap-2">
              {(["single", "married"] as const).map(f => (
                <button key={f} onClick={() => setFiling(f)} className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filing === f ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{f}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`border rounded-xl p-5 text-center ${result.isLoss ? "bg-red-500/10 border-red-500/20" : "bg-zinc-800/50 border-zinc-700"}`}>
            <p className="text-sm text-zinc-400 mb-1">{result.isLoss ? "Capital Loss" : "Capital Gain"}</p>
            <p className={`text-4xl font-bold ${result.isLoss ? "text-red-400" : "text-green-400"}`}>{result.isLoss ? "" : "+"}{fmtC(result.gain)}</p>
          </div>
          {!result.isLoss && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Tax Rate</p><p className="text-lg font-semibold text-red-400">{result.taxRate}%</p></div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Tax Owed</p><p className="text-lg font-semibold text-red-400">{fmtC(result.totalTax)}</p></div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Net Profit</p><p className="text-lg font-semibold text-green-400">{fmtC(result.netProfit)}</p></div>
              </div>
              {result.niit > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm">
                  <p className="text-yellow-300">NIIT (3.8%): {fmtC(result.niit)}</p>
                  <p className="text-xs text-yellow-400/60">Effective rate: {result.effectiveRate.toFixed(1)}%</p>
                </div>
              )}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-sm space-y-1.5">
                <div className="flex justify-between"><span className="text-zinc-400">Capital Gain</span><span className="text-green-400">+{fmtC(result.gain)}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">CG Tax ({result.taxRate}%)</span><span className="text-red-400">−{fmtC(result.taxOwed)}</span></div>
                {result.niit > 0 && <div className="flex justify-between"><span className="text-zinc-400">NIIT (3.8%)</span><span className="text-red-400">−{fmtC(result.niit)}</span></div>}
                <div className="flex justify-between border-t border-zinc-700 pt-1 font-semibold"><span className="text-zinc-200">After-Tax Profit</span><span className="text-green-400">{fmtC(result.netProfit)}</span></div>
              </div>
            </>
          )}
          {result.isLoss && (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-sm">
              <p className="text-zinc-300">Capital losses can offset gains and up to $3,000 of ordinary income per year.</p>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
