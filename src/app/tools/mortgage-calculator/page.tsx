"use client";
import { useState, useMemo, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";


function fmt(n: number) { return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtC(n: number) { return "$" + fmt(n); }

/* ── State property tax rates (effective %) and insurance rates (% of home value) ── */
/* Property tax: effective rates from Tax Foundation / Census Bureau 2024 data */
/* Insurance: derived from avg annual premiums / median home values by state, NAIC 2024 */
const STATE_DATA: Record<string, { name: string; propTaxRate: number; insRate: number }> = {
  AL: { name: "Alabama", propTaxRate: 0.41, insRate: 0.48 },
  AK: { name: "Alaska", propTaxRate: 1.19, insRate: 0.42 },
  AZ: { name: "Arizona", propTaxRate: 0.62, insRate: 0.46 },
  AR: { name: "Arkansas", propTaxRate: 0.62, insRate: 0.72 },
  CA: { name: "California", propTaxRate: 0.71, insRate: 0.46 },
  CO: { name: "Colorado", propTaxRate: 0.51, insRate: 0.50 },
  CT: { name: "Connecticut", propTaxRate: 2.15, insRate: 0.46 },
  DE: { name: "Delaware", propTaxRate: 0.57, insRate: 0.34 },
  DC: { name: "District of Columbia", propTaxRate: 0.56, insRate: 0.28 },
  FL: { name: "Florida", propTaxRate: 0.86, insRate: 1.05 },
  GA: { name: "Georgia", propTaxRate: 0.92, insRate: 0.58 },
  HI: { name: "Hawaii", propTaxRate: 0.28, insRate: 0.19 },
  ID: { name: "Idaho", propTaxRate: 0.63, insRate: 0.36 },
  IL: { name: "Illinois", propTaxRate: 2.23, insRate: 0.55 },
  IN: { name: "Indiana", propTaxRate: 0.85, insRate: 0.47 },
  IA: { name: "Iowa", propTaxRate: 1.57, insRate: 0.52 },
  KS: { name: "Kansas", propTaxRate: 1.41, insRate: 0.82 },
  KY: { name: "Kentucky", propTaxRate: 0.86, insRate: 0.62 },
  LA: { name: "Louisiana", propTaxRate: 0.55, insRate: 1.10 },
  ME: { name: "Maine", propTaxRate: 1.36, insRate: 0.38 },
  MD: { name: "Maryland", propTaxRate: 1.09, insRate: 0.38 },
  MA: { name: "Massachusetts", propTaxRate: 1.23, insRate: 0.38 },
  MI: { name: "Michigan", propTaxRate: 1.54, insRate: 0.46 },
  MN: { name: "Minnesota", propTaxRate: 1.12, insRate: 0.54 },
  MS: { name: "Mississippi", propTaxRate: 0.81, insRate: 0.90 },
  MO: { name: "Missouri", propTaxRate: 0.97, insRate: 0.68 },
  MT: { name: "Montana", propTaxRate: 0.84, insRate: 0.48 },
  NE: { name: "Nebraska", propTaxRate: 1.73, insRate: 0.66 },
  NV: { name: "Nevada", propTaxRate: 0.60, insRate: 0.38 },
  NH: { name: "New Hampshire", propTaxRate: 1.77, insRate: 0.34 },
  NJ: { name: "New Jersey", propTaxRate: 2.23, insRate: 0.34 },
  NM: { name: "New Mexico", propTaxRate: 0.80, insRate: 0.52 },
  NY: { name: "New York", propTaxRate: 1.72, insRate: 0.36 },
  NC: { name: "North Carolina", propTaxRate: 0.84, insRate: 0.52 },
  ND: { name: "North Dakota", propTaxRate: 0.98, insRate: 0.62 },
  OH: { name: "Ohio", propTaxRate: 1.56, insRate: 0.38 },
  OK: { name: "Oklahoma", propTaxRate: 0.90, insRate: 0.96 },
  OR: { name: "Oregon", propTaxRate: 0.97, insRate: 0.28 },
  PA: { name: "Pennsylvania", propTaxRate: 1.58, insRate: 0.34 },
  RI: { name: "Rhode Island", propTaxRate: 1.63, insRate: 0.46 },
  SC: { name: "South Carolina", propTaxRate: 0.57, insRate: 0.62 },
  SD: { name: "South Dakota", propTaxRate: 1.31, insRate: 0.58 },
  TN: { name: "Tennessee", propTaxRate: 0.71, insRate: 0.56 },
  TX: { name: "Texas", propTaxRate: 1.80, insRate: 0.88 },
  UT: { name: "Utah", propTaxRate: 0.63, insRate: 0.26 },
  VT: { name: "Vermont", propTaxRate: 1.90, insRate: 0.34 },
  VA: { name: "Virginia", propTaxRate: 0.82, insRate: 0.36 },
  WA: { name: "Washington", propTaxRate: 0.98, insRate: 0.32 },
  WV: { name: "West Virginia", propTaxRate: 0.58, insRate: 0.44 },
  WI: { name: "Wisconsin", propTaxRate: 1.85, insRate: 0.36 },
  WY: { name: "Wyoming", propTaxRate: 0.61, insRate: 0.42 },
};

export default function Page() {
  const [state, setState] = useState("TX");
  const [homePrice, setHomePrice] = useState(350000);
  const [downPayment, setDownPayment] = useState(70000);
  const [rate, setRate] = useState(6.5);
  const [term, setTerm] = useState(30);
  const [propertyTax, setPropertyTax] = useState(6300);
  const [insurance, setInsurance] = useState(3080);
  const [pmi, setPmi] = useState(0.5);
  const [showSchedule, setShowSchedule] = useState(false);

  // Auto-populate tax & insurance when state or home price changes
  useEffect(() => {
    const sd = STATE_DATA[state];
    if (!sd) return;
    setPropertyTax(Math.round(homePrice * sd.propTaxRate / 100));
    setInsurance(Math.round(homePrice * sd.insRate / 100));
  }, [state, homePrice]);

  const stateInfo = STATE_DATA[state];

  const result = useMemo(() => {
    const principal = homePrice - downPayment;
    const monthlyRate = rate / 100 / 12;
    const payments = term * 12;
    if (principal <= 0 || rate <= 0 || term <= 0) return null;

    const monthly = monthlyRate === 0
      ? principal / payments
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, payments)) / (Math.pow(1 + monthlyRate, payments) - 1);

    const monthlyTax = propertyTax / 12;
    const monthlyInsurance = insurance / 12;
    const downPercent = homePrice > 0 ? (downPayment / homePrice) * 100 : 0;
    const monthlyPmi = downPercent < 20 ? (principal * (pmi / 100)) / 12 : 0;
    const totalMonthly = monthly + monthlyTax + monthlyInsurance + monthlyPmi;
    const totalPaid = monthly * payments;
    const totalInterest = totalPaid - principal;

    // Amortization schedule
    const schedule: { month: number; payment: number; principalPart: number; interestPart: number; balance: number }[] = [];
    let balance = principal;
    for (let i = 1; i <= payments; i++) {
      const interestPart = balance * monthlyRate;
      const principalPart = monthly - interestPart;
      balance = Math.max(0, balance - principalPart);
      schedule.push({ month: i, payment: monthly, principalPart, interestPart, balance });
    }

    return { principal, monthly, monthlyTax, monthlyInsurance, monthlyPmi, totalMonthly, totalPaid, totalInterest, payments, schedule, downPercent };
  }, [homePrice, downPayment, rate, term, propertyTax, insurance, pmi]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Mortgage Calculator"
      description="Calculate your monthly mortgage payment with accurate property tax and insurance estimates by state. Includes PMI, full amortization schedule, and payment breakdown."
      slug="mortgage-calculator"
      category="Finance"
      keywords={["mortgage calculator", "home loan calculator", "mortgage payment calculator", "amortization calculator", "house payment calculator", "mortgage with taxes and insurance", "true mortgage cost"]}
      faqs={[
        { question: "How is the monthly mortgage payment calculated?", answer: "The monthly payment uses the standard amortization formula: M = P[r(1+r)^n]/[(1+r)^n – 1], where P is the loan amount, r is the monthly interest rate, and n is the total number of payments." },
        { question: "How accurate are the property tax and insurance estimates?", answer: "Property tax rates are based on each state's effective tax rate from Tax Foundation and Census Bureau data. Insurance rates are derived from average annual premiums by state (NAIC data). Both are applied as a percentage of your home price and auto-update when you change the state or price. These are state averages — your actual costs may vary by county, municipality, coverage level, and property specifics. You can override either value manually." },
        { question: "What is PMI?", answer: "Private Mortgage Insurance (PMI) is required when your down payment is less than 20% of the home price. It typically costs 0.3%–1.5% of the loan amount per year and protects the lender if you default." },
        { question: "Why do property taxes vary so much by state?", answer: "Property tax rates range from 0.28% in Hawaii to 2.47% in New Jersey. This means on a $350,000 home, you could pay $980/year in Hawaii or $8,645/year in New Jersey. States with no income tax (like Texas at 1.80%) often have higher property taxes to compensate." },
        { question: "Why is homeowners insurance so expensive in some states?", answer: "States prone to natural disasters have significantly higher insurance costs. Florida averages ~1.05% of home value annually due to hurricane risk. Oklahoma (~0.96%) and Louisiana (~1.10%) are high due to tornado and hurricane exposure. States like Hawaii (0.19%), Utah (0.26%), and Oregon (0.28%) have the lowest rates." },
        { question: "Does this include taxes and insurance?", answer: "Yes. When you select a state, property tax and homeowners insurance are automatically estimated based on state averages and your home price. These are added to your principal and interest payment to show your true monthly cost. You can also manually adjust both values." },
        { question: "What is an amortization schedule?", answer: "An amortization schedule shows how each monthly payment is split between principal and interest over the life of the loan. Early payments are mostly interest; later payments are mostly principal." },
      ]}
      relatedTools={[
        { name: "Mortgage Affordability Calculator", href: "/tools/mortgage-affordability-calculator" },
        { name: "Compound Interest Calculator", href: "/tools/compound-interest-calculator" },
        { name: "Loan Calculator", href: "/tools/loan-calculator" },
        { name: "Home Affordability Calculator", href: "/tools/home-affordability-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className={labelCls}>State</label>
            <select value={state} onChange={e => setState(e.target.value)} className={inputCls}>
              {Object.entries(STATE_DATA)
                .sort((a, b) => a[1].name.localeCompare(b[1].name))
                .map(([code, s]) => (
                  <option key={code} value={code}>{s.name}</option>
                ))}
            </select>
            <p className="text-xs text-zinc-500 mt-1">
              Avg property tax: {stateInfo.propTaxRate}% &middot; Avg insurance: {stateInfo.insRate}% of home value
            </p>
          </div>
          <div>
            <label className={labelCls}>Home Price ($)</label>
            <input type="number" value={homePrice} onChange={e => setHomePrice(+e.target.value)} className={inputCls} min={0} step={1000} />
          </div>
          <div>
            <label className={labelCls}>Down Payment ($)</label>
            <input type="number" value={downPayment} onChange={e => setDownPayment(+e.target.value)} className={inputCls} min={0} step={1000} />
            {result && <p className="text-xs text-zinc-500 mt-1">{result.downPercent.toFixed(1)}% down</p>}
          </div>
          <div>
            <label className={labelCls}>Interest Rate (%)</label>
            <input type="number" value={rate} onChange={e => setRate(+e.target.value)} className={inputCls} min={0} max={30} step={0.125} />
          </div>
          <div>
            <label className={labelCls}>Loan Term (years)</label>
            <div className="flex gap-2">
              {[15, 20, 30].map(y => (
                <button key={y} onClick={() => setTerm(y)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${term === y ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{y} yr</button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Annual Property Tax ($) <span className="text-zinc-600">— auto-estimated</span></label>
            <input type="number" value={propertyTax} onChange={e => setPropertyTax(+e.target.value)} className={inputCls} min={0} step={100} />
            <p className="text-xs text-zinc-500 mt-1">{stateInfo.propTaxRate}% effective rate &middot; {fmtC(propertyTax / 12)}/mo</p>
          </div>
          <div>
            <label className={labelCls}>Annual Home Insurance ($) <span className="text-zinc-600">— auto-estimated</span></label>
            <input type="number" value={insurance} onChange={e => setInsurance(+e.target.value)} className={inputCls} min={0} step={100} />
            <p className="text-xs text-zinc-500 mt-1">{stateInfo.insRate}% of home value &middot; {fmtC(insurance / 12)}/mo</p>
          </div>
          {result && result.downPercent < 20 && (
            <div>
              <label className={labelCls}>PMI Rate (%/year)</label>
              <input type="number" value={pmi} onChange={e => setPmi(+e.target.value)} className={inputCls} min={0} max={5} step={0.1} />
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
              <p className="text-sm text-zinc-400 mb-1">Total Monthly Payment</p>
              <p className="text-4xl font-bold text-blue-400">{fmtC(result.totalMonthly)}</p>
              <p className="text-xs text-zinc-500 mt-1">Includes principal, interest, taxes, insurance{result.monthlyPmi > 0 ? ", and PMI" : ""}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Principal & Interest</p>
                <p className="text-lg font-semibold text-zinc-100">{fmtC(result.monthly)}</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Property Tax</p>
                <p className="text-lg font-semibold text-zinc-100">{fmtC(result.monthlyTax)}</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Insurance</p>
                <p className="text-lg font-semibold text-zinc-100">{fmtC(result.monthlyInsurance)}</p>
              </div>
              {result.monthlyPmi > 0 && (
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">PMI</p>
                  <p className="text-lg font-semibold text-zinc-100">{fmtC(result.monthlyPmi)}</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Loan Amount</p>
                <p className="text-sm font-semibold text-zinc-100">{fmtC(result.principal)}</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Total Interest</p>
                <p className="text-sm font-semibold text-zinc-100">{fmtC(result.totalInterest)}</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Total Paid</p>
                <p className="text-sm font-semibold text-zinc-100">{fmtC(result.totalPaid)}</p>
              </div>
            </div>

            {/* Payment breakdown bar */}
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500 mb-2">Payment Breakdown</p>
              <div className="flex rounded-full overflow-hidden h-4">
                <div className="bg-blue-500" style={{ width: `${(result.monthly / result.totalMonthly) * 100}%` }} title="Principal & Interest" />
                <div className="bg-green-500" style={{ width: `${(result.monthlyTax / result.totalMonthly) * 100}%` }} title="Tax" />
                <div className="bg-yellow-500" style={{ width: `${(result.monthlyInsurance / result.totalMonthly) * 100}%` }} title="Insurance" />
                {result.monthlyPmi > 0 && <div className="bg-red-400" style={{ width: `${(result.monthlyPmi / result.totalMonthly) * 100}%` }} title="PMI" />}
              </div>
              <div className="flex flex-wrap gap-3 mt-2 text-xs">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />P&I</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />Tax</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" />Insurance</span>
                {result.monthlyPmi > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />PMI</span>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Amortization Schedule */}
      {result && (
        <div className="mt-8">
          <button onClick={() => setShowSchedule(!showSchedule)} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            {showSchedule ? "Hide" : "Show"} Amortization Schedule ({result.payments} payments)
          </button>
          {showSchedule && (
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
                      <td className="px-3 py-1.5">{fmtC(row.principalPart)}</td>
                      <td className="px-3 py-1.5">{fmtC(row.interestPart)}</td>
                      <td className="px-3 py-1.5">{fmtC(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
