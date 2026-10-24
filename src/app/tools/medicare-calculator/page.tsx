"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
function fmtC0(n: number) { return "$" + Math.round(n).toLocaleString("en-US"); }

/* ── 2026 Medicare Data (CMS) ── */

// Part A
const PART_A_PREMIUM_FREE = 0;
const PART_A_PREMIUM_REDUCED = 311; // 30-39 quarters
const PART_A_PREMIUM_FULL = 565; // <30 quarters
const PART_A_DEDUCTIBLE = 1736;
const PART_A_COIN_61_90 = 434; // per day
const PART_A_COIN_91_PLUS = 868; // per day (lifetime reserve)
const PART_A_SNF_21_100 = 217; // skilled nursing per day

// Part B
const PART_B_STANDARD = 202.90;
const PART_B_DEDUCTIBLE = 283;

// Part D
const PART_D_BASE_PREMIUM = 38.99;
const PART_D_DEDUCTIBLE = 615;
const PART_D_OOP_CAP = 2100;

// IRMAA brackets (based on 2024 MAGI, 2 years prior)
interface IRMAABracket {
  singleMax: number;
  jointMax: number;
  partBPremium: number;
  partDSurcharge: number;
}

const IRMAA: IRMAABracket[] = [
  { singleMax: 109000, jointMax: 218000, partBPremium: 202.90, partDSurcharge: 0 },
  { singleMax: 137000, jointMax: 274000, partBPremium: 284.10, partDSurcharge: 14.50 },
  { singleMax: 171000, jointMax: 342000, partBPremium: 405.80, partDSurcharge: 37.50 },
  { singleMax: 205000, jointMax: 410000, partBPremium: 527.50, partDSurcharge: 60.40 },
  { singleMax: 499999, jointMax: 749999, partBPremium: 649.20, partDSurcharge: 83.30 },
  { singleMax: Infinity, jointMax: Infinity, partBPremium: 689.90, partDSurcharge: 91.00 },
];

function getIRMAA(magi: number, filing: "single" | "joint"): IRMAABracket {
  for (const bracket of IRMAA) {
    const max = filing === "single" ? bracket.singleMax : bracket.jointMax;
    if (magi <= max) return bracket;
  }
  return IRMAA[IRMAA.length - 1];
}

export default function Page() {
  const [workQuarters, setWorkQuarters] = useState(40);
  const [filing, setFiling] = useState<"single" | "joint">("single");
  const [magi, setMagi] = useState(85000);
  const [wantPartD, setWantPartD] = useState(true);
  const [medigapMonthly, setMedigapMonthly] = useState(0);

  const result = useMemo(() => {
    const irmaa = getIRMAA(magi, filing);

    // Part A premium
    const partAPremium = workQuarters >= 40 ? PART_A_PREMIUM_FREE :
      workQuarters >= 30 ? PART_A_PREMIUM_REDUCED : PART_A_PREMIUM_FULL;

    // Part B premium (with IRMAA)
    const partBPremium = irmaa.partBPremium;
    const partBSurcharge = partBPremium - PART_B_STANDARD;

    // Part D
    const partDPremium = wantPartD ? PART_D_BASE_PREMIUM : 0;
    const partDSurcharge = wantPartD ? irmaa.partDSurcharge : 0;
    const totalPartD = partDPremium + partDSurcharge;

    // Total monthly
    const totalMonthly = partAPremium + partBPremium + totalPartD + medigapMonthly;
    const totalAnnual = totalMonthly * 12;

    // Annual out-of-pocket estimate (premiums + deductibles + typical usage)
    const annualPremiums = totalMonthly * 12;
    const annualDeductibles = PART_A_DEDUCTIBLE + PART_B_DEDUCTIBLE + (wantPartD ? PART_D_DEDUCTIBLE : 0);

    // Late enrollment penalties
    const partBPenalty = 0; // user hasn't delayed — just show the formula
    const partDPenalty = 0;

    const steps: string[] = [];
    steps.push(`Part A premium: ${fmtC(partAPremium)}/mo (${workQuarters >= 40 ? "premium-free (40+ quarters)" : workQuarters >= 30 ? "reduced (30-39 quarters)" : "full premium (<30 quarters)"})`);
    steps.push(`Part B premium: ${fmtC(partBPremium)}/mo${partBSurcharge > 0 ? ` (standard $${PART_B_STANDARD} + $${partBSurcharge.toFixed(2)} IRMAA surcharge)` : " (standard, no IRMAA)"}`);
    if (wantPartD) {
      steps.push(`Part D premium: ${fmtC(partDPremium)}/mo (base)${partDSurcharge > 0 ? ` + ${fmtC(partDSurcharge)} IRMAA surcharge` : ""}`);
    }
    if (medigapMonthly > 0) {
      steps.push(`Medigap/Supplement: ${fmtC(medigapMonthly)}/mo`);
    }
    steps.push(`Total monthly: ${fmtC(totalMonthly)}`);
    steps.push(`Total annual premiums: ${fmtC0(annualPremiums)}`);
    steps.push(`Annual deductibles: Part A ${fmtC0(PART_A_DEDUCTIBLE)} + Part B ${fmtC0(PART_B_DEDUCTIBLE)}${wantPartD ? ` + Part D ${fmtC0(PART_D_DEDUCTIBLE)}` : ""} = ${fmtC0(annualDeductibles)}`);

    return {
      partAPremium, partBPremium, partBSurcharge, totalPartD, partDSurcharge,
      totalMonthly, totalAnnual, annualPremiums, annualDeductibles, steps, irmaa,
    };
  }, [workQuarters, filing, magi, wantPartD, medigapMonthly]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 text-sm";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const cardCls = "bg-zinc-900 border border-zinc-800 rounded-xl p-4";

  return (
    <ToolLayout
      title="Medicare Cost Calculator"
      description="Estimate your 2026 Medicare costs including Part A, Part B, Part D premiums, IRMAA surcharges based on income, deductibles, and Medigap supplement costs."
      slug="medicare-calculator"
      category="Finance"
      keywords={["medicare calculator", "medicare cost calculator", "medicare premium calculator", "IRMAA calculator", "medicare part b premium 2026", "how much does medicare cost", "medicare costs 2026"]}
      faqs={[
        { question: "How much does Medicare cost in 2026?", answer: "Most people pay $0 for Part A and $202.90/month for Part B (standard premium). Part D averages ~$39/month. Total baseline: about $242/month. Higher earners pay more due to IRMAA surcharges — up to $689.90/month for Part B alone at the highest income level." },
        { question: "What is IRMAA?", answer: "IRMAA (Income-Related Monthly Adjustment Amount) is a surcharge added to Part B and Part D premiums for higher-income beneficiaries. It's based on your MAGI from 2 years prior (2024 income for 2026 premiums). IRMAA kicks in at $109,001 for singles and $218,001 for married filing jointly. The highest bracket ($500K+ single, $750K+ joint) adds $487/month to Part B and $91/month to Part D." },
        { question: "Is Medicare Part A really free?", answer: "Part A is premium-free if you (or your spouse) worked and paid Medicare taxes for 40+ quarters (10 years). If you have 30-39 quarters, you pay $311/month. Fewer than 30 quarters: $565/month. However, Part A still has a $1,736 deductible per hospital benefit period, plus daily coinsurance for stays beyond 60 days." },
        { question: "What does Medicare Part B cover?", answer: "Part B covers doctor visits, outpatient care, preventive services, medical equipment, ambulance services, mental health, and some home health care. After the $283 annual deductible, you typically pay 20% coinsurance with no out-of-pocket maximum — which is why many people buy Medigap supplemental insurance." },
        { question: "What is the Medicare Part D out-of-pocket cap?", answer: "Starting in 2025, the Inflation Reduction Act capped Part D out-of-pocket costs at $2,000/year ($2,100 in 2026). Once you hit this cap, you pay $0 for covered drugs the rest of the year. This was a major change — previously, there was no annual cap and costs could spiral." },
        { question: "What is Medigap?", answer: "Medigap (Medicare Supplement) plans are private insurance that covers gaps in Original Medicare — copayments, coinsurance, and deductibles. Plan G is the most popular, typically costing $100-$250/month depending on age, location, and insurer. Medigap only works with Original Medicare, not Medicare Advantage." },
        { question: "What happens if I enroll in Medicare late?", answer: "Part B: 10% premium surcharge for each full 12 months you were eligible but didn't enroll — permanent. Part D: 1% of the base premium ($0.39/month in 2026) per uncovered month — also permanent. These penalties add up fast: delaying Part B by 3 years means paying 30% more for life." },
        { question: "When can I enroll in Medicare?", answer: "Your Initial Enrollment Period is 7 months: starts 3 months before your 65th birthday month, includes your birthday month, and ends 3 months after. You can also enroll during the General Enrollment Period (Jan 1 - Mar 31, coverage starts July 1) or Special Enrollment Periods if you have qualifying events." },
      ]}
      relatedTools={[
        { name: "Social Security Calculator", href: "/tools/social-security-calculator" },
        { name: "Retirement Calculator", href: "/tools/retirement-calculator" },
        { name: "Income Tax Calculator", href: "/tools/income-tax-calculator" },
        { name: "Life Insurance Calculator", href: "/tools/life-insurance-calculator" },
      ]}
    >
      {/* Inputs */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelCls}>Work Quarters (Medicare-covered employment)</label>
          <select value={workQuarters} onChange={e => setWorkQuarters(+e.target.value)} className={inputCls}>
            <option value={40}>40+ quarters (10+ years) — Part A is free</option>
            <option value={35}>30-39 quarters — reduced Part A premium</option>
            <option value={20}>Under 30 quarters — full Part A premium</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Filing Status</label>
          <select value={filing} onChange={e => setFiling(e.target.value as "single" | "joint")} className={inputCls}>
            <option value="single">Single / Head of Household</option>
            <option value="joint">Married Filing Jointly</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelCls}>2024 MAGI (for 2026 IRMAA) ($)</label>
          <input type="number" value={magi} onChange={e => setMagi(Math.max(0, +e.target.value))} className={inputCls} min={0} step={1000} />
          <p className="text-xs text-zinc-500 mt-1">
            IRMAA uses income from 2 years prior. {magi > (filing === "single" ? 109000 : 218000) ? "IRMAA surcharge applies." : "No IRMAA surcharge."}
          </p>
        </div>
        <div>
          <label className={labelCls}>Medigap/Supplement Monthly Premium ($)</label>
          <input type="number" value={medigapMonthly} onChange={e => setMedigapMonthly(Math.max(0, +e.target.value))} className={inputCls} min={0} step={10} />
          <p className="text-xs text-zinc-500 mt-1">Plan G avg: $100-$250/mo. Enter 0 if none.</p>
        </div>
      </div>

      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
          <input type="checkbox" checked={wantPartD} onChange={e => setWantPartD(e.target.checked)} className="accent-blue-500" />
          Include Part D (prescription drug coverage)
        </label>
      </div>

      {/* Primary result */}
      <div className={cardCls + " text-center mb-6"}>
        <p className="text-sm text-zinc-400 mb-2">Total Monthly Medicare Cost</p>
        <p className="text-5xl font-bold text-blue-400 mb-2">{fmtC(result.totalMonthly)}</p>
        <p className="text-lg text-zinc-300">{fmtC0(result.totalAnnual)} per year in premiums</p>
      </div>

      {/* Premium breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className={cardCls + " text-center"}>
          <p className="text-xs text-zinc-500">Part A</p>
          <p className="text-lg font-bold text-zinc-100">{fmtC(result.partAPremium)}</p>
          <p className="text-xs text-zinc-500">/month</p>
        </div>
        <div className={cardCls + " text-center"}>
          <p className="text-xs text-zinc-500">Part B</p>
          <p className="text-lg font-bold text-zinc-100">{fmtC(result.partBPremium)}</p>
          <p className="text-xs text-zinc-500">/month{result.partBSurcharge > 0 ? " (incl IRMAA)" : ""}</p>
        </div>
        <div className={cardCls + " text-center"}>
          <p className="text-xs text-zinc-500">Part D</p>
          <p className="text-lg font-bold text-zinc-100">{fmtC(result.totalPartD)}</p>
          <p className="text-xs text-zinc-500">/month{result.partDSurcharge > 0 ? " (incl IRMAA)" : ""}</p>
        </div>
        <div className={cardCls + " text-center"}>
          <p className="text-xs text-zinc-500">Medigap</p>
          <p className="text-lg font-bold text-zinc-100">{fmtC(medigapMonthly)}</p>
          <p className="text-xs text-zinc-500">/month</p>
        </div>
      </div>

      {/* Deductibles */}
      <div className={cardCls + " mb-6"}>
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">2026 Deductibles & Out-of-Pocket</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <p className="text-xs text-zinc-500">Part A Deductible</p>
            <p className="text-lg font-bold text-zinc-100">{fmtC0(PART_A_DEDUCTIBLE)}</p>
            <p className="text-xs text-zinc-500">per benefit period</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Part B Deductible</p>
            <p className="text-lg font-bold text-zinc-100">{fmtC0(PART_B_DEDUCTIBLE)}</p>
            <p className="text-xs text-zinc-500">per year</p>
          </div>
          {wantPartD && (
            <>
              <div>
                <p className="text-xs text-zinc-500">Part D Deductible</p>
                <p className="text-lg font-bold text-zinc-100">{fmtC0(PART_D_DEDUCTIBLE)}</p>
                <p className="text-xs text-zinc-500">per year (max)</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Part D OOP Cap</p>
                <p className="text-lg font-bold text-green-400">{fmtC0(PART_D_OOP_CAP)}</p>
                <p className="text-xs text-zinc-500">annual max (IRA)</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* IRMAA table */}
      <div className={cardCls + " mb-6"}>
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">2026 IRMAA Brackets (based on 2024 income)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs">
                <th className="text-left px-3 py-2 font-medium">{filing === "single" ? "Single MAGI" : "Joint MAGI"}</th>
                <th className="text-right px-3 py-2 font-medium">Part B/mo</th>
                <th className="text-right px-3 py-2 font-medium">Part D Surcharge</th>
                <th className="text-right px-3 py-2 font-medium">Total Extra/yr</th>
              </tr>
            </thead>
            <tbody>
              {IRMAA.map((b, i) => {
                const max = filing === "single" ? b.singleMax : b.jointMax;
                const prevMax = i > 0 ? (filing === "single" ? IRMAA[i-1].singleMax : IRMAA[i-1].jointMax) : 0;
                const isActive = magi <= max && magi > (i > 0 ? prevMax : 0);
                const extraB = (b.partBPremium - PART_B_STANDARD) * 12;
                const extraD = b.partDSurcharge * 12;
                const label = max === Infinity
                  ? `${fmtC0(prevMax + 1)}+`
                  : i === 0
                  ? `${fmtC0(max)} or less`
                  : `${fmtC0(prevMax + 1)} - ${fmtC0(max)}`;
                return (
                  <tr key={i} className={`border-b border-zinc-800/50 ${isActive ? "bg-blue-500/10" : "hover:bg-zinc-800/30"}`}>
                    <td className={`px-3 py-2 ${isActive ? "text-blue-400 font-medium" : "text-zinc-300"}`}>{label}</td>
                    <td className={`px-3 py-2 text-right ${isActive ? "text-blue-400" : "text-zinc-300"}`}>{fmtC(b.partBPremium)}</td>
                    <td className={`px-3 py-2 text-right ${isActive ? "text-blue-400" : "text-zinc-400"}`}>{fmtC(b.partDSurcharge)}</td>
                    <td className="px-3 py-2 text-right text-zinc-500">{fmtC0(extraB + extraD)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coinsurance */}
      <div className={cardCls + " mb-6"}>
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Part A Hospital Coinsurance (2026)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <p className="text-xs text-zinc-500">Days 1-60</p>
            <p className="text-sm font-bold text-green-400">$0/day</p>
            <p className="text-xs text-zinc-500">after deductible</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Days 61-90</p>
            <p className="text-sm font-bold text-zinc-100">{fmtC0(PART_A_COIN_61_90)}/day</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Days 91+ (lifetime reserve)</p>
            <p className="text-sm font-bold text-red-400">{fmtC0(PART_A_COIN_91_PLUS)}/day</p>
            <p className="text-xs text-zinc-500">60 days total lifetime</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">SNF Days 21-100</p>
            <p className="text-sm font-bold text-zinc-100">{fmtC0(PART_A_SNF_21_100)}/day</p>
          </div>
        </div>
      </div>

      {/* Calculation steps */}
      <div className={cardCls + " mb-6"}>
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Your Cost Breakdown</h3>
        <div className="space-y-1.5">
          {result.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span className="text-zinc-600 shrink-0">{i + 1}.</span>
              <span className="text-zinc-400">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Late penalties */}
      <div className={cardCls + " mb-6"}>
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Late Enrollment Penalties</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-zinc-500">Part B Penalty</p>
            <p className="text-sm text-zinc-300">+10% of {fmtC(PART_B_STANDARD)} per year delayed = +{fmtC(PART_B_STANDARD * 0.10)}/mo per year. <strong>Permanent.</strong></p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Part D Penalty</p>
            <p className="text-sm text-zinc-300">+1% of {fmtC(PART_D_BASE_PREMIUM)} per uncovered month = +{fmtC(PART_D_BASE_PREMIUM * 0.01)}/mo per month. <strong>Permanent.</strong></p>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 text-center">
        <p className="text-xs text-zinc-500 leading-relaxed">
          2026 Medicare costs from CMS.gov (effective January 1, 2026). IRMAA based on 2024 MAGI.
          Part D premiums shown are the national base amount — actual plan premiums vary.
          Medigap costs vary by age, location, and insurer.
          This calculator does not include Medicare Advantage (Part C) plans, which have separate cost structures.
        </p>
      </div>
    </ToolLayout>
  );
}
