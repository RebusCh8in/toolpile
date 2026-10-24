"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

/* ── 2026 VA Compensation Rates (effective Dec 1, 2025, 2.5% COLA) ── */
/* Source: VA.gov compensation rate tables */

// Veteran alone (no dependents)
const RATES_ALONE: Record<number, number> = {
  10: 175.51, 20: 347.14, 30: 537.26, 40: 773.82, 50: 1102.04,
  60: 1394.80, 70: 1758.02, 80: 2044.30, 90: 2296.58, 100: 3828.06,
};

// Spouse addition (added to alone rate at 30%+)
const SPOUSE_ADD: Record<number, number> = {
  30: 64.00, 40: 84.00, 50: 103.00, 60: 123.00,
  70: 142.00, 80: 162.00, 90: 182.00, 100: 332.11,
};

// First child addition (on top of spouse rate, 30%+)
const CHILD1_ADD: Record<number, number> = {
  30: 48.00, 40: 60.00, 50: 72.00, 60: 84.00,
  70: 96.00, 80: 108.00, 90: 120.00, 100: 132.22,
};

// Each additional child under 18
const CHILD_ADDL: Record<number, number> = {
  30: 40.00, 40: 50.00, 50: 60.00, 60: 70.00,
  70: 80.00, 80: 90.00, 90: 100.00, 100: 112.00,
};

// Each child 18-23 in school (additional)
const CHILD_SCHOOL: Record<number, number> = {
  30: 130.00, 40: 170.00, 50: 210.00, 60: 250.00,
  70: 290.00, 80: 330.00, 90: 370.00, 100: 410.58,
};

/* ── VA Combined Rating Math ── */
function combinedRating(ratings: number[]): { exact: number; rounded: number } {
  if (ratings.length === 0) return { exact: 0, rounded: 0 };
  const sorted = [...ratings].sort((a, b) => b - a);
  let remaining = 100;
  for (const r of sorted) {
    remaining = remaining - (remaining * r / 100);
  }
  const exact = 100 - remaining;
  const rounded = Math.round(exact / 10) * 10;
  return { exact, rounded: Math.min(100, rounded) };
}

export default function Page() {
  const [ratings, setRatings] = useState<number[]>([50, 30]);
  const [hasSpouse, setHasSpouse] = useState(false);
  const [childrenUnder18, setChildrenUnder18] = useState(0);
  const [childrenSchool, setChildrenSchool] = useState(0);
  const [newRating, setNewRating] = useState(10);

  const addRating = () => {
    setRatings([...ratings, newRating]);
  };
  const removeRating = (idx: number) => {
    setRatings(ratings.filter((_, i) => i !== idx));
  };

  const result = useMemo(() => {
    const { exact, rounded } = combinedRating(ratings);
    const simpleSum = ratings.reduce((a, b) => a + b, 0);

    // Monthly compensation
    const baseRate = RATES_ALONE[rounded] || 0;
    let monthly = baseRate;
    const breakdown: string[] = [];
    breakdown.push(`Base rate (${rounded}%, veteran alone): ${fmtC(baseRate)}/mo`);

    if (rounded >= 30) {
      if (hasSpouse) {
        const spAdd = SPOUSE_ADD[rounded] || 0;
        monthly += spAdd;
        breakdown.push(`Spouse addition: +${fmtC(spAdd)}`);
      }

      const totalChildren = childrenUnder18 + childrenSchool;
      if (totalChildren > 0) {
        // First child
        const c1 = CHILD1_ADD[rounded] || 0;
        monthly += c1;
        breakdown.push(`First child: +${fmtC(c1)}`);

        // Additional children under 18
        if (childrenUnder18 > 1) {
          const addl = (CHILD_ADDL[rounded] || 0) * (childrenUnder18 - 1);
          monthly += addl;
          breakdown.push(`${childrenUnder18 - 1} additional child(ren) under 18: +${fmtC(addl)}`);
        }

        // Children 18-23 in school (if they count beyond the first)
        if (childrenSchool > 0) {
          // If first child was counted above from under18, school children are additional
          // If no under18, first school child was counted as child1, rest are school rate
          if (childrenUnder18 === 0) {
            // First child was a school child, already counted at child1 rate
            if (childrenSchool > 1) {
              const schoolAddl = (CHILD_SCHOOL[rounded] || 0) * (childrenSchool - 1);
              monthly += schoolAddl;
              breakdown.push(`${childrenSchool - 1} additional child(ren) 18-23 in school: +${fmtC(schoolAddl)}`);
            }
          } else {
            // All school children are additional
            const schoolAddl = (CHILD_SCHOOL[rounded] || 0) * childrenSchool;
            monthly += schoolAddl;
            breakdown.push(`${childrenSchool} child(ren) 18-23 in school: +${fmtC(schoolAddl)}`);
          }
        }
      }
    } else if (rounded > 0 && (hasSpouse || childrenUnder18 > 0 || childrenSchool > 0)) {
      breakdown.push("Dependent additions require 30%+ combined rating");
    }

    const annual = monthly * 12;
    const lifetime20 = annual * 20;

    // Steps showing the VA math
    const steps: string[] = [];
    if (ratings.length > 0) {
      const sorted = [...ratings].sort((a, b) => b - a);
      steps.push(`Ratings (highest to lowest): ${sorted.map(r => r + "%").join(", ")}`);
      if (ratings.length > 1) {
        steps.push(`Simple addition would be: ${simpleSum}% — but VA uses combined math`);
      }
      let rem = 100;
      for (let i = 0; i < sorted.length; i++) {
        const r = sorted[i];
        const reduction = rem * r / 100;
        rem = rem - reduction;
        steps.push(`Apply ${r}%: ${(rem + reduction).toFixed(1)} × ${r}% = ${reduction.toFixed(1)} → ${rem.toFixed(1)}% remaining`);
      }
      steps.push(`Combined: 100 - ${rem.toFixed(1)} = ${exact.toFixed(1)}%`);
      steps.push(`Rounded to nearest 10%: ${rounded}%`);
    }

    return { exact, rounded, simpleSum, monthly, annual, lifetime20, breakdown, steps };
  }, [ratings, hasSpouse, childrenUnder18, childrenSchool]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 text-sm";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const cardCls = "bg-zinc-900 border border-zinc-800 rounded-xl p-4";

  return (
    <ToolLayout
      title="VA Disability Calculator"
      description="Calculate your VA combined disability rating and estimated monthly compensation. Uses the official VA combined rating formula ('VA math') with 2026 compensation rates and dependent allowances."
      slug="va-disability-calculator"
      category="Legal"
      keywords={["va disability calculator", "va combined rating calculator", "va disability pay calculator", "va math calculator", "va compensation calculator", "va disability rates 2026"]}
      faqs={[
        { question: "How does VA math work?", answer: "The VA doesn't add ratings. Instead, each disability reduces your remaining 'whole person' efficiency. Start at 100% healthy. A 70% rating leaves 30% remaining. A second 50% rating takes 50% of the remaining 30% (=15%), leaving 15% remaining. So 70% + 50% = 85% combined (not 120%), which rounds to 90%. This is why two 50% ratings equal 75%, not 100%." },
        { question: "How does VA rounding work?", answer: "The VA rounds the combined rating to the nearest 10%. Values ending in 5 or higher round up: 75% → 80%, 65% → 70%. Values ending in 4 or lower round down: 74% → 70%, 64% → 60%. This rounding can make a significant difference in monthly compensation." },
        { question: "When do I get dependent pay?", answer: "You must have a combined rating of 30% or higher to receive additional compensation for dependents (spouse, children, dependent parents). At 10% and 20%, you receive only the base veteran rate regardless of dependents." },
        { question: "What is TDIU?", answer: "Total Disability based on Individual Unemployability (TDIU) pays at the 100% rate even if your combined rating is less than 100%, when you can't maintain substantially gainful employment due to service-connected disabilities. Eligibility: one disability at 60%+, OR two+ disabilities with 70%+ combined and at least one at 40%+." },
        { question: "Are VA disability payments taxable?", answer: "No. VA disability compensation is completely tax-free at the federal and state level. A $3,828/month payment at 100% is equivalent to roughly $5,000/month in taxable income depending on your tax bracket." },
        { question: "What is the bilateral factor?", answer: "When disabilities affect paired extremities (both arms, both legs), the VA combines those ratings first, then adds 10% of that combined value before combining with other disabilities. This slightly increases the overall combined rating." },
        { question: "How often do VA rates change?", answer: "VA compensation rates are adjusted annually based on the Cost of Living Adjustment (COLA), the same increase applied to Social Security. The 2026 rates (effective December 1, 2025) reflect a 2.5% COLA increase." },
        { question: "What is Special Monthly Compensation?", answer: "SMC provides additional pay above the standard rating for severe disabilities. SMC-K (~$140/month) is the most common, paid for loss of a creative organ, hand, foot, or eye. SMC-S (~$4,215/month) is for housebound veterans. Higher levels (L through R) can exceed $11,000/month for veterans requiring extensive personal care." },
      ]}
      relatedTools={[
        { name: "Workers' Comp Calculator", href: "/tools/workers-comp-calculator" },
        { name: "Personal Injury Calculator", href: "/tools/personal-injury-calculator" },
        { name: "Salary Calculator", href: "/tools/salary-calculator" },
      ]}
    >
      {/* Add ratings */}
      <div className={cardCls + " mb-6"}>
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Your Disability Ratings</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {ratings.map((r, i) => (
            <div key={i} className="flex items-center gap-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5">
              <span className="text-sm font-medium text-zinc-200">{r}%</span>
              <button onClick={() => removeRating(i)} className="text-zinc-500 hover:text-red-400 text-xs ml-1">x</button>
            </div>
          ))}
          {ratings.length === 0 && <p className="text-sm text-zinc-500">No ratings added yet</p>}
        </div>
        <div className="flex gap-2">
          <select value={newRating} onChange={e => setNewRating(+e.target.value)} className={inputCls + " max-w-[120px]"}>
            {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(r => (
              <option key={r} value={r}>{r}%</option>
            ))}
          </select>
          <button onClick={addRating} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Add Rating
          </button>
        </div>
      </div>

      {/* Dependents */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
            <input type="checkbox" checked={hasSpouse} onChange={e => setHasSpouse(e.target.checked)} className="accent-blue-500" />
            Spouse
          </label>
        </div>
        <div>
          <label className={labelCls}>Children Under 18</label>
          <input type="number" value={childrenUnder18} onChange={e => setChildrenUnder18(Math.max(0, +e.target.value))} className={inputCls} min={0} max={20} />
        </div>
        <div>
          <label className={labelCls}>Children 18-23 (in school)</label>
          <input type="number" value={childrenSchool} onChange={e => setChildrenSchool(Math.max(0, +e.target.value))} className={inputCls} min={0} max={20} />
        </div>
      </div>

      {/* Primary result */}
      <div className={cardCls + " text-center mb-6"}>
        <p className="text-sm text-zinc-400 mb-2">Combined VA Disability Rating</p>
        <p className="text-6xl font-bold text-blue-400 mb-1">{result.rounded}%</p>
        {ratings.length > 1 && (
          <p className="text-sm text-zinc-500">
            Exact: {result.exact.toFixed(1)}% (rounded from {ratings.map(r => r + "%").join(" + ")} = {result.simpleSum}% simple sum)
          </p>
        )}
      </div>

      {/* Monthly compensation */}
      <div className="grid md:grid-cols-3 gap-3 mb-6">
        <div className={cardCls + " text-center"}>
          <p className="text-xs text-zinc-500">Monthly (tax-free)</p>
          <p className="text-2xl font-bold text-green-400">{fmtC(result.monthly)}</p>
        </div>
        <div className={cardCls + " text-center"}>
          <p className="text-xs text-zinc-500">Annual (tax-free)</p>
          <p className="text-2xl font-bold text-zinc-100">{fmtC(result.annual)}</p>
        </div>
        <div className={cardCls + " text-center"}>
          <p className="text-xs text-zinc-500">20-Year Lifetime</p>
          <p className="text-2xl font-bold text-zinc-100">{fmtC(result.lifetime20)}</p>
        </div>
      </div>

      {/* Compensation breakdown */}
      <div className={cardCls + " mb-6"}>
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Compensation Breakdown</h3>
        <div className="space-y-1.5">
          {result.breakdown.map((line, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span className="text-zinc-600 shrink-0">{i + 1}.</span>
              <span className="text-zinc-400">{line}</span>
            </div>
          ))}
          <div className="border-t border-zinc-800 pt-2 mt-2 flex justify-between">
            <span className="text-sm font-semibold text-zinc-200">Total Monthly</span>
            <span className="text-sm font-bold text-green-400">{fmtC(result.monthly)}</span>
          </div>
        </div>
      </div>

      {/* VA math steps */}
      {ratings.length > 0 && (
        <div className={cardCls + " mb-6"}>
          <h3 className="text-sm font-semibold text-zinc-200 mb-3">VA Math Breakdown</h3>
          <div className="space-y-1.5">
            {result.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="text-zinc-600 shrink-0">{i + 1}.</span>
                <span className="text-zinc-400">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick reference table */}
      <div className={cardCls + " mb-6"}>
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">2026 VA Compensation Rates (Veteran Alone)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs">
                <th className="text-left px-3 py-2 font-medium">Rating</th>
                <th className="text-right px-3 py-2 font-medium">Monthly</th>
                <th className="text-right px-3 py-2 font-medium">Annual</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(RATES_ALONE).map(([rating, amount]) => (
                <tr key={rating} className={`border-b border-zinc-800/50 ${+rating === result.rounded ? "bg-blue-500/10" : "hover:bg-zinc-800/30"}`}>
                  <td className={`px-3 py-2 font-medium ${+rating === result.rounded ? "text-blue-400" : "text-zinc-300"}`}>{rating}%</td>
                  <td className={`px-3 py-2 text-right ${+rating === result.rounded ? "text-blue-400" : "text-zinc-300"}`}>{fmtC(amount)}</td>
                  <td className="px-3 py-2 text-right text-zinc-500">{fmtC(amount * 12)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-zinc-500 mt-2">Rates effective December 1, 2025 (2.5% COLA). Dependent additions available at 30%+. Source: VA.gov</p>
      </div>

      {/* TDIU note */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
        <h4 className="text-zinc-200 font-semibold text-sm mb-2">TDIU (Total Disability Individual Unemployability)</h4>
        <p className="text-zinc-400 text-sm">
          If you can&apos;t work due to service-connected disabilities, you may qualify for TDIU, which pays at the 100% rate ({fmtC(RATES_ALONE[100])}/mo) even if your combined rating is less than 100%.
          Eligibility: one disability at 60%+, or two+ disabilities with 70%+ combined and at least one at 40%+.
          {result.rounded >= 70 && " Your current combined rating may qualify you for TDIU consideration."}
        </p>
      </div>

      {/* Bottom */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 text-center">
        <p className="text-xs text-zinc-500 leading-relaxed">
          2026 rates effective December 1, 2025 (2.5% COLA increase). VA disability compensation is completely tax-free.
          This calculator uses the official VA combined rating formula. Actual ratings are determined by VA examiners
          based on medical evidence and the VA Schedule for Rating Disabilities (38 CFR Part 4).
          This does not include the bilateral factor. Consult a VA-accredited claims agent or attorney for your specific case.
        </p>
      </div>
    </ToolLayout>
  );
}
