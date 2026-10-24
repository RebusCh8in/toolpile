"use client";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";

/* ── helpers ── */
function fmt(n: number): string {
  if (n < 0) return "-" + fmt(-n);
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
function pct(n: number): string {
  return n.toFixed(1) + "%";
}

/* ── 2026 federal brackets (IRS Rev. Proc. 2025-XX, OBBBA-adjusted) ── */
const fedBrackets = {
  single: [
    { min: 0, max: 12400, rate: 10 },
    { min: 12400, max: 50400, rate: 12 },
    { min: 50400, max: 105700, rate: 22 },
    { min: 105700, max: 201775, rate: 24 },
    { min: 201775, max: 256225, rate: 32 },
    { min: 256225, max: 640600, rate: 35 },
    { min: 640600, max: Infinity, rate: 37 },
  ],
  married: [
    { min: 0, max: 24800, rate: 10 },
    { min: 24800, max: 100800, rate: 12 },
    { min: 100800, max: 211400, rate: 22 },
    { min: 211400, max: 403550, rate: 24 },
    { min: 403550, max: 512450, rate: 32 },
    { min: 512450, max: 768700, rate: 35 },
    { min: 768700, max: Infinity, rate: 37 },
  ],
  hoh: [
    { min: 0, max: 17700, rate: 10 },
    { min: 17700, max: 67450, rate: 12 },
    { min: 67450, max: 105700, rate: 22 },
    { min: 105700, max: 201750, rate: 24 },
    { min: 201750, max: 256200, rate: 32 },
    { min: 256200, max: 640600, rate: 35 },
    { min: 640600, max: Infinity, rate: 37 },
  ],
};

const stdDeduction: Record<string, number> = { single: 16100, married: 32200, hoh: 24150 };

/* existing senior standard deduction additions (pre-OBBBA) */
const existingSeniorDeduction: Record<string, number> = { single: 1950, married: 3100, hoh: 1950 };
/* MFJ = $1,550 x 2 qualifying spouses = $3,100 */

/* Phase-out thresholds (MAGI): { single, married } */
const TIPS_PHASE_OUT = { single: 150000, married: 300000, hoh: 150000 }; /* $100 reduction per $1K over */
const OT_PHASE_OUT = { single: 150000, married: 300000, hoh: 150000 };
const SENIOR_PHASE_OUT = { single: 75000, married: 150000, hoh: 75000 }; /* $0.06 per $1 over */
const AUTO_PHASE_OUT = { single: 100000, married: 200000, hoh: 100000 }; /* $200 per $1K over */

const TIP_EXEMPT_CAP = 25000;
const OT_EXEMPT_CAP: Record<string, number> = { single: 12500, married: 25000, hoh: 12500 };
const SENIOR_BONUS = 6000;
const AUTO_LOAN_CAP = 10000;

/* Phase-out helper: reduces benefit as AGI exceeds threshold */
function phaseOut(benefit: number, agi: number, threshold: number, reductionPer1K: number): number {
  if (agi <= threshold) return benefit;
  const over = agi - threshold;
  const reduction = Math.floor(over / 1000) * reductionPer1K;
  return Math.max(0, benefit - reduction);
}
function seniorPhaseOut(benefit: number, agi: number, threshold: number): number {
  if (agi <= threshold) return benefit;
  const over = agi - threshold;
  const reduction = over * 0.06;
  return Math.max(0, benefit - reduction);
}

const SS_RATE = 0.062;
const SS_CAP = 184500;
const MEDICARE_RATE = 0.0145;
const MEDICARE_ADDITIONAL_RATE = 0.009;
const MEDICARE_ADDITIONAL_THRESHOLD = 200000;

type Filing = "single" | "married" | "hoh";

/* ── State data ── */
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

/* ── Tax calc helpers ── */
function calcFedTax(taxable: number, filing: Filing) {
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
  const marginal = b.find((br) => taxable <= br.max)?.rate || 37;
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

function calcStateTax(taxableIncome: number, stateCode: string) {
  const s = states[stateCode];
  if (!s || s.rate === 0) return 0;
  return Math.max(0, taxableIncome) * (s.rate / 100);
}

/* find the marginal rate at a given taxable income */
function marginalRate(taxable: number, filing: Filing): number {
  const b = fedBrackets[filing];
  return b.find((br) => taxable <= br.max)?.rate || 37;
}

/* ── Quick-fill profiles ── */
interface Profile {
  label: string;
  emoji: string;
  desc: string;
  wages: number;
  tips: number;
  isTipped: boolean;
  overtime: number;
  isHourly: boolean;
  hourlyRate: number;
  otHoursPerWeek: number;
  otMode: "direct" | "calculate";
  isSenior: boolean;
  autoLoanInterest: number;
  isAmericanVehicle: boolean;
}

const profiles: Profile[] = [
  {
    label: "Server / Bartender",
    emoji: "\uD83C\uDF7D\uFE0F",
    desc: "Tipped restaurant worker",
    wages: 35000,
    tips: 22000,
    isTipped: true,
    overtime: 0,
    isHourly: true,
    hourlyRate: 0,
    otHoursPerWeek: 0,
    otMode: "direct",
    isSenior: false,
    autoLoanInterest: 0,
    isAmericanVehicle: false,
  },
  {
    label: "Delivery Driver",
    emoji: "\uD83D\uDE9A",
    desc: "Tips + overtime",
    wages: 42000,
    tips: 12000,
    isTipped: true,
    overtime: 8000,
    isHourly: true,
    hourlyRate: 0,
    otHoursPerWeek: 0,
    otMode: "direct",
    isSenior: false,
    autoLoanInterest: 0,
    isAmericanVehicle: false,
  },
  {
    label: "Retail Worker (OT)",
    emoji: "\uD83D\uDED2",
    desc: "Hourly with overtime",
    wages: 38000,
    tips: 0,
    isTipped: false,
    overtime: 6000,
    isHourly: true,
    hourlyRate: 0,
    otHoursPerWeek: 0,
    otMode: "direct",
    isSenior: false,
    autoLoanInterest: 0,
    isAmericanVehicle: false,
  },
  {
    label: "Retiree (65+)",
    emoji: "\uD83C\uDFD6\uFE0F",
    desc: "Senior deduction",
    wages: 48000,
    tips: 0,
    isTipped: false,
    overtime: 0,
    isHourly: false,
    hourlyRate: 0,
    otHoursPerWeek: 0,
    otMode: "direct",
    isSenior: true,
    autoLoanInterest: 0,
    isAmericanVehicle: false,
  },
  {
    label: "Auto Worker",
    emoji: "\uD83D\uDD27",
    desc: "OT + auto loan",
    wages: 55000,
    tips: 0,
    isTipped: false,
    overtime: 10000,
    isHourly: true,
    hourlyRate: 0,
    otHoursPerWeek: 0,
    otMode: "direct",
    isSenior: false,
    autoLoanInterest: 7500,
    isAmericanVehicle: true,
  },
];

/* ── Donut chart ── */
function DonutChart({
  slices,
  size = 240,
}: {
  slices: { label: string; value: number; color: string }[];
  size?: number;
}) {
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
    const innerR = outerR * 0.58;

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

    /* center label */
    const takeHome = slices.find((s) => s.label === "Take-Home")?.value || 0;
    const takeHomePct = total > 0 ? ((takeHome / total) * 100).toFixed(1) : "0";
    ctx.fillStyle = "#1a1815";
    ctx.font = "bold 22px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${takeHomePct}%`, cx, cy - 10);
    ctx.font = "11px system-ui";
    ctx.fillStyle = "#52524e";
    ctx.fillText("Take-Home", cx, cy + 10);
  }, [slices, total, size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
}

/* ── Bracket bar chart (canvas) ── */
function BracketChart({
  breakdownBefore,
  breakdownAfter,
  filing,
}: {
  breakdownBefore: { rate: number; amount: number; tax: number }[];
  breakdownAfter: { rate: number; amount: number; tax: number }[];
  filing: Filing;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = 200;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const brackets = fedBrackets[filing];
    const allRates = brackets.map((b) => b.rate);
    const maxTax = Math.max(
      ...breakdownBefore.map((b) => b.tax),
      ...breakdownAfter.map((b) => b.tax),
      1
    );

    const barAreaTop = 25;
    const barAreaBottom = h - 30;
    const barAreaH = barAreaBottom - barAreaTop;
    const groupW = (w - 40) / allRates.length;
    const barW = groupW * 0.35;
    const gap = groupW * 0.08;

    /* labels */
    ctx.fillStyle = "#52524e";
    ctx.font = "11px system-ui";
    ctx.textAlign = "center";

    for (let i = 0; i < allRates.length; i++) {
      const x = 20 + i * groupW + groupW / 2;
      ctx.fillText(`${allRates[i]}%`, x, h - 8);
    }

    /* bars */
    for (let i = 0; i < allRates.length; i++) {
      const rate = allRates[i];
      const bBefore = breakdownBefore.find((b) => b.rate === rate);
      const bAfter = breakdownAfter.find((b) => b.rate === rate);
      const centerX = 20 + i * groupW + groupW / 2;

      /* before bar */
      const hBefore = bBefore ? (bBefore.tax / maxTax) * barAreaH : 0;
      if (hBefore > 0) {
        ctx.fillStyle = "#ef4444aa";
        ctx.beginPath();
        const bx = centerX - barW - gap / 2;
        roundRect(ctx, bx, barAreaBottom - hBefore, barW, hBefore, 3);
        ctx.fill();
        if (hBefore > 16) {
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 9px system-ui";
          ctx.textAlign = "center";
          ctx.fillText(fmt(bBefore!.tax), bx + barW / 2, barAreaBottom - hBefore + 12);
        }
      }

      /* after bar */
      const hAfter = bAfter ? (bAfter.tax / maxTax) * barAreaH : 0;
      if (hAfter > 0) {
        ctx.fillStyle = "#22c55eaa";
        ctx.beginPath();
        const ax = centerX + gap / 2;
        roundRect(ctx, ax, barAreaBottom - hAfter, barW, hAfter, 3);
        ctx.fill();
        if (hAfter > 16) {
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 9px system-ui";
          ctx.textAlign = "center";
          ctx.fillText(fmt(bAfter!.tax), ax + barW / 2, barAreaBottom - hAfter + 12);
        }
      }
    }

    /* legend */
    ctx.font = "11px system-ui";
    ctx.textAlign = "left";
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(w - 160, 4, 10, 10);
    ctx.fillStyle = "#52524e";
    ctx.fillText("Without OBBBA", w - 146, 13);
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(w - 160, 18, 10, 10);
    ctx.fillStyle = "#52524e";
    ctx.fillText("With OBBBA", w - 146, 27);
  }, [breakdownBefore, breakdownAfter, filing]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: 200 }}
      className="rounded-lg"
    />
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/* ── Main component ── */
export default function OBBBATaxCalculator() {
  /* inputs */
  const [filing, setFiling] = useState<Filing>("single");
  const [wages, setWages] = useState(45000);
  const [tipIncome, setTipIncome] = useState(0);
  const [isTipped, setIsTipped] = useState(false);
  const [overtimeIncome, setOvertimeIncome] = useState(0);
  const [isHourly, setIsHourly] = useState(false);
  const [otMode, setOtMode] = useState<"direct" | "calculate">("direct");
  const [hourlyRate, setHourlyRate] = useState(20);
  const [otHoursPerWeek, setOtHoursPerWeek] = useState(5);
  const [isSenior, setIsSenior] = useState(false);
  const [autoLoanInterest, setAutoLoanInterest] = useState(0);
  const [isAmericanVehicle, setIsAmericanVehicle] = useState(false);
  const [stateCode, setStateCode] = useState("TX");
  const [copied, setCopied] = useState(false);

  /* derived overtime from hourly calc */
  const effectiveOvertime = useMemo(() => {
    if (!isHourly) return 0;
    if (otMode === "calculate") {
      return hourlyRate * 1.5 * otHoursPerWeek * 52;
    }
    return overtimeIncome;
  }, [isHourly, otMode, hourlyRate, otHoursPerWeek, overtimeIncome]);

  /* calculation */
  const result = useMemo(() => {
    const totalGross = wages + (isTipped ? tipIncome : 0) + (isHourly ? effectiveOvertime : 0);
    const agi = totalGross; /* simplified: AGI = total gross */

    /* OBBBA deductions with per-provision phase-outs */
    const tipExempt = isTipped
      ? phaseOut(Math.min(tipIncome, TIP_EXEMPT_CAP), agi, TIPS_PHASE_OUT[filing as keyof typeof TIPS_PHASE_OUT], 100)
      : 0;
    const otExempt = isHourly
      ? phaseOut(Math.min(effectiveOvertime, OT_EXEMPT_CAP[filing]), agi, OT_PHASE_OUT[filing as keyof typeof OT_PHASE_OUT], 100)
      : 0;
    const seniorBonus = isSenior
      ? seniorPhaseOut(SENIOR_BONUS, agi, SENIOR_PHASE_OUT[filing as keyof typeof SENIOR_PHASE_OUT])
      : 0;
    const autoDeduction = isAmericanVehicle
      ? phaseOut(Math.min(autoLoanInterest, AUTO_LOAN_CAP), agi, AUTO_PHASE_OUT[filing as keyof typeof AUTO_PHASE_OUT], 200)
      : 0;

    const totalOBBBAExempt = tipExempt + otExempt; /* income excluded */
    const totalOBBBADeduction = seniorBonus + autoDeduction; /* additional deductions */

    /* existing senior deduction (pre-OBBBA) */
    const existingSenior = isSenior ? existingSeniorDeduction[filing] : 0;

    /* ── WITHOUT OBBBA ── */
    const stdDed = stdDeduction[filing] + existingSenior;
    const taxableWithout = Math.max(0, totalGross - stdDed);
    const fedWithout = calcFedTax(taxableWithout, filing);
    const ficaTotal = calcFICA(totalGross); /* FICA on ALL gross — OBBBA doesn't change FICA */
    const stateWithout = calcStateTax(Math.max(0, totalGross - stdDed), stateCode);
    const totalTaxWithout = fedWithout.tax + ficaTotal.total + stateWithout;

    /* ── WITH OBBBA ── */
    const stdDedOBBBA = stdDeduction[filing] + existingSenior + totalOBBBADeduction;
    const taxableWith = Math.max(0, totalGross - totalOBBBAExempt - stdDedOBBBA);
    const fedWith = calcFedTax(taxableWith, filing);
    /* state tax: OBBBA doesn't affect state taxes, so same base */
    const stateWith = stateWithout;
    const totalTaxWith = fedWith.tax + ficaTotal.total + stateWith;

    /* savings */
    const fedSavings = fedWithout.tax - fedWith.tax;

    /* individual savings breakdown: figure marginal rate */
    const marginalWithout = marginalRate(taxableWithout, filing);
    const tipSavings =
      tipExempt > 0 ? tipExempt * (marginalWithout / 100) : 0;
    const otSavings =
      otExempt > 0 ? otExempt * (marginalWithout / 100) : 0;
    const seniorSavings =
      seniorBonus > 0 ? seniorBonus * (marginalWithout / 100) : 0;
    const autoSavings =
      autoDeduction > 0 ? autoDeduction * (marginalWithout / 100) : 0;

    /* Use actual fed savings for total, not sum of marginal estimates */
    const totalSavings = fedSavings;

    const takeHomeWith = totalGross - totalTaxWith;
    const takeHomeWithout = totalGross - totalTaxWithout;

    const effectiveRateWithout = totalGross > 0 ? (totalTaxWithout / totalGross) * 100 : 0;
    const effectiveRateWith = totalGross > 0 ? (totalTaxWith / totalGross) * 100 : 0;

    return {
      totalGross,
      agi,
      hasPhaseOut: (isTipped && agi > TIPS_PHASE_OUT[filing as keyof typeof TIPS_PHASE_OUT]) ||
        (isHourly && agi > OT_PHASE_OUT[filing as keyof typeof OT_PHASE_OUT]) ||
        (isSenior && agi > SENIOR_PHASE_OUT[filing as keyof typeof SENIOR_PHASE_OUT]) ||
        (isAmericanVehicle && agi > AUTO_PHASE_OUT[filing as keyof typeof AUTO_PHASE_OUT]),
      tipExempt,
      otExempt,
      seniorBonus,
      autoDeduction,
      totalOBBBAExempt,
      totalOBBBADeduction,
      /* without */
      stdDed,
      taxableWithout,
      fedWithout,
      stateWithout,
      totalTaxWithout,
      takeHomeWithout,
      effectiveRateWithout,
      /* with */
      stdDedOBBBA,
      taxableWith,
      fedWith,
      stateWith,
      totalTaxWith,
      takeHomeWith,
      effectiveRateWith,
      /* shared */
      fica: ficaTotal,
      /* savings */
      totalSavings,
      tipSavings,
      otSavings,
      seniorSavings,
      autoSavings,
      fedSavings,
      marginalWithout,
      monthly: totalSavings / 12,
      fourYear: totalSavings * 4,
    };
  }, [
    wages,
    tipIncome,
    isTipped,
    effectiveOvertime,
    isHourly,
    isSenior,
    autoLoanInterest,
    isAmericanVehicle,
    filing,
    stateCode,
  ]);

  const applyProfile = useCallback((p: Profile) => {
    setWages(p.wages);
    setTipIncome(p.tips);
    setIsTipped(p.isTipped);
    setOvertimeIncome(p.overtime);
    setIsHourly(p.isHourly);
    setHourlyRate(p.hourlyRate || 20);
    setOtHoursPerWeek(p.otHoursPerWeek || 5);
    setOtMode(p.otMode);
    setIsSenior(p.isSenior);
    setAutoLoanInterest(p.autoLoanInterest);
    setIsAmericanVehicle(p.isAmericanVehicle);
  }, []);

  const shareText = `I'm saving ${fmt(result.totalSavings)}/year under the OBBBA! Calculate yours at toolpile.app/tools/obbba-tax-calculator`;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [shareText]);

  const inputCls =
    "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  const stateName = states[stateCode]?.name || "None";
  const stateInfo = states[stateCode];

  const donutSlices = [
    { label: "Federal Tax", value: result.fedWith.tax, color: "#ef4444" },
    { label: "FICA", value: result.fica.total, color: "#f97316" },
    { label: "State Tax", value: result.stateWith, color: "#eab308" },
    { label: "Take-Home", value: Math.max(0, result.takeHomeWith), color: "#22c55e" },
  ];

  const hasSavings = result.totalSavings > 0;

  return (
    <ToolLayout
      title="OBBBA Tax Savings Calculator"
      description="Calculate exactly how much you save under the One Big Beautiful Bill Act (OBBBA). See your tax savings from no tax on tips, no tax on overtime, senior bonus deduction, and auto loan interest deduction for 2025-2028."
      slug="obbba-tax-calculator"
      category="Finance"
      keywords={[
        "no tax on tips calculator",
        "OBBBA calculator",
        "no tax on overtime calculator",
        "one big beautiful bill calculator",
        "tip tax savings calculator 2026",
        "OBBBA tax savings",
        "overtime tax deduction calculator",
        "senior deduction calculator 2026",
        "auto loan interest deduction",
        "one big beautiful bill act calculator",
      ]}
      faqs={[
        {
          question: "Who qualifies for the OBBBA no-tax-on-tips provision?",
          answer:
            "Workers in occupations that customarily and regularly receive tips — servers, bartenders, baristas, hairdressers, delivery drivers, valets, and similar roles. Tips can be deducted from federal taxable income up to $25,000 per year, but are still subject to FICA taxes (Social Security and Medicare). The deduction phases out starting at $150,000 MAGI ($300,000 married filing jointly). Married filing separately filers cannot claim this deduction.",
        },
        {
          question: "What is the AGI limit for OBBBA deductions?",
          answer:
            "Each OBBBA provision has its own income phase-out. Tips and overtime phase out starting at $150,000 MAGI ($300,000 MFJ). The senior bonus deduction phases out at $75,000 ($150,000 MFJ). The auto loan interest deduction phases out at $100,000 ($200,000 MFJ). Phase-outs are gradual — your deduction is reduced as income exceeds the threshold, not eliminated at a hard cutoff.",
        },
        {
          question: "Does FICA still apply to tips and overtime under OBBBA?",
          answer:
            "Yes. The OBBBA only provides deductions for tips and overtime from federal income tax. Social Security tax (6.2%) and Medicare tax (1.45%) still apply to all tip and overtime earnings. This is an important distinction — your savings are from income tax only, not payroll tax.",
        },
        {
          question: "When does the OBBBA expire?",
          answer:
            "The tip, overtime, senior deduction, and auto loan interest provisions are effective for tax years 2025 through 2028 — a four-year window. After 2028, these deductions sunset unless Congress extends or makes them permanent.",
        },
        {
          question: "How is the overtime tax deduction different from the tip deduction?",
          answer:
            "The overtime deduction applies to FLSA non-exempt (hourly) W-2 workers for pay earned beyond 40 hours per week, up to $12,500 per year ($25,000 married filing jointly). The tip deduction applies to workers in occupations that customarily and regularly receive tips, up to $25,000 per year. A worker can potentially qualify for both if they are in a tipped hourly role.",
        },
        {
          question:
            "How does the OBBBA senior deduction stack with the existing senior standard deduction?",
          answer:
            "The OBBBA adds a $6,000 bonus deduction for taxpayers age 65 and older, claimed on Schedule 1-A (Form 1040 line 13b), on top of the existing additional senior standard deduction ($1,950 for single/HOH, $1,550 per qualifying spouse for married filing jointly). So a single senior could get the standard deduction ($16,100) plus existing senior addition ($1,950) plus OBBBA bonus ($6,000) = $24,050 total. Married filing separately filers cannot claim the OBBBA bonus.",
        },
        {
          question: "What are the requirements for the auto loan interest deduction?",
          answer:
            "You can deduct up to $10,000 in auto loan interest for new vehicles with final assembly in the United States, for personal use only, with a gross vehicle weight under 14,000 lbs. The loan must have been taken out during 2025-2028. The deduction phases out starting at $100,000 MAGI ($200,000 MFJ). Imported vehicles do not qualify regardless of brand. Married filing separately filers cannot claim this deduction.",
        },
        {
          question: "Does the OBBBA affect my state income taxes?",
          answer:
            "No. The OBBBA provisions only apply to federal income tax. State income taxes are calculated under each state's own rules and are not affected by this federal legislation. Some states may choose to adopt similar provisions separately.",
        },
        {
          question: "Can salaried workers claim the overtime tax deduction?",
          answer:
            "No. The overtime tax deduction under Section 111 of the OBBBA applies only to hourly workers. Salaried employees, even those who work more than 40 hours per week, do not qualify for this provision.",
        },
        {
          question: "How accurate is this calculator?",
          answer:
            "This calculator provides estimates based on the OBBBA provisions using 2026 federal tax brackets and standard deductions. Actual tax savings depend on your complete tax situation, including credits, other deductions, and specific state rules. Consult a tax professional for advice specific to your situation.",
        },
      ]}
      relatedTools={[
        { name: "Tax Calculator", href: "/tools/tax-calculator" },
        { name: "Income Tax Calculator", href: "/tools/income-tax-calculator" },
        { name: "Paycheck Calculator", href: "/tools/paycheck-calculator" },
        { name: "Tip Calculator", href: "/tools/tip-calculator" },
        {
          name: "Self-Employment Tax Calculator",
          href: "/tools/self-employment-tax-calculator",
        },
      ]}
    >
      {/* Sunset banner */}
      <div className="mb-6 bg-orange-500/10 border border-orange-500/30 rounded-xl px-5 py-3 flex items-start gap-3">
        <span className="text-orange-500 text-lg mt-0.5">&#9888;</span>
        <div>
          <p className="text-orange-500 text-sm font-medium">
            Temporary Provisions — Expires After 2028
          </p>
          <p className="text-zinc-200 text-sm mt-0.5">
            OBBBA deductions for tips, overtime, seniors, and auto loans are effective for tax years 2025-2028 only.
          </p>
        </div>
      </div>

      {/* Quick-fill profiles */}
      <div className="mb-6">
        <p className="text-sm text-zinc-400 mb-2 font-medium">Quick profiles — click to auto-fill:</p>
        <div className="flex flex-wrap gap-2">
          {profiles.map((p) => (
            <button
              key={p.label}
              onClick={() => applyProfile(p)}
              className="group bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:border-blue-500/60 hover:text-blue-400 transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              <span className="mr-1.5">{p.emoji}</span>
              <span className="font-medium">{p.label}</span>
              <span className="text-zinc-300 ml-1.5 text-sm hidden sm:inline">{p.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.3fr] gap-6">
        {/* ── INPUT PANEL ── */}
        <div className="space-y-4">
          {/* Filing status */}
          <div>
            <label className={labelCls}>Filing Status</label>
            <div className="flex gap-2">
              {(
                [
                  ["single", "Single"],
                  ["married", "Married Filing Jointly"],
                  ["hoh", "Head of Household"],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setFiling(val)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filing === val
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Wages */}
          <div>
            <label className={labelCls}>Annual Gross Wages (before tips/overtime)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300">$</span>
              <input
                type="number"
                value={wages}
                onChange={(e) => setWages(Math.max(0, +e.target.value))}
                className={inputCls + " pl-7"}
                min={0}
                step={1000}
              />
            </div>
          </div>

          {/* Tips */}
          <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  isTipped ? "bg-blue-600" : "bg-zinc-700"
                }`}
                onClick={() => setIsTipped(!isTipped)}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                    isTipped ? "left-5" : "left-0.5"
                  }`}
                />
              </div>
              <span className="text-sm text-zinc-300 font-medium" onClick={() => setIsTipped(!isTipped)}>
                I work in a tipped occupation
              </span>
            </label>
            {isTipped && (
              <div>
                <label className={labelCls}>Annual Tip Income</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300">$</span>
                  <input
                    type="number"
                    value={tipIncome}
                    onChange={(e) => setTipIncome(Math.max(0, +e.target.value))}
                    className={inputCls + " pl-7"}
                    min={0}
                    step={500}
                  />
                </div>
                <p className="text-sm text-zinc-300 mt-1">
                  Exempt up to $25,000 from federal income tax. FICA still applies.
                </p>
              </div>
            )}
          </div>

          {/* Overtime */}
          <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  isHourly ? "bg-blue-600" : "bg-zinc-700"
                }`}
                onClick={() => setIsHourly(!isHourly)}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                    isHourly ? "left-5" : "left-0.5"
                  }`}
                />
              </div>
              <span className="text-sm text-zinc-300 font-medium" onClick={() => setIsHourly(!isHourly)}>
                I&apos;m an hourly worker (overtime eligible)
              </span>
            </label>
            {isHourly && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  {(
                    [
                      ["direct", "Enter total"],
                      ["calculate", "Calculate from hours"],
                    ] as const
                  ).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setOtMode(val)}
                      className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        otMode === val
                          ? "bg-blue-600/80 text-white"
                          : "bg-zinc-700 text-zinc-400 hover:bg-zinc-600"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {otMode === "direct" ? (
                  <div>
                    <label className={labelCls}>Annual Overtime Income</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300">
                        $
                      </span>
                      <input
                        type="number"
                        value={overtimeIncome}
                        onChange={(e) =>
                          setOvertimeIncome(Math.max(0, +e.target.value))
                        }
                        className={inputCls + " pl-7"}
                        min={0}
                        step={500}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Hourly Rate</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300">
                          $
                        </span>
                        <input
                          type="number"
                          value={hourlyRate}
                          onChange={(e) =>
                            setHourlyRate(Math.max(0, +e.target.value))
                          }
                          className={inputCls + " pl-7"}
                          min={0}
                          step={1}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>OT Hours/Week</label>
                      <input
                        type="number"
                        value={otHoursPerWeek}
                        onChange={(e) =>
                          setOtHoursPerWeek(Math.max(0, +e.target.value))
                        }
                        className={inputCls}
                        min={0}
                        step={1}
                      />
                    </div>
                    <p className="col-span-2 text-sm text-zinc-300">
                      Calculated annual OT:{" "}
                      <span className="text-zinc-300 font-medium">
                        {fmt(effectiveOvertime)}
                      </span>{" "}
                      (rate x 1.5 x hours x 52 weeks)
                    </p>
                  </div>
                )}
                <p className="text-sm text-zinc-300">
                  Exempt up to $12,500 from federal income tax. FICA still
                  applies.
                </p>
              </div>
            )}
          </div>

          {/* Senior */}
          <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  isSenior ? "bg-blue-600" : "bg-zinc-700"
                }`}
                onClick={() => setIsSenior(!isSenior)}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                    isSenior ? "left-5" : "left-0.5"
                  }`}
                />
              </div>
              <div onClick={() => setIsSenior(!isSenior)}>
                <span className="text-sm text-zinc-300 font-medium">
                  I am age 65 or older
                </span>
                <p className="text-sm text-zinc-300">
                  Additional $6,000 standard deduction under OBBBA
                </p>
              </div>
            </label>
          </div>

          {/* Auto loan */}
          <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  isAmericanVehicle ? "bg-blue-600" : "bg-zinc-700"
                }`}
                onClick={() => setIsAmericanVehicle(!isAmericanVehicle)}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                    isAmericanVehicle ? "left-5" : "left-0.5"
                  }`}
                />
              </div>
              <span
                className="text-sm text-zinc-300 font-medium"
                onClick={() => setIsAmericanVehicle(!isAmericanVehicle)}
              >
                I have an auto loan on an American-made vehicle
              </span>
            </label>
            {isAmericanVehicle && (
              <div>
                <label className={labelCls}>
                  Annual Auto Loan Interest Paid
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300">
                    $
                  </span>
                  <input
                    type="number"
                    value={autoLoanInterest}
                    onChange={(e) =>
                      setAutoLoanInterest(Math.max(0, +e.target.value))
                    }
                    className={inputCls + " pl-7"}
                    min={0}
                    max={10000}
                    step={100}
                  />
                </div>
                <p className="text-sm text-zinc-300 mt-1">
                  Deductible up to $10,000. Vehicle must be assembled in the USA.
                </p>
              </div>
            )}
          </div>

          {/* State */}
          <div>
            <label className={labelCls}>State</label>
            <select
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
              className={inputCls}
            >
              {statesSorted.map(([code, s]) => (
                <option key={code} value={code}>
                  {s.name}
                  {s.rate === 0 ? " (no tax)" : ` (${s.rate}%)`}
                </option>
              ))}
            </select>
            <p className="text-sm text-zinc-300 mt-1">
              Note: OBBBA does not affect state taxes. State shown for full picture.
            </p>
          </div>
        </div>

        {/* ── RESULTS PANEL ── */}
        <div className="space-y-5">
          {/* AGI phase-out warning */}
          {result.hasPhaseOut && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl px-5 py-3">
              <p className="text-orange-500 text-sm font-medium">
                Income Phase-Out Applied
              </p>
              <p className="text-zinc-200 text-sm mt-0.5">
                Your AGI of {fmt(result.agi)} exceeds one or more phase-out thresholds. Your OBBBA deductions have been reduced. Phase-outs vary by provision: tips/overtime start at ${filing === "married" ? "300K" : "150K"}, senior deduction at ${filing === "married" ? "150K" : "75K"}, auto loan at ${filing === "married" ? "200K" : "100K"}.
              </p>
            </div>
          )}

          {/* Hero savings */}
          <div
            className={`rounded-2xl p-6 text-center border ${
              hasSavings
                ? "bg-green-500/10 border-green-500/30"
                : "bg-zinc-800/50 border-zinc-700"
            }`}
          >
            <p className="text-sm text-zinc-400 mb-1 uppercase tracking-wider font-medium">
              Your Annual OBBBA Tax Savings
            </p>
            <p
              className={`text-5xl sm:text-6xl font-bold ${
                hasSavings ? "text-green-400" : "text-zinc-300"
              }`}
            >
              {fmt(result.totalSavings)}
            </p>
            {hasSavings && (
              <p className="text-green-300/80 text-sm mt-2">
                That&apos;s{" "}
                <span className="font-semibold text-green-300">
                  {fmt(Math.round(result.monthly))}
                </span>{" "}
                more per month in your pocket
              </p>
            )}
            {!hasSavings && (
              <p className="text-zinc-300 text-sm mt-2">
                Toggle tips, overtime, senior status, or auto loan above to see
                your savings
              </p>
            )}
          </div>

          {/* 4-year total */}
          {hasSavings && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl px-5 py-3 text-center">
              <p className="text-blue-300 text-sm">
                Over the life of OBBBA (2025-2028), you&apos;ll save an estimated{" "}
                <span className="font-bold text-blue-200 text-lg">
                  {fmt(result.fourYear)}
                </span>
              </p>
            </div>
          )}

          {/* Share section */}
          {hasSavings && (
            <div className="bg-gradient-to-r from-blue-600/10 to-green-600/10 border border-blue-500/20 rounded-xl p-5">
              <p className="text-base text-zinc-100 font-semibold mb-3">
                Share your savings
              </p>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  readOnly
                  value={shareText}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 truncate"
                />
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    copied
                      ? "bg-green-600 text-white"
                      : "bg-blue-600 text-white hover:bg-blue-500"
                  }`}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="flex gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-200 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  Post on X
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-200 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Share
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=https://toolpile.app/tools/obbba-tax-calculator`}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-200 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                </a>
              </div>
            </div>
          )}

          {/* Savings breakdown cards */}
          {hasSavings && (
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Tips Tax Savings",
                  value: result.tipSavings,
                  show: result.tipExempt > 0,
                  detail: `${fmt(result.tipExempt)} deducted`,
                  color: "text-green-400",
                  bg: "bg-green-500/5",
                  border: "border-green-500/20",
                },
                {
                  label: "Overtime Tax Savings",
                  value: result.otSavings,
                  show: result.otExempt > 0,
                  detail: `${fmt(result.otExempt)} deducted`,
                  color: "text-green-400",
                  bg: "bg-green-500/5",
                  border: "border-green-500/20",
                },
                {
                  label: "Senior Deduction Savings",
                  value: result.seniorSavings,
                  show: result.seniorBonus > 0,
                  detail: `${fmt(result.seniorBonus)} deduction`,
                  color: "text-green-400",
                  bg: "bg-green-500/5",
                  border: "border-green-500/20",
                },
                {
                  label: "Auto Loan Savings",
                  value: result.autoSavings,
                  show: result.autoDeduction > 0,
                  detail: `${fmt(result.autoDeduction)} deduction`,
                  color: "text-green-400",
                  bg: "bg-green-500/5",
                  border: "border-green-500/20",
                },
              ]
                .filter((c) => c.show)
                .map((card) => (
                  <div
                    key={card.label}
                    className={`${card.bg} border ${card.border} rounded-xl p-4`}
                  >
                    <p className="text-sm text-zinc-400">{card.label}</p>
                    <p className={`text-2xl font-bold ${card.color} mt-1`}>
                      {fmt(card.value)}
                    </p>
                    <p className="text-sm text-zinc-300 mt-0.5">{card.detail}</p>
                  </div>
                ))}
            </div>
          )}

          {/* Side-by-side comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-center">
              <p className="text-sm text-zinc-400 uppercase tracking-wider mb-1">
                Without OBBBA
              </p>
              <p className="text-2xl font-bold text-red-400">
                {fmt(result.totalTaxWithout)}
              </p>
              <p className="text-sm text-zinc-300 mt-1">Total federal + FICA + state tax</p>
              <p className="text-sm text-zinc-300">
                Effective rate: {pct(result.effectiveRateWithout)}
              </p>
            </div>
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 text-center">
              <p className="text-sm text-zinc-400 uppercase tracking-wider mb-1">
                With OBBBA
              </p>
              <p className="text-2xl font-bold text-green-400">
                {fmt(result.totalTaxWith)}
              </p>
              <p className="text-sm text-zinc-300 mt-1">Total federal + FICA + state tax</p>
              <p className="text-sm text-zinc-300">
                Effective rate: {pct(result.effectiveRateWith)}
              </p>
            </div>
          </div>

          {/* Effective rate comparison */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-center">
              <p className="text-sm text-zinc-300">Marginal Bracket</p>
              <p className="text-lg font-semibold text-zinc-200">
                {result.marginalWithout}%
              </p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-center">
              <p className="text-sm text-zinc-300">Rate Without</p>
              <p className="text-lg font-semibold text-red-400">
                {pct(result.effectiveRateWithout)}
              </p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-center">
              <p className="text-sm text-zinc-300">Rate With OBBBA</p>
              <p className="text-lg font-semibold text-green-400">
                {pct(result.effectiveRateWith)}
              </p>
            </div>
          </div>

          {/* Donut chart */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-6">
            <DonutChart slices={donutSlices} />
            <div className="flex-1 space-y-2 w-full">
              <p className="text-sm text-zinc-300 uppercase tracking-wider font-medium mb-2">
                Where Your Money Goes (With OBBBA)
              </p>
              {donutSlices.map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ background: s.color }}
                    />
                    <span className="text-sm text-zinc-400">{s.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-zinc-200 font-medium">
                      {fmt(s.value)}
                    </span>
                    <span className="text-sm text-zinc-300 ml-1.5">
                      {result.totalGross > 0
                        ? pct((s.value / result.totalGross) * 100)
                        : "0%"}
                    </span>
                  </div>
                </div>
              ))}
              <div className="border-t border-zinc-700 pt-2 mt-2 flex justify-between">
                <span className="text-sm text-zinc-300 font-medium">Gross Income</span>
                <span className="text-sm text-zinc-100 font-bold">
                  {fmt(result.totalGross)}
                </span>
              </div>
            </div>
          </div>

          {/* Tax bracket visualization */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
            <h3 className="text-sm font-medium text-zinc-300 mb-3">
              Federal Tax by Bracket — Before vs After OBBBA
            </h3>
            <BracketChart
              breakdownBefore={result.fedWithout.breakdown}
              breakdownAfter={result.fedWith.breakdown}
              filing={filing}
            />
          </div>

          {/* Detailed breakdown table */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-700">
              <h3 className="text-sm font-medium text-zinc-300">
                Detailed Calculation
              </h3>
            </div>
            <div className="divide-y divide-zinc-800">
              <Row label="Gross Wages" value={fmt(wages)} />
              {isTipped && (
                <Row label="Tip Income" value={fmt(tipIncome)} />
              )}
              {isHourly && (
                <Row
                  label="Overtime Income"
                  value={fmt(effectiveOvertime)}
                />
              )}
              <Row
                label="Total Gross Income"
                value={fmt(result.totalGross)}
                bold
              />
              <Row
                label={`Standard Deduction (${filing === "married" ? "MFJ" : filing === "hoh" ? "HOH" : "Single"})`}
                value={`-${fmt(stdDeduction[filing])}`}
                dim
              />
              {isSenior && (
                <Row
                  label="Existing Senior Deduction"
                  value={`-${fmt(existingSeniorDeduction[filing])}`}
                  dim
                />
              )}
              {result.tipExempt > 0 && (
                <Row
                  label="OBBBA: Tips Exempt"
                  value={`-${fmt(result.tipExempt)}`}
                  green
                />
              )}
              {result.otExempt > 0 && (
                <Row
                  label="OBBBA: Overtime Exempt"
                  value={`-${fmt(result.otExempt)}`}
                  green
                />
              )}
              {result.seniorBonus > 0 && (
                <Row
                  label="OBBBA: Senior Bonus Deduction"
                  value={`-${fmt(result.seniorBonus)}`}
                  green
                />
              )}
              {result.autoDeduction > 0 && (
                <Row
                  label="OBBBA: Auto Loan Interest"
                  value={`-${fmt(result.autoDeduction)}`}
                  green
                />
              )}
              <Row
                label="Federal Taxable Income"
                value={fmt(result.taxableWith)}
                bold
                bg
              />
              <Row
                label={`Federal Income Tax (${result.fedWith.marginal}% bracket)`}
                value={fmt(result.fedWith.tax)}
                red
              />
              <Row
                label="Social Security (6.2%)"
                value={fmt(result.fica.ss)}
                red
              />
              <Row
                label={`Medicare (${result.totalGross > MEDICARE_ADDITIONAL_THRESHOLD ? "1.45% + 0.9%" : "1.45%"})`}
                value={fmt(result.fica.medicare)}
                red
              />
              {stateInfo && stateInfo.rate > 0 && (
                <Row
                  label={`${stateName} State Tax (~${stateInfo.rate}%)`}
                  value={fmt(result.stateWith)}
                  red
                />
              )}
              <div className="px-4 py-3 flex justify-between text-sm bg-zinc-800/30">
                <span className="text-zinc-200 font-semibold">Total Tax (With OBBBA)</span>
                <span className="text-red-400 font-bold text-base">
                  {fmt(result.totalTaxWith)}
                </span>
              </div>
              <div className="px-4 py-3 flex justify-between text-sm bg-green-500/5">
                <span className="text-green-400 font-semibold">
                  Take-Home Pay
                </span>
                <span className="text-green-400 font-bold text-base">
                  {fmt(result.takeHomeWith)}
                </span>
              </div>
              {hasSavings && (
                <div className="px-4 py-3 flex justify-between text-sm bg-green-500/10">
                  <span className="text-green-300 font-semibold">
                    OBBBA Savings vs. Prior Law
                  </span>
                  <span className="text-green-300 font-bold text-base">
                    {fmt(result.totalSavings)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Monthly breakdown */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-center">
              <p className="text-sm text-zinc-300">Monthly Take-Home</p>
              <p className="text-lg font-semibold text-zinc-200">
                {fmt(result.takeHomeWith / 12)}
              </p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-center">
              <p className="text-sm text-zinc-300">Bi-Weekly</p>
              <p className="text-lg font-semibold text-zinc-200">
                {fmt(result.takeHomeWith / 26)}
              </p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-center">
              <p className="text-sm text-zinc-300">Weekly</p>
              <p className="text-lg font-semibold text-zinc-200">
                {fmt(result.takeHomeWith / 52)}
              </p>
            </div>
          </div>


          {/* Disclaimer */}
          <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-lg px-4 py-3">
            <p className="text-sm text-zinc-300 leading-relaxed">
              <span className="text-zinc-400 font-medium">Disclaimer:</span>{" "}
              This calculator provides estimates for educational purposes based
              on the One Big Beautiful Bill Act provisions and 2026 federal tax
              brackets. Actual tax savings depend on your complete tax situation.
              Consult a tax professional for advice specific to your situation.
              OBBBA provisions are temporary and expire after tax year 2028.
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

/* ── Row helper ── */
function Row({
  label,
  value,
  bold,
  dim,
  red,
  green,
  bg,
}: {
  label: string;
  value: string;
  bold?: boolean;
  dim?: boolean;
  red?: boolean;
  green?: boolean;
  bg?: boolean;
}) {
  return (
    <div
      className={`px-4 py-2.5 flex justify-between text-sm ${
        bg ? "bg-zinc-800/30" : ""
      }`}
    >
      <span
        className={
          bold
            ? "text-zinc-300 font-medium"
            : green
            ? "text-green-400"
            : "text-zinc-400"
        }
      >
        {label}
      </span>
      <span
        className={
          bold
            ? "text-zinc-100 font-medium"
            : red
            ? "text-red-400 font-medium"
            : green
            ? "text-green-400 font-medium"
            : dim
            ? "text-zinc-400"
            : "text-zinc-100 font-medium"
        }
      >
        {value}
      </span>
    </div>
  );
}
