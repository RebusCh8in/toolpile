"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";


function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function Page() {
  const [mode, setMode] = useState<"payment" | "months">("payment");
  const [balance, setBalance] = useState(8000);
  const [apr, setApr] = useState(22.99);
  const [monthlyPayment, setMonthlyPayment] = useState(250);
  const [targetMonths, setTargetMonths] = useState(24);

  const result = useMemo(() => {
    const r = apr / 100 / 12;
    if (mode === "payment") {
      // Given fixed payment, how long?
      if (monthlyPayment <= balance * r) return { error: "Payment doesn't cover monthly interest" };
      let bal = balance; let months = 0; let totalInterest = 0;
      while (bal > 0 && months < 600) {
        months++;
        const interest = bal * r;
        const principal = Math.min(monthlyPayment - interest, bal);
        bal -= principal;
        totalInterest += interest;
      }
      return { months, totalInterest, totalPaid: balance + totalInterest, monthlyPayment };
    } else {
      // Given target months, what payment?
      if (targetMonths <= 0) return { error: "Invalid target" };
      const pmt = r === 0 ? balance / targetMonths : balance * (r * Math.pow(1 + r, targetMonths)) / (Math.pow(1 + r, targetMonths) - 1);
      const totalPaid = pmt * targetMonths;
      const totalInterest = totalPaid - balance;
      return { months: targetMonths, totalInterest, totalPaid, monthlyPayment: pmt };
    }
  }, [mode, balance, apr, monthlyPayment, targetMonths]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Credit Card Payoff Calculator"
      description="Calculate how long to pay off your credit card or what monthly payment hits your target date. See total interest cost."
      slug="credit-card-payoff-calculator"
      category="Finance"
      keywords={["credit card payoff calculator", "credit card calculator", "how long to pay off credit card", "credit card interest calculator", "credit card payment calculator"]}
      faqs={[
        { question: "How long will it take to pay off my credit card?", answer: "It depends on your balance, APR, and monthly payment. An $8,000 balance at 22.99% with $250/month payments takes 44 months and costs $2,930 in interest. Paying $400/month cuts it to 23 months and $1,280 interest." },
        { question: "Should I pay more than the minimum?", answer: "Always. Minimum payments (typically 1-3% of balance) keep you in debt for decades. An $8,000 balance at 23% with 2% minimum payments ($160 initial) takes 30+ years and costs over $16,000 in interest." },
        { question: "What is a balance transfer?", answer: "Moving debt from a high-APR card to one with a 0% introductory rate (typically 12-21 months). A 3-5% transfer fee applies, but you save on interest if you pay it off during the promo period." },
      ]}
      relatedTools={[
        { name: "Debt Payoff Calculator", href: "/tools/debt-payoff-calculator" },
        { name: "Interest Calculator", href: "/tools/interest-calculator" },
        { name: "Budget Calculator", href: "/tools/budget-calculator" },
      ]}
    >
      <div className="flex gap-2 mb-6">
        <button onClick={() => setMode("payment")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "payment" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>Fixed Payment</button>
        <button onClick={() => setMode("months")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "months" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>Target Date</button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div><label className={labelCls}>Current Balance ($)</label><input type="number" value={balance} onChange={e => setBalance(+e.target.value)} className={inputCls} min={0} step={100} /></div>
          <div><label className={labelCls}>Annual Percentage Rate (%)</label><input type="number" value={apr} onChange={e => setApr(+e.target.value)} className={inputCls} min={0} max={40} step={0.01} /></div>
          {mode === "payment" ? (
            <div><label className={labelCls}>Monthly Payment ($)</label><input type="number" value={monthlyPayment} onChange={e => setMonthlyPayment(+e.target.value)} className={inputCls} min={0} step={25} /></div>
          ) : (
            <div><label className={labelCls}>Payoff Goal (months)</label><input type="number" value={targetMonths} onChange={e => setTargetMonths(+e.target.value)} className={inputCls} min={1} max={360} /></div>
          )}
        </div>

        <div className="space-y-4">
          {"error" in result ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 text-center"><p className="text-red-400">{result.error}</p></div>
          ) : (
            <>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
                <p className="text-sm text-zinc-400 mb-1">{mode === "payment" ? "Debt Free In" : "Required Payment"}</p>
                <p className="text-4xl font-bold text-blue-400">{mode === "payment" ? `${Math.floor(result.months / 12)}y ${result.months % 12}m` : fmtC(result.monthlyPayment)}</p>
                {mode === "payment" && <p className="text-xs text-zinc-500 mt-1">{result.months} months</p>}
                {mode === "months" && <p className="text-xs text-zinc-500 mt-1">per month for {targetMonths} months</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3"><p className="text-xs text-red-300">Total Interest</p><p className="text-lg font-semibold text-red-400">{fmtC(result.totalInterest)}</p></div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Total Paid</p><p className="text-lg font-semibold text-zinc-100">{fmtC(result.totalPaid)}</p></div>
              </div>

              {/* Payment comparison */}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500 mb-2">Payment Comparison</p>
                <div className="space-y-1">
                  {[100, 150, 200, 250, 300, 400, 500, 750].map(pmt => {
                    const r2 = apr / 100 / 12;
                    if (pmt <= balance * r2) return null;
                    let b = balance; let m = 0; let ti = 0;
                    while (b > 0 && m < 600) { m++; const i = b * r2; b -= Math.min(pmt - i, b); ti += i; }
                    const active = mode === "payment" ? pmt === monthlyPayment : Math.abs(pmt - result.monthlyPayment) < 1;
                    return (
                      <div key={pmt} className={`flex justify-between text-sm px-2 py-1 rounded ${active ? "bg-blue-600/20 text-blue-300" : "text-zinc-400"}`}>
                        <span>{fmtC(pmt)}/mo</span>
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
