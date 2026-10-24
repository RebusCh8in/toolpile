"use client";
import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
function fmt(n: number, decimals = 4): string {
  if (isNaN(n) || !isFinite(n)) return "\u2014";
  if (Math.abs(n) < 1e-12) return "0";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

function eng(n: number): string {
  if (isNaN(n) || !isFinite(n)) return "\u2014";
  if (Math.abs(n) >= 1e9) return fmt(n / 1e9) + " G";
  if (Math.abs(n) >= 1e6) return fmt(n / 1e6) + " M";
  if (Math.abs(n) >= 1e3) return fmt(n / 1e3) + " k";
  if (Math.abs(n) >= 1) return fmt(n) + " ";
  if (Math.abs(n) >= 1e-3) return fmt(n * 1e3) + " m";
  if (Math.abs(n) >= 1e-6) return fmt(n * 1e6) + " \u00b5";
  return fmt(n * 1e9) + " n";
}

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
type VarKey = "V" | "I" | "R" | "P";

interface CalcResult {
  V: number;
  I: number;
  R: number;
  P: number;
  formulas: string[];
}

const VAR_META: Record<VarKey, { label: string; unit: string; color: string; colorBg: string; colorBorder: string }> = {
  V: { label: "Voltage", unit: "V", color: "text-yellow-400", colorBg: "bg-yellow-400/10", colorBorder: "border-yellow-400/30" },
  I: { label: "Current", unit: "A", color: "text-blue-400", colorBg: "bg-blue-400/10", colorBorder: "border-blue-400/30" },
  R: { label: "Resistance", unit: "\u03a9", color: "text-green-400", colorBg: "bg-green-400/10", colorBorder: "border-green-400/30" },
  P: { label: "Power", unit: "W", color: "text-red-400", colorBg: "bg-red-400/10", colorBorder: "border-red-400/30" },
};

/* ------------------------------------------------------------------ */
/*  Unit conversion scales (to base unit)                             */
/* ------------------------------------------------------------------ */
const UNIT_SCALES: Record<VarKey, { name: string; factor: number }[]> = {
  V: [
    { name: "nV", factor: 1e-9 },
    { name: "\u00b5V", factor: 1e-6 },
    { name: "mV", factor: 1e-3 },
    { name: "V", factor: 1 },
    { name: "kV", factor: 1e3 },
    { name: "MV", factor: 1e6 },
  ],
  I: [
    { name: "nA", factor: 1e-9 },
    { name: "\u00b5A", factor: 1e-6 },
    { name: "mA", factor: 1e-3 },
    { name: "A", factor: 1 },
    { name: "kA", factor: 1e3 },
  ],
  R: [
    { name: "m\u03a9", factor: 1e-3 },
    { name: "\u03a9", factor: 1 },
    { name: "k\u03a9", factor: 1e3 },
    { name: "M\u03a9", factor: 1e6 },
    { name: "G\u03a9", factor: 1e9 },
  ],
  P: [
    { name: "\u00b5W", factor: 1e-6 },
    { name: "mW", factor: 1e-3 },
    { name: "W", factor: 1 },
    { name: "kW", factor: 1e3 },
    { name: "MW", factor: 1e6 },
  ],
};

/* ------------------------------------------------------------------ */
/*  Ohm's Law solver                                                  */
/* ------------------------------------------------------------------ */
function solve(known: Partial<Record<VarKey, number>>): CalcResult | null {
  const keys = Object.keys(known) as VarKey[];
  if (keys.length !== 2) return null;
  const vals = known as Record<string, number>;
  for (const k of keys) if (isNaN(vals[k]) || vals[k] <= 0) return null;

  let V = 0, I = 0, R = 0, P = 0;
  const formulas: string[] = [];
  const [a, b] = keys.sort();
  const pair = a + b;

  if (pair === "IV") {
    V = vals.V; I = vals.I;
    R = V / I; P = V * I;
    formulas.push("R = V / I", "P = V \u00d7 I");
  } else if (pair === "RV") {
    V = vals.V; R = vals.R;
    I = V / R; P = V * V / R;
    formulas.push("I = V / R", "P = V\u00b2 / R");
  } else if (pair === "PV") {
    V = vals.V; P = vals.P;
    I = P / V; R = V * V / P;
    formulas.push("I = P / V", "R = V\u00b2 / P");
  } else if (pair === "IR") {
    I = vals.I; R = vals.R;
    V = I * R; P = I * I * R;
    formulas.push("V = I \u00d7 R", "P = I\u00b2 \u00d7 R");
  } else if (pair === "IP") {
    I = vals.I; P = vals.P;
    V = P / I; R = P / (I * I);
    formulas.push("V = P / I", "R = P / I\u00b2");
  } else if (pair === "PR") {
    R = vals.R; P = vals.P;
    V = Math.sqrt(P * R); I = Math.sqrt(P / R);
    formulas.push("V = \u221a(P \u00d7 R)", "I = \u221a(P / R)");
  }

  if ([V, I, R, P].some((v) => isNaN(v) || !isFinite(v) || v <= 0)) return null;
  return { V, I, R, P, formulas };
}

/* ------------------------------------------------------------------ */
/*  AWG wire table                                                    */
/* ------------------------------------------------------------------ */
const AWG_TABLE = [
  { gauge: "0000 (4/0)", diameter: "11.684", area: "107.2", maxAmps60: 195, maxAmps75: 230, maxAmps90: 260 },
  { gauge: "000 (3/0)", diameter: "10.405", area: "85.0", maxAmps60: 165, maxAmps75: 200, maxAmps90: 225 },
  { gauge: "00 (2/0)", diameter: "9.266", area: "67.4", maxAmps60: 145, maxAmps75: 175, maxAmps90: 195 },
  { gauge: "0 (1/0)", diameter: "8.251", area: "53.5", maxAmps60: 125, maxAmps75: 150, maxAmps90: 170 },
  { gauge: "1", diameter: "7.348", area: "42.4", maxAmps60: 110, maxAmps75: 130, maxAmps90: 145 },
  { gauge: "2", diameter: "6.544", area: "33.6", maxAmps60: 95, maxAmps75: 115, maxAmps90: 130 },
  { gauge: "4", diameter: "5.189", area: "21.2", maxAmps60: 70, maxAmps75: 85, maxAmps90: 95 },
  { gauge: "6", diameter: "4.115", area: "13.3", maxAmps60: 55, maxAmps75: 65, maxAmps90: 75 },
  { gauge: "8", diameter: "3.264", area: "8.37", maxAmps60: 40, maxAmps75: 50, maxAmps90: 55 },
  { gauge: "10", diameter: "2.588", area: "5.26", maxAmps60: 30, maxAmps75: 35, maxAmps90: 40 },
  { gauge: "12", diameter: "2.053", area: "3.31", maxAmps60: 20, maxAmps75: 25, maxAmps90: 30 },
  { gauge: "14", diameter: "1.628", area: "2.08", maxAmps60: 15, maxAmps75: 20, maxAmps90: 25 },
  { gauge: "16", diameter: "1.291", area: "1.31", maxAmps60: 0, maxAmps75: 0, maxAmps90: 18 },
  { gauge: "18", diameter: "1.024", area: "0.823", maxAmps60: 0, maxAmps75: 0, maxAmps90: 14 },
];

/* ------------------------------------------------------------------ */
/*  Ohm's Law Wheel SVG                                               */
/* ------------------------------------------------------------------ */
function OhmsWheel() {
  const cx = 150, cy = 150, outerR = 140, innerR = 70;
  const segments: { key: VarKey; label: string; formulas: string[]; startAngle: number; color: string; colorLight: string }[] = [
    { key: "V", label: "V", formulas: ["I\u00d7R", "\u221a(P\u00d7R)", "P/I"], startAngle: -90, color: "#facc15", colorLight: "#fef08a" },
    { key: "I", label: "I", formulas: ["V/R", "P/V", "\u221a(P/R)"], startAngle: 0, color: "#60a5fa", colorLight: "#93c5fd" },
    { key: "R", label: "R", formulas: ["V/I", "V\u00b2/P", "P/I\u00b2"], startAngle: 90, color: "#4ade80", colorLight: "#86efac" },
    { key: "P", label: "P", formulas: ["V\u00d7I", "I\u00b2\u00d7R", "V\u00b2/R"], startAngle: 180, color: "#f87171", colorLight: "#fca5a5" },
  ];

  function arcPath(startDeg: number, endDeg: number, rOuter: number, rInner: number) {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const s = toRad(startDeg), e = toRad(endDeg);
    const x1 = cx + rOuter * Math.cos(s), y1 = cy + rOuter * Math.sin(s);
    const x2 = cx + rOuter * Math.cos(e), y2 = cy + rOuter * Math.sin(e);
    const x3 = cx + rInner * Math.cos(e), y3 = cy + rInner * Math.sin(e);
    const x4 = cx + rInner * Math.cos(s), y4 = cy + rInner * Math.sin(s);
    return `M${x1},${y1} A${rOuter},${rOuter} 0 0,1 ${x2},${y2} L${x3},${y3} A${rInner},${rInner} 0 0,0 ${x4},${y4} Z`;
  }

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-[280px] mx-auto">
      {/* Outer ring background */}
      <circle cx={cx} cy={cy} r={outerR} fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
      {/* Inner circle */}
      <circle cx={cx} cy={cy} r={innerR} fill="#09090b" stroke="#3f3f46" strokeWidth="1.5" />

      {segments.map((seg) => {
        const s = seg.startAngle;
        const e = s + 90;
        const midAngle = ((s + e) / 2) * (Math.PI / 180);
        const formulaR = (outerR + innerR) / 2;
        const labelR = innerR * 0.55;

        return (
          <g key={seg.key}>
            {/* Segment fill */}
            <path d={arcPath(s, e, outerR - 1, innerR + 1)} fill={seg.color} opacity={0.12} />
            {/* Segment border */}
            <line
              x1={cx + innerR * Math.cos((s * Math.PI) / 180)}
              y1={cy + innerR * Math.sin((s * Math.PI) / 180)}
              x2={cx + outerR * Math.cos((s * Math.PI) / 180)}
              y2={cy + outerR * Math.sin((s * Math.PI) / 180)}
              stroke="#3f3f46"
              strokeWidth="1"
            />
            {/* Center label */}
            <text
              x={cx + labelR * Math.cos(midAngle)}
              y={cy + labelR * Math.sin(midAngle)}
              textAnchor="middle"
              dominantBaseline="central"
              fill={seg.color}
              fontWeight="700"
              fontSize="18"
            >
              {seg.label}
            </text>
            {/* Formulas in outer ring */}
            {seg.formulas.map((f, i) => {
              const fAngle = (s + 15 + i * 25) * (Math.PI / 180);
              return (
                <text
                  key={i}
                  x={cx + formulaR * Math.cos(fAngle)}
                  y={cy + formulaR * Math.sin(fAngle)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={seg.colorLight}
                  fontSize="10"
                  opacity={0.85}
                >
                  {f}
                </text>
              );
            })}
          </g>
        );
      })}

      {/* Center text */}
      <text x={cx} y={cy - 6} textAnchor="middle" dominantBaseline="central" fill="#a1a1aa" fontSize="9" fontWeight="500">
        OHM&apos;S
      </text>
      <text x={cx} y={cy + 8} textAnchor="middle" dominantBaseline="central" fill="#a1a1aa" fontSize="9" fontWeight="500">
        LAW
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page component                                               */
/* ------------------------------------------------------------------ */
export default function Page() {
  /* ---- Ohm's law calculator state ---- */
  const [inputs, setInputs] = useState<Record<VarKey, string>>({ V: "", I: "", R: "", P: "" });
  const [locks, setLocks] = useState<Set<VarKey>>(new Set());

  const setField = useCallback((key: VarKey, val: string) => {
    setInputs((prev) => ({ ...prev, [key]: val }));
    if (val !== "") {
      setLocks((prev) => {
        const next = new Set(prev);
        next.add(key);
        // Keep only up to 2 locked
        if (next.size > 2) {
          const arr = Array.from(next);
          next.delete(arr[0]);
        }
        return next;
      });
    } else {
      setLocks((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }, []);

  const clearAll = () => {
    setInputs({ V: "", I: "", R: "", P: "" });
    setLocks(new Set());
  };

  // Build known values from locked inputs
  const known: Partial<Record<VarKey, number>> = {};
  for (const k of Array.from(locks)) {
    const v = parseFloat(inputs[k]);
    if (!isNaN(v) && v > 0) known[k] = v;
  }
  const result = Object.keys(known).length === 2 ? solve(known) : null;

  /* ---- Unit converter state ---- */
  const [ucVar, setUcVar] = useState<VarKey>("V");
  const [ucVal, setUcVal] = useState("1");
  const [ucFrom, setUcFrom] = useState("V");

  const ucScales = UNIT_SCALES[ucVar];
  const ucFromFactor = ucScales.find((s) => s.name === ucFrom)?.factor ?? 1;
  const ucBase = parseFloat(ucVal) * ucFromFactor;

  /* ---- Series/Parallel resistors state ---- */
  const [resistors, setResistors] = useState<string[]>(["100", "200"]);
  const addResistor = () => setResistors((r) => [...r, ""]);
  const removeResistor = (i: number) => setResistors((r) => r.filter((_, idx) => idx !== i));
  const setResistor = (i: number, v: string) => setResistors((r) => r.map((x, idx) => (idx === i ? v : x)));

  const rVals = resistors.map((r) => parseFloat(r)).filter((r) => !isNaN(r) && r > 0);
  const seriesTotal = rVals.reduce((a, b) => a + b, 0);
  const parallelTotal = rVals.length > 0 ? 1 / rVals.reduce((a, b) => a + 1 / b, 0) : 0;

  const inputCls =
    "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 text-sm";
  const selectCls =
    "bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 text-sm";

  return (
    <ToolLayout
      title="Ohm's Law Calculator"
      description="Calculate voltage, current, resistance, and power using Ohm's Law. Enter any two values to find the other two instantly. Includes unit converter, series/parallel resistance calculator, and AWG wire reference."
      slug="ohms-law-calculator"
      category="Utility"
      keywords={[
        "ohms law calculator",
        "voltage calculator",
        "resistance calculator",
        "current calculator",
        "power calculator",
        "electrical calculator",
        "ohm's law wheel",
        "series parallel resistance",
        "AWG wire size chart",
        "V=IR calculator",
      ]}
      faqs={[
        {
          question: "What is Ohm's Law and how does this calculator use it?",
          answer:
            "Ohm's Law states that voltage (V) equals current (I) times resistance (R), written as V = IR. This calculator extends Ohm's Law with the power equation (P = VI) so you can enter any two of the four electrical values -- voltage, current, resistance, and power -- and it instantly calculates the remaining two using the appropriate formulas.",
        },
        {
          question: "How do I calculate watts from volts and amps?",
          answer:
            "Power in watts equals voltage in volts multiplied by current in amps: P = V x I. For example, a 120V circuit drawing 10A uses 1,200 watts. Simply enter the voltage and current into this calculator and it will compute the power for you automatically.",
        },
        {
          question: "What is the difference between series and parallel resistance?",
          answer:
            "In a series circuit, resistances add up directly: R_total = R1 + R2 + R3. In a parallel circuit, the reciprocals add: 1/R_total = 1/R1 + 1/R2 + 1/R3. Series resistance is always higher than the largest individual resistor, while parallel resistance is always lower than the smallest individual resistor.",
        },
        {
          question: "How do I convert milliamps to amps or kilohms to ohms?",
          answer:
            "Use the unit converter section of this tool. Select the electrical quantity (voltage, current, resistance, or power), enter a value, and see it converted across all common prefixes. For example, 1 mA = 0.001 A, and 4.7 k\u03a9 = 4,700 \u03a9.",
        },
        {
          question: "What AWG wire size do I need for my circuit?",
          answer:
            "The AWG (American Wire Gauge) table in this tool shows maximum ampacity ratings for common wire sizes at different temperature ratings. For example, 12 AWG copper wire is rated for 20A at 60\u00b0C insulation. Always choose a wire gauge rated above your expected current draw and consult local electrical codes for your specific installation.",
        },
        {
          question: "Can I use Ohm's Law for AC circuits?",
          answer:
            "Ohm's Law applies directly to DC circuits. For AC circuits, the same formulas work for purely resistive loads. When inductance or capacitance is involved, you need to use impedance (Z) instead of resistance (R), where Z accounts for phase differences between voltage and current. This calculator is designed for DC and purely resistive AC calculations.",
        },
      ]}
      relatedTools={[
        { name: "Unit Converter", href: "/tools/unit-converter" },
        { name: "Scientific Calculator", href: "/tools/scientific-calculator" },
        { name: "Percentage Calculator", href: "/tools/percentage-calculator" },
      ]}
      guide={
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">How to Use the Ohm&apos;s Law Calculator</h2>
            <p className="text-zinc-400 leading-relaxed">
              Enter any two known electrical values in the calculator above and the other two will be computed
              automatically. The calculator uses the fundamental relationships V=IR, P=VI, P=I&sup2;R, and P=V&sup2;/R
              to derive all unknowns. Results are color-coded for easy reading: yellow for voltage, blue for current,
              green for resistance, and red for power.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">Understanding the Ohm&apos;s Law Wheel</h2>
            <p className="text-zinc-400 leading-relaxed">
              The Ohm&apos;s Law wheel diagram shown above organizes all twelve key electrical formulas in an
              easy-to-read circle. Each quadrant represents one of the four quantities (V, I, R, P) and shows
              the three formulas that can be used to calculate it from any combination of the other two values.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">Series vs Parallel Resistors</h2>
            <p className="text-zinc-400 leading-relaxed">
              Use the series/parallel resistance calculator to quickly find the combined resistance of multiple
              resistors. This is essential for circuit design, where resistor networks are used to achieve specific
              voltage divider ratios, current limiting values, or impedance matching.
            </p>
          </section>
        </div>
      }
    >
      {/* ================================================================ */}
      {/*  MAIN OHM'S LAW CALCULATOR                                       */}
      {/* ================================================================ */}
      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        {/* Left: inputs + results */}
        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-100">Enter Any 2 Values</h3>
              <button
                onClick={clearAll}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1 rounded bg-zinc-800 border border-zinc-700"
              >
                Clear All
              </button>
            </div>
            <p className="text-xs text-zinc-500 mb-4">Type into any two fields. The other two will be calculated.</p>

            <div className="grid sm:grid-cols-2 gap-3">
              {(["V", "I", "R", "P"] as VarKey[]).map((key) => {
                const meta = VAR_META[key];
                const isLocked = locks.has(key);
                const isComputed = !isLocked && result !== null;
                return (
                  <div
                    key={key}
                    className={`rounded-lg border p-3 transition-colors ${
                      isLocked
                        ? `${meta.colorBg} ${meta.colorBorder}`
                        : "bg-zinc-900/50 border-zinc-700"
                    }`}
                  >
                    <label className={`text-xs font-medium ${meta.color} block mb-1`}>
                      {meta.label} ({key})
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder={isComputed ? "computed" : "0"}
                        value={isComputed ? "" : inputs[key]}
                        onChange={(e) => setField(key, e.target.value)}
                        className={`${inputCls} flex-1 ${isComputed ? "!bg-zinc-900 !border-zinc-800" : ""}`}
                        readOnly={isComputed}
                      />
                      <span className={`text-sm font-medium ${meta.color} min-w-[24px]`}>{meta.unit}</span>
                    </div>
                    {isComputed && result && (
                      <p className={`text-lg font-bold mt-1 ${meta.color}`}>
                        {eng(result[key])}{meta.unit}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Results summary */}
          {result && (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-3">
              <h3 className="text-lg font-semibold text-zinc-100">Results</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(["V", "I", "R", "P"] as VarKey[]).map((key) => {
                  const meta = VAR_META[key];
                  return (
                    <div key={key} className={`rounded-lg border p-3 ${meta.colorBg} ${meta.colorBorder}`}>
                      <p className="text-xs text-zinc-400">{meta.label}</p>
                      <p className={`text-lg font-bold ${meta.color}`}>
                        {eng(result[key])}{meta.unit}
                      </p>
                      <p className="text-xs text-zinc-500">{fmt(result[key], 6)} {meta.unit}</p>
                    </div>
                  );
                })}
              </div>
              <div className="bg-zinc-900 rounded-lg p-3">
                <p className="text-xs text-zinc-500 mb-1">Formulas used:</p>
                <div className="flex flex-wrap gap-2">
                  {result.formulas.map((f, i) => (
                    <span key={i} className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-blue-400 font-mono">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* All formulas reference */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-zinc-100 mb-3">All Ohm&apos;s Law Formulas</h3>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              {[
                { label: "Voltage", color: "text-yellow-400", formulas: ["V = I \u00d7 R", "V = P / I", "V = \u221a(P \u00d7 R)"] },
                { label: "Current", color: "text-blue-400", formulas: ["I = V / R", "I = P / V", "I = \u221a(P / R)"] },
                { label: "Resistance", color: "text-green-400", formulas: ["R = V / I", "R = V\u00b2 / P", "R = P / I\u00b2"] },
                { label: "Power", color: "text-red-400", formulas: ["P = V \u00d7 I", "P = I\u00b2 \u00d7 R", "P = V\u00b2 / R"] },
              ].map((group) => (
                <div key={group.label} className="bg-zinc-900 rounded-lg p-3">
                  <p className={`font-semibold mb-1 ${group.color}`}>{group.label}</p>
                  {group.formulas.map((f) => (
                    <p key={f} className="text-zinc-400 font-mono text-xs">{f}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Ohm's Law wheel */}
        <div className="flex flex-col items-center gap-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 w-full">
            <h3 className="text-sm font-semibold text-zinc-100 text-center mb-2">Ohm&apos;s Law Wheel</h3>
            <OhmsWheel />
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {(["V", "I", "R", "P"] as VarKey[]).map((k) => (
                <span key={k} className={`text-xs ${VAR_META[k].color} bg-zinc-900 rounded px-2 py-0.5`}>
                  {VAR_META[k].label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/*  UNIT CONVERTER                                                  */}
      {/* ================================================================ */}
      <div className="mt-8 bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Electrical Unit Converter</h3>
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Quantity</label>
            <select
              value={ucVar}
              onChange={(e) => {
                const v = e.target.value as VarKey;
                setUcVar(v);
                setUcFrom(UNIT_SCALES[v].find((s) => s.factor === 1)?.name ?? UNIT_SCALES[v][0].name);
              }}
              className={selectCls}
            >
              {(["V", "I", "R", "P"] as VarKey[]).map((k) => (
                <option key={k} value={k}>
                  {VAR_META[k].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Value</label>
            <input
              type="number"
              value={ucVal}
              onChange={(e) => setUcVal(e.target.value)}
              className={inputCls + " !w-32"}
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">From</label>
            <select value={ucFrom} onChange={(e) => setUcFrom(e.target.value)} className={selectCls}>
              {ucScales.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {ucScales.map((s) => (
            <div
              key={s.name}
              className={`bg-zinc-900 rounded-lg px-3 py-2 text-center border ${
                s.name === ucFrom ? "border-blue-500/50" : "border-zinc-800"
              }`}
            >
              <p className="text-xs text-zinc-500">{s.name}</p>
              <p className={`font-semibold ${VAR_META[ucVar].color}`}>
                {isNaN(ucBase) ? "\u2014" : fmt(ucBase / s.factor, 6)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ================================================================ */}
      {/*  SERIES / PARALLEL RESISTANCE                                    */}
      {/* ================================================================ */}
      <div className="mt-8 bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Series / Parallel Resistance Calculator</h3>
        <div className="space-y-2 mb-4">
          {resistors.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 w-8">R{i + 1}</span>
              <input
                type="number"
                value={r}
                onChange={(e) => setResistor(i, e.target.value)}
                placeholder="Ohms"
                className={inputCls + " !w-36"}
              />
              <span className="text-xs text-zinc-500">&Omega;</span>
              {resistors.length > 2 && (
                <button
                  onClick={() => removeResistor(i)}
                  className="text-zinc-600 hover:text-red-400 transition-colors text-lg leading-none px-1"
                  aria-label="Remove resistor"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addResistor}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors mb-4 flex items-center gap-1"
        >
          <span className="text-lg leading-none">+</span> Add Resistor
        </button>

        {rVals.length >= 2 && (
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="bg-zinc-900 rounded-lg p-4 border border-green-400/20">
              <p className="text-xs text-zinc-500 mb-1">Series (R1 + R2 + ...)</p>
              <p className="text-xl font-bold text-green-400">{eng(seriesTotal)}&Omega;</p>
              <p className="text-xs text-zinc-500 mt-1">{fmt(seriesTotal, 6)} &Omega;</p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4 border border-green-400/20">
              <p className="text-xs text-zinc-500 mb-1">Parallel (1 / (1/R1 + 1/R2 + ...))</p>
              <p className="text-xl font-bold text-green-400">{eng(parallelTotal)}&Omega;</p>
              <p className="text-xs text-zinc-500 mt-1">{fmt(parallelTotal, 6)} &Omega;</p>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/*  AWG WIRE SIZE TABLE                                             */}
      {/* ================================================================ */}
      <div className="mt-8 bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-zinc-100 mb-1">AWG Wire Size Reference</h3>
        <p className="text-xs text-zinc-500 mb-4">
          Maximum ampacity for copper conductors (NEC Table 310.16). Ratings depend on insulation temperature.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-zinc-700 text-zinc-400">
                <th className="pb-2 pr-4 font-medium">AWG</th>
                <th className="pb-2 pr-4 font-medium">Diameter (mm)</th>
                <th className="pb-2 pr-4 font-medium">Area (mm&sup2;)</th>
                <th className="pb-2 pr-4 font-medium">60&deg;C (A)</th>
                <th className="pb-2 pr-4 font-medium">75&deg;C (A)</th>
                <th className="pb-2 font-medium">90&deg;C (A)</th>
              </tr>
            </thead>
            <tbody>
              {AWG_TABLE.map((row) => (
                <tr key={row.gauge} className="border-b border-zinc-800/60 text-zinc-300">
                  <td className="py-1.5 pr-4 font-mono text-blue-400">{row.gauge}</td>
                  <td className="py-1.5 pr-4">{row.diameter}</td>
                  <td className="py-1.5 pr-4">{row.area}</td>
                  <td className="py-1.5 pr-4">{row.maxAmps60 || "\u2014"}</td>
                  <td className="py-1.5 pr-4">{row.maxAmps75 || "\u2014"}</td>
                  <td className="py-1.5">{row.maxAmps90 || "\u2014"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ToolLayout>
  );
}
