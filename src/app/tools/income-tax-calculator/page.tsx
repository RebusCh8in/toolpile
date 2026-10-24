"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }

const brackets = {
  single: [
    { min: 0, max: 11925, rate: 10 },
    { min: 11925, max: 48475, rate: 12 },
    { min: 48475, max: 103350, rate: 22 },
    { min: 103350, max: 197300, rate: 24 },
    { min: 197300, max: 250525, rate: 32 },
    { min: 250525, max: 626350, rate: 35 },
    { min: 626350, max: Infinity, rate: 37 },
  ],
  married: [
    { min: 0, max: 23850, rate: 10 },
    { min: 23850, max: 96950, rate: 12 },
    { min: 96950, max: 206700, rate: 22 },
    { min: 206700, max: 394600, rate: 24 },
    { min: 394600, max: 501050, rate: 32 },
    { min: 501050, max: 751600, rate: 35 },
    { min: 751600, max: Infinity, rate: 37 },
  ],
  hoh: [
    { min: 0, max: 17000, rate: 10 },
    { min: 17000, max: 64850, rate: 12 },
    { min: 64850, max: 103350, rate: 22 },
    { min: 103350, max: 197300, rate: 24 },
    { min: 197300, max: 250500, rate: 32 },
    { min: 250500, max: 626350, rate: 35 },
    { min: 626350, max: Infinity, rate: 37 },
  ],
};

const stdDeduction = { single: 15700, married: 31400, hoh: 22500 };

export default function Page() {
  const [income, setIncome] = useState(85000);
  const [filing, setFiling] = useState<"single" | "married" | "hoh">("single");
  const [deductionType, setDeductionType] = useState<"standard" | "itemized">("standard");
  const [itemizedAmount, setItemizedAmount] = useState(20000);

  const result = useMemo(() => {
    const deduction = deductionType === "standard" ? stdDeduction[filing] : itemizedAmount;
    const taxable = Math.max(0, income - deduction);
    const b = brackets[filing];

    let tax = 0;
    const breakdown: { bracket: string; taxable: number; tax: number }[] = [];
    for (const br of b) {
      if (taxable <= br.min) break;
      const amt = Math.min(taxable, br.max) - br.min;
      const t = amt * (br.rate / 100);
      tax += t;
      breakdown.push({
        bracket: `${br.rate}%${br.max === Infinity ? "+" : ` ($${br.min.toLocaleString()}-$${br.max.toLocaleString()})`}`,
        taxable: amt,
        tax: t,
      });
    }

    const effectiveRate = income > 0 ? (tax / income) * 100 : 0;
    const marginalRate = b.find(br => taxable <= br.max)?.rate || 37;
    const afterTax = income - tax;

    return { deduction, taxable, tax, effectiveRate, marginalRate, afterTax, breakdown };
  }, [income, filing, deductionType, itemizedAmount]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const filingLabels = { single: "Single", married: "Married Filing Jointly", hoh: "Head of Household" };

  return (
    <ToolLayout
      title="Income Tax Calculator"
      description="Estimate your federal income tax using 2026 brackets. See marginal and effective rates with a bracket-by-bracket breakdown."
      slug="income-tax-calculator"
      category="Finance"
      keywords={["income tax calculator", "federal tax calculator", "tax bracket calculator", "tax estimator", "how much tax do I owe"]}
      faqs={[
        { question: "How do tax brackets work?", answer: "Tax brackets are marginal — only the income within each bracket is taxed at that rate. Being 'in the 24% bracket' doesn't mean all your income is taxed at 24%. The first $11,925 (single) is taxed at 10%, the next portion at 12%, and so on." },
        { question: "What is the difference between marginal and effective tax rate?", answer: "Your marginal rate is the bracket your last dollar falls in. Your effective rate is total tax divided by total income. Someone earning $85K (single) has a 22% marginal rate but only ~14% effective rate." },
        { question: "Should I take the standard or itemized deduction?", answer: "Take whichever is larger. The 2026 standard deduction is $15,700 (single) or $31,400 (married). Itemize only if your deductible expenses (mortgage interest, state/local taxes up to $10K, charitable giving) exceed the standard deduction." },
      ]}
      relatedTools={[
        { name: "Paycheck Calculator", href: "/tools/paycheck-calculator" },
        { name: "Salary Calculator", href: "/tools/salary-calculator" },
        { name: "Sales Tax Calculator", href: "/tools/sales-tax-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div><label className={labelCls}>Annual Gross Income ($)</label><input type="number" value={income} onChange={e => setIncome(+e.target.value)} className={inputCls} min={0} step={1000} /></div>
          <div>
            <label className={labelCls}>Filing Status</label>
            <select value={filing} onChange={e => setFiling(e.target.value as typeof filing)} className={inputCls}>
              {(Object.keys(filingLabels) as (keyof typeof filingLabels)[]).map(f => <option key={f} value={f}>{filingLabels[f]}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Deduction</label>
            <div className="flex gap-2 mb-2">
              {(["standard", "itemized"] as const).map(d => (
                <button key={d} onClick={() => setDeductionType(d)} className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${deductionType === d ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{d}</button>
              ))}
            </div>
            {deductionType === "standard" ? (
              <p className="text-sm text-zinc-500">Standard deduction: {fmtC(stdDeduction[filing])}</p>
            ) : (
              <input type="number" value={itemizedAmount} onChange={e => setItemizedAmount(+e.target.value)} className={inputCls} min={0} step={500} />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">Estimated Federal Tax</p>
            <p className="text-4xl font-bold text-red-400">{fmtC(result.tax)}</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Effective Rate</p><p className="text-lg font-semibold text-yellow-400">{result.effectiveRate.toFixed(1)}%</p></div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Marginal Rate</p><p className="text-lg font-semibold text-red-400">{result.marginalRate}%</p></div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">After Tax</p><p className="text-lg font-semibold text-green-400">{fmtC(result.afterTax)}</p></div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-sm space-y-1.5">
            <div className="flex justify-between"><span className="text-zinc-400">Gross Income</span><span className="text-zinc-100">{fmtC(income)}</span></div>
            <div className="flex justify-between text-zinc-400"><span>Deduction</span><span>−{fmtC(result.deduction)}</span></div>
            <div className="flex justify-between border-t border-zinc-700 pt-1"><span className="text-zinc-300">Taxable Income</span><span className="text-zinc-100">{fmtC(result.taxable)}</span></div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">Bracket Breakdown</p>
            <div className="space-y-1">
              {result.breakdown.map(b => (
                <div key={b.bracket} className="flex justify-between text-sm">
                  <span className="text-zinc-400">{b.bracket}</span>
                  <span className="text-zinc-300">{fmtC(b.taxable)}</span>
                  <span className="text-red-400">{fmtC(b.tax)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
