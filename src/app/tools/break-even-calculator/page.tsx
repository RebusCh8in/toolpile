"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function Page() {
  const [fixedCosts, setFixedCosts] = useState(10000);
  const [variableCostPerUnit, setVariableCostPerUnit] = useState(15);
  const [pricePerUnit, setPricePerUnit] = useState(35);

  const result = useMemo(() => {
    const contribution = pricePerUnit - variableCostPerUnit;
    if (contribution <= 0) return { error: "Price must be higher than variable cost per unit" } as const;
    const breakEvenUnits = Math.ceil(fixedCosts / contribution);
    const breakEvenRevenue = breakEvenUnits * pricePerUnit;
    const contributionMargin = (contribution / pricePerUnit) * 100;

    // Profit at different volumes
    const profitAt = (units: number) => (pricePerUnit * units) - (fixedCosts + variableCostPerUnit * units);

    return { breakEvenUnits, breakEvenRevenue, contribution, contributionMargin, profitAt };
  }, [fixedCosts, variableCostPerUnit, pricePerUnit]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Break Even Calculator"
      description="Calculate the break-even point for your business. See how many units you need to sell to cover fixed and variable costs."
      slug="break-even-calculator"
      category="Finance"
      keywords={["break even calculator", "breakeven calculator", "break even analysis", "break even point calculator", "breakeven analysis"]}
      faqs={[
        { question: "What is the break-even point?", answer: "The break-even point is where total revenue equals total costs (fixed + variable). Below this, you lose money; above, you profit. Formula: Break-Even Units = Fixed Costs ÷ (Price - Variable Cost Per Unit)." },
        { question: "What are fixed vs variable costs?", answer: "Fixed costs don't change with volume: rent, salaries, insurance. Variable costs change per unit: materials, shipping, commissions. Understanding this split is key to pricing and profitability." },
        { question: "What is contribution margin?", answer: "Contribution margin = (Price - Variable Cost) ÷ Price. It shows what % of each sale goes toward covering fixed costs and profit. A 57% margin means 57 cents of each dollar covers overhead and profit." },
      ]}
      relatedTools={[
        { name: "Profit Margin Calculator", href: "/tools/profit-margin-calculator" },
        { name: "ROI Calculator", href: "/tools/roi-calculator" },
        { name: "Discount Calculator", href: "/tools/discount-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div><label className={labelCls}>Fixed Costs ($)</label><input type="number" value={fixedCosts} onChange={e => setFixedCosts(+e.target.value)} className={inputCls} min={0} step={100} /></div>
          <div><label className={labelCls}>Variable Cost Per Unit ($)</label><input type="number" value={variableCostPerUnit} onChange={e => setVariableCostPerUnit(+e.target.value)} className={inputCls} min={0} step={0.5} /></div>
          <div><label className={labelCls}>Price Per Unit ($)</label><input type="number" value={pricePerUnit} onChange={e => setPricePerUnit(+e.target.value)} className={inputCls} min={0} step={0.5} /></div>
        </div>

        <div className="space-y-4">
          {"error" in result ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 text-center"><p className="text-red-400">{result.error}</p></div>
          ) : (
            <>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
                <p className="text-sm text-zinc-400 mb-1">Break-Even Point</p>
                <p className="text-4xl font-bold text-blue-400">{result.breakEvenUnits.toLocaleString()} <span className="text-lg text-zinc-400">units</span></p>
                <p className="text-sm text-zinc-500 mt-1">{fmtC(result.breakEvenRevenue)} in revenue</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Contribution/Unit</p><p className="text-lg font-semibold text-green-400">{fmtC(result.contribution)}</p></div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Contribution Margin</p><p className="text-lg font-semibold text-yellow-400">{result.contributionMargin.toFixed(1)}%</p></div>
              </div>

              {/* Profit at different volumes */}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500 mb-2">Profit at Different Sales Volumes</p>
                <div className="space-y-1">
                  {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3].map(mult => {
                    const units = Math.round(result.breakEvenUnits * mult);
                    const profit = result.profitAt(units);
                    return (
                      <div key={mult} className={`flex justify-between text-sm px-2 py-1 rounded ${mult === 1 ? "bg-blue-600/20 text-blue-300" : "text-zinc-400"}`}>
                        <span>{units.toLocaleString()} units</span>
                        <span>Rev: {fmtC(units * pricePerUnit)}</span>
                        <span className={profit >= 0 ? "text-green-400" : "text-red-400"}>{profit >= 0 ? "+" : ""}{fmtC(profit)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
