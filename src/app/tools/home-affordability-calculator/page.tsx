"use client";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtC(n: number) {
  return "$" + fmt(n);
}
function fmtK(n: number) {
  if (n >= 1000000) return "$" + (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return "$" + (n / 1000).toFixed(0) + "K";
  return "$" + n.toFixed(0);
}

type DTIProfile = { label: string; frontEnd: number; backEnd: number; description: string };

const dtiProfiles: DTIProfile[] = [
  { label: "Conservative", frontEnd: 0.28, backEnd: 0.36, description: "28/36 rule — lower risk, more financial flexibility" },
  { label: "Moderate", frontEnd: 0.31, backEnd: 0.43, description: "31/43 rule — FHA guideline, balanced approach" },
  { label: "Aggressive", frontEnd: 0.35, backEnd: 0.50, description: "35/50 rule — maximum buying power, tighter budget" },
];

const chartColors = [
  "#3b82f6", // blue - P&I
  "#22c55e", // green - Property Tax
  "#eab308", // yellow - Insurance
  "#a855f7", // purple - HOA
  "#f87171", // red - PMI
];
const chartLabels = ["Principal & Interest", "Property Tax", "Insurance", "HOA", "PMI"];

export default function Page() {
  const [annualIncome, setAnnualIncome] = useState(85000);
  const [monthlyDebt, setMonthlyDebt] = useState(400);
  const [downPayment, setDownPayment] = useState(60000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState<15 | 30>(30);
  const [propertyTaxRate, setPropertyTaxRate] = useState(1.2);
  const [annualInsurance, setAnnualInsurance] = useState(1800);
  const [monthlyHOA, setMonthlyHOA] = useState(0);
  const [dtiIndex, setDtiIndex] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const profile = dtiProfiles[dtiIndex];

  const result = useMemo(() => {
    const monthlyGross = annualIncome / 12;
    if (monthlyGross <= 0 || interestRate <= 0) return null;

    const monthlyR = interestRate / 100 / 12;
    const n = loanTerm * 12;

    // Max housing payment from front-end ratio
    const maxHousingFrontEnd = monthlyGross * profile.frontEnd;

    // Max housing payment from back-end ratio (total debt limit minus existing debts)
    const maxHousingBackEnd = monthlyGross * profile.backEnd - monthlyDebt;

    // Use the more restrictive
    const maxHousingPayment = Math.max(0, Math.min(maxHousingFrontEnd, maxHousingBackEnd));

    // Subtract non-mortgage costs to find max P&I payment
    // We need to iterate because property tax depends on home price
    // Use binary search to find max home price
    let lo = 0;
    let hi = 5000000;
    let bestHomePrice = 0;

    for (let iter = 0; iter < 60; iter++) {
      const mid = (lo + hi) / 2;
      const loanAmount = mid - downPayment;
      if (loanAmount <= 0) {
        bestHomePrice = mid;
        lo = mid;
        continue;
      }

      const monthlyPI =
        monthlyR === 0
          ? loanAmount / n
          : (loanAmount * monthlyR * Math.pow(1 + monthlyR, n)) / (Math.pow(1 + monthlyR, n) - 1);

      const monthlyTax = (mid * (propertyTaxRate / 100)) / 12;
      const monthlyIns = annualInsurance / 12;
      const downPct = mid > 0 ? (downPayment / mid) * 100 : 0;
      const monthlyPMI = downPct < 20 ? (loanAmount * 0.005) / 12 : 0;
      const totalHousing = monthlyPI + monthlyTax + monthlyIns + monthlyHOA + monthlyPMI;

      if (totalHousing <= maxHousingPayment) {
        bestHomePrice = mid;
        lo = mid;
      } else {
        hi = mid;
      }
    }

    const homePrice = Math.floor(bestHomePrice / 100) * 100; // round down to nearest 100
    const loanAmount = Math.max(0, homePrice - downPayment);
    const downPct = homePrice > 0 ? (downPayment / homePrice) * 100 : 0;

    const monthlyPI =
      loanAmount <= 0
        ? 0
        : monthlyR === 0
          ? loanAmount / n
          : (loanAmount * monthlyR * Math.pow(1 + monthlyR, n)) / (Math.pow(1 + monthlyR, n) - 1);

    const monthlyTax = (homePrice * (propertyTaxRate / 100)) / 12;
    const monthlyIns = annualInsurance / 12;
    const monthlyPMI = downPct < 20 ? (loanAmount * 0.005) / 12 : 0;
    const totalMonthly = monthlyPI + monthlyTax + monthlyIns + monthlyHOA + monthlyPMI;
    const totalPaid = monthlyPI * n;
    const totalInterest = totalPaid - loanAmount;

    const monthlyGrossIncome = annualIncome / 12;
    const actualFrontEnd = monthlyGrossIncome > 0 ? totalMonthly / monthlyGrossIncome : 0;
    const actualBackEnd = monthlyGrossIncome > 0 ? (totalMonthly + monthlyDebt) / monthlyGrossIncome : 0;

    // Comfort score: 0 = very stretched, 100 = very comfortable
    // Based on how close the front-end ratio is to the max
    const ratioUsed = profile.frontEnd > 0 ? actualFrontEnd / profile.frontEnd : 1;
    const comfortScore = Math.max(0, Math.min(100, Math.round((1 - ratioUsed) * 100 + 50)));

    // 15 vs 30 comparison
    const calcForTerm = (t: number) => {
      const nt = t * 12;
      const piT =
        loanAmount <= 0
          ? 0
          : (loanAmount * monthlyR * Math.pow(1 + monthlyR, nt)) / (Math.pow(1 + monthlyR, nt) - 1);
      const totalT = piT + monthlyTax + monthlyIns + monthlyHOA + (downPct < 20 ? (loanAmount * 0.005) / 12 : 0);
      const totalIntT = piT * nt - loanAmount;
      return { term: t, monthlyPI: piT, totalMonthly: totalT, totalInterest: totalIntT, totalPaid: piT * nt };
    };

    const compare15 = calcForTerm(15);
    const compare30 = calcForTerm(30);

    return {
      homePrice,
      loanAmount,
      downPct,
      monthlyPI,
      monthlyTax,
      monthlyIns,
      monthlyHOA,
      monthlyPMI,
      totalMonthly,
      totalPaid,
      totalInterest,
      actualFrontEnd,
      actualBackEnd,
      comfortScore,
      maxHousingPayment,
      compare15,
      compare30,
      n,
    };
  }, [annualIncome, monthlyDebt, downPayment, interestRate, loanTerm, propertyTaxRate, annualInsurance, monthlyHOA, dtiIndex, profile]);

  // Draw donut chart
  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !result) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 220;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const outerR = 95;
    const innerR = 60;

    const values = [result.monthlyPI, result.monthlyTax, result.monthlyIns, result.monthlyHOA, result.monthlyPMI];
    const total = values.reduce((a, b) => a + b, 0);
    if (total <= 0) return;

    let startAngle = -Math.PI / 2;

    values.forEach((val, i) => {
      if (val <= 0) return;
      const sliceAngle = (val / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startAngle, startAngle + sliceAngle);
      ctx.arc(cx, cy, innerR, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = chartColors[i];
      ctx.fill();
      startAngle += sliceAngle;
    });

    // Center text
    ctx.fillStyle = "#f4f4f5";
    ctx.font = "bold 18px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(fmtK(result.totalMonthly), cx, cy - 8);
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillStyle = "#a1a1aa";
    ctx.fillText("/month", cx, cy + 12);
  }, [result]);

  useEffect(() => {
    drawChart();
  }, [drawChart]);

  const inputCls =
    "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  const getComfortLabel = (score: number) => {
    if (score >= 75) return { label: "Very Comfortable", color: "text-green-400" };
    if (score >= 55) return { label: "Comfortable", color: "text-emerald-400" };
    if (score >= 40) return { label: "Moderate", color: "text-yellow-400" };
    if (score >= 25) return { label: "Stretching", color: "text-orange-400" };
    return { label: "Very Tight", color: "text-red-400" };
  };

  const getInsight = () => {
    if (!result) return "";
    const tips: string[] = [];
    if (result.downPct < 20) {
      tips.push(
        `Your down payment is ${result.downPct.toFixed(1)}% of the home price, which means you'll pay PMI of ${fmtC(result.monthlyPMI)}/month. Increasing your down payment to 20% (${fmtC(result.homePrice * 0.2)}) would eliminate PMI and save you ${fmtC(result.monthlyPMI * 12)}/year.`
      );
    }
    if (result.actualFrontEnd > 0.30) {
      tips.push(
        `Your housing costs would consume ${(result.actualFrontEnd * 100).toFixed(1)}% of your gross income. Most financial advisors recommend keeping this under 28-30%. Consider looking at homes in a lower price range for more breathing room.`
      );
    } else {
      tips.push(
        `At ${(result.actualFrontEnd * 100).toFixed(1)}% of your gross income going to housing, you have a healthy budget with room for savings and unexpected expenses.`
      );
    }
    if (result.compare15.totalInterest < result.compare30.totalInterest && loanTerm === 30) {
      const savings = result.compare30.totalInterest - result.compare15.totalInterest;
      tips.push(
        `Switching to a 15-year mortgage would save you ${fmtC(savings)} in total interest, though your monthly payment would increase by ${fmtC(result.compare15.monthlyPI - result.compare30.monthlyPI)}.`
      );
    }
    return tips.join(" ");
  };

  return (
    <ToolLayout
      title="Home Affordability Calculator"
      description="Find out how much house you can afford based on your income, debts, down payment, and interest rate. See a full monthly payment breakdown with taxes, insurance, and PMI."
      slug="home-affordability-calculator"
      category="Finance"
      keywords={[
        "home affordability calculator",
        "how much house can i afford",
        "house affordability calculator",
        "mortgage affordability",
        "home buying calculator",
        "what can i afford house",
      ]}
      faqs={[
        {
          question: "How much house can I afford on my salary?",
          answer:
            "A common guideline is the 28/36 rule: spend no more than 28% of your gross monthly income on housing costs (mortgage, taxes, insurance) and no more than 36% on total debt payments. For example, on a $85,000 salary, your max monthly housing cost would be about $1,983. This calculator factors in your specific income, debts, down payment, and local costs to give you a personalized estimate.",
        },
        {
          question: "What is the 28/36 rule?",
          answer:
            "The 28/36 rule is a widely used guideline for determining how much you can afford to spend on housing. The '28' means your monthly housing costs (mortgage payment, property taxes, insurance, HOA) should not exceed 28% of your gross monthly income. The '36' means your total monthly debt payments (housing costs plus car loans, student loans, credit cards) should not exceed 36% of your gross monthly income. This is the conservative approach; FHA loans allow up to 31/43, and some lenders go higher.",
        },
        {
          question: "How much should I put down on a house?",
          answer:
            "The traditional recommendation is 20% down to avoid Private Mortgage Insurance (PMI). However, many buyers put down less — FHA loans require as little as 3.5%, and some conventional loans allow 3-5% down. A larger down payment means lower monthly payments, less interest over the life of the loan, and no PMI. Use this calculator to see how different down payment amounts affect your affordability.",
        },
        {
          question: "What is PMI and how do I avoid it?",
          answer:
            "Private Mortgage Insurance (PMI) is an extra monthly fee lenders charge when your down payment is less than 20% of the home price. It typically costs 0.3% to 1.5% of the loan amount annually. You can avoid PMI by putting at least 20% down, or you can request PMI removal once you've built 20% equity in your home. Some lenders offer lender-paid PMI with a slightly higher interest rate.",
        },
        {
          question: "How does interest rate affect how much house I can afford?",
          answer:
            "Interest rate has a significant impact on affordability. For every 1% increase in rate on a $300,000 loan, your monthly payment increases by roughly $175-200. A higher rate means more of your payment goes to interest, reducing your buying power. Even a 0.5% difference can change your affordable home price by $20,000-$30,000. Locking in a lower rate through rate shopping or buying points can substantially increase what you can afford.",
        },
        {
          question: "Should I get a 15-year or 30-year mortgage?",
          answer:
            "A 30-year mortgage has lower monthly payments, giving you more flexibility and a higher affordable home price. A 15-year mortgage has higher monthly payments but a significantly lower interest rate (typically 0.5-0.75% less) and saves you tens of thousands in total interest. Choose 15 years if you can comfortably afford the higher payment and want to build equity faster. Choose 30 years if you need lower payments or want to invest the difference elsewhere.",
        },
      ]}
      relatedTools={[
        { name: "Mortgage Calculator", href: "/tools/mortgage-calculator" },
        { name: "Mortgage Affordability Calculator", href: "/tools/mortgage-affordability-calculator" },
        { name: "Down Payment Calculator", href: "/tools/down-payment-calculator" },
        { name: "Debt to Income Calculator", href: "/tools/debt-to-income-calculator" },
      ]}
      guide={
        <>
          <h2>How to Determine Your Home Budget</h2>
          <p>
            Figuring out how much house you can afford involves more than just looking at the sticker price. Start with
            your gross annual income, then factor in existing monthly debts like car payments, student loans, and credit
            card minimums. Lenders use debt-to-income (DTI) ratios to decide how much they will lend you, but the amount
            a bank approves is not necessarily what you should spend. A comfortable home budget leaves room for
            savings, emergencies, and lifestyle expenses beyond your mortgage payment.
          </p>
          <h2>The DTI Rule Explained</h2>
          <p>
            The debt-to-income ratio comes in two flavors. The front-end ratio measures what percentage of your gross
            monthly income goes toward housing costs alone — your mortgage principal and interest, property taxes,
            homeowners insurance, HOA fees, and PMI. The back-end ratio adds all other recurring debts on top of that.
            The conservative 28/36 rule says housing should stay under 28% and total debt under 36%. FHA guidelines
            allow 31/43, and some conventional lenders stretch to 35/50 for strong borrowers. This calculator lets you
            toggle between these profiles so you can see the range of what you might qualify for versus what is truly
            comfortable.
          </p>
          <h2>Hidden Costs of Homeownership</h2>
          <p>
            Beyond the mortgage payment, homeownership comes with costs that catch many first-time buyers off guard.
            Property taxes typically run 0.5% to 2.5% of your home's value annually and can increase over time.
            Homeowners insurance is required by lenders and varies by location and coverage. If your down payment is
            under 20%, you will pay PMI until you build sufficient equity. HOA fees can add hundreds per month in
            condos and planned communities. And do not forget maintenance — a common rule of thumb is to budget 1% of
            your home's value per year for repairs and upkeep. This calculator includes taxes, insurance, HOA, and PMI
            so you see the full picture before you start house hunting.
          </p>
        </>
      }
    >
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Inputs Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Income & Debts</h3>
            <div>
              <label className={labelCls}>Annual Gross Income ($)</label>
              <input
                type="number"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(+e.target.value)}
                className={inputCls}
                min={0}
                step={1000}
              />
              <p className="text-xs text-zinc-500 mt-1">{fmtC(annualIncome / 12)}/month gross</p>
            </div>
            <div>
              <label className={labelCls}>Monthly Debt Payments ($)</label>
              <input
                type="number"
                value={monthlyDebt}
                onChange={(e) => setMonthlyDebt(+e.target.value)}
                className={inputCls}
                min={0}
                step={50}
              />
              <p className="text-xs text-zinc-500 mt-1">Car, student loans, credit cards, etc.</p>
            </div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Loan Details</h3>
            <div>
              <label className={labelCls}>Down Payment ($)</label>
              <input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(+e.target.value)}
                className={inputCls}
                min={0}
                step={1000}
              />
              {result && (
                <p className="text-xs text-zinc-500 mt-1">
                  {result.downPct.toFixed(1)}% of home price
                  {result.downPct < 20 && (
                    <span className="text-amber-400 ml-1">- PMI required</span>
                  )}
                </p>
              )}
            </div>
            <div>
              <label className={labelCls}>Interest Rate (%)</label>
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(+e.target.value)}
                className={inputCls}
                min={0}
                max={20}
                step={0.125}
              />
            </div>
            <div>
              <label className={labelCls}>Loan Term</label>
              <div className="flex gap-2">
                {([15, 30] as const).map((y) => (
                  <button
                    key={y}
                    onClick={() => setLoanTerm(y)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      loanTerm === y
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    }`}
                  >
                    {y} years
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Additional Costs</h3>
            <div>
              <label className={labelCls}>Property Tax Rate (%)</label>
              <input
                type="number"
                value={propertyTaxRate}
                onChange={(e) => setPropertyTaxRate(+e.target.value)}
                className={inputCls}
                min={0}
                max={10}
                step={0.1}
              />
            </div>
            <div>
              <label className={labelCls}>Annual Home Insurance ($)</label>
              <input
                type="number"
                value={annualInsurance}
                onChange={(e) => setAnnualInsurance(+e.target.value)}
                className={inputCls}
                min={0}
                step={100}
              />
            </div>
            <div>
              <label className={labelCls}>Monthly HOA ($)</label>
              <input
                type="number"
                value={monthlyHOA}
                onChange={(e) => setMonthlyHOA(+e.target.value)}
                className={inputCls}
                min={0}
                step={25}
              />
            </div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">DTI Preference</h3>
            {dtiProfiles.map((p, i) => (
              <button
                key={p.label}
                onClick={() => setDtiIndex(i)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                  dtiIndex === i
                    ? "bg-blue-600/20 border-blue-500 text-blue-300"
                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                <span className="font-medium text-sm">{p.label}</span>
                <p className="text-xs mt-0.5 opacity-80">{p.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Results Column */}
        {result && (
          <div className="lg:col-span-3 space-y-5">
            {/* Hero Result */}
            <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/10 border border-blue-500/30 rounded-2xl p-6 text-center">
              <p className="text-sm text-blue-300 mb-1">You can afford a home up to</p>
              <p className="text-5xl sm:text-6xl font-bold text-zinc-100 tracking-tight">
                {fmtK(result.homePrice)}
              </p>
              <p className="text-sm text-zinc-400 mt-2">
                with {fmtK(downPayment)} down ({result.downPct.toFixed(1)}%) &bull; {loanTerm}-year {profile.label.toLowerCase()} estimate
              </p>
            </div>

            {/* Chart + Breakdown */}
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-zinc-300 mb-4">Monthly Payment Breakdown</h3>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <canvas ref={canvasRef} className="shrink-0" />
                <div className="flex-1 space-y-2 w-full">
                  {[
                    { label: "Principal & Interest", value: result.monthlyPI, color: chartColors[0] },
                    { label: "Property Tax", value: result.monthlyTax, color: chartColors[1] },
                    { label: "Insurance", value: result.monthlyIns, color: chartColors[2] },
                    ...(result.monthlyHOA > 0
                      ? [{ label: "HOA", value: result.monthlyHOA, color: chartColors[3] }]
                      : []),
                    ...(result.monthlyPMI > 0
                      ? [{ label: "PMI", value: result.monthlyPMI, color: chartColors[4] }]
                      : []),
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-zinc-300">{item.label}</span>
                      </div>
                      <span className="text-sm font-medium text-zinc-100">{fmtC(item.value)}</span>
                    </div>
                  ))}
                  <div className="border-t border-zinc-600 pt-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-200">Total Monthly</span>
                    <span className="text-sm font-bold text-blue-400">{fmtC(result.totalMonthly)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* DTI Ratios */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                <p className="text-xs text-zinc-500 mb-1">Front-End DTI (Housing / Income)</p>
                <p className="text-2xl font-bold text-zinc-100">
                  {(result.actualFrontEnd * 100).toFixed(1)}%
                </p>
                <div className="mt-2 h-2 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (result.actualFrontEnd / 0.5) * 100)}%`,
                      backgroundColor:
                        result.actualFrontEnd <= 0.28
                          ? "#22c55e"
                          : result.actualFrontEnd <= 0.35
                            ? "#eab308"
                            : "#ef4444",
                    }}
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Target: {(profile.frontEnd * 100).toFixed(0)}% max
                </p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                <p className="text-xs text-zinc-500 mb-1">Back-End DTI (Total Debt / Income)</p>
                <p className="text-2xl font-bold text-zinc-100">
                  {(result.actualBackEnd * 100).toFixed(1)}%
                </p>
                <div className="mt-2 h-2 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (result.actualBackEnd / 0.6) * 100)}%`,
                      backgroundColor:
                        result.actualBackEnd <= 0.36
                          ? "#22c55e"
                          : result.actualBackEnd <= 0.43
                            ? "#eab308"
                            : "#ef4444",
                    }}
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Target: {(profile.backEnd * 100).toFixed(0)}% max
                </p>
              </div>
            </div>

            {/* Comfort Zone Meter */}
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-zinc-300">Comfort Zone Meter</h3>
                <span className={`text-sm font-semibold ${getComfortLabel(result.comfortScore).color}`}>
                  {getComfortLabel(result.comfortScore).label}
                </span>
              </div>
              <div className="relative h-6 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e, #22c55e)",
                  }}
                />
                <div
                  className="absolute top-0 h-full w-1 bg-white rounded-full shadow-lg transition-all"
                  style={{ left: `${Math.min(98, Math.max(2, result.comfortScore))}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-zinc-500 mt-1">
                <span>Very Tight</span>
                <span>Stretching</span>
                <span>Moderate</span>
                <span>Comfortable</span>
              </div>
            </div>

            {/* Loan Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Loan Amount</p>
                <p className="text-lg font-semibold text-zinc-100">{fmtK(result.loanAmount)}</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Total Interest ({loanTerm}yr)</p>
                <p className="text-lg font-semibold text-zinc-100">{fmtK(result.totalInterest)}</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Total Cost ({loanTerm}yr)</p>
                <p className="text-lg font-semibold text-zinc-100">{fmtK(result.totalPaid + downPayment)}</p>
              </div>
            </div>

            {/* 15 vs 30 Comparison */}
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-zinc-300 mb-4">15-Year vs 30-Year Comparison</h3>
              <div className="grid grid-cols-3 text-sm">
                <div />
                <div className={`text-center font-semibold pb-2 ${loanTerm === 15 ? "text-blue-400" : "text-zinc-300"}`}>
                  15-Year
                </div>
                <div className={`text-center font-semibold pb-2 ${loanTerm === 30 ? "text-blue-400" : "text-zinc-300"}`}>
                  30-Year
                </div>

                <div className="text-zinc-500 py-2 border-t border-zinc-700">Monthly P&I</div>
                <div className="text-center text-zinc-100 py-2 border-t border-zinc-700">
                  {fmtC(result.compare15.monthlyPI)}
                </div>
                <div className="text-center text-zinc-100 py-2 border-t border-zinc-700">
                  {fmtC(result.compare30.monthlyPI)}
                </div>

                <div className="text-zinc-500 py-2 border-t border-zinc-700">Total Monthly</div>
                <div className="text-center text-zinc-100 py-2 border-t border-zinc-700">
                  {fmtC(result.compare15.totalMonthly)}
                </div>
                <div className="text-center text-zinc-100 py-2 border-t border-zinc-700">
                  {fmtC(result.compare30.totalMonthly)}
                </div>

                <div className="text-zinc-500 py-2 border-t border-zinc-700">Total Interest</div>
                <div className="text-center text-zinc-100 py-2 border-t border-zinc-700">
                  {fmtK(result.compare15.totalInterest)}
                </div>
                <div className="text-center text-zinc-100 py-2 border-t border-zinc-700">
                  {fmtK(result.compare30.totalInterest)}
                </div>

                <div className="text-zinc-500 py-2 border-t border-zinc-700">Total Paid</div>
                <div className="text-center text-zinc-100 py-2 border-t border-zinc-700">
                  {fmtK(result.compare15.totalPaid)}
                </div>
                <div className="text-center text-zinc-100 py-2 border-t border-zinc-700">
                  {fmtK(result.compare30.totalPaid)}
                </div>

                <div className="text-zinc-500 py-2 border-t border-zinc-700">Interest Savings</div>
                <div className="text-center text-green-400 font-semibold py-2 border-t border-zinc-700">
                  {result.compare15.totalInterest < result.compare30.totalInterest
                    ? fmtK(result.compare30.totalInterest - result.compare15.totalInterest)
                    : "-"}
                </div>
                <div className="text-center text-zinc-500 py-2 border-t border-zinc-700">-</div>
              </div>
            </div>

            {/* Insight Callout */}
            {getInsight() && (
              <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-5">
                <div className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-300 text-sm font-bold">
                    i
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-blue-300 mb-1">Personalized Insight</h3>
                    <p className="text-sm text-zinc-300 leading-relaxed">{getInsight()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
