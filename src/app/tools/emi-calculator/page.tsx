"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calcEMI(principal: number, annualRate: number, months: number) {
  if (principal <= 0 || months <= 0) return 0;
  if (annualRate <= 0) return principal / months;
  const r = annualRate / 100 / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

interface ScheduleRow {
  month: number;
  year: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  extraPayment: number;
}

interface YearSummary {
  year: number;
  principalPaid: number;
  interestPaid: number;
  totalPaid: number;
  endingBalance: number;
}

function buildSchedule(
  loanAmount: number,
  annualRate: number,
  totalMonths: number,
  extraMonthly: number,
  lumpSum: number,
  lumpSumMonth: number
): { rows: ScheduleRow[]; yearSummaries: YearSummary[] } {
  const r = annualRate / 100 / 12;
  const emi = calcEMI(loanAmount, annualRate, totalMonths);
  if (emi <= 0) return { rows: [], yearSummaries: [] };

  const rows: ScheduleRow[] = [];
  let balance = loanAmount;

  for (let i = 1; i <= totalMonths && balance > 0.01; i++) {
    const interestPortion = r > 0 ? balance * r : 0;
    let principalPortion = emi - interestPortion;
    let extra = extraMonthly;
    if (i === lumpSumMonth) extra += lumpSum;

    if (principalPortion + extra >= balance) {
      principalPortion = balance;
      extra = 0;
    } else if (principalPortion + extra > balance) {
      extra = balance - principalPortion;
    }

    const totalPrincipal = Math.min(principalPortion + extra, balance);
    balance = Math.max(0, balance - totalPrincipal);

    rows.push({
      month: i,
      year: Math.ceil(i / 12),
      payment: interestPortion + totalPrincipal,
      principal: principalPortion,
      interest: interestPortion,
      balance,
      extraPayment: Math.min(extra, totalPrincipal - principalPortion + extra),
    });
  }

  const yearMap = new Map<number, YearSummary>();
  for (const row of rows) {
    const y = row.year;
    if (!yearMap.has(y)) yearMap.set(y, { year: y, principalPaid: 0, interestPaid: 0, totalPaid: 0, endingBalance: 0 });
    const s = yearMap.get(y)!;
    s.principalPaid += row.principal + row.extraPayment;
    s.interestPaid += row.interest;
    s.totalPaid += row.payment;
    s.endingBalance = row.balance;
  }

  return { rows, yearSummaries: Array.from(yearMap.values()) };
}

function DonutChart({ principal, interest }: { principal: number; interest: number }) {
  const total = principal + interest;
  if (total <= 0) return null;
  const pPct = principal / total;
  const r = 60;
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * r;
  const pLen = circumference * pPct;
  const iLen = circumference * (1 - pPct);

  return (
    <svg viewBox="0 0 160 160" className="w-full max-w-[200px] mx-auto">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3f3f46" strokeWidth="20" />
      <circle
        cx={cx} cy={cy} r={r} fill="none" stroke="#3b82f6" strokeWidth="20"
        strokeDasharray={`${pLen} ${circumference}`}
        strokeDashoffset={circumference * 0.25}
        strokeLinecap="butt"
      />
      <circle
        cx={cx} cy={cy} r={r} fill="none" stroke="#eab308" strokeWidth="20"
        strokeDasharray={`${iLen} ${circumference}`}
        strokeDashoffset={circumference * 0.25 - pLen}
        strokeLinecap="butt"
      />
      <text x={cx} y={cy - 6} textAnchor="middle" className="fill-zinc-300 text-[10px] font-semibold">
        {(pPct * 100).toFixed(1)}%
      </text>
      <text x={cx} y={cy + 8} textAnchor="middle" className="fill-zinc-500 text-[8px]">
        Principal
      </text>
    </svg>
  );
}

function StackedBarChart({ yearSummaries }: { yearSummaries: YearSummary[] }) {
  if (yearSummaries.length === 0) return null;
  const maxTotal = Math.max(...yearSummaries.map(y => y.principalPaid + y.interestPaid));
  const barW = Math.max(12, Math.min(40, 500 / yearSummaries.length));
  const chartH = 160;
  const svgW = yearSummaries.length * (barW + 6) + 40;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${svgW} ${chartH + 30}`} className="w-full min-w-[300px]" style={{ maxWidth: svgW }}>
        {yearSummaries.map((y, i) => {
          const x = 30 + i * (barW + 6);
          const total = y.principalPaid + y.interestPaid;
          const totalH = (total / maxTotal) * chartH;
          const pH = (y.principalPaid / total) * totalH;
          const iH = totalH - pH;
          return (
            <g key={y.year}>
              <rect x={x} y={chartH - totalH} width={barW} height={iH} rx={2} fill="#eab308" opacity={0.85} />
              <rect x={x} y={chartH - totalH + iH} width={barW} height={pH} rx={2} fill="#3b82f6" opacity={0.85} />
              <text x={x + barW / 2} y={chartH + 14} textAnchor="middle" className="fill-zinc-500 text-[8px]">
                Y{y.year}
              </text>
            </g>
          );
        })}
        <line x1="28" y1={chartH} x2={svgW} y2={chartH} stroke="#3f3f46" strokeWidth={1} />
      </svg>
    </div>
  );
}

interface LoanOffer {
  id: number;
  name: string;
  amount: number;
  rate: number;
  tenureMonths: number;
}

export default function Page() {
  const [amount, setAmount] = useState(500000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [tenureUnit, setTenureUnit] = useState<"years" | "months">("years");

  // Prepayment
  const [extraMonthly, setExtraMonthly] = useState(0);
  const [lumpSum, setLumpSum] = useState(0);
  const [lumpSumMonth, setLumpSumMonth] = useState(12);

  // Comparison
  const [showComparison, setShowComparison] = useState(false);
  const [offers, setOffers] = useState<LoanOffer[]>([
    { id: 1, name: "Offer A", amount: 500000, rate: 8.5, tenureMonths: 240 },
    { id: 2, name: "Offer B", amount: 500000, rate: 9.0, tenureMonths: 180 },
  ]);

  // Active tab
  const [tab, setTab] = useState<"emi" | "prepay" | "compare">("emi");

  const totalMonths = tenureUnit === "years" ? tenure * 12 : tenure;

  const result = useMemo(() => {
    const emi = calcEMI(amount, rate, totalMonths);
    const totalPaid = emi * totalMonths;
    const totalInterest = totalPaid - amount;
    const { rows, yearSummaries } = buildSchedule(amount, rate, totalMonths, 0, 0, 0);
    return { emi, totalPaid, totalInterest, rows, yearSummaries };
  }, [amount, rate, totalMonths]);

  const prepayResult = useMemo(() => {
    const { rows, yearSummaries } = buildSchedule(amount, rate, totalMonths, extraMonthly, lumpSum, lumpSumMonth);
    const totalPaid = rows.reduce((s, r) => s + r.payment, 0);
    const totalInterest = rows.reduce((s, r) => s + r.interest, 0);
    const monthsSaved = totalMonths - rows.length;
    const interestSaved = result.totalInterest - totalInterest;
    return { rows, yearSummaries, totalPaid, totalInterest, monthsSaved, interestSaved, actualMonths: rows.length };
  }, [amount, rate, totalMonths, extraMonthly, lumpSum, lumpSumMonth, result.totalInterest]);

  const comparisonResults = useMemo(() => {
    return offers.map(o => {
      const emi = calcEMI(o.amount, o.rate, o.tenureMonths);
      const totalPaid = emi * o.tenureMonths;
      const totalInterest = totalPaid - o.amount;
      return { ...o, emi, totalPaid, totalInterest };
    });
  }, [offers]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const cardCls = "bg-zinc-800/50 border border-zinc-700 rounded-xl p-5";
  const tabCls = (active: boolean) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`;

  const updateOffer = (id: number, field: keyof LoanOffer, value: string | number) => {
    setOffers(prev => prev.map(o => (o.id === id ? { ...o, [field]: value } : o)));
  };

  const addOffer = () => {
    if (offers.length >= 3) return;
    const id = Math.max(0, ...offers.map(o => o.id)) + 1;
    const names = ["Offer A", "Offer B", "Offer C"];
    setOffers(prev => [...prev, { id, name: names[prev.length] || `Offer ${id}`, amount: 500000, rate: 9.0, tenureMonths: 240 }]);
  };

  const removeOffer = (id: number) => {
    if (offers.length <= 1) return;
    setOffers(prev => prev.filter(o => o.id !== id));
  };

  return (
    <ToolLayout
      title="EMI Calculator"
      description="Calculate your Equated Monthly Installment (EMI) for home loans, car loans, or personal loans. View amortization schedules, compare loan offers, and see how prepayments reduce your interest burden."
      slug="emi-calculator"
      category="Finance"
      keywords={[
        "EMI calculator",
        "equated monthly installment calculator",
        "home loan EMI calculator",
        "car loan EMI calculator",
        "loan EMI calculator online",
        "EMI calculator with prepayment",
        "loan comparison calculator",
        "amortization schedule calculator",
      ]}
      faqs={[
        {
          question: "What is EMI and how is it calculated?",
          answer:
            "EMI stands for Equated Monthly Installment. It is the fixed amount you pay every month to repay your loan. The formula is EMI = P x r x (1+r)^n / [(1+r)^n - 1], where P is the principal loan amount, r is the monthly interest rate (annual rate divided by 12), and n is the total number of monthly installments. This calculator computes EMI instantly for any loan amount, interest rate, and tenure.",
        },
        {
          question: "How does prepayment affect my loan?",
          answer:
            "Prepayment — whether as extra monthly payments or a one-time lump sum — goes directly toward reducing your outstanding principal. This lowers the interest charged in subsequent months, which can significantly reduce total interest paid and shorten your loan tenure. Even small additional monthly payments can save thousands over the life of a loan.",
        },
        {
          question: "What is an amortization schedule?",
          answer:
            "An amortization schedule is a table showing every payment over the life of a loan, broken down into principal and interest components. Early payments are mostly interest, while later payments are mostly principal. This calculator provides both a month-by-month and year-by-year amortization schedule so you can see exactly how your loan balance decreases over time.",
        },
        {
          question: "Can I compare multiple loan offers with this calculator?",
          answer:
            "Yes. The Loan Comparison tab lets you enter up to three different loan offers with varying amounts, interest rates, and tenures. The calculator shows EMI, total interest, and total payment for each offer side by side, making it easy to pick the most cost-effective option.",
        },
        {
          question: "Does a longer tenure mean I pay more interest?",
          answer:
            "Yes. A longer loan tenure lowers your monthly EMI, making it more affordable month-to-month, but you pay significantly more in total interest. For example, a $500,000 loan at 8.5% costs about $230,000 in interest over 15 years but over $420,000 over 30 years. Always weigh monthly affordability against total cost when choosing a tenure.",
        },
        {
          question: "Is this EMI calculator accurate for all loan types?",
          answer:
            "This calculator is accurate for any fixed-rate loan with equal monthly installments, including home loans, car loans, personal loans, and education loans. It does not account for variable interest rates, processing fees, or insurance premiums, which may affect your actual repayment amount.",
        },
      ]}
      relatedTools={[
        { name: "Loan Calculator", href: "/tools/loan-calculator" },
        { name: "Mortgage Calculator", href: "/tools/mortgage-calculator" },
        { name: "Compound Interest Calculator", href: "/tools/compound-interest-calculator" },
        { name: "Auto Loan Calculator", href: "/tools/auto-loan-calculator" },
      ]}
      guide={
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">How to Use the EMI Calculator</h2>
            <p className="text-zinc-400 leading-relaxed">
              Enter your loan amount, annual interest rate, and loan tenure to instantly see your monthly EMI, total interest payable, and total payment amount. The donut chart shows the principal-to-interest ratio, while the bar chart visualizes how your payments are split year by year.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">Prepayment Strategy</h2>
            <p className="text-zinc-400 leading-relaxed">
              Switch to the Prepayment tab to model extra monthly payments or a one-time lump sum. The calculator shows how many months you save and how much interest you avoid. Even an extra $200/month on a $500,000 loan at 8.5% over 20 years can save you years of payments and tens of thousands in interest.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">Comparing Loan Offers</h2>
            <p className="text-zinc-400 leading-relaxed">
              Use the Compare tab to evaluate up to three loan offers. Enter different amounts, rates, and tenures to see a side-by-side breakdown. The lowest EMI is not always the best deal — pay attention to total interest and total payment to find the most cost-effective loan.
            </p>
          </section>
        </div>
      }
    >
      {/* Tab Bar */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab("emi")} className={tabCls(tab === "emi")}>EMI Calculator</button>
        <button onClick={() => setTab("prepay")} className={tabCls(tab === "prepay")}>Prepayment</button>
        <button onClick={() => setTab("compare")} className={tabCls(tab === "compare")}>Compare Loans</button>
      </div>

      {/* ======================== EMI TAB ======================== */}
      {tab === "emi" && (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Loan Amount ($)</label>
                <input type="number" value={amount} onChange={e => setAmount(+e.target.value)} className={inputCls} min={0} step={1000} />
              </div>
              <div>
                <label className={labelCls}>Annual Interest Rate (%)</label>
                <input type="number" value={rate} onChange={e => setRate(+e.target.value)} className={inputCls} min={0} max={50} step={0.1} />
              </div>
              <div>
                <label className={labelCls}>Loan Tenure</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={tenure}
                    onChange={e => setTenure(+e.target.value)}
                    className={inputCls}
                    min={1}
                    max={tenureUnit === "years" ? 50 : 600}
                  />
                  <select
                    value={tenureUnit}
                    onChange={e => setTenureUnit(e.target.value as "years" | "months")}
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 text-sm"
                  >
                    <option value="years">Years</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[5, 10, 15, 20, 25, 30].map(y => (
                  <button
                    key={y}
                    onClick={() => { setTenure(y); setTenureUnit("years"); }}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${tenure === y && tenureUnit === "years" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
                  >
                    {y}yr
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <div className={cardCls}>
                <p className="text-sm text-zinc-400 mb-1">Monthly EMI</p>
                <p className="text-4xl font-bold text-blue-400">{fmtC(result.emi)}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Principal</p>
                  <p className="text-sm font-semibold text-zinc-100">{fmtC(amount)}</p>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Total Interest</p>
                  <p className="text-sm font-semibold text-yellow-400">{fmtC(result.totalInterest)}</p>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Total Payment</p>
                  <p className="text-sm font-semibold text-zinc-100">{fmtC(result.totalPaid)}</p>
                </div>
              </div>

              {/* Donut Chart */}
              <div className={cardCls}>
                <p className="text-xs text-zinc-500 mb-2">Principal vs Interest</p>
                <DonutChart principal={amount} interest={result.totalInterest} />
                <div className="flex justify-center gap-6 mt-3 text-xs text-zinc-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Principal</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" />Interest</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stacked Bar Chart */}
          {result.yearSummaries.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-medium text-zinc-300 mb-3">Principal vs Interest Over Time</h3>
              <div className={`${cardCls} p-4`}>
                <StackedBarChart yearSummaries={result.yearSummaries} />
                <div className="flex justify-center gap-6 mt-3 text-xs text-zinc-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Principal</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" />Interest</span>
                </div>
              </div>
            </div>
          )}

          {/* Year-by-Year Amortization */}
          {result.yearSummaries.length > 0 && (
            <details className="mt-8">
              <summary className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">
                Year-by-Year Amortization Schedule ({result.yearSummaries.length} years)
              </summary>
              <div className="mt-4 max-h-96 overflow-y-auto border border-zinc-700 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-zinc-800">
                    <tr className="text-zinc-400 text-left">
                      <th className="px-3 py-2">Year</th>
                      <th className="px-3 py-2">Principal Paid</th>
                      <th className="px-3 py-2">Interest Paid</th>
                      <th className="px-3 py-2">Total Paid</th>
                      <th className="px-3 py-2">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.yearSummaries.map(row => (
                      <tr key={row.year} className="border-t border-zinc-800 text-zinc-300">
                        <td className="px-3 py-1.5">{row.year}</td>
                        <td className="px-3 py-1.5">{fmtC(row.principalPaid)}</td>
                        <td className="px-3 py-1.5">{fmtC(row.interestPaid)}</td>
                        <td className="px-3 py-1.5">{fmtC(row.totalPaid)}</td>
                        <td className="px-3 py-1.5">{fmtC(row.endingBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}

          {/* Month-by-Month Schedule */}
          {result.rows.length > 0 && (
            <details className="mt-4">
              <summary className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">
                Month-by-Month Payment Schedule ({result.rows.length} payments)
              </summary>
              <div className="mt-4 max-h-96 overflow-y-auto border border-zinc-700 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-zinc-800">
                    <tr className="text-zinc-400 text-left">
                      <th className="px-3 py-2">Month</th>
                      <th className="px-3 py-2">EMI</th>
                      <th className="px-3 py-2">Principal</th>
                      <th className="px-3 py-2">Interest</th>
                      <th className="px-3 py-2">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map(row => (
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
        </>
      )}

      {/* ======================== PREPAYMENT TAB ======================== */}
      {tab === "prepay" && (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Loan Inputs */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-300">Loan Details</h3>
              <div>
                <label className={labelCls}>Loan Amount ($)</label>
                <input type="number" value={amount} onChange={e => setAmount(+e.target.value)} className={inputCls} min={0} step={1000} />
              </div>
              <div>
                <label className={labelCls}>Annual Interest Rate (%)</label>
                <input type="number" value={rate} onChange={e => setRate(+e.target.value)} className={inputCls} min={0} max={50} step={0.1} />
              </div>
              <div>
                <label className={labelCls}>Loan Tenure</label>
                <div className="flex gap-2">
                  <input type="number" value={tenure} onChange={e => setTenure(+e.target.value)} className={inputCls} min={1} />
                  <select value={tenureUnit} onChange={e => setTenureUnit(e.target.value as "years" | "months")} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 text-sm">
                    <option value="years">Years</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>

              <hr className="border-zinc-700" />
              <h3 className="text-sm font-medium text-zinc-300">Prepayment Options</h3>
              <div>
                <label className={labelCls}>Extra Monthly Payment ($)</label>
                <input type="number" value={extraMonthly} onChange={e => setExtraMonthly(+e.target.value)} className={inputCls} min={0} step={100} />
              </div>
              <div>
                <label className={labelCls}>Lump Sum Prepayment ($)</label>
                <input type="number" value={lumpSum} onChange={e => setLumpSum(+e.target.value)} className={inputCls} min={0} step={1000} />
              </div>
              {lumpSum > 0 && (
                <div>
                  <label className={labelCls}>Lump Sum at Month #</label>
                  <input type="number" value={lumpSumMonth} onChange={e => setLumpSumMonth(+e.target.value)} className={inputCls} min={1} max={totalMonths} />
                </div>
              )}
            </div>

            {/* Prepayment Results */}
            <div className="space-y-4">
              <div className={cardCls}>
                <p className="text-sm text-zinc-400 mb-1">Original EMI</p>
                <p className="text-2xl font-bold text-zinc-300">{fmtC(result.emi)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Original Interest</p>
                  <p className="text-sm font-semibold text-zinc-400">{fmtC(result.totalInterest)}</p>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">New Total Interest</p>
                  <p className="text-sm font-semibold text-green-400">{fmtC(prepayResult.totalInterest)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <p className="text-xs text-green-400 mb-1">Interest Saved</p>
                  <p className="text-2xl font-bold text-green-400">{fmtC(prepayResult.interestSaved)}</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <p className="text-xs text-green-400 mb-1">Months Saved</p>
                  <p className="text-2xl font-bold text-green-400">{prepayResult.monthsSaved}</p>
                  <p className="text-xs text-green-400/70 mt-0.5">
                    {Math.floor(prepayResult.monthsSaved / 12)}y {prepayResult.monthsSaved % 12}m
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Original Tenure</p>
                  <p className="text-sm font-semibold text-zinc-300">{totalMonths} months</p>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">New Tenure</p>
                  <p className="text-sm font-semibold text-blue-400">{prepayResult.actualMonths} months</p>
                </div>
              </div>
            </div>
          </div>

          {/* Prepayment Amortization */}
          {prepayResult.yearSummaries.length > 0 && (
            <>
              <div className="mt-8">
                <h3 className="text-sm font-medium text-zinc-300 mb-3">Revised Payment Breakdown Over Time</h3>
                <div className={`${cardCls} p-4`}>
                  <StackedBarChart yearSummaries={prepayResult.yearSummaries} />
                  <div className="flex justify-center gap-6 mt-3 text-xs text-zinc-400">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Principal</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" />Interest</span>
                  </div>
                </div>
              </div>
              <details className="mt-4">
                <summary className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">
                  Revised Year-by-Year Schedule ({prepayResult.yearSummaries.length} years)
                </summary>
                <div className="mt-4 max-h-96 overflow-y-auto border border-zinc-700 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-zinc-800">
                      <tr className="text-zinc-400 text-left">
                        <th className="px-3 py-2">Year</th>
                        <th className="px-3 py-2">Principal Paid</th>
                        <th className="px-3 py-2">Interest Paid</th>
                        <th className="px-3 py-2">Total Paid</th>
                        <th className="px-3 py-2">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prepayResult.yearSummaries.map(row => (
                        <tr key={row.year} className="border-t border-zinc-800 text-zinc-300">
                          <td className="px-3 py-1.5">{row.year}</td>
                          <td className="px-3 py-1.5">{fmtC(row.principalPaid)}</td>
                          <td className="px-3 py-1.5">{fmtC(row.interestPaid)}</td>
                          <td className="px-3 py-1.5">{fmtC(row.totalPaid)}</td>
                          <td className="px-3 py-1.5">{fmtC(row.endingBalance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </>
          )}
        </>
      )}

      {/* ======================== COMPARE TAB ======================== */}
      {tab === "compare" && (
        <>
          <div className="space-y-4">
            {offers.map((offer, idx) => (
              <div key={offer.id} className={`${cardCls} space-y-3`}>
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={offer.name}
                    onChange={e => updateOffer(offer.id, "name", e.target.value)}
                    className="bg-transparent text-zinc-100 font-medium text-sm focus:outline-none border-b border-transparent focus:border-blue-500 pb-0.5"
                  />
                  {offers.length > 1 && (
                    <button onClick={() => removeOffer(offer.id)} className="text-zinc-500 hover:text-red-400 text-xs transition-colors">
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>Amount ($)</label>
                    <input type="number" value={offer.amount} onChange={e => updateOffer(offer.id, "amount", +e.target.value)} className={inputCls} min={0} step={1000} />
                  </div>
                  <div>
                    <label className={labelCls}>Rate (%)</label>
                    <input type="number" value={offer.rate} onChange={e => updateOffer(offer.id, "rate", +e.target.value)} className={inputCls} min={0} max={50} step={0.1} />
                  </div>
                  <div>
                    <label className={labelCls}>Tenure (months)</label>
                    <input type="number" value={offer.tenureMonths} onChange={e => updateOffer(offer.id, "tenureMonths", +e.target.value)} className={inputCls} min={1} max={600} />
                  </div>
                </div>
              </div>
            ))}
            {offers.length < 3 && (
              <button onClick={addOffer} className="w-full py-2 border border-dashed border-zinc-700 rounded-xl text-sm text-zinc-500 hover:text-blue-400 hover:border-blue-500/40 transition-colors">
                + Add Loan Offer
              </button>
            )}
          </div>

          {/* Comparison Results */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-zinc-300 mb-4">Side-by-Side Comparison</h3>
            <div className="overflow-x-auto border border-zinc-700 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-zinc-800">
                  <tr className="text-zinc-400 text-left">
                    <th className="px-4 py-3">Metric</th>
                    {comparisonResults.map(o => (
                      <th key={o.id} className="px-4 py-3">{o.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-zinc-300">
                  <tr className="border-t border-zinc-800">
                    <td className="px-4 py-2 text-zinc-500">Loan Amount</td>
                    {comparisonResults.map(o => (
                      <td key={o.id} className="px-4 py-2">{fmtC(o.amount)}</td>
                    ))}
                  </tr>
                  <tr className="border-t border-zinc-800">
                    <td className="px-4 py-2 text-zinc-500">Interest Rate</td>
                    {comparisonResults.map(o => (
                      <td key={o.id} className="px-4 py-2">{o.rate}%</td>
                    ))}
                  </tr>
                  <tr className="border-t border-zinc-800">
                    <td className="px-4 py-2 text-zinc-500">Tenure</td>
                    {comparisonResults.map(o => (
                      <td key={o.id} className="px-4 py-2">{o.tenureMonths} months ({(o.tenureMonths / 12).toFixed(1)}yr)</td>
                    ))}
                  </tr>
                  <tr className="border-t border-zinc-800">
                    <td className="px-4 py-2 text-zinc-500 font-medium">Monthly EMI</td>
                    {comparisonResults.map(o => {
                      const isLowest = o.emi === Math.min(...comparisonResults.map(x => x.emi));
                      return (
                        <td key={o.id} className={`px-4 py-2 font-semibold ${isLowest ? "text-green-400" : "text-zinc-100"}`}>
                          {fmtC(o.emi)}
                          {isLowest && <span className="text-[10px] ml-1 text-green-500">LOWEST</span>}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-t border-zinc-800">
                    <td className="px-4 py-2 text-zinc-500 font-medium">Total Interest</td>
                    {comparisonResults.map(o => {
                      const isLowest = o.totalInterest === Math.min(...comparisonResults.map(x => x.totalInterest));
                      return (
                        <td key={o.id} className={`px-4 py-2 font-semibold ${isLowest ? "text-green-400" : "text-yellow-400"}`}>
                          {fmtC(o.totalInterest)}
                          {isLowest && <span className="text-[10px] ml-1 text-green-500">LOWEST</span>}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-t border-zinc-800">
                    <td className="px-4 py-2 text-zinc-500 font-medium">Total Payment</td>
                    {comparisonResults.map(o => {
                      const isLowest = o.totalPaid === Math.min(...comparisonResults.map(x => x.totalPaid));
                      return (
                        <td key={o.id} className={`px-4 py-2 font-semibold ${isLowest ? "text-green-400" : "text-zinc-100"}`}>
                          {fmtC(o.totalPaid)}
                          {isLowest && <span className="text-[10px] ml-1 text-green-500">LOWEST</span>}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </ToolLayout>
  );
}
