"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + Math.round(n).toLocaleString("en-US"); }

/* ── State median income (Apr 1, 2026+, DOJ US Trustee Program) ── */
/* Per-additional-member beyond 4: $11,100 */
const MEDIAN: Record<string, [number, number, number, number]> = {
  AL: [64321,77451,92698,106740], AK: [85817,112548,112548,142136], AZ: [73935,89027,104965,121174],
  AR: [58421,73630,82329,97054], CA: [79253,102797,116541,139071], CO: [87940,109497,130850,153501],
  CT: [84302,106224,134470,159934], DE: [69515,94877,111273,132244], DC: [85391,161397,161397,166598],
  FL: [69876,86523,97540,114761], GA: [68478,84965,101479,123481], HI: [85254,106202,123454,142181],
  ID: [73413,86160,98381,119662], IL: [73180,93934,113625,137902], IN: [64461,81986,95627,115656],
  IA: [67617,88800,104133,126058], KS: [69197,87441,103852,125971], KY: [61652,73892,85212,109443],
  LA: [59447,72348,84602,103628], ME: [75892,90445,106822,131577], MD: [86928,114611,135949,166173],
  MA: [88202,112708,139411,178524], MI: [67352,83432,103449,123010], MN: [77696,98328,126487,149882],
  MS: [53978,70328,82846,97464], MO: [64972,82075,100228,118530], MT: [71310,91452,103285,121698],
  NE: [66922,90728,103405,125074], NV: [72222,87914,101638,114110], NH: [87287,109324,141531,155203],
  NJ: [87173,106876,137136,168127], NM: [66235,79574,88041,98602], NY: [73272,92902,115579,139040],
  NC: [67117,84384,101535,116737], ND: [73549,96352,106686,137817], OH: [66239,83725,102504,123702],
  OK: [61180,77208,86845,101798], OR: [79089,93670,116729,140024], PA: [72230,87534,110151,135862],
  RI: [77653,98736,119419,137479], SC: [64808,83761,95672,116314], SD: [69190,89809,100883,130738],
  TN: [63979,82846,97511,109585], TX: [66837,86714,99273,117962], UT: [87898,95757,112751,131741],
  VT: [72461,96963,114075,137583], VA: [78491,101171,123159,144826], WA: [88585,107100,131737,156567],
  WV: [63908,68592,92050,93672], WI: [71168,90252,108516,133384], WY: [71745,91502,98476,110297],
};

const STATE_NAMES: Record<string, string> = {
  AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",CT:"Connecticut",
  DE:"Delaware",DC:"District of Columbia",FL:"Florida",GA:"Georgia",HI:"Hawaii",ID:"Idaho",IL:"Illinois",
  IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",
  MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",MT:"Montana",
  NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",NY:"New York",
  NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",
  RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",
  VT:"Vermont",VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming",
};

/* IRS National Standards — monthly (Apr 2025 - Jun 2026) */
const LIVING_EXPENSE: Record<number, number> = { 1: 839, 2: 1481, 3: 1753, 4: 2129 };
const LIVING_EXPENSE_ADDL = 394; // per person beyond 4

/* Out-of-pocket health care per person/month */
const HEALTH_UNDER65 = 84;
const HEALTH_OVER65 = 149;

/* Transportation ownership (national) */
const TRANSPORT_OWN: Record<number, number> = { 0: 244, 1: 662, 2: 1324 };
/* Transportation operating - use South Regional as default, user can override */
const TRANSPORT_OP: Record<number, number> = { 0: 0, 1: 281, 2: 562 };

/* Thresholds (eff Apr 1 2025 - Mar 31 2028) */
const THRESHOLD_LOWER = 9075;
const THRESHOLD_UPPER = 15150;
const ADDL_MEMBER = 11100;

/* Ch13 debt limits (eff Apr 1 2025 - Mar 31 2028) */
const CH13_SECURED = 1580125;
const CH13_UNSECURED = 526700;

function getMedian(state: string, size: number): number {
  const m = MEDIAN[state];
  if (!m) return 0;
  if (size <= 0) return m[0];
  if (size === 1) return m[0];
  if (size === 2) return m[1];
  if (size === 3) return m[2];
  if (size >= 4) return m[3] + (size - 4) * ADDL_MEMBER;
  return m[0];
}

function getLivingExpense(size: number): number {
  if (size <= 1) return LIVING_EXPENSE[1];
  if (size === 2) return LIVING_EXPENSE[2];
  if (size === 3) return LIVING_EXPENSE[3];
  return LIVING_EXPENSE[4] + Math.max(0, size - 4) * LIVING_EXPENSE_ADDL;
}

export default function Page() {
  const [state, setState] = useState("CA");
  const [householdSize, setHouseholdSize] = useState(3);
  const [monthlyIncome, setMonthlyIncome] = useState(5000);
  const [numCars, setNumCars] = useState(1);
  const [hasCarPayment, setHasCarPayment] = useState(true);
  const [monthlyRentMortgage, setMonthlyRentMortgage] = useState(1800);
  const [monthlyUtilities, setMonthlyUtilities] = useState(300);
  const [monthlyHealthIns, setMonthlyHealthIns] = useState(400);
  const [monthlyChildCare, setMonthlyChildCare] = useState(0);
  const [monthlyTaxes, setMonthlyTaxes] = useState(800);
  const [over65Count, setOver65Count] = useState(0);
  const [unsecuredDebt, setUnsecuredDebt] = useState(30000);
  const [securedDebt, setSecuredDebt] = useState(0);

  const result = useMemo(() => {
    const annualIncome = monthlyIncome * 12;
    const stateMedian = getMedian(state, householdSize);
    const belowMedian = annualIncome <= stateMedian;
    const steps: string[] = [];

    steps.push(`Monthly income (CMI): ${fmtC(monthlyIncome)}`);
    steps.push(`Annualized: ${fmtC(annualIncome)}`);
    steps.push(`${STATE_NAMES[state]} median for ${householdSize}-person household: ${fmtC(stateMedian)}`);

    if (belowMedian) {
      steps.push(`Income is BELOW state median → PASS (eligible for Chapter 7)`);
      return {
        passStep1: true, belowMedian: true, result: "pass" as const,
        annualIncome, stateMedian, monthlyDisposable: 0, totalDisposable: 0,
        steps, deductions: 0, ch13Plan: 3,
        ch13Eligible: securedDebt <= CH13_SECURED && unsecuredDebt <= CH13_UNSECURED,
      };
    }

    steps.push(`Income is ABOVE state median → Full means test required`);

    // Calculate deductions
    const livingExp = getLivingExpense(householdSize);
    const under65 = Math.max(0, householdSize - over65Count);
    const healthOOP = under65 * HEALTH_UNDER65 + over65Count * HEALTH_OVER65;
    const transportOwn = hasCarPayment ? (TRANSPORT_OWN[Math.min(numCars, 2)] || 0) : 0;
    const transportOp = TRANSPORT_OP[Math.min(numCars, 2)] || 0;
    const housing = monthlyRentMortgage + monthlyUtilities;

    const totalDeductions = livingExp + healthOOP + transportOwn + transportOp + housing + monthlyHealthIns + monthlyChildCare + monthlyTaxes;
    const monthlyDisposable = Math.max(0, monthlyIncome - totalDeductions);
    const totalDisposable = monthlyDisposable * 60;

    steps.push(`--- Allowed Monthly Deductions ---`);
    steps.push(`Living expenses (IRS standard): ${fmtC(livingExp)}`);
    steps.push(`Out-of-pocket health care: ${fmtC(healthOOP)} (${under65} under 65 × $${HEALTH_UNDER65} + ${over65Count} over 65 × $${HEALTH_OVER65})`);
    steps.push(`Housing & utilities: ${fmtC(housing)}`);
    steps.push(`Transportation ownership: ${fmtC(transportOwn)}`);
    steps.push(`Transportation operating: ${fmtC(transportOp)}`);
    steps.push(`Health insurance premiums: ${fmtC(monthlyHealthIns)}`);
    if (monthlyChildCare > 0) steps.push(`Child care: ${fmtC(monthlyChildCare)}`);
    steps.push(`Taxes (income, payroll): ${fmtC(monthlyTaxes)}`);
    steps.push(`Total deductions: ${fmtC(totalDeductions)}`);
    steps.push(`Monthly disposable: ${fmtC(monthlyIncome)} - ${fmtC(totalDeductions)} = ${fmtC(monthlyDisposable)}`);
    steps.push(`60-month disposable: ${fmtC(totalDisposable)}`);

    let testResult: "pass" | "fail" | "middle";
    if (totalDisposable < THRESHOLD_LOWER) {
      testResult = "pass";
      steps.push(`${fmtC(totalDisposable)} < ${fmtC(THRESHOLD_LOWER)} threshold → PASS`);
    } else if (totalDisposable > THRESHOLD_UPPER) {
      testResult = "fail";
      steps.push(`${fmtC(totalDisposable)} > ${fmtC(THRESHOLD_UPPER)} threshold → FAIL (presumption of abuse)`);
    } else {
      // Middle zone: 25% of unsecured debt test
      const pct25 = unsecuredDebt * 0.25;
      if (totalDisposable >= pct25) {
        testResult = "fail";
        steps.push(`${fmtC(totalDisposable)} is between thresholds. 25% of unsecured debt = ${fmtC(pct25)}. Disposable ≥ 25% → FAIL`);
      } else {
        testResult = "pass";
        steps.push(`${fmtC(totalDisposable)} is between thresholds. 25% of unsecured debt = ${fmtC(pct25)}. Disposable < 25% → PASS`);
      }
    }

    return {
      passStep1: false, belowMedian: false, result: testResult,
      annualIncome, stateMedian, monthlyDisposable, totalDisposable,
      steps, deductions: totalDeductions, ch13Plan: 5,
      ch13Eligible: securedDebt <= CH13_SECURED && unsecuredDebt <= CH13_UNSECURED,
    };
  }, [state, householdSize, monthlyIncome, numCars, hasCarPayment, monthlyRentMortgage, monthlyUtilities, monthlyHealthIns, monthlyChildCare, monthlyTaxes, over65Count, unsecuredDebt, securedDebt]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 text-sm";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const cardCls = "bg-zinc-900 border border-zinc-800 rounded-xl p-4";

  const resultColor = result.result === "pass" ? "text-green-400" : result.result === "fail" ? "text-red-400" : "text-yellow-400";
  const resultBg = result.result === "pass" ? "bg-green-500/10 border-green-500/30" : result.result === "fail" ? "bg-red-500/10 border-red-500/30" : "bg-yellow-500/10 border-yellow-500/30";

  return (
    <ToolLayout
      title="Bankruptcy Means Test Calculator"
      description="Take the Chapter 7 bankruptcy means test. Compare your income to your state's median, calculate disposable income with IRS-standard deductions, and determine if you qualify for Chapter 7 or need to file Chapter 13."
      slug="bankruptcy-means-test"
      category="Legal"
      keywords={["bankruptcy means test", "chapter 7 means test", "bankruptcy calculator", "chapter 7 eligibility", "means test calculator", "bankruptcy income test", "chapter 7 vs chapter 13"]}
      faqs={[
        { question: "What is the bankruptcy means test?", answer: "The means test determines whether you qualify for Chapter 7 bankruptcy (debt discharge) or must file Chapter 13 (repayment plan). It compares your income to your state's median for your household size. If you're below the median, you pass automatically. If above, a detailed calculation using IRS-standard deductions determines your disposable income." },
        { question: "What income counts for the means test?", answer: "The means test uses your 'Current Monthly Income' (CMI) — the average of ALL income sources over the 6 calendar months before filing. This includes wages, commissions, bonuses, self-employment income, rental income, pensions, unemployment, and alimony received. Social Security benefits are excluded." },
        { question: "What if I fail the means test?", answer: "If you fail, there is a 'presumption of abuse' for Chapter 7. You can still file Chapter 13 (3-5 year repayment plan), or you may be able to rebut the presumption by showing special circumstances (serious medical condition, active military duty, etc.). A bankruptcy attorney can help determine your options." },
        { question: "How often do median income figures change?", answer: "The DOJ US Trustee Program updates state median income figures approximately every 6 months based on Census Bureau data. This calculator uses the most recent figures effective April 1, 2026. The disposable income thresholds ($9,075/$15,150) are adjusted every 3 years — current thresholds are effective April 1, 2025 through March 31, 2028." },
        { question: "What's the difference between Chapter 7 and Chapter 13?", answer: "Chapter 7 discharges most unsecured debts (credit cards, medical bills) within 3-4 months but may require liquidating non-exempt assets. Chapter 13 creates a 3-5 year repayment plan based on your disposable income — you keep your assets but must make monthly payments. Chapter 7 requires passing the means test; Chapter 13 has debt limits ($526,700 unsecured / $1,580,125 secured as of April 2025)." },
        { question: "What deductions are allowed?", answer: "The means test allows IRS standard deductions for living expenses (food, clothing, personal care), out-of-pocket health care ($84/month under 65, $149/month 65+), transportation (ownership and operating costs), plus actual expenses for housing, utilities, taxes, health insurance, child care, and court-ordered payments. These deductions reduce your disposable income." },
        { question: "Does Social Security count as income?", answer: "No. Social Security benefits (retirement, disability, SSI) are specifically excluded from the means test income calculation under 11 U.S.C. § 101(10A). This is one of the most important exclusions — if your only income is Social Security, you automatically pass the means test." },
        { question: "Can I file Chapter 7 if I fail the means test?", answer: "Possibly. Failing creates a 'presumption of abuse' that can be rebutted. Special circumstances that may overcome the presumption include: serious medical conditions, active military duty, or other documented events beyond your control that reduce income or increase expenses. The court ultimately decides. Additionally, if your debts are primarily business debts (not consumer debts), the means test does not apply at all." },
      ]}
      relatedTools={[
        { name: "Debt Payoff Calculator", href: "/tools/debt-payoff-calculator" },
        { name: "Debt-to-Income Calculator", href: "/tools/debt-to-income-calculator" },
        { name: "Budget Calculator", href: "/tools/budget-calculator" },
        { name: "Credit Card Payoff Calculator", href: "/tools/credit-card-payoff-calculator" },
      ]}
    >
      {/* Disclaimer */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
        <p className="text-sm text-yellow-400 font-medium mb-1">Important Disclaimer</p>
        <p className="text-sm text-zinc-400">
          This is a simplified means test estimate. The actual means test (Form 122A) has additional line items and requires exact 6-month income history. Consult a bankruptcy attorney before filing.
        </p>
      </div>

      {/* Step 1: Basic info */}
      <h3 className="text-sm font-semibold text-zinc-300 mb-3">Step 1: Income vs. State Median</h3>
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className={labelCls}>State</label>
          <select value={state} onChange={e => setState(e.target.value)} className={inputCls}>
            {Object.entries(STATE_NAMES)
              .sort((a, b) => a[1].localeCompare(b[1]))
              .map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Household Size</label>
          <input type="number" value={householdSize} onChange={e => setHouseholdSize(Math.max(1, +e.target.value))} className={inputCls} min={1} max={15} step={1} />
        </div>
        <div>
          <label className={labelCls}>Avg Monthly Income (CMI) ($)</label>
          <input type="number" value={monthlyIncome} onChange={e => setMonthlyIncome(Math.max(0, +e.target.value))} className={inputCls} min={0} step={100} />
          <p className="text-xs text-zinc-500 mt-1">6-month average. Excludes Social Security.</p>
        </div>
      </div>

      {/* Median comparison */}
      <div className={`${cardCls} mb-6`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-400">Your Annual Income</span>
          <span className="text-lg font-bold text-zinc-100">{fmtC(result.annualIncome)}</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-400">{STATE_NAMES[state]} Median ({householdSize}-person)</span>
          <span className="text-lg font-bold text-zinc-100">{fmtC(result.stateMedian)}</span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-3 mb-2">
          <div
            className={`h-3 rounded-full transition-all ${result.belowMedian ? "bg-green-500" : "bg-red-500"}`}
            style={{ width: `${Math.min(100, (result.annualIncome / result.stateMedian) * 100)}%` }}
          />
        </div>
        <p className={`text-sm font-medium ${result.belowMedian ? "text-green-400" : "text-yellow-400"}`}>
          {result.belowMedian
            ? "Below median — you PASS the means test (eligible for Chapter 7)"
            : `Above median by ${fmtC(result.annualIncome - result.stateMedian)} — full means test required`}
        </p>
      </div>

      {/* Step 2: Full means test (only if above median) */}
      {!result.belowMedian && (
        <>
          <h3 className="text-sm font-semibold text-zinc-300 mb-3">Step 2: Disposable Income Calculation</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelCls}>Monthly Rent/Mortgage ($)</label>
              <input type="number" value={monthlyRentMortgage} onChange={e => setMonthlyRentMortgage(Math.max(0, +e.target.value))} className={inputCls} min={0} step={50} />
            </div>
            <div>
              <label className={labelCls}>Monthly Utilities ($)</label>
              <input type="number" value={monthlyUtilities} onChange={e => setMonthlyUtilities(Math.max(0, +e.target.value))} className={inputCls} min={0} step={25} />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className={labelCls}>Vehicles Owned</label>
              <select value={numCars} onChange={e => setNumCars(+e.target.value)} className={inputCls}>
                <option value={0}>None (public transit)</option>
                <option value={1}>1 vehicle</option>
                <option value={2}>2 vehicles</option>
              </select>
            </div>
            {numCars > 0 && (
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer pb-2">
                  <input type="checkbox" checked={hasCarPayment} onChange={e => setHasCarPayment(e.target.checked)} className="accent-blue-500" />
                  Has car payment/lease
                </label>
              </div>
            )}
            <div>
              <label className={labelCls}>Household Members 65+</label>
              <input type="number" value={over65Count} onChange={e => setOver65Count(Math.max(0, Math.min(householdSize, +e.target.value)))} className={inputCls} min={0} max={householdSize} step={1} />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className={labelCls}>Monthly Health Insurance ($)</label>
              <input type="number" value={monthlyHealthIns} onChange={e => setMonthlyHealthIns(Math.max(0, +e.target.value))} className={inputCls} min={0} step={25} />
            </div>
            <div>
              <label className={labelCls}>Monthly Child Care ($)</label>
              <input type="number" value={monthlyChildCare} onChange={e => setMonthlyChildCare(Math.max(0, +e.target.value))} className={inputCls} min={0} step={50} />
            </div>
            <div>
              <label className={labelCls}>Monthly Taxes (income + payroll) ($)</label>
              <input type="number" value={monthlyTaxes} onChange={e => setMonthlyTaxes(Math.max(0, +e.target.value))} className={inputCls} min={0} step={50} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className={labelCls}>Total Unsecured Debt ($)</label>
              <input type="number" value={unsecuredDebt} onChange={e => setUnsecuredDebt(Math.max(0, +e.target.value))} className={inputCls} min={0} step={1000} />
              <p className="text-xs text-zinc-500 mt-1">Credit cards, medical bills, personal loans</p>
            </div>
            <div>
              <label className={labelCls}>Total Secured Debt ($)</label>
              <input type="number" value={securedDebt} onChange={e => setSecuredDebt(Math.max(0, +e.target.value))} className={inputCls} min={0} step={1000} />
              <p className="text-xs text-zinc-500 mt-1">Mortgage, auto loan (for Chapter 13 eligibility)</p>
            </div>
          </div>
        </>
      )}

      {/* Result */}
      <div className={`rounded-xl border p-5 text-center mb-6 ${resultBg}`}>
        <p className="text-sm text-zinc-400 mb-2">Means Test Result</p>
        <p className={`text-4xl font-bold mb-2 ${resultColor}`}>
          {result.result === "pass" ? "PASS — Chapter 7 Eligible" : result.result === "fail" ? "FAIL — Presumption of Abuse" : "BORDERLINE"}
        </p>
        {result.result === "pass" ? (
          <p className="text-sm text-zinc-300">
            {result.belowMedian
              ? `Your income (${fmtC(result.annualIncome)}) is below the ${STATE_NAMES[state]} median (${fmtC(result.stateMedian)}). You qualify for Chapter 7.`
              : `Your 60-month disposable income (${fmtC(result.totalDisposable)}) is below the ${fmtC(THRESHOLD_LOWER)} threshold. No presumption of abuse.`}
          </p>
        ) : (
          <p className="text-sm text-zinc-300">
            Your 60-month disposable income ({fmtC(result.totalDisposable)}) exceeds the {fmtC(THRESHOLD_UPPER)} threshold. You may need to file Chapter 13 instead, or demonstrate special circumstances.
          </p>
        )}
      </div>

      {/* Chapter 13 alternative */}
      <div className={`${cardCls} mb-6`}>
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Chapter 13 Alternative</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <p className="text-xs text-zinc-500">Plan Length</p>
            <p className="text-lg font-bold text-zinc-100">{result.ch13Plan} years</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Monthly Payment</p>
            <p className="text-lg font-bold text-zinc-100">{fmtC(result.monthlyDisposable)}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Ch13 Eligible</p>
            <p className={`text-lg font-bold ${result.ch13Eligible ? "text-green-400" : "text-red-400"}`}>
              {result.ch13Eligible ? "Yes" : "No"}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Debt Limits (Ch13)</p>
            <p className="text-xs text-zinc-400 mt-1">Secured: {fmtC(CH13_SECURED)}<br />Unsecured: {fmtC(CH13_UNSECURED)}</p>
          </div>
        </div>
        {!result.ch13Eligible && (
          <p className="text-xs text-red-400 mt-2">Your debt exceeds Chapter 13 limits. You may need to explore Chapter 11 or other options.</p>
        )}
      </div>

      {/* Calculation breakdown */}
      <div className={`${cardCls} mb-6`}>
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Calculation Breakdown</h3>
        <div className="space-y-1.5">
          {result.steps.map((step, i) => (
            <div key={i} className={`flex items-start gap-2 text-sm ${step.startsWith("---") ? "pt-2 mt-2 border-t border-zinc-800" : ""}`}>
              {!step.startsWith("---") && <span className="text-zinc-600 shrink-0">{i + 1}.</span>}
              <span className="text-zinc-400">{step.startsWith("---") ? step.replace(/---/g, "").trim() : step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data source */}
      <div className={`${cardCls} mb-6`}>
        <h3 className="text-sm font-semibold text-zinc-200 mb-2">Data Sources</h3>
        <ul className="text-xs text-zinc-500 space-y-1">
          <li>Median income: DOJ US Trustee Program (effective April 1, 2026)</li>
          <li>Living expense standards: IRS National Standards (effective April 21, 2025)</li>
          <li>Transportation standards: IRS Local Standards (effective April 21, 2025)</li>
          <li>Thresholds: $9,075 / $15,150 (effective April 1, 2025 through March 31, 2028)</li>
          <li>Chapter 13 debt limits: effective April 1, 2025 through March 31, 2028</li>
        </ul>
      </div>

      {/* Bottom disclaimer */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 text-center">
        <p className="text-xs text-zinc-500 leading-relaxed">
          This is a simplified estimate of the Chapter 7 means test. The actual means test (Official Form 122A-1 and 122A-2)
          includes additional deductions and line items not covered here, including secured debt payments, priority debt payments,
          and county-specific housing allowances. Housing deductions in this calculator use your actual amounts rather than
          IRS local standards by county. Always consult a bankruptcy attorney for an accurate assessment.
        </p>
      </div>
    </ToolLayout>
  );
}
