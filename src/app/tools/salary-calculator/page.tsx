"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function Page() {
  const [mode, setMode] = useState<"annual" | "hourly">("annual");
  const [amount, setAmount] = useState(65000);
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [weeksPerYear, setWeeksPerYear] = useState(52);
  const [daysPerWeek, setDaysPerWeek] = useState(5);

  const result = useMemo(() => {
    const totalHours = hoursPerWeek * weeksPerYear;
    let annual: number, hourly: number;
    if (mode === "annual") {
      annual = amount;
      hourly = totalHours > 0 ? amount / totalHours : 0;
    } else {
      hourly = amount;
      annual = amount * totalHours;
    }
    const monthly = annual / 12;
    const biweekly = annual / 26;
    const weekly = annual / 52;
    const daily = daysPerWeek > 0 ? weekly / daysPerWeek : 0;

    // Rough tax estimates (US 2026 single filer, very simplified)
    const standardDeduction = 15700;
    const taxable = Math.max(0, annual - standardDeduction);
    let fedTax = 0;
    const brackets = [
      { limit: 11925, rate: 0.10 },
      { limit: 48475, rate: 0.12 },
      { limit: 103350, rate: 0.22 },
      { limit: 197300, rate: 0.24 },
      { limit: 250525, rate: 0.32 },
      { limit: 626350, rate: 0.35 },
      { limit: Infinity, rate: 0.37 },
    ];
    let remaining = taxable;
    let prev = 0;
    for (const b of brackets) {
      const chunk = Math.min(remaining, b.limit - prev);
      if (chunk <= 0) break;
      fedTax += chunk * b.rate;
      remaining -= chunk;
      prev = b.limit;
    }
    const fica = annual * 0.0765;
    const totalTax = fedTax + fica;
    const afterTax = annual - totalTax;
    const effectiveRate = annual > 0 ? (totalTax / annual) * 100 : 0;

    return { annual, hourly, monthly, biweekly, weekly, daily, fedTax, fica, totalTax, afterTax, effectiveRate };
  }, [mode, amount, hoursPerWeek, weeksPerYear, daysPerWeek]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Salary Calculator"
      description="Convert between annual salary and hourly wage. See monthly, biweekly, weekly, and daily breakdown with estimated federal tax."
      slug="salary-calculator"
      category="Finance"
      keywords={["salary calculator", "hourly to salary calculator", "salary to hourly calculator", "pay calculator", "wage calculator", "annual salary calculator"]}
      faqs={[
        { question: "How do I convert salary to hourly rate?", answer: "Divide your annual salary by the number of hours you work per year. For a standard 40-hour week with 52 weeks: $65,000 ÷ 2,080 hours = $31.25/hour." },
        { question: "How do I convert hourly wage to annual salary?", answer: "Multiply your hourly rate by hours per week, then by weeks per year. $20/hour × 40 hours × 52 weeks = $41,600/year." },
        { question: "Are the tax estimates accurate?", answer: "The tax estimates use simplified 2026 US federal brackets for a single filer with standard deduction, plus FICA (7.65%). Actual taxes vary based on filing status, state taxes, deductions, and credits. Use this as a rough guide only." },
        { question: "What if I get paid time off?", answer: "If your employer provides paid vacation, keep weeks per year at 52 — you're still paid for those weeks. Only reduce the number if you have unpaid time off." },
      ]}
      relatedTools={[
        { name: "Percentage Calculator", href: "/tools/percentage-calculator" },
        { name: "Tip Calculator", href: "/tools/tip-calculator" },
        { name: "Compound Interest Calculator", href: "/tools/compound-interest-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex gap-2 mb-2">
            <button onClick={() => { setMode("annual"); setAmount(65000); }} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "annual" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>Annual Salary</button>
            <button onClick={() => { setMode("hourly"); setAmount(30); }} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "hourly" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>Hourly Wage</button>
          </div>
          <div>
            <label className={labelCls}>{mode === "annual" ? "Annual Salary ($)" : "Hourly Rate ($)"}</label>
            <input type="number" value={amount} onChange={e => setAmount(+e.target.value)} className={inputCls} min={0} step={mode === "annual" ? 1000 : 0.5} />
          </div>
          <div>
            <label className={labelCls}>Hours Per Week</label>
            <input type="number" value={hoursPerWeek} onChange={e => setHoursPerWeek(+e.target.value)} className={inputCls} min={1} max={168} />
          </div>
          <div>
            <label className={labelCls}>Weeks Per Year</label>
            <input type="number" value={weeksPerYear} onChange={e => setWeeksPerYear(+e.target.value)} className={inputCls} min={1} max={52} />
          </div>
          <div>
            <label className={labelCls}>Days Per Week</label>
            <input type="number" value={daysPerWeek} onChange={e => setDaysPerWeek(+e.target.value)} className={inputCls} min={1} max={7} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
            <p className="text-sm text-zinc-400 mb-1">{mode === "annual" ? "Hourly Rate" : "Annual Salary"}</p>
            <p className="text-4xl font-bold text-blue-400">{mode === "annual" ? fmtC(result.hourly) + "/hr" : fmtC(result.annual) + "/yr"}</p>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Hourly", fmtC(result.hourly)],
                  ["Daily", fmtC(result.daily)],
                  ["Weekly", fmtC(result.weekly)],
                  ["Bi-Weekly", fmtC(result.biweekly)],
                  ["Monthly", fmtC(result.monthly)],
                  ["Annual", fmtC(result.annual)],
                ].map(([label, val]) => (
                  <tr key={label} className="border-t border-zinc-800">
                    <td className="px-4 py-2 text-zinc-400">{label}</td>
                    <td className="px-4 py-2 text-zinc-100 font-medium text-right">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <p className="text-sm font-semibold text-zinc-200 mb-2">Estimated Federal Tax (US, Single)</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-zinc-400">Federal Income Tax</span><span className="text-red-400">−{fmtC(result.fedTax)}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">FICA (SS + Medicare)</span><span className="text-red-400">−{fmtC(result.fica)}</span></div>
              <div className="flex justify-between border-t border-zinc-700 pt-1 mt-1"><span className="text-zinc-300 font-medium">After-Tax Income</span><span className="text-green-400 font-medium">{fmtC(result.afterTax)}</span></div>
              <p className="text-xs text-zinc-600 mt-1">Effective rate: {result.effectiveRate.toFixed(1)}% · Does not include state tax</p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
