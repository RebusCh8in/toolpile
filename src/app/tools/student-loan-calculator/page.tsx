"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";


function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function Page() {
  const [loanAmount, setLoanAmount] = useState(35000);
  const [rate, setRate] = useState(5.5);
  const [termYears, setTermYears] = useState(10);
  const [extraPayment, setExtraPayment] = useState(0);

  const result = useMemo(() => {
    const n = termYears * 12;
    const r = rate / 100 / 12;
    const payment = r === 0 ? loanAmount / n : loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = payment + extraPayment;

    let bal = loanAmount; let months = 0; let totalInterest = 0;
    while (bal > 0 && months < 600) {
      months++;
      const interest = bal * r;
      const princ = Math.min(totalPayment - interest, bal);
      bal -= princ;
      totalInterest += interest;
    }

    // Without extra
    let balNoExtra = loanAmount; let monthsNoExtra = 0; let intNoExtra = 0;
    while (balNoExtra > 0 && monthsNoExtra < 600) {
      monthsNoExtra++;
      const interest = balNoExtra * r;
      balNoExtra -= payment - interest;
      intNoExtra += interest;
    }

    return { payment, totalPayment, totalInterest, totalPaid: loanAmount + totalInterest, months, monthsNoExtra, savedMonths: monthsNoExtra - months, savedInterest: intNoExtra - totalInterest };
  }, [loanAmount, rate, termYears, extraPayment]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  const ratePresets = [
    { label: "Sub Direct", rate: 5.50 },
    { label: "Unsub Direct", rate: 5.50 },
    { label: "PLUS", rate: 8.05 },
    { label: "Private Avg", rate: 10.0 },
  ];

  return (
    <ToolLayout
      title="Student Loan Calculator"
      description="Calculate monthly student loan payments and total interest. Compare standard vs extra payment plans."
      slug="student-loan-calculator"
      category="Finance"
      keywords={["student loan calculator", "student loan payment calculator", "student loan repayment calculator", "student loan interest calculator"]}
      faqs={[
        { question: "What is the standard student loan repayment plan?", answer: "The Standard Repayment Plan has fixed payments over 10 years. For $35,000 at 5.5%, that's $380/month with $10,585 in total interest. Other federal plans include Graduated, Extended, and Income-Driven." },
        { question: "Should I make extra payments?", answer: "If you can afford it, yes. Extra payments on a $35K loan at 5.5%: +$100/mo saves $2,648 in interest and pays off 3 years early. Always specify extra payments go to principal, not future payments." },
        { question: "What are current student loan rates?", answer: "2024-25 federal rates: 5.50% (Direct Subsidized/Unsubsidized), 7.05% (Graduate), 8.05% (PLUS). Private loans vary widely: 4-14% depending on creditworthiness. Federal loans have more protections." },
      ]}
      relatedTools={[
        { name: "Loan Calculator", href: "/tools/loan-calculator" },
        { name: "Debt Payoff Calculator", href: "/tools/debt-payoff-calculator" },
        { name: "Budget Calculator", href: "/tools/budget-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div><label className={labelCls}>Loan Balance ($)</label><input type="number" value={loanAmount} onChange={e => setLoanAmount(+e.target.value)} className={inputCls} min={0} step={1000} /></div>
          <div>
            <label className={labelCls}>Interest Rate (%)</label>
            <input type="number" value={rate} onChange={e => setRate(+e.target.value)} className={inputCls} min={0} max={20} step={0.01} />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {ratePresets.map(p => (
                <button key={p.label} onClick={() => setRate(p.rate)} className={`px-2 py-1 rounded text-xs transition-colors ${Math.abs(rate - p.rate) < 0.01 ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{p.label} {p.rate}%</button>
              ))}
            </div>
          </div>
          <div><label className={labelCls}>Repayment Term (years)</label><input type="number" value={termYears} onChange={e => setTermYears(+e.target.value)} className={inputCls} min={1} max={30} /></div>
          <div><label className={labelCls}>Extra Monthly Payment ($)</label><input type="number" value={extraPayment} onChange={e => setExtraPayment(+e.target.value)} className={inputCls} min={0} step={25} /></div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">Monthly Payment</p>
            <p className="text-4xl font-bold text-blue-400">{fmtC(result.totalPayment)}</p>
            {extraPayment > 0 && <p className="text-xs text-zinc-500 mt-1">Base: {fmtC(result.payment)} + Extra: {fmtC(extraPayment)}</p>}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Total Interest</p><p className="text-lg font-semibold text-red-400">{fmtC(result.totalInterest)}</p></div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Total Paid</p><p className="text-lg font-semibold text-zinc-100">{fmtC(result.totalPaid)}</p></div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Payoff</p><p className="text-lg font-semibold text-zinc-100">{Math.floor(result.months / 12)}y {result.months % 12}m</p></div>
          </div>
          {extraPayment > 0 && result.savedMonths > 0 && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
              <p className="text-sm text-green-300">Extra +{fmtC(extraPayment)}/mo saves <span className="font-bold">{fmtC(result.savedInterest)}</span> and <span className="font-bold">{result.savedMonths} months</span></p>
            </div>
          )}

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">Extra Payment Impact</p>
            <div className="space-y-1">
              {[0, 50, 100, 150, 200, 300, 500].map(extra => {
                const r2 = rate / 100 / 12; const pmt = result.payment + extra;
                let b = loanAmount; let m = 0; let ti = 0;
                while (b > 0 && m < 600) { m++; const i = b * r2; b -= Math.min(pmt - i, b); ti += i; }
                const isActive = extra === extraPayment;
                return (
                  <div key={extra} className={`flex justify-between text-sm px-2 py-1 rounded ${isActive ? "bg-blue-600/20 text-blue-300" : "text-zinc-400"}`}>
                    <span>{extra === 0 ? "Standard" : `+${fmtC(extra)}`}</span>
                    <span>{m} months</span>
                    <span>Int: {fmtC(ti)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </ToolLayout>
  );
}
