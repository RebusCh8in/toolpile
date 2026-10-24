"use client";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";

/* ───── types ───── */
interface Profile {
  score: number;
  balances: number;
  limits: number;
  accounts: number;
  oldestAccountYears: number;
  hardInquiries: number;
  late30: boolean;
  late60: boolean;
  late90: boolean;
  collections: boolean;
}

interface SimAction {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  value: number;
}

type FactorRating = "Excellent" | "Good" | "Fair" | "Poor";

interface FactorDetail {
  name: string;
  weight: number;
  rating: FactorRating;
  color: string;
  tip: string;
}

/* ───── helpers ───── */
function clampScore(s: number) {
  return Math.round(Math.max(300, Math.min(850, s)));
}

function scoreCategory(s: number): { label: string; color: string } {
  if (s >= 800) return { label: "Excellent", color: "#16a34a" };
  if (s >= 740) return { label: "Very Good", color: "#22c55e" };
  if (s >= 670) return { label: "Good", color: "#eab308" };
  if (s >= 580) return { label: "Fair", color: "#f97316" };
  return { label: "Poor", color: "#ef4444" };
}

function ratingColor(r: FactorRating) {
  if (r === "Excellent") return "#22c55e";
  if (r === "Good") return "#eab308";
  if (r === "Fair") return "#f97316";
  return "#ef4444";
}

function utilization(balances: number, limits: number) {
  if (limits <= 0) return 100;
  return Math.round((balances / limits) * 100);
}

/* ───── simulation engine ───── */
function computeFactors(p: Profile, actions: SimAction[]): { factors: FactorDetail[]; simScore: number; tips: string[] } {
  let bal = p.balances;
  let lim = p.limits;
  let accts = p.accounts;
  let oldestYrs = p.oldestAccountYears;
  let inquiries = p.hardInquiries;
  let hasLate30 = p.late30;
  let hasLate60 = p.late60;
  let hasLate90 = p.late90;
  let hasCollections = p.collections;

  let delta = 0;

  // Apply actions
  for (const a of actions) {
    if (!a.enabled) continue;
    switch (a.id) {
      case "paydown":
        bal = Math.max(0, bal - a.value);
        break;
      case "newcard":
        accts += 1;
        inquiries += 1;
        lim += 5000; // assume $5k limit
        break;
      case "closeold":
        if (accts > 1) accts -= 1;
        oldestYrs = Math.max(1, oldestYrs - 3); // losing oldest reduces avg
        break;
      case "misspayment":
        hasLate30 = true;
        break;
      case "payoffcollection":
        hasCollections = false;
        break;
      case "authorizeduser":
        accts += 1;
        oldestYrs = Math.max(oldestYrs, oldestYrs + 2);
        break;
      case "applyloan":
        inquiries += 1;
        break;
      case "paytozero":
        bal = 0;
        break;
    }
  }

  const util = utilization(bal, lim);

  // Payment History (35%)
  let paymentScore: FactorRating;
  let paymentDelta = 0;
  if (hasLate90 || hasCollections) { paymentScore = "Poor"; paymentDelta = -80; }
  else if (hasLate60) { paymentScore = "Poor"; paymentDelta = -60; }
  else if (hasLate30) { paymentScore = "Fair"; paymentDelta = -40; }
  else { paymentScore = "Excellent"; paymentDelta = 20; }

  // Credit Utilization (30%)
  let utilScore: FactorRating;
  let utilDelta = 0;
  if (util <= 9) { utilScore = "Excellent"; utilDelta = 30; }
  else if (util <= 29) { utilScore = "Good"; utilDelta = 10; }
  else if (util <= 49) { utilScore = "Fair"; utilDelta = -10; }
  else if (util <= 74) { utilScore = "Fair"; utilDelta = -30; }
  else { utilScore = "Poor"; utilDelta = -50; }

  // Length of Credit History (15%)
  let lengthScore: FactorRating;
  let lengthDelta = 0;
  if (oldestYrs >= 9) { lengthScore = "Excellent"; lengthDelta = 15; }
  else if (oldestYrs >= 5) { lengthScore = "Good"; lengthDelta = 5; }
  else if (oldestYrs >= 2) { lengthScore = "Fair"; lengthDelta = -5; }
  else { lengthScore = "Poor"; lengthDelta = -15; }

  // Credit Mix (10%)
  let mixScore: FactorRating;
  let mixDelta = 0;
  if (accts >= 5) { mixScore = "Excellent"; mixDelta = 10; }
  else if (accts >= 3) { mixScore = "Good"; mixDelta = 5; }
  else if (accts >= 2) { mixScore = "Fair"; mixDelta = 0; }
  else { mixScore = "Poor"; mixDelta = -10; }

  // New Credit (10%)
  let newCreditScore: FactorRating;
  let newCreditDelta = 0;
  if (inquiries === 0) { newCreditScore = "Excellent"; newCreditDelta = 10; }
  else if (inquiries <= 2) { newCreditScore = "Good"; newCreditDelta = 0; }
  else if (inquiries <= 4) { newCreditScore = "Fair"; newCreditDelta = -10; }
  else { newCreditScore = "Poor"; newCreditDelta = -25; }

  delta = paymentDelta + utilDelta + lengthDelta + mixDelta + newCreditDelta;

  // Blend: start from base score and adjust
  const baseScore = p.score;
  const simScore = clampScore(baseScore + delta);

  const factors: FactorDetail[] = [
    { name: "Payment History", weight: 35, rating: paymentScore, color: ratingColor(paymentScore), tip: paymentScore !== "Excellent" ? "Pay all bills on time every month. Set up autopay to avoid missed payments." : "Great job keeping payments on time!" },
    { name: "Credit Utilization", weight: 30, rating: utilScore, color: ratingColor(utilScore), tip: utilScore !== "Excellent" ? `Your utilization is ${util}%. Aim for under 10% by paying down balances or requesting limit increases.` : `Your utilization is ${util}% — excellent!` },
    { name: "Length of Credit History", weight: 15, rating: lengthScore, color: ratingColor(lengthScore), tip: lengthScore !== "Excellent" ? "Keep your oldest accounts open. Time is your friend here." : "Your long credit history is a strong asset." },
    { name: "Credit Mix", weight: 10, rating: mixScore, color: ratingColor(mixScore), tip: mixScore !== "Excellent" ? "A mix of credit types (cards, loans, mortgage) can help. Only open accounts you need." : "You have a healthy mix of credit accounts." },
    { name: "New Credit", weight: 10, rating: newCreditScore, color: ratingColor(newCreditScore), tip: newCreditScore !== "Excellent" ? "Limit hard inquiries. Space out applications by 6+ months." : "Few recent inquiries — that helps your score." },
  ];

  // Generate tips sorted by weakest factors
  const sortedFactors = [...factors].sort((a, b) => {
    const order: Record<FactorRating, number> = { Poor: 0, Fair: 1, Good: 2, Excellent: 3 };
    return order[a.rating] - order[b.rating];
  });
  const tips = sortedFactors.filter(f => f.rating !== "Excellent").slice(0, 3).map(f => f.tip);
  if (tips.length === 0) tips.push("Your credit profile looks strong across all factors. Keep it up!");

  return { factors, simScore, tips };
}

/* ───── gauge drawing ───── */
function drawGauge(canvas: HTMLCanvasElement, currentScore: number, simScore: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h - 30;
  const radius = Math.min(cx - 20, cy - 20);
  const lineWidth = 20;

  // Background arc
  ctx.beginPath();
  ctx.arc(cx, cy, radius, Math.PI, 0);
  ctx.strokeStyle = "#27272a";
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.stroke();

  // Gradient arc
  const gradient = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
  gradient.addColorStop(0, "#ef4444");
  gradient.addColorStop(0.25, "#f97316");
  gradient.addColorStop(0.45, "#eab308");
  gradient.addColorStop(0.7, "#22c55e");
  gradient.addColorStop(1, "#16a34a");

  ctx.beginPath();
  ctx.arc(cx, cy, radius, Math.PI, 0);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.stroke();

  // Dim areas past sim score
  const scoreToAngle = (s: number) => Math.PI + ((s - 300) / 550) * Math.PI;

  // Needle — current score (thin, subtle)
  const currentAngle = scoreToAngle(currentScore);
  const needleLen = radius - lineWidth - 5;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(currentAngle) * needleLen * 0.5, cy + Math.sin(currentAngle) * needleLen * 0.5);
  ctx.strokeStyle = "rgba(161,161,170,0.4)";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.stroke();

  // Needle — simulated score (bold)
  const simAngle = scoreToAngle(simScore);
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(simAngle) * needleLen, cy + Math.sin(simAngle) * needleLen);
  ctx.strokeStyle = scoreCategory(simScore).color;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.stroke();

  // Center dot
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fillStyle = "#e4e4e7";
  ctx.fill();

  // Score text
  ctx.fillStyle = "#fafafa";
  ctx.font = `bold ${Math.max(28, radius * 0.35)}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(String(simScore), cx, cy - 12);

  // Label
  const cat = scoreCategory(simScore);
  ctx.fillStyle = cat.color;
  ctx.font = `600 ${Math.max(13, radius * 0.13)}px system-ui, sans-serif`;
  ctx.fillText(cat.label, cx, cy - 12 + Math.max(18, radius * 0.18));

  // Range labels
  ctx.fillStyle = "#71717a";
  ctx.font = `${Math.max(10, radius * 0.09)}px system-ui, sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText("300", cx - radius - 5, cy + 20);
  ctx.textAlign = "right";
  ctx.fillText("850", cx + radius + 5, cy + 20);

  // Current score label if different
  if (currentScore !== simScore) {
    ctx.fillStyle = "#a1a1aa";
    ctx.font = `${Math.max(11, radius * 0.1)}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(`Current: ${currentScore}`, cx, cy + 20);
  }
}

/* ───── component ───── */
export default function Page() {
  // Profile state
  const [profile, setProfile] = useState<Profile>({
    score: 680,
    balances: 4500,
    limits: 15000,
    accounts: 4,
    oldestAccountYears: 6,
    hardInquiries: 2,
    late30: false,
    late60: false,
    late90: false,
    collections: false,
  });

  const [actions, setActions] = useState<SimAction[]>([
    { id: "paydown", label: "Pay down credit card balance", description: "Reduce your total credit card balance", enabled: false, value: 2000 },
    { id: "paytozero", label: "Pay all balances to $0", description: "Eliminate all credit card debt", enabled: false, value: 0 },
    { id: "newcard", label: "Open a new credit card", description: "Adds account, inquiry, and ~$5K limit", enabled: false, value: 0 },
    { id: "closeold", label: "Close an old account", description: "Reduces account count and avg age", enabled: false, value: 0 },
    { id: "misspayment", label: "Miss a payment (30+ days late)", description: "A single missed payment can drop your score significantly", enabled: false, value: 0 },
    { id: "payoffcollection", label: "Pay off a collection", description: "Removes the collection flag from your profile", enabled: false, value: 0 },
    { id: "authorizeduser", label: "Get added as authorized user", description: "Inherit an established account history", enabled: false, value: 0 },
    { id: "applyloan", label: "Apply for a loan (hard inquiry)", description: "Adds one hard inquiry to your report", enabled: false, value: 0 },
  ]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { factors, simScore, tips } = useMemo(() => computeFactors(profile, actions), [profile, actions]);
  const currentUtil = utilization(profile.balances, profile.limits);

  // Compute sim utilization
  const simUtil = useMemo(() => {
    let bal = profile.balances;
    let lim = profile.limits;
    for (const a of actions) {
      if (!a.enabled) continue;
      if (a.id === "paydown") bal = Math.max(0, bal - a.value);
      if (a.id === "paytozero") bal = 0;
      if (a.id === "newcard") lim += 5000;
    }
    return utilization(bal, lim);
  }, [profile, actions]);

  const scoreDiff = simScore - profile.score;

  const updateProfile = useCallback((key: keyof Profile, val: number | boolean) => {
    setProfile(p => ({ ...p, [key]: val }));
  }, []);

  const toggleAction = useCallback((id: string) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  }, []);

  const updateActionValue = useCallback((id: string, val: number) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, value: val } : a));
  }, []);

  // Draw gauge
  useEffect(() => {
    if (canvasRef.current) drawGauge(canvasRef.current, profile.score, simScore);
  }, [profile.score, simScore]);

  // Resize
  useEffect(() => {
    const handler = () => {
      if (canvasRef.current) drawGauge(canvasRef.current, profile.score, simScore);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [profile.score, simScore]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  // Action impact estimation for each action
  const actionImpacts = useMemo(() => {
    const impacts: Record<string, number> = {};
    for (const a of actions) {
      const onlyThis = actions.map(x => x.id === a.id ? { ...x, enabled: true } : { ...x, enabled: false });
      const { simScore: s } = computeFactors(profile, onlyThis);
      impacts[a.id] = s - profile.score;
    }
    return impacts;
  }, [profile, actions]);

  return (
    <ToolLayout
      title="Credit Score Simulator"
      description="Simulate how financial actions like paying off debt, opening new accounts, or missing payments could affect your credit score. Free, instant, and educational."
      slug="credit-score-simulator"
      category="Finance"
      keywords={[
        "credit score simulator",
        "credit score calculator",
        "what affects credit score",
        "credit score estimator",
        "improve credit score",
        "FICO score calculator",
        "credit score checker",
      ]}
      faqs={[
        {
          question: "What is a good credit score?",
          answer: "FICO scores range from 300 to 850. A score of 670-739 is considered Good, 740-799 is Very Good, and 800-850 is Excellent. Most lenders consider 670+ as acceptable for favorable loan terms, though the best rates typically require 740 or above.",
        },
        {
          question: "How is my credit score calculated?",
          answer: "FICO scores are based on five weighted factors: Payment History (35%) — whether you pay on time; Credit Utilization (30%) — how much of your available credit you use; Length of Credit History (15%) — how long your accounts have been open; Credit Mix (10%) — variety of account types; and New Credit (10%) — recent inquiries and new accounts.",
        },
        {
          question: "How can I improve my credit score fast?",
          answer: "The fastest ways to improve your score are: 1) Pay down credit card balances to lower utilization below 10%, 2) Get added as an authorized user on a family member's old, well-managed card, 3) Dispute any errors on your credit report, and 4) Set up autopay so you never miss a payment. Reducing utilization can show results in as little as 30 days.",
        },
        {
          question: "Does checking my credit score lower it?",
          answer: "No. Checking your own credit score is a 'soft inquiry' and does not affect your score at all. Only 'hard inquiries' — when a lender checks your credit for a lending decision — can temporarily lower your score by a few points. You can check your own score as often as you like.",
        },
        {
          question: "How long do negative items stay on my credit report?",
          answer: "Most negative items remain on your credit report for 7 years from the date of the first missed payment. Chapter 7 bankruptcies stay for 10 years. Hard inquiries fall off after 2 years but only affect your score for about 12 months. The impact of negative items diminishes over time.",
        },
        {
          question: "What is credit utilization and why does it matter?",
          answer: "Credit utilization is the percentage of your available credit that you are using. It is calculated by dividing your total credit card balances by your total credit limits. It accounts for 30% of your FICO score. Experts recommend keeping utilization below 30%, and below 10% for the best scores. Both overall and per-card utilization matter.",
        },
      ]}
      relatedTools={[
        { name: "Credit Card Payoff Calculator", href: "/tools/credit-card-payoff-calculator" },
        { name: "Debt Payoff Calculator", href: "/tools/debt-payoff-calculator" },
        { name: "Loan Calculator", href: "/tools/loan-calculator" },
        { name: "Budget Calculator", href: "/tools/budget-calculator" },
      ]}
      guide={
        <>
          <h2>Understanding Your FICO Score</h2>
          <p>
            Your FICO credit score is a three-digit number between 300 and 850 that lenders use to evaluate your creditworthiness.
            It determines the interest rates you qualify for on mortgages, auto loans, and credit cards — and can even affect your ability
            to rent an apartment or get certain jobs. A higher score means lower borrowing costs: the difference between a 680 and a 780
            score on a 30-year mortgage could save you tens of thousands of dollars in interest over the life of the loan.
          </p>
          <h2>The Five Factors That Determine Your Score</h2>
          <p>
            FICO scores are built on five weighted categories. <strong>Payment History (35%)</strong> is the most important — even a
            single 30-day late payment can drop your score by 60-110 points. <strong>Credit Utilization (30%)</strong> measures how much
            of your available credit you are using; keeping it under 10% earns the best scores. <strong>Length of Credit History (15%)</strong> rewards
            long-standing accounts, so think twice before closing your oldest card. <strong>Credit Mix (10%)</strong> looks at whether you
            have a variety of account types. <strong>New Credit (10%)</strong> tracks recent hard inquiries and newly opened accounts.
          </p>
          <h2>Quick Wins for Score Improvement</h2>
          <p>
            If you want to boost your score quickly, focus on the two largest factors: payment history and utilization. Set up autopay
            for at least the minimum payment on every account so you never miss a due date. Pay down credit card balances aggressively —
            going from 50% utilization to under 10% can add 30-50 points. Request credit limit increases (without a hard pull) to lower
            your utilization ratio without paying anything down. Finally, check your credit reports for errors at AnnualCreditReport.com
            and dispute any inaccuracies, as roughly 1 in 5 reports contain mistakes that could be dragging your score down.
          </p>
        </>
      }
    >
      {/* Disclaimer */}
      <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-300/90">
        <strong>Disclaimer:</strong> This is an educational simulator, not a real credit score. Actual FICO scores are calculated using
        proprietary algorithms with your full credit report data. Use this tool to understand general principles — not as financial advice.
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Left Column: Inputs ── */}
        <div className="space-y-6">
          {/* Section 1: Current Profile */}
          <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-5">
            <h2 className="text-lg font-semibold text-zinc-100 mb-4">Your Current Profile</h2>
            <div className="space-y-4">
              {/* Score slider */}
              <div>
                <label className={labelCls}>
                  Current Credit Score: <span className="text-zinc-100 font-medium">{profile.score}</span>
                </label>
                <input
                  type="range"
                  min={300}
                  max={850}
                  value={profile.score}
                  onChange={e => updateProfile("score", +e.target.value)}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                  <span>300</span>
                  <span>850</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Card Balances ($)</label>
                  <input
                    type="number"
                    value={profile.balances}
                    onChange={e => updateProfile("balances", Math.max(0, +e.target.value))}
                    className={inputCls}
                    min={0}
                    step={100}
                  />
                </div>
                <div>
                  <label className={labelCls}>Card Limits ($)</label>
                  <input
                    type="number"
                    value={profile.limits}
                    onChange={e => updateProfile("limits", Math.max(0, +e.target.value))}
                    className={inputCls}
                    min={0}
                    step={500}
                  />
                </div>
              </div>

              {/* Utilization display */}
              <div className="rounded-lg bg-zinc-900 px-3 py-2 text-sm">
                <span className="text-zinc-400">Current Utilization: </span>
                <span className={`font-semibold ${currentUtil <= 9 ? "text-green-400" : currentUtil <= 29 ? "text-yellow-400" : currentUtil <= 49 ? "text-orange-400" : "text-red-400"}`}>
                  {currentUtil}%
                </span>
                {currentUtil > 30 && <span className="text-zinc-500 ml-2 text-xs">(aim for &lt;30%)</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Open Accounts</label>
                  <input
                    type="number"
                    value={profile.accounts}
                    onChange={e => updateProfile("accounts", Math.max(1, +e.target.value))}
                    className={inputCls}
                    min={1}
                    max={50}
                  />
                </div>
                <div>
                  <label className={labelCls}>Oldest Account (yrs)</label>
                  <input
                    type="number"
                    value={profile.oldestAccountYears}
                    onChange={e => updateProfile("oldestAccountYears", Math.max(0, +e.target.value))}
                    className={inputCls}
                    min={0}
                    max={50}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Hard Inquiries (last 12 mo)</label>
                <input
                  type="number"
                  value={profile.hardInquiries}
                  onChange={e => updateProfile("hardInquiries", Math.max(0, +e.target.value))}
                  className={inputCls}
                  min={0}
                  max={20}
                />
              </div>

              {/* Late payment toggles */}
              <div>
                <label className={labelCls}>Late Payments</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {(["late30", "late60", "late90"] as const).map(key => {
                    const labels = { late30: "30+ Days", late60: "60+ Days", late90: "90+ Days" };
                    return (
                      <button
                        key={key}
                        onClick={() => updateProfile(key, !profile[key])}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          profile[key]
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600"
                        }`}
                      >
                        {labels[key]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Collections toggle */}
              <div>
                <label className={labelCls}>Collections / Charge-offs</label>
                <button
                  onClick={() => updateProfile("collections", !profile.collections)}
                  className={`mt-1 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    profile.collections
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600"
                  }`}
                >
                  {profile.collections ? "Yes — Has Collections" : "No Collections"}
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: What-If Simulator */}
          <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-5">
            <h2 className="text-lg font-semibold text-zinc-100 mb-1">&ldquo;What If&rdquo; Simulator</h2>
            <p className="text-sm text-zinc-500 mb-4">Toggle actions to see how they could affect your score.</p>
            <div className="space-y-3">
              {actions.map(a => {
                const impact = actionImpacts[a.id];
                return (
                  <div
                    key={a.id}
                    className={`rounded-lg border p-3 transition-colors ${
                      a.enabled
                        ? "border-blue-500/40 bg-blue-500/5"
                        : "border-zinc-700 bg-zinc-900/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => toggleAction(a.id)}
                          className="flex items-center gap-2 text-left w-full"
                        >
                          <div
                            className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${
                              a.enabled
                                ? "bg-blue-600 border-blue-600"
                                : "border-zinc-600 bg-zinc-800"
                            }`}
                          >
                            {a.enabled && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-zinc-200">{a.label}</span>
                            <p className="text-xs text-zinc-500 mt-0.5">{a.description}</p>
                          </div>
                        </button>
                        {/* Paydown slider */}
                        {a.id === "paydown" && a.enabled && (
                          <div className="mt-2 ml-6">
                            <label className="text-xs text-zinc-400">
                              Pay down: <span className="text-zinc-200 font-medium">${a.value.toLocaleString()}</span>
                            </label>
                            <input
                              type="range"
                              min={0}
                              max={profile.balances}
                              step={100}
                              value={a.value}
                              onChange={e => updateActionValue(a.id, +e.target.value)}
                              className="w-full accent-blue-600 mt-1"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <span
                          className={`text-sm font-semibold ${
                            impact > 0 ? "text-green-400" : impact < 0 ? "text-red-400" : "text-zinc-500"
                          }`}
                        >
                          {impact > 0 ? "+" : ""}
                          {impact} pts
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right Column: Outputs ── */}
        <div className="space-y-6">
          {/* Score Gauge */}
          <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-5">
            <h2 className="text-lg font-semibold text-zinc-100 mb-3">Simulated Score</h2>
            <canvas
              ref={canvasRef}
              className="w-full"
              style={{ height: 220 }}
            />
            {/* Before/After */}
            {scoreDiff !== 0 && (
              <div className="flex items-center justify-center gap-4 mt-2 text-sm">
                <span className="text-zinc-400">
                  {profile.score} <span className="text-zinc-600">(current)</span>
                </span>
                <span className="text-zinc-600">→</span>
                <span className={scoreDiff > 0 ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
                  {simScore}{" "}
                  <span className="text-xs">
                    ({scoreDiff > 0 ? "+" : ""}
                    {scoreDiff})
                  </span>
                </span>
              </div>
            )}
            {/* Utilization change */}
            {actions.some(a => a.enabled && ["paydown", "paytozero", "newcard"].includes(a.id)) && (
              <div className="mt-3 text-center text-sm">
                <span className="text-zinc-400">Utilization: </span>
                <span className="text-zinc-500">{currentUtil}%</span>
                <span className="text-zinc-600 mx-1">→</span>
                <span className={simUtil < currentUtil ? "text-green-400 font-medium" : "text-zinc-300 font-medium"}>
                  {simUtil}%
                </span>
              </div>
            )}
          </div>

          {/* Factor Breakdown */}
          <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-5">
            <h2 className="text-lg font-semibold text-zinc-100 mb-4">FICO Factor Breakdown</h2>
            <div className="space-y-3">
              {factors.map(f => (
                <div key={f.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-zinc-300">{f.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500">{f.weight}%</span>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded"
                        style={{ color: f.color, backgroundColor: f.color + "15" }}
                      >
                        {f.rating}
                      </span>
                    </div>
                  </div>
                  {/* Bar */}
                  <div className="h-2 rounded-full bg-zinc-900 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${f.weight * 2}%`,
                        backgroundColor: f.color,
                        opacity: 0.8,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personalized Tips */}
          <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-5">
            <h2 className="text-lg font-semibold text-zinc-100 mb-3">Top Actions to Improve Your Score</h2>
            <div className="space-y-2">
              {tips.map((tip, i) => (
                <div key={i} className="flex gap-3 items-start text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-zinc-300">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Score Range Reference */}
          <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-5">
            <h2 className="text-lg font-semibold text-zinc-100 mb-3">Score Ranges</h2>
            <div className="space-y-1.5 text-sm">
              {[
                { range: "800 – 850", label: "Excellent", color: "#16a34a" },
                { range: "740 – 799", label: "Very Good", color: "#22c55e" },
                { range: "670 – 739", label: "Good", color: "#eab308" },
                { range: "580 – 669", label: "Fair", color: "#f97316" },
                { range: "300 – 579", label: "Poor", color: "#ef4444" },
              ].map(r => (
                <div key={r.label} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
                  <span className="text-zinc-400 w-20">{r.range}</span>
                  <span className="text-zinc-300" style={{ color: r.color }}>{r.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Insight Callout */}
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-sm text-blue-200/90">
            <div className="font-semibold text-blue-300 mb-1">Did you know?</div>
            <p>
              Payment history and credit utilization together account for <strong>65%</strong> of your FICO score.
              Focusing on just these two factors — paying on time and keeping balances low — has the largest impact
              on your credit score improvement.
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
