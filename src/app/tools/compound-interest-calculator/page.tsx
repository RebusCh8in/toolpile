"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

const frequencies = [
  { label: "Annually", value: 1 },
  { label: "Semi-Annually", value: 2 },
  { label: "Quarterly", value: 4 },
  { label: "Monthly", value: 12 },
  { label: "Daily", value: 365 },
];

export default function Page() {
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(10);
  const [contribution, setContribution] = useState(200);
  const [compounding, setCompounding] = useState(12);

  const result = useMemo(() => {
    const r = rate / 100;
    const n = compounding;
    const t = years;
    const P = principal;
    const c = contribution;

    // Year-by-year breakdown
    const breakdown: { year: number; balance: number; totalContributions: number; totalInterest: number }[] = [];
    let balance = P;
    let totalContributions = P;
    let totalInterest = 0;

    for (let y = 1; y <= t; y++) {
      for (let p = 0; p < n; p++) {
        const interest = balance * (r / n);
        balance += interest + c;
        totalInterest += interest;
        totalContributions += c;
      }
      breakdown.push({ year: y, balance, totalContributions, totalInterest });
    }

    return { balance, totalContributions, totalInterest, breakdown };
  }, [principal, rate, years, contribution, compounding]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Compound Interest Calculator"
      description="Calculate how your money grows with compound interest. See the power of compounding with regular contributions over time."
      slug="compound-interest-calculator"
      category="Finance"
      keywords={["compound interest calculator", "investment calculator", "interest calculator", "compound growth calculator", "savings calculator"]}
      faqs={[
        { question: "What is compound interest?", answer: "Compound interest is interest calculated on both the initial principal and the accumulated interest from previous periods. Unlike simple interest, your earnings generate their own earnings, creating exponential growth over time." },
        { question: "How does compounding frequency affect returns?", answer: "More frequent compounding (daily vs annually) results in slightly higher returns because interest starts earning interest sooner. The difference is most noticeable at higher interest rates and longer time periods." },
        { question: "What is the Rule of 72?", answer: "The Rule of 72 estimates how long it takes to double your money: divide 72 by the annual interest rate. At 7% annual return, your money roughly doubles every 10.3 years (72 ÷ 7 = 10.3)." },
        { question: "Are the results guaranteed?", answer: "No. This calculator assumes a fixed interest rate, which is useful for savings accounts and bonds. Investment returns (stocks, funds) vary year to year. Use the average historical return for long-term projections." },
      ]}
      relatedTools={[
        { name: "Mortgage Calculator", href: "/tools/mortgage-calculator" },
        { name: "Savings Calculator", href: "/tools/savings-calculator" },
        { name: "Retirement Calculator", href: "/tools/retirement-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Initial Investment ($)</label>
            <input type="number" value={principal} onChange={e => setPrincipal(+e.target.value)} className={inputCls} min={0} step={100} />
          </div>
          <div>
            <label className={labelCls}>Annual Interest Rate (%)</label>
            <input type="number" value={rate} onChange={e => setRate(+e.target.value)} className={inputCls} min={0} max={100} step={0.1} />
          </div>
          <div>
            <label className={labelCls}>Time Period (years)</label>
            <input type="number" value={years} onChange={e => setYears(Math.min(50, +e.target.value))} className={inputCls} min={1} max={50} />
          </div>
          <div>
            <label className={labelCls}>Regular Contribution ($)</label>
            <input type="number" value={contribution} onChange={e => setContribution(+e.target.value)} className={inputCls} min={0} step={50} />
            <p className="text-xs text-zinc-500 mt-1">Added each compounding period</p>
          </div>
          <div>
            <label className={labelCls}>Compounding Frequency</label>
            <select value={compounding} onChange={e => setCompounding(+e.target.value)} className={inputCls}>
              {frequencies.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
            <p className="text-sm text-zinc-400 mb-1">Future Value</p>
            <p className="text-4xl font-bold text-blue-400">{fmtC(result.balance)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Total Contributions</p>
              <p className="text-lg font-semibold text-green-400">{fmtC(result.totalContributions)}</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Total Interest Earned</p>
              <p className="text-lg font-semibold text-yellow-400">{fmtC(result.totalInterest)}</p>
            </div>
          </div>

          {/* Visual bar */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">Growth Breakdown</p>
            <div className="flex rounded-full overflow-hidden h-4">
              <div className="bg-green-500" style={{ width: `${(result.totalContributions / result.balance) * 100}%` }} />
              <div className="bg-yellow-500" style={{ width: `${(result.totalInterest / result.balance) * 100}%` }} />
            </div>
            <div className="flex gap-4 mt-2 text-xs text-zinc-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />Contributions ({((result.totalContributions / result.balance) * 100).toFixed(0)}%)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" />Interest ({((result.totalInterest / result.balance) * 100).toFixed(0)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Year-by-year table */}
      <div className="mt-8 max-h-96 overflow-y-auto border border-zinc-700 rounded-lg">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-zinc-800">
            <tr className="text-zinc-400 text-left">
              <th className="px-3 py-2">Year</th>
              <th className="px-3 py-2">Balance</th>
              <th className="px-3 py-2">Contributions</th>
              <th className="px-3 py-2">Interest Earned</th>
            </tr>
          </thead>
          <tbody>
            {result.breakdown.map(row => (
              <tr key={row.year} className="border-t border-zinc-800 text-zinc-300">
                <td className="px-3 py-1.5">{row.year}</td>
                <td className="px-3 py-1.5">{fmtC(row.balance)}</td>
                <td className="px-3 py-1.5">{fmtC(row.totalContributions)}</td>
                <td className="px-3 py-1.5">{fmtC(row.totalInterest)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ToolLayout>
  );
}
