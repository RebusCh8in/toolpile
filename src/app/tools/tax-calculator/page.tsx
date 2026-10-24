"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmt(n: number): string {
  if (n < 0) return "-" + fmt(-n);
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// 2026 federal brackets
const fedBrackets = {
  single: [
    { min: 0, max: 11925, rate: 10 },
    { min: 11925, max: 48475, rate: 12 },
    { min: 48475, max: 103350, rate: 22 },
    { min: 103350, max: 197300, rate: 24 },
    { min: 197300, max: 250525, rate: 32 },
    { min: 250525, max: 626350, rate: 35 },
    { min: 626350, max: Infinity, rate: 37 },
  ],
  married: [
    { min: 0, max: 23850, rate: 10 },
    { min: 23850, max: 96950, rate: 12 },
    { min: 96950, max: 206700, rate: 22 },
    { min: 206700, max: 394600, rate: 24 },
    { min: 394600, max: 501050, rate: 32 },
    { min: 501050, max: 751600, rate: 35 },
    { min: 751600, max: Infinity, rate: 37 },
  ],
  hoh: [
    { min: 0, max: 17000, rate: 10 },
    { min: 17000, max: 64850, rate: 12 },
    { min: 64850, max: 103350, rate: 22 },
    { min: 103350, max: 197300, rate: 24 },
    { min: 197300, max: 250500, rate: 32 },
    { min: 250500, max: 626350, rate: 35 },
    { min: 626350, max: Infinity, rate: 37 },
  ],
};

const stdDeduction = { single: 15700, married: 31400, hoh: 22500 };

// FICA constants (2026)
const SS_RATE = 0.062;
const SS_CAP = 176100;
const MEDICARE_RATE = 0.0145;
const MEDICARE_ADDITIONAL_RATE = 0.009;
const MEDICARE_ADDITIONAL_THRESHOLD = 200000;

// State tax data — simplified effective rates for 2026
type StateInfo = { name: string; rate: number; type: "none" | "flat" | "progressive" };
const states: Record<string, StateInfo> = {
  AL: { name: "Alabama", rate: 4.0, type: "progressive" },
  AK: { name: "Alaska", rate: 0, type: "none" },
  AZ: { name: "Arizona", rate: 2.5, type: "flat" },
  AR: { name: "Arkansas", rate: 3.9, type: "progressive" },
  CA: { name: "California", rate: 7.5, type: "progressive" },
  CO: { name: "Colorado", rate: 4.4, type: "flat" },
  CT: { name: "Connecticut", rate: 5.5, type: "progressive" },
  DE: { name: "Delaware", rate: 5.5, type: "progressive" },
  FL: { name: "Florida", rate: 0, type: "none" },
  GA: { name: "Georgia", rate: 5.39, type: "progressive" },
  HI: { name: "Hawaii", rate: 7.2, type: "progressive" },
  ID: { name: "Idaho", rate: 5.695, type: "flat" },
  IL: { name: "Illinois", rate: 4.95, type: "flat" },
  IN: { name: "Indiana", rate: 3.05, type: "flat" },
  IA: { name: "Iowa", rate: 3.8, type: "flat" },
  KS: { name: "Kansas", rate: 4.7, type: "progressive" },
  KY: { name: "Kentucky", rate: 4.0, type: "flat" },
  LA: { name: "Louisiana", rate: 3.0, type: "flat" },
  ME: { name: "Maine", rate: 5.8, type: "progressive" },
  MD: { name: "Maryland", rate: 4.75, type: "progressive" },
  MA: { name: "Massachusetts", rate: 5.0, type: "flat" },
  MI: { name: "Michigan", rate: 4.25, type: "flat" },
  MN: { name: "Minnesota", rate: 6.8, type: "progressive" },
  MS: { name: "Mississippi", rate: 4.7, type: "flat" },
  MO: { name: "Missouri", rate: 4.7, type: "progressive" },
  MT: { name: "Montana", rate: 5.9, type: "progressive" },
  NE: { name: "Nebraska", rate: 5.2, type: "progressive" },
  NV: { name: "Nevada", rate: 0, type: "none" },
  NH: { name: "New Hampshire", rate: 0, type: "none" },
  NJ: { name: "New Jersey", rate: 5.5, type: "progressive" },
  NM: { name: "New Mexico", rate: 4.7, type: "progressive" },
  NY: { name: "New York", rate: 6.0, type: "progressive" },
  NC: { name: "North Carolina", rate: 4.5, type: "flat" },
  ND: { name: "North Dakota", rate: 1.95, type: "progressive" },
  OH: { name: "Ohio", rate: 3.5, type: "progressive" },
  OK: { name: "Oklahoma", rate: 4.25, type: "progressive" },
  OR: { name: "Oregon", rate: 8.0, type: "progressive" },
  PA: { name: "Pennsylvania", rate: 3.07, type: "flat" },
  RI: { name: "Rhode Island", rate: 4.75, type: "progressive" },
  SC: { name: "South Carolina", rate: 6.2, type: "progressive" },
  SD: { name: "South Dakota", rate: 0, type: "none" },
  TN: { name: "Tennessee", rate: 0, type: "none" },
  TX: { name: "Texas", rate: 0, type: "none" },
  UT: { name: "Utah", rate: 4.65, type: "flat" },
  VT: { name: "Vermont", rate: 6.0, type: "progressive" },
  VA: { name: "Virginia", rate: 5.0, type: "progressive" },
  WA: { name: "Washington", rate: 0, type: "none" },
  WV: { name: "West Virginia", rate: 5.12, type: "progressive" },
  WI: { name: "Wisconsin", rate: 5.3, type: "progressive" },
  WY: { name: "Wyoming", rate: 0, type: "none" },
};

const statesSorted = Object.entries(states).sort((a, b) => a[1].name.localeCompare(b[1].name));

function calcFedTax(taxable: number, filing: "single" | "married" | "hoh") {
  const b = fedBrackets[filing];
  let tax = 0;
  const breakdown: { rate: number; amount: number; tax: number }[] = [];
  for (const br of b) {
    if (taxable <= br.min) break;
    const amt = Math.min(taxable, br.max) - br.min;
    const t = amt * (br.rate / 100);
    tax += t;
    breakdown.push({ rate: br.rate, amount: amt, tax: t });
  }
  const marginal = b.find(br => taxable <= br.max)?.rate || 37;
  return { tax, breakdown, marginal };
}

function calcFICA(income: number) {
  const ss = Math.min(income, SS_CAP) * SS_RATE;
  let medicare = income * MEDICARE_RATE;
  if (income > MEDICARE_ADDITIONAL_THRESHOLD) {
    medicare += (income - MEDICARE_ADDITIONAL_THRESHOLD) * MEDICARE_ADDITIONAL_RATE;
  }
  return { ss, medicare, total: ss + medicare };
}

function calcStateTax(income: number, stateCode: string) {
  const s = states[stateCode];
  if (!s || s.rate === 0) return 0;
  return income * (s.rate / 100);
}

// Donut chart component
function DonutChart({ slices, size = 220 }: { slices: { label: string; value: number; color: string }[]; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const total = slices.reduce((a, s) => a + s.value, 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || total === 0) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const outerR = size / 2 - 4;
    const innerR = outerR * 0.6;

    let startAngle = -Math.PI / 2;
    for (const slice of slices) {
      if (slice.value <= 0) continue;
      const sweep = (slice.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startAngle, startAngle + sweep);
      ctx.arc(cx, cy, innerR, startAngle + sweep, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();
      startAngle += sweep;
    }

    // Center text
    ctx.fillStyle = "#1A1815";
    ctx.font = "bold 18px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const taxTotal = slices.filter(s => s.label !== "Take-Home").reduce((a, s) => a + s.value, 0);
    const pct = total > 0 ? ((taxTotal / total) * 100).toFixed(1) : "0";
    ctx.fillText(`${pct}%`, cx, cy - 8);
    ctx.font = "11px system-ui";
    ctx.fillStyle = "#78736B";
    ctx.fillText("Total Tax Rate", cx, cy + 12);
  }, [slices, total, size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
}

export default function TaxCalculator() {
  const [income, setIncome] = useState(85000);
  const [filing, setFiling] = useState<"single" | "married" | "hoh">("single");
  const [stateCode, setStateCode] = useState("TX");
  const [deductionType, setDeductionType] = useState<"standard" | "itemized">("standard");
  const [itemized, setItemized] = useState(20000);
  const [retirement401k, setRetirement401k] = useState(0);
  const [hsaContrib, setHsaContrib] = useState(0);

  const result = useMemo(() => {
    // Pre-tax deductions reduce FICA base for some, but simplify: 401k/HSA reduce federal taxable only
    const deduction = deductionType === "standard" ? stdDeduction[filing] : itemized;
    const taxableIncome = Math.max(0, income - deduction - retirement401k - hsaContrib);

    const federal = calcFedTax(taxableIncome, filing);
    const fica = calcFICA(income); // FICA is on gross (simplified)
    const stateTax = calcStateTax(Math.max(0, income - deduction), stateCode);

    const totalTax = federal.tax + fica.total + stateTax;
    const takeHome = income - totalTax;
    const effectiveRate = income > 0 ? (totalTax / income) * 100 : 0;

    return {
      deduction,
      taxableIncome,
      federal,
      fica,
      stateTax,
      totalTax,
      takeHome,
      effectiveRate,
      monthly: takeHome / 12,
      biweekly: takeHome / 26,
      weekly: takeHome / 52,
    };
  }, [income, filing, stateCode, deductionType, itemized, retirement401k, hsaContrib]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  const stateName = states[stateCode]?.name || "None";
  const stateInfo = states[stateCode];

  const donutSlices = [
    { label: "Federal", value: result.federal.tax, color: "#B5423A" },
    { label: "FICA", value: result.fica.total, color: "#B45820" },
    { label: "State", value: result.stateTax, color: "#8F7510" },
    { label: "Take-Home", value: result.takeHome, color: "#3D7826" },
  ];

  // Bracket bar visualization
  const maxBracketTax = Math.max(...result.federal.breakdown.map(b => b.tax), 1);

  return (
    <ToolLayout
      title="Tax Calculator"
      description="Calculate your total tax burden — federal income tax, Social Security, Medicare, and state taxes. See your effective rate, bracket breakdown, and take-home pay."
      slug="tax-calculator"
      category="Finance"
      keywords={[
        "tax calculator", "tax calculator 2026", "how much tax do i pay", "income tax calculator",
        "federal tax calculator", "state tax calculator", "payroll tax calculator", "tax estimator",
        "effective tax rate calculator", "total tax burden calculator", "take home pay calculator",
      ]}
      faqs={[
        { question: "What taxes does this calculator include?", answer: "This calculator estimates four types of tax: federal income tax (using 2026 brackets), Social Security tax (6.2% up to $176,100), Medicare tax (1.45% + 0.9% above $200K), and state income tax. It does not include local taxes, self-employment tax, or capital gains tax." },
        { question: "How accurate is this calculator?", answer: "This gives a solid estimate for W-2 employees. Actual taxes depend on many factors including tax credits (child tax credit, earned income credit), additional income sources, and specific state rules. Use this as a planning tool, not a substitute for filing." },
        { question: "Why is my effective tax rate lower than my bracket?", answer: "Tax brackets are marginal — only the income within each bracket is taxed at that rate. If you earn $85,000 (single), your first $11,925 is taxed at 10%, next chunk at 12%, and so on. Your effective rate averages all brackets together, so it's always lower than your top marginal bracket." },
        { question: "Does a 401(k) contribution reduce my taxes?", answer: "Yes. Traditional 401(k) contributions are pre-tax, meaning they reduce your federal and state taxable income. Contributing $10,000 to a 401(k) when you're in the 22% bracket saves you about $2,200 in federal tax alone. This calculator accounts for 401(k) and HSA contributions." },
        { question: "Which states have no income tax?", answer: "Nine states have no income tax: Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, and Wyoming. However, these states often make up revenue through higher sales taxes, property taxes, or other fees." },
        { question: "What is FICA tax?", answer: "FICA stands for Federal Insurance Contributions Act. It includes Social Security tax (6.2% on the first $176,100 of income) and Medicare tax (1.45% on all income, plus an additional 0.9% on income over $200,000). Your employer pays an equal amount." },
      ]}
      relatedTools={[
        { name: "Income Tax Calculator", href: "/tools/income-tax-calculator" },
        { name: "Paycheck Calculator", href: "/tools/paycheck-calculator" },
        { name: "Salary Calculator", href: "/tools/salary-calculator" },
        { name: "Sales Tax Calculator", href: "/tools/sales-tax-calculator" },
        { name: "Capital Gains Tax Calculator", href: "/tools/capital-gains-tax-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-[1fr_1.2fr] gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Annual Gross Income</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
              <input type="number" value={income} onChange={e => setIncome(Math.max(0, +e.target.value))} className={inputCls + " pl-7"} min={0} step={1000} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Filing Status</label>
            <div className="flex gap-2">
              {([["single", "Single"], ["married", "Married"], ["hoh", "HoH"]] as const).map(([val, label]) => (
                <button key={val} onClick={() => setFiling(val)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${filing === val ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{label}</button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>State</label>
            <select value={stateCode} onChange={e => setStateCode(e.target.value)} className={inputCls}>
              {statesSorted.map(([code, s]) => (
                <option key={code} value={code}>{s.name}{s.rate === 0 ? " (no tax)" : ` (${s.rate}%)`}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Deduction</label>
            <div className="flex gap-2 mb-2">
              {(["standard", "itemized"] as const).map(d => (
                <button key={d} onClick={() => setDeductionType(d)} className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${deductionType === d ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{d}</button>
              ))}
            </div>
            {deductionType === "standard" ? (
              <p className="text-sm text-zinc-500">Standard: {fmt(stdDeduction[filing])}</p>
            ) : (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                <input type="number" value={itemized} onChange={e => setItemized(+e.target.value)} className={inputCls + " pl-7"} min={0} step={500} />
              </div>
            )}
          </div>

          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-zinc-400 hover:text-zinc-300 select-none flex items-center gap-1">
              <span className="group-open:rotate-90 transition-transform">&#9654;</span>
              Pre-Tax Contributions
            </summary>
            <div className="mt-3 space-y-3">
              <div>
                <label className={labelCls}>401(k) / 403(b) Contribution</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                  <input type="number" value={retirement401k} onChange={e => setRetirement401k(Math.max(0, +e.target.value))} className={inputCls + " pl-7"} min={0} max={23500} step={500} />
                </div>
                <p className="text-xs text-zinc-600 mt-0.5">2026 limit: $23,500</p>
              </div>
              <div>
                <label className={labelCls}>HSA Contribution</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                  <input type="number" value={hsaContrib} onChange={e => setHsaContrib(Math.max(0, +e.target.value))} className={inputCls + " pl-7"} min={0} max={8550} step={100} />
                </div>
                <p className="text-xs text-zinc-600 mt-0.5">2026 limit: $4,300 individual / $8,550 family</p>
              </div>
            </div>
          </details>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Donut + summary */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-6">
            <DonutChart slices={donutSlices} />
            <div className="flex-1 space-y-3 w-full">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Total Annual Tax</p>
                <p className="text-3xl font-bold text-red-400">{fmt(result.totalTax)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Take-Home Pay</p>
                <p className="text-3xl font-bold text-green-400">{fmt(result.takeHome)}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-700">
                <div><p className="text-xs text-zinc-500">Monthly</p><p className="text-sm font-semibold text-zinc-200">{fmt(result.monthly)}</p></div>
                <div><p className="text-xs text-zinc-500">Bi-Weekly</p><p className="text-sm font-semibold text-zinc-200">{fmt(result.biweekly)}</p></div>
                <div><p className="text-xs text-zinc-500">Weekly</p><p className="text-sm font-semibold text-zinc-200">{fmt(result.weekly)}</p></div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm">
            {donutSlices.map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: s.color }} />
                <span className="text-zinc-400">{s.label}</span>
                <span className="text-zinc-200 font-medium">{fmt(s.value)}</span>
              </div>
            ))}
          </div>

          {/* Tax breakdown */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-700">
              <h3 className="text-sm font-medium text-zinc-300">Tax Breakdown</h3>
            </div>
            <div className="divide-y divide-zinc-800">
              <div className="px-4 py-2.5 flex justify-between text-sm">
                <span className="text-zinc-400">Gross Income</span>
                <span className="text-zinc-100 font-medium">{fmt(income)}</span>
              </div>
              <div className="px-4 py-2.5 flex justify-between text-sm">
                <span className="text-zinc-400">Deduction ({deductionType})</span>
                <span className="text-zinc-400">-{fmt(result.deduction)}</span>
              </div>
              {(retirement401k > 0 || hsaContrib > 0) && (
                <div className="px-4 py-2.5 flex justify-between text-sm">
                  <span className="text-zinc-400">Pre-Tax Contributions</span>
                  <span className="text-zinc-400">-{fmt(retirement401k + hsaContrib)}</span>
                </div>
              )}
              <div className="px-4 py-2.5 flex justify-between text-sm bg-zinc-800/30">
                <span className="text-zinc-300 font-medium">Taxable Income</span>
                <span className="text-zinc-100 font-medium">{fmt(result.taxableIncome)}</span>
              </div>
              <div className="px-4 py-2.5 flex justify-between text-sm">
                <span className="text-zinc-400">Federal Income Tax ({result.federal.marginal}% bracket)</span>
                <span className="text-red-400 font-medium">{fmt(result.federal.tax)}</span>
              </div>
              <div className="px-4 py-2.5 flex justify-between text-sm">
                <span className="text-zinc-400">Social Security (6.2%)</span>
                <span className="text-red-400 font-medium">{fmt(result.fica.ss)}</span>
              </div>
              <div className="px-4 py-2.5 flex justify-between text-sm">
                <span className="text-zinc-400">Medicare ({income > MEDICARE_ADDITIONAL_THRESHOLD ? "1.45% + 0.9%" : "1.45%"})</span>
                <span className="text-red-400 font-medium">{fmt(result.fica.medicare)}</span>
              </div>
              {stateInfo && stateInfo.rate > 0 && (
                <div className="px-4 py-2.5 flex justify-between text-sm">
                  <span className="text-zinc-400">{stateName} State Tax (~{stateInfo.rate}%)</span>
                  <span className="text-red-400 font-medium">{fmt(result.stateTax)}</span>
                </div>
              )}
              <div className="px-4 py-3 flex justify-between text-sm bg-zinc-800/30">
                <span className="text-zinc-200 font-semibold">Total Tax</span>
                <span className="text-red-400 font-bold text-base">{fmt(result.totalTax)}</span>
              </div>
              <div className="px-4 py-3 flex justify-between text-sm bg-green-500/5">
                <span className="text-green-400 font-semibold">Take-Home Pay</span>
                <span className="text-green-400 font-bold text-base">{fmt(result.takeHome)}</span>
              </div>
            </div>
          </div>

          {/* Federal bracket breakdown */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Federal Bracket Breakdown</h3>
            <div className="space-y-2">
              {result.federal.breakdown.map(b => (
                <div key={b.rate} className="flex items-center gap-3 text-sm">
                  <span className="w-10 text-right text-zinc-400 font-mono">{b.rate}%</span>
                  <div className="flex-1 h-5 bg-zinc-700/50 rounded overflow-hidden">
                    <div
                      className="h-full bg-red-400/60 rounded transition-all duration-300"
                      style={{ width: `${(b.tax / maxBracketTax) * 100}%` }}
                    />
                  </div>
                  <span className="w-20 text-right text-zinc-300 font-medium">{fmt(b.tax)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rates summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-center">
              <p className="text-xs text-zinc-500">Effective Rate</p>
              <p className="text-lg font-semibold text-yellow-400">{result.effectiveRate.toFixed(1)}%</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-center">
              <p className="text-xs text-zinc-500">Marginal Rate</p>
              <p className="text-lg font-semibold text-red-400">{result.federal.marginal}%</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-center">
              <p className="text-xs text-zinc-500">Tax / Hour</p>
              <p className="text-lg font-semibold text-orange-400">{fmt(result.totalTax / 2080)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Insight */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
        <p className="text-blue-300 text-sm leading-relaxed">
          On a gross income of {fmt(income)} ({filing === "married" ? "married filing jointly" : filing === "hoh" ? "head of household" : "single"}) in {stateName}, you pay approximately {fmt(result.totalTax)} in total taxes — an effective rate of {result.effectiveRate.toFixed(1)}%. Your take-home pay is {fmt(result.takeHome)} per year, or about {fmt(result.monthly)} per month.
          {retirement401k > 0 && ` Your ${fmt(retirement401k)} 401(k) contribution saves you roughly ${fmt(retirement401k * result.federal.marginal / 100)} in federal taxes.`}
          {stateInfo?.rate === 0 && ` ${stateName} has no state income tax, saving you compared to the national average.`}
        </p>
      </div>
    </ToolLayout>
  );
}
