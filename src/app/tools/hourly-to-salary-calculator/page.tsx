"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function Page() {
  const [mode, setMode] = useState<"hourly" | "salary">("hourly");
  const [hourlyRate, setHourlyRate] = useState(25);
  const [annualSalary, setAnnualSalary] = useState(52000);
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [weeksPerYear, setWeeksPerYear] = useState(52);
  const [vacationWeeks, setVacationWeeks] = useState(2);

  const result = useMemo(() => {
    const workWeeks = weeksPerYear - vacationWeeks;
    if (mode === "hourly") {
      const annual = hourlyRate * hoursPerWeek * workWeeks;
      const monthly = annual / 12;
      const biweekly = hourlyRate * hoursPerWeek * 2;
      const weekly = hourlyRate * hoursPerWeek;
      const daily = hourlyRate * (hoursPerWeek / 5);
      return { hourly: hourlyRate, daily, weekly, biweekly, monthly, annual };
    } else {
      const hourly = workWeeks > 0 && hoursPerWeek > 0 ? annualSalary / (workWeeks * hoursPerWeek) : 0;
      const monthly = annualSalary / 12;
      const biweekly = annualSalary / 26;
      const weekly = annualSalary / 52;
      const daily = annualSalary / 260;
      return { hourly, daily, weekly, biweekly, monthly, annual: annualSalary };
    }
  }, [mode, hourlyRate, annualSalary, hoursPerWeek, weeksPerYear, vacationWeeks]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Hourly to Salary Calculator"
      description="Convert hourly wage to annual salary and vice versa. Accounts for hours worked and vacation time."
      slug="hourly-to-salary-calculator"
      category="Finance"
      keywords={["hourly to salary calculator", "salary to hourly calculator", "hourly rate calculator", "annual salary calculator", "wage calculator"]}
      faqs={[
        { question: "How do I convert hourly to annual salary?", answer: "Annual Salary = Hourly Rate × Hours Per Week × Weeks Worked Per Year. At $25/hour, 40 hours/week, 50 weeks (2 weeks vacation): $25 × 40 × 50 = $50,000/year." },
        { question: "How do I convert salary to hourly?", answer: "Hourly Rate = Annual Salary ÷ (Hours Per Week × Weeks Per Year). A $52,000 salary at 40 hrs/week, 52 weeks: $52,000 ÷ 2,080 = $25.00/hour." },
        { question: "Does vacation affect the calculation?", answer: "Yes. If you get paid vacation, your effective hourly rate stays the same. But for contractors or unpaid vacation, fewer working weeks means higher effective hourly rate or lower annual total." },
      ]}
      relatedTools={[
        { name: "Salary Calculator", href: "/tools/salary-calculator" },
        { name: "Paycheck Calculator", href: "/tools/paycheck-calculator" },
        { name: "Overtime Calculator", href: "/tools/overtime-calculator" },
      ]}
    >
      <div className="flex gap-2 mb-6">
        <button onClick={() => setMode("hourly")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "hourly" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>Hourly → Salary</button>
        <button onClick={() => setMode("salary")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "salary" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>Salary → Hourly</button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {mode === "hourly" ? (
            <div><label className={labelCls}>Hourly Rate ($)</label><input type="number" value={hourlyRate} onChange={e => setHourlyRate(+e.target.value)} className={inputCls} min={0} step={0.5} /></div>
          ) : (
            <div><label className={labelCls}>Annual Salary ($)</label><input type="number" value={annualSalary} onChange={e => setAnnualSalary(+e.target.value)} className={inputCls} min={0} step={1000} /></div>
          )}
          <div><label className={labelCls}>Hours Per Week</label><input type="number" value={hoursPerWeek} onChange={e => setHoursPerWeek(+e.target.value)} className={inputCls} min={1} max={168} step={1} /></div>
          <div><label className={labelCls}>Weeks Per Year</label><input type="number" value={weeksPerYear} onChange={e => setWeeksPerYear(+e.target.value)} className={inputCls} min={1} max={52} step={1} /></div>
          <div><label className={labelCls}>Vacation Weeks (unpaid)</label><input type="number" value={vacationWeeks} onChange={e => setVacationWeeks(+e.target.value)} className={inputCls} min={0} max={weeksPerYear - 1} step={1} /></div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">{mode === "hourly" ? "Annual Salary" : "Hourly Rate"}</p>
            <p className="text-5xl font-bold text-blue-400">{mode === "hourly" ? fmtC(result.annual) : fmtC(result.hourly)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Hourly", result.hourly],
              ["Daily", result.daily],
              ["Weekly", result.weekly],
              ["Bi-Weekly", result.biweekly],
              ["Monthly", result.monthly],
              ["Annual", result.annual],
            ].map(([label, val]) => (
              <div key={label as string} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">{label as string}</p>
                <p className="text-lg font-semibold text-zinc-100">{fmtC(val as number)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="mt-6 bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Hourly ↔ Salary Quick Reference (40hr/wk, 52wk/yr)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm text-center">
          {[15, 20, 25, 30, 35, 40, 50, 60, 75, 100].map(hr => (
            <div key={hr} className="bg-zinc-900 rounded-lg px-2 py-2">
              <p className="text-zinc-500">${hr}/hr</p>
              <p className="text-zinc-200">{fmtC(hr * 40 * 52)}/yr</p>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
