"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function Page() {
  const [balance, setBalance] = useState(15000);
  const [rate, setRate] = useState(18.9);
  const [minPayment, setMinPayment] = useState(300);
  const [extraPayment, setExtraPayment] = useState(0);

  const result = useMemo(() => {
    if (balance <= 0 || minPayment <= 0) return null;
    const r = rate / 100 / 12;
    const total = minPayment + extraPayment;

    // Check if payment covers interest
    const firstInterest = balance * r;
    if (total <= firstInterest) return { error: "Payment too low to cover monthly interest" } as const;

    let bal = balance;
    let months = 0;
    let totalInterest = 0;
    const schedule: { month: number; payment: number; interest: number; principal: number; balance: number }[] = [];

    while (bal > 0 && months < 600) {
      months++;
      const interest = bal * r;
      const pmt = Math.min(total, bal + interest);
      const princ = pmt - interest;
      bal -= princ;
      totalInterest += interest;
      schedule.push({ month: months, payment: pmt, interest, principal: princ, balance: Math.max(0, bal) });
    }

    // Also calc without extra
    let balNoExtra = balance;
    let monthsNoExtra = 0;
    let interestNoExtra = 0;
    while (balNoExtra > 0 && monthsNoExtra < 600) {
      monthsNoExtra++;
      const interest = balNoExtra * r;
      if (minPayment <= interest) { monthsNoExtra = 999; break; }
      const princ = minPayment - interest;
      balNoExtra -= princ;
      interestNoExtra += interest;
    }

    const savedMonths = monthsNoExtra - months;
    const savedInterest = interestNoExtra - totalInterest;

    return { months, totalInterest, totalPaid: balance + totalInterest, monthsNoExtra, savedMonths, savedInterest, schedule };
  }, [balance, rate, minPayment, extraPayment]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Debt Payoff Calculator"
      description="See how long it takes to pay off debt and how much interest you'll pay. Compare with extra payments to save money."
      slug="debt-payoff-calculator"
      category="Finance"
      keywords={["debt payoff calculator", "debt calculator", "credit card payoff calculator", "debt repayment calculator", "how long to pay off debt"]}
      faqs={[
        { question: "How does extra payment help with debt?", answer: "Extra payments go directly to principal. On a $15,000 credit card at 18.9%, minimum $300/mo takes 76 months and $7,700 in interest. Adding $200/mo cuts it to 38 months and $3,300 interest — saving $4,400." },
        { question: "Should I pay off high interest debt first?", answer: "The avalanche method (highest interest first) saves the most money mathematically. The snowball method (smallest balance first) provides psychological wins. Both work — pick the one you'll stick with." },
        { question: "Why does my balance barely go down at first?", answer: "With high interest rates, most of your early payments go to interest. On a $15K balance at 18.9%, the first month's interest alone is $236. Only $64 of a $300 payment reduces your balance." },
      ]}
      relatedTools={[
        { name: "Loan Calculator", href: "/tools/loan-calculator" },
        { name: "Interest Calculator", href: "/tools/interest-calculator" },
        { name: "Budget Calculator", href: "/tools/budget-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div><label className={labelCls}>Current Balance ($)</label><input type="number" value={balance} onChange={e => setBalance(+e.target.value)} className={inputCls} min={0} step={100} /></div>
          <div><label className={labelCls}>Annual Interest Rate (%)</label><input type="number" value={rate} onChange={e => setRate(+e.target.value)} className={inputCls} min={0} max={40} step={0.1} /></div>
          <div><label className={labelCls}>Minimum Monthly Payment ($)</label><input type="number" value={minPayment} onChange={e => setMinPayment(+e.target.value)} className={inputCls} min={0} step={10} /></div>
          <div><label className={labelCls}>Extra Monthly Payment ($)</label><input type="number" value={extraPayment} onChange={e => setExtraPayment(+e.target.value)} className={inputCls} min={0} step={25} /></div>
        </div>

        <div className="space-y-4">
          {result && "error" in result && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 text-center">
              <p className="text-red-400">{result.error}</p>
            </div>
          )}
          {result && !("error" in result) && (
            <>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
                <p className="text-sm text-zinc-400 mb-1">Debt Free In</p>
                <p className="text-4xl font-bold text-blue-400">{Math.floor(result.months / 12)}y {result.months % 12}m</p>
                <p className="text-xs text-zinc-500 mt-1">{result.months} months</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Total Interest</p><p className="text-lg font-semibold text-red-400">{fmtC(result.totalInterest)}</p></div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Total Paid</p><p className="text-lg font-semibold text-zinc-100">{fmtC(result.totalPaid)}</p></div>
              </div>
              {extraPayment > 0 && result.savedMonths > 0 && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                  <p className="text-sm text-green-300">Extra {fmtC(extraPayment)}/mo saves <span className="font-bold">{fmtC(result.savedInterest)}</span> in interest and <span className="font-bold">{result.savedMonths} months</span></p>
                </div>
              )}

              {/* Extra payment comparison */}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500 mb-2">Extra Payment Comparison</p>
                <div className="space-y-1">
                  {[0, 50, 100, 200, 300, 500].map(extra => {
                    const r2 = rate / 100 / 12;
                    const pmt = minPayment + extra;
                    if (pmt <= balance * r2) return null;
                    let b = balance; let m = 0; let ti = 0;
                    while (b > 0 && m < 600) { m++; const i = b * r2; const p = Math.min(pmt, b + i) - i; b -= p; ti += i; }
                    const isActive = extra === extraPayment;
                    return (
                      <div key={extra} className={`flex justify-between text-sm px-2 py-1 rounded ${isActive ? "bg-blue-600/20 text-blue-300" : "text-zinc-400"}`}>
                        <span>+{fmtC(extra)}/mo</span>
                        <span>{m} months</span>
                        <span>Int: {fmtC(ti)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
