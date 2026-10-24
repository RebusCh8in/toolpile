"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

type Method = "straight-line" | "double-declining" | "sum-of-years" | "units-of-production";

interface ScheduleRow {
  year: number;
  beginningValue: number;
  depreciation: number;
  accumulated: number;
  endingValue: number;
}

function calcStraightLine(cost: number, salvage: number, life: number): ScheduleRow[] {
  const annual = life > 0 ? (cost - salvage) / life : 0;
  const rows: ScheduleRow[] = [];
  let bv = cost;
  let acc = 0;
  for (let y = 1; y <= life; y++) {
    const dep = Math.min(annual, bv - salvage);
    acc += dep;
    bv -= dep;
    rows.push({ year: y, beginningValue: bv + dep, depreciation: dep, accumulated: acc, endingValue: bv });
  }
  return rows;
}

function calcDoubleDeclining(cost: number, salvage: number, life: number): ScheduleRow[] {
  const rate = life > 0 ? 2 / life : 0;
  const rows: ScheduleRow[] = [];
  let bv = cost;
  let acc = 0;
  for (let y = 1; y <= life; y++) {
    let dep = bv * rate;
    if (bv - dep < salvage) dep = bv - salvage;
    if (dep < 0) dep = 0;
    acc += dep;
    bv -= dep;
    rows.push({ year: y, beginningValue: bv + dep, depreciation: dep, accumulated: acc, endingValue: bv });
  }
  return rows;
}

function calcSumOfYears(cost: number, salvage: number, life: number): ScheduleRow[] {
  const sumDigits = (life * (life + 1)) / 2;
  const depreciable = cost - salvage;
  const rows: ScheduleRow[] = [];
  let bv = cost;
  let acc = 0;
  for (let y = 1; y <= life; y++) {
    const fraction = (life - y + 1) / sumDigits;
    let dep = depreciable * fraction;
    if (bv - dep < salvage) dep = bv - salvage;
    if (dep < 0) dep = 0;
    acc += dep;
    bv -= dep;
    rows.push({ year: y, beginningValue: bv + dep, depreciation: dep, accumulated: acc, endingValue: bv });
  }
  return rows;
}

function calcUnitsOfProduction(cost: number, salvage: number, life: number, totalUnits: number, annualUnits: number): ScheduleRow[] {
  const depreciable = cost - salvage;
  const ratePerUnit = totalUnits > 0 ? depreciable / totalUnits : 0;
  const rows: ScheduleRow[] = [];
  let bv = cost;
  let acc = 0;
  for (let y = 1; y <= life; y++) {
    let dep = annualUnits * ratePerUnit;
    if (bv - dep < salvage) dep = bv - salvage;
    if (dep < 0) dep = 0;
    acc += dep;
    bv -= dep;
    rows.push({ year: y, beginningValue: bv + dep, depreciation: dep, accumulated: acc, endingValue: bv });
  }
  return rows;
}

const METHOD_LABELS: Record<Method, string> = {
  "straight-line": "Straight-Line",
  "double-declining": "Double Declining Balance",
  "sum-of-years": "Sum of Years' Digits",
  "units-of-production": "Units of Production",
};

const METHOD_COLORS: Record<Method, string> = {
  "straight-line": "#3b82f6",
  "double-declining": "#f59e0b",
  "sum-of-years": "#10b981",
  "units-of-production": "#a855f7",
};

export default function Page() {
  const [cost, setCost] = useState(50000);
  const [salvage, setSalvage] = useState(5000);
  const [life, setLife] = useState(5);
  const [method, setMethod] = useState<Method>("straight-line");
  const [totalUnits, setTotalUnits] = useState(100000);
  const [annualUnits, setAnnualUnits] = useState(20000);
  const [compareMode, setCompareMode] = useState(false);

  const schedules = useMemo(() => {
    const methods: Method[] = compareMode
      ? ["straight-line", "double-declining", "sum-of-years"]
      : [method];

    const result: Record<string, ScheduleRow[]> = {};
    for (const m of methods) {
      if (m === "units-of-production") {
        result[m] = calcUnitsOfProduction(cost, salvage, life, totalUnits, annualUnits);
      } else if (m === "straight-line") {
        result[m] = calcStraightLine(cost, salvage, life);
      } else if (m === "double-declining") {
        result[m] = calcDoubleDeclining(cost, salvage, life);
      } else {
        result[m] = calcSumOfYears(cost, salvage, life);
      }
    }
    // Always include units-of-production in single mode if selected
    if (!compareMode && method === "units-of-production") {
      result[method] = calcUnitsOfProduction(cost, salvage, life, totalUnits, annualUnits);
    }
    return result;
  }, [cost, salvage, life, method, totalUnits, annualUnits, compareMode]);

  const activeSchedule = compareMode ? null : schedules[method];

  // SVG chart dimensions
  const chartW = 700;
  const chartH = 300;
  const padL = 70;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  const methodsToChart = Object.keys(schedules) as Method[];

  return (
    <ToolLayout
      title="Depreciation Calculator"
      description="Calculate asset depreciation using straight-line, double declining balance, sum of years' digits, or units of production methods. View full schedules, compare methods side by side, and visualize book value decline over time."
      slug="depreciation-calculator"
      category="Finance"
      keywords={[
        "depreciation calculator",
        "straight line depreciation calculator",
        "double declining balance calculator",
        "sum of years digits depreciation",
        "asset depreciation schedule",
        "book value calculator",
        "MACRS depreciation",
        "Section 179 deduction calculator",
      ]}
      faqs={[
        {
          question: "What is straight-line depreciation and when should I use it?",
          answer:
            "Straight-line depreciation spreads the cost of an asset evenly over its useful life. Annual depreciation = (Cost - Salvage Value) / Useful Life. It is the simplest and most commonly used method, ideal for assets that lose value at a consistent rate such as office furniture, buildings, and general equipment. Most businesses use straight-line for financial reporting because of its simplicity and predictability.",
        },
        {
          question: "How does double declining balance depreciation work?",
          answer:
            "Double declining balance (DDB) is an accelerated method that depreciates assets faster in early years. The rate is 2 / Useful Life, applied to the remaining book value each year. For a 5-year asset, the rate is 40% per year. DDB front-loads depreciation expense, which can provide larger tax deductions in early years. It is commonly used for vehicles, computers, and technology equipment that lose value quickly.",
        },
        {
          question: "What is the sum of years' digits method?",
          answer:
            "Sum of years' digits (SYD) is another accelerated depreciation method. For a 5-year asset, the sum is 1+2+3+4+5 = 15. Year 1 depreciates 5/15 of the depreciable base, Year 2 depreciates 4/15, and so on. Like DDB, it produces higher depreciation in early years but follows a smoother, more predictable decline than DDB. It is useful for assets whose productivity decreases steadily over time.",
        },
        {
          question: "When should I use units of production depreciation?",
          answer:
            "Units of production depreciation ties the expense to actual usage rather than time. Depreciation per unit = (Cost - Salvage) / Total Expected Units. This method is ideal for manufacturing equipment, vehicles (by mileage), or any asset whose wear correlates with output rather than age. If a machine produces 10,000 units one year and 5,000 the next, depreciation expense adjusts proportionally.",
        },
        {
          question: "What are Section 179 and bonus depreciation for tax purposes?",
          answer:
            "Section 179 of the IRS tax code allows businesses to deduct the full purchase price of qualifying equipment in the year of purchase, rather than depreciating it over time. For 2024, the deduction limit is $1,220,000. Bonus depreciation (under the Tax Cuts and Jobs Act) allows 60% first-year depreciation on new and used qualifying assets in 2024, stepping down 20% each year. These provisions can significantly reduce taxable income in the year of asset purchase.",
        },
        {
          question: "What is salvage value and how do I estimate it?",
          answer:
            "Salvage value (also called residual or scrap value) is the estimated amount an asset will be worth at the end of its useful life. It is subtracted from the asset cost to determine the depreciable base. Common approaches include researching resale markets, using a percentage of original cost (e.g., 10%), or setting it to $0 for assets with no resale value. The IRS allows a salvage value of $0 for most MACRS property.",
        },
      ]}
      relatedTools={[
        { name: "ROI Calculator", href: "/tools/roi-calculator" },
        { name: "Compound Interest Calculator", href: "/tools/compound-interest-calculator" },
        { name: "Profit Margin Calculator", href: "/tools/profit-margin-calculator" },
        { name: "Investment Calculator", href: "/tools/investment-calculator" },
      ]}
      guide={
        <div className="space-y-6">
          <h2 className="text-2xl font-display text-zinc-100">How to Use the Depreciation Calculator</h2>
          <p className="text-zinc-400 leading-relaxed">
            Enter your asset cost, estimated salvage value, and useful life in years. Choose a depreciation method or enable comparison mode to view all time-based methods side by side. The calculator generates a full depreciation schedule and an interactive chart showing book value decline over the asset&apos;s life.
          </p>
          <h3 className="text-xl font-display text-zinc-100">Choosing the Right Method</h3>
          <p className="text-zinc-400 leading-relaxed">
            <strong className="text-zinc-200">Straight-line</strong> is best for assets that wear evenly. <strong className="text-zinc-200">Double declining balance</strong> and <strong className="text-zinc-200">sum of years&apos; digits</strong> are accelerated methods that front-load depreciation, useful for assets that lose value quickly or for maximizing early tax deductions. <strong className="text-zinc-200">Units of production</strong> is ideal when usage varies year to year.
          </p>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
            <h4 className="text-sm font-semibold text-zinc-200 mb-2">Tax Considerations</h4>
            <p className="text-zinc-400 text-sm leading-relaxed">
              For U.S. tax purposes, most businesses use MACRS (Modified Accelerated Cost Recovery System) rather than these book depreciation methods. However, Section 179 allows immediate expensing of qualifying assets up to $1,220,000 (2024 limit), and bonus depreciation provides 60% first-year write-off in 2024. Consult a tax professional to determine the optimal strategy for your situation.
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Inputs */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Asset Cost ($)</label>
              <input type="number" value={cost} onChange={(e) => setCost(+e.target.value)} className={inputCls} min={0} step={1000} />
            </div>
            <div>
              <label className={labelCls}>Salvage / Residual Value ($)</label>
              <input type="number" value={salvage} onChange={(e) => setSalvage(+e.target.value)} className={inputCls} min={0} step={500} />
            </div>
            <div>
              <label className={labelCls}>Useful Life (years)</label>
              <input type="number" value={life} onChange={(e) => setLife(Math.max(1, +e.target.value))} className={inputCls} min={1} max={50} step={1} />
            </div>
            {!compareMode && method === "units-of-production" && (
              <>
                <div>
                  <label className={labelCls}>Total Expected Units</label>
                  <input type="number" value={totalUnits} onChange={(e) => setTotalUnits(+e.target.value)} className={inputCls} min={1} step={1000} />
                </div>
                <div>
                  <label className={labelCls}>Annual Units Produced</label>
                  <input type="number" value={annualUnits} onChange={(e) => setAnnualUnits(+e.target.value)} className={inputCls} min={0} step={1000} />
                </div>
              </>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Depreciation Method</label>
              <select
                value={method}
                onChange={(e) => { setMethod(e.target.value as Method); setCompareMode(false); }}
                className={inputCls + " cursor-pointer"}
                disabled={compareMode}
              >
                {Object.entries(METHOD_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={compareMode}
                onChange={(e) => setCompareMode(e.target.checked)}
                className="w-4 h-4 rounded bg-zinc-800 border-zinc-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
              />
              <span className="text-sm text-zinc-300">Compare all methods side by side</span>
            </label>
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Depreciable Base</p>
                <p className="text-lg font-semibold text-zinc-100">{fmtC(cost - salvage)}</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Annual (Straight-Line)</p>
                <p className="text-lg font-semibold text-blue-400">{fmtC(life > 0 ? (cost - salvage) / life : 0)}</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Salvage Value</p>
                <p className="text-lg font-semibold text-zinc-100">{fmtC(salvage)}</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Useful Life</p>
                <p className="text-lg font-semibold text-zinc-100">{life} year{life !== 1 ? "s" : ""}</p>
              </div>
            </div>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-300 mb-3">Book Value Over Time</h3>
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full max-w-[700px]" role="img" aria-label="Depreciation chart showing book value decline over time">
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((f) => {
                const y = padT + plotH * (1 - f);
                const val = cost * f;
                return (
                  <g key={f}>
                    <line x1={padL} y1={y} x2={padL + plotW} y2={y} stroke="#3f3f46" strokeWidth={1} />
                    <text x={padL - 8} y={y + 4} textAnchor="end" fill="#71717a" fontSize={11}>
                      {val >= 1000 ? `$${(val / 1000).toFixed(0)}k` : `$${val.toFixed(0)}`}
                    </text>
                  </g>
                );
              })}
              {/* X axis labels */}
              {Array.from({ length: life + 1 }, (_, i) => {
                const x = padL + (i / Math.max(life, 1)) * plotW;
                return (
                  <text key={i} x={x} y={chartH - 8} textAnchor="middle" fill="#71717a" fontSize={11}>
                    {i === 0 ? "Start" : `Yr ${i}`}
                  </text>
                );
              })}
              {/* Lines */}
              {methodsToChart.map((m) => {
                const rows = schedules[m];
                if (!rows || rows.length === 0) return null;
                const points: string[] = [];
                // Starting point
                points.push(`${padL},${padT + plotH * (1 - cost / cost)}`);
                for (const row of rows) {
                  const x = padL + (row.year / Math.max(life, 1)) * plotW;
                  const y = padT + plotH * (1 - row.endingValue / cost);
                  points.push(`${x},${y}`);
                }
                return (
                  <polyline
                    key={m}
                    points={points.join(" ")}
                    fill="none"
                    stroke={METHOD_COLORS[m]}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })}
              {/* Dots */}
              {methodsToChart.map((m) => {
                const rows = schedules[m];
                if (!rows || rows.length === 0) return null;
                return rows.map((row) => {
                  const x = padL + (row.year / Math.max(life, 1)) * plotW;
                  const y = padT + plotH * (1 - row.endingValue / cost);
                  return <circle key={`${m}-${row.year}`} cx={x} cy={y} r={3.5} fill={METHOD_COLORS[m]} />;
                });
              })}
            </svg>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-3">
            {methodsToChart.map((m) => (
              <div key={m} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: METHOD_COLORS[m] }} />
                <span className="text-xs text-zinc-400">{METHOD_LABELS[m]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Depreciation Schedule Table(s) */}
        {compareMode ? (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-zinc-300">Comparison: Depreciation Schedules</h3>
            {(["straight-line", "double-declining", "sum-of-years"] as Method[]).map((m) => (
              <div key={m}>
                <h4 className="text-sm text-zinc-400 mb-2 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: METHOD_COLORS[m] }} />
                  {METHOD_LABELS[m]}
                </h4>
                <ScheduleTable rows={schedules[m] || []} />
              </div>
            ))}
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-semibold text-zinc-300 mb-2">
              {METHOD_LABELS[method]} Depreciation Schedule
            </h3>
            <ScheduleTable rows={activeSchedule || []} />
          </div>
        )}

        {/* Tax Note */}
        <div className="bg-zinc-800/50 border border-blue-500/20 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-blue-400 mb-2">Tax Implications Note</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            <strong className="text-zinc-300">Section 179 Deduction:</strong> Allows businesses to deduct the full cost of qualifying equipment (up to $1,220,000 for 2024) in the year of purchase instead of depreciating over time. This applies to tangible personal property, off-the-shelf software, and certain improvements.
          </p>
          <p className="text-sm text-zinc-400 leading-relaxed mt-2">
            <strong className="text-zinc-300">Bonus Depreciation:</strong> Under current tax law, businesses can take 60% first-year bonus depreciation on qualifying new and used assets in 2024 (phasing down 20% per year through 2027). This is applied after any Section 179 deduction.
          </p>
          <p className="text-sm text-zinc-500 mt-2 italic">
            This calculator provides book depreciation estimates. For tax depreciation (MACRS), consult IRS Publication 946 or a qualified tax professional.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}

function ScheduleTable({ rows }: { rows: ScheduleRow[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-zinc-700">
            <th className="text-left py-2 px-3 text-zinc-400 font-medium">Year</th>
            <th className="text-right py-2 px-3 text-zinc-400 font-medium">Beginning Value</th>
            <th className="text-right py-2 px-3 text-zinc-400 font-medium">Depreciation</th>
            <th className="text-right py-2 px-3 text-zinc-400 font-medium">Accumulated</th>
            <th className="text-right py-2 px-3 text-zinc-400 font-medium">Ending Book Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.year} className="border-b border-zinc-800 hover:bg-zinc-800/40 transition-colors">
              <td className="py-2 px-3 text-zinc-300">{r.year}</td>
              <td className="py-2 px-3 text-right text-zinc-300">{fmtC(r.beginningValue)}</td>
              <td className="py-2 px-3 text-right text-red-400">{fmtC(r.depreciation)}</td>
              <td className="py-2 px-3 text-right text-zinc-400">{fmtC(r.accumulated)}</td>
              <td className="py-2 px-3 text-right text-zinc-100 font-medium">{fmtC(r.endingValue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
