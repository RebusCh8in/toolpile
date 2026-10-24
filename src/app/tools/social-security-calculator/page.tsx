"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + Math.round(n).toLocaleString("en-US"); }

/* ── 2026 Social Security Constants (SSA) ── */
const BEND1 = 1286;  // First bend point
const BEND2 = 7749;  // Second bend point
const WAGE_BASE_2026 = 184500;
const COLA_2026 = 2.8; // percent
const MAX_AT_62 = 2969;
const MAX_AT_FRA = 4152;
const MAX_AT_70 = 5181;
const AVG_BENEFIT = 2071;

/* FRA by birth year */
function getFRA(birthYear: number): { years: number; months: number; label: string } {
  if (birthYear <= 1937) return { years: 65, months: 0, label: "65" };
  if (birthYear === 1938) return { years: 65, months: 2, label: "65 and 2 months" };
  if (birthYear === 1939) return { years: 65, months: 4, label: "65 and 4 months" };
  if (birthYear === 1940) return { years: 65, months: 6, label: "65 and 6 months" };
  if (birthYear === 1941) return { years: 65, months: 8, label: "65 and 8 months" };
  if (birthYear === 1942) return { years: 65, months: 10, label: "65 and 10 months" };
  if (birthYear >= 1943 && birthYear <= 1954) return { years: 66, months: 0, label: "66" };
  if (birthYear === 1955) return { years: 66, months: 2, label: "66 and 2 months" };
  if (birthYear === 1956) return { years: 66, months: 4, label: "66 and 4 months" };
  if (birthYear === 1957) return { years: 66, months: 6, label: "66 and 6 months" };
  if (birthYear === 1958) return { years: 66, months: 8, label: "66 and 8 months" };
  if (birthYear === 1959) return { years: 66, months: 10, label: "66 and 10 months" };
  return { years: 67, months: 0, label: "67" };
}

/* Calculate PIA from AIME */
function calcPIA(aime: number): number {
  let pia = 0;
  if (aime <= BEND1) {
    pia = aime * 0.90;
  } else if (aime <= BEND2) {
    pia = BEND1 * 0.90 + (aime - BEND1) * 0.32;
  } else {
    pia = BEND1 * 0.90 + (BEND2 - BEND1) * 0.32 + (aime - BEND2) * 0.15;
  }
  return Math.floor(pia * 10) / 10; // round down to dime
}

/* Early claiming reduction */
function earlyReduction(monthsEarly: number): number {
  let reduction = 0;
  if (monthsEarly <= 36) {
    reduction = monthsEarly * (5 / 900); // 5/9 of 1% per month
  } else {
    reduction = 36 * (5 / 900) + (monthsEarly - 36) * (5 / 1200); // 5/12 of 1% for months beyond 36
  }
  return reduction;
}

/* Delayed retirement credits */
function delayedCredits(monthsDelayed: number): number {
  return monthsDelayed * (2 / 300); // 2/3 of 1% per month = 8% per year
}

export default function Page() {
  const [birthYear, setBirthYear] = useState(1970);
  const [annualEarnings, setAnnualEarnings] = useState(75000);
  const [yearsWorked, setYearsWorked] = useState(30);
  const [claimAge, setClaimAge] = useState(67);
  const [showSpousal, setShowSpousal] = useState(false);
  const [spouseAnnualEarnings, setSpouseAnnualEarnings] = useState(40000);

  const result = useMemo(() => {
    const fra = getFRA(birthYear);
    const fraMonths = fra.years * 12 + fra.months;

    // Estimate AIME: average annual earnings over 35 years (simplified)
    // If fewer than 35 years, zeros fill in
    const effectiveYears = Math.min(yearsWorked, 35);
    const cappedEarnings = Math.min(annualEarnings, WAGE_BASE_2026);
    const totalEarnings = cappedEarnings * effectiveYears; // simplified: no indexing
    const aime = Math.floor(totalEarnings / 420); // 35 years * 12 months

    // PIA at FRA
    const pia = calcPIA(aime);

    // Benefit at claimed age
    const claimAgeMonths = claimAge * 12;
    let monthlyBenefit = pia;
    let adjustment = "";

    if (claimAgeMonths < fraMonths) {
      const monthsEarly = fraMonths - claimAgeMonths;
      const reduction = earlyReduction(monthsEarly);
      monthlyBenefit = pia * (1 - reduction);
      adjustment = `-${(reduction * 100).toFixed(1)}% (${monthsEarly} months early)`;
    } else if (claimAgeMonths > fraMonths) {
      const monthsDelayed = Math.min(claimAgeMonths - fraMonths, 36); // max 3 years of credits
      const credit = delayedCredits(monthsDelayed);
      monthlyBenefit = pia * (1 + credit);
      adjustment = `+${(credit * 100).toFixed(1)}% (${monthsDelayed} months delayed credits)`;
    } else {
      adjustment = "Full retirement age (no adjustment)";
    }

    // Spousal benefit
    let spousalBenefit = 0;
    let spousalPIA = 0;
    if (showSpousal) {
      const spouseCapped = Math.min(spouseAnnualEarnings, WAGE_BASE_2026);
      const spouseTotal = spouseCapped * Math.min(yearsWorked, 35);
      const spouseAIME = Math.floor(spouseTotal / 420);
      spousalPIA = calcPIA(spouseAIME);
      // Spousal benefit is 50% of higher earner's PIA (at FRA) or own benefit, whichever is higher
      const higherPIA = Math.max(pia, spousalPIA);
      spousalBenefit = higherPIA * 0.50;
    }

    // Benefits at different ages
    const ageTable = [];
    for (let age = 62; age <= 70; age++) {
      const ageMonths = age * 12;
      let benefit = pia;
      if (ageMonths < fraMonths) {
        benefit = pia * (1 - earlyReduction(fraMonths - ageMonths));
      } else if (ageMonths > fraMonths) {
        benefit = pia * (1 + delayedCredits(Math.min(ageMonths - fraMonths, 36)));
      }
      const annual = benefit * 12;
      // Lifetime estimate assuming life expectancy of 85
      const yearsCollecting = 85 - age;
      const lifetime = annual * yearsCollecting;
      ageTable.push({ age, monthly: Math.round(benefit), annual: Math.round(annual), lifetime: Math.round(lifetime) });
    }

    // Steps
    const steps: string[] = [];
    steps.push(`Average annual earnings: ${fmtC(annualEarnings)} (capped at ${fmtC(WAGE_BASE_2026)})`);
    steps.push(`Years worked: ${yearsWorked} (${effectiveYears} of 35 counted, ${35 - effectiveYears} zero years)`);
    steps.push(`Total indexed earnings (simplified): ${fmtC(totalEarnings)}`);
    steps.push(`AIME: ${fmtC(totalEarnings)} / 420 months = ${fmtC(aime)}`);
    steps.push(`PIA formula: 90% x ${fmtC(Math.min(aime, BEND1))} + 32% x ${fmtC(Math.max(0, Math.min(aime, BEND2) - BEND1))} + 15% x ${fmtC(Math.max(0, aime - BEND2))}`);
    steps.push(`PIA (monthly benefit at FRA): ${fmtC(pia)}`);
    steps.push(`Full Retirement Age: ${fra.label} (birth year ${birthYear})`);
    steps.push(`Claiming at age ${claimAge}: ${adjustment}`);
    steps.push(`Estimated monthly benefit: ${fmtC(Math.round(monthlyBenefit))}`);

    return {
      aime, pia: Math.round(pia), monthlyBenefit: Math.round(monthlyBenefit),
      annualBenefit: Math.round(monthlyBenefit * 12), fra, adjustment,
      ageTable, steps, spousalBenefit: Math.round(spousalBenefit), spousalPIA: Math.round(spousalPIA),
    };
  }, [birthYear, annualEarnings, yearsWorked, claimAge, showSpousal, spouseAnnualEarnings]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 text-sm";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const cardCls = "bg-zinc-900 border border-zinc-800 rounded-xl p-4";

  return (
    <ToolLayout
      title="Social Security Calculator"
      description="Estimate your Social Security retirement benefits. Uses the official PIA formula with 2026 bend points, claiming age adjustments, spousal benefits, and delayed retirement credits."
      slug="social-security-calculator"
      category="Finance"
      keywords={["social security calculator", "social security benefits calculator", "social security estimator", "how much social security will I get", "ssa calculator", "retirement benefits calculator", "social security at 62 vs 67"]}
      faqs={[
        { question: "How is Social Security calculated?", answer: "SSA takes your 35 highest-earning years, adjusts for inflation (indexing), calculates your Average Indexed Monthly Earnings (AIME), then applies a three-tier formula: 90% of the first $1,286, plus 32% of earnings between $1,286 and $7,749, plus 15% above $7,749 (2026 bend points). The result is your Primary Insurance Amount (PIA) — your monthly benefit at full retirement age." },
        { question: "What is full retirement age?", answer: "Full retirement age (FRA) is 67 for anyone born in 1960 or later. For those born 1955-1959, it gradually increases from 66 and 2 months to 66 and 10 months. At FRA, you receive 100% of your PIA with no reduction or increase." },
        { question: "How much less do I get at 62?", answer: "Claiming at 62 (with FRA of 67) reduces your benefit by 30%. That reduction is permanent — it doesn't go back up when you reach 67. For example, if your PIA is $2,000/month, you'd receive $1,400/month at 62 for life." },
        { question: "How much more do I get at 70?", answer: "Waiting until 70 earns delayed retirement credits of 8% per year beyond FRA. With FRA of 67, waiting to 70 gives you 124% of your PIA. A $2,000 PIA becomes $2,480/month. No additional credits accrue after 70." },
        { question: "Are Social Security benefits taxable?", answer: "Up to 85% of your benefits may be taxable depending on your total income. If your combined income (adjusted gross income + nontaxable interest + half your SS benefits) exceeds $25,000 (single) or $32,000 (married filing jointly), some benefits are taxable. Below those thresholds, benefits are tax-free." },
        { question: "What are spousal benefits?", answer: "A spouse can receive up to 50% of the higher earner's PIA at FRA, if that's more than their own benefit. The higher earner must be receiving benefits. Spousal benefits can be claimed as early as 62 (at a reduced rate). There are no delayed retirement credits for spousal benefits — there's no advantage to waiting past FRA." },
        { question: "What is the maximum Social Security benefit in 2026?", answer: "The maximum monthly benefit in 2026 is $2,969 at age 62, $4,152 at FRA, and $5,181 at age 70. To receive the maximum, you'd need to have earned at or above the taxable maximum ($184,500 in 2026) for 35 years." },
        { question: "What if I worked fewer than 35 years?", answer: "SSA always uses 35 years. If you worked fewer, zero-earning years fill the gaps, dragging down your average. Each missing year reduces your AIME by 1/35th. Working even a few more years can significantly increase your benefit if it replaces a zero year." },
      ]}
      relatedTools={[
        { name: "Retirement Calculator", href: "/tools/retirement-calculator" },
        { name: "401k Calculator", href: "/tools/401k-calculator" },
        { name: "Life Insurance Calculator", href: "/tools/life-insurance-calculator" },
        { name: "Income Tax Calculator", href: "/tools/income-tax-calculator" },
      ]}
    >
      {/* Inputs */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelCls}>Birth Year</label>
          <input type="number" value={birthYear} onChange={e => setBirthYear(Math.max(1930, Math.min(2010, +e.target.value)))} className={inputCls} min={1930} max={2010} />
          <p className="text-xs text-zinc-500 mt-1">FRA: {result.fra.label}</p>
        </div>
        <div>
          <label className={labelCls}>Average Annual Earnings ($)</label>
          <input type="number" value={annualEarnings} onChange={e => setAnnualEarnings(Math.max(0, +e.target.value))} className={inputCls} min={0} step={1000} />
          <p className="text-xs text-zinc-500 mt-1">2026 taxable max: {fmtC(WAGE_BASE_2026)}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelCls}>Years of Work History</label>
          <input type="number" value={yearsWorked} onChange={e => setYearsWorked(Math.max(0, Math.min(50, +e.target.value)))} className={inputCls} min={0} max={50} />
          <p className="text-xs text-zinc-500 mt-1">{Math.max(0, 35 - yearsWorked)} zero years in calculation</p>
        </div>
        <div>
          <label className={labelCls}>Planned Claiming Age</label>
          <input type="range" min={62} max={70} step={1} value={claimAge} onChange={e => setClaimAge(+e.target.value)} className="w-full accent-blue-500 mt-2" />
          <div className="flex justify-between text-xs text-zinc-500 mt-1">
            <span>62 (early)</span>
            <span className="text-blue-400 font-medium">{claimAge}</span>
            <span>70 (max)</span>
          </div>
        </div>
      </div>

      {/* Spousal */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer mb-3">
          <input type="checkbox" checked={showSpousal} onChange={e => setShowSpousal(e.target.checked)} className="accent-blue-500" />
          Show spousal benefits
        </label>
        {showSpousal && (
          <div className="max-w-xs">
            <label className={labelCls}>Spouse&apos;s Average Annual Earnings ($)</label>
            <input type="number" value={spouseAnnualEarnings} onChange={e => setSpouseAnnualEarnings(Math.max(0, +e.target.value))} className={inputCls} min={0} step={1000} />
          </div>
        )}
      </div>

      {/* Primary result */}
      <div className={cardCls + " text-center mb-6"}>
        <p className="text-sm text-zinc-400 mb-2">Estimated Monthly Benefit at Age {claimAge}</p>
        <p className="text-5xl font-bold text-blue-400 mb-2">{fmtC(result.monthlyBenefit)}</p>
        <p className="text-lg text-zinc-300">{fmtC(result.annualBenefit)} per year</p>
        <p className="text-sm text-zinc-500 mt-1">{result.adjustment}</p>
      </div>

      {/* Key numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className={cardCls + " text-center"}>
          <p className="text-xs text-zinc-500">AIME</p>
          <p className="text-lg font-bold text-zinc-100">{fmtC(result.aime)}</p>
        </div>
        <div className={cardCls + " text-center"}>
          <p className="text-xs text-zinc-500">PIA (at FRA)</p>
          <p className="text-lg font-bold text-zinc-100">{fmtC(result.pia)}</p>
        </div>
        <div className={cardCls + " text-center"}>
          <p className="text-xs text-zinc-500">FRA</p>
          <p className="text-lg font-bold text-zinc-100">{result.fra.label}</p>
        </div>
        <div className={cardCls + " text-center"}>
          <p className="text-xs text-zinc-500">2026 COLA</p>
          <p className="text-lg font-bold text-zinc-100">{COLA_2026}%</p>
        </div>
      </div>

      {/* Spousal result */}
      {showSpousal && (
        <div className={cardCls + " mb-6"}>
          <h3 className="text-sm font-semibold text-zinc-200 mb-3">Spousal Benefits</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xs text-zinc-500">Your PIA</p>
              <p className="text-lg font-bold text-zinc-100">{fmtC(result.pia)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-zinc-500">Spouse&apos;s PIA</p>
              <p className="text-lg font-bold text-zinc-100">{fmtC(result.spousalPIA)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-zinc-500">Spousal Benefit (50%)</p>
              <p className="text-lg font-bold text-green-400">{fmtC(result.spousalBenefit)}</p>
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            The lower-earning spouse receives the higher of their own benefit or 50% of the higher earner&apos;s PIA (at FRA). No delayed credits apply to spousal benefits.
          </p>
        </div>
      )}

      {/* Age comparison table */}
      <div className={cardCls + " mb-6"}>
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Benefits by Claiming Age</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs">
                <th className="text-left px-3 py-2 font-medium">Age</th>
                <th className="text-right px-3 py-2 font-medium">Monthly</th>
                <th className="text-right px-3 py-2 font-medium">Annual</th>
                <th className="text-right px-3 py-2 font-medium">Lifetime (to 85)</th>
              </tr>
            </thead>
            <tbody>
              {result.ageTable.map(row => (
                <tr key={row.age} className={`border-b border-zinc-800/50 ${row.age === claimAge ? "bg-blue-500/10" : "hover:bg-zinc-800/30"}`}>
                  <td className={`px-3 py-2 font-medium ${row.age === claimAge ? "text-blue-400" : "text-zinc-300"}`}>
                    {row.age}{row.age === result.fra.years && result.fra.months === 0 ? " (FRA)" : ""}
                  </td>
                  <td className={`px-3 py-2 text-right ${row.age === claimAge ? "text-blue-400" : "text-zinc-300"}`}>{fmtC(row.monthly)}</td>
                  <td className={`px-3 py-2 text-right ${row.age === claimAge ? "text-blue-400" : "text-zinc-400"}`}>{fmtC(row.annual)}</td>
                  <td className="px-3 py-2 text-right text-zinc-500">{fmtC(row.lifetime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-zinc-500 mt-2">Lifetime estimate assumes living to age 85. Actual benefits receive annual COLA adjustments.</p>
      </div>

      {/* Calculation steps */}
      <div className={cardCls + " mb-6"}>
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Calculation Breakdown</h3>
        <div className="space-y-1.5">
          {result.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span className="text-zinc-600 shrink-0">{i + 1}.</span>
              <span className="text-zinc-400">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2026 maximums */}
      <div className={cardCls + " mb-6"}>
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">2026 Social Security Maximums</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-xs text-zinc-500">Max at 62</p>
            <p className="text-lg font-bold text-zinc-100">{fmtC(MAX_AT_62)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-zinc-500">Max at FRA</p>
            <p className="text-lg font-bold text-zinc-100">{fmtC(MAX_AT_FRA)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-zinc-500">Max at 70</p>
            <p className="text-lg font-bold text-zinc-100">{fmtC(MAX_AT_70)}</p>
          </div>
        </div>
        <p className="text-xs text-zinc-500 mt-2">Requires 35 years earning at or above the taxable maximum ({fmtC(WAGE_BASE_2026)} in 2026).</p>
      </div>

      {/* Earnings test */}
      <div className={cardCls + " mb-6"}>
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">2026 Earnings Test (working while collecting before FRA)</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-zinc-500">Under FRA all year</p>
            <p className="text-sm text-zinc-300">Exempt: {fmtC(24480)}/year. $1 withheld per $2 over limit.</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Year you reach FRA</p>
            <p className="text-sm text-zinc-300">Exempt: {fmtC(65160)}/year. $1 withheld per $3 over limit.</p>
          </div>
        </div>
        <p className="text-xs text-zinc-500 mt-2">Withheld benefits are not lost. SSA recalculates at FRA to credit you. Only earned income counts.</p>
      </div>

      {/* Bottom */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 text-center">
        <p className="text-xs text-zinc-500 leading-relaxed">
          This calculator provides a simplified estimate using 2026 bend points ({fmtC(BEND1)}/{fmtC(BEND2)}) and does not perform full earnings indexing.
          Actual benefits depend on your complete earnings history with year-by-year inflation adjustments.
          For an exact estimate, use your my Social Security account at ssa.gov.
          Source: SSA.gov 2026 benefit calculation parameters.
        </p>
      </div>
    </ToolLayout>
  );
}
