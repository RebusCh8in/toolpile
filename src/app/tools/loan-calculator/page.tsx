"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function Page() {
  const [amount, setAmount] = useState(25000);
  const [rate, setRate] = useState(5.5);
  const [termYears, setTermYears] = useState(5);
  const [termMonths, setTermMonths] = useState(0);

  const result = useMemo(() => {
    const totalMonths = termYears * 12 + termMonths;
    const monthlyRate = rate / 100 / 12;
    if (amount <= 0 || totalMonths <= 0) return null;
    if (rate <= 0) {
      const monthly = amount / totalMonths;
      return { monthly, totalPaid: amount, totalInterest: 0, totalMonths, schedule: [] as { month: number; payment: number; principal: number; interest: number; balance: number }[] };
    }

    const monthly = (amount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    const totalPaid = monthly * totalMonths;
    const totalInterest = totalPaid - amount;

    const schedule: { month: number; payment: number; principal: number; interest: number; balance: number }[] = [];
    let balance = amount;
    for (let i = 1; i <= totalMonths; i++) {
      const interest = balance * monthlyRate;
      const principal = monthly - interest;
      balance = Math.max(0, balance - principal);
      schedule.push({ month: i, payment: monthly, principal, interest, balance });
    }

    return { monthly, totalPaid, totalInterest, totalMonths, schedule };
  }, [amount, rate, termYears, termMonths]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Loan Calculator"
      description="Calculate monthly loan payments, total interest, and see a full payment schedule for any loan amount, rate, and term."
      slug="loan-calculator"
      category="Finance"
      keywords={["loan calculator", "loan payment calculator", "personal loan calculator", "loan amortization calculator", "monthly payment calculator"]}
      faqs={[
        { question: "How is the monthly payment calculated?", answer: "The calculator uses the standard amortization formula: M = P[r(1+r)^n]/[(1+r)^n–1], where P is the loan amount, r is the monthly interest rate, and n is the total number of payments." },
        { question: "What types of loans does this work for?", answer: "This calculator works for any fixed-rate loan with equal monthly payments — personal loans, auto loans, student loans, home equity loans, and more. It does not apply to variable-rate or interest-only loans." },
        { question: "How does loan term affect total cost?", answer: "A longer term means lower monthly payments but significantly more total interest paid. A shorter term has higher monthly payments but saves you money overall. Always compare the total cost, not just the monthly payment." },
      ]}
      relatedTools={[
        { name: "Mortgage Calculator", href: "/tools/mortgage-calculator" },
        { name: "Auto Loan Calculator", href: "/tools/auto-loan-calculator" },
        { name: "Compound Interest Calculator", href: "/tools/compound-interest-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Loan Amount ($)</label>
            <input type="number" value={amount} onChange={e => setAmount(+e.target.value)} className={inputCls} min={0} step={500} />
          </div>
          <div>
            <label className={labelCls}>Annual Interest Rate (%)</label>
            <input type="number" value={rate} onChange={e => setRate(+e.target.value)} className={inputCls} min={0} max={50} step={0.1} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Years</label>
              <input type="number" value={termYears} onChange={e => setTermYears(+e.target.value)} className={inputCls} min={0} max={50} />
            </div>
            <div>
              <label className={labelCls}>Months</label>
              <input type="number" value={termMonths} onChange={e => setTermMonths(+e.target.value)} className={inputCls} min={0} max={11} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 5, 7, 10].map(y => (
              <button key={y} onClick={() => { setTermYears(y); setTermMonths(0); }} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${termYears === y && termMonths === 0 ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{y}yr</button>
            ))}
          </div>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
              <p className="text-sm text-zinc-400 mb-1">Monthly Payment</p>
              <p className="text-4xl font-bold text-blue-400">{fmtC(result.monthly)}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Loan Amount</p>
                <p className="text-sm font-semibold text-zinc-100">{fmtC(amount)}</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Total Interest</p>
                <p className="text-sm font-semibold text-yellow-400">{fmtC(result.totalInterest)}</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Total Paid</p>
                <p className="text-sm font-semibold text-zinc-100">{fmtC(result.totalPaid)}</p>
              </div>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500 mb-2">Principal vs Interest</p>
              <div className="flex rounded-full overflow-hidden h-4">
                <div className="bg-blue-500" style={{ width: `${(amount / result.totalPaid) * 100}%` }} />
                <div className="bg-yellow-500" style={{ width: `${(result.totalInterest / result.totalPaid) * 100}%` }} />
              </div>
              <div className="flex gap-4 mt-2 text-xs text-zinc-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Principal</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" />Interest</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {result && result.schedule.length > 0 && (
        <details className="mt-8">
          <summary className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">Payment Schedule ({result.totalMonths} payments)</summary>
          <div className="mt-4 max-h-96 overflow-y-auto border border-zinc-700 rounded-lg">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-zinc-800">
                <tr className="text-zinc-400 text-left">
                  <th className="px-3 py-2">Month</th>
                  <th className="px-3 py-2">Payment</th>
                  <th className="px-3 py-2">Principal</th>
                  <th className="px-3 py-2">Interest</th>
                  <th className="px-3 py-2">Balance</th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.map(row => (
                  <tr key={row.month} className="border-t border-zinc-800 text-zinc-300">
                    <td className="px-3 py-1.5">{row.month}</td>
                    <td className="px-3 py-1.5">{fmtC(row.payment)}</td>
                    <td className="px-3 py-1.5">{fmtC(row.principal)}</td>
                    <td className="px-3 py-1.5">{fmtC(row.interest)}</td>
                    <td className="px-3 py-1.5">{fmtC(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </ToolLayout>
  );
}
