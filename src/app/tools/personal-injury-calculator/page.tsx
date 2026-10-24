"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

/* ── Negligence rules ── */
type NegRule = "pure_comparative" | "modified_50" | "modified_51" | "contributory";

interface StateInfo {
  name: string;
  rule: NegRule;
  damageCap?: number; // non-economic cap in general PI (0 = no cap)
  capNote?: string;
}

const RULE_LABELS: Record<NegRule, string> = {
  pure_comparative: "Pure Comparative Negligence",
  modified_50: "Modified Comparative (50% Bar)",
  modified_51: "Modified Comparative (51% Bar)",
  contributory: "Pure Contributory Negligence",
};

const RULE_DESC: Record<NegRule, string> = {
  pure_comparative: "You can recover damages even if you are up to 99% at fault. Your award is reduced by your fault percentage.",
  modified_50: "You are barred from recovery if you are 50% or more at fault. Below 50%, your award is reduced by your fault percentage.",
  modified_51: "You are barred from recovery if you are 51% or more at fault. At 50% or below, your award is reduced by your fault percentage.",
  contributory: "You are completely barred from recovery if you are even 1% at fault. This is the harshest rule, used by only 4 states + DC.",
};

const STATES: Record<string, StateInfo> = {
  AL: { name: "Alabama", rule: "contributory" },
  AK: { name: "Alaska", rule: "pure_comparative" },
  AZ: { name: "Arizona", rule: "pure_comparative" },
  AR: { name: "Arkansas", rule: "modified_50" },
  CA: { name: "California", rule: "pure_comparative" },
  CO: { name: "Colorado", rule: "modified_50", damageCap: 1500000, capNote: "$1.5M non-economic cap (raised Jan 2025 via HB 24-1472, inflation-adjusted biennially from 2028)" },
  CT: { name: "Connecticut", rule: "modified_51" },
  DE: { name: "Delaware", rule: "modified_51" },
  DC: { name: "District of Columbia", rule: "contributory" },
  FL: { name: "Florida", rule: "modified_51" },
  GA: { name: "Georgia", rule: "modified_50" },
  HI: { name: "Hawaii", rule: "modified_51" },
  ID: { name: "Idaho", rule: "modified_50" },
  IL: { name: "Illinois", rule: "modified_51" },
  IN: { name: "Indiana", rule: "modified_51" },
  IA: { name: "Iowa", rule: "modified_51" },
  KS: { name: "Kansas", rule: "modified_50" },
  KY: { name: "Kentucky", rule: "pure_comparative" },
  LA: { name: "Louisiana", rule: "pure_comparative" },
  ME: { name: "Maine", rule: "modified_50" },
  MD: { name: "Maryland", rule: "contributory", damageCap: 965000, capNote: "$965K non-economic cap (2026, increases $15K/year)" },
  MA: { name: "Massachusetts", rule: "modified_51" },
  MI: { name: "Michigan", rule: "modified_51" },
  MN: { name: "Minnesota", rule: "modified_51" },
  MS: { name: "Mississippi", rule: "pure_comparative" },
  MO: { name: "Missouri", rule: "pure_comparative" },
  MT: { name: "Montana", rule: "modified_51" },
  NE: { name: "Nebraska", rule: "modified_50" },
  NV: { name: "Nevada", rule: "modified_51" },
  NH: { name: "New Hampshire", rule: "modified_51" },
  NJ: { name: "New Jersey", rule: "modified_51" },
  NM: { name: "New Mexico", rule: "pure_comparative" },
  NY: { name: "New York", rule: "pure_comparative" },
  NC: { name: "North Carolina", rule: "contributory" },
  ND: { name: "North Dakota", rule: "modified_50" },
  OH: { name: "Ohio", rule: "modified_51", damageCap: 350000, capNote: "Greater of $250K or 3x economic damages (max $350K). Does not apply to permanent/serious injuries." },
  OK: { name: "Oklahoma", rule: "modified_51" },
  OR: { name: "Oregon", rule: "modified_51" },
  PA: { name: "Pennsylvania", rule: "modified_51" },
  RI: { name: "Rhode Island", rule: "pure_comparative" },
  SC: { name: "South Carolina", rule: "modified_51" },
  SD: { name: "South Dakota", rule: "pure_comparative" },
  TN: { name: "Tennessee", rule: "modified_50", damageCap: 750000, capNote: "$750K non-economic cap ($1M for catastrophic injuries)" },
  TX: { name: "Texas", rule: "modified_51" },
  UT: { name: "Utah", rule: "modified_50" },
  VT: { name: "Vermont", rule: "modified_51" },
  VA: { name: "Virginia", rule: "contributory" },
  WA: { name: "Washington", rule: "pure_comparative" },
  WV: { name: "West Virginia", rule: "modified_50" },
  WI: { name: "Wisconsin", rule: "modified_51" },
  WY: { name: "Wyoming", rule: "modified_51" },
};

/* ── Injury severity ── */
interface SeverityInfo {
  label: string;
  multiplierLow: number;
  multiplierHigh: number;
  description: string;
}

const SEVERITIES: Record<string, SeverityInfo> = {
  minor: { label: "Minor / Soft Tissue", multiplierLow: 1.5, multiplierHigh: 3, description: "Whiplash, sprains, strains, bruising. Full recovery expected in weeks to months." },
  moderate: { label: "Moderate", multiplierLow: 3, multiplierHigh: 5, description: "Broken bones, moderate disc herniation, concussion with lingering symptoms, months of physical therapy." },
  severe: { label: "Severe", multiplierLow: 5, multiplierHigh: 7, description: "Surgery required, multiple fractures, significant disc injuries, moderate TBI." },
  catastrophic: { label: "Permanent / Catastrophic", multiplierLow: 7, multiplierHigh: 10, description: "Spinal cord injury, severe TBI, amputation, severe burns, permanent disfigurement." },
};

/* ── Comparison states ── */
const COMPARE_STATES = ["CA", "NY", "TX", "FL", "IL", "PA", "OH", "GA", "NC", "VA", "CO", "AL"];

export default function Page() {
  const [state, setState] = useState("CA");
  const [severity, setSeverity] = useState("moderate");
  const [medicalBills, setMedicalBills] = useState(15000);
  const [futureMedical, setFutureMedical] = useState(0);
  const [lostWages, setLostWages] = useState(5000);
  const [futureLostWages, setFutureLostWages] = useState(0);
  const [propertyDamage, setPropertyDamage] = useState(8000);
  const [faultPct, setFaultPct] = useState(0);
  const [policyLimit, setPolicyLimit] = useState(100000);
  const [hadSurgery, setHadSurgery] = useState(false);
  const [permanentInjury, setPermanentInjury] = useState(false);

  const stateInfo = STATES[state];
  const sev = SEVERITIES[severity];

  const result = useMemo(() => {
    const si = STATES[state];
    const sv = SEVERITIES[severity];

    // Calculate multiplier adjustments
    let multAdj = 0;
    if (hadSurgery) multAdj += 0.5;
    if (permanentInjury) multAdj += 1.0;

    const multLow = sv.multiplierLow + multAdj;
    const multHigh = sv.multiplierHigh + multAdj;

    // Special damages (economic)
    const totalMedical = medicalBills + futureMedical;
    const totalLostWages = lostWages + futureLostWages;
    const specialDamages = totalMedical + totalLostWages + propertyDamage;

    // General damages (pain & suffering) via multiplier method
    const generalLow = totalMedical * multLow;
    const generalHigh = totalMedical * multHigh;

    // Total before fault/caps
    const totalLow = specialDamages + generalLow;
    const totalHigh = specialDamages + generalHigh;

    // Apply state damage cap to non-economic portion only
    let cappedGeneralLow = generalLow;
    let cappedGeneralHigh = generalHigh;
    let capApplied = false;
    if (si.damageCap && si.damageCap > 0) {
      if (generalLow > si.damageCap) { cappedGeneralLow = si.damageCap; capApplied = true; }
      if (generalHigh > si.damageCap) { cappedGeneralHigh = si.damageCap; capApplied = true; }
    }
    const cappedTotalLow = specialDamages + cappedGeneralLow;
    const cappedTotalHigh = specialDamages + cappedGeneralHigh;

    // Apply fault reduction
    let canRecover = true;
    let faultReduction = faultPct / 100;
    if (si.rule === "contributory" && faultPct > 0) {
      canRecover = false;
      faultReduction = 1;
    } else if (si.rule === "modified_50" && faultPct >= 50) {
      canRecover = false;
      faultReduction = 1;
    } else if (si.rule === "modified_51" && faultPct > 50) {
      canRecover = false;
      faultReduction = 1;
    }

    const afterFaultLow = canRecover ? cappedTotalLow * (1 - faultReduction) : 0;
    const afterFaultHigh = canRecover ? cappedTotalHigh * (1 - faultReduction) : 0;

    // Apply policy limit
    const finalLow = Math.min(afterFaultLow, policyLimit);
    const finalHigh = Math.min(afterFaultHigh, policyLimit);
    const policyLimited = afterFaultHigh > policyLimit;

    // Steps
    const steps: string[] = [];
    steps.push(`Medical bills: ${fmtC(medicalBills)}${futureMedical > 0 ? ` + ${fmtC(futureMedical)} future` : ""} = ${fmtC(totalMedical)}`);
    steps.push(`Lost wages: ${fmtC(lostWages)}${futureLostWages > 0 ? ` + ${fmtC(futureLostWages)} future` : ""} = ${fmtC(totalLostWages)}`);
    steps.push(`Property damage: ${fmtC(propertyDamage)}`);
    steps.push(`Special damages (economic): ${fmtC(specialDamages)}`);
    steps.push(`Pain & suffering multiplier: ${multLow.toFixed(1)}x - ${multHigh.toFixed(1)}x${hadSurgery ? " (+0.5 surgery)" : ""}${permanentInjury ? " (+1.0 permanent)" : ""}`);
    steps.push(`General damages (pain & suffering): ${fmtC(generalLow)} - ${fmtC(generalHigh)}`);
    if (capApplied) steps.push(`State damage cap applied: ${fmtC(si.damageCap!)} on non-economic damages`);
    steps.push(`Total before fault: ${fmtC(cappedTotalLow)} - ${fmtC(cappedTotalHigh)}`);
    if (faultPct > 0) {
      if (!canRecover) {
        steps.push(`${si.name} uses ${RULE_LABELS[si.rule]} — ${faultPct}% fault BARS recovery`);
      } else {
        steps.push(`Fault reduction (${faultPct}%): -${fmtC(cappedTotalLow * faultReduction)} to -${fmtC(cappedTotalHigh * faultReduction)}`);
        steps.push(`After fault: ${fmtC(afterFaultLow)} - ${fmtC(afterFaultHigh)}`);
      }
    }
    if (policyLimited) steps.push(`Policy limit applied: ${fmtC(policyLimit)}`);

    // State comparisons
    const comparisons = COMPARE_STATES
      .filter(s => s !== state)
      .slice(0, 6)
      .map(s => {
        const csi = STATES[s];
        let cCanRecover = true;
        let cReduction = faultPct / 100;
        if (csi.rule === "contributory" && faultPct > 0) { cCanRecover = false; }
        else if (csi.rule === "modified_50" && faultPct >= 50) { cCanRecover = false; }
        else if (csi.rule === "modified_51" && faultPct > 50) { cCanRecover = false; }

        let cGenHigh = generalHigh;
        if (csi.damageCap && csi.damageCap > 0 && cGenHigh > csi.damageCap) cGenHigh = csi.damageCap;
        const cTotal = specialDamages + cGenHigh;
        const cAfter = cCanRecover ? cTotal * (1 - cReduction) : 0;
        const cFinal = Math.min(cAfter, policyLimit);

        return { state: s, name: csi.name, rule: RULE_LABELS[csi.rule], amount: cFinal, barred: !cCanRecover };
      });

    return { finalLow, finalHigh, specialDamages, generalLow, generalHigh, multLow, multHigh, canRecover, faultReduction, capApplied, policyLimited, steps, comparisons, totalMedical };
  }, [state, severity, medicalBills, futureMedical, lostWages, futureLostWages, propertyDamage, faultPct, policyLimit, hadSurgery, permanentInjury]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 text-sm";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const cardCls = "bg-zinc-900 border border-zinc-800 rounded-xl p-4";

  const ruleBadgeColor = stateInfo.rule === "pure_comparative" ? "bg-green-500/20 text-green-400" :
    stateInfo.rule === "modified_51" ? "bg-blue-500/20 text-blue-400" :
    stateInfo.rule === "modified_50" ? "bg-yellow-500/20 text-yellow-400" :
    "bg-red-500/20 text-red-400";

  return (
    <ToolLayout
      title="Personal Injury Settlement Calculator"
      description="Estimate your personal injury settlement value using the insurance industry multiplier method. Factors in injury severity, medical bills, lost wages, your state's negligence rules, and insurance policy limits."
      slug="personal-injury-calculator"
      category="Finance"
      keywords={[
        "personal injury calculator",
        "injury settlement calculator",
        "car accident settlement calculator",
        "how much is my injury claim worth",
        "personal injury settlement estimate",
        "pain and suffering calculator",
        "accident settlement calculator",
      ]}
      faqs={[
        {
          question: "How are personal injury settlements calculated?",
          answer: "Insurance companies use the 'multiplier method' as a starting point. Your total medical expenses are multiplied by a factor (typically 1.5x for minor injuries up to 10x for catastrophic injuries) to estimate pain and suffering. Lost wages and property damage are added on top. The result is then adjusted for your percentage of fault under your state's negligence rules, and capped by the defendant's insurance policy limits.",
        },
        {
          question: "What is the pain and suffering multiplier?",
          answer: "The multiplier is a number (typically 1.5 to 10) applied to your medical expenses to estimate non-economic damages like pain, suffering, emotional distress, and loss of enjoyment of life. Minor soft tissue injuries use 1.5-3x, moderate injuries like broken bones use 3-5x, severe injuries requiring surgery use 5-7x, and catastrophic or permanent injuries use 7-10x or higher. Surgery, permanent impairment, and objective diagnostic evidence increase the multiplier.",
        },
        {
          question: "What is comparative negligence?",
          answer: "Comparative negligence reduces your settlement by your percentage of fault. In 'pure comparative' states (like CA and NY), you can recover even at 99% fault. In 'modified comparative' states, you're barred at 50% or 51% fault depending on the state. In 'pure contributory' states (AL, MD, NC, VA, DC), you're barred from any recovery if you're even 1% at fault.",
        },
        {
          question: "How do insurance policy limits affect my settlement?",
          answer: "The defendant's insurance policy limit is often the practical ceiling on your recovery, regardless of the theoretical value of your case. If your case is worth $500,000 but the defendant only carries $50,000 in liability coverage, you'll likely recover only $50,000 unless the defendant has significant personal assets. Your own underinsured motorist (UIM) coverage can supplement the gap.",
        },
        {
          question: "Does having surgery increase my settlement?",
          answer: "Yes, significantly. Cases involving surgery typically settle for 2-5x more than conservative-treatment-only cases. Surgery provides objective evidence of injury severity and demonstrates that less invasive treatments were insufficient. The type of surgery matters — spinal fusion, joint replacement, and internal fixation of fractures carry the most weight.",
        },
        {
          question: "What if I have pre-existing conditions?",
          answer: "Under the 'eggshell plaintiff' doctrine, the defendant takes you as they find you — if a minor impact caused a major injury because of a pre-existing condition, the defendant is still liable. However, insurance adjusters will argue that your treatment was for the pre-existing condition, not the accident. The key is proving the accident caused an aggravation or exacerbation of your condition. Medical records documenting your condition before and after the accident are critical.",
        },
        {
          question: "Do most states cap pain and suffering damages?",
          answer: "No. Most states do NOT cap non-economic damages in general personal injury cases. Only about 4 states have enforceable general PI caps (CO, MD, OH, TN). Kansas and Oklahoma had caps that were struck down as unconstitutional in 2019. Many more states cap damages in medical malpractice cases specifically, but those caps don't apply to car accidents, slip and falls, or other general injury claims.",
        },
        {
          question: "Should I get a lawyer for my personal injury claim?",
          answer: "Studies consistently show that represented claimants receive 3-3.5x more in settlements than unrepresented claimants, even after attorney fees (typically 33-40% on contingency). For minor soft tissue injuries with clear liability and low medical bills, you may be able to handle the claim yourself. For moderate to severe injuries, surgery cases, disputed liability, or cases involving permanent impairment, an attorney will almost certainly increase your net recovery.",
        },
      ]}
      relatedTools={[
        { name: "Child Support Calculator", href: "/tools/child-support-calculator" },
        { name: "Alimony Calculator", href: "/tools/alimony-calculator" },
        { name: "Salary Calculator", href: "/tools/salary-calculator" },
      ]}
      guide={
        <>
          <h2>How This Personal Injury Calculator Works</h2>
          <p>
            This calculator estimates your personal injury settlement using the <strong>multiplier method</strong>, which is the standard approach used by insurance adjusters and personal injury attorneys to value claims.
          </p>

          <h3>The Multiplier Method</h3>
          <p>
            Your medical expenses (called &ldquo;special damages&rdquo;) are multiplied by a factor based on your injury severity to estimate pain and suffering (&ldquo;general damages&rdquo;). Lost wages and property damage are added as separate economic damages. The formula:
          </p>
          <p>
            <strong>Settlement = Medical Bills + (Medical Bills x Multiplier) + Lost Wages + Property Damage</strong>
          </p>

          <h3>State Negligence Rules</h3>
          <p>
            Your state&apos;s negligence law determines how fault affects your recovery. Pure comparative states let you recover at any fault level (reduced proportionally). Modified comparative states bar you at 50% or 51% fault. Five jurisdictions (AL, MD, NC, VA, DC) use pure contributory negligence, which bars any recovery if you&apos;re even 1% at fault.
          </p>

          <h3>Why Results Are Estimates</h3>
          <p>
            Insurance companies use proprietary software (like Colossus) that considers hundreds of factors. The multiplier method is a simplified version of what that software does. Actual settlements depend on the specific facts of your case, the quality of evidence, the jurisdiction, the judge or jury pool, whether you have an attorney, and the defendant&apos;s insurance coverage. This calculator provides a reasonable range — not a guarantee.
          </p>
        </>
      }
    >
      {/* Disclaimer */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
        <p className="text-sm text-yellow-400 font-medium mb-1">Important Disclaimer</p>
        <p className="text-sm text-zinc-400">
          This is an estimate only. Actual settlements depend on specific facts, evidence quality, jurisdiction, and attorney involvement. This is not legal advice — consult a personal injury attorney for your case.
        </p>
      </div>

      {/* Inputs */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelCls}>State</label>
          <select value={state} onChange={e => setState(e.target.value)} className={inputCls}>
            {Object.entries(STATES)
              .sort((a, b) => a[1].name.localeCompare(b[1].name))
              .map(([code, s]) => (
                <option key={code} value={code}>{s.name}</option>
              ))}
          </select>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ruleBadgeColor}`}>
              {RULE_LABELS[stateInfo.rule]}
            </span>
          </div>
        </div>

        <div>
          <label className={labelCls}>Injury Severity</label>
          <select value={severity} onChange={e => setSeverity(e.target.value)} className={inputCls}>
            {Object.entries(SEVERITIES).map(([key, s]) => (
              <option key={key} value={key}>{s.label} ({s.multiplierLow}x - {s.multiplierHigh}x)</option>
            ))}
          </select>
          <p className="text-xs text-zinc-500 mt-1">{sev.description}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelCls}>Medical Bills to Date ($)</label>
          <input type="number" value={medicalBills} onChange={e => setMedicalBills(Math.max(0, +e.target.value))} className={inputCls} min={0} step={500} />
        </div>
        <div>
          <label className={labelCls}>Estimated Future Medical Costs ($)</label>
          <input type="number" value={futureMedical} onChange={e => setFutureMedical(Math.max(0, +e.target.value))} className={inputCls} min={0} step={500} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelCls}>Lost Wages to Date ($)</label>
          <input type="number" value={lostWages} onChange={e => setLostWages(Math.max(0, +e.target.value))} className={inputCls} min={0} step={500} />
        </div>
        <div>
          <label className={labelCls}>Estimated Future Lost Wages ($)</label>
          <input type="number" value={futureLostWages} onChange={e => setFutureLostWages(Math.max(0, +e.target.value))} className={inputCls} min={0} step={500} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelCls}>Property Damage ($)</label>
          <input type="number" value={propertyDamage} onChange={e => setPropertyDamage(Math.max(0, +e.target.value))} className={inputCls} min={0} step={500} />
        </div>
        <div>
          <label className={labelCls}>Defendant&apos;s Insurance Policy Limit ($)</label>
          <input type="number" value={policyLimit} onChange={e => setPolicyLimit(Math.max(0, +e.target.value))} className={inputCls} min={0} step={5000} />
          <p className="text-xs text-zinc-500 mt-1">Practical ceiling on recovery</p>
        </div>
      </div>

      <div className="mb-6">
        <label className={labelCls}>Your Fault Percentage: {faultPct}%</label>
        <input type="range" min={0} max={100} step={1} value={faultPct} onChange={e => setFaultPct(+e.target.value)} className="w-full accent-blue-500" />
        <div className="flex justify-between text-xs text-zinc-500 mt-1">
          <span>0% (no fault)</span>
          <span>50%</span>
          <span>100%</span>
        </div>
        {faultPct > 0 && (
          <p className="text-xs mt-1.5 text-zinc-400">{RULE_DESC[stateInfo.rule]}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
          <input type="checkbox" checked={hadSurgery} onChange={e => setHadSurgery(e.target.checked)} className="accent-blue-500" />
          Surgery required (+0.5x multiplier)
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
          <input type="checkbox" checked={permanentInjury} onChange={e => setPermanentInjury(e.target.checked)} className="accent-blue-500" />
          Permanent injury/impairment (+1.0x multiplier)
        </label>
      </div>

      {/* Primary Result */}
      <div className={cardCls + " text-center mb-6"}>
        <p className="text-sm text-zinc-400 mb-2">Estimated Settlement Range</p>
        {result.canRecover ? (
          <>
            <p className="text-4xl font-bold text-blue-400 mb-2">{fmtC(result.finalLow)} — {fmtC(result.finalHigh)}</p>
            {result.policyLimited && (
              <p className="text-sm text-yellow-400">Limited by ${policyLimit.toLocaleString()} policy limit</p>
            )}
            {result.capApplied && stateInfo.capNote && (
              <p className="text-sm text-yellow-400">{stateInfo.capNote}</p>
            )}
          </>
        ) : (
          <div>
            <p className="text-4xl font-bold text-red-400 mb-2">$0 — Barred</p>
            <p className="text-sm text-red-300">{stateInfo.name} uses {RULE_LABELS[stateInfo.rule]}. At {faultPct}% fault, you cannot recover damages.</p>
          </div>
        )}
      </div>

      {/* Breakdown */}
      <div className="grid md:grid-cols-2 gap-3 mb-6">
        <div className={cardCls + " text-center"}>
          <p className="text-xs text-zinc-500">Special Damages (Economic)</p>
          <p className="text-xl font-bold text-zinc-100">{fmtC(result.specialDamages)}</p>
        </div>
        <div className={cardCls + " text-center"}>
          <p className="text-xs text-zinc-500">General Damages (Pain & Suffering)</p>
          <p className="text-xl font-bold text-zinc-100">{fmtC(result.generalLow)} — {fmtC(result.generalHigh)}</p>
        </div>
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

      {/* State negligence rule info */}
      <div className={cardCls + " mb-6"}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ruleBadgeColor}`}>
            {RULE_LABELS[stateInfo.rule]}
          </span>
          <span className="text-sm text-zinc-300">{stateInfo.name}</span>
        </div>
        <p className="text-sm text-zinc-400">{RULE_DESC[stateInfo.rule]}</p>
        {stateInfo.damageCap && (
          <p className="text-sm text-yellow-400 mt-2">{stateInfo.capNote}</p>
        )}
      </div>

      {/* State Comparison */}
      <div className={cardCls + " mb-6"}>
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">State Comparison (High Estimate)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs">
                <th className="text-left px-3 py-2 font-medium">State</th>
                <th className="text-left px-3 py-2 font-medium">Negligence Rule</th>
                <th className="text-right px-3 py-2 font-medium">Est. Settlement</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-800 bg-blue-500/10">
                <td className="px-3 py-2 text-blue-400 font-medium">{stateInfo.name} (selected)</td>
                <td className="px-3 py-2 text-zinc-400 text-xs">{RULE_LABELS[stateInfo.rule]}</td>
                <td className="px-3 py-2 text-right text-blue-400 font-medium">{result.canRecover ? fmtC(result.finalHigh) : "Barred"}</td>
              </tr>
              {result.comparisons.map(c => (
                <tr key={c.state} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="px-3 py-2 text-zinc-300">{c.name}</td>
                  <td className="px-3 py-2 text-zinc-500 text-xs">{c.rule}</td>
                  <td className={`px-3 py-2 text-right ${c.barred ? "text-red-400" : "text-zinc-300"}`}>{c.barred ? "Barred" : fmtC(c.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {faultPct > 0 && (
          <p className="text-xs text-zinc-500 mt-3">
            With {faultPct}% fault, contributory negligence states (AL, MD, NC, VA, DC) bar all recovery. Comparative states reduce by {faultPct}%.
          </p>
        )}
      </div>

      {/* Bottom disclaimer */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 text-center">
        <p className="text-xs text-zinc-500 leading-relaxed">
          This calculator provides rough estimates using the multiplier method commonly used in the insurance industry.
          Actual settlements depend on specific facts, evidence quality, attorney involvement, insurance coverage, jury pool,
          and many factors this calculator cannot account for. Studies show represented claimants receive 3-3.5x more than
          unrepresented claimants. Always consult a personal injury attorney for your specific case.
        </p>
      </div>
    </ToolLayout>
  );
}
