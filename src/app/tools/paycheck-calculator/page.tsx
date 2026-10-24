"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

const brackets2026 = [
  { min: 0, max: 11925, rate: 0.10 },
  { min: 11925, max: 48475, rate: 0.12 },
  { min: 48475, max: 103350, rate: 0.22 },
  { min: 103350, max: 197300, rate: 0.24 },
  { min: 197300, max: 250525, rate: 0.32 },
  { min: 250525, max: 626350, rate: 0.35 },
  { min: 626350, max: Infinity, rate: 0.37 },
];

function calcFederalTax(taxable: number) {
  let tax = 0;
  for (const b of brackets2026) {
    if (taxable <= b.min) break;
    const amt = Math.min(taxable, b.max) - b.min;
    tax += amt * b.rate;
  }
  return tax;
}

export default function Page() {
  const [salary, setSalary] = useState(75000);
  const [payFreq, setPayFreq] = useState<"weekly" | "biweekly" | "semimonthly" | "monthly">("biweekly");
  const [filing, setFiling] = useState<"single" | "married">("single");
  const [stateRate, setStateRate] = useState(5);
  const [deductions, setDeductions] = useState(0);
  const [retirement401k, setRetirement401k] = useState(0);

  const result = useMemo(() => {
    const periods = payFreq === "weekly" ? 52 : payFreq === "biweekly" ? 26 : payFreq === "semimonthly" ? 24 : 12;
    const standardDeduction = filing === "single" ? 15700 : 31400;
    const gross = salary;
    const preTax401k = gross * (retirement401k / 100);
    const taxableIncome = Math.max(0, gross - standardDeduction - deductions - preTax401k);

    const federalTax = calcFederalTax(taxableIncome);
    const ss = Math.min(gross, 168600) * 0.062;
    const medicare = gross * 0.0145 + (gross > 200000 ? (gross - 200000) * 0.009 : 0);
    const fica = ss + medicare;
    const stateTax = taxableIncome * (stateRate / 100);
    const totalTax = federalTax + fica + stateTax;
    const netAnnual = gross - totalTax - preTax401k;
    const perPeriod = netAnnual / periods;

    return {
      gross, taxableIncome, federalTax, ss, medicare, fica, stateTax, totalTax,
      preTax401k, netAnnual, perPeriod, periods,
      effectiveRate: gross > 0 ? (totalTax / gross) * 100 : 0,
    };
  }, [salary, payFreq, filing, stateRate, deductions, retirement401k]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Paycheck Calculator"
      description="Estimate your take-home pay per paycheck. Includes federal tax, FICA, state tax, and 401k contributions."
      slug="paycheck-calculator"
      category="Finance"
      keywords={["paycheck calculator", "take home pay calculator", "net pay calculator", "salary after tax calculator", "paycheck estimator"]}
      faqs={[
        { question: "How accurate is this paycheck calculator?", answer: "This provides a reasonable estimate using 2026 federal brackets, standard deduction, and FICA rates. Actual paychecks may vary due to local taxes, pre-tax benefits (health insurance), W-4 withholding choices, and employer-specific deductions." },
        { question: "What is FICA?", answer: "FICA stands for Federal Insurance Contributions Act. It includes Social Security tax (6.2% up to $168,600) and Medicare tax (1.45%, plus 0.9% additional on income over $200K). Your employer matches these amounts." },
        { question: "Does this include state taxes?", answer: "Yes, you can set your state income tax rate. Note that 9 states (AK, FL, NV, NH, SD, TN, TX, WA, WY) have no state income tax — set the rate to 0% for those." },
      ]}
      relatedTools={[
        { name: "Salary Calculator", href: "/tools/salary-calculator" },
        { name: "Tax Calculator", href: "/tools/tax-calculator" },
        { name: "Retirement Calculator", href: "/tools/retirement-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Annual Gross Salary ($)</label>
            <input type="number" value={salary} onChange={e => setSalary(+e.target.value)} className={inputCls} min={0} step={1000} />
          </div>
          <div>
            <label className={labelCls}>Pay Frequency</label>
            <select value={payFreq} onChange={e => setPayFreq(e.target.value as typeof payFreq)} className={inputCls}>
              <option value="weekly">Weekly (52 checks)</option>
              <option value="biweekly">Bi-Weekly (26 checks)</option>
              <option value="semimonthly">Semi-Monthly (24 checks)</option>
              <option value="monthly">Monthly (12 checks)</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Filing Status</label>
            <div className="flex gap-2">
              {(["single", "married"] as const).map(f => (
                <button key={f} onClick={() => setFiling(f)} className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filing === f ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{f}</button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>State Income Tax Rate (%)</label>
            <input type="number" value={stateRate} onChange={e => setStateRate(+e.target.value)} className={inputCls} min={0} max={15} step={0.1} />
          </div>
          <div>
            <label className={labelCls}>Additional Pre-Tax Deductions ($)</label>
            <input type="number" value={deductions} onChange={e => setDeductions(+e.target.value)} className={inputCls} min={0} step={100} />
          </div>
          <div>
            <label className={labelCls}>401(k) Contribution (%)</label>
            <input type="number" value={retirement401k} onChange={e => setRetirement401k(+e.target.value)} className={inputCls} min={0} max={100} step={1} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">Take-Home Per Paycheck</p>
            <p className="text-5xl font-bold text-blue-400">{fmtC(result.perPeriod)}</p>
            <p className="text-xs text-zinc-500 mt-2">{result.periods} paychecks/year · Effective tax rate: {result.effectiveRate.toFixed(1)}%</p>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-sm space-y-1.5">
            <div className="flex justify-between"><span className="text-zinc-400">Gross Salary</span><span className="text-zinc-100">{fmtC(result.gross)}</span></div>
            {result.preTax401k > 0 && <div className="flex justify-between text-yellow-400"><span>401(k) ({retirement401k}%)</span><span>−{fmtC(result.preTax401k)}</span></div>}
            <div className="flex justify-between text-red-400"><span>Federal Tax</span><span>−{fmtC(result.federalTax)}</span></div>
            <div className="flex justify-between text-red-400"><span>Social Security</span><span>−{fmtC(result.ss)}</span></div>
            <div className="flex justify-between text-red-400"><span>Medicare</span><span>−{fmtC(result.medicare)}</span></div>
            {stateRate > 0 && <div className="flex justify-between text-red-400"><span>State Tax ({stateRate}%)</span><span>−{fmtC(result.stateTax)}</span></div>}
            <div className="flex justify-between border-t border-zinc-700 pt-1 font-semibold"><span className="text-zinc-200">Annual Net Pay</span><span className="text-green-400">{fmtC(result.netAnnual)}</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Monthly Net</p>
              <p className="text-lg font-semibold text-zinc-100">{fmtC(result.netAnnual / 12)}</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Total Tax</p>
              <p className="text-lg font-semibold text-red-400">{fmtC(result.totalTax)}</p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
