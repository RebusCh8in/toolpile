"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";


function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }

export default function Page() {
  const [annualIncome, setAnnualIncome] = useState(85000);
  const [monthlyDebts, setMonthlyDebts] = useState(400);
  const [downPayment, setDownPayment] = useState(50000);
  const [rate, setRate] = useState(6.5);
  const [termYears, setTermYears] = useState(30);
  const [propertyTaxRate, setPropertyTaxRate] = useState(1.2);
  const [insurance, setInsurance] = useState(150);
  const [hoa, setHoa] = useState(0);

  const result = useMemo(() => {
    const monthlyIncome = annualIncome / 12;
    // Front-end ratio: 28% of gross income for housing
    const maxHousing28 = monthlyIncome * 0.28;
    // Back-end ratio: 36% for all debts
    const maxTotal36 = monthlyIncome * 0.36;
    const maxHousingFromBackEnd = maxTotal36 - monthlyDebts;
    const maxMonthlyPayment = Math.min(maxHousing28, maxHousingFromBackEnd);

    // Subtract taxes, insurance, HOA to get max P&I
    const monthlyTaxInsurance = insurance + hoa;
    const maxPI = maxMonthlyPayment - monthlyTaxInsurance;

    // Solve for max loan amount from max P&I
    const r = rate / 100 / 12;
    const n = termYears * 12;
    const maxLoan = r === 0 ? maxPI * n : maxPI * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
    const maxHome = maxLoan + downPayment;

    // Property tax estimate
    const monthlyPropertyTax = (maxHome * (propertyTaxRate / 100)) / 12;
    const totalMonthly = maxPI + monthlyPropertyTax + insurance + hoa;

    // DTI ratios
    const frontEndDTI = monthlyIncome > 0 ? (totalMonthly / monthlyIncome) * 100 : 0;
    const backEndDTI = monthlyIncome > 0 ? ((totalMonthly + monthlyDebts) / monthlyIncome) * 100 : 0;

    return { maxHome: Math.max(0, maxHome), maxLoan: Math.max(0, maxLoan), maxPI: Math.max(0, maxPI), totalMonthly, monthlyPropertyTax, frontEndDTI, backEndDTI, monthlyIncome };
  }, [annualIncome, monthlyDebts, downPayment, rate, termYears, propertyTaxRate, insurance, hoa]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Mortgage Affordability Calculator"
      description="Find out how much house you can afford based on income, debts, and down payment. Uses the 28/36 DTI rule."
      slug="mortgage-affordability-calculator"
      category="Finance"
      keywords={["mortgage affordability calculator", "how much house can I afford", "home affordability calculator", "house affordability calculator", "mortgage qualification calculator"]}
      faqs={[
        { question: "How much house can I afford?", answer: "Lenders typically use the 28/36 rule: housing costs should be under 28% of gross income, and total debts under 36%. On $85K income, that's ~$1,983/month for housing, supporting a home around $300-350K depending on rate and down payment." },
        { question: "What is DTI ratio?", answer: "Debt-to-Income ratio compares monthly debt payments to gross income. Front-end DTI is just housing costs. Back-end includes all debts (car, student loans, credit cards). Most lenders want back-end DTI under 36-43%." },
        { question: "Does a bigger down payment help?", answer: "Yes. A larger down payment means a smaller loan, lower monthly payments, and often a better interest rate. At 20%, you also avoid PMI. But even 3-5% down can work with FHA or conventional loans." },
      ]}
      relatedTools={[
        { name: "Mortgage Calculator", href: "/tools/mortgage-calculator" },
        { name: "Down Payment Calculator", href: "/tools/down-payment-calculator" },
        { name: "Debt Payoff Calculator", href: "/tools/debt-payoff-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div><label className={labelCls}>Annual Gross Income ($)</label><input type="number" value={annualIncome} onChange={e => setAnnualIncome(+e.target.value)} className={inputCls} min={0} step={1000} /></div>
          <div><label className={labelCls}>Monthly Debt Payments ($)</label><input type="number" value={monthlyDebts} onChange={e => setMonthlyDebts(+e.target.value)} className={inputCls} min={0} step={50} /><p className="text-xs text-zinc-500 mt-1">Car, student loans, credit cards, etc.</p></div>
          <div><label className={labelCls}>Down Payment ($)</label><input type="number" value={downPayment} onChange={e => setDownPayment(+e.target.value)} className={inputCls} min={0} step={5000} /></div>
          <div><label className={labelCls}>Interest Rate (%)</label><input type="number" value={rate} onChange={e => setRate(+e.target.value)} className={inputCls} min={0} max={15} step={0.125} /></div>
          <div><label className={labelCls}>Loan Term (years)</label><input type="number" value={termYears} onChange={e => setTermYears(+e.target.value)} className={inputCls} min={1} max={50} /></div>
          <div className="grid grid-cols-3 gap-2">
            <div><label className={labelCls}>Property Tax (%)</label><input type="number" value={propertyTaxRate} onChange={e => setPropertyTaxRate(+e.target.value)} className={inputCls} min={0} max={5} step={0.1} /></div>
            <div><label className={labelCls}>Insurance ($/mo)</label><input type="number" value={insurance} onChange={e => setInsurance(+e.target.value)} className={inputCls} min={0} step={25} /></div>
            <div><label className={labelCls}>HOA ($/mo)</label><input type="number" value={hoa} onChange={e => setHoa(+e.target.value)} className={inputCls} min={0} step={25} /></div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">You Can Afford</p>
            <p className="text-4xl font-bold text-blue-400">{fmtC(result.maxHome)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Max Loan</p><p className="text-lg font-semibold text-zinc-100">{fmtC(result.maxLoan)}</p></div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Est. Monthly</p><p className="text-lg font-semibold text-zinc-100">{fmtC(result.totalMonthly)}</p></div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-sm space-y-1.5">
            <div className="flex justify-between"><span className="text-zinc-400">P&I</span><span className="text-zinc-100">{fmtC(result.maxPI)}</span></div>
            <div className="flex justify-between"><span className="text-zinc-400">Property Tax</span><span className="text-zinc-100">{fmtC(result.monthlyPropertyTax)}</span></div>
            <div className="flex justify-between"><span className="text-zinc-400">Insurance</span><span className="text-zinc-100">{fmtC(insurance)}</span></div>
            {hoa > 0 && <div className="flex justify-between"><span className="text-zinc-400">HOA</span><span className="text-zinc-100">{fmtC(hoa)}</span></div>}
            <div className="flex justify-between border-t border-zinc-700 pt-1 font-semibold"><span className="text-zinc-200">Total Housing</span><span className="text-blue-400">{fmtC(result.totalMonthly)}</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={`border rounded-lg p-3 ${result.frontEndDTI <= 28 ? "bg-green-500/10 border-green-500/20" : "bg-yellow-500/10 border-yellow-500/20"}`}>
              <p className={`text-xs ${result.frontEndDTI <= 28 ? "text-green-300" : "text-yellow-300"}`}>Front-End DTI</p>
              <p className={`text-lg font-semibold ${result.frontEndDTI <= 28 ? "text-green-400" : "text-yellow-400"}`}>{result.frontEndDTI.toFixed(1)}%</p>
              <p className="text-xs text-zinc-500">Target: ≤28%</p>
            </div>
            <div className={`border rounded-lg p-3 ${result.backEndDTI <= 36 ? "bg-green-500/10 border-green-500/20" : "bg-yellow-500/10 border-yellow-500/20"}`}>
              <p className={`text-xs ${result.backEndDTI <= 36 ? "text-green-300" : "text-yellow-300"}`}>Back-End DTI</p>
              <p className={`text-lg font-semibold ${result.backEndDTI <= 36 ? "text-green-400" : "text-yellow-400"}`}>{result.backEndDTI.toFixed(1)}%</p>
              <p className="text-xs text-zinc-500">Target: ≤36%</p>
            </div>
          </div>
        </div>
      </div>

    </ToolLayout>
  );
}
