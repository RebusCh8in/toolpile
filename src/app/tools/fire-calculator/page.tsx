"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }

export default function Page() {
  const [annualExpenses, setAnnualExpenses] = useState(40000);
  const [currentSavings, setCurrentSavings] = useState(100000);
  const [annualSavings, setAnnualSavings] = useState(30000);
  const [returnRate, setReturnRate] = useState(7);
  const [withdrawalRate, setWithdrawalRate] = useState(4);
  const [inflationRate, setInflationRate] = useState(3);

  const result = useMemo(() => {
    const fireNumber = withdrawalRate > 0 ? annualExpenses / (withdrawalRate / 100) : 0;
    const progress = fireNumber > 0 ? (currentSavings / fireNumber) * 100 : 0;
    const remaining = Math.max(0, fireNumber - currentSavings);

    // Calculate years to FIRE
    let balance = currentSavings;
    let yearsToFire = 0;
    const r = returnRate / 100;
    const yearly: { year: number; balance: number; saved: number }[] = [];

    while (balance < fireNumber && yearsToFire < 100) {
      yearsToFire++;
      balance = balance * (1 + r) + annualSavings;
      yearly.push({ year: yearsToFire, balance, saved: annualSavings * yearsToFire + currentSavings });
    }

    // Inflation-adjusted FIRE number
    const realFireNumber = fireNumber * Math.pow(1 + inflationRate / 100, yearsToFire);
    const safeAnnualWithdrawal = fireNumber * (withdrawalRate / 100);
    const monthlyWithdrawal = safeAnnualWithdrawal / 12;

    // Savings rate
    const income = annualExpenses + annualSavings;
    const savingsRate = income > 0 ? (annualSavings / income) * 100 : 0;

    return { fireNumber, progress, remaining, yearsToFire, realFireNumber, safeAnnualWithdrawal, monthlyWithdrawal, savingsRate, yearly };
  }, [annualExpenses, currentSavings, annualSavings, returnRate, withdrawalRate, inflationRate]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="FIRE Calculator"
      description="Calculate your Financial Independence, Retire Early (FIRE) number. See how long until you can retire based on savings rate and investments."
      slug="fire-calculator"
      category="Finance"
      keywords={["fire calculator", "financial independence calculator", "retire early calculator", "fire number calculator", "early retirement calculator"]}
      faqs={[
        { question: "What is FIRE?", answer: "FIRE stands for Financial Independence, Retire Early. The goal is saving enough that investment returns cover your living expenses. Your 'FIRE number' is typically 25× annual expenses (based on the 4% rule)." },
        { question: "What is the 4% rule?", answer: "The 4% rule (Trinity Study) suggests you can safely withdraw 4% of your portfolio annually with low risk of running out over 30 years. A $1M portfolio supports $40K/year in withdrawals." },
        { question: "How does savings rate affect FIRE?", answer: "Savings rate is the most important factor. At 50% savings rate, you can retire in ~17 years. At 70%, ~8.5 years. At 25%, ~32 years. Higher savings both increases investments and proves you need less to live on." },
      ]}
      relatedTools={[
        { name: "Retirement Calculator", href: "/tools/retirement-calculator" },
        { name: "Investment Calculator", href: "/tools/investment-calculator" },
        { name: "401(k) Calculator", href: "/tools/401k-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div><label className={labelCls}>Annual Expenses ($)</label><input type="number" value={annualExpenses} onChange={e => setAnnualExpenses(+e.target.value)} className={inputCls} min={0} step={1000} /></div>
          <div><label className={labelCls}>Current Savings/Investments ($)</label><input type="number" value={currentSavings} onChange={e => setCurrentSavings(+e.target.value)} className={inputCls} min={0} step={5000} /></div>
          <div><label className={labelCls}>Annual Savings ($)</label><input type="number" value={annualSavings} onChange={e => setAnnualSavings(+e.target.value)} className={inputCls} min={0} step={1000} /></div>
          <div><label className={labelCls}>Expected Return (%)</label><input type="number" value={returnRate} onChange={e => setReturnRate(+e.target.value)} className={inputCls} min={0} max={20} step={0.5} /></div>
          <div><label className={labelCls}>Safe Withdrawal Rate (%)</label><input type="number" value={withdrawalRate} onChange={e => setWithdrawalRate(+e.target.value)} className={inputCls} min={1} max={10} step={0.25} /></div>
          <div><label className={labelCls}>Inflation Rate (%)</label><input type="number" value={inflationRate} onChange={e => setInflationRate(+e.target.value)} className={inputCls} min={0} max={10} step={0.5} /></div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">FIRE Number</p>
            <p className="text-4xl font-bold text-blue-400">{fmtC(result.fireNumber)}</p>
            <p className="text-xs text-zinc-500 mt-1">25× annual expenses at {withdrawalRate}% withdrawal rate</p>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-zinc-400">Progress</span>
              <span className="text-zinc-100">{Math.min(100, result.progress).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-3">
              <div className="bg-blue-500 rounded-full h-3 transition-all" style={{ width: `${Math.min(100, result.progress)}%` }} />
            </div>
            <p className="text-xs text-zinc-500 mt-2">{fmtC(currentSavings)} saved of {fmtC(result.fireNumber)}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3"><p className="text-xs text-green-300">Years to FIRE</p><p className="text-2xl font-bold text-green-400">{result.yearsToFire < 100 ? result.yearsToFire : "100+"}</p></div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Savings Rate</p><p className="text-2xl font-bold text-yellow-400">{result.savingsRate.toFixed(0)}%</p></div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Monthly Withdrawal</p><p className="text-lg font-semibold text-zinc-100">{fmtC(result.monthlyWithdrawal)}</p></div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Still Needed</p><p className="text-lg font-semibold text-zinc-100">{fmtC(result.remaining)}</p></div>
          </div>

          {result.yearly.length <= 40 && result.yearly.length > 0 && (
            <details>
              <summary className="cursor-pointer text-sm text-zinc-400 hover:text-zinc-200">Year-by-Year Projection</summary>
              <div className="mt-3 bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-auto max-h-56">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-zinc-800"><tr className="border-b border-zinc-700 text-zinc-500"><th className="text-left p-2">Year</th><th className="text-right p-2">Balance</th><th className="text-right p-2">% of FIRE</th></tr></thead>
                  <tbody>
                    {result.yearly.map(r => (
                      <tr key={r.year} className="border-b border-zinc-800"><td className="p-2 text-zinc-300">{r.year}</td><td className="text-right p-2 text-zinc-100">{fmtC(r.balance)}</td><td className="text-right p-2 text-blue-400">{((r.balance / result.fireNumber) * 100).toFixed(0)}%</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
