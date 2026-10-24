"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function Page() {
  const [principal, setPrincipal] = useState(25000);
  const [rate, setRate] = useState(6.5);
  const [termYears, setTermYears] = useState(5);
  const [termMonths, setTermMonths] = useState(0);

  const result = useMemo(() => {
    const totalMonths = termYears * 12 + termMonths;
    if (principal <= 0 || totalMonths <= 0) return null;
    if (rate === 0) {
      const payment = principal / totalMonths;
      return { payment, totalPaid: principal, totalInterest: 0, totalMonths };
    }
    const r = rate / 100 / 12;
    const payment = principal * (r * Math.pow(1 + r, totalMonths)) / (Math.pow(1 + r, totalMonths) - 1);
    const totalPaid = payment * totalMonths;
    const totalInterest = totalPaid - principal;
    return { payment, totalPaid, totalInterest, totalMonths };
  }, [principal, rate, termYears, termMonths]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  const termPresets = [
    { label: "1 yr", y: 1, m: 0 }, { label: "2 yr", y: 2, m: 0 },
    { label: "3 yr", y: 3, m: 0 }, { label: "5 yr", y: 5, m: 0 },
    { label: "7 yr", y: 7, m: 0 }, { label: "10 yr", y: 10, m: 0 },
    { label: "15 yr", y: 15, m: 0 }, { label: "30 yr", y: 30, m: 0 },
  ];

  return (
    <ToolLayout
      title="Payment Calculator"
      description="Calculate monthly loan payments for any amount, interest rate, and term. See total interest and total cost."
      slug="payment-calculator"
      category="Finance"
      keywords={["payment calculator", "monthly payment calculator", "loan payment calculator", "calculate monthly payment"]}
      faqs={[
        { question: "How is the monthly payment calculated?", answer: "Using the standard amortization formula: M = P × [r(1+r)^n] / [(1+r)^n - 1], where P is principal, r is monthly rate, and n is total months. This gives a fixed monthly payment that covers both principal and interest." },
        { question: "Does a longer term mean lower payments?", answer: "Yes, longer terms have lower monthly payments but you pay more total interest. A $25,000 loan at 6.5% costs $489/mo over 5 years ($4,349 interest) vs $280/mo over 10 years ($8,580 interest)." },
        { question: "What is not included in this calculation?", answer: "This calculates principal and interest only. Real payments may include taxes, insurance, fees, and other escrow items depending on the loan type." },
      ]}
      relatedTools={[
        { name: "Loan Calculator", href: "/tools/loan-calculator" },
        { name: "Mortgage Calculator", href: "/tools/mortgage-calculator" },
        { name: "Auto Loan Calculator", href: "/tools/auto-loan-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Loan Amount ($)</label>
            <input type="number" value={principal} onChange={e => setPrincipal(+e.target.value)} className={inputCls} min={0} step={500} />
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
          <div>
            <p className="text-xs text-zinc-500 mb-2">Quick Terms</p>
            <div className="flex flex-wrap gap-1.5">
              {termPresets.map(p => (
                <button key={p.label} onClick={() => { setTermYears(p.y); setTermMonths(p.m); }} className={`px-2.5 py-1 rounded text-xs transition-colors ${termYears === p.y && termMonths === p.m ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
              <p className="text-sm text-zinc-400 mb-1">Monthly Payment</p>
              <p className="text-5xl font-bold text-blue-400">{fmtC(result.payment)}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Principal</p>
                <p className="text-lg font-semibold text-zinc-100">{fmtC(principal)}</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Total Interest</p>
                <p className="text-lg font-semibold text-red-400">{fmtC(result.totalInterest)}</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Total Paid</p>
                <p className="text-lg font-semibold text-zinc-100">{fmtC(result.totalPaid)}</p>
              </div>
            </div>

            {/* Visual breakdown bar */}
            {result.totalPaid > 0 && (
              <div>
                <div className="flex rounded-lg overflow-hidden h-6">
                  <div className="bg-blue-500" style={{ width: `${(principal / result.totalPaid) * 100}%` }} />
                  <div className="bg-red-500" style={{ width: `${(result.totalInterest / result.totalPaid) * 100}%` }} />
                </div>
                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                  <span>Principal ({((principal / result.totalPaid) * 100).toFixed(0)}%)</span>
                  <span>Interest ({((result.totalInterest / result.totalPaid) * 100).toFixed(0)}%)</span>
                </div>
              </div>
            )}

            {/* Rate comparison */}
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500 mb-2">Payment at Different Rates</p>
              <div className="space-y-1">
                {[3, 4, 5, 6, 7, 8, 9, 10].map(r => {
                  const mr = r / 100 / 12;
                  const n = result.totalMonths;
                  const pmt = mr === 0 ? principal / n : principal * (mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
                  const isActive = Math.abs(r - rate) < 0.05;
                  return (
                    <div key={r} className={`flex justify-between text-sm px-2 py-1 rounded ${isActive ? "bg-blue-600/20 text-blue-300" : "text-zinc-400"}`}>
                      <span>{r}%</span>
                      <span>{fmtC(pmt)}/mo</span>
                      <span>Total: {fmtC(pmt * n)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
