"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

/* ── State data ── */
type ModelType = "formula" | "advisory" | "local" | "cap_only" | "discretion";

interface StateInfo {
  name: string;
  model: ModelType;
  formulaLabel: string;
  durationRule: string;
  notes?: string;
}

const STATES: Record<string, StateInfo> = {
  AL: { name: "Alabama", model: "discretion", formulaLabel: "Judicial discretion", durationRule: "Court discretion" },
  AK: { name: "Alaska", model: "discretion", formulaLabel: "Judicial discretion", durationRule: "Court discretion" },
  AZ: { name: "Arizona", model: "advisory", formulaLabel: "Advisory guidelines (revised Sept 2025)", durationRule: "Rule of 65: age + marriage years >= 65 may get indefinite" },
  AR: { name: "Arkansas", model: "discretion", formulaLabel: "Judicial discretion", durationRule: "Court discretion; primarily rehabilitative" },
  CA: { name: "California", model: "local", formulaLabel: "Santa Clara guideline (temp support)", durationRule: "Under 10 yrs: ~half marriage length. 10+ yrs: court retains jurisdiction indefinitely" },
  CO: { name: "Colorado", model: "advisory", formulaLabel: "40% higher AGI - 50% lower AGI (tiered)", durationRule: "31-50% of marriage length (scales with duration)" },
  CT: { name: "Connecticut", model: "discretion", formulaLabel: "Judicial discretion (17 factors)", durationRule: "~1 year per 3 years of marriage (informal)" },
  DE: { name: "Delaware", model: "discretion", formulaLabel: "Judicial discretion", durationRule: "Under 20 yrs: max 50% of marriage. 20+ yrs: may be longer" },
  DC: { name: "District of Columbia", model: "discretion", formulaLabel: "Judicial discretion", durationRule: "Court discretion" },
  FL: { name: "Florida", model: "cap_only", formulaLabel: "Cap: 35% of net income difference", durationRule: "<10 yrs: 50%. 10-20 yrs: 60%. 20+ yrs: 75% of marriage", notes: "Permanent alimony eliminated in 2023" },
  GA: { name: "Georgia", model: "discretion", formulaLabel: "Judicial discretion", durationRule: "Court discretion. Adultery bars alimony." },
  HI: { name: "Hawaii", model: "discretion", formulaLabel: "Judicial discretion", durationRule: "Court discretion" },
  ID: { name: "Idaho", model: "discretion", formulaLabel: "Judicial discretion", durationRule: "Rehabilitative favored" },
  IL: { name: "Illinois", model: "formula", formulaLabel: "33.33% payor net - 25% payee net (cap 40% combined)", durationRule: "0-5 yrs: 20%. 5-10: 40%. 10-15: 60%. 15-20: 80%. 20+: court discretion" },
  IN: { name: "Indiana", model: "discretion", formulaLabel: "Very limited — 3 grounds only", durationRule: "Rehabilitative: max 3 years", notes: "One of the most restrictive states. Requires incapacity, child caregiver need, or rehabilitative need." },
  IA: { name: "Iowa", model: "discretion", formulaLabel: "Judicial discretion", durationRule: "Court discretion" },
  KS: { name: "Kansas", model: "local", formulaLabel: "Johnson County: 20% of income difference", durationRule: "Max 121 months. Johnson Co: ~1/3 of marriage" },
  KY: { name: "Kentucky", model: "discretion", formulaLabel: "Judicial discretion (limited eligibility)", durationRule: "Court discretion" },
  LA: { name: "Louisiana", model: "cap_only", formulaLabel: "Cap: 1/3 of payor's net income", durationRule: "Until remarriage, death, or court modification" },
  ME: { name: "Maine", model: "discretion", formulaLabel: "Judicial discretion", durationRule: "Under 10 yrs: presumption against indefinite" },
  MD: { name: "Maryland", model: "discretion", formulaLabel: "Judicial discretion", durationRule: "Rehabilitative: 3-10 yrs. Indefinite: rare" },
  MA: { name: "Massachusetts", model: "cap_only", formulaLabel: "30-35% of gross income difference", durationRule: "0-5 yrs: 50%. 5-10: 60%. 10-15: 70%. 15-20: 80%. 20+: court discretion" },
  MI: { name: "Michigan", model: "local", formulaLabel: "Oakland County: 25% payor - 35% recipient", durationRule: "Court discretion" },
  MN: { name: "Minnesota", model: "discretion", formulaLabel: "Judicial discretion", durationRule: "Court discretion" },
  MS: { name: "Mississippi", model: "discretion", formulaLabel: "Judicial discretion (reluctant courts)", durationRule: "Court discretion", notes: "One of the most reluctant states to award alimony" },
  MO: { name: "Missouri", model: "discretion", formulaLabel: "Judicial discretion", durationRule: "Court discretion" },
  MT: { name: "Montana", model: "discretion", formulaLabel: "Judicial discretion", durationRule: "Court discretion" },
  NE: { name: "Nebraska", model: "discretion", formulaLabel: "Judicial discretion", durationRule: "Court discretion" },
  NV: { name: "Nevada", model: "local", formulaLabel: "Tonopah formula (Clark County)", durationRule: "~1 year per 3 years of marriage" },
  NH: { name: "New Hampshire", model: "formula", formulaLabel: "23% of income difference", durationRule: "Max 50% of marriage length" },
  NJ: { name: "New Jersey", model: "discretion", formulaLabel: "Informal: 25% of income difference", durationRule: "Under 20 yrs: cannot exceed marriage length. 20+ yrs: open durational" },
  NM: { name: "New Mexico", model: "advisory", formulaLabel: "30% payor gross - 50% payee gross (settlement only)", durationRule: "Court discretion" },
  NY: { name: "New York", model: "formula", formulaLabel: "30%/20% or 20%/25% (with CS), cap 40% combined", durationRule: "0-15 yrs: 15-30%. 15-20: 30-40%. 20+: 35-50% of marriage" },
  NC: { name: "North Carolina", model: "discretion", formulaLabel: "Judicial discretion", durationRule: "~Half marriage length. Adultery bars dependent spouse." },
  ND: { name: "North Dakota", model: "discretion", formulaLabel: "Judicial discretion", durationRule: "Court discretion; rehabilitative favored" },
  OH: { name: "Ohio", model: "discretion", formulaLabel: "Judicial discretion", durationRule: "~1 year per 2-5 years of marriage" },
  OK: { name: "Oklahoma", model: "discretion", formulaLabel: "Judicial discretion", durationRule: "Court discretion" },
  OR: { name: "Oregon", model: "discretion", formulaLabel: "Judicial discretion", durationRule: "Transitional: limited. Maintenance: may be indefinite for long marriages" },
  PA: { name: "Pennsylvania", model: "formula", formulaLabel: "33% payor net - 40% payee net (APL/support only)", durationRule: "APL: during proceedings. Post-divorce: court discretion", notes: "Formula applies to spousal support/APL only — NOT post-divorce alimony" },
  RI: { name: "Rhode Island", model: "discretion", formulaLabel: "Judicial discretion", durationRule: "Rehabilitative preferred" },
  SC: { name: "South Carolina", model: "discretion", formulaLabel: "Judicial discretion", durationRule: "Court discretion. Adultery bars alimony." },
  SD: { name: "South Dakota", model: "discretion", formulaLabel: "Judicial discretion", durationRule: "Court discretion" },
  TN: { name: "Tennessee", model: "discretion", formulaLabel: "Judicial discretion", durationRule: "Rehabilitative favored by statute" },
  TX: { name: "Texas", model: "cap_only", formulaLabel: "Lesser of $5,000/mo or 20% of gross", durationRule: "10-20 yrs: 5 yrs. 20-30: 7 yrs. 30+: 10 yrs", notes: "Very limited eligibility: 10+ yr marriage AND inability to self-support, or disability/DV" },
  UT: { name: "Utah", model: "discretion", formulaLabel: "Judicial discretion", durationRule: "Cannot exceed marriage length (codified 2024)" },
  VT: { name: "Vermont", model: "discretion", formulaLabel: "Informal: ~30% of income difference", durationRule: "Under 15 yrs: ~1/3 marriage. 15+: longer, possibly until retirement" },
  VA: { name: "Virginia", model: "local", formulaLabel: "27% higher gross - 50% lower gross (pendente lite)", durationRule: "Court discretion. Adultery may bar alimony." },
  WA: { name: "Washington", model: "discretion", formulaLabel: "Judicial discretion", durationRule: "Court discretion" },
  WV: { name: "West Virginia", model: "discretion", formulaLabel: "Judicial discretion", durationRule: "Court discretion" },
  WI: { name: "Wisconsin", model: "discretion", formulaLabel: "Judicial discretion", durationRule: "Court discretion" },
  WY: { name: "Wyoming", model: "discretion", formulaLabel: "Judicial discretion", durationRule: "Court discretion" },
};

/* ── Net income estimation (simplified) ── */
const STATE_TAX: Record<string, number> = {
  AL: 5.0, AK: 0, AZ: 2.5, AR: 4.4, CA: 9.3, CO: 4.4, CT: 5.0, DE: 6.6, DC: 8.5,
  FL: 0, GA: 5.49, HI: 8.25, ID: 5.8, IL: 4.95, IN: 3.05, IA: 5.7, KS: 5.7, KY: 4.0,
  LA: 4.25, ME: 7.15, MD: 5.75, MA: 5.0, MI: 4.25, MN: 7.85, MS: 5.0, MO: 4.8,
  MT: 5.9, NE: 5.84, NV: 0, NH: 0, NJ: 6.37, NM: 4.9, NY: 6.85, NC: 4.5, ND: 1.95,
  OH: 3.5, OK: 4.75, OR: 9.0, PA: 3.07, RI: 5.99, SC: 6.4, SD: 0, TN: 0, TX: 0,
  UT: 4.65, VT: 6.6, VA: 5.75, WA: 0, WV: 5.12, WI: 5.3, WY: 0,
};

function estimateMonthlyNet(monthlyGross: number, stateCode: string): number {
  const annual = monthlyGross * 12;
  const fedRate = annual <= 48475 ? 0.12 : annual <= 103350 ? 0.17 : annual <= 197300 ? 0.20 : 0.24;
  const fedTax = annual * fedRate;
  const stateTax = annual * ((STATE_TAX[stateCode] || 0) / 100);
  const fica = Math.min(annual, 168600) * 0.062 + annual * 0.0145;
  return Math.max(0, (annual - fedTax - stateTax - fica) / 12);
}

/* ── Comparison states ── */
const COMPARISON_STATES = ["NY", "CA", "TX", "FL", "IL", "CO", "PA", "MA", "NJ", "NH"];

/* ── Main component ── */
export default function Page() {
  const [state, setState] = useState("NY");
  const [myGrossMonthly, setMyGrossMonthly] = useState(8000);
  const [otherGrossMonthly, setOtherGrossMonthly] = useState(3000);
  const [marriageYears, setMarriageYears] = useState(12);
  const [payingChildSupport, setPayingChildSupport] = useState(false);
  const [hasChildren, setHasChildren] = useState(false);

  const stateInfo = STATES[state];

  const result = useMemo(() => {
    const si = STATES[state];
    const myNet = estimateMonthlyNet(myGrossMonthly, state);
    const otherNet = estimateMonthlyNet(otherGrossMonthly, state);
    const higherGross = Math.max(myGrossMonthly, otherGrossMonthly);
    const lowerGross = Math.min(myGrossMonthly, otherGrossMonthly);
    const higherNet = Math.max(myNet, otherNet);
    const lowerNet = Math.min(myNet, otherNet);
    const iAmHigherEarner = myGrossMonthly >= otherGrossMonthly;

    let monthlyAmount = 0;
    let formula = "";
    const steps: string[] = [];
    let durationMonths = 0;
    let durationLabel = "";
    let isEstimate = false;

    steps.push(`Your gross monthly: ${fmtC(myGrossMonthly)} (est. net: ${fmtC(myNet)})`);
    steps.push(`Other spouse gross monthly: ${fmtC(otherGrossMonthly)} (est. net: ${fmtC(otherNet)})`);
    steps.push(`Marriage length: ${marriageYears} years`);

    if (state === "NY") {
      const cap = 241000; // 2026 cap
      const payorAnnual = Math.min(higherGross * 12, cap);
      const payeeAnnual = lowerGross * 12;
      let a: number, b: number;
      if (payingChildSupport) {
        a = payorAnnual * 0.20 - payeeAnnual * 0.25;
        b = (payorAnnual + payeeAnnual) * 0.40 - payeeAnnual;
        formula = "NY CSSA: 20% payor - 25% payee (with child support)";
      } else {
        a = payorAnnual * 0.30 - payeeAnnual * 0.20;
        b = (payorAnnual + payeeAnnual) * 0.40 - payeeAnnual;
        formula = "NY CSSA: 30% payor - 20% payee (no child support)";
      }
      const annual = Math.max(0, Math.min(a, b));
      monthlyAmount = annual / 12;
      steps.push(`Payor income (capped at ${fmtC(cap)}/yr): ${fmtC(payorAnnual)}/yr`);
      steps.push(`Formula (a): ${fmtC(a)}/yr`);
      steps.push(`Formula (b): 40% combined - payee = ${fmtC(b)}/yr`);
      steps.push(`Award = lower of (a) and (b): ${fmtC(annual)}/yr = ${fmtC(monthlyAmount)}/mo`);

      // Duration
      if (marriageYears <= 15) { durationMonths = Math.round(marriageYears * 12 * 0.225); durationLabel = `~${Math.round(durationMonths / 12)} years (15-30% of marriage)`; }
      else if (marriageYears <= 20) { durationMonths = Math.round(marriageYears * 12 * 0.35); durationLabel = `~${Math.round(durationMonths / 12)} years (30-40% of marriage)`; }
      else { durationMonths = Math.round(marriageYears * 12 * 0.425); durationLabel = `~${Math.round(durationMonths / 12)} years (35-50% of marriage)`; }

    } else if (state === "IL") {
      const combinedGrossAnnual = (myGrossMonthly + otherGrossMonthly) * 12;
      if (combinedGrossAnnual > 500000) {
        isEstimate = true;
        formula = "IL: Court discretion (combined gross over $500K)";
        monthlyAmount = (higherNet * 0.30 - lowerNet * 0.20);
        steps.push("Combined gross exceeds $500K — formula does not apply, using AAML estimate");
      } else {
        const raw = higherNet * 0.3333 - lowerNet * 0.25;
        const cap40 = (myNet + otherNet) * 0.40;
        monthlyAmount = Math.max(0, Math.min(raw, cap40));
        formula = "IL: 33.33% payor net - 25% payee net (cap 40% combined)";
        steps.push(`33.33% x ${fmtC(higherNet)} - 25% x ${fmtC(lowerNet)} = ${fmtC(raw)}`);
        steps.push(`40% combined net cap: ${fmtC(cap40)}`);
        steps.push(`Award: ${fmtC(monthlyAmount)}/mo`);
      }
      // Duration
      if (marriageYears <= 5) durationMonths = Math.round(marriageYears * 12 * 0.20);
      else if (marriageYears <= 10) durationMonths = Math.round(marriageYears * 12 * 0.40);
      else if (marriageYears <= 15) durationMonths = Math.round(marriageYears * 12 * 0.60);
      else if (marriageYears <= 20) durationMonths = Math.round(marriageYears * 12 * 0.80);
      else durationMonths = marriageYears * 12;
      durationLabel = marriageYears > 20 ? `${marriageYears}+ years (court discretion, may equal or exceed marriage)` : `~${Math.round(durationMonths / 12)} years`;

    } else if (state === "CO") {
      const combinedMonthlyAGI = myGrossMonthly + otherGrossMonthly;
      if (combinedMonthlyAGI * 12 > 240000) {
        isEstimate = true;
        formula = "CO: Court discretion (combined gross over $240K)";
        monthlyAmount = higherNet * 0.30 - lowerNet * 0.20;
      } else {
        const base = higherGross * 0.40 - lowerGross * 0.50;
        let tierMult = 1.0;
        if (combinedMonthlyAGI <= 10000) tierMult = 0.80;
        else if (combinedMonthlyAGI <= 20000) tierMult = 0.75;
        monthlyAmount = Math.max(0, base * tierMult);
        formula = `CO: (40% higher - 50% lower) x ${tierMult} tier adjustment`;
        steps.push(`Base: 40% x ${fmtC(higherGross)} - 50% x ${fmtC(lowerGross)} = ${fmtC(base)}`);
        steps.push(`Tier adjustment: x${tierMult} (combined ${fmtC(combinedMonthlyAGI)}/mo)`);
        steps.push(`Award: ${fmtC(monthlyAmount)}/mo`);
      }
      // Duration: 31% at 3 yrs scaling to 50% at 12.5 yrs
      if (marriageYears < 3) { durationMonths = 0; durationLabel = "Min 3 years of marriage required"; }
      else if (marriageYears <= 12.5) {
        const pct = 0.31 + (marriageYears - 3) * 0.02;
        durationMonths = Math.round(marriageYears * 12 * Math.min(pct, 0.50));
        durationLabel = `~${Math.round(durationMonths / 12)} years (${Math.round(pct * 100)}% of marriage)`;
      } else if (marriageYears <= 20) {
        durationMonths = Math.round(marriageYears * 12 * 0.50);
        durationLabel = `~${Math.round(durationMonths / 12)} years (50% of marriage)`;
      } else { durationMonths = marriageYears * 12; durationLabel = `${marriageYears}+ years (court discretion, may be indefinite)`; }

    } else if (state === "NH") {
      const diff = higherGross - lowerGross;
      monthlyAmount = Math.max(0, diff * 0.23);
      formula = "NH: 23% of income difference";
      steps.push(`Income difference: ${fmtC(higherGross)} - ${fmtC(lowerGross)} = ${fmtC(diff)}`);
      steps.push(`23% x ${fmtC(diff)} = ${fmtC(monthlyAmount)}/mo`);
      durationMonths = Math.round(marriageYears * 12 * 0.50);
      durationLabel = `~${Math.round(durationMonths / 12)} years (max 50% of marriage)`;

    } else if (state === "PA") {
      let raw: number;
      if (hasChildren) {
        raw = higherNet * 0.25 - lowerNet * 0.30;
        formula = "PA APL: 25% payor net - 30% payee net (with children)";
        steps.push(`25% x ${fmtC(higherNet)} - 30% x ${fmtC(lowerNet)} = ${fmtC(raw)}`);
      } else {
        raw = higherNet * 0.33 - lowerNet * 0.40;
        formula = "PA APL: 33% payor net - 40% payee net (no children)";
        steps.push(`33% x ${fmtC(higherNet)} - 40% x ${fmtC(lowerNet)} = ${fmtC(raw)}`);
      }
      monthlyAmount = Math.max(0, raw);
      steps.push(`Award: ${fmtC(monthlyAmount)}/mo`);
      steps.push("Note: This formula applies to spousal support/APL only — post-divorce alimony is court discretion");
      durationMonths = 0;
      durationLabel = "APL: during proceedings. Post-divorce: court discretion (no formula)";

    } else if (state === "TX") {
      const txCap = 5000;
      const twentyPct = higherGross * 0.20;
      monthlyAmount = Math.min(txCap, twentyPct);
      formula = `TX: Lesser of $5,000/mo or 20% of gross`;
      steps.push(`20% of ${fmtC(higherGross)} = ${fmtC(twentyPct)}`);
      steps.push(`Cap: ${fmtC(txCap)}/mo`);
      steps.push(`Award: ${fmtC(monthlyAmount)}/mo`);
      if (marriageYears < 10) { durationMonths = 0; durationLabel = "Generally not eligible (under 10 years)"; steps.push("Note: TX requires 10+ year marriage, disability, or domestic violence"); }
      else if (marriageYears < 20) { durationMonths = 60; durationLabel = "Max 5 years"; }
      else if (marriageYears < 30) { durationMonths = 84; durationLabel = "Max 7 years"; }
      else { durationMonths = 120; durationLabel = "Max 10 years"; }

    } else if (state === "FL") {
      const netDiff = higherNet - lowerNet;
      monthlyAmount = Math.max(0, netDiff * 0.35);
      formula = "FL: Cap at 35% of net income difference";
      steps.push(`Net income difference: ${fmtC(higherNet)} - ${fmtC(lowerNet)} = ${fmtC(netDiff)}`);
      steps.push(`35% cap: ${fmtC(monthlyAmount)}/mo`);
      steps.push("Note: Permanent alimony eliminated in 2023. This is the maximum — actual award may be lower.");
      if (marriageYears < 3) { durationMonths = 0; durationLabel = "Not available (under 3 years)"; }
      else if (marriageYears < 10) { durationMonths = Math.round(marriageYears * 12 * 0.50); durationLabel = `Max ${Math.round(durationMonths / 12)} years (50% of marriage)`; }
      else if (marriageYears < 20) { durationMonths = Math.round(marriageYears * 12 * 0.60); durationLabel = `Max ${Math.round(durationMonths / 12)} years (60% of marriage)`; }
      else { durationMonths = Math.round(marriageYears * 12 * 0.75); durationLabel = `Max ${Math.round(durationMonths / 12)} years (75% of marriage)`; }

    } else if (state === "MA") {
      const grossDiff = higherGross - lowerGross;
      monthlyAmount = Math.max(0, grossDiff * 0.30);
      formula = "MA: ~30% of gross income difference";
      steps.push(`Gross income difference: ${fmtC(grossDiff)}`);
      steps.push(`30% x ${fmtC(grossDiff)} = ${fmtC(monthlyAmount)}/mo`);
      if (marriageYears <= 5) { durationMonths = Math.round(marriageYears * 12 * 0.50); durationLabel = `Max ${Math.round(durationMonths / 12)} years (50%)`; }
      else if (marriageYears <= 10) { durationMonths = Math.round(marriageYears * 12 * 0.60); durationLabel = `Max ${Math.round(durationMonths / 12)} years (60%)`; }
      else if (marriageYears <= 15) { durationMonths = Math.round(marriageYears * 12 * 0.70); durationLabel = `Max ${Math.round(durationMonths / 12)} years (70%)`; }
      else if (marriageYears <= 20) { durationMonths = Math.round(marriageYears * 12 * 0.80); durationLabel = `Max ${Math.round(durationMonths / 12)} years (80%)`; }
      else { durationMonths = marriageYears * 12; durationLabel = `${marriageYears}+ years (court discretion)`; }

    } else if (state === "CA") {
      const raw = higherNet * 0.40 - lowerNet * 0.50;
      monthlyAmount = Math.max(0, raw);
      formula = "CA Santa Clara: 40% payor net - 50% payee net (temp support)";
      steps.push(`40% x ${fmtC(higherNet)} - 50% x ${fmtC(lowerNet)} = ${fmtC(raw)}`);
      steps.push(`Award: ${fmtC(monthlyAmount)}/mo`);
      steps.push("Note: This is the temporary support guideline. Permanent support is court discretion.");
      isEstimate = true;
      if (marriageYears < 10) { durationMonths = Math.round(marriageYears * 12 * 0.50); durationLabel = `~${Math.round(durationMonths / 12)} years (approx half marriage)`; }
      else { durationMonths = 0; durationLabel = "10+ year marriage: court retains jurisdiction indefinitely"; }

    } else if (state === "LA") {
      const cap = higherNet / 3;
      monthlyAmount = Math.min(cap, (higherNet - lowerNet) * 0.30);
      formula = "LA: Cap at 1/3 of payor's net income";
      steps.push(`1/3 of payor net: ${fmtC(cap)}/mo`);
      steps.push(`Award (capped): ${fmtC(monthlyAmount)}/mo`);
      durationMonths = 0;
      durationLabel = "Until remarriage, death, or court modification";

    } else if (state === "MI") {
      const raw = higherGross * 0.25 - lowerGross * 0.35;
      monthlyAmount = Math.max(0, raw);
      formula = "MI Oakland County: 25% payor - 35% recipient (annual)";
      steps.push(`25% x ${fmtC(higherGross)} - 35% x ${fmtC(lowerGross)} = ${fmtC(raw)}`);
      isEstimate = true;
      durationMonths = 0;
      durationLabel = "Court discretion (no statutory guidelines)";

    } else if (state === "VA") {
      let raw: number;
      if (hasChildren) {
        raw = higherGross * 0.26 - lowerGross * 0.58;
        formula = "VA pendente lite: 26% higher - 58% lower (with children)";
      } else {
        raw = higherGross * 0.27 - lowerGross * 0.50;
        formula = "VA pendente lite: 27% higher - 50% lower (no children)";
      }
      monthlyAmount = Math.max(0, raw);
      isEstimate = true;
      steps.push(`Award: ${fmtC(monthlyAmount)}/mo (pendente lite only)`);
      durationMonths = 0;
      durationLabel = "Pendente lite: during proceedings. Post-divorce: court discretion";

    } else if (state === "NM") {
      let raw: number;
      if (payingChildSupport) {
        raw = higherGross * 0.28 - lowerGross * 0.58;
        formula = "NM advisory: 28% payor - 58% payee (with child support)";
      } else {
        raw = higherGross * 0.30 - lowerGross * 0.50;
        formula = "NM advisory: 30% payor - 50% payee (no child support)";
      }
      monthlyAmount = Math.max(0, raw);
      isEstimate = true;
      steps.push(`Award: ${fmtC(monthlyAmount)}/mo (settlement advisory only — not used at trial)`);
      durationMonths = 0;
      durationLabel = "Court discretion (no duration guidelines)";

    } else if (state === "KS") {
      const diff = higherGross - lowerGross;
      monthlyAmount = Math.max(0, diff * 0.20);
      formula = "KS Johnson County: 20% of income difference";
      steps.push(`Income difference: ${fmtC(diff)}`);
      steps.push(`20% x ${fmtC(diff)} = ${fmtC(monthlyAmount)}/mo`);
      isEstimate = true;
      durationMonths = Math.round(marriageYears * 12 / 3);
      durationLabel = `~${Math.round(durationMonths / 12)} years (1/3 of marriage). Max 121 months statewide.`;

    } else {
      // Discretion states — use AAML guideline as rough estimate, scaled by marriage length
      const raw = higherGross * 0.30 - lowerGross * 0.20;
      // Scale down for short marriages — courts rarely award full AAML amounts for marriages under 5 years
      // Under 3 years: likely $0 in most discretion states (rehabilitative only, if any)
      // 3-5 years: 25-50% of AAML estimate
      // 5-10 years: 50-75%
      // 10+: full AAML estimate
      let marriageScale = 1.0;
      if (marriageYears < 3) marriageScale = 0;
      else if (marriageYears <= 5) marriageScale = 0.35;
      else if (marriageYears <= 10) marriageScale = 0.65;

      monthlyAmount = Math.max(0, raw * marriageScale);
      formula = "AAML guideline estimate: 30% payor gross - 20% payee gross";
      isEstimate = true;
      steps.push(`30% x ${fmtC(higherGross)} - 20% x ${fmtC(lowerGross)} = ${fmtC(raw)}`);
      if (marriageScale < 1) {
        steps.push(`Short marriage adjustment (${marriageYears} years): ${Math.round(marriageScale * 100)}% of estimate`);
        if (marriageScale === 0) steps.push("Marriages under 3 years rarely result in alimony in discretion states");
      }
      steps.push("Note: This state uses judicial discretion — no statutory formula. This is a rough estimate based on AAML guidelines.");

      // Generic duration estimate
      if (marriageYears < 3) { durationMonths = 0; durationLabel = "Unlikely — very short marriage"; }
      else if (marriageYears <= 5) { durationMonths = Math.round(marriageYears * 12 * 0.33); durationLabel = `~${Math.round(durationMonths / 12)} years (rough estimate — court discretion)`; }
      else if (marriageYears <= 15) { durationMonths = Math.round(marriageYears * 12 * 0.50); durationLabel = `~${Math.round(durationMonths / 12)} years (rough estimate — court discretion)`; }
      else { durationMonths = Math.round(marriageYears * 12 * 0.75); durationLabel = `~${Math.round(durationMonths / 12)} years (rough estimate — court discretion)`; }
    }

    // If I'm the lower earner, I'd receive (not pay)
    const iWouldPay = iAmHigherEarner && monthlyAmount > 0;

    // State comparisons
    const comparisons = COMPARISON_STATES
      .filter(s => s !== state)
      .slice(0, 6)
      .map(s => {
        const cHigher = Math.max(myGrossMonthly, otherGrossMonthly);
        const cLower = Math.min(myGrossMonthly, otherGrossMonthly);
        const cHigherNet = estimateMonthlyNet(cHigher, s);
        const cLowerNet = estimateMonthlyNet(cLower, s);
        let amt = 0;

        if (s === "NY") {
          const cap = 241000;
          const pA = Math.min(cHigher * 12, cap);
          const pE = cLower * 12;
          const a = payingChildSupport ? pA * 0.20 - pE * 0.25 : pA * 0.30 - pE * 0.20;
          const b = (pA + pE) * 0.40 - pE;
          amt = Math.max(0, Math.min(a, b)) / 12;
        } else if (s === "IL") {
          const raw = cHigherNet * 0.3333 - cLowerNet * 0.25;
          const cap40 = (cHigherNet + cLowerNet) * 0.40;
          amt = Math.max(0, Math.min(raw, cap40));
        } else if (s === "CO") {
          const combined = cHigher + cLower;
          const base = cHigher * 0.40 - cLower * 0.50;
          const tier = combined <= 10000 ? 0.80 : combined <= 20000 ? 0.75 : 1.0;
          amt = Math.max(0, base * tier);
        } else if (s === "NH") {
          amt = Math.max(0, (cHigher - cLower) * 0.23);
        } else if (s === "PA") {
          amt = hasChildren ? Math.max(0, cHigherNet * 0.25 - cLowerNet * 0.30) : Math.max(0, cHigherNet * 0.33 - cLowerNet * 0.40);
        } else if (s === "TX") {
          amt = Math.min(5000, cHigher * 0.20);
        } else if (s === "FL") {
          amt = Math.max(0, (cHigherNet - cLowerNet) * 0.35);
        } else if (s === "MA") {
          amt = Math.max(0, (cHigher - cLower) * 0.30);
        } else if (s === "CA") {
          amt = Math.max(0, cHigherNet * 0.40 - cLowerNet * 0.50);
        } else if (s === "NJ") {
          amt = Math.max(0, (cHigher - cLower) * 0.25);
        } else {
          amt = Math.max(0, cHigher * 0.30 - cLower * 0.20);
        }

        return { state: s, name: STATES[s].name, model: STATES[s].formulaLabel, amount: amt };
      });

    return { monthlyAmount, annualAmount: monthlyAmount * 12, iWouldPay, formula, steps, isEstimate, durationMonths, durationLabel, comparisons, myNet, otherNet };
  }, [state, myGrossMonthly, otherGrossMonthly, marriageYears, payingChildSupport, hasChildren]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 text-sm";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const cardCls = "bg-zinc-900 border border-zinc-800 rounded-xl p-4";

  const modelBadgeColor = stateInfo.model === "formula" ? "bg-green-500/20 text-green-400" :
    stateInfo.model === "advisory" ? "bg-blue-500/20 text-blue-400" :
    stateInfo.model === "local" ? "bg-yellow-500/20 text-yellow-400" :
    stateInfo.model === "cap_only" ? "bg-orange-500/20 text-orange-400" :
    "bg-zinc-700 text-zinc-400";

  return (
    <ToolLayout
      title="Alimony Calculator"
      description="Estimate alimony (spousal support) payments for all 50 states. Uses your state's formula, advisory guidelines, or AAML estimates for discretion states. Includes duration estimates based on marriage length."
      slug="alimony-calculator"
      category="Finance"
      keywords={[
        "alimony calculator",
        "spousal support calculator",
        "alimony estimator",
        "alimony by state",
        "how much alimony",
        "spousal maintenance calculator",
        "divorce alimony calculator",
      ]}
      faqs={[
        {
          question: "How is alimony calculated?",
          answer: "Alimony calculation varies significantly by state. About 16 states have some form of formula or advisory guideline — for example, New York uses 30% of the payor's income minus 20% of the payee's income (without child support). Illinois uses 33.33% of payor's net minus 25% of payee's net. The remaining states use judicial discretion, where judges consider factors like marriage length, income disparity, age, health, and earning capacity.",
        },
        {
          question: "How long does alimony last?",
          answer: "Duration depends on your state and marriage length. Texas limits alimony to 5-10 years maximum. Florida caps durational alimony at 50-75% of the marriage length (and eliminated permanent alimony in 2023). Massachusetts caps it at 50-80% depending on marriage length. For marriages over 20 years, many states allow indefinite or longer-term support. Several states have recently reformed their laws to limit alimony duration.",
        },
        {
          question: "What's the difference between alimony and spousal support?",
          answer: "They're generally the same thing — different states use different terminology. 'Alimony' is the traditional term. Some states use 'spousal support' (California), 'spousal maintenance' (New York, Colorado), or 'maintenance' (Illinois). Pennsylvania distinguishes between 'spousal support' (during separation), 'APL' (during divorce proceedings), and 'alimony' (post-divorce). The formulas may differ between types.",
        },
        {
          question: "Is alimony tax-deductible?",
          answer: "No. For divorce and separation agreements executed after December 31, 2018, alimony is not tax-deductible for the payer and not taxable income for the recipient. This changed under the Tax Cuts and Jobs Act of 2017. Agreements from before 2019 retain the old tax treatment (deductible for payor, taxable for recipient) unless specifically modified.",
        },
        {
          question: "Can alimony be modified?",
          answer: "In most states, yes — if there's a substantial change in circumstances like job loss, retirement, significant income change, or the recipient becoming self-supporting. However, some types of alimony are non-modifiable (like Florida's bridge-the-gap alimony or lump-sum awards). Alimony typically terminates upon the recipient's remarriage and often upon cohabitation.",
        },
        {
          question: "Does adultery affect alimony?",
          answer: "In some states, yes. Georgia and South Carolina bar alimony for the spouse who committed adultery. North Carolina bars a dependent spouse who committed 'illicit sexual behavior' but requires alimony if the supporting spouse did. Virginia considers adultery as a factor. In no-fault states like California, adultery generally does not affect alimony.",
        },
        {
          question: "Which states have the most and least alimony?",
          answer: "States with the highest estimated alimony include New York, California, and Illinois — all have formulas or guidelines that produce significant awards for large income disparities. Texas and Indiana are among the most restrictive: Texas caps alimony at $5,000/month with strict eligibility, and Indiana limits it to 3 years for rehabilitative purposes only. Mississippi courts are also reluctant to award alimony.",
        },
        {
          question: "How accurate is this calculator?",
          answer: "For states with statutory formulas (NY, IL, NH, CO, PA), this calculator closely follows the actual formula. For states with caps (TX, FL, MA, LA), it applies the cap accurately. For discretion states, it uses the AAML (American Academy of Matrimonial Lawyers) recommended guideline as a rough estimate. Actual awards depend on many factors a calculator can't capture, including judicial discretion, property division, health, earning capacity, and standard of living during the marriage.",
        },
      ]}
      relatedTools={[
        { name: "Child Support Calculator", href: "/tools/child-support-calculator" },
        { name: "Salary Calculator", href: "/tools/salary-calculator" },
        { name: "Income Tax Calculator", href: "/tools/income-tax-calculator" },
        { name: "Budget Calculator", href: "/tools/budget-calculator" },
      ]}
      guide={
        <>
          <h2>How This Alimony Calculator Works</h2>
          <p>
            This calculator estimates spousal support (alimony) based on your state&apos;s calculation method, both spouses&apos; incomes, and the length of your marriage. It implements state-specific formulas where they exist and uses professional guidelines for discretion states.
          </p>

          <h3>State Calculation Methods</h3>
          <p>
            States fall into several categories for alimony calculation:
          </p>
          <ul>
            <li><strong>Formula states</strong> (NY, IL, NH, PA) — have statutory formulas that produce a specific dollar amount</li>
            <li><strong>Advisory guideline states</strong> (CO, AZ, NM) — formulas exist but judges may deviate</li>
            <li><strong>Cap-only states</strong> (TX, FL, MA, LA) — no formula for calculating amount, but statutory caps on maximum award</li>
            <li><strong>Local formula states</strong> (CA, MI, VA, NV, KS) — county-level guidelines used in practice, not codified in statute</li>
            <li><strong>Discretion states</strong> (remaining ~30 states) — judges use statutory factors with no formula. This calculator uses the AAML recommended guideline (30% of payor&apos;s gross minus 20% of payee&apos;s gross) as an approximation.</li>
          </ul>

          <h3>Duration Estimates</h3>
          <p>
            Many states tie alimony duration to marriage length. This calculator estimates duration based on your state&apos;s guidelines — for example, Florida caps durational alimony at 50% of marriage length for short marriages and 75% for long marriages. States like Texas have absolute maximum durations (5-10 years). For marriages over 20 years in most states, indefinite alimony remains possible.
          </p>

          <h3>Why Results Are Estimates</h3>
          <p>
            Even in formula states, judges have discretion to deviate based on factors like the standard of living during the marriage, each spouse&apos;s earning capacity, contributions to the other&apos;s career, health and age, and the division of marital property. This calculator provides a starting point — not a guarantee. Always consult a family law attorney.
          </p>
        </>
      }
    >
      {/* ── Disclaimer ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
        <p className="text-sm text-yellow-400 font-medium mb-1">Important Disclaimer</p>
        <p className="text-sm text-zinc-400">
          This is an estimate only. Actual alimony varies based on judicial discretion, property division, and your state&apos;s specific guidelines. Consult a family law attorney for accurate calculations.
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
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${modelBadgeColor}`}>
              {stateInfo.model === "formula" ? "Statutory Formula" : stateInfo.model === "advisory" ? "Advisory Formula" : stateInfo.model === "local" ? "Local Formula" : stateInfo.model === "cap_only" ? "Cap Only" : "Judicial Discretion"}
            </span>
          </div>
        </div>

        <div>
          <label className={labelCls}>Marriage Length (years)</label>
          <input type="number" value={marriageYears} onChange={e => setMarriageYears(Math.max(0, +e.target.value))} className={inputCls} min={0} max={60} step={1} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelCls}>Your Gross Monthly Income ($)</label>
          <input type="number" value={myGrossMonthly} onChange={e => setMyGrossMonthly(Math.max(0, +e.target.value))} className={inputCls} min={0} step={100} />
          <p className="text-xs text-zinc-500 mt-1">Est. net: {fmtC(result.myNet)}/mo</p>
        </div>
        <div>
          <label className={labelCls}>Other Spouse&apos;s Gross Monthly Income ($)</label>
          <input type="number" value={otherGrossMonthly} onChange={e => setOtherGrossMonthly(Math.max(0, +e.target.value))} className={inputCls} min={0} step={100} />
          <p className="text-xs text-zinc-500 mt-1">Est. net: {fmtC(result.otherNet)}/mo</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
          <input type="checkbox" checked={payingChildSupport} onChange={e => setPayingChildSupport(e.target.checked)} className="accent-blue-500" />
          Also paying child support
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
          <input type="checkbox" checked={hasChildren} onChange={e => setHasChildren(e.target.checked)} className="accent-blue-500" />
          Have minor children
        </label>
      </div>

      {/* ── Primary Result ── */}
      <div className={cardCls + " text-center mb-6"}>
        <p className="text-sm text-zinc-400 mb-2">Estimated Monthly Alimony</p>
        <p className="text-5xl font-bold text-blue-400 mb-2">{fmtC(result.monthlyAmount)}</p>
        <p className="text-lg text-zinc-300">{fmtC(result.annualAmount)} per year</p>
        <p className="text-sm text-zinc-500 mt-2">
          {result.iWouldPay
            ? "You would pay this amount to your spouse"
            : result.monthlyAmount > 0
            ? "You would receive this amount from your spouse"
            : "No alimony obligation estimated"}
        </p>
        {result.isEstimate && (
          <p className="text-xs text-yellow-400 mt-2">This state uses judicial discretion — estimate based on common guidelines</p>
        )}
      </div>

      {/* ── Duration ── */}
      <div className={cardCls + " mb-6"}>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <div>
            <p className="text-xs text-zinc-500">Estimated Duration</p>
            <p className="text-lg font-semibold text-zinc-100">{result.durationLabel}</p>
          </div>
        </div>
        <p className="text-xs text-zinc-500">{stateInfo.durationRule}</p>
      </div>

      {/* ── Formula & Steps ── */}
      <div className={cardCls + " mb-6"}>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${modelBadgeColor}`}>
            {stateInfo.name}
          </span>
        </div>
        <p className="text-sm text-zinc-300 mb-3 font-mono">{result.formula}</p>
        <div className="space-y-1.5">
          {result.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span className="text-zinc-600 shrink-0">{i + 1}.</span>
              <span className="text-zinc-400">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── State info ── */}
      {stateInfo.notes && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
          <p className="text-sm text-zinc-400">{stateInfo.notes}</p>
        </div>
      )}

      {/* ── State Comparison ── */}
      <div className={cardCls + " mb-6"}>
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">State Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs">
                <th className="text-left px-3 py-2 font-medium">State</th>
                <th className="text-left px-3 py-2 font-medium">Method</th>
                <th className="text-right px-3 py-2 font-medium">Est. Monthly</th>
                <th className="text-right px-3 py-2 font-medium">Est. Annual</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-800 bg-blue-500/10">
                <td className="px-3 py-2 text-blue-400 font-medium">{stateInfo.name} (selected)</td>
                <td className="px-3 py-2 text-zinc-400 text-xs">{stateInfo.model === "formula" ? "Formula" : stateInfo.model === "advisory" ? "Advisory" : stateInfo.model === "cap_only" ? "Cap" : stateInfo.model === "local" ? "Local" : "Discretion"}</td>
                <td className="px-3 py-2 text-right text-blue-400 font-medium">{fmtC(result.monthlyAmount)}</td>
                <td className="px-3 py-2 text-right text-blue-400">{fmtC(result.annualAmount)}</td>
              </tr>
              {result.comparisons.map(c => (
                <tr key={c.state} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="px-3 py-2 text-zinc-300">{c.name}</td>
                  <td className="px-3 py-2 text-zinc-500 text-xs">{STATES[c.state].model === "formula" ? "Formula" : STATES[c.state].model === "advisory" ? "Advisory" : STATES[c.state].model === "cap_only" ? "Cap" : STATES[c.state].model === "local" ? "Local" : "Discretion"}</td>
                  <td className="px-3 py-2 text-right text-zinc-300">{fmtC(c.amount)}</td>
                  <td className="px-3 py-2 text-right text-zinc-400">{fmtC(c.amount * 12)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Bottom disclaimer ── */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 text-center">
        <p className="text-xs text-zinc-500 leading-relaxed">
          This calculator provides estimates based on state formulas, advisory guidelines, or AAML recommendations.
          Actual alimony depends on judicial discretion, property division, health, earning capacity, standard of living,
          and many factors specific to your case. Always consult a family law attorney in your state.
        </p>
      </div>
    </ToolLayout>
  );
}
