"use client";
import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function pct(n: number) { return isFinite(n) ? n.toFixed(2) + "%" : "\u2014"; }

interface Tier { min: number; max: number | null; rate: number; }

function calcTieredCommission(sale: number, tiers: Tier[]): number {
  let commission = 0;
  const sorted = [...tiers].sort((a, b) => a.min - b.min);
  for (const tier of sorted) {
    const upper = tier.max ?? Infinity;
    if (sale <= tier.min) break;
    const taxable = Math.min(sale, upper) - tier.min;
    if (taxable > 0) commission += taxable * (tier.rate / 100);
  }
  return commission;
}

const defaultTiers: Tier[] = [
  { min: 0, max: 10000, rate: 5 },
  { min: 10000, max: 25000, rate: 8 },
  { min: 25000, max: null, rate: 12 },
];

type Mode = "flat" | "tiered" | "base";

export default function Page() {
  const [mode, setMode] = useState<Mode>("flat");
  const [saleAmount, setSaleAmount] = useState(50000);
  const [commissionRate, setCommissionRate] = useState(10);
  const [baseSalary, setBaseSalary] = useState(3000);
  const [tiers, setTiers] = useState<Tier[]>(defaultTiers);
  const [avgDealSize, setAvgDealSize] = useState(15000);
  const [dealsPerMonth, setDealsPerMonth] = useState(4);

  // --- Calculations ---
  let commissionEarned = 0;
  if (mode === "flat" || mode === "base") {
    commissionEarned = saleAmount * (commissionRate / 100);
  } else {
    commissionEarned = calcTieredCommission(saleAmount, tiers);
  }

  const totalComp = mode === "base" ? baseSalary + commissionEarned : commissionEarned;
  const effectiveRate = saleAmount > 0 ? (commissionEarned / saleAmount) * 100 : 0;

  // Projections
  const monthlyCommission = (() => {
    const monthlySales = avgDealSize * dealsPerMonth;
    if (mode === "tiered") return calcTieredCommission(monthlySales, tiers);
    return monthlySales * (commissionRate / 100);
  })();
  const monthlyTotal = mode === "base" ? baseSalary + monthlyCommission : monthlyCommission;
  const annualTotal = mode === "base" ? baseSalary * 12 + monthlyCommission * 12 : monthlyCommission * 12;

  // Comparison table volumes
  const volumes = [10000, 25000, 50000, 75000, 100000, 150000, 200000, 500000];
  const compRows = volumes.map(v => {
    let comm: number;
    if (mode === "tiered") { comm = calcTieredCommission(v, tiers); }
    else { comm = v * (commissionRate / 100); }
    const total = mode === "base" ? baseSalary + comm : comm;
    const eff = v > 0 ? (comm / v) * 100 : 0;
    return { volume: v, commission: comm, total, effective: eff };
  });

  // Stacked bar: base vs commission
  const barMax = Math.max(totalComp, 1);
  const baseWidth = mode === "base" ? (baseSalary / barMax) * 100 : 0;
  const commWidth = (commissionEarned / barMax) * 100;

  // Tier management
  const addTier = () => {
    const last = tiers[tiers.length - 1];
    const newMin = last.max ?? last.min + 10000;
    setTiers([...tiers.slice(0, -1), { ...last, max: newMin }, { min: newMin, max: null, rate: last.rate + 2 }]);
  };
  const removeTier = (i: number) => {
    if (tiers.length <= 1) return;
    const next = [...tiers];
    next.splice(i, 1);
    // fix boundaries
    if (next.length > 0) next[next.length - 1].max = null;
    setTiers(next);
  };
  const updateTier = (i: number, field: "min" | "max" | "rate", val: number | null) => {
    const next = tiers.map((t, idx) => idx === i ? { ...t, [field]: val } : t);
    setTiers(next);
  };

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Commission Calculator"
      description="Calculate sales commission earnings with flat rate, tiered/graduated, or base salary + commission structures. Project monthly and annual income from your sales volume."
      slug="commission-calculator"
      category="Finance"
      keywords={["commission calculator", "sales commission calculator", "tiered commission calculator", "commission rate calculator", "sales earnings calculator", "commission structure calculator"]}
      faqs={[
        { question: "How do I calculate sales commission?", answer: "Multiply the total sale amount by the commission rate. For example, a $50,000 sale at 10% commission earns $5,000. For tiered structures, each portion of the sale is multiplied by its respective tier rate and then summed together." },
        { question: "What is tiered or graduated commission?", answer: "Tiered (graduated) commission applies different rates to different portions of a sale. For example, 5% on the first $10,000, 8% on the next $15,000, and 12% on everything above $25,000. This incentivizes higher sales volumes by rewarding larger deals with better rates." },
        { question: "What is the difference between flat rate and tiered commission?", answer: "Flat rate commission applies a single percentage to the entire sale amount regardless of size. Tiered commission uses escalating percentages for different sale brackets, meaning the effective rate increases as sales grow. Tiered structures typically reward top performers more generously." },
        { question: "What is a typical commission rate for sales?", answer: "Commission rates vary widely by industry. Real estate agents typically earn 2.5-3% per side, SaaS sales reps earn 8-14%, car salespeople earn 20-25% of gross profit, and insurance agents earn 5-20% depending on the product. Base salary + commission roles usually have lower commission rates." },
        { question: "How do I calculate effective commission rate?", answer: "Divide your total commission earned by the total sale amount, then multiply by 100. For tiered structures, the effective rate will always be between your lowest and highest tier rates and increases as your sales volume grows." },
        { question: "What is OTE (On-Target Earnings)?", answer: "OTE is the total expected compensation when a salesperson hits 100% of their quota. It includes base salary plus expected commission. For example, a $60,000 base with $60,000 expected commission gives a $120,000 OTE. Use the base salary + commission mode and monthly projections to estimate your OTE." },
      ]}
      relatedTools={[
        { name: "Profit Margin Calculator", href: "/tools/profit-margin-calculator" },
        { name: "Percentage Calculator", href: "/tools/percentage-calculator" },
        { name: "Discount Calculator", href: "/tools/discount-calculator" },
        { name: "Salary to Hourly Calculator", href: "/tools/salary-to-hourly-calculator" },
      ]}
      guide={
        <div className="space-y-6 text-zinc-300">
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">How to Use the Commission Calculator</h2>
            <p className="text-zinc-400 leading-relaxed">Select your commission structure type (flat rate, tiered, or base + commission), enter your sale amount and rates, and instantly see your commission earned, total compensation, and effective rate. Use the projection section to estimate monthly and annual income based on your average deal flow.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">Understanding Commission Structures</h2>
            <p className="text-zinc-400 leading-relaxed"><strong className="text-zinc-200">Flat rate</strong> is the simplest: one percentage applied to every sale. <strong className="text-zinc-200">Tiered/graduated</strong> rewards higher volume with escalating rates on portions of the sale. <strong className="text-zinc-200">Base salary + commission</strong> combines guaranteed income with performance-based earnings, common in B2B and SaaS sales roles.</p>
          </section>
        </div>
      }
    >
      {/* Mode Selector */}
      <div className="flex gap-2 mb-6">
        {([["flat", "Flat Rate"], ["tiered", "Tiered / Graduated"], ["base", "Base + Commission"]] as [Mode, string][]).map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Sale Amount ($)</label>
            <input type="number" value={saleAmount} onChange={e => setSaleAmount(+e.target.value)} className={inputCls} min={0} step={100} />
          </div>

          {(mode === "flat" || mode === "base") && (
            <div>
              <label className={labelCls}>Commission Rate (%)</label>
              <input type="number" value={commissionRate} onChange={e => setCommissionRate(+e.target.value)} className={inputCls} min={0} max={100} step={0.5} />
            </div>
          )}

          {mode === "base" && (
            <div>
              <label className={labelCls}>Base Salary (Monthly) ($)</label>
              <input type="number" value={baseSalary} onChange={e => setBaseSalary(+e.target.value)} className={inputCls} min={0} step={100} />
            </div>
          )}

          {mode === "tiered" && (
            <div className="space-y-3">
              <label className={labelCls}>Commission Tiers</label>
              {tiers.map((tier, i) => (
                <div key={i} className="flex items-center gap-2 bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-xs text-zinc-500">From</span>
                      <input type="number" value={tier.min} onChange={e => updateTier(i, "min", +e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" min={0} step={1000} />
                    </div>
                    <div>
                      <span className="text-xs text-zinc-500">To</span>
                      {tier.max !== null ? (
                        <input type="number" value={tier.max} onChange={e => updateTier(i, "max", +e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" min={0} step={1000} />
                      ) : (
                        <div className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-500">No limit</div>
                      )}
                    </div>
                    <div>
                      <span className="text-xs text-zinc-500">Rate %</span>
                      <input type="number" value={tier.rate} onChange={e => updateTier(i, "rate", +e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" min={0} max={100} step={0.5} />
                    </div>
                  </div>
                  <button onClick={() => removeTier(i)} className="text-zinc-500 hover:text-red-400 transition-colors text-lg px-1" title="Remove tier">&times;</button>
                </div>
              ))}
              <button onClick={addTier} className="w-full py-2 rounded-lg border border-dashed border-zinc-700 text-sm text-zinc-400 hover:border-blue-500 hover:text-blue-400 transition-colors">
                + Add Tier
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
            <p className="text-sm text-zinc-400 mb-1">Commission Earned</p>
            <p className="text-4xl font-bold text-blue-400">{fmtC(commissionEarned)}</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Total Comp</p>
              <p className="text-lg font-semibold text-green-400">{fmtC(totalComp)}</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Effective Rate</p>
              <p className="text-lg font-semibold text-yellow-400">{pct(effectiveRate)}</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Sale Amount</p>
              <p className="text-lg font-semibold text-zinc-100">{fmtC(saleAmount)}</p>
            </div>
          </div>

          {/* Visual Breakdown Bar */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
            <p className="text-sm text-zinc-400 mb-3">Compensation Breakdown</p>
            <div className="w-full h-8 rounded-lg overflow-hidden flex bg-zinc-900">
              {mode === "base" && baseWidth > 0 && (
                <div className="h-full bg-purple-500 transition-all duration-300 flex items-center justify-center text-xs text-white font-medium" style={{ width: `${Math.max(baseWidth, 8)}%` }}>
                  {baseWidth > 15 ? "Base" : ""}
                </div>
              )}
              {commWidth > 0 && (
                <div className="h-full bg-blue-500 transition-all duration-300 flex items-center justify-center text-xs text-white font-medium" style={{ width: `${Math.max(commWidth, 8)}%` }}>
                  {commWidth > 15 ? "Commission" : ""}
                </div>
              )}
            </div>
            <div className="flex gap-4 mt-2 text-xs text-zinc-400">
              {mode === "base" && <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-purple-500 inline-block" /> Base: {fmtC(baseSalary)}</span>}
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block" /> Commission: {fmtC(commissionEarned)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly/Annual Projections */}
      <div className="mt-8 bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Monthly &amp; Annual Projections</h3>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelCls}>Average Deal Size ($)</label>
            <input type="number" value={avgDealSize} onChange={e => setAvgDealSize(+e.target.value)} className={inputCls} min={0} step={500} />
          </div>
          <div>
            <label className={labelCls}>Deals per Month</label>
            <input type="number" value={dealsPerMonth} onChange={e => setDealsPerMonth(+e.target.value)} className={inputCls} min={0} step={1} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-center">
            <p className="text-xs text-zinc-500 mb-1">Monthly Sales</p>
            <p className="text-lg font-semibold text-zinc-100">{fmtC(avgDealSize * dealsPerMonth)}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-center">
            <p className="text-xs text-zinc-500 mb-1">Monthly Income</p>
            <p className="text-lg font-semibold text-green-400">{fmtC(monthlyTotal)}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-center">
            <p className="text-xs text-zinc-500 mb-1">Annual Income</p>
            <p className="text-lg font-semibold text-blue-400">{fmtC(annualTotal)}</p>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="mt-8 bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Earnings at Different Sales Volumes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-left py-2 px-3 text-zinc-400 font-medium">Sale Amount</th>
                <th className="text-right py-2 px-3 text-zinc-400 font-medium">Commission</th>
                <th className="text-right py-2 px-3 text-zinc-400 font-medium">Total Comp</th>
                <th className="text-right py-2 px-3 text-zinc-400 font-medium">Effective Rate</th>
              </tr>
            </thead>
            <tbody>
              {compRows.map(row => (
                <tr key={row.volume} className={`border-b border-zinc-800 ${row.volume === saleAmount ? "bg-blue-500/10" : ""}`}>
                  <td className="py-2 px-3 text-zinc-300">{fmtC(row.volume)}</td>
                  <td className="py-2 px-3 text-right text-blue-400">{fmtC(row.commission)}</td>
                  <td className="py-2 px-3 text-right text-green-400">{fmtC(row.total)}</td>
                  <td className="py-2 px-3 text-right text-yellow-400">{pct(row.effective)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ToolLayout>
  );
}
