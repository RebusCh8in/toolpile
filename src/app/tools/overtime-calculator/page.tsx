"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

type PayPeriod = "weekly" | "biweekly" | "semimonthly" | "monthly";

const PAY_PERIOD_LABELS: Record<PayPeriod, string> = {
  weekly: "Weekly",
  biweekly: "Bi-Weekly",
  semimonthly: "Semi-Monthly",
  monthly: "Monthly",
};

const PAY_PERIOD_MULTIPLIERS: Record<PayPeriod, number> = {
  weekly: 1,
  biweekly: 2,
  semimonthly: 2.1667,
  monthly: 4.3333,
};

export default function Page() {
  const [hourlyRate, setHourlyRate] = useState(25);
  const [regularHours, setRegularHours] = useState(40);
  const [overtimeHours, setOvertimeHours] = useState(10);
  const [otMultiplier, setOtMultiplier] = useState(1.5);
  const [payPeriod, setPayPeriod] = useState<PayPeriod>("weekly");
  const [dailyHours, setDailyHours] = useState<number[]>([8, 8, 8, 8, 8, 5, 5]);

  const updateDay = (i: number, val: number) => {
    setDailyHours((prev) => {
      const next = [...prev];
      next[i] = Math.max(0, Math.min(24, val));
      return next;
    });
  };

  const calc = useMemo(() => {
    const otRate = hourlyRate * otMultiplier;
    const regularPay = hourlyRate * regularHours;
    const overtimePay = otRate * overtimeHours;
    const totalWeekly = regularPay + overtimePay;
    const totalHours = regularHours + overtimeHours;
    const effectiveHourly = totalHours > 0 ? totalWeekly / totalHours : 0;

    const periodMultiplier = PAY_PERIOD_MULTIPLIERS[payPeriod];
    const periodPay = totalWeekly * periodMultiplier;

    const annualWeeks = 52;
    const annualEarnings = totalWeekly * annualWeeks;
    const annualRegularOnly = regularPay * annualWeeks;
    const annualOvertimeOnly = overtimePay * annualWeeks;

    return {
      otRate,
      regularPay,
      overtimePay,
      totalWeekly,
      totalHours,
      effectiveHourly,
      periodPay,
      annualEarnings,
      annualRegularOnly,
      annualOvertimeOnly,
    };
  }, [hourlyRate, regularHours, overtimeHours, otMultiplier, payPeriod]);

  const dailyBreakdown = useMemo(() => {
    const totalDaily = dailyHours.reduce((s, h) => s + h, 0);
    let remainingRegular = regularHours;
    return dailyHours.map((h) => {
      const reg = Math.min(h, remainingRegular);
      remainingRegular = Math.max(0, remainingRegular - reg);
      const ot = h - reg;
      return { total: h, regular: reg, overtime: ot };
    });
  }, [dailyHours, regularHours]);

  const dailyTotalHours = dailyHours.reduce((s, h) => s + h, 0);
  const dailyTotalReg = dailyBreakdown.reduce((s, d) => s + d.regular, 0);
  const dailyTotalOt = dailyBreakdown.reduce((s, d) => s + d.overtime, 0);

  const comparisonOtHours = [5, 10, 15, 20, 25, 30];

  const inputCls =
    "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Overtime Calculator"
      description="Calculate overtime pay, total weekly earnings, and annual projections. Includes daily hour breakdown, pay period options, and a comparison table for different overtime levels."
      slug="overtime-calculator"
      category="Finance"
      keywords={[
        "overtime calculator",
        "overtime pay calculator",
        "time and a half calculator",
        "double time calculator",
        "weekly overtime calculator",
        "OT pay calculator",
        "overtime wage calculator",
      ]}
      faqs={[
        {
          question: "How is overtime pay calculated?",
          answer:
            "Overtime pay is calculated by multiplying your regular hourly rate by the overtime multiplier (typically 1.5x for time-and-a-half) and then by the number of overtime hours. For example, at $25/hour with 10 OT hours at 1.5x: $25 x 1.5 x 10 = $375 in overtime pay.",
        },
        {
          question: "What is the difference between time-and-a-half and double time?",
          answer:
            "Time-and-a-half (1.5x) pays 150% of your regular rate for overtime hours, which is the standard federal overtime rate under the FLSA. Double time (2.0x) pays 200% of your regular rate and is typically offered for holidays, seventh consecutive workday, or hours beyond 12 in a single day in some states like California.",
        },
        {
          question: "When does overtime start?",
          answer:
            "Under the federal Fair Labor Standards Act (FLSA), overtime begins after 40 hours worked in a single workweek for non-exempt employees. Some states have daily overtime rules too -- for example, California requires overtime after 8 hours in a single day and double time after 12 hours.",
        },
        {
          question: "How do I calculate my effective hourly rate with overtime?",
          answer:
            "Your effective hourly rate is your total weekly pay divided by your total hours worked. For example, if you earn $1,000 regular pay + $375 overtime pay = $1,375 total, and you worked 50 total hours, your effective rate is $1,375 / 50 = $27.50/hour.",
        },
        {
          question: "How much more do I earn annually by working overtime?",
          answer:
            "Annual overtime earnings depend on your rate and how consistently you work overtime. At $25/hour with 10 hours of weekly OT at 1.5x for 52 weeks, you'd earn $19,500 more per year on top of your base $52,000 -- a 37.5% increase in total compensation.",
        },
        {
          question: "Are salaried employees eligible for overtime?",
          answer:
            "It depends on whether the employee is classified as exempt or non-exempt. Non-exempt salaried employees are entitled to overtime. As of 2024, employees earning below $43,888 annually are generally non-exempt. Exempt employees (usually managerial or professional roles above the threshold) are not entitled to overtime under the FLSA.",
        },
      ]}
      relatedTools={[
        { name: "Hourly to Salary Calculator", href: "/tools/hourly-to-salary-calculator" },
        { name: "Salary Calculator", href: "/tools/salary-calculator" },
        { name: "Paycheck Calculator", href: "/tools/paycheck-calculator" },
      ]}
      guide={
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-3">How to Use This Overtime Calculator</h2>
            <p className="text-zinc-400 leading-relaxed">
              Enter your regular hourly rate, the number of standard hours per week (typically 40), how many overtime hours you work, and select your overtime multiplier. The calculator instantly shows your regular pay, overtime pay, total weekly earnings, and effective hourly rate. Use the weekly breakdown to input hours for each day and see exactly which hours fall under regular versus overtime. Choose your pay period to see per-paycheck amounts, and review the annual projection and comparison table to understand the long-term impact of overtime work.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-3">Understanding Overtime Laws</h2>
            <p className="text-zinc-400 leading-relaxed">
              The Fair Labor Standards Act (FLSA) requires employers to pay non-exempt employees at least 1.5 times their regular rate for hours worked beyond 40 in a workweek. Some states have additional rules: California mandates daily overtime after 8 hours and double time after 12 hours. Always check your state&apos;s labor laws to understand your specific overtime rights and thresholds.
            </p>
          </section>
        </div>
      }
    >
      {/* Main inputs */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Regular Hourly Rate ($)</label>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Math.max(0, +e.target.value))}
              className={inputCls}
              min={0}
              step={0.5}
            />
          </div>
          <div>
            <label className={labelCls}>Regular Hours Per Week</label>
            <input
              type="number"
              value={regularHours}
              onChange={(e) => setRegularHours(Math.max(0, Math.min(168, +e.target.value)))}
              className={inputCls}
              min={0}
              max={168}
              step={1}
            />
          </div>
          <div>
            <label className={labelCls}>Overtime Hours Per Week</label>
            <input
              type="number"
              value={overtimeHours}
              onChange={(e) => setOvertimeHours(Math.max(0, Math.min(128, +e.target.value)))}
              className={inputCls}
              min={0}
              max={128}
              step={1}
            />
          </div>
          <div>
            <label className={labelCls}>Overtime Multiplier</label>
            <div className="flex gap-2">
              <button
                onClick={() => setOtMultiplier(1.5)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  otMultiplier === 1.5
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                1.5x (Time &amp; Half)
              </button>
              <button
                onClick={() => setOtMultiplier(2)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  otMultiplier === 2
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                2.0x (Double Time)
              </button>
            </div>
          </div>
          <div>
            <label className={labelCls}>Pay Period</label>
            <select
              value={payPeriod}
              onChange={(e) => setPayPeriod(e.target.value as PayPeriod)}
              className={inputCls}
            >
              {(Object.keys(PAY_PERIOD_LABELS) as PayPeriod[]).map((pp) => (
                <option key={pp} value={pp}>
                  {PAY_PERIOD_LABELS[pp]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results summary */}
        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">Total Weekly Pay</p>
            <p className="text-5xl font-bold text-blue-400">{fmtC(calc.totalWeekly)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Regular Pay</p>
              <p className="text-lg font-semibold text-zinc-100">{fmtC(calc.regularPay)}</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Overtime Pay</p>
              <p className="text-lg font-semibold text-green-400">{fmtC(calc.overtimePay)}</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500">OT Hourly Rate</p>
              <p className="text-lg font-semibold text-zinc-100">{fmtC(calc.otRate)}</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Effective Hourly Rate</p>
              <p className="text-lg font-semibold text-zinc-100">{fmtC(calc.effectiveHourly)}</p>
            </div>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-center">
            <p className="text-xs text-zinc-500">{PAY_PERIOD_LABELS[payPeriod]} Pay</p>
            <p className="text-2xl font-semibold text-zinc-100">{fmtC(calc.periodPay)}</p>
          </div>
        </div>
      </div>

      {/* Weekly day-by-day breakdown */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Weekly Breakdown (Hours Per Day)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 text-xs">
                <th className="text-left pb-2 pr-2">Day</th>
                <th className="pb-2 px-2 text-center">Hours</th>
                <th className="pb-2 px-2 text-center">Regular</th>
                <th className="pb-2 px-2 text-center">Overtime</th>
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day, i) => (
                <tr key={day} className="border-t border-zinc-700/50">
                  <td className="py-2 pr-2 text-zinc-300 font-medium">{day}</td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      value={dailyHours[i]}
                      onChange={(e) => updateDay(i, +e.target.value)}
                      className="w-20 mx-auto block bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-center text-zinc-100 focus:outline-none focus:border-blue-500"
                      min={0}
                      max={24}
                      step={0.5}
                    />
                  </td>
                  <td className="py-2 px-2 text-center text-zinc-300">
                    {dailyBreakdown[i].regular.toFixed(1)}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span className={dailyBreakdown[i].overtime > 0 ? "text-green-400 font-medium" : "text-zinc-500"}>
                      {dailyBreakdown[i].overtime.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="border-t border-zinc-600 font-semibold">
                <td className="py-2 pr-2 text-zinc-200">Total</td>
                <td className="py-2 px-2 text-center text-zinc-200">{dailyTotalHours.toFixed(1)}</td>
                <td className="py-2 px-2 text-center text-zinc-200">{dailyTotalReg.toFixed(1)}</td>
                <td className="py-2 px-2 text-center text-green-400">{dailyTotalOt.toFixed(1)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-zinc-500 mt-3">
          Hours are allocated as regular first (up to {regularHours} hrs/week), then overtime. Total from breakdown: {dailyTotalHours.toFixed(1)} hours.
        </p>
      </div>

      {/* Annual projection */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Annual Projection (52 weeks)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-zinc-900 rounded-lg p-4 text-center">
            <p className="text-xs text-zinc-500 mb-1">Base Annual Pay</p>
            <p className="text-xl font-bold text-zinc-100">{fmtC(calc.annualRegularOnly)}</p>
          </div>
          <div className="bg-zinc-900 rounded-lg p-4 text-center">
            <p className="text-xs text-zinc-500 mb-1">Annual OT Earnings</p>
            <p className="text-xl font-bold text-green-400">{fmtC(calc.annualOvertimeOnly)}</p>
          </div>
          <div className="bg-zinc-900 rounded-lg p-4 text-center">
            <p className="text-xs text-zinc-500 mb-1">Total Annual Earnings</p>
            <p className="text-xl font-bold text-blue-400">{fmtC(calc.annualEarnings)}</p>
          </div>
        </div>
        {calc.annualOvertimeOnly > 0 && (
          <p className="text-xs text-zinc-500 mt-3 text-center">
            Overtime adds {((calc.annualOvertimeOnly / calc.annualRegularOnly) * 100).toFixed(1)}% to your base annual pay.
          </p>
        )}
      </div>

      {/* Comparison table */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">
          Overtime Comparison at {fmtC(hourlyRate)}/hr ({otMultiplier}x multiplier)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 text-xs">
                <th className="text-left pb-2">OT Hours/Week</th>
                <th className="text-right pb-2">Weekly OT Pay</th>
                <th className="text-right pb-2">Total Weekly</th>
                <th className="text-right pb-2">Effective Rate</th>
                <th className="text-right pb-2">Annual Total</th>
              </tr>
            </thead>
            <tbody>
              {comparisonOtHours.map((ot) => {
                const otPay = hourlyRate * otMultiplier * ot;
                const regPay = hourlyRate * regularHours;
                const total = regPay + otPay;
                const totalHrs = regularHours + ot;
                const effective = totalHrs > 0 ? total / totalHrs : 0;
                const annual = total * 52;
                const isCurrentRow = ot === overtimeHours;
                return (
                  <tr
                    key={ot}
                    className={`border-t border-zinc-700/50 ${isCurrentRow ? "bg-blue-500/10" : ""}`}
                  >
                    <td className="py-2 text-zinc-300">
                      {ot} hrs
                      {isCurrentRow && <span className="ml-2 text-xs text-blue-400">(current)</span>}
                    </td>
                    <td className="py-2 text-right text-green-400">{fmtC(otPay)}</td>
                    <td className="py-2 text-right text-zinc-200">{fmtC(total)}</td>
                    <td className="py-2 text-right text-zinc-300">{fmtC(effective)}</td>
                    <td className="py-2 text-right text-zinc-200">{fmtC(annual)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </ToolLayout>
  );
}
