"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

/* ── helpers ── */
function fmtC(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
function fmtPct(n: number) {
  return n.toFixed(1) + "%";
}

/* ── State data ── */
type ModelType = "percentage" | "income_shares" | "california" | "new_york" | "melson";

interface StateInfo {
  name: string;
  model: ModelType;
  taxRate: number; // approximate state income tax rate %
}

const STATES: Record<string, StateInfo> = {
  AL: { name: "Alabama", model: "income_shares", taxRate: 5.0 },
  AK: { name: "Alaska", model: "percentage", taxRate: 0 },
  AZ: { name: "Arizona", model: "income_shares", taxRate: 2.5 },
  AR: { name: "Arkansas", model: "income_shares", taxRate: 4.4 },
  CA: { name: "California", model: "california", taxRate: 9.3 },
  CO: { name: "Colorado", model: "income_shares", taxRate: 4.4 },
  CT: { name: "Connecticut", model: "income_shares", taxRate: 5.0 },
  DE: { name: "Delaware", model: "melson", taxRate: 6.6 },
  DC: { name: "District of Columbia", model: "income_shares", taxRate: 8.5 },
  FL: { name: "Florida", model: "income_shares", taxRate: 0 },
  GA: { name: "Georgia", model: "income_shares", taxRate: 5.49 },
  HI: { name: "Hawaii", model: "melson", taxRate: 8.25 },
  ID: { name: "Idaho", model: "income_shares", taxRate: 5.8 },
  IL: { name: "Illinois", model: "income_shares", taxRate: 4.95 },
  IN: { name: "Indiana", model: "income_shares", taxRate: 3.05 },
  IA: { name: "Iowa", model: "income_shares", taxRate: 5.7 },
  KS: { name: "Kansas", model: "income_shares", taxRate: 5.7 },
  KY: { name: "Kentucky", model: "income_shares", taxRate: 4.0 },
  LA: { name: "Louisiana", model: "income_shares", taxRate: 4.25 },
  ME: { name: "Maine", model: "income_shares", taxRate: 7.15 },
  MD: { name: "Maryland", model: "income_shares", taxRate: 5.75 },
  MA: { name: "Massachusetts", model: "income_shares", taxRate: 5.0 },
  MI: { name: "Michigan", model: "income_shares", taxRate: 4.25 },
  MN: { name: "Minnesota", model: "income_shares", taxRate: 7.85 },
  MS: { name: "Mississippi", model: "percentage", taxRate: 5.0 },
  MO: { name: "Missouri", model: "income_shares", taxRate: 4.8 },
  MT: { name: "Montana", model: "melson", taxRate: 5.9 },
  NE: { name: "Nebraska", model: "income_shares", taxRate: 5.84 },
  NV: { name: "Nevada", model: "percentage", taxRate: 0 },
  NH: { name: "New Hampshire", model: "income_shares", taxRate: 0 },
  NJ: { name: "New Jersey", model: "income_shares", taxRate: 6.37 },
  NM: { name: "New Mexico", model: "income_shares", taxRate: 4.9 },
  NY: { name: "New York", model: "new_york", taxRate: 6.85 },
  NC: { name: "North Carolina", model: "income_shares", taxRate: 4.5 },
  ND: { name: "North Dakota", model: "percentage", taxRate: 1.95 },
  OH: { name: "Ohio", model: "income_shares", taxRate: 3.5 },
  OK: { name: "Oklahoma", model: "income_shares", taxRate: 4.75 },
  OR: { name: "Oregon", model: "income_shares", taxRate: 9.0 },
  PA: { name: "Pennsylvania", model: "income_shares", taxRate: 3.07 },
  RI: { name: "Rhode Island", model: "income_shares", taxRate: 5.99 },
  SC: { name: "South Carolina", model: "income_shares", taxRate: 6.4 },
  SD: { name: "South Dakota", model: "income_shares", taxRate: 0 },
  TN: { name: "Tennessee", model: "income_shares", taxRate: 0 },
  TX: { name: "Texas", model: "percentage", taxRate: 0 },
  UT: { name: "Utah", model: "income_shares", taxRate: 4.65 },
  VT: { name: "Vermont", model: "income_shares", taxRate: 6.6 },
  VA: { name: "Virginia", model: "income_shares", taxRate: 5.75 },
  WA: { name: "Washington", model: "income_shares", taxRate: 0 },
  WV: { name: "West Virginia", model: "income_shares", taxRate: 5.12 },
  WI: { name: "Wisconsin", model: "percentage", taxRate: 5.3 },
  WY: { name: "Wyoming", model: "income_shares", taxRate: 0 },
};

/* ── Percentage-of-income state percentages ── */
const PCT_TABLES: Record<string, number[]> = {
  TX: [20, 25, 30, 35, 40],    // of net resources
  WI: [17, 25, 29, 31, 34],    // of gross
  MS: [14, 20, 22, 24, 26],    // of adjusted gross
  AK: [20, 27, 33, 36, 39],    // of net
  NV: [18, 25, 29, 31, 33],    // of gross
  ND: [17, 25, 29, 31, 34],    // of net
};

const PCT_BASIS: Record<string, string> = {
  TX: "net resources",
  WI: "gross income",
  MS: "adjusted gross income",
  AK: "adjusted net income",
  NV: "gross income",
  ND: "net income",
};

/* ── Income shares base percentages ── */
const INCOME_SHARES_PCT = [20, 28, 32, 35, 37]; // 1-5+ children

/* ── NY CSSA percentages ── */
const NY_PCT = [17, 25, 29, 31, 35];
const NY_CAP = 193000; // annual combined income cap (effective March 2026)

/* ── CA K factor (post-SB 343, effective Sep 2024) ── */
// K is a function of total net monthly income (TN), for one child
function calcCAK(totalNetMonthly: number, numChildren: number): number {
  const tn = totalNetMonthly;
  let k1: number;
  if (tn <= 2900) {
    k1 = 0.165 + tn / 82857;
  } else if (tn <= 5000) {
    k1 = 0.131 + tn / 42149;
  } else if (tn <= 10000) {
    k1 = 0.250;
  } else if (tn <= 15000) {
    k1 = 0.10 + 1499 / tn;
  } else {
    k1 = 0.12 + 1200 / tn;
  }
  // Multi-child multipliers per CA Family Code §4055
  const multipliers = [1, 1.6, 2.0, 2.3, 2.5];
  const mult = multipliers[Math.min(numChildren, 5) - 1];
  return k1 * mult;
}

/* ── Federal tax brackets (simplified 2026) ── */
const FED_BRACKETS_SINGLE = [
  { max: 11925, rate: 0.10 },
  { max: 48475, rate: 0.12 },
  { max: 103350, rate: 0.22 },
  { max: 197300, rate: 0.24 },
  { max: 250525, rate: 0.32 },
  { max: 626350, rate: 0.35 },
  { max: Infinity, rate: 0.37 },
];

const FED_BRACKETS_MARRIED = [
  { max: 23850, rate: 0.10 },
  { max: 96950, rate: 0.12 },
  { max: 206700, rate: 0.22 },
  { max: 394600, rate: 0.24 },
  { max: 501050, rate: 0.32 },
  { max: 751600, rate: 0.35 },
  { max: Infinity, rate: 0.37 },
];

const FED_BRACKETS_HOH = [
  { max: 17000, rate: 0.10 },
  { max: 64850, rate: 0.12 },
  { max: 103350, rate: 0.22 },
  { max: 197300, rate: 0.24 },
  { max: 250500, rate: 0.32 },
  { max: 626350, rate: 0.35 },
  { max: Infinity, rate: 0.37 },
];

const STD_DEDUCTION: Record<string, number> = { single: 15700, married: 31400, hoh: 22500 };
const SS_CAP = 168600;

function calcFedTax(annualGross: number, filing: string): number {
  const brackets = filing === "married" ? FED_BRACKETS_MARRIED : filing === "hoh" ? FED_BRACKETS_HOH : FED_BRACKETS_SINGLE;
  const deduction = STD_DEDUCTION[filing] || 15700;
  const taxable = Math.max(0, annualGross - deduction);
  let tax = 0;
  let prev = 0;
  for (const b of brackets) {
    if (taxable <= prev) break;
    const amt = Math.min(taxable, b.max) - prev;
    tax += amt * b.rate;
    prev = b.max;
  }
  return tax;
}

function calcFICA(annualGross: number): number {
  const ss = Math.min(annualGross, SS_CAP) * 0.062;
  const med = annualGross * 0.0145;
  return ss + med;
}

function estimateMonthlyNet(monthlyGross: number, stateTaxRate: number, filing: string): number {
  const annualGross = monthlyGross * 12;
  const fedTax = calcFedTax(annualGross, filing);
  const fica = calcFICA(annualGross);
  const stateTax = annualGross * (stateTaxRate / 100);
  const annualNet = annualGross - fedTax - fica - stateTax;
  return Math.max(0, annualNet / 12);
}

/* ── Model labels ── */
const MODEL_LABELS: Record<ModelType, string> = {
  percentage: "Percentage of Income",
  income_shares: "Income Shares",
  california: "California Formula (Algebraic)",
  new_york: "New York CSSA",
  melson: "Melson Formula (Income Shares + Self-Support Reserve)",
};

/* ── Comparison states ── */
const COMPARISON_STATES = ["TX", "CA", "NY", "FL", "IL", "PA", "OH", "GA", "NC", "WA"];

/* ── Main component ── */
export default function Page() {
  const [state, setState] = useState("TX");
  const [myGrossMonthly, setMyGrossMonthly] = useState(5000);
  const [otherGrossMonthly, setOtherGrossMonthly] = useState(3000);
  const [numChildren, setNumChildren] = useState(1);
  const [parentingPct, setParentingPct] = useState(20); // % of overnights I have
  const [healthInsurance, setHealthInsurance] = useState(200);
  const [childcare, setChildcare] = useState(0);
  const [filing, setFiling] = useState("single");

  const stateInfo = STATES[state];

  const result = useMemo(() => {
    const si = STATES[state];
    const myNetMonthly = estimateMonthlyNet(myGrossMonthly, si.taxRate, filing);
    const otherNetMonthly = estimateMonthlyNet(otherGrossMonthly, si.taxRate, filing);
    const iAmNonCustodial = parentingPct < 50;
    const ncGrossMonthly = iAmNonCustodial ? myGrossMonthly : otherGrossMonthly;
    const ncNetMonthly = iAmNonCustodial ? myNetMonthly : otherNetMonthly;
    const custodialPct = iAmNonCustodial ? (100 - parentingPct) : parentingPct;
    const ncParentingPct = iAmNonCustodial ? parentingPct : (100 - parentingPct);
    const childIdx = Math.min(numChildren, 5) - 1;

    let baseSupport = 0;
    let formula = "";
    const steps: string[] = [];

    if (si.model === "percentage") {
      const pcts = PCT_TABLES[state];
      const pct = pcts[childIdx];
      const basis = PCT_BASIS[state];
      // Use net or gross depending on state
      const useNet = ["TX", "AK", "ND"].includes(state);
      const incomeBase = useNet ? ncNetMonthly : ncGrossMonthly;
      baseSupport = incomeBase * (pct / 100);
      formula = `${pct}% of non-custodial parent's ${basis}`;
      steps.push(`Non-custodial parent's ${basis}: ${fmtC(incomeBase)}/mo`);
      steps.push(`Percentage for ${numChildren} child${numChildren > 1 ? "ren" : ""}: ${pct}%`);
      steps.push(`Base support: ${fmtC(incomeBase)} x ${pct}% = ${fmtC(baseSupport)}/mo`);

    } else if (si.model === "california") {
      // CS = K[HN - (H%)(TN)]
      // K = amount of both parents' income to allocate for child support
      // HN = high earner's net monthly disposable income
      // H% = approximate percentage of time the high earner has the children
      // TN = total net monthly disposable income of both parents
      const totalNet = myNetMonthly + otherNetMonthly;
      const iAmHighEarner = myNetMonthly >= otherNetMonthly;
      const highNet = iAmHighEarner ? myNetMonthly : otherNetMonthly;
      const highTimePct = iAmHighEarner ? parentingPct / 100 : (100 - parentingPct) / 100;

      const K = calcCAK(totalNet, numChildren);
      baseSupport = K * (highNet - highTimePct * totalNet);

      // If I am the high earner, I pay. If not, I receive (negative = I receive).
      // Adjust sign: if I am the high earner, result is what I pay
      if (!iAmHighEarner) {
        baseSupport = -baseSupport; // negative means I receive
      }

      formula = `CS = K[HN - (H%)(TN)] where K=${K.toFixed(3)}`;
      steps.push(`Your net monthly income: ${fmtC(myNetMonthly)}`);
      steps.push(`Other parent's net monthly income: ${fmtC(otherNetMonthly)}`);
      steps.push(`Total net (TN): ${fmtC(totalNet)}`);
      steps.push(`High earner net (HN): ${fmtC(highNet)} (${iAmHighEarner ? "you" : "other parent"})`);
      steps.push(`High earner time (H%): ${(highTimePct * 100).toFixed(0)}%`);
      steps.push(`K factor for ${numChildren} child${numChildren > 1 ? "ren" : ""}: ${K.toFixed(3)}`);
      steps.push(`Base CS = ${K.toFixed(3)} x [${fmtC(highNet)} - ${(highTimePct * 100).toFixed(0)}% x ${fmtC(totalNet)}] = ${fmtC(Math.abs(baseSupport))}/mo`);

    } else if (si.model === "new_york") {
      const pct = NY_PCT[childIdx];
      const combinedAnnualGross = (myGrossMonthly + otherGrossMonthly) * 12;
      const cappedCombined = Math.min(combinedAnnualGross, NY_CAP);
      const basicObligation = cappedCombined * (pct / 100);
      const myShare = myGrossMonthly / (myGrossMonthly + otherGrossMonthly);
      const myObligation = basicObligation * myShare / 12;
      const otherObligation = basicObligation * (1 - myShare) / 12;
      baseSupport = iAmNonCustodial ? myObligation : -otherObligation;

      formula = `CSSA: ${pct}% of combined income (capped at ${fmtC(NY_CAP)}/yr)`;
      steps.push(`Combined annual gross: ${fmtC(combinedAnnualGross)}`);
      steps.push(`Capped combined income: ${fmtC(cappedCombined)}/yr`);
      steps.push(`CSSA percentage for ${numChildren} child${numChildren > 1 ? "ren" : ""}: ${pct}%`);
      steps.push(`Basic child support obligation: ${fmtC(cappedCombined)} x ${pct}% = ${fmtC(basicObligation)}/yr`);
      steps.push(`Your income share: ${fmtPct(myShare * 100)}`);
      steps.push(`Your obligation: ${fmtC(basicObligation)} x ${fmtPct(myShare * 100)} / 12 = ${fmtC(Math.abs(baseSupport))}/mo`);

    } else {
      // income_shares or melson
      const selfSupportReserve = si.model === "melson" ? 1510 : 0;
      const myAdjustedNet = Math.max(0, myNetMonthly - selfSupportReserve);
      const otherAdjustedNet = Math.max(0, otherNetMonthly - selfSupportReserve);
      const combinedNet = myAdjustedNet + otherAdjustedNet;
      const pct = INCOME_SHARES_PCT[childIdx];
      const basicObligation = combinedNet * (pct / 100);
      const totalObligation = basicObligation + healthInsurance + childcare;
      const mySharePct = combinedNet > 0 ? myAdjustedNet / combinedNet : 0.5;
      const myObligation = totalObligation * mySharePct;
      const otherObligation = totalObligation * (1 - mySharePct);

      // Shared custody adjustment
      let adjustment = 0;
      if (ncParentingPct >= 35) {
        // Reduce non-custodial obligation by their time percentage
        adjustment = (iAmNonCustodial ? myObligation : otherObligation) * (ncParentingPct / 100);
      }

      if (iAmNonCustodial) {
        baseSupport = myObligation - adjustment;
      } else {
        baseSupport = -(otherObligation - adjustment);
      }

      const modelLabel = si.model === "melson" ? "Melson Formula" : "Income Shares";
      formula = `${modelLabel}: ${pct}% of combined net income`;
      if (si.model === "melson") {
        steps.push(`Self-support reserve: ${fmtC(selfSupportReserve)}/mo per parent`);
        steps.push(`Your adjusted net: ${fmtC(myNetMonthly)} - ${fmtC(selfSupportReserve)} = ${fmtC(myAdjustedNet)}/mo`);
        steps.push(`Other parent's adjusted net: ${fmtC(otherNetMonthly)} - ${fmtC(selfSupportReserve)} = ${fmtC(otherAdjustedNet)}/mo`);
      } else {
        steps.push(`Your estimated net income: ${fmtC(myNetMonthly)}/mo`);
        steps.push(`Other parent's estimated net income: ${fmtC(otherNetMonthly)}/mo`);
      }
      steps.push(`Combined net income: ${fmtC(combinedNet)}/mo`);
      steps.push(`Basic support (${pct}% of combined): ${fmtC(basicObligation)}/mo`);
      if (healthInsurance > 0 || childcare > 0) {
        steps.push(`+ Health insurance: ${fmtC(healthInsurance)}/mo`);
        steps.push(`+ Childcare: ${fmtC(childcare)}/mo`);
        steps.push(`Total obligation: ${fmtC(totalObligation)}/mo`);
      }
      steps.push(`Your share: ${fmtPct(mySharePct * 100)} = ${fmtC(myObligation)}/mo`);
      if (adjustment > 0) {
        steps.push(`Shared custody adjustment (-${fmtPct(ncParentingPct)}): -${fmtC(adjustment)}/mo`);
      }
    }

    // For California, add health/childcare as add-on
    if (si.model === "california" || si.model === "new_york") {
      const addOns = healthInsurance + childcare;
      if (addOns > 0) {
        const mySharePct = myGrossMonthly / (myGrossMonthly + otherGrossMonthly);
        const myAddOn = iAmNonCustodial ? addOns * mySharePct : -(addOns * (1 - mySharePct));
        baseSupport += myAddOn;
        steps.push(`Add-ons (insurance + childcare): ${fmtC(addOns)}/mo`);
        steps.push(`Your share of add-ons: ${fmtC(Math.abs(myAddOn))}/mo`);
      }
    }

    // Floor at $0 for payment (negative means you'd receive)
    const monthlyPayment = Math.max(0, baseSupport);
    const youPay = baseSupport >= 0;

    // Comparison across states
    const comparisons = COMPARISON_STATES
      .filter(s => s !== state)
      .slice(0, 5)
      .map(s => {
        const csi = STATES[s];
        const cMyNet = estimateMonthlyNet(myGrossMonthly, csi.taxRate, filing);
        const cOtherNet = estimateMonthlyNet(otherGrossMonthly, csi.taxRate, filing);
        let cSupport = 0;

        if (csi.model === "percentage") {
          const pcts = PCT_TABLES[s];
          const pct = pcts[childIdx];
          const useNet = ["TX", "AK", "ND"].includes(s);
          const base = useNet ? (iAmNonCustodial ? cMyNet : cOtherNet) : ncGrossMonthly;
          cSupport = base * (pct / 100);
        } else if (csi.model === "california") {
          const totalNet = cMyNet + cOtherNet;
          const iHigh = cMyNet >= cOtherNet;
          const hNet = iHigh ? cMyNet : cOtherNet;
          const hPct = iHigh ? parentingPct / 100 : (100 - parentingPct) / 100;
          const K = calcCAK(totalNet, numChildren);
          cSupport = K * (hNet - hPct * totalNet);
          if (!iHigh) cSupport = -cSupport;
        } else if (csi.model === "new_york") {
          const pct = NY_PCT[childIdx];
          const combined = Math.min((myGrossMonthly + otherGrossMonthly) * 12, NY_CAP);
          const ms = myGrossMonthly / (myGrossMonthly + otherGrossMonthly);
          cSupport = iAmNonCustodial ? combined * (pct / 100) * ms / 12 : -(combined * (pct / 100) * (1 - ms) / 12);
        } else {
          const reserve = csi.model === "melson" ? 1510 : 0;
          const myAdj = Math.max(0, cMyNet - reserve);
          const oAdj = Math.max(0, cOtherNet - reserve);
          const comb = myAdj + oAdj;
          const pct = INCOME_SHARES_PCT[childIdx];
          const basic = comb * (pct / 100);
          const total = basic + healthInsurance + childcare;
          const ms = comb > 0 ? myAdj / comb : 0.5;
          const myObl = total * ms;
          const oObl = total * (1 - ms);
          const ncPct = iAmNonCustodial ? parentingPct : (100 - parentingPct);
          let adj = 0;
          if (ncPct >= 35) adj = (iAmNonCustodial ? myObl : oObl) * (ncPct / 100);
          cSupport = iAmNonCustodial ? myObl - adj : -(oObl - adj);
        }

        return { state: s, name: csi.name, model: MODEL_LABELS[csi.model], amount: Math.max(0, cSupport) };
      });

    return {
      monthlyPayment,
      annualPayment: monthlyPayment * 12,
      youPay,
      iAmNonCustodial,
      formula,
      steps,
      model: si.model,
      modelLabel: MODEL_LABELS[si.model],
      myNetMonthly,
      otherNetMonthly,
      comparisons,
    };
  }, [state, myGrossMonthly, otherGrossMonthly, numChildren, parentingPct, healthInsurance, childcare, filing]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 text-sm";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const cardCls = "bg-zinc-900 border border-zinc-800 rounded-xl p-4";

  return (
    <ToolLayout
      title="Child Support Calculator"
      description="Estimate child support payments for all 50 states and DC. Uses your state's calculation model — percentage of income, income shares, or state-specific formulas — with custody split and income adjustments."
      slug="child-support-calculator"
      category="Finance"
      keywords={[
        "child support calculator",
        "child support estimator",
        "how much child support",
        "child support by state",
        "child support formula",
        "calculate child support",
      ]}
      faqs={[
        {
          question: "How is child support calculated?",
          answer: "Child support calculation varies by state but generally falls into three models. Percentage of Income states (like Texas and Wisconsin) apply a fixed percentage to the non-custodial parent's income based on the number of children. Income Shares states (the majority) combine both parents' incomes, determine a basic obligation from a schedule, then split it proportionally. A few states like California use algebraic formulas that factor in parenting time. All states also consider health insurance and childcare costs.",
        },
        {
          question: "What's the difference between income shares and percentage of income?",
          answer: "Percentage of Income uses only the non-custodial parent's income and applies a flat percentage. Income Shares combines both parents' incomes to determine the total child-rearing cost, then assigns each parent their proportionate share. Income Shares is considered more equitable because it reflects what would have been spent on the children if the household were intact. About 41 states use Income Shares, while 6 use Percentage of Income.",
        },
        {
          question: "Does custody split affect child support?",
          answer: "Yes, significantly. Most states reduce child support when the non-custodial parent has substantial parenting time (typically 35% or more of overnights). The logic is that the parent spending more time with the children is directly covering more of their expenses. Some states like California build parenting time directly into their formula. A 50/50 custody arrangement usually results in a lower support obligation, though the higher-earning parent typically still pays something.",
        },
        {
          question: "What income is included in child support calculations?",
          answer: "Most states use gross income from all sources, including wages, salary, commissions, bonuses, overtime, self-employment income, investment income, rental income, retirement benefits, and disability payments. Some states then deduct taxes and mandatory expenses to arrive at net income. Income that is typically excluded includes means-tested public assistance (like TANF or SSI) and income of new spouses.",
        },
        {
          question: "Can child support be modified?",
          answer: "Yes, child support orders can be modified when there is a substantial change in circumstances. Common reasons include a significant increase or decrease in either parent's income (usually 15-20% or more), a change in custody or parenting time, a change in the child's needs (medical, educational), or the child aging out. Either parent can file a motion to modify, and some states allow administrative review every few years.",
        },
        {
          question: "What happens if a parent is unemployed?",
          answer: "Courts can impute income to a voluntarily unemployed or underemployed parent. This means the court assigns an income the parent could reasonably earn based on their education, skills, work history, and job opportunities in their area. If unemployment is involuntary and the parent is actively seeking work, the court may use actual income or unemployment benefits. Simply quitting a job to reduce child support is not typically an effective strategy.",
        },
        {
          question: "How long does child support last?",
          answer: "In most states, child support continues until the child turns 18 or graduates from high school, whichever comes later. Some states extend to age 19 or 21. New York can order support until 21. A few states allow support to continue through college. Support can also end earlier if the child becomes emancipated, joins the military, or gets married. Children with disabilities may receive support indefinitely.",
        },
        {
          question: "Is child support tax-deductible?",
          answer: "No. Child support has never been tax-deductible for the payer or taxable income for the recipient. This is different from alimony, which was deductible for agreements made before 2019 but lost its deduction under the Tax Cuts and Jobs Act. The parent who claims the child as a dependent gets the child tax credit, which is typically the custodial parent unless the parents agree otherwise using IRS Form 8332.",
        },
      ]}
      relatedTools={[
        { name: "Salary Calculator", href: "/tools/salary-calculator" },
        { name: "Income Tax Calculator", href: "/tools/income-tax-calculator" },
        { name: "Paycheck Calculator", href: "/tools/paycheck-calculator" },
        { name: "Alimony Calculator", href: "/tools/salary-calculator" },
      ]}
      guide={
        <>
          <h2>How This Child Support Calculator Works</h2>
          <p>
            This calculator estimates child support obligations based on your state&apos;s calculation model, both parents&apos; incomes, the number of children, and your parenting time arrangement. It implements three primary calculation approaches used across the United States.
          </p>

          <h3>The Three Child Support Models</h3>

          <h4>1. Percentage of Income Model</h4>
          <p>
            Used by Texas, Wisconsin, Mississippi, Alaska, Nevada, and North Dakota. This model applies a fixed percentage to the non-custodial parent&apos;s income. The percentage increases with the number of children. For example, Texas uses 20% of net resources for one child, 25% for two, and up to 40% for five or more. The custodial parent&apos;s income is not factored in.
          </p>

          <h4>2. Income Shares Model</h4>
          <p>
            Used by the majority of states (about 41). This model combines both parents&apos; incomes and uses a schedule to determine how much the parents would typically spend on their children at that income level. Each parent then pays their proportionate share. Health insurance and childcare costs are added to the basic obligation. This calculator uses an approximation of the typical state schedules since each state&apos;s actual table has hundreds of entries.
          </p>

          <h4>3. State-Specific Formulas</h4>
          <p>
            California uses an algebraic formula (CS = K[HN - (H%)(TN)]) that directly incorporates parenting time. New York uses the Child Support Standards Act (CSSA) percentages applied to combined income up to a statutory cap. Delaware, Hawaii, and Montana use the Melson Formula, which is similar to Income Shares but includes a self-support reserve to ensure each parent can meet their own basic needs.
          </p>

          <h3>Why Results Are Estimates</h3>
          <p>
            Actual child support calculations involve state-specific lookup tables with thousands of entries, judicial discretion, and dozens of additional factors this calculator cannot account for. These include extraordinary medical expenses, prior support obligations, travel costs for visitation, tax filing details, and more. This tool provides a reasonable approximation to help you understand the likely range, but should not be used as a substitute for legal advice.
          </p>

          <h3>Net Income Estimation</h3>
          <p>
            Many states base child support on net income rather than gross. This calculator estimates net income by deducting approximate federal income tax (using 2026 brackets), state income tax (using each state&apos;s approximate rate), and FICA (Social Security at 6.2% up to the $168,600 cap plus Medicare at 1.45%). Your actual net income may differ based on pre-tax deductions, additional taxes, and other factors.
          </p>
        </>
      }
    >
      {/* ── Disclaimer ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
        <p className="text-sm text-yellow-400 font-medium mb-1">Important Disclaimer</p>
        <p className="text-sm text-zinc-400">
          This is an estimate only. Actual child support may vary based on court discretion, additional factors, and your state&apos;s specific guidelines. Consult a family law attorney for accurate calculations.
        </p>
      </div>

      {/* ── Inputs ── */}
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
          <p className="text-xs text-zinc-500 mt-1">Model: {result.modelLabel}</p>
        </div>

        <div>
          <label className={labelCls}>Filing Status (for tax estimation)</label>
          <select value={filing} onChange={e => setFiling(e.target.value)} className={inputCls}>
            <option value="single">Single</option>
            <option value="married">Married Filing Jointly</option>
            <option value="hoh">Head of Household</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelCls}>Your Gross Monthly Income ($)</label>
          <input
            type="number"
            value={myGrossMonthly}
            onChange={e => setMyGrossMonthly(Math.max(0, +e.target.value))}
            className={inputCls}
            min={0}
            step={100}
          />
          <p className="text-xs text-zinc-500 mt-1">Est. net: {fmtC(result.myNetMonthly)}/mo</p>
        </div>
        <div>
          <label className={labelCls}>Other Parent&apos;s Gross Monthly Income ($)</label>
          <input
            type="number"
            value={otherGrossMonthly}
            onChange={e => setOtherGrossMonthly(Math.max(0, +e.target.value))}
            className={inputCls}
            min={0}
            step={100}
          />
          <p className="text-xs text-zinc-500 mt-1">Est. net: {fmtC(result.otherNetMonthly)}/mo</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelCls}>Number of Children</label>
          <select value={numChildren} onChange={e => setNumChildren(+e.target.value)} className={inputCls}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>
            Your Parenting Time: {parentingPct}% of overnights
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={parentingPct}
            onChange={e => setParentingPct(+e.target.value)}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-zinc-500 mt-1">
            <span>0% (no custody)</span>
            <span>50%</span>
            <span>100% (full custody)</span>
          </div>
          <p className="text-xs mt-1">
            {parentingPct < 50 ? (
              <span className="text-yellow-400">You are the non-custodial parent</span>
            ) : parentingPct > 50 ? (
              <span className="text-green-400">You are the custodial parent</span>
            ) : (
              <span className="text-blue-400">Equal custody split</span>
            )}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelCls}>Monthly Health Insurance for Children ($)</label>
          <input
            type="number"
            value={healthInsurance}
            onChange={e => setHealthInsurance(Math.max(0, +e.target.value))}
            className={inputCls}
            min={0}
            step={25}
          />
        </div>
        <div>
          <label className={labelCls}>Monthly Childcare Costs ($)</label>
          <input
            type="number"
            value={childcare}
            onChange={e => setChildcare(Math.max(0, +e.target.value))}
            className={inputCls}
            min={0}
            step={50}
          />
        </div>
      </div>

      {/* ── Primary Result ── */}
      <div className={cardCls + " text-center mb-6"}>
        <p className="text-sm text-zinc-400 mb-2">Estimated Monthly Child Support</p>
        <p className="text-5xl font-bold text-blue-400 mb-2">{fmtC(result.monthlyPayment)}</p>
        <p className="text-lg text-zinc-300">{fmtC(result.annualPayment)} per year</p>
        <p className="text-sm text-zinc-500 mt-2">
          {result.youPay
            ? "You would pay this amount to the other parent"
            : "Based on inputs, you would be the receiving parent"}
        </p>
      </div>

      {/* ── Model & Formula ── */}
      <div className={cardCls + " mb-6"}>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-medium bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
            {result.modelLabel}
          </span>
          <span className="text-xs text-zinc-500">{stateInfo.name}</span>
        </div>
        <p className="text-sm text-zinc-300 mb-3 font-mono">{result.formula}</p>
      </div>

      {/* ── Calculation Breakdown ── */}
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

      {/* ── Income Summary ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Your Gross Monthly", value: fmtC(myGrossMonthly), color: "text-zinc-100" },
          { label: "Your Est. Net Monthly", value: fmtC(result.myNetMonthly), color: "text-zinc-100" },
          { label: "Other Gross Monthly", value: fmtC(otherGrossMonthly), color: "text-zinc-100" },
          { label: "Other Est. Net Monthly", value: fmtC(result.otherNetMonthly), color: "text-zinc-100" },
        ].map(c => (
          <div key={c.label} className={cardCls + " text-center"}>
            <div className="text-xs text-zinc-500 mb-1">{c.label}</div>
            <div className={`text-lg font-bold ${c.color}`}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* ── State Comparison ── */}
      <div className={cardCls + " mb-6"}>
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">State Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs">
                <th className="text-left px-3 py-2 font-medium">State</th>
                <th className="text-left px-3 py-2 font-medium">Model</th>
                <th className="text-right px-3 py-2 font-medium">Est. Monthly</th>
                <th className="text-right px-3 py-2 font-medium">Est. Annual</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-800 bg-blue-500/10">
                <td className="px-3 py-2 text-blue-400 font-medium">{stateInfo.name} (selected)</td>
                <td className="px-3 py-2 text-zinc-400">{result.modelLabel}</td>
                <td className="px-3 py-2 text-right text-blue-400 font-medium">{fmtC(result.monthlyPayment)}</td>
                <td className="px-3 py-2 text-right text-blue-400">{fmtC(result.annualPayment)}</td>
              </tr>
              {result.comparisons.map(c => (
                <tr key={c.state} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="px-3 py-2 text-zinc-300">{c.name}</td>
                  <td className="px-3 py-2 text-zinc-500 text-xs">{c.model}</td>
                  <td className="px-3 py-2 text-right text-zinc-300">{fmtC(c.amount)}</td>
                  <td className="px-3 py-2 text-right text-zinc-400">{fmtC(c.amount * 12)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Disclaimer (bottom) ── */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 text-center">
        <p className="text-xs text-zinc-500 leading-relaxed">
          This calculator provides estimates based on simplified versions of state child support formulas.
          Actual amounts may differ significantly based on court discretion, deviations, additional income sources,
          extraordinary expenses, prior support obligations, and factors specific to your case.
          Always consult a family law attorney in your state for accurate calculations.
        </p>
      </div>
    </ToolLayout>
  );
}
