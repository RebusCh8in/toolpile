"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function Page() {
  const [mode, setMode] = useState<"simple" | "compound">("simple");
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(5);
  const [years, setYears] = useState(5);
  const [compoundFreq, setCompoundFreq] = useState(12);

  const result = useMemo(() => {
    if (mode === "simple") {
      const interest = principal * (rate / 100) * years;
      const total = principal + interest;
      return { interest, total, apy: rate };
    } else {
      const total = principal * Math.pow(1 + rate / 100 / compoundFreq, compoundFreq * years);
      const interest = total - principal;
      const apy = (Math.pow(1 + rate / 100 / compoundFreq, compoundFreq) - 1) * 100;
      return { interest, total, apy };
    }
  }, [mode, principal, rate, years, compoundFreq]);

  const yearByYear = useMemo(() => {
    const rows = [];
    for (let y = 1; y <= years; y++) {
      let bal: number;
      if (mode === "simple") {
        bal = principal + principal * (rate / 100) * y;
      } else {
        bal = principal * Math.pow(1 + rate / 100 / compoundFreq, compoundFreq * y);
      }
      rows.push({ year: y, balance: bal, interest: bal - principal });
    }
    return rows;
  }, [mode, principal, rate, years, compoundFreq]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  const freqOptions = [
    { label: "Annually", value: 1 }, { label: "Semi-Annually", value: 2 },
    { label: "Quarterly", value: 4 }, { label: "Monthly", value: 12 }, { label: "Daily", value: 365 },
  ];

  return (
    <ToolLayout
      title="Interest Calculator"
      description="Calculate simple and compound interest on savings or investments. Compare growth over time with year-by-year breakdown."
      slug="interest-calculator"
      category="Finance"
      keywords={["interest calculator", "simple interest calculator", "compound interest calculator", "interest rate calculator", "savings interest calculator"]}
      faqs={[
        { question: "What is the difference between simple and compound interest?", answer: "Simple interest is calculated only on the original principal: I = P × r × t. Compound interest is calculated on principal plus accumulated interest, so you earn 'interest on interest'. Over time, compound interest grows much faster." },
        { question: "What is APY?", answer: "APY (Annual Percentage Yield) is the effective annual rate when compounding is factored in. A 5% rate compounded monthly has an APY of 5.12%. APY lets you compare accounts with different compounding frequencies." },
        { question: "How often should interest compound?", answer: "More frequent compounding earns slightly more. Monthly vs annual compounding on $10,000 at 5% for 10 years: monthly = $16,470 vs annual = $16,289 — a $181 difference. Daily compounding adds even less beyond monthly." },
      ]}
      relatedTools={[
        { name: "Compound Interest Calculator", href: "/tools/compound-interest-calculator" },
        { name: "Savings Calculator", href: "/tools/savings-calculator" },
        { name: "Investment Calculator", href: "/tools/investment-calculator" },
      ]}
    >
      <div className="flex gap-2 mb-6">
        {(["simple", "compound"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${mode === m ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
            {m} Interest
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div><label className={labelCls}>Principal ($)</label><input type="number" value={principal} onChange={e => setPrincipal(+e.target.value)} className={inputCls} min={0} step={100} /></div>
          <div><label className={labelCls}>Annual Interest Rate (%)</label><input type="number" value={rate} onChange={e => setRate(+e.target.value)} className={inputCls} min={0} max={50} step={0.1} /></div>
          <div><label className={labelCls}>Time Period (years)</label><input type="number" value={years} onChange={e => setYears(+e.target.value)} className={inputCls} min={1} max={50} step={1} /></div>
          {mode === "compound" && (
            <div>
              <label className={labelCls}>Compounding Frequency</label>
              <select value={compoundFreq} onChange={e => setCompoundFreq(+e.target.value)} className={inputCls}>
                {freqOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">Total Value After {years} Years</p>
            <p className="text-4xl font-bold text-blue-400">{fmtC(result.total)}</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Principal</p><p className="text-lg font-semibold text-zinc-100">{fmtC(principal)}</p></div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Interest Earned</p><p className="text-lg font-semibold text-green-400">{fmtC(result.interest)}</p></div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">{mode === "compound" ? "APY" : "Rate"}</p><p className="text-lg font-semibold text-yellow-400">{result.apy.toFixed(2)}%</p></div>
          </div>
        </div>
      </div>

      {yearByYear.length > 0 && yearByYear.length <= 30 && (
        <details className="mt-6">
          <summary className="cursor-pointer text-sm text-zinc-400 hover:text-zinc-200">Year-by-Year Breakdown</summary>
          <div className="mt-3 bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-zinc-700 text-zinc-500"><th className="text-left p-2">Year</th><th className="text-right p-2">Balance</th><th className="text-right p-2">Interest Earned</th></tr></thead>
              <tbody>
                {yearByYear.map(r => (
                  <tr key={r.year} className="border-b border-zinc-800"><td className="p-2 text-zinc-300">{r.year}</td><td className="text-right p-2 text-zinc-100">{fmtC(r.balance)}</td><td className="text-right p-2 text-green-400">{fmtC(r.interest)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </ToolLayout>
  );
}
