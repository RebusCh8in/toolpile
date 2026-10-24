"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";


/* ── helpers ── */
function fmtC(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
function fmtPct(n: number) {
  return n.toFixed(1) + "%";
}

const PROGRAM_START_YEAR = 2026;
const SEED_AMOUNT = 1000;
const MAX_TOTAL_CONTRIBUTION = 5000;
const MAX_EMPLOYER_CONTRIBUTION = 2500;
const GROWTH_PERIOD_FEE = 0.001; // 0.10% expense ratio during growth period
const IRA_PERIOD_FEE = 0.005; // 0.50% after conversion to IRA

export default function Page() {
  const [birthYear, setBirthYear] = useState(2025);
  const [annualContribution, setAnnualContribution] = useState(5000);
  const [annualReturn, setAnnualReturn] = useState(8);
  const [includeSeed, setIncludeSeed] = useState(true);
  const [employerContribution, setEmployerContribution] = useState(0);
  const [withdrawalAge, setWithdrawalAge] = useState(65);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const seedEligible = birthYear >= 2025 && birthYear <= 2028;

  // Cap personal + employer at $5,000
  const effectiveEmployer = Math.min(employerContribution, MAX_EMPLOYER_CONTRIBUTION);
  const effectivePersonal = Math.min(annualContribution, MAX_TOTAL_CONTRIBUTION - effectiveEmployer);
  const totalAnnualContribution = effectivePersonal + effectiveEmployer;

  const result = useMemo(() => {
    // Contribution start: July 4, 2026 or child's birth year, whichever is later
    const contributionStartYear = Math.max(PROGRAM_START_YEAR, birthYear);
    // Growth period ends at end of year child turns 17
    const growthEndYear = birthYear + 17;
    // Contribution years: from contributionStartYear through growthEndYear
    const contributionYears = Math.max(0, growthEndYear - contributionStartYear + 1);

    const seedDeposit = seedEligible && includeSeed ? SEED_AMOUNT : 0;

    // Year-by-year simulation
    const yearlyData: { age: number; year: number; balance: number; phase: string }[] = [];
    let balance = 0;
    let totalPersonalContributions = 0;
    let totalEmployerContributions = 0;

    // Seed deposited at birth / program start
    balance += seedDeposit;

    const endAge = withdrawalAge;
    const totalYears = endAge; // simulate from birth to withdrawal age

    for (let age = 0; age <= totalYears; age++) {
      const year = birthYear + age;

      if (age <= 17) {
        // Growth period
        // Add contributions if within contribution window
        if (year >= contributionStartYear && year <= growthEndYear) {
          balance += effectivePersonal;
          balance += effectiveEmployer;
          totalPersonalContributions += effectivePersonal;
          totalEmployerContributions += effectiveEmployer;
        }
        // Apply return minus expense ratio
        const netReturn = (annualReturn / 100) - GROWTH_PERIOD_FEE;
        balance *= (1 + netReturn);
      } else {
        // IRA period - no contributions, continued growth
        const netReturn = (annualReturn / 100) - IRA_PERIOD_FEE;
        balance *= (1 + netReturn);
      }

      yearlyData.push({
        age,
        year,
        balance,
        phase: age <= 17 ? "Growth Period" : "IRA Period",
      });
    }

    const balanceAt18 = yearlyData.find(d => d.age === 18)?.balance ?? 0;
    const balanceAtWithdrawal = yearlyData[yearlyData.length - 1]?.balance ?? 0;

    // Tax basis = only personal after-tax contributions
    const taxBasis = totalPersonalContributions;
    const taxableAmount = Math.max(0, balanceAtWithdrawal - taxBasis);

    return {
      contributionYears,
      contributionStartYear,
      growthEndYear,
      seedDeposit,
      totalPersonalContributions,
      totalEmployerContributions,
      totalContributions: totalPersonalContributions + totalEmployerContributions,
      totalInvested: totalPersonalContributions + totalEmployerContributions + seedDeposit,
      balanceAt18,
      balanceAtWithdrawal,
      taxBasis,
      taxableAmount,
      yearlyData,
    };
  }, [birthYear, effectivePersonal, effectiveEmployer, annualReturn, seedEligible, includeSeed, withdrawalAge]);

  /* ── Growth chart ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || result.yearlyData.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth;
    const H = 300;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.height = H + "px";
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const data = result.yearlyData;
    const maxVal = Math.max(...data.map(d => d.balance), 1);
    const padL = 70;
    const padR = 20;
    const padT = 30;
    const padB = 50;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;

    // Background phases
    const growthEndIdx = data.findIndex(d => d.age === 18);
    if (growthEndIdx > 0) {
      const x18 = padL + (growthEndIdx / (data.length - 1)) * chartW;
      // Growth period background
      ctx.fillStyle = "rgba(59, 130, 246, 0.06)";
      ctx.fillRect(padL, padT, x18 - padL, chartH);
      // IRA period background
      ctx.fillStyle = "rgba(168, 85, 247, 0.06)";
      ctx.fillRect(x18, padT, padL + chartW - x18, chartH);

      // Phase labels
      ctx.font = "11px system-ui";
      ctx.textAlign = "center";
      ctx.fillStyle = "#3b82f6";
      ctx.fillText("Growth Period (0-17)", padL + (x18 - padL) / 2, padT + 16);
      ctx.fillStyle = "#a855f7";
      ctx.fillText("IRA Period (18+)", x18 + (padL + chartW - x18) / 2, padT + 16);

      // Divider line
      ctx.strokeStyle = "rgba(161, 161, 170, 0.2)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x18, padT);
      ctx.lineTo(x18, padT + chartH);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Grid lines
    ctx.strokeStyle = "rgba(161, 161, 170, 0.1)";
    ctx.lineWidth = 1;
    const gridLines = 5;
    ctx.font = "11px system-ui";
    ctx.textAlign = "right";
    ctx.fillStyle = "#71717a";
    for (let i = 0; i <= gridLines; i++) {
      const y = padT + (chartH / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + chartW, y);
      ctx.stroke();
      const val = maxVal * (1 - i / gridLines);
      ctx.fillText(val >= 1000000 ? "$" + (val / 1000000).toFixed(1) + "M" : val >= 1000 ? "$" + (val / 1000).toFixed(0) + "K" : "$" + val.toFixed(0), padL - 8, y + 4);
    }

    // X-axis labels
    ctx.textAlign = "center";
    ctx.fillStyle = "#71717a";
    const step = Math.max(1, Math.floor(data.length / 8));
    for (let i = 0; i < data.length; i += step) {
      const x = padL + (i / (data.length - 1)) * chartW;
      ctx.fillText("Age " + data[i].age, x, H - padB + 20);
    }
    // Always show last
    const lastX = padL + chartW;
    ctx.fillText("Age " + data[data.length - 1].age, lastX, H - padB + 20);

    // Line chart
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = padL + (i / (data.length - 1)) * chartW;
      const y = padT + chartH - (data[i].balance / maxVal) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Gradient fill under line
    const grad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
    grad.addColorStop(0, "rgba(59, 130, 246, 0.25)");
    grad.addColorStop(1, "rgba(59, 130, 246, 0.02)");
    ctx.lineTo(padL + chartW, padT + chartH);
    ctx.lineTo(padL, padT + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Endpoint dot
    const lastD = data[data.length - 1];
    const lx = padL + chartW;
    const ly = padT + chartH - (lastD.balance / maxVal) * chartH;
    ctx.beginPath();
    ctx.arc(lx, ly, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#3b82f6";
    ctx.fill();
    ctx.strokeStyle = "#1e3a5f";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [result.yearlyData]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 text-sm";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const cardCls = "bg-zinc-900 border border-zinc-800 rounded-xl p-4";

  return (
    <ToolLayout
      title="Trump Account Calculator (IRC 530A)"
      description="Calculate how much a Trump Account (MAGA Account) could grow for your child. See projected value from the $1,000 government seed deposit and $5,000 annual contributions with tax basis tracking."
      slug="trump-account-calculator"
      category="Financial"
      keywords={[
        "trump account calculator",
        "maga account calculator",
        "530a calculator",
        "trump account growth",
        "trump account for kids",
        "money account for growth and advancement",
      ]}
      faqs={[
        {
          question: "What is a Trump Account?",
          answer: "A Trump Account, officially called a Money Account for Growth and Advancement (MAGA Account) under IRC Section 530A, is a tax-advantaged savings account for children. It was created by the One Big Beautiful Bill and provides a $1,000 government seed deposit for children born 2025-2028, allows up to $5,000 in annual contributions, and invests in low-cost US equity index funds until the child turns 18, when it begins following traditional IRA rules.",
        },
        {
          question: "Who is eligible for a Trump Account?",
          answer: "All US citizen children are eligible for a Trump Account. The $1,000 government seed deposit is specifically available for children born between January 1, 2025 and December 31, 2028. Children born outside this window can still have an account opened for them with personal and employer contributions, but won't receive the government seed money.",
        },
        {
          question: "When can I open a Trump Account?",
          answer: "Trump Accounts are expected to become available starting July 4, 2026 (Independence Day). Contributions can begin on that date. For children born before July 4, 2026, the account can be opened on that date. For children born after, it can be opened at birth. The government seed deposit for eligible children (born 2025-2028) will be deposited when the account is opened.",
        },
        {
          question: "How much can I contribute to a Trump Account?",
          answer: "The total annual contribution limit is $5,000 per child, which includes both personal and employer contributions combined. Employers can contribute up to $2,500 per year per employee (not per child — the $2,500 cap applies across all of an employee's children). Any employer contribution reduces the amount you can contribute personally. The $1,000 government seed deposit does NOT count against this $5,000 limit. Additionally, qualified general contributions from state/local governments and 501(c)(3) organizations do not count against the limit.",
        },
        {
          question: "Is the $1,000 government deposit guaranteed?",
          answer: "The $1,000 government seed deposit is authorized by legislation for children born 2025-2028. It is a one-time deposit that does not count against the $5,000 annual contribution limit. However, like any government program, future legislation could modify or repeal it. The deposit does not create tax basis — it will be taxable upon withdrawal, similar to traditional IRA distributions.",
        },
        {
          question: "What can I invest in with a Trump Account?",
          answer: "During the growth period (birth through age 17), Trump Account funds must be invested in US equity index funds with a maximum expense ratio of 0.10%. This ensures low-cost, diversified investing. After age 18, the account follows standard traditional IRA rules and standard IRA investment options become available, though fees may be higher.",
        },
        {
          question: "When can I withdraw the money?",
          answer: "At age 18, the Trump Account begins following traditional IRA rules. Withdrawals before age 59-1/2 are subject to a 10% early withdrawal penalty plus income taxes, with exceptions for qualified education expenses, first-time home purchases (up to $10,000), disability, and other standard IRA exceptions. After age 59-1/2, withdrawals are subject to regular income tax but no penalty.",
        },
        {
          question: "Are withdrawals taxable?",
          answer: "Only your personal after-tax contributions create tax basis and can be withdrawn tax-free. Everything else — the government seed deposit, employer contributions, and all investment earnings — is taxable as ordinary income upon withdrawal. This is similar to a traditional IRA. Early withdrawals (before 59-1/2) also face a 10% penalty unless they qualify for an exception.",
        },
        {
          question: "How does a Trump Account compare to a 529 plan?",
          answer: "Key differences: Trump Accounts have a $5,000 annual limit (vs ~$18,000 for 529s), include a $1,000 government seed, cap investment fees at 0.10%, and can be used for any purpose after age 18. 529 plans offer tax-free growth for education expenses but impose penalties for non-education withdrawals. Trump Accounts don't require earned income (unlike Roth IRAs) and have no income limits.",
        },
        {
          question: "Can grandparents or other family members contribute?",
          answer: "Yes, anyone can contribute to a child's Trump Account, including grandparents, aunts, uncles, and family friends. All contributions from any source count toward the $5,000 annual limit (combined with employer contributions). Gift tax rules may apply for large contributions, but the $5,000 maximum is well below the annual gift tax exclusion.",
        },
      ]}
      relatedTools={[
        { name: "Compound Interest Calculator", href: "/tools/compound-interest-calculator" },
        { name: "Investment Calculator", href: "/tools/investment-calculator" },
        { name: "401k Calculator", href: "/tools/401k-calculator" },
        { name: "Savings Calculator", href: "/tools/savings-calculator" },
      ]}
      guide={
        <>
          <h2>How to Use This Trump Account Calculator</h2>
          <h3>Step 1: Enter Your Child&apos;s Birth Year</h3>
          <p>
            Select the year your child was born (or will be born). This determines whether they qualify for the $1,000 government seed deposit (available for children born 2025-2028) and how many years of contributions are possible before the account converts to an IRA at age 18.
          </p>

          <h3>Step 2: Set Your Contribution Amount</h3>
          <p>
            Choose how much you plan to contribute annually, up to $5,000. If your employer also contributes, enter that amount separately — the combined total cannot exceed $5,000. The calculator automatically enforces this cap. Contributing the maximum $5,000 per year produces the best results due to compound growth.
          </p>

          <h3>Step 3: Choose Your Expected Return</h3>
          <p>
            The default 8% reflects the historical average annual return of the S&P 500 (roughly 10% nominal minus 2% inflation adjustment). During the growth period, the calculator deducts the 0.10% maximum expense ratio mandated for Trump Account index funds. After conversion to IRA, a 0.50% fee is deducted to reflect typical IRA costs.
          </p>

          <h3>Step 4: Review Your Projections</h3>
          <p>
            The calculator shows your projected balance at age 18 (when the account converts to an IRA), at your chosen withdrawal age, and a breakdown of tax basis vs. taxable amounts. The growth chart visualizes the two phases: the contribution-active growth period and the post-18 IRA period.
          </p>

          <h2>Key Facts About Trump Accounts (Section 530A)</h2>
          <ul>
            <li><strong>Official name:</strong> Money Account for Growth and Advancement (MAGA Account), established under IRC Section 530A as part of the One Big Beautiful Bill.</li>
            <li><strong>Government seed:</strong> $1,000 one-time deposit for children born 2025-2028. Does not count against the contribution limit. Does not create tax basis.</li>
            <li><strong>Annual contribution limit:</strong> $5,000 combined from personal and employer sources. Employer max is $2,500.</li>
            <li><strong>Investment restrictions:</strong> US equity index funds only during growth period, with maximum 0.10% expense ratio.</li>
            <li><strong>Growth period:</strong> Birth through end of the year the child turns 17. Contributions are allowed starting July 4, 2026.</li>
            <li><strong>After age 18:</strong> The account follows standard traditional IRA rules with expanded investment options, though it retains its Trump Account designation for tax basis purposes.</li>
            <li><strong>No income limits:</strong> Unlike Roth IRAs, there are no income restrictions on who can contribute.</li>
            <li><strong>No earned income requirement:</strong> Unlike Roth IRAs, contributions don&apos;t require the child to have earned income.</li>
          </ul>

          <h2>Important Caveats</h2>
          <ul>
            <li>This calculator provides estimates based on assumed rates of return. Actual investment performance will vary and could be significantly higher or lower.</li>
            <li>The calculator assumes consistent annual contributions and returns, which is unlikely in practice. Markets fluctuate, and contributions may vary year to year.</li>
            <li>Tax rules and contribution limits may change through future legislation.</li>
            <li>The 10% early withdrawal penalty applies to distributions before age 59-1/2, except for qualified education expenses and first-time home purchases (up to $10,000).</li>
            <li>Required Minimum Distributions (RMDs) will apply to the traditional IRA, typically starting at age 73 under current law.</li>
          </ul>
        </>
      }
    >
      {/* ── Inputs ── */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelCls}>Child&apos;s Birth Year</label>
          <select value={birthYear} onChange={e => setBirthYear(+e.target.value)} className={inputCls}>
            {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          {seedEligible && (
            <p className="text-xs text-green-400 mt-1">Eligible for $1,000 government seed deposit</p>
          )}
          {!seedEligible && (
            <p className="text-xs text-zinc-500 mt-1">Born outside 2025-2028 window — no government seed</p>
          )}
        </div>

        <div>
          <label className={labelCls}>
            Include Government Seed ($1,000)
          </label>
          <label className="flex items-center gap-3 mt-2">
            <input
              type="checkbox"
              checked={includeSeed && seedEligible}
              disabled={!seedEligible}
              onChange={e => setIncludeSeed(e.target.checked)}
              className="w-4 h-4 rounded bg-zinc-800 border-zinc-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-zinc-900"
            />
            <span className={`text-sm ${seedEligible ? "text-zinc-200" : "text-zinc-600"}`}>
              {seedEligible ? "Include $1,000 seed deposit" : "Not eligible (birth year must be 2025-2028)"}
            </span>
          </label>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelCls}>
            Annual Personal Contribution: {fmtC(effectivePersonal)}
            {effectivePersonal < annualContribution && (
              <span className="text-yellow-500 text-xs ml-1">(capped due to employer contribution)</span>
            )}
          </label>
          <input
            type="range"
            min={0}
            max={5000}
            step={100}
            value={annualContribution}
            onChange={e => setAnnualContribution(+e.target.value)}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-zinc-500 mt-1">
            <span>$0</span>
            <span>$5,000</span>
          </div>
        </div>

        <div>
          <label className={labelCls}>
            Employer Annual Contribution: {fmtC(effectiveEmployer)}
          </label>
          <input
            type="range"
            min={0}
            max={2500}
            step={100}
            value={employerContribution}
            onChange={e => setEmployerContribution(+e.target.value)}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-zinc-500 mt-1">
            <span>$0</span>
            <span>$2,500</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelCls}>
            Expected Annual Return: {fmtPct(annualReturn)}
          </label>
          <input
            type="range"
            min={4}
            max={12}
            step={0.5}
            value={annualReturn}
            onChange={e => setAnnualReturn(+e.target.value)}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-zinc-500 mt-1">
            <span>4%</span>
            <span>8% (S&amp;P avg)</span>
            <span>12%</span>
          </div>
        </div>

        <div>
          <label className={labelCls}>
            Withdrawal Age: {withdrawalAge}
          </label>
          <input
            type="range"
            min={18}
            max={70}
            step={1}
            value={withdrawalAge}
            onChange={e => setWithdrawalAge(+e.target.value)}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-zinc-500 mt-1">
            <span>18</span>
            <span>59.5 (penalty-free)</span>
            <span>70</span>
          </div>
        </div>
      </div>

      {/* ── Contribution Info ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div>
            <span className="text-zinc-500">Contributions start:</span>{" "}
            <span className="text-zinc-200 font-medium">{result.contributionStartYear}</span>
          </div>
          <div>
            <span className="text-zinc-500">Contributions end:</span>{" "}
            <span className="text-zinc-200 font-medium">{result.growthEndYear}</span>
          </div>
          <div>
            <span className="text-zinc-500">Years of contributions:</span>{" "}
            <span className="text-zinc-200 font-medium">{result.contributionYears}</span>
          </div>
          <div>
            <span className="text-zinc-500">Total annual:</span>{" "}
            <span className="text-zinc-200 font-medium">{fmtC(totalAnnualContribution)}/yr</span>
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Contributions", value: fmtC(result.totalContributions), sub: `Personal + Employer over ${result.contributionYears} yrs` },
          { label: "Government Seed", value: fmtC(result.seedDeposit), sub: seedEligible ? "One-time deposit" : "Not eligible" },
          { label: "Total Invested", value: fmtC(result.totalInvested), sub: "Contributions + Seed" },
          { label: "Value at Age 18", value: fmtC(result.balanceAt18), sub: "When account converts to IRA" },
        ].map(c => (
          <div key={c.label} className={cardCls + " text-center"}>
            <div className="text-xs text-zinc-500 mb-1">{c.label}</div>
            <div className="text-xl font-bold text-zinc-100">{c.value}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className={cardCls + " text-center"}>
          <div className="text-xs text-zinc-500 mb-1">Projected Value at Age {withdrawalAge}</div>
          <div className="text-2xl font-bold text-blue-400">{fmtC(result.balanceAtWithdrawal)}</div>
          <div className="text-xs text-zinc-500 mt-0.5">Assuming {fmtPct(annualReturn)} annual return</div>
        </div>
        <div className={cardCls + " text-center"}>
          <div className="text-xs text-zinc-500 mb-1">Tax Basis (Withdraw Tax-Free)</div>
          <div className="text-xl font-bold text-green-400">{fmtC(result.taxBasis)}</div>
          <div className="text-xs text-zinc-500 mt-0.5">Personal after-tax contributions only</div>
        </div>
        <div className={cardCls + " text-center"}>
          <div className="text-xs text-zinc-500 mb-1">Taxable Amount at Withdrawal</div>
          <div className="text-xl font-bold text-yellow-400">{fmtC(result.taxableAmount)}</div>
          <div className="text-xs text-zinc-500 mt-0.5">Seed + employer + earnings</div>
        </div>
      </div>

      {/* ── Penalty Note ── */}
      {withdrawalAge < 59.5 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
          <p className="text-sm text-yellow-300 font-medium mb-1">Early Withdrawal Penalty</p>
          <p className="text-sm text-yellow-200/80">
            Withdrawals before age 59-1/2 are subject to a <strong>10% early withdrawal penalty</strong> on the taxable amount ({fmtC(Math.round(result.taxableAmount * 0.1))} penalty on {fmtC(result.taxableAmount)}), plus ordinary income tax. Exceptions exist for qualified education expenses and first-time home purchases (up to $10,000).
          </p>
        </div>
      )}

      {/* ── Growth Chart ── */}
      <div className={cardCls + " mb-6"}>
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Growth Over Time</h3>
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ height: 300 }}
        />
      </div>

      {/* ── Comparison Table ── */}
      <div className={cardCls + " mb-6"}>
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Trump Account vs 529 Plan vs Roth IRA</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs">
                <th className="text-left px-4 py-2 font-medium">Feature</th>
                <th className="text-center px-4 py-2 font-medium">Trump Account (530A)</th>
                <th className="text-center px-4 py-2 font-medium">529 Plan</th>
                <th className="text-center px-4 py-2 font-medium">Roth IRA</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "Annual Contribution Limit", trump: "$5,000", plan529: "~$18,000", roth: "$7,000" },
                { feature: "Income Limits", trump: "None", plan529: "None", roth: "Yes" },
                { feature: "Tax on Growth", trump: "Tax-deferred", plan529: "Tax-free (education)", roth: "Tax-free" },
                { feature: "Government Seed", trump: "$1,000", plan529: "No", roth: "No" },
                { feature: "Fee Cap", trump: "0.10%", plan529: "No", roth: "No" },
                { feature: "Use Restrictions", trump: "Any (after 18)", plan529: "Education", roth: "Any" },
                { feature: "Earned Income Required", trump: "No", plan529: "No", roth: "Yes" },
              ].map(row => (
                <tr key={row.feature} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="px-4 py-2 text-zinc-300 font-medium">{row.feature}</td>
                  <td className="px-4 py-2 text-center text-blue-400">{row.trump}</td>
                  <td className="px-4 py-2 text-center text-zinc-400">{row.plan529}</td>
                  <td className="px-4 py-2 text-center text-zinc-400">{row.roth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Detailed Breakdown ── */}
      <div className={cardCls}>
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Contribution Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-zinc-500 text-xs mb-1">Personal Contributions</div>
            <div className="text-zinc-200 font-medium">{fmtC(result.totalPersonalContributions)}</div>
            <div className="text-xs text-green-400">Creates tax basis</div>
          </div>
          <div>
            <div className="text-zinc-500 text-xs mb-1">Employer Contributions</div>
            <div className="text-zinc-200 font-medium">{fmtC(result.totalEmployerContributions)}</div>
            <div className="text-xs text-yellow-400">Taxable on withdrawal</div>
          </div>
          <div>
            <div className="text-zinc-500 text-xs mb-1">Government Seed</div>
            <div className="text-zinc-200 font-medium">{fmtC(result.seedDeposit)}</div>
            <div className="text-xs text-yellow-400">{seedEligible ? "Taxable on withdrawal" : "Not eligible"}</div>
          </div>
          <div>
            <div className="text-zinc-500 text-xs mb-1">Investment Growth</div>
            <div className="text-zinc-200 font-medium">{fmtC(Math.max(0, result.balanceAtWithdrawal - result.totalInvested))}</div>
            <div className="text-xs text-yellow-400">Taxable on withdrawal</div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
