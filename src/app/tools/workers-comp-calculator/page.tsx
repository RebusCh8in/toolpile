"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

/* ── State workers' comp data ── */
interface StateInfo {
  name: string;
  rate: number;       // TTD wage replacement % (of gross unless noted)
  rateNote?: string;  // if rate basis differs (spendable, after-tax, etc.)
  maxWeekly: number;  // max weekly TTD benefit
  minWeekly: number;  // min weekly TTD benefit
  waitDays: number;   // waiting period (days)
  retroDays: number;  // retroactive period (days)
  monopolistic?: boolean;
  optOut?: boolean;
  notes?: string;
}

const STATES: Record<string, StateInfo> = {
  AL: { name: "Alabama", rate: 66.67, maxWeekly: 1130, minWeekly: 275, waitDays: 3, retroDays: 21 },
  AK: { name: "Alaska", rate: 80, rateNote: "of spendable (after-tax) wages", maxWeekly: 1556, minWeekly: 270, waitDays: 3, retroDays: 28 },
  AZ: { name: "Arizona", rate: 66.67, maxWeekly: 943, minWeekly: 236, waitDays: 7, retroDays: 14 },
  AR: { name: "Arkansas", rate: 66.67, maxWeekly: 903, minWeekly: 25, waitDays: 7, retroDays: 14 },
  CA: { name: "California", rate: 66.67, maxWeekly: 1764, minWeekly: 265, waitDays: 3, retroDays: 14 },
  CO: { name: "Colorado", rate: 66.67, maxWeekly: 1338, minWeekly: 335, waitDays: 3, retroDays: 14 },
  CT: { name: "Connecticut", rate: 75, rateNote: "of spendable (after-tax) wages", maxWeekly: 1716, minWeekly: 343, waitDays: 3, retroDays: 14 },
  DE: { name: "Delaware", rate: 66.67, maxWeekly: 885, minWeekly: 295, waitDays: 3, retroDays: 21 },
  DC: { name: "District of Columbia", rate: 66.67, maxWeekly: 1809, minWeekly: 452, waitDays: 3, retroDays: 14 },
  FL: { name: "Florida", rate: 66.67, maxWeekly: 1358, minWeekly: 20, waitDays: 7, retroDays: 21, notes: "IB rate drops after 104 weeks" },
  GA: { name: "Georgia", rate: 66.67, maxWeekly: 800, minWeekly: 50, waitDays: 7, retroDays: 21, notes: "400-week cap unless catastrophic" },
  HI: { name: "Hawaii", rate: 66.67, maxWeekly: 1240, minWeekly: 310, waitDays: 3, retroDays: 14 },
  ID: { name: "Idaho", rate: 67, maxWeekly: 966, minWeekly: 349, waitDays: 5, retroDays: 14 },
  IL: { name: "Illinois", rate: 66.67, maxWeekly: 2009, minWeekly: 291, waitDays: 3, retroDays: 14, notes: "Updates every 6 months" },
  IN: { name: "Indiana", rate: 66.67, maxWeekly: 828, minWeekly: 75, waitDays: 7, retroDays: 21 },
  IA: { name: "Iowa", rate: 80, rateNote: "of spendable (after-tax) wages", maxWeekly: 2350, minWeekly: 398, waitDays: 3, retroDays: 14, notes: "Highest max weekly in US" },
  KS: { name: "Kansas", rate: 66.67, maxWeekly: 835, minWeekly: 25, waitDays: 7, retroDays: 21 },
  KY: { name: "Kentucky", rate: 66.67, maxWeekly: 1231, minWeekly: 246, waitDays: 7, retroDays: 14 },
  LA: { name: "Louisiana", rate: 66.67, maxWeekly: 845, minWeekly: 211, waitDays: 7, retroDays: 42, notes: "42-day retroactive period (longest tied with NE)" },
  ME: { name: "Maine", rate: 80, rateNote: "of after-tax wages", maxWeekly: 1431, minWeekly: 358, waitDays: 7, retroDays: 14 },
  MD: { name: "Maryland", rate: 66.67, maxWeekly: 1493, minWeekly: 50, waitDays: 3, retroDays: 14 },
  MA: { name: "Massachusetts", rate: 60, maxWeekly: 1829, minWeekly: 366, waitDays: 5, retroDays: 21 },
  MI: { name: "Michigan", rate: 80, rateNote: "of after-tax wages", maxWeekly: 1164, minWeekly: 349, waitDays: 7, retroDays: 14 },
  MN: { name: "Minnesota", rate: 66.67, maxWeekly: 1482, minWeekly: 185, waitDays: 3, retroDays: 10 },
  MS: { name: "Mississippi", rate: 66.67, maxWeekly: 631, minWeekly: 25, waitDays: 5, retroDays: 14, notes: "Lowest max weekly in US" },
  MO: { name: "Missouri", rate: 66.67, maxWeekly: 1228, minWeekly: 40, waitDays: 3, retroDays: 14 },
  MT: { name: "Montana", rate: 66.67, maxWeekly: 1084, minWeekly: 350, waitDays: 4, retroDays: 14 },
  NE: { name: "Nebraska", rate: 66.67, maxWeekly: 1130, minWeekly: 75, waitDays: 7, retroDays: 42, notes: "42-day retroactive period (longest tied with LA)" },
  NV: { name: "Nevada", rate: 66.67, maxWeekly: 1295, minWeekly: 324, waitDays: 5, retroDays: 20 },
  NH: { name: "New Hampshire", rate: 60, maxWeekly: 2309, minWeekly: 462, waitDays: 3, retroDays: 14, notes: "Max = 150% of SAWW. Second highest max in US" },
  NJ: { name: "New Jersey", rate: 70, maxWeekly: 1199, minWeekly: 299, waitDays: 7, retroDays: 7 },
  NM: { name: "New Mexico", rate: 66.67, maxWeekly: 1094, minWeekly: 137, waitDays: 7, retroDays: 28 },
  NY: { name: "New York", rate: 66.67, maxWeekly: 1222, minWeekly: 325, waitDays: 7, retroDays: 14 },
  NC: { name: "North Carolina", rate: 66.67, maxWeekly: 1380, minWeekly: 30, waitDays: 7, retroDays: 21 },
  ND: { name: "North Dakota", rate: 66.67, maxWeekly: 1514, minWeekly: 379, waitDays: 5, retroDays: 14, monopolistic: true },
  OH: { name: "Ohio", rate: 66.67, maxWeekly: 1281, minWeekly: 308, waitDays: 7, retroDays: 14, monopolistic: true },
  OK: { name: "Oklahoma", rate: 70, maxWeekly: 1083, minWeekly: 271, waitDays: 3, retroDays: 21 },
  OR: { name: "Oregon", rate: 66.67, maxWeekly: 1771, minWeekly: 50, waitDays: 3, retroDays: 14 },
  PA: { name: "Pennsylvania", rate: 66.67, maxWeekly: 1394, minWeekly: 599, waitDays: 7, retroDays: 14, notes: "Unusually high minimum weekly benefit" },
  RI: { name: "Rhode Island", rate: 75, rateNote: "of spendable (after-tax) wages", maxWeekly: 1534, minWeekly: 384, waitDays: 3, retroDays: 21 },
  SC: { name: "South Carolina", rate: 66.67, maxWeekly: 1178, minWeekly: 75, waitDays: 7, retroDays: 14 },
  SD: { name: "South Dakota", rate: 66.67, maxWeekly: 1066, minWeekly: 355, waitDays: 7, retroDays: 14 },
  TN: { name: "Tennessee", rate: 66.67, maxWeekly: 1361, minWeekly: 136, waitDays: 7, retroDays: 14 },
  TX: { name: "Texas", rate: 70, maxWeekly: 1271, minWeekly: 191, waitDays: 7, retroDays: 28, optOut: true, notes: "Only state where coverage is voluntary (employer opt-out)" },
  UT: { name: "Utah", rate: 66.67, maxWeekly: 1284, minWeekly: 45, waitDays: 3, retroDays: 14 },
  VT: { name: "Vermont", rate: 66.67, maxWeekly: 1763, minWeekly: 441, waitDays: 3, retroDays: 14 },
  VA: { name: "Virginia", rate: 66.67, maxWeekly: 1410, minWeekly: 353, waitDays: 7, retroDays: 21 },
  WA: { name: "Washington", rate: 60, rateNote: "to 75% (varies by marital/dependent status)", maxWeekly: 2196, minWeekly: 549, waitDays: 3, retroDays: 14, monopolistic: true, notes: "Rate varies by family status. Third highest max in US" },
  WV: { name: "West Virginia", rate: 66.67, maxWeekly: 1067, minWeekly: 267, waitDays: 3, retroDays: 14 },
  WI: { name: "Wisconsin", rate: 66.67, maxWeekly: 1326, minWeekly: 100, waitDays: 3, retroDays: 14 },
  WY: { name: "Wyoming", rate: 66.67, maxWeekly: 1177, minWeekly: 294, waitDays: 3, retroDays: 14, monopolistic: true },
};

const COMPARE_STATES = ["CA", "TX", "NY", "FL", "IL", "PA", "OH", "GA", "NC", "WA", "IA", "MS"];

export default function Page() {
  const [state, setState] = useState("CA");
  const [weeklyGross, setWeeklyGross] = useState(1200);
  const [weeksOff, setWeeksOff] = useState(8);

  const stateInfo = STATES[state];

  const result = useMemo(() => {
    const si = STATES[state];

    // Calculate TTD benefit
    // For spendable/after-tax states, estimate after-tax as ~75% of gross
    const isAfterTax = !!si.rateNote;
    const effectiveWage = isAfterTax ? weeklyGross * 0.75 : weeklyGross;
    const rawBenefit = effectiveWage * (si.rate / 100);
    const weeklyBenefit = Math.max(si.minWeekly, Math.min(si.maxWeekly, rawBenefit));

    // If actual wage is below minimum, benefit = actual wage (can't exceed earnings)
    const actualBenefit = Math.min(weeklyBenefit, weeklyGross);

    // Waiting period impact
    const totalDaysOff = weeksOff * 7;
    const waitingPeriodPaid = totalDaysOff >= si.retroDays;
    const unpaidDays = waitingPeriodPaid ? 0 : Math.min(si.waitDays, totalDaysOff);
    const paidDays = totalDaysOff - unpaidDays;
    const paidWeeks = paidDays / 7;

    const totalBenefits = actualBenefit * paidWeeks;
    const lostWages = weeklyGross * weeksOff;
    const wageReplacement = lostWages > 0 ? (totalBenefits / lostWages) * 100 : 0;

    const steps: string[] = [];
    steps.push(`Weekly gross wage: ${fmtC(weeklyGross)}`);
    if (isAfterTax) {
      steps.push(`Estimated after-tax wage (75%): ${fmtC(effectiveWage)}`);
      steps.push(`${si.rate}% of after-tax wage: ${fmtC(rawBenefit)}`);
    } else {
      steps.push(`${si.rate}% of gross wage: ${fmtC(rawBenefit)}`);
    }
    if (rawBenefit > si.maxWeekly) steps.push(`Capped at state maximum: ${fmtC(si.maxWeekly)}/week`);
    if (rawBenefit < si.minWeekly && weeklyGross >= si.minWeekly) steps.push(`Raised to state minimum: ${fmtC(si.minWeekly)}/week`);
    steps.push(`Weekly TTD benefit: ${fmtC(actualBenefit)}`);
    steps.push(`Waiting period: ${si.waitDays} days (${waitingPeriodPaid ? `paid retroactively — disability exceeds ${si.retroDays} days` : `not paid — disability under ${si.retroDays} days`})`);
    steps.push(`Paid weeks: ${paidWeeks.toFixed(1)} of ${weeksOff} weeks off`);
    steps.push(`Total estimated benefits: ${fmtC(totalBenefits)}`);
    steps.push(`Lost wages: ${fmtC(lostWages)} → Wage replacement: ${wageReplacement.toFixed(1)}%`);

    // State comparisons
    const comparisons = COMPARE_STATES
      .filter(s => s !== state)
      .slice(0, 7)
      .map(s => {
        const csi = STATES[s];
        const cIsAfterTax = !!csi.rateNote;
        const cEffWage = cIsAfterTax ? weeklyGross * 0.75 : weeklyGross;
        const cRaw = cEffWage * (csi.rate / 100);
        const cWeekly = Math.min(Math.max(csi.minWeekly, Math.min(csi.maxWeekly, cRaw)), weeklyGross);
        const cTotalDays = weeksOff * 7;
        const cWaitPaid = cTotalDays >= csi.retroDays;
        const cUnpaid = cWaitPaid ? 0 : Math.min(csi.waitDays, cTotalDays);
        const cPaidWeeks = (cTotalDays - cUnpaid) / 7;
        return { state: s, name: csi.name, weeklyBenefit: cWeekly, total: cWeekly * cPaidWeeks, maxWeekly: csi.maxWeekly };
      });

    return { actualBenefit, totalBenefits, lostWages, wageReplacement, paidWeeks, waitingPeriodPaid, steps, comparisons, rawBenefit };
  }, [state, weeklyGross, weeksOff]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 text-sm";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const cardCls = "bg-zinc-900 border border-zinc-800 rounded-xl p-4";

  return (
    <ToolLayout
      title="Workers' Compensation Calculator"
      description="Estimate your workers' comp benefits for all 50 states. Uses your state's TTD wage replacement rate, maximum and minimum weekly benefits, waiting periods, and retroactive rules."
      slug="workers-comp-calculator"
      category="Finance"
      keywords={[
        "workers comp calculator",
        "workers compensation calculator",
        "workers comp benefits calculator",
        "how much does workers comp pay",
        "workers comp payment calculator",
        "TTD calculator",
        "workers comp by state",
      ]}
      faqs={[
        {
          question: "How much does workers' comp pay?",
          answer: "Most states pay 66.67% (two-thirds) of your average weekly wage (AWW) for temporary total disability (TTD). A few states use different rates: Massachusetts and New Hampshire pay 60%, New Jersey, Oklahoma, and Texas pay 70%, and Connecticut, Rhode Island, Alaska, Iowa, Maine, and Michigan use 75-80% of after-tax wages. All states cap the weekly benefit — ranging from $631 in Mississippi to $2,350 in Iowa.",
        },
        {
          question: "Is workers' comp taxable?",
          answer: "No. Workers' compensation benefits are not subject to federal income tax. However, if you also receive Social Security Disability Insurance (SSDI), part of your SSDI benefits may become taxable if your combined workers' comp + SSDI exceeds 80% of your pre-injury earnings. State tax treatment follows the federal exemption in all states.",
        },
        {
          question: "What is the waiting period?",
          answer: "The waiting period is the number of days after your injury before wage replacement benefits begin (medical treatment is covered from day one). Most states have either a 3-day or 7-day waiting period. If your disability exceeds the 'retroactive period' (typically 14-21 days), the waiting period is paid retroactively. This means for longer injuries, you get paid for the full time off.",
        },
        {
          question: "What are monopolistic states?",
          answer: "Four states require employers to purchase workers' comp exclusively from a state fund (no private insurers): Ohio (BWC), Washington (L&I), Wyoming (DWS), and North Dakota (WSI). This doesn't affect your benefits — it just means the state government, not a private insurer, manages the claims.",
        },
        {
          question: "Can my employer opt out of workers' comp?",
          answer: "Texas is the only state where workers' comp coverage is truly voluntary. Employers who opt out ('non-subscribers') lose certain legal protections and can be sued by injured workers without the usual defenses. Oklahoma had an opt-out system starting in 2013, but it was ruled unconstitutional in 2016. In all other states, coverage is mandatory.",
        },
        {
          question: "What's the difference between TTD, TPD, PPD, and PTD?",
          answer: "TTD (Temporary Total Disability) pays when you can't work at all during recovery — this is what this calculator estimates. TPD (Temporary Partial Disability) pays a portion when you can work light duty at reduced wages. PPD (Permanent Partial Disability) compensates for lasting impairment after you reach maximum medical improvement. PTD (Permanent Total Disability) pays ongoing benefits when you can never return to work.",
        },
        {
          question: "How long do workers' comp benefits last?",
          answer: "TTD benefits typically last until you can return to work or reach Maximum Medical Improvement (MMI). Most states don't have a strict time limit on TTD, but some do (Georgia caps at 400 weeks unless catastrophic). PPD benefits have scheduled durations based on the body part and impairment percentage. PTD benefits may last until retirement age or for life, depending on the state.",
        },
        {
          question: "Does workers' comp cover medical bills?",
          answer: "Yes, separately from wage replacement. Workers' comp covers all reasonable and necessary medical treatment related to your work injury — typically with no deductibles, copays, or coverage limits. This includes ER visits, surgery, physical therapy, prescriptions, and medical devices. You generally must use approved providers or get authorization.",
        },
      ]}
      relatedTools={[
        { name: "Personal Injury Calculator", href: "/tools/personal-injury-calculator" },
        { name: "Salary Calculator", href: "/tools/salary-calculator" },
        { name: "Paycheck Calculator", href: "/tools/paycheck-calculator" },
      ]}
      guide={
        <>
          <h2>How This Workers&apos; Comp Calculator Works</h2>
          <p>
            This calculator estimates your Temporary Total Disability (TTD) benefits based on your state&apos;s workers&apos; compensation rules. TTD is the most common type of workers&apos; comp benefit — it replaces a portion of your wages while you&apos;re unable to work due to a job-related injury or illness.
          </p>

          <h3>The Basic Formula</h3>
          <p>
            <strong>Weekly Benefit = AWW x State Rate</strong> (subject to state min/max caps)
          </p>
          <p>
            Most states use 66.67% (two-thirds) of your Average Weekly Wage. A few states use after-tax wages at higher percentages (75-80%), which often produces similar dollar amounts.
          </p>

          <h3>Waiting and Retroactive Periods</h3>
          <p>
            Every state has a waiting period (3-7 days) before wage benefits begin — medical treatment is covered from day one. If your disability exceeds the retroactive period (typically 14-21 days), the waiting period is paid retroactively, meaning you get paid for the full time off work.
          </p>

          <h3>Why Benefits Are Tax-Free</h3>
          <p>
            Workers&apos; comp benefits are exempt from federal and state income tax. This means your $800/week benefit has the same spending power as roughly $1,000-1,100/week in regular wages. When evaluating your wage replacement, consider that you&apos;re keeping more of each dollar.
          </p>
        </>
      }
    >
      {/* Disclaimer */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
        <p className="text-sm text-yellow-400 font-medium mb-1">Important Disclaimer</p>
        <p className="text-sm text-zinc-400">
          This estimates Temporary Total Disability (TTD) benefits only. Actual benefits depend on your employer&apos;s coverage, your specific wage history, and your state&apos;s workers&apos; comp board determination. Benefits are tax-free.
        </p>
      </div>

      {/* Inputs */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className={labelCls}>State</label>
          <select value={state} onChange={e => setState(e.target.value)} className={inputCls}>
            {Object.entries(STATES)
              .sort((a, b) => a[1].name.localeCompare(b[1].name))
              .map(([code, s]) => (
                <option key={code} value={code}>{s.name}</option>
              ))}
          </select>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span className="text-xs text-zinc-500">{stateInfo.rate}%{stateInfo.rateNote ? ` ${stateInfo.rateNote}` : " of gross wages"}</span>
            {stateInfo.monopolistic && <span className="text-xs font-medium bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full">Monopolistic</span>}
            {stateInfo.optOut && <span className="text-xs font-medium bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full">Opt-Out State</span>}
          </div>
        </div>

        <div>
          <label className={labelCls}>Weekly Gross Wage ($)</label>
          <input type="number" value={weeklyGross} onChange={e => setWeeklyGross(Math.max(0, +e.target.value))} className={inputCls} min={0} step={50} />
          <p className="text-xs text-zinc-500 mt-1">{fmtC(weeklyGross * 52)}/year</p>
        </div>

        <div>
          <label className={labelCls}>Weeks Off Work</label>
          <input type="number" value={weeksOff} onChange={e => setWeeksOff(Math.max(0, +e.target.value))} className={inputCls} min={0} max={520} step={1} />
          <p className="text-xs text-zinc-500 mt-1">{(weeksOff / 4.33).toFixed(1)} months</p>
        </div>
      </div>

      {/* Primary Result */}
      <div className={cardCls + " text-center mb-6"}>
        <p className="text-sm text-zinc-400 mb-2">Estimated Weekly TTD Benefit</p>
        <p className="text-5xl font-bold text-blue-400 mb-2">{fmtC(result.actualBenefit)}<span className="text-xl text-zinc-500">/week</span></p>
        <p className="text-lg text-zinc-300">{fmtC(result.totalBenefits)} total over {result.paidWeeks.toFixed(1)} paid weeks</p>
        <p className="text-sm text-zinc-500 mt-1">Tax-free (not subject to federal or state income tax)</p>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className={cardCls + " text-center"}>
          <p className="text-xs text-zinc-500">State Max Weekly</p>
          <p className="text-lg font-bold text-zinc-100">{fmtC(stateInfo.maxWeekly)}</p>
        </div>
        <div className={cardCls + " text-center"}>
          <p className="text-xs text-zinc-500">State Min Weekly</p>
          <p className="text-lg font-bold text-zinc-100">{fmtC(stateInfo.minWeekly)}</p>
        </div>
        <div className={cardCls + " text-center"}>
          <p className="text-xs text-zinc-500">Waiting Period</p>
          <p className="text-lg font-bold text-zinc-100">{stateInfo.waitDays} days</p>
        </div>
        <div className={cardCls + " text-center"}>
          <p className="text-xs text-zinc-500">Retroactive After</p>
          <p className="text-lg font-bold text-zinc-100">{stateInfo.retroDays} days</p>
        </div>
      </div>

      {/* Wage replacement */}
      <div className={cardCls + " mb-6"}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-400">Effective Wage Replacement</span>
          <span className="text-lg font-bold text-zinc-100">{result.wageReplacement.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-3 mb-2">
          <div className="bg-blue-500 h-3 rounded-full transition-all" style={{ width: `${Math.min(100, result.wageReplacement)}%` }} />
        </div>
        <div className="flex justify-between text-xs text-zinc-500">
          <span>Lost wages: {fmtC(result.lostWages)}</span>
          <span>Benefits: {fmtC(result.totalBenefits)}</span>
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          Since benefits are tax-free, your effective replacement is higher than the percentage suggests. At a ~25% tax rate, {fmtC(result.actualBenefit)}/week tax-free ≈ {fmtC(result.actualBenefit / 0.75)}/week pre-tax.
        </p>
      </div>

      {/* Steps */}
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

      {/* State notes */}
      {stateInfo.notes && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
          <p className="text-sm text-zinc-400">{stateInfo.notes}</p>
        </div>
      )}

      {/* State Comparison */}
      <div className={cardCls + " mb-6"}>
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">State Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs">
                <th className="text-left px-3 py-2 font-medium">State</th>
                <th className="text-right px-3 py-2 font-medium">Weekly Benefit</th>
                <th className="text-right px-3 py-2 font-medium">State Max</th>
                <th className="text-right px-3 py-2 font-medium">Total ({weeksOff} wk)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-800 bg-blue-500/10">
                <td className="px-3 py-2 text-blue-400 font-medium">{stateInfo.name} (selected)</td>
                <td className="px-3 py-2 text-right text-blue-400 font-medium">{fmtC(result.actualBenefit)}</td>
                <td className="px-3 py-2 text-right text-blue-400">{fmtC(stateInfo.maxWeekly)}</td>
                <td className="px-3 py-2 text-right text-blue-400">{fmtC(result.totalBenefits)}</td>
              </tr>
              {result.comparisons.map(c => (
                <tr key={c.state} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="px-3 py-2 text-zinc-300">{c.name}</td>
                  <td className="px-3 py-2 text-right text-zinc-300">{fmtC(c.weeklyBenefit)}</td>
                  <td className="px-3 py-2 text-right text-zinc-500">{fmtC(c.maxWeekly)}</td>
                  <td className="px-3 py-2 text-right text-zinc-400">{fmtC(c.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom disclaimer */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 text-center">
        <p className="text-xs text-zinc-500 leading-relaxed">
          This calculator estimates Temporary Total Disability (TTD) benefits only. Actual benefits are determined by your
          state&apos;s workers&apos; compensation board based on your verified wage history and medical documentation.
          Medical treatment costs are covered separately with no deductibles or copays.
          Maximum weekly benefits are updated annually by each state — rates shown reflect the most recent published figures.
          Consult your state&apos;s workers&apos; comp board or an attorney for your specific situation.
        </p>
      </div>
    </ToolLayout>
  );
}
