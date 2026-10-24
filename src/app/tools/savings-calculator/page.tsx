"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function Page() {
  const [initial, setInitial] = useState(5000);
  const [monthly, setMonthly] = useState(300);
  const [rate, setRate] = useState(4.5);
  const [years, setYears] = useState(5);

  const result = useMemo(() => {
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;
    const breakdown: { year: number; balance: number; deposits: number; interest: number }[] = [];
    let balance = initial;
    let totalDeposits = initial;
    let totalInterest = 0;

    for (let y = 1; y <= years; y++) {
      for (let m = 0; m < 12; m++) {
        const interest = balance * monthlyRate;
        balance += interest + monthly;
        totalInterest += interest;
        totalDeposits += monthly;
      }
      breakdown.push({ year: y, balance, deposits: totalDeposits, interest: totalInterest });
    }

    return { balance, totalDeposits, totalInterest, breakdown };
  }, [initial, monthly, rate, years]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Savings Calculator"
      description="Calculate how your savings will grow over time with regular deposits and compound interest. See year-by-year breakdown."
      slug="savings-calculator"
      category="Finance"
      keywords={["savings calculator", "savings account calculator", "savings goal calculator", "savings interest calculator", "how much will I save"]}
      faqs={[
        { question: "What interest rate should I expect?", answer: "As of 2026, high-yield savings accounts offer 4-5% APY. Traditional bank savings accounts offer 0.01-0.5%. CDs may offer 4.5-5.5% for fixed terms. Online banks typically offer the highest rates." },
        { question: "How often is interest compounded?", answer: "Most savings accounts compound daily or monthly. This calculator uses monthly compounding. Daily compounding would yield slightly more, but the difference is minimal at typical savings rates." },
        { question: "What's the difference between APR and APY?", answer: "APR is the annual interest rate without compounding. APY (Annual Percentage Yield) includes the effect of compounding and is always slightly higher. Banks advertise APY for savings accounts, which is what this calculator uses." },
      ]}
      relatedTools={[
        { name: "Compound Interest Calculator", href: "/tools/compound-interest-calculator" },
        { name: "Retirement Calculator", href: "/tools/retirement-calculator" },
        { name: "Percentage Calculator", href: "/tools/percentage-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Starting Balance ($)</label>
            <input type="number" value={initial} onChange={e => setInitial(+e.target.value)} className={inputCls} min={0} step={100} />
          </div>
          <div>
            <label className={labelCls}>Monthly Deposit ($)</label>
            <input type="number" value={monthly} onChange={e => setMonthly(+e.target.value)} className={inputCls} min={0} step={50} />
          </div>
          <div>
            <label className={labelCls}>Annual Interest Rate (APY %)</label>
            <input type="number" value={rate} onChange={e => setRate(+e.target.value)} className={inputCls} min={0} max={20} step={0.1} />
          </div>
          <div>
            <label className={labelCls}>Time Period (years)</label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 5, 10, 15, 20].map(y => (
                <button key={y} onClick={() => setYears(y)} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${years === y ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{y}yr</button>
              ))}
            </div>
            <input type="number" value={years} onChange={e => setYears(Math.min(50, +e.target.value))} className={inputCls + " mt-2"} min={1} max={50} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
            <p className="text-sm text-zinc-400 mb-1">Total Savings</p>
            <p className="text-4xl font-bold text-blue-400">{fmtC(result.balance)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Total Deposited</p>
              <p className="text-lg font-semibold text-green-400">{fmtC(result.totalDeposits)}</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Interest Earned</p>
              <p className="text-lg font-semibold text-yellow-400">{fmtC(result.totalInterest)}</p>
            </div>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">Deposits vs Interest</p>
            <div className="flex rounded-full overflow-hidden h-4">
              <div className="bg-green-500" style={{ width: `${(result.totalDeposits / result.balance) * 100}%` }} />
              <div className="bg-yellow-500" style={{ width: `${(result.totalInterest / result.balance) * 100}%` }} />
            </div>
            <div className="flex gap-4 mt-2 text-xs text-zinc-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />Deposits ({((result.totalDeposits / result.balance) * 100).toFixed(0)}%)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" />Interest ({((result.totalInterest / result.balance) * 100).toFixed(0)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rate comparison */}
      <div className="mt-8 bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Rate Comparison ({years} years)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          {[1, 2, 3, 4, 4.5, 5, 6, 7].map(r => {
            const mr = r / 100 / 12;
            let b = initial;
            for (let m = 0; m < years * 12; m++) b = b * (1 + mr) + monthly;
            const isActive = Math.abs(r - rate) < 0.01;
            return (
              <div key={r} className={`rounded-lg px-3 py-2 text-center ${isActive ? "bg-blue-600/20 border border-blue-500/30" : "bg-zinc-900"}`}>
                <p className="text-zinc-500">{r}% APY</p>
                <p className={`font-medium ${isActive ? "text-blue-400" : "text-zinc-200"}`}>{fmtC(b)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Year-by-year */}
      <details className="mt-6">
        <summary className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">Year-by-Year Breakdown</summary>
        <div className="mt-4 max-h-80 overflow-y-auto border border-zinc-700 rounded-lg">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-zinc-800">
              <tr className="text-zinc-400 text-left">
                <th className="px-3 py-2">Year</th>
                <th className="px-3 py-2">Balance</th>
                <th className="px-3 py-2">Deposits</th>
                <th className="px-3 py-2">Interest</th>
              </tr>
            </thead>
            <tbody>
              {result.breakdown.map(row => (
                <tr key={row.year} className="border-t border-zinc-800 text-zinc-300">
                  <td className="px-3 py-1.5">{row.year}</td>
                  <td className="px-3 py-1.5">{fmtC(row.balance)}</td>
                  <td className="px-3 py-1.5">{fmtC(row.deposits)}</td>
                  <td className="px-3 py-1.5">{fmtC(row.interest)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </ToolLayout>
  );
}
